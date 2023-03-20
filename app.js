// Function to generate the HTML for the photo carousel
function generateCarouselHTML(photos) {
  let html = '';

  photos.forEach(photo => {
    html += `
      <div class="carousel-item">
        <img src="${photo.src}" alt="${photo.alt}" class="foto">
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


// Sample photo data
const myPhotos = [
  {src: './photos/_15_0773.jpg', alt: 'Utrecht', category: 'ideal'},
  {src: './photos/_13_0771.jpg', alt: 'Leiden', category: 'ideal'},
  {src: './photos/_24_0950.jpg', alt: 'Frankfurt', category: 'towers'},
  {src: './photos/_28_0953.jpg', alt: 'Drachten', category: 'geometric'},
  {src: './photos/_35_0960.jpg', alt: 'Brussel', category: 'geometric'},
];

function updateAltText(){
  
  let act_image = document.getElementsByClassName('carousel-item active')[0].firstElementChild.getAttribute('alt');
  
  if(act_image){
    document.getElementById('alt_text').textContent = act_image;
  } else{
    document.getElementById('alt_text').textContent = '';
  } 

};

$(document).ready(function(){

  $('.carousel').carousel();

  $('#carouselExampleControls').on('slid.bs.carousel', function () {
    updateAltText();
  })
  
});
  
