# SORACOM LTE-M Button for Enterprise Simulator

This is a [SORACOM LTE-M Button for Enterprise](https://users.soracom.io/ja-jp/guides/iot-devices/lte-m-button-enterprise/) simulator application that works on Windows and Mac.
## How to install 

Download and run the binary that matches your environment from the release page.

##  How to build

Clone the complete source tree.

Install Node.js and execute the following command.

```bash
% npm install
% npm run build-win64
```

For Windows(32bit),use `npm run build-win32`, and for Mac, use`npm run build-mac`

Executable files will be created under the `dist` folder.

If you want to use SORACOM Arc Integration with libsoratun, build [libsoratun](https://github.com/kenichiro-kimura/libsoratun) and copy `lib/shared/libsoratun.*` to the `dist` folder, then rebuild this project.

## How to use

### Preparing for SORACOM

By using the SORACOM Arc Integration feature, you can send data to the SORACOM platform with just this application, without needing to use WireGuard or other tools separately.  
Obtain the WireGuard configuration of an existing or newly created SORACOM Arc virtual SIM, open the settings screen from the [File] > [WireGuard config] menu, paste the configuration as is, and press [OK].  
Alternatively, after launching the application once, open the generated `config.json` file and add the following settings:

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

The `config.json` file will be created in `%APPDATA%\soracom-button` on Windows, and in `~/Library/Application Support/soracom-button` on Mac.

If you do not use (or cannot use) the SORACOM Arc Integration feature, please make sure that the PC running this application can access the SORACOM platform using SORACOM Air or SORACOM Arc.

Also, make sure that SORACOM Harvest is enabled in the SIM group to which the SIM used for the connection belongs in order to check the incoming data.

Reference:
- [Connection Guides](https://developers.soracom.io/en/start/#connection-guides)
- [SORACOM Arc](https://developers.soracom.io/en/docs/arc/)
- [SORACOM Harvest](https://developers.soracom.io/en/docs/harvest/)

### Startup

When you start the software, the main window will open as shown below.

![](img/app-image.png)

### Quit
Select [File] > [Exit] menu.

### Send data.

- Click the button (big circle on the left).
- As with the LTE-M Button, you can single click, double click, or long click.
- To long click, press the button for more than 1 second, and then release the mouse button (Unlike LTE-M Button, it does not work if the button is left pressed.)

When you click the button, you will see "(SINGLE/DOUBLE/LONG) SENDING" in the "Transmission Status" section at the bottom left, and the LED (small circle on the right) will blink orange.

It takes about 5 seconds to complete the transmission, depending on the network condition, and the LED will turn red if the transmission is successful or green if it fails. If the transmission is successful, the LED will turn red; if it fails, the LED will turn green, and the result will be displayed in the "Transmission Status" section as "Transmission Complete (Success/Failure)".

### Check the data.

From the [SORACOM User Console](https://console.soracom.io), go to [Data Collection, Storage, and Visualization] > [SORACOM Harvest Data] to check the data.

### Change the display language

Select [View] > [language]. The supported languages are as follows.

- English
- Japanese
- Chinese (Simplified)
- Korean
- Spanish
- Deutsch
- French

The default is English. Also, since machine translation is used for translation, the translation may not be accurate.

### Change the look and feel.

Select [View] > [Sticker] > [UG Version] to change the button to the version with the SORACOM UG sticker on it. The behavior will not change.

Select [View] > [Size] > [Large/Middle/Smaill] to change the size of button.

![](img/app-image-ug.png)

## Acknowledgements

I would like to express our deepest gratitude to [0x6b](https://github.com/0x6b/), the developer of the libsoratun library, for making SORACOM Arc Integration possible.  
Thanks to this library, it became easy and secure to connect to SORACOM Arc from the application.  
We sincerely appreciate your contribution.

## Contact us

If you tweet on Twitter with the hashtag `#soracomug`, the author or some member from SORACOM UserGroup will probably respond, but it's best effort, so please be patient for the answer.

If you want to improve a feature, please create an issue or send us a pull request.
