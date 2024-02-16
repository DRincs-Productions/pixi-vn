# Use Electron

## Errors and Solutions

### Error: Cannot find module @rollup/rollup-win32-x64-msvc

In Windows, when you start a new Electron project, you may encounter the following error:

```bash
Error: Cannot find module @rollup/rollup-win32-x64-msvc
```

To fix this error, run the following command:

```bash
npm install @rollup/rollup-win32-x64-msvc

```

### error while loading shared libraries: libnss3.so: cannot open shared object file: No such file or directory

In Linux, when you run an Electron app, you may encounter the following error:

```bash
error while loading shared libraries: libnss3.so: cannot open shared object file: No such file or directory
```

To fix this error, try these command:

```bash
apt install libnss
apt install libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev

```

if the above commands didn't work then go for the below one

```bash
sudo apt install libgconf-2-4 libatk1.0-0 libatk-bridge2.0-0 libgdk-pixbuf2.0-0 libgtk-3-0 libgbm-dev libnss3-dev libxss-dev

```

### error while loading shared libraries: libasound.so.2: cannot open shared object file: No such file or directory

In Linux, when you run an Electron app, you may encounter the following error:

```bash
error while loading shared libraries: libasound.so.2: cannot open shared object file: No such file or directory
```

To fix this error, run the following command:

```bash
sudo apt-get install libasound2

```
