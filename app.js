
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
	{src: 'idealic_nl/_13_0771.jpg', alt: 'Landscape photo 1', category: 'ideal'},
	{src: 'idealic_nl/_15_0773.jpg', alt: 'Landscape photo 1', category: 'ideal'},
    {src: 'towers/_24_0950.jpg', alt: 'Landscape photo 1', category: 'towers'},
    {src: 'geometric/_04_0762.jpg', alt: 'Landscape photo 1', category: 'geometric'},
    {src: 'geometric/_28_0953.jpg', alt: 'Landscape photo 1', category: 'geometric'},
    {src: 'geometric/_35_0960.jpg', alt: 'Landscape photo 1', category: 'geometric'},
];

$(document).ready(function(){
    $('.carousel').carousel();
});
  
