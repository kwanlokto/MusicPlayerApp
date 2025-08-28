# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).


# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 0: Getting started: Install Node AND Java Development Kit
```sh
nvm install v24.6.0
nvm use v24.6.0

sudo apt update
sudo apt install openjdk-17-jdk

java -version
javac -version
echo "export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64" >> ~/.bashrc
echo "export PATH=\$JAVA_HOME/bin:\$PATH" >> ~/.bashrc
source ~/.bashrc
```
Download and install [Android Studio](https://developer.android.com/studio)
```sh
cd ~/Downloads
unzip android-studio-*.zip -d ~/android-studio
~/android-studio/android-studio/bin/studio.sh

# Add env variables
echo "export ANDROID_HOME=$HOME/Android/Sdk" >> ~/.bashrc
echo "export PATH=$PATH:$ANDROID_HOME/emulator" >> ~/.bashrc
echo "export PATH=$PATH:$ANDROID_HOME/tools" >> ~/.bashrc
echo "export PATH=$PATH:$ANDROID_HOME/tools/bin" >> ~/.bashrc
echo "export PATH=$PATH:$ANDROID_HOME/platform-tools" >> ~/.bashrc
source ~/.bashrc
```

## Step 1: Install dependencies
```bash
npm install
```

## Step 2: Start the app

```bash
npx expo start
```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
