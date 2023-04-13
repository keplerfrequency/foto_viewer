// Function to generate the HTML for the photo carousel
function generateCarouselHTML(photos) {
  let html = '';

  photos.forEach(photo => {

    src = "https://github.com/keplerfrequency/foto_viewer/blob/main/" + photo.src + "?raw=true"

    html += `
      <div class="carousel-item">
        <img src="${src}" alt="${photo.alt}" class="foto">
      </div>
    `;
  });

  return html;
}

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

function updateAltText(){
  
  const activeImg = document.querySelector('.carousel-item.active .foto');
  
  const altText = activeImg.alt.split(",").join("\n");
  
  const myDiv = document.getElementById('line_breaker');
  myDiv.textContent = altText.toUpperCase();

};

function carouselPosition(){
  
  console.log(123)

  let element = document.querySelector('.carousel');

  let height = window.innerHeight;

  let fotoHeight = document.querySelector('.carousel-item.active .foto').clientHeight; 

  divHeight = 0.8 * height
  offset = (divHeight - fotoHeight)/2 +"px"
  console.log(offset)

  element.style.top = offset;

};

function generateMyPhotos(){

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
      console.log(myPhotos);
      callback(null, myPhotos);
    })
    .catch(error => {
      callback(error, null);
    });

};

document.addEventListener("click", function(){
  updateAltText();
});


$(document).ready(function(){

  $('.carousel').carousel();

   $('#carouselExampleControls').on('slid.bs.carousel', function () {
    updateAltText();
  })
  
  generateMyPhotos(function(error, myPhotos) {
    if (error) {
      console.error(error);
    } else {
      console.log(myPhotos);
    }
  });

});