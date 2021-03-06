import { Observable } from "@babylonjs/core/Misc/observable";

import "regenerator-runtime";

import init3DOverlay from "./3d-overlay";
import { red, green, blue, yellow, magenta, cyan } from "./3d-overlay/colors";

import irlImages from "../assets/images/irl/*.jpg";

import modelFiles from "../assets/models/*.babylon";

import { RE1 } from "./re1";
import { RE2 } from "./re2";
import { RE3 } from "./re3";
import { RE4 } from "./re4";
import { RE5 } from "./re5";
import { RE6 } from "./re6";
import { RE7 } from "./re7";
import { RE8 } from "./re8";
import { RE9 } from "./re9";
import { RE10 } from "./re10";
import { RE11 } from "./re11";
import { RE12 } from "./re12";

const events = {
  onNavigateOnline: new Observable(),
  onNavigateIRL: new Observable(),
  onViewOnlineArtwork: new Observable(),
  onResizeSketchContainer: new Observable(),
  onMouseMove: new Observable(),
};

const re1 = new RE1(events.onResizeSketchContainer, events.onMouseMove);
const re2 = new RE2(events.onResizeSketchContainer, events.onMouseMove);
const re3 = new RE3(events.onResizeSketchContainer, events.onMouseMove);
const re4 = new RE4(events.onResizeSketchContainer, events.onMouseMove);
const re5 = new RE5(events.onResizeSketchContainer, events.onMouseMove);
const re6 = new RE6(events.onResizeSketchContainer, events.onMouseMove);
const re7 = new RE7(events.onResizeSketchContainer, events.onMouseMove);
const re8 = new RE8(events.onResizeSketchContainer, events.onMouseMove);
const re9 = new RE9(events.onResizeSketchContainer, events.onMouseMove);
const re10 = new RE10(events.onResizeSketchContainer, events.onMouseMove);
const re11 = new RE11(events.onResizeSketchContainer, events.onMouseMove);
const re12 = new RE12(events.onResizeSketchContainer, events.onMouseMove);

