/* eslint-disable no-undef */
let mainElement;
let stickerElement;
let batteryLevelLabel;
let statusLabel;

window.onload = () => {
  initButton('button', 'comment', 'led');
  window.api.getEndpoint();
  window.api.getUdpHost();
  mainElement = document.getElementById('main');
  stickerElement = document.getElementById('sticker');
  batteryLevelLabel = document.getElementById('batteryLevelLabel');
  statusLabel = document.getElementById('statusLabel');
  setLabel();
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

window.api.setLabel(() => {
  setLabel();
});

const setLabel = () => {
  window.api.getI18NMessage('battery level label')
    .then((result) => {
      batteryLevelLabel.textContent = result;
    });
  window.api.getI18NMessage('status label')
    .then((result) => {
      statusLabel.textContent = result;
    });
};
