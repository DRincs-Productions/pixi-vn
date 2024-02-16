
# Windows Error
Error: Cannot find module @rollup/rollup-win32-x64-msvc.

npm install @rollup/rollup-win32-x64-msvc

# Linux Error
error while loading shared libraries: libnss3.so: cannot open shared object file: No such file or directory

try these command

apt install libnss

apt install libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev

if the above commands didn't work then go for the below one

sudo apt install libgconf-2-4 libatk1.0-0 libatk-bridge2.0-0 libgdk-pixbuf2.0-0 libgtk-3-0 libgbm-dev libnss3-dev libxss-dev




error while loading shared libraries: libasound.so.2: cannot open shared object file: No such file or directory

sudo apt-get install libasound2
