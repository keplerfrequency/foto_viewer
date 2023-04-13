// Function to generate the HTML for the photo carousel
function generateCarouselHTML(photos) {
  let html = '';

  photos.forEach(photo => {

    src = "https://raw.githubusercontent.com/keplerfrequency/foto_viewer/main/" + photo.src

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
      categoryClean = category.replace('-', ' ')
      html += `
      <button class="category-btn" data-category="${category}">${categoryClean}</button>`;
    });
    
    const buttonRepo = document.querySelector('#button-repo');
    buttonRepo.innerHTML = html;
  });

}

function updateAltText(){
  
  const activeImg = document.querySelector('.carousel-item.active .foto');
  
  const altText = activeImg.alt;
  
  const myDiv = document.getElementById('alt_text');
  myDiv.textContent = altText;

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
      // Access the global variable `photos` here
      console.log(myPhotos);
    }
  });

});
  



// Sample photo data
/*const myPhotos = [
  {src: './photos/_15_0773.jpg', alt: 'Utrecht', category: 'ideal'},
  {src: './photos/_13_0771.jpg', alt: 'Leiden', category: 'ideal'},
  {src: './photos/_24_0950.jpg', alt: 'Frankfurt', category: 'towers'},
  {src: './photos/_28_0953.jpg', alt: 'Drachten', category: 'geometric'},
  //{src: './photos/_35_0960.jpg', alt: 'Brussel', category: 'geometric'},
];*/