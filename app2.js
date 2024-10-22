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
          if(!categories.includes(allCategories[i]) && allCategories[i] != ""){
            categories.push(allCategories[i]);
            console.log(categories);
          };
        }
      })
      
      categories.splice(1, 0);
      
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
  altText = photo ? photo.alt: "Click on \nthe categories to continue";
  const myDiv = document.getElementById('line_breaker');
  myDiv.textContent = altText.toUpperCase();  
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

  const photos = myPhotos.filter(photo => photo.category.toLowerCase().includes(categora.toLowerCase()));
  const srcs = photos.map(photo => photo.src);
    
  return srcs;
}

document.addEventListener("click", function(){
  var clickedElement = event.target;
  
  console.log()

  if (clickedElement.closest('.category-btn')) {
    var text = $(clickedElement).text();
    updateSplideCarousel(text)
  }
});