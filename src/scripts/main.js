import MicroModal from "micromodal";
import { Observable } from "@babylonjs/core/Misc/observable";

import "regenerator-runtime";

import init3DOverlay from "./3d-overlay";

const babylonEvents = {
  onNavigateOnline: new Observable(),
  onNavigateIRL: new Observable(),
};

const re = (function () {
  const $contentItems = document.querySelectorAll(".modal__content-item");
  const $imageItems = document.querySelectorAll(".modal__image");
  const $body = document.body;
  const $blueSquare = document.querySelector(".header-main__square");
  const $pageTitle = document.querySelector(".header-main__title-link");

  const $strobeText = document.querySelector(".modal__strobe-text");
  const $strobeTrigger = document.querySelector(".modal__strobe-trigger");
  const strobeTiming = 500; //ms between flashes
  let strobeInterval; //handles flashing strobe text
  let strobeOn = false; //when true, text is blue

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
        if ($targetContent) {
          $targetContent.classList.add("active");
        }
        if ($targetImage) {
          $targetImage.classList.add("active");
        }
      },
      onClose: (modal, trigger, e) => {
        const modalID = modal.id;
        console.log(modalID);
        if (modalID === "modal-3") {
          //strobe modal
          cancelStrobe();
        }
      },
    });
    //MicroModal.show("modal-3"); //show strobe at start //using this clears out all config options...https://github.com/ghosh/Micromodal/issues/354
    $strobeTrigger.click();
  };

  const addListeners = function () {
    const $mainNavLinks = document.querySelectorAll(".nav-main__link");
    $mainNavLinks.forEach((navLink) =>
      navLink.addEventListener("click", onMainNavClick)
    );
    $blueSquare.addEventListener("click", onMainNavClick);
    $pageTitle.addEventListener("click", onMainNavClick);
  };

  const closeAllModals = function () {
    MicroModal.close("modal-1");
    MicroModal.close("modal-2");
    MicroModal.close("modal-3");
  };

  const onMainNavClick = function (e) {
    e.preventDefault();
    const id = e.currentTarget.dataset.id;

    switch (id) {
      case "irl":
        $body.dataset.page = "irl";
        babylonEvents.onNavigateIRL.notifyObservers();
        break;
      case "online":
        $body.dataset.page = "online";
        babylonEvents.onNavigateOnline.notifyObservers();
        break;
      default:
        $body.dataset.page = "irl";
        babylonEvents.onNavigateIRL.notifyObservers();
        break;
    }
    closeAllModals();
  };

  const initStrobe = function () {
    strobeInterval = setInterval(handleStrobe, strobeTiming);
  };

  const cancelStrobe = function () {
    clearInterval(strobeInterval);
  };

  const handleStrobe = function () {
    strobeOn = !strobeOn;
    if (strobeOn) {
      $body.classList.add("strobe");
    } else {
      const hasStrobe = $body.classList.contains("strobe");
      hasStrobe && $body.classList.remove("strobe");
    }
  };

  const init = function () {
    initModal();
    addListeners();
    initStrobe(); //add strobe effect for first modal
  };

  return {
    init: init,
  };
})();

window.onload = function () {
  re.init();
};

window.addEventListener("DOMContentLoaded", function () {
  const $canvas = document.getElementById("render-canvas");
  init3DOverlay($canvas, babylonEvents);
});
