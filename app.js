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
  

// Sample photo data
const myPhotos = [
	{src: 'idealic_nl/_13_0771.jpg', alt: 'Leiden', category: 'ideal'},
	{src: 'idealic_nl/_15_0773.jpg', alt: 'Utrecht', category: 'ideal'},
  {src: 'towers/_24_0950.jpg', alt: 'Frankfurt', category: 'towers'},
  {src: 'geometric/_28_0953.jpg', alt: 'Drachten', category: 'geometric'},
  {src: 'geometric/_35_0960.jpg', alt: 'Brussel', category: 'geometric'},
];

document.addEventListener("DOMContentLoaded", function() {
  
  const carousel = document.getElementById('carouselExampleControls');
  
  carousel.addEventListener('slide.bs.carousel', event => {
    console.log(123);
  })
    
});


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
});
  
