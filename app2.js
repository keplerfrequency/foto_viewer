let myPhotos = [];

let splide = [];

function fetchJson() {

  fetch('photos.json')
  .then(response => response.json())
  .then(data => {
    myPhotos = data.map(photo => { // Assign value to the global variable
      return {
        src: photo.src,
        alt: photo.alt,
        category: photo.category
      };
    });
  })
  .catch(error => {
    callback(error, null);
  });

};


function generateButtons(){

    let categories = [];
  
    $.getJSON('photos.json', function(result) {
      $.each(result, function(i, foto){
  
        let allCategories = foto.category.split(' ')
  
        for (let i = 0; i < allCategories.length; i++) {
            if(!categories.includes(allCategories[i])){
            categories.push(allCategories[i]);
          };
        }
      })
      
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
  altText = photo ? photo.alt: "Click on the categories to continue";
  const myDiv = document.getElementById('line_breaker');
  myDiv.textContent = altText.toUpperCase();  
  return;
}

// Function to update the Splide carousel with new photos
function updateSplideCarousel(category) {

  console.log("going to update carousel with photos of " + category);
  
  let photos = getAllFotosCategory(category);

  array = Array.from({ length: splide.length }, (_, index) => index);
  splide.remove(array);

  photos.forEach(photo => {
    splide.add('<li class="splide__slide"><img src="' + photo + '"></li>');
  });

}

function getAllFotosCategory(categora){

  const photos = myPhotos.filter(photo => photo.category.toLowerCase().includes(categora.toLowerCase()));
  const srcs = photos.map(photo => photo.src);

  console.log(srcs);
  return srcs;
  
}

document.addEventListener("click", function(){
  var clickedElement = event.target;
  
  if (clickedElement.closest('.category-btn')) {
    var text = $(clickedElement).text();
    updateSplideCarousel(text)
  }
});