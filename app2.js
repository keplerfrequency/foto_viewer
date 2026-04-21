let myPhotos = [];

let splide = [];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function fetchJson() {

  fetch('fotos_website.json')
  .then(response => response.json())
  .then(data => {
    myPhotos = Object.entries(data.photos).map(([path, photoData]) => {
      return {
        src: 'website_photos/' + path,
        name: photoData.name || "",
        alt: photoData.name || "Click on \nthe categories to continue",
        city: photoData.city || "",
        country: photoData.country || "",
        categories: Array.isArray(photoData.categories) ? photoData.categories : []
      };
    });
    shuffleArray(myPhotos);
  })
  .catch(error => {
    console.error('Unable to load fotos_website.json', error);
  });

};

function generateButtons(){

    let categories = [];

    $.getJSON('fotos_website.json', function(result) {
      // Find all folder names in the format YYYY-MM from photo paths
      let folderSet = new Set();
      $.each(result.photos, function(path, foto){
        // Extract folder from path (e.g., 2026-04/filename.jpg)
        let match = path.match(/^([0-9]{4}-[0-9]{2})\//);
        if (match) {
          folderSet.add(match[1]);
        }
        if (Array.isArray(foto.categories)) {
          foto.categories.forEach(category => {
            if (category && !categories.includes(category)) {
              categories.push(category);
            }
          });
        }
      });

      // Find latest folder by sorting
      let folders = Array.from(folderSet);
      folders.sort((a, b) => {
        const [ay, am] = a.split('-').map(Number);
        const [by, bm] = b.split('-').map(Number);
        if (by !== ay) return by - ay;
        return bm - am;
      });
      let latestFolder = folders[0] || null;

      // Insert ALL at the start
      categories.unshift("ALL");

      // Now insert 'Latest' after ALL, with data-category set to latestFolder
      let html = '';
      categories.forEach(function(category, idx) {
        // After ALL, insert Latest button
        if (idx === 1 && latestFolder) {
          html += `<button class="category-btn" data-category="${latestFolder}">LATEST</button>`;
        }
        let categoryClean = category.replace('-', ' ').toUpperCase();
        html += `<button class="category-btn" data-category="${category}">${categoryClean}</button>`;
      });
      const buttonRepo = document.querySelector('#button-repo');
      buttonRepo.innerHTML = html;
    });
  }

//Looks through the myPhotos array and returns the alt
function getAltText(src) {
  let photo = myPhotos.find(photo => photo.src === src);
  const title = photo ? (photo.name || photo.alt) : "Click on the categories to continue";
  let location = "";

  if (photo) {
    if (photo.city) {
      location = `${photo.city.toUpperCase()}, ${photo.country.toUpperCase()}`;
    } else {
      location = photo.country.toUpperCase() || "";
    }
  }

  const myDiv = document.getElementById('line_breaker');
  myDiv.textContent = location ? `${title.toUpperCase()}\n${location}` : title.toUpperCase();
  return;
}

// Function to update the Splide carousel with new photos
function updateSplideCarousel(category) {
  
  let photos = getAllFotosCategory(category);

  array = Array.from({ length: splide.length }, (_, index) => index);
  splide.remove(array);

  fragment = [];

  // Loop through each photo and push them into an array
  photos.forEach(photo => {
    const listItem = '<li class="splide__slide"><img src="' + photo + '"></li>\n'
    
    fragment.push(listItem)
  });

  splide.add(fragment);
  updatePhotoCounter();

}

function getAllFotosCategory(categora){

  if (categora && categora.toLowerCase() === "all") {
    const allPhotos = shuffleArray([...myPhotos]);
    return allPhotos.map(photo => photo.src);
  }

  // If categora matches YYYY-MM, return all photos from that folder
  if (/^\d{4}-\d{2}$/.test(categora)) {
    const folderPhotos = myPhotos.filter(photo => {
      // src: 'website_photos/2026-04/000001.JPG'
      return photo.src.includes('website_photos/' + categora + '/');
    });
    shuffleArray(folderPhotos);
    return folderPhotos.map(photo => photo.src);
  }

  // Otherwise, treat as category
  const photos = myPhotos.filter(photo => {
    return Array.isArray(photo.categories) && photo.categories.some(category => category.toLowerCase().includes(categora.toLowerCase()));
  });
  shuffleArray(photos);
  const srcs = photos.map(photo => photo.src);
  return srcs;
}

// Function to update the photo counter
function updatePhotoCounter() {
  const counter = document.getElementById('photo-counter');
  if (!splide || !splide.Components || !splide.Components.Elements) {
    counter.textContent = '';
    return;
  }
  const totalSlides = splide.Components.Elements.slides.length;
  const currentIndex = splide.index + 1; // index is 0-based, display is 1-based
  counter.textContent = totalSlides > 0 ? `${currentIndex} / ${totalSlides}` : '';
}

// Function to download the current photo
function downloadCurrentPhoto() {
  if (!splide || !splide.Components || !splide.Components.Elements) return;
  const currentIndex = splide.index;
  const currentSlideElement = splide.Components.Elements.slides[currentIndex];
  if (!currentSlideElement) return;
  const imgElement = currentSlideElement.querySelector('img');
  if (imgElement) {
    const imgSrc = imgElement.getAttribute('src');
    const link = document.createElement('a');
    link.href = imgSrc;
    link.download = imgSrc.split('/').pop(); // Use filename from path
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Global arrow key navigation for Splide
document.addEventListener('keydown', function(event) {
  if (!window.splide) return;
  if (event.key === 'ArrowLeft') {
    window.splide.go('<');
    setTimeout(function() {
      var currentIndex = window.splide.index;
      var currentSlideElement = window.splide.Components.Elements.slides[currentIndex];
      var imgElement = currentSlideElement.querySelector('img');
      if (imgElement) {
        var imgSrc = imgElement.getAttribute('src');
        getAltText(imgSrc);
      }
      updatePhotoCounter();
    }, 0);
    event.preventDefault();
  } else if (event.key === 'ArrowRight') {
    window.splide.go('>');
    setTimeout(function() {
      var currentIndex = window.splide.index;
      var currentSlideElement = window.splide.Components.Elements.slides[currentIndex];
      var imgElement = currentSlideElement.querySelector('img');
      if (imgElement) {
        var imgSrc = imgElement.getAttribute('src');
        getAltText(imgSrc);
      }
      updatePhotoCounter();
    }, 0);
    event.preventDefault();
  }
});
document.addEventListener("click", function(event){
  var clickedElement = event.target;

  if (clickedElement.closest('.category-btn')) {
    var category = clickedElement.getAttribute('data-category');
    updateSplideCarousel(category)
  }
});
