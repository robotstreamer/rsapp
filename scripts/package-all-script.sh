#!/bin/bash

C1="\033[0;31m"
C2="\033[1;33m"
C3="\033[0;32m"
CE="\033[0m"

VERSION="v$1"
TARGET_MAC=rsapp-mac-$VERSION
TARGET_WIN=rsapp-win-$VERSION
TARGET_LINUX=rsapp-linux-$VERSION

cd ..
pwd

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
cd ./release-builds
if [ -e "$TARGET_MAC.tar.gz" ]; then
    rm "$TARGET_MAC.tar.gz"
fi
if [ -d "$TARGET_MAC" ]; then
    rm -rf "./$TARGET_MAC"
fi
ls
echo moving
mv rsapp-darwin-x64 $TARGET_MAC
ls
echo renaming
mv $TARGET_MAC/rsapp.app $TARGET_MAC/$TARGET_MAC.app
ls
echo compressing
tar -czf $TARGET_MAC.tar.gz $TARGET_MAC
cd ..

echo -e ${CURRENT_TARGET}:${C3}Created file:${CE} ${TARGET_MAC}.tar.gz
echo '---'


CURRENT_TARGET=${C3}"WIN"${CE}

echo -e ${CURRENT_TARGET}:${C2}Creating Package...${CE}
electron-packager . --overwrite --asar=false --platform=win32 --arch=ia32 --icon=assets/icons/win/icon.ico --prune=true --out=release-builds --version-string.CompanyName=CE --version-string.FileDescription=CE --version-string.ProductName=\"rsapp\"

echo -e ${CURRENT_TARGET}:${C2}Removing unused ffmpeg-static files...${CE}
rm -rf ./release-builds/rsapp-win32-ia32/resources/app/node_modules/ffmpeg-static/bin/{linux,darwin}

echo -e ${CURRENT_TARGET}:${C2}Compressing package...${CE}
cd ./release-builds
if [ -e "$TARGET_WIN.zip" ]; then
     rm "$TARGET_WIN.zip"
fi
if [ -d "$TARGET_WIN" ]; then
    rm -rf "./$TARGET_WIN"
fi
mv rsapp-win32-ia32 $TARGET_WIN
mv $TARGET_WIN/rsapp.exe $TARGET_WIN/$TARGET_WIN.exe
mv $TARGET_WIN/resources/app/espeak.exe $TARGET_WIN/espeak.exe
zip -r $TARGET_WIN.zip $TARGET_WIN
cd ..

echo -e ${CURRENT_TARGET}:${C3}Created file:${CE} ${TARGET_WIN}.tar.gz
echo '---'


CURRENT_TARGET=${C3}"LINUX"${CE}

echo -e ${CURRENT_TARGET}:${C2}Creating Package...${CE}
electron-packager . --overwrite --platform=linux --arch=x64 --icon=assets/icons/png/icon.png --prune=true --out=release-builds

echo -e ${CURRENT_TARGET}:${C2}Removing unused ffmpeg-static files...${CE}
rm -rf ./release-builds/rsapp-linux-x64/resources/app/node_modules/ffmpeg-static/bin/{darwin,win32}

echo -e ${CURRENT_TARGET}:${C2}Compressing package...${CE}
cd ./release-builds
if [ -e "$TARGET_LINUX.tar.gz" ]; then
     rm "$TARGET_LINUX.tar.gz"
fi
if [ -d "$TARGET_LINUX" ]; then
    rm -rf "./$TARGET_LINUX"
fi

mv rsapp-linux-x64 $TARGET_LINUX
mv $TARGET_LINUX/rsapp $TARGET_LINUX/$TARGET_LINUX
rm $TARGET_LINUX.tar.gz
tar -czf $TARGET_LINUX.tar.gz $TARGET_LINUX
cd ..

echo -e ${CURRENT_TARGET}:${C3}Created file:${CE} ${TARGET_WIN}.tar.gz
echo '---'
