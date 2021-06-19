/* eslint-disable no-undef */
let mainElement;
let stickerElement;

window.onload = () => {
  initButton('button', 'comment', 'led');
  window.api.getEndpoint();
  mainElement = document.getElementById('main');
  stickerElement = document.getElementById('sticker');
};

window.api.setSticker((label) => {
  switch (label) {
    case 'white':
      stickerElement.style.visibility = 'hidden';
      break;
    case 'soracomug':
      stickerElement.style.visibility = 'visible';
      break;
  }
});

window.api.setWindowSize((newSize) => {
  size = newSize;
  stickerElement.src = 'img/soracomug-' + size + '.png';
  buttonElement.className = 'button ' + size;
  mainElement.className = 'main ' + size;
  ledElement.className = 'led ' + size;
});
