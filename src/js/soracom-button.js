let count = 0;
let timer;
let waitTimer;
let nowSending = 0;
let sendingTimer;
let clickNum = 0;
let buttonElement;
let commentElement;
let ledElement;
// eslint-disable-next-line prefer-const
let size = 'large';

const ua = navigator.userAgent.toLowerCase();
const isSP = /iphone|ipod|ipad|android/.test(ua);
const eventStart = isSP ? 'touchstart' : 'mousedown';
const eventEnd = isSP ? 'touchend' : 'mouseup';
const eventLeave = isSP ? 'touchmove' : 'mouseleave';
const longClickThreashold = 100;

function dataSend () {
  let clickTypeName;
  let clickType;
  let batteryLevel = parseInt(document.getElementById('batteryLevel').value);

  if (batteryLevel !== 0 && batteryLevel !== 1 && batteryLevel !== 2 && batteryLevel !== 3) batteryLevel = 1;

  const batteryLevelLabel = ['0.25', '0.5', '0.75', '1.0'][batteryLevel];

  if (count >= longClickThreashold) {
    clickTypeName = 'LONG';
    clickType = 3;
  } else if (clickNum === 1) {
    clickTypeName = 'SINGLE';
    clickType = 1;
  } else {
    clickTypeName = 'DOUBLE';
    clickType = 2;
  }

  commentElement.textContent = clickTypeName + '(batteryLevel:' + batteryLevelLabel + ') ';
  clickNum = 0;
  nowSending = 1;
  let sendingCounter = 0;
  clearInterval(waitTimer);
  commentElement.textContent += '送信中';
  changeLedClass('sending');

  sendingTimer = setInterval(() => {
    commentElement.textContent += '.';
    sendingCounter++;
    if (sendingCounter > 6) {
      clearInterval(sendingTimer);
      let result;
      window.api.sendUdp(
        {
          clickType: clickType,
          clickTypeName: clickTypeName,
          batteryLevel: batteryLevel
        }
      ).then(() => {
        changeLedClass('sent');
        result = '(成功)';
      }).catch(() => {
        changeLedClass('senterror');
        result = '(失敗)';
      }).finally(() => {
        commentElement.textContent = '送信完了' + result;
        nowSending = 0;
      });
    }
  }, 1000);
}

function changeLedClass (className) {
  ledElement.className = 'led ' + size + ' ' + className;
}

// eslint-disable-next-line no-unused-vars
function initButton (button, comment, led) {
  buttonElement = document.getElementById(button);
  commentElement = document.getElementById(comment);
  ledElement = document.getElementById(led);
  buttonElement.addEventListener(eventStart, e => {
    if (nowSending === 1) {
      return;
    }
    e.preventDefault();
    clearInterval(waitTimer);
    count = 0;
    timer = setInterval(() => {
      count++;
    }, 10);
  });

  buttonElement.addEventListener(eventEnd, e => {
    if (nowSending === 1) {
      return;
    }
    e.preventDefault();
    if (count) {
      clearInterval(timer);
      clickNum++;
      waitTimer = setInterval(dataSend, 1000);
    }
  });

  buttonElement.addEventListener(eventLeave, e => {
    if (nowSending === 1) {
      return;
    }
    e.preventDefault();
    const el = isSP ? document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY) : buttonElement;
    if (!isSP || el !== buttonElement) {
      clearInterval(timer);
      count = 0;
    }
  });
}
