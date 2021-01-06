import MicroModal from "micromodal";
import { Observable } from "@babylonjs/core/Misc/observable";

import "regenerator-runtime";

import init3DOverlay from "./3d-overlay";

import { RE1 } from "./re1";
import { RE2 } from "./re2";
import { RE3 } from "./re3";
import { RE4 } from "./re4";
import { RE5 } from "./re5";
import { RE6 } from "./re6";
const re1 = new RE1();
const re2 = new RE2();
const re3 = new RE3();
const re4 = new RE4();
const re5 = new RE5();
const re6 = new RE6();

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

  const $strobeTrigger = document.querySelector(".modal__strobe-trigger");
  const strobeTiming = 500; //ms between flashes
  let strobeInterval; //handles flashing strobe text
  let strobeOn = false; //when true, text is blue

  const $collectionLinks = document.querySelectorAll(".collection__link");
  const $gridImages = document.querySelectorAll(".square-grid__image");
  const $exhibitContents = document.querySelectorAll(
    ".square-grid__exhibit-content"
  );

  let curSketch;

  const initModal = function () {
    MicroModal.init({
      onShow: (modal, trigger, e) => {
        const modalID = modal.id;
        if (modalID === "modal-1") {
          handleModal1(modal, trigger, e);
        }
        if (modalID === "modal-2") {
          handleModal2(modal, trigger, e);
        }
      },
      onClose: (modal, trigger, e) => {
        const modalID = modal.id;
        if (modalID === "modal-3") {
          //strobe modal
          cancelStrobe();
        }
      },
    });
    //MicroModal.show("modal-3"); //show strobe at start //using this clears out all config options...https://github.com/ghosh/Micromodal/issues/354
    $strobeTrigger.click();
  };

  const handleModal1 = function (modal, trigger, e) {
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
  };

  const handleModal2 = function (modal, trigger, e) {
    if (!curSketch) {
      hideSquares();
    } else {
      //need to dispose of curSketch
      curSketch.removeSketch();
    }
    switch (trigger.dataset.id) {
      case "online1":
        curSketch = re1;
        re1.init();
        //TODO: Oren - initialize the babylon layer / dispose of existing babylon layers
        break;
      case "online2":
        curSketch = re2;
        re2.init();
        break;
      case "online3":
        curSketch = re3;
        re3.init();
        break;
      case "online4":
        curSketch = re4;
        re4.init();
        break;
      case "online5":
        curSketch = re5;
        re5.init();
        break;
      case "online6":
        curSketch = re6;
        re6.init();
        break;
      default:
        curSketch = re1;
        re1.init();
        break;
    }
  };

  const hideSquares = function () {
    $body.classList.toggle("modal-active", true);
  };

  const addListeners = function () {
    const $mainNavLinks = document.querySelectorAll(".nav-main__link");
    $mainNavLinks.forEach((navLink) =>
      navLink.addEventListener("click", onMainNavClick)
    );
    $blueSquare.addEventListener("click", onMainNavClick);
    $pageTitle.addEventListener("click", onMainNavClick);
    const $irlCollectionLinks = document.querySelectorAll(
      ".collection__link[data-page='irl']"
    );
    $irlCollectionLinks.forEach((irlLink) => {
      irlLink.addEventListener("click", onIRLCollectionLinkClick);
    });
  };

  const onIRLCollectionLinkClick = (e) => {
    e.preventDefault();
    const $thisLink = e.target;
    const thisID = $thisLink.dataset.collection;
    $collectionLinks.forEach(($collectionLink) => {
      $collectionLink.classList.toggle("active", false);
    });
    $thisLink.classList.toggle("active", true);
    $gridImages.forEach(($gridImage) => {
      $gridImage.classList.toggle("active", false);
    });
    $exhibitContents.forEach(($exhibitContent) => {
      $exhibitContent.classList.toggle("active", false);
    });
    const $collectionImages = document.querySelectorAll(
      `.square-grid__image[data-collection="${thisID}"]`
    );
    $collectionImages.forEach(($collectionImage) => {
      $collectionImage.classList.toggle("active", true);
    });
    const $collectionContent = document.querySelector(
      `.square-grid__exhibit-content[data-collection="${thisID}"]`
    );
    $collectionContent.classList.toggle("active", true);
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
