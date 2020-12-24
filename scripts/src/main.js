import MicroModal from "micromodal";

const re = (function () {
  const $contentItems = document.querySelectorAll(".modal__content-item");
  const $imageItems = document.querySelectorAll(".modal__image");
  const $body = document.body;
  const $blueSquare = document.querySelector(".header-main__square");
  const $pageTitle = document.querySelector(".header-main__title-link");

  const initModal = function () {
    MicroModal.init({
      onShow: (modal, trigger, e) => {
        const $triggerEl = e.currentTarget;
        const id = $triggerEl.dataset.id;
        const $targetContent = document.querySelector(
          `.modal__content-item[data-id="${id}"]`
        );
        const $targetImage = document.querySelector(
          `.modal__image[data-id="${id}"]`
        );

        $contentItems.forEach((item) => {
          if (item.classList.contains("active")) {
            item.classList.remove("active");
          }
        });
        $imageItems.forEach((item) => {
          if (item.classList.contains("active")) {
            item.classList.remove("active");
          }
        });
        $targetContent.classList.add("active");
        $targetImage.classList.add("active");
      }
    });
  };

  const addListeners = function () {
    const $mainNavLinks = document.querySelectorAll(".nav-main__link");
    $mainNavLinks.forEach((navLink) =>
      navLink.addEventListener("click", onMainNavClick)
    );
    $blueSquare.addEventListener("click", onMainNavClick);
    $pageTitle.addEventListener("click", onMainNavClick);
  };

  const onMainNavClick = function (e) {
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    switch (id) {
      case "irl":
        $body.dataset.page = "irl";
        break;
      case "online":
        $body.dataset.page = "online";
        break;
      default:
        $body.dataset.page = "home";
        break;
    }
  };

  const init = function () {
    initModal();
    addListeners();
  };

  return {
    init: init
  };
})();

window.onload = function () {
  re.init();
};
