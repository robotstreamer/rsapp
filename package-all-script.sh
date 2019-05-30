#!/bin/bash

C1="\e[31m"
C2="\e[33m"
C3="\e[32m"
CE="\e[0m"

VERSION="v$1"
TARGET_MAC=./release-builds/rsapp-mac-$VERSION.tar.gz
TARGET_WIN=./release-builds/rsapp-win-$VERSION.tar.gz
TARGET_LINUX=./release-builds/rsapp-linux-$VERSION.tar.gz

echo -e ${C1}Building version:${CE} $VERSION
echo '---'

echo -e ${C2}Installing npm packages...${CE}
npm i
echo '---'

CURRENT_TARGET=${C3}"MAC"${CE}

echo -e ${CURRENT_TARGET}:${C2}Creating Package...${CE}
electron-packager . --overwrite --platform=darwin --arch=x64 --icon=assets/icons/mac/icon.icns --prune=true --out=release-builds

echo -e ${CURRENT_TARGET}:${C2}Removing unused ffmpeg-static files...${CE}
rm -rf ./release-builds/rsapp-darwin-x64/rsapp.app/Contents/Resources/app/node_modules/ffmpeg-static/bin/{linux,win32}

echo -e ${CURRENT_TARGET}:${C2}Compressing package...${CE}
tar -czf $TARGET_MAC --overwrite ./release-builds/rsapp-darwin-x64

echo -e ${CURRENT_TARGET}:${C3}Created file:${CE} ${TARGET_MAC}
echo '---'


CURRENT_TARGET=${C3}"WIN"${CE}

echo -e ${CURRENT_TARGET}:${C2}Creating Package...${CE}
electron-packager . --overwrite --asar=false --platform=win32 --arch=ia32 --icon=assets/icons/win/icon.ico --prune=true --out=release-builds --version-string.CompanyName=CE --version-string.FileDescription=CE --version-string.ProductName=\"rsapp\"

echo -e ${CURRENT_TARGET}:${C2}Removing unused ffmpeg-static files...${CE}
rm -rf ./release-builds/rsapp-win32-ia32/resources/app/node_modules/ffmpeg-static/bin/{linux,darwin}

echo -e ${CURRENT_TARGET}:${C2}Compressing package...${CE}
tar -czf $TARGET_WIN --overwrite ./release-builds/rsapp-win32-ia32

echo -e ${CURRENT_TARGET}:${C3}Created file:${CE} ${TARGET_WIN}
echo '---'


CURRENT_TARGET=${C3}"LINUX"${CE}

echo -e ${CURRENT_TARGET}:${C2}Creating Package...${CE}
electron-packager . --overwrite --platform=linux --arch=x64 --icon=assets/icons/png/icon.png --prune=true --out=release-builds

echo -e ${CURRENT_TARGET}:${C2}Removing unused ffmpeg-static files...${CE}
rm -rf ./release-builds/rsapp-linux-x64/resources/app/node_modules/ffmpeg-static/bin/{darwin,win32}

echo -e ${CURRENT_TARGET}:${C2}Compressing package...${CE}
tar -czf $TARGET_LINUX --overwrite ./release-builds/rsapp-linux-x64

echo -e ${CURRENT_TARGET}:${C3}Created file:${CE} ${TARGET_WIN}
echo '---'





#npm run package-win
#npm run package-linux
