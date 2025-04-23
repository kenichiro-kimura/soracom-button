/* eslint-disable no-undef */
let mainElement;
let stickerElement;
let batteryLevelLabel;
let statusLabel;

// アプリケーション初期化
window.onload = async () => {
  try {
    // UI要素の初期化
    initButton('button', 'comment', 'led');
    
    // 設定の読み込み
    await Promise.all([
      window.api.getEndpoint(),
      window.api.getUdpHost()
    ]);
    
    // UI要素の取得
    mainElement = document.getElementById('main');
    stickerElement = document.getElementById('sticker');
    batteryLevelLabel = document.getElementById('batteryLevelLabel');
    statusLabel = document.getElementById('statusLabel');
    
    // ラベルの設定
    await setLabel();
  } catch (error) {
    console.error('アプリケーションの初期化中にエラーが発生しました:', error);
  }
};

// ステッカー変更のイベントリスナー
window.api.setSticker((label) => {
  try {
    switch (label) {
      case 'white':
        stickerElement.style.visibility = 'hidden';
        break;
      case 'soracomug':
        stickerElement.style.visibility = 'visible';
        break;
    }
  } catch (error) {
    console.error('ステッカー設定中にエラーが発生しました:', error);
  }
});

// ウィンドウサイズ変更のイベントリスナー
window.api.setWindowSize((newSize) => {
  try {
    size = newSize;
    stickerElement.src = 'img/soracomug-' + size + '.png';
    buttonElement.className = 'button ' + size;
    mainElement.className = 'main ' + size;
    ledElement.className = 'led ' + size;
  } catch (error) {
    console.error('ウィンドウサイズ変更中にエラーが発生しました:', error);
  }
});

// ラベル更新のイベントリスナー
window.api.setLabel(() => {
  setLabel().catch(error => {
    console.error('ラベル更新中にエラーが発生しました:', error);
  });
});

// 多言語ラベル設定関数
const setLabel = async () => {
  try {
    const [batteryLevelText, statusLabelText] = await Promise.all([
      window.api.getI18NMessage('battery level label'),
      window.api.getI18NMessage('status label')
    ]);
    
    batteryLevelLabel.textContent = batteryLevelText;
    statusLabel.textContent = statusLabelText;
  } catch (error) {
    console.error('ラベルのテキスト取得中にエラーが発生しました:', error);
    throw error;
  }
};