const re = (function () {
  //DOM REFERENCES
  const $contentItems = document.querySelectorAll(".modal__content-item");
  const $body = document.body;
  const $blueSquare = document.querySelector(".header-main__square");
  const $pageTitle = document.querySelector(".header-main__title-link");
  const $irlImage = document.querySelector(".irl__image");
  const $collectionLinks = document.querySelectorAll(".collection__link");
  const $gridImages = document.querySelectorAll(".square-grid__image");
  const $exhibitContents = document.querySelectorAll(
    ".square-grid__exhibit-content[data-page='irl']"
  );
  const $modals = document.querySelectorAll(".modal");

  //STATES
  let curSketch;
  let mobileNavActive = false;
  let isMobile;
  let isBabylonInitialized = false;

  const DISABLE_CLICK_DURATION = 250;

  const addListeners = function () {
    const $mainNavLinks = document.querySelectorAll(".nav-main__link");
    $mainNavLinks.forEach((navLink) => {
      navLink.addEventListener("click", onMainNavClick);
    });
    $blueSquare.addEventListener("touchend", onMobileNavClick);

    $collectionLinks.forEach(($collectionLink) => {
      $collectionLink.addEventListener("click", onCollectionLinkClick);
    });

    $pageTitle.addEventListener("click", onMainNavClick); //MH - disabled for post-event

    addModalListeners();
  };

  const addGridImageListeners = function () {
    $gridImages.forEach(($gridImage) => {
      $gridImage.addEventListener("click", onGridImageClick);
    });
  };

  const removeGridImageListeners = function () {
    $gridImages.forEach(($gridImage) => {
      $gridImage.removeEventListener("click", onGridImageClick);
    });
  };

  const addModalListeners = function () {
    $modals.forEach(($modal) => {
      const $modalClose = $modal.querySelectorAll("[data-modal-close]");
      if ($modalClose.length) {
        $modalClose.forEach(($closeTrigger) => {
          $closeTrigger.addEventListener("click", onModalCloseClick);
        });
      }
    });
  };

  const removeModalListeners = function () {
    $modals.forEach(($modal) => {
      const $modalClose = $modal.querySelector("[data-modal-close]");
      if ($modalClose.length) {
        $modalClose.forEach(($closeTrigger) => {
          $modalClose.removeEventListener("click", onModalCloseClick);
        });
      }
    });
  };

  const initModal = function () {
    showModal("modal-3", false);
    $irlImage.src = `${irlImages["_"]}`; //empty black image for modal when not viewing a particular exhibit image to deal with image changeover for uncached images.
  };

  const handleModal1 = function (e) {
    //ONLINE
    const $triggerEl = e.currentTarget;
    const id = $triggerEl.dataset.id;
    const collection = $triggerEl.dataset.collection;
    const alt = $triggerEl.alt;
    const $targetContent = document.querySelector(
      `.modal__content-item[data-collection="${collection}"]`
    );

    $contentItems.forEach((item) => {
      if (item.classList.contains("active")) {
        item.classList.remove("active");
      }
    });
    $irlImage.src = `${irlImages[id]}`;
    $irlImage.alt = id;

    if ($targetContent) {
      $targetContent.classList.add("active");
      const $modalTitle = $targetContent.querySelector(".modal__content-title");
      if ($modalTitle) {
        $modalTitle.innerHTML = alt;
      }
    }
    showModal("modal-1");
  };

  const handleModal2 = async function (e) {
    const $triggerEl = e.currentTarget;
    const id = $triggerEl.dataset.id;

    if (isMobile) {
      await initBabylon();
    }

    showModal("modal-2", false);

    //IRL
    if (!curSketch) {
      if (isMobile) {
        setTimeout(hideSquares, DISABLE_CLICK_DURATION + 100); //yikes...
      } else {
        hideSquares();
      }
    } else {
      //need to dispose of curSketch
      curSketch.removeSketch();
      //TODO: Oren - dispose of any previous character related processes
    }
    const palette = {};
    switch (id) {
      case "online1":
        curSketch = re1;
        re1.init();
        palette.shirtColor = red;
        palette.pantsColor = magenta;
        //TODO: Oren - initialize the babylon layer / dispose of existing babylon layers
        break;
      case "online2":
        curSketch = re2;
        re2.init();
        palette.shirtColor = cyan;
        palette.pantsColor = red;
        break;
      case "online3":
        curSketch = re3;
        re3.init();
        palette.shirtColor = red;
        palette.pantsColor = blue;
        break;
      case "online4":
        curSketch = re4;
        re4.init();
        palette.shirtColor = green;
        palette.pantsColor = red;
        break;
      case "online5":
        curSketch = re5;
        re5.init();
        palette.shirtColor = yellow;
        palette.pantsColor = magenta;
        break;
      case "online6":
        curSketch = re6;
        re6.init();
        palette.shirtColor = blue;
        palette.pantsColor = cyan;
        break;
      case "online7":
        curSketch = re7;
        re7.init();
        palette.shirtColor = green;
        palette.pantsColor = yellow;
        break;
      case "online8":
        curSketch = re8;
        re8.init();
        palette.shirtColor = green;
        palette.pantsColor = red;
        break;
      case "online9":
        curSketch = re9;
        re9.init();
        palette.shirtColor = red;
        palette.pantsColor = blue;
        break;
      case "online10":
        curSketch = re10;
        re10.init();
        palette.shirtColor = red;
        palette.pantsColor = blue;
        break;
      case "online11":
        curSketch = re11;
        re11.init();
        palette.shirtColor = red;
        palette.pantsColor = blue;
        break;
      case "online12":
        curSketch = re12;
        re12.init();
        palette.shirtColor = blue;
        palette.pantsColor = magenta;
        break;
      default:
        curSketch = re1;
        re1.init();
        palette.shirtColor = red;
        palette.pantsColor = magenta;
        break;
    }
    events.onViewOnlineArtwork.notifyObservers(palette);
  };

  const onModalCloseClick = function (e) {
    e.preventDefault();
    const modalID = e.currentTarget.dataset.modalClose;
    hideModal(modalID);
    setTimeout(addGridImageListeners, DISABLE_CLICK_DURATION);
  };

  const hideModal = function (modalID) {
    const $modal = document.getElementById(modalID);
    $modal.classList.toggle("is-open", false);
    setTimeout(() => {
      $body.classList.toggle("modal-active", false);
    }, DISABLE_CLICK_DURATION);
    if (modalID === "modal-1") {
      $irlImage.src = `${irlImages["_"]}`; //empty black image for modal when not viewing a particular exhibit image to deal with image changeover for uncached images.
    }
  };

  const showModal = function (modalID, doDelay = true) {
    if (doDelay) {
      setTimeout(() => {
        activateModal(modalID);
      }, DISABLE_CLICK_DURATION);
    } else {
      activateModal(modalID);
    }
  };

  const activateModal = function (modalID) {
    $body.classList.toggle("modal-active", true);
    $modals.forEach(($modal) => {
      const thisID = $modal.id;
      if (thisID === modalID) {
        $modal.classList.toggle("is-open", true);
      } else {
        $modal.classList.toggle("is-open", false);
      }
    });
  };

  const closeAllModals = function () {
    $modals.forEach(($modal) => {
      $modal.classList.toggle("is-open", false);
    });
    $body.classList.toggle("modal-active", false);
  };

  const hideSquares = function () {
    $body.classList.toggle("modal-active", true);
  };

  const onGridImageClick = (e) => {
    e.preventDefault();
    removeGridImageListeners();
    if (
      $body.dataset.mobileNavActive === true ||
      $body.dataset.modalOpen === true ||
      $body.classList.contains("modal-active")
    ) {
      return;
    }

    handleModal1(e);
  };

  const onCollectionLinkClick = async (e) => {
    e.preventDefault();

    const $thisLink = e.target;
    const thisID = $thisLink.dataset.collection;
    $collectionLinks.forEach(($collectionLink) => {
      $collectionLink.classList.toggle("active", false);
    });
    $thisLink.classList.toggle("active", true);

    const initialLoad = $body.dataset.initialLoad;
    if (initialLoad) {
      $body.dataset.initialLoad = false;
    }

    const curPage = $body.dataset.page;
    const newPage = e.target.dataset.page;
    if (newPage) {
      if (curPage !== newPage) {
        if (curPage === "irl") {
          hideModal("modal-1");
        } else if (curPage === "online") {
          hideModal("modal-2");
        }
        $body.dataset.page = newPage;
      }
      if (newPage === "irl") {
        hideModal("modal-5"); //MH - TODO: check if active first?
      } else if (newPage === "online") {
        hideModal("modal-6");
      }
    }

    if (newPage === "irl") {
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
    } else if (newPage === "online") {
      await handleModal2(e);
    }
    if (isMobile) {
      setTimeout(hideMobileNav, DISABLE_CLICK_DURATION);
    }
  };

  const onMobileNavClick = function (e) {
    e.preventDefault();
    toggleMobileNavActive();
  };

  const toggleMobileNavActive = function () {
    mobileNavActive = !mobileNavActive;
    $body.dataset.mobileNavActive = `${mobileNavActive}`;
  };

  const hideMobileNav = function () {
    mobileNavActive = false;
    $body.dataset.mobileNavActive = `${mobileNavActive}`;
  };

  const initBabylon = async function () {
    if (isBabylonInitialized) {
      return;
    }
    // show loading modal
    showModal("modal-4", false);

    const modelBlobs = await Promise.all(
      Object.values(modelFiles).map((modelURL) =>
        window.fetch(modelURL).then((r) => r.blob())
      )
    );
    const models = Object.keys(modelFiles).reduce(
      (acc, modelFile, i) => ({
        ...acc,
        [modelFile]: URL.createObjectURL(modelBlobs[i]),
      }),
      {}
    );

    const $overlayCanvas = document.getElementById("render-canvas");
    const $characterCanvas = document.getElementById("sketch-canvas");
    await init3DOverlay(
      $overlayCanvas,
      $characterCanvas,
      models,
      events,
      isMobile
    );
    isBabylonInitialized = true;

    // hide loading modal
    //closeAllModals();
    hideModal("modal-4");
  };

  //MH - added for post-event
  const onInit = async function (e) {
    await initBabylon();

    $body.dataset.page = "online";
    events.onNavigateOnline.notifyObservers();
    deactivateIRLItems();
    deactivateOnlineItems();
    closeAllModals();
    if (isMobile) {
      onInitMobile();
    } else {
      showModal("modal-6");
    }
    const palette = {}; //this is random for the small characters(?)
    palette.shirtColor = red;
    palette.pantsColor = magenta;
    events.onViewOnlineArtwork.notifyObservers(palette);
  };

  const onInitMobile = function () {
    document.querySelector('.collection__link[data-id="online1"]').click();
  };
  //MH - end added for post-event

  /* //MH - disable for post-event
  const onMainNavClick = async function (e) {
    e.preventDefault();
    const id = e.currentTarget.dataset.id;

    const curPage = $body.dataset.page;

    switch (id) {
      case "irl":
        $body.dataset.page = "irl";
        events.onNavigateIRL.notifyObservers();
        deactivateIRLItems();
        deactivateOnlineItems();
        closeAllModals();
        showModal("modal-5", false);
        break;
      case "online":
        await initBabylon();

        $body.dataset.page = "online";
        events.onNavigateOnline.notifyObservers();
        deactivateIRLItems();
        deactivateOnlineItems();
        closeAllModals();
        showModal("modal-6");
        break;
      case "about":
        showModal("modal-7");
        break;
      default:
        $body.dataset.page = "home";
        events.onNavigateIRL.notifyObservers();
        deactivateIRLItems();
        deactivateOnlineItems();
        closeAllModals();
        break;
    }
  };

  */

  //MH - add for post-event
  const onMainNavClick = function () {
    showModal("modal-7");
  };

  //END add for post-event

  const deactivateOnlineItems = function () {
    const activeOnlineItem = document.querySelector(
      '.collection__link.active[data-page="online"]'
    );
    if (activeOnlineItem) {
      activeOnlineItem.classList.toggle("active", false);
    }
    hideModal("modal-6"); //online intro content
    hideModal("modal-4"); //online loading
  };

  const deactivateIRLItems = function () {
    const activeIRLItem = document.querySelector(
      '.collection__link.active[data-page="irl"]'
    );
    if (activeIRLItem) {
      activeIRLItem.classList.toggle("active", false);
    }
    const $activeImages = document.querySelectorAll(
      ".square-grid__image.active"
    );
    if ($activeImages.length) {
      $activeImages.forEach(($activeImage) => {
        $activeImage.classList.toggle("active", false);
      });
    }
    deactivateIRLContent();
    hideModal("modal-5");
  };

  const deactivateIRLContent = function () {
    const $activeContent = document.querySelectorAll(
      '.square-grid__exhibit-content.active[data-page="irl"]'
    );
    if ($activeContent.length) {
      $activeContent.forEach(($contentItem) => {
        $contentItem.classList.toggle("active", false);
      });
    }
  };

  const checkMobile = function () {
    var a = navigator.userAgent || navigator.vendor || window.opera;
    isMobile =
      /android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|iP(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      );
  };

  const addResizeObservers = function () {
    const sketchResizeObserver = new ResizeObserver((entries) => {
      const sketchContainer = entries[0].target;
      events.onResizeSketchContainer.notifyObservers([
        sketchContainer.clientWidth,
        sketchContainer.clientHeight,
      ]);
    });
    sketchResizeObserver.observe(document.getElementById("sketch-container"));
  };

  const init = async function () {
    checkMobile();

    //initModal(); //MH - changes for post-event
    addListeners();
    addResizeObservers();
    onInit();
  };

  return {
    init: init,
  };
})();

window.onload = function () {
  re.init();
};
