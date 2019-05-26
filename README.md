# RS-App
Electron app for desktop streaming on [robotstreamer.com](http://robotstreamer.com)

## How to use
#### You will need
- OBS-Studio  https://obsproject.com/   
- espeak (see instructions below)

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

---

## espeak installation
### MacOS/OSX:
If you want to use espeak on a mac you will have to install it first.
The simplest way is to use [homebrew](https://brew.sh).

You need to open a Terminal window (hit CMD-Space and type: terminal) and paste the following commands: 

1. Install homebrew:  
`/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`  
*Note: If it asks for a password, use the one you use to log into your computer (it will not show any characters)*
  
2. Update homebrew:  
`brew update`
  
3. Finally, install espeak:  
`brew install espeak`
  
4. Test if it works:  
`espeak "hello world"`

5. Close the terminal or type:  
`exit`

### Linux/Debian
`sudo apt-get install espeak`

### Windows
espeak is already included in this application.

--- 

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

##### TODO:
- propper build script
 - build all for all OS's
 - remove unused ffmpeg-static binaries per OS
 - zip
 - rename zip with version number
