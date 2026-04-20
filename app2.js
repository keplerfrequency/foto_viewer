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
      $.each(result.photos, function(path, foto){
        if (Array.isArray(foto.categories)) {
          foto.categories.forEach(category => {
            if (category && !categories.includes(category)) {
              categories.push(category);
            }
          });
        }
      });
      
      categories.unshift("ALL");
      
      let html = '';
    
      categories.forEach(category => {
        categoryClean = category.replace('-', ' ').toUpperCase()
        html += `
        <button class="category-btn" data-category="${category}">${categoryClean}</button>`;
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

}

function getAllFotosCategory(categora){

  if (categora && categora.toLowerCase() === "all") {
    const allPhotos = shuffleArray([...myPhotos]);
    return allPhotos.map(photo => photo.src);
  }

  const photos = myPhotos.filter(photo => {
    return Array.isArray(photo.categories) && photo.categories.some(category => category.toLowerCase().includes(categora.toLowerCase()));
  });
  shuffleArray(photos);
  const srcs = photos.map(photo => photo.src);
    
  return srcs;
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
    }, 0);
    event.preventDefault();
  }
});
document.addEventListener("click", function(event){
  var clickedElement = event.target;

  if (clickedElement.closest('.category-btn')) {
    var text = $(clickedElement).text();
    updateSplideCarousel(text)
  }
});
