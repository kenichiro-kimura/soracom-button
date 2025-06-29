# SORACOM LTE-M Button for Enterprise シミュレータ

Windows/Macで動く[SORACOM LTE-M Button for Enterprise](https://users.soracom.io/ja-jp/guides/iot-devices/lte-m-button-enterprise/)シミュレータアプリです。

## インストール方法

リリースページから環境に合わせたバイナリをダウンロードして実行してください。Windowsの実行形式がダウンロードできない場合は、同名のzipファイルをダウンロードしてください。

## ビルド方法

ソースツリー一式をcloneします。

Node.jsをインストールし、以下のコマンドを実行します。

```bash
% npm install
% npm run build-win64
```

Windows(32bit)の場合は`npm run build-win32`、Macの場合は`npm run build-mac`としてください。

distフォルダ以下に実行用ファイルが作成されます。

libsoratunによるSORACOM Arc Integrationを利用する場合は、[libsoratun](https://github.com/kenichiro-kimura/libsoratun)をビルドし、`lib/shared/libsoratun.*`を`dist`フォルダにコピーしてから再度本プロジェクトをビルドしてください。

## 使い方

### SORACOMの準備

SORACOM Arc Integration機能を利用することで、WireGuardなどを別途利用することなく、本アプリケーションだけでSORACOMプラットフォームにデータを送信することもできます。  
既存または新規で作成したSORACOM ArcのバーチャルSIMのWireGuard設定を取得し、メニューの [file] > [WireGuard config] で開いた設定画面でそのまま貼り付けて [OK]を押してください。  
または、一度起動した後に作成される`config.json`を開き、以下の設定を追加してください。  
`config.json`は、Windowsの場合は`%APPDATA%\soracom-button`に、Macの場合は`~/Library/Application Support/soracom-button`に作成されます。

```json
{
  ....
  "privateKey": "YOUR-PRIVATE-KEY",
  "logLevel": 0,
  "serverPeerPublicKey": "YOUR-SERVER-PUBLIC-KEY",
  "serverEndpoint": "xxxx.arc.soracom.io:11010",
  "allowedIPs": [
    "100.127.0.0/21",
    ....
  ],,
  "clientPeerIpAddress": "YOUR-CLIENT-PEER-IP-ADDRESS"
}
```

SORACOM Arc Integration機能を利用しない(利用できない)場合、本アプリケーションを実行するPCを、SORACOM AirまたはSORACOM Arcを用いてSORACOMプラットフォームにアクセスできるようにしておいてください。

また、受信データを確認するために、接続に利用しているSIMの所属するSIMグループでSORACOM Harvestを有効にしておいてください。

参考:
- [各種デバイスでSORACOM Airを使用する](https://users.soracom.io/ja-jp/guides/devices/general/)
- [SORACOM Arc](https://users.soracom.io/ja-jp/docs/arc/)
- [SORACOM Harvest](https://soracom.jp/services/harvest/)

### 起動

ソフトを起動すると以下のようにメインウインドウが開きます。

![](img/app-image.png)

### 表示言語の切り替え

[View] > [language]から表示言語を切り替えられます。対応している言語は以下の通りです。

- 英語
- 日本語
- 中国語(簡体字)
- 韓国語
- スペイン語
- ドイツ語
- フランス語

デフォルトは英語です。また、翻訳は機械翻訳を利用しているため、正確な翻訳でない場合があります。


### 終了
[ファイル] > [終了]を選びます

### データを送信する

- ボタン(左の大きな丸)をクリックします
- LTE-M Buttonと同じくシングルクリック・ダブルクリック・ロングクリックができます
- ロングクリックは1秒以上押してからマウスのボタンを放してください(LTE-M Buttonと違い押しっぱなしでは動作しません。)

ボタンをクリックすると、左下の「送信状況」の所に「(SINGLE/DOUBLE/LONG)送信中」と出て、LED(右の小さな丸)がオレンジに点滅します。

ネットワークの状況にも因りますが5秒ほどで送信が完了し、送信に成功すればLEDが赤に、失敗すれば緑に点灯します。そして、「送信状況」の所に「送信完了(成功/失敗)」と、結果が表示されます。

### データを確認する

[SORACOMのユーザコンソール](https://console.soracom.io)から[データ収集・蓄積・可視化]→[SORACOM Harvest Data]に進み、確認します。

### 見た目を変更する

[表示] > [ステッカー] > [UGバージョン]を選ぶと、SORACOM UGのステッカーを貼ったバージョンのボタンに変わります。動作は変わりません。

[表示] > [サイズ] > [大/中/小]を選ぶと、サイズが変わります(デフォルト：大)

![](img/app-image-ug.png)

## 謝辞

SORACOM Arc Integrationの実現にあたり、[0x6b](https://github.com/0x6b/)氏が開発されたlibsoratunライブラリに多大な恩恵を受けました。  
このライブラリのおかげで、アプリケーションから簡単にSORACOM Arcへの接続が可能となりました。  
心より感謝申し上げます。

## お問い合わせ

Twitterでハッシュタグ`#soracomug`をつけて呟くと作者かSORACOM UGの人が反応すると思いますがベストエフォートになりますので回答は気長に待ってください。

機能改善等はIssueあげるかプルリク送ってください。
