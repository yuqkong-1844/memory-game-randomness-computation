/********************************************************************
 * exhibition.js — fully standalone
 * Gallery with story modal, KaTeX, and image zoom.
 ********************************************************************/

console.log("exhibition.js loaded");

/*******************
 * DOM Elements
 *******************/
const storyModal = document.getElementById("card-story-modal");
const storyModalContent = document.getElementById("card-story-modal-content");
const storyTitleDisplay = document.getElementById("story-title");
const storyContentDisplay = document.getElementById("story-content");
const storyCardImage = document.getElementById("story-card-image");
const storyCloseButton = document.getElementById("story-close-button");
const languageButton = document.getElementById("language-button");
const currentLangDisplay = document.getElementById("current-lang");

const imageViewerModal = document.getElementById("image-viewer-modal");
const imageViewerModalContent = document.getElementById("image-viewer-modal-content");
const zoomedImage = document.getElementById("zoomed-image");
const imageSaveButton = document.getElementById("image-save-button");
const imageCloseButton = document.getElementById("image-close-button");

/*******************
 * Card & Image Data
 *******************/
const cardImageBaseNames = [
  'Buffon.png','centrallimit.png','coupon.png','crossing.png','JL.png',
  'Lasvegas.png','makov.png','martingale.png','pairwiseind.png',
  'Ramsey.png','randomalg.png','tvd.png','unbalancinglights.png',
  'Azuma.png','coupling.png'
];

const IMAGE_FOLDERS = { 
  'Base':'./images/',
  'Colored':'./images_v2/'
};

let currentImageStyle = 'Base';
let currentLanguage = 'EN';
const imageBaseURL = () => IMAGE_FOLDERS[currentImageStyle];

/*******************
 * Story Data
 *******************/
let storiesMap = { EN: {}, CN: {} };

/*******************
 * Fetch Stories
 *******************/
async function fetchAllStories() {
  const urlEN = './card_stories/stories.json';
  const urlCN = './card_stories/stories_cn.json';

  try {
    const [resEN, resCN] = await Promise.all([
      fetch(urlEN),
      fetch(urlCN).catch(() => null)
    ]);

    if (resEN?.ok) {
      const dataEN = await resEN.json();
      storiesMap['EN'] = dataEN.reduce((map, story) => { map[story.image] = story; return map; }, {});
    }

    if (resCN?.ok) {
      const dataCN = await resCN.json();
      storiesMap['CN'] = dataCN.reduce((map, story) => { map[story.image] = story; return map; }, {});
    }
  } catch(e) {
    console.error("Error loading stories", e);
  }
}

/*******************
 * Modal Helpers
 *******************/
function showModal(modal, box) {
  modal.classList.remove("hidden");
  modal.classList.add("flex","opacity-100");
  setTimeout(() => {
    box.classList.remove("scale-90","opacity-0");
    box.classList.add("scale-100","opacity-100");
  }, 50);
}

function hideModal(modal, box) {
  box.classList.remove("scale-100","opacity-100");
  box.classList.add("scale-90","opacity-0");
  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("flex","opacity-100");
  }, 300);
}

/*******************
 * Story Modal + KaTeX
 *******************/
function renderStoryContentFromJSON(storyData) {
  let html = '';
  storyTitleDisplay.textContent = storyData.title || 'Card Story';

  storyData.sections.forEach(section => {
    let content = section.content || '';
    let contentWithMath = content.replace(/\$([^\$\n]+?)\$/g, (m, expr) => {
      try { return typeof katex !== "undefined" ? katex.renderToString(expr.trim(), { displayMode:false }) : m; }
      catch { return `<span class="text-red-600">[Math Error]</span>`; }
    });

    if(section.type === "heading") html += `<h4>${contentWithMath}</h4>`;
    else if(section.type === "equation") {
      try { if(typeof katex !== "undefined") html += `<div class="katex-display">${katex.renderToString(section.latex,{displayMode:true})}</div>`; }
      catch { html += `<p class="text-red-500">Error rendering LaTeX</p>`; }
    } else html += `<p>${contentWithMath}</p>`;
  });

  storyContentDisplay.innerHTML = html;
}

function showCardStory(name) {
  let story = storiesMap[currentLanguage][name] || storiesMap['EN'][name];
  const imgPath = imageBaseURL() + name;

  storyCardImage.src = imgPath;
  storyCardImage.alt = name;
  storyCardImage.onclick = () => showImageZoom(imgPath, name);

  if(story) renderStoryContentFromJSON(story);
  else {
    storyTitleDisplay.textContent = name.replace(".png","");
    storyContentDisplay.innerHTML = `<p class="text-center text-red-600 font-bold">No story found.</p>`;
  }

  showModal(storyModal, storyModalContent);
}

/*******************
 * Image Zoom
 *******************/
function showImageZoom(img, name) {
  zoomedImage.src = img;
  zoomedImage.alt = name;

  imageSaveButton.onclick = () => {
    const a = document.createElement("a");
    a.href = img;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  showModal(imageViewerModal, imageViewerModalContent);
}

/*******************
 * Language Switching (Modal only)
 *******************/
function toggleLanguage() {
  currentLanguage = currentLanguage === "EN" ? "CN" : "EN";
  currentLangDisplay.textContent = currentLanguage === "EN" ? "EN" : "中文";
  if(!storyModal.classList.contains("hidden")) showCardStory(storyCardImage.alt);
}

/*******************
 * Style Switching
 *******************/
function switchImageStyle() {
    const keys = Object.keys(IMAGE_FOLDERS);
    const next = (keys.indexOf(currentImageStyle) + 1) % keys.length;
    currentImageStyle = keys[next];

    // Update the UI text
    const display = document.getElementById("exhibit-style-display");
    if (display) display.textContent = currentImageStyle;

    buildExhibitionGrid();
}


/*******************
 * Exhibition Grid
 *******************/
function buildExhibitionGrid() {
  const grid = document.getElementById("exhibition-grid");
  if(!grid) return;
  grid.innerHTML = "";

  cardImageBaseNames.forEach(name => {
    const imgPath = imageBaseURL() + name;
    const imgEl = document.createElement("img");
    imgEl.src = imgPath;
    imgEl.alt = name;
    imgEl.className = "w-full h-auto object-cover rounded-xl cursor-pointer shadow hover:shadow-xl transition";
    imgEl.onerror = () => imgEl.src = 'https://placehold.co/300x200?text=Missing';
    imgEl.onclick = () => showCardStory(name);

    const wrapper = document.createElement("div");
    wrapper.className = "overflow-hidden";
    wrapper.appendChild(imgEl);

    grid.appendChild(wrapper);
  });
}

/*******************
 * Button Wiring
 *******************/
languageButton.addEventListener("click", toggleLanguage);
storyCloseButton.addEventListener("click", () => hideModal(storyModal, storyModalContent));
imageCloseButton.addEventListener("click", () => hideModal(imageViewerModal, imageViewerModalContent));

document.getElementById("exhibition-style-button")?.addEventListener("click", switchImageStyle);

/*******************
 * Init
 *******************/
window.addEventListener("DOMContentLoaded", async () => {
  await fetchAllStories();
  buildExhibitionGrid();
});
