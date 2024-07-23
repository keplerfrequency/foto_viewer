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

function findAltBySrc(src){

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

    let altText = getAltText(src, myPhotos);

    const myDiv = document.getElementById('line_breaker');
    myDiv.textContent = altText.toUpperCase();

  })
  .catch(error => {
    callback(error, null);
  });


};

//Looks through the myPhotos array and returns the alt
function getAltText(src, myPhotos) {
  let photo = myPhotos.find(photo => photo.src === src);  
  return photo ? photo.alt : null;
}