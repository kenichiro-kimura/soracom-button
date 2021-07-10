# SORACOM LTE-M Button for Enterprise Simulator

This is a [SORACOM LTE-M Button for Enterprise](https://users.soracom.io/ja-jp/guides/iot-devices/lte-m-button-enterprise/) simulator applicaton works on Windows and Mac.

Currently, the text in the application is only available in Japanese.

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


## How to use

### Preparing for SORACOM

Make sure that the PC you will be running on has access to the SORACOM platform using SORACOM Air ,etc.
Also, make sure that SORACOM Harvest is enabled in the SIM group to which the SIM used for the connection belongs in order to check the incoming data.

Reference:
- [Using SORACOM Air with various devices](https://users.soracom.io/ja-jp/guides/devices/general/)
- [SORACOM Harvest](https://soracom.jp/services/harvest/)

### Startup

When you start the software, the main window will open as shown below.

![](img/app-image.png)

### Quit
Select [Exit] > [File] menu.

### Send data.

- Click the button (big circle on the left).
- As with the LTE-M Button, you can single click, double click, or long click.
- To long click, press the button for more than 1 second, and then release the mouse button (Unlike LTE-M Button, it does not work if the button is left pressed.)

When you click the button, you will see "(SINGLE/DOUBLE/LONG) SENDING" in the "Transmission Status" section at the bottom left, and the LED (small circle on the right) will blink orange.

It takes about 5 seconds to complete the transmission, depending on the network condition, and the LED will turn red if the transmission is successful or green if it fails. If the transmission is successful, the LED will turn red; if it fails, the LED will turn green, and the result will be displayed in the "Transmission Status" section as "Transmission Complete (Success/Failure)".

### Check the data.

From the [SORACOM User Console](https://console.soracom.io), go to [Data Collection, Storage, and Visualization] > [SORACOM Harvest Data] to check the data.

### Change the look and feel.

Select [View] > [Style] > [UG Version] to change the button to the version with the SORACOM UG sticker on it. The behavior will not change.

Select [View] > [Size] > [Large/Middle/Smaill] to change the size of button.

![](img/app-image-ug.png)

### Check the data without sending it to the SORACOM platform

If you want to check the data without sending it to the SORACOM platform, create an endpoint that can accept JSON data POST using [Mockbin](https://mockbin.org/), etc., and modify the configuration file.
The configuration file is `c:/Users/(user name)/AppData/Roaming/soracom-button/config.json` on Windows, and ` ~/Library/Application Support/soracom-button/config.json` on a Mac.

```json
{
        "endpoint": "http://uni.soracom.io"
}
```

Please modify the value of "endpoint" in this file.

# Contact us

If you tweet on Twitter with the hashtag `#soracomug`, the author or some member from SORACOM UserGroup will probably respond, but it's best effort, so please be patient for the answer.

If you want to improve a feature, please create an issue or send us a pull request.
