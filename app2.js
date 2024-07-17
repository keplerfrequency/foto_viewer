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
  
  
  };

  function findAltBySrc(src) {
    for (let i = 0; i < jsonData.length; i++) {
        if (jsonData[i].src === src) {
            return jsonData[i].alt;
        }
    }
    return null; // Return null if src is not found
}