# RS-App
Electron app for desktop streaming on [robotstreamer.com](http://robotstreamer.com)

## How to use
#### You will need
- OBS-Studio  https://obsproject.com/ 

#### Setup
- RS-App
  - change your `robotid` `cameraid` and `streamkey`
  - set all switches to `On`
  - see if robot is online
- OBS-Studio:
  - open `Settings > Stream `
    - set to `Custom server`
      - server: `rtmp://localhost/live`
      - key: `cam`
  - Hit: `start streaming` button in OBS

# Development
You will need NodeJS v8.0+

#### Install Dependencies
`npm i`
#### Run the Electron App
`npm start`
#### Building
Scripts for building depending on target system:  
`npm run package-win`  
`npm run package-mac`  
`npm run package-linux`  

Will save into `/release-builds`
