# 🚀 Welcome to Your Expo App

This is an [Expo](https://expo.dev) project bootstrapped with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

---

## 📦 Getting Started

> **Note**: Before proceeding, ensure you’ve completed the [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment).

---

## 🛠 Step 0: Install Prerequisites

### Install Node.js (using `nvm`)
```sh
nvm install v24.6.0
nvm use v24.6.0
```

### Install Java Development Kit (JDK 17)
```sh
sudo apt update
sudo apt install openjdk-17-jdk

java -version
javac -version
```

Add environment variables:
```sh
echo "export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64" >> ~/.bashrc
echo "export PATH=\$JAVA_HOME/bin:\$PATH" >> ~/.bashrc
source ~/.bashrc
```

### Install Android Studio
[Download Android Studio](https://developer.android.com/studio), then set up environment variables:

```sh
cd ~/Downloads
unzip android-studio-*.zip -d ~/android-studio
~/android-studio/android-studio/bin/studio.sh

# Add environment variables
echo "export ANDROID_HOME=$HOME/Android/Sdk" >> ~/.bashrc
echo "export PATH=$PATH:$ANDROID_HOME/emulator" >> ~/.bashrc
echo "export PATH=$PATH:$ANDROID_HOME/tools" >> ~/.bashrc
echo "export PATH=$PATH:$ANDROID_HOME/tools/bin" >> ~/.bashrc
echo "export PATH=$PATH:$ANDROID_HOME/platform-tools" >> ~/.bashrc
source ~/.bashrc
```

---

## 📥 Step 1: Install Dependencies
```sh
npm install
```

---

## 🏗 Step 2: Create a Development Build
```sh
eas build --platform android --profile development
```

You only need to rebuild when a **native-related change** occurs.

### 🔁 When to Rebuild

#### 🔧 Native Code Changes
- Added/removed/updated an **Expo config plugin**.  
- Installed or upgraded a package with **native code** (e.g. `react-native-track-player`, `react-native-reanimated`).  
- Made manual changes inside the `android/` directory.  
- Upgraded/downgraded **Expo SDK**.  

#### ⚙️ Build Profile Changes (`eas.json`)
- Switched between profiles (e.g. `development → preview → production`).  
- Changed flags like `developmentClient: true`.  
- Added environment variables affecting the build.  

#### 📱 Config Changes
- Edited `app.json` / `app.config.js` (e.g. `android.package`, `permissions`, `versionCode`, `scheme`, `intentFilters`).  
- Changed **Gradle/Kotlin/Java versions**.  

#### 🆕 First-Time Setup
- When generating your dev client for the first time (`--profile development`).  

---

## ▶️ Step 3: Start the App
```sh
npx expo start
```