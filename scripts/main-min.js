const contentItems=document.querySelectorAll(".modal__content-item"),imageItems=document.querySelectorAll(".modal__image");MicroModal.init({onShow:(t,e,a)=>{const c=a.currentTarget.dataset.id,o=document.querySelector(`.modal__content-item[data-id="${c}"]`),s=document.querySelector(`.modal__image[data-id="${c}"]`);contentItems.forEach((t=>{t.classList.contains("active")&&t.classList.remove("active")})),imageItems.forEach((t=>{t.classList.contains("active")&&t.classList.remove("active")})),o.classList.add("active"),s.classList.add("active")}});