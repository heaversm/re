const contentItems = document.querySelectorAll('.modal__content-item');
const imageItems = document.querySelectorAll('.modal__image');


MicroModal.init({
  onShow: (modal,trigger,e) => {
    const $triggerEl = e.currentTarget;
    const id = $triggerEl.dataset.id;
    const $targetContent = document.querySelector(`.modal__content-item[data-id="${id}"]`);
    const $targetImage = document.querySelector(`.modal__image[data-id="${id}"]`);

    contentItems.forEach((item)=>{
      if (item.classList.contains('active')){
        item.classList.remove('active');
      }
    });
    imageItems.forEach((item)=>{
      if (item.classList.contains('active')){
        item.classList.remove('active');
      }
    });
    $targetContent.classList.add('active');
    $targetImage.classList.add('active');
  }
});

