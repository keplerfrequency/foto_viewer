// world.js - initializes Leaflet map, counts photos per country and creates hotspots
document.addEventListener('DOMContentLoaded', async function () {
    // Fetch the JSON with photo metadata
    let resp;
    try {
        resp = await fetch('fotos_website.json');
    } catch (e) {
        console.error('Failed to fetch fotos_website.json', e);
        return;
    }
    const data = await resp.json();

    // Utility: parse date (year-month) from key like '2024-09/000026.JPG'
    function extractDate(key) {
        const m = key.match(/(\d{4}-\d{2})/);
        return m ? m[1] : '';
    }

    // Caches in localStorage
    const countryCacheKey = 'countryCoordsCache_v1';
    const cityCacheKey = 'cityCoordsCache_v1';
    let countryCoordsCache = {};
    let cityCoordsCache = {};
    try { countryCoordsCache = JSON.parse(localStorage.getItem(countryCacheKey) || '{}'); } catch(e){}
    try { cityCoordsCache = JSON.parse(localStorage.getItem(cityCacheKey) || '{}'); } catch(e){}

    async function saveCaches() {
        localStorage.setItem(countryCacheKey, JSON.stringify(countryCoordsCache));
        localStorage.setItem(cityCacheKey, JSON.stringify(cityCoordsCache));
    }

    async function getCountryCoords(name) {
        if (!name) return null;
        if (countryCoordsCache[name]) return countryCoordsCache[name];

        // Try Rest Countries API
        try {
            const r = await fetch('https://restcountries.com/v3.1/name/' + encodeURIComponent(name) + '?fields=latlng,name');
            if (r.ok) {
                const arr = await r.json();
                if (Array.isArray(arr) && arr.length) {
                    const latlng = arr[0].latlng; // [lat, lng]
                    if (latlng && latlng.length === 2) {
                        countryCoordsCache[name] = [latlng[0], latlng[1]];
                        saveCaches();
                        return countryCoordsCache[name];
                    }
                }
            }
        } catch (e) {
            console.warn('restcountries lookup failed for', name, e);
        }

        // Fallback to Nominatim search
        try {
            const q = encodeURIComponent(name);
            const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`);
            if (r.ok) {
                const arr = await r.json();
                if (Array.isArray(arr) && arr.length) {
                    const lat = parseFloat(arr[0].lat);
                    const lon = parseFloat(arr[0].lon);
                    countryCoordsCache[name] = [lat, lon];
                    saveCaches();
                    return countryCoordsCache[name];
                }
            }
        } catch (e) {
            console.warn('nominatim lookup failed for', name, e);
        }

        return null;
    }

    async function geocodeCity(city, countryHint) {
        const key = city + '||' + (countryHint || '');
        if (cityCoordsCache[key]) return cityCoordsCache[key];
        try {
            const q = encodeURIComponent((city || '') + (countryHint ? ', ' + countryHint : ''));
            const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`);
            if (r.ok) {
                const arr = await r.json();
                if (Array.isArray(arr) && arr.length) {
                    const lat = parseFloat(arr[0].lat);
                    const lon = parseFloat(arr[0].lon);
                    const display_name = arr[0].display_name || '';
                    cityCoordsCache[key] = { lat, lon, display_name };
                    saveCaches();
                    return cityCoordsCache[key];
                }
            }
        } catch (e) {
            console.warn('geocodeCity failed', city, e);
        }
        return null;
    }

    async function reverseGeocode(lat, lon) {
        try {
            const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            if (r.ok) {
                const obj = await r.json();
                return obj.address || {};
            }
        } catch (e) { console.warn('reverseGeocode failed', e); }
        return {};
    }

    // Prepare structures: country -> photos[], and for Nederland: province -> photos[]
    const photosByCountry = {};
    const netherlandsPhotos = []; // keep raw for special handling

    Object.keys(data).forEach(key => {
        const item = data[key];
        const country = (item.country || '').trim();
        const city = (item.city || '').trim();
        const date = extractDate(key);
        const entry = { key, filename: item.filename, city, country, title: item.title, date };
        if (!country) return;
        if (country.toLowerCase() === 'nederland') {
            netherlandsPhotos.push(entry);
        } else {
            if (!photosByCountry[country]) photosByCountry[country] = [];
            photosByCountry[country].push(entry);
        }
    });

    // Initialize Leaflet map
    const map = L.map('map', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2
    });

    // CartoDB Positron (light) tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19
    }).addTo(map);

    const allMarkerCoords = [];

    // Add country markers (non-Nederland)
    for (const country of Object.keys(photosByCountry)) {
        const list = photosByCountry[country];
        const count = list.length;
        const coords = await getCountryCoords(country);
        if (!coords) {
            console.warn('no coords for country', country);
            continue;
        }
        allMarkerCoords.push(coords);
        const radius = 6 + Math.sqrt(count) * 4;
        const marker = L.circleMarker(coords, {
            radius,
            color: '#a9a9a9',
            weight: 1,
            fillColor: '#d3d3d3',
            fillOpacity: 0.9
        }).addTo(map);
        marker.on('click', function () {
            map.setView(coords, 4);
            const sorted = list.slice().sort((a,b)=> (a.date||'').localeCompare(b.date||''));
            openFullModal(sorted);
        });
    }

    // Handle Nederland: group by city using city geocoding; fallback to IJsselmeer for empty city
    const cityBuckets = {}; // cityName -> { coords, items: [] }
    const ijsselmeerCoords = [52.6, 5.3];

    for (const entry of netherlandsPhotos) {
        const city = entry.city;
        if (!city) {
            const name = 'IJsselmeer';
            if (!cityBuckets[name]) cityBuckets[name] = { coords: ijsselmeerCoords, items: [] };
            cityBuckets[name].items.push(entry);
            continue;
        }
        const geo = await geocodeCity(city, 'Netherlands');
        if (!geo) {
            const name = city || 'Unknown (Netherlands)';
            if (!cityBuckets[name]) cityBuckets[name] = { coords: ijsselmeerCoords, items: [] };
            cityBuckets[name].items.push(entry);
            continue;
        }
        const name = city;
        if (!cityBuckets[name]) cityBuckets[name] = { coords: [geo.lat, geo.lon], items: [] };
        cityBuckets[name].items.push(entry);
        allMarkerCoords.push([geo.lat, geo.lon]);
    }

    // Add city markers (Nederland)
    for (const cityName of Object.keys(cityBuckets)) {
        const bucket = cityBuckets[cityName];
        const count = bucket.items.length;
        const coords = bucket.coords || ijsselmeerCoords;
        const radius = 6 + Math.sqrt(count) * 3;
        const marker = L.circleMarker(coords, {
            radius,
            color: '#a9a9a9',
            weight: 1,
            fillColor: '#d3d3d3',
            fillOpacity: 0.9
        }).addTo(map);
        marker.on('click', function () {
            map.setView(coords, 10);
            const sorted = bucket.items.slice().sort((a,b)=> (a.date||'').localeCompare(b.date||''));
            openFullModal(sorted);
        });
    }

    // Fit to markers
    if (allMarkerCoords.length) {
        const bounds = L.latLngBounds(allMarkerCoords);
        map.fitBounds(bounds.pad(0.25));
    }

    // Helper to render HTML list for photos (chronological asc)
    function renderPhotoListHTML(list) {
        if (!list || !list.length) return '<em>No photos</em>';
        const items = list.map(it => {
            const path = it.key;
            const imgSrc = `website_photos/${path}`;
            const title = it.title || it.filename || path;
            return { imgSrc, title };
        });
        // return array of objects for modal builder
        return items;
    }

    // Modal logic: build full-page viewer
    const modal = document.getElementById('world-modal');
    const modalBox = document.getElementById('world-modal-box');
    const modalClose = document.getElementById('world-modal-close');
    const modalTitle = document.getElementById('world-modal-title');
    const modalMainImage = document.getElementById('world-modal-main-image');
    const modalThumbs = document.getElementById('world-modal-thumbs');

    function encodePathForUrl(p) {
        return p.split('/').map(encodeURIComponent).join('/');
    }

    function openFullModal(listEntries) {
        // listEntries are objects with key, filename, title, date
        const items = listEntries.map(it => ({ imgSrc: `website_photos/${encodePathForUrl(it.key)}`, title: it.title || it.filename || it.key }));
        if (!items.length) return;
        // set main to first
        setModalMain(items[0]);
        // build thumbnails
        modalThumbs.innerHTML = '';
        items.forEach(it => {
            const thumb = document.createElement('img');
            thumb.src = it.imgSrc;
            thumb.style.width = '120px';
            thumb.style.height = 'auto';
            thumb.style.cursor = 'pointer';
            thumb.style.display = 'block';
            thumb.style.objectFit = 'cover';
            thumb.style.border = '2px solid transparent';
            thumb.style.borderRadius = '4px';
            thumb.addEventListener('click', () => setModalMain(it));
            thumb.addEventListener('error', () => {
                thumb.style.display = 'none';
            });
            modalThumbs.appendChild(thumb);
        });
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function setModalMain(item) {
        modalMainImage.innerHTML = '';
        const img = document.createElement('img');
        img.src = item.imgSrc;
        img.className = 'modal-img';
        img.addEventListener('error', () => {
            modalMainImage.innerHTML = `<div style="color:#ddd;padding:20px;text-align:center;">Image not available</div>`;
        });
        modalMainImage.appendChild(img);
        // modal title always uppercase
        modalTitle.textContent = (item.title || '').toUpperCase();
        // prevent the main area from scrolling; image scaling handled by CSS
        modalMainImage.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

});
