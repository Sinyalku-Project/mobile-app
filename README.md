# 📡 SinyalKu – Mobile App

SinyalKu mobile app is a React Native mobile application designed to monitor and record mobile network quality (signal strength, location, and operator info) in real time.  
It collects data every 30 seconds and sends it to the backend API for building better coverage maps.

---

## 🚀 Features

- **User Authentication**
  - Login & Register screens using **JWT tokens** stored in `AsyncStorage`.
- **Signal Monitoring**
  - Retrieves **real signal strength (dBm)** via a custom native module (`SignalStrengthModule`).
- **Location Tracking**
  - Uses `react-native-geolocation-service` to get precise GPS coordinates.
- **Operator Detection**
  - Automatically detects SIM carrier name using `react-native-device-info`.
- **Background Interval Tracking**
  - Collects and uploads data every 30 seconds while tracking is active.
- **Secure API Communication**
  - Sends readings to backend API with `Bearer` token authentication.

---

## 🛠 Tech Stack

- **React Native** (TypeScript)
- **Native Android (Java/Kotlin)** for signal strength module
- **Axios** – API requests
- **AsyncStorage** – token storage
- **react-native-geolocation-service** – location access
- **react-native-device-info** – carrier info
- **react-native-gesture-handler** – touch interactions
- **react-native-vector-icons** – UI icons

---

## 📂 Project Structure

```
mobile-app/
├── android/                  # Native Android project
│   ├── app/src/main/
|   │   ├── java/com/sinyalkuapp/
|   │   │   ├── MainActivity.kt
|   │   │   ├── MainApplication.kt
|   │   │   ├── SignalStrengthModule.java
|   │   │   ├── SignalStrengthPackage.kt
│   │   └── AndroidManifest.xml
│   ├── build.gradle
│   ├── gradle.properties
│   ├── gradlew
│   ├── gradlew.bat
│   └── settings.gradle
├── src/screens/              # App screens
│   ├── HomeScreen.tsx        # Main dashboard
│   ├── LoginScreen.tsx       # User login
│   ├── RegisterScreen.tsx    # User registration
├── App.tsx                   # App entry point
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Setup & Installation

1️⃣ **Clone the repository**
```sh
git clone https://github.com/Sinyalku-Project/mobile-app.git
cd mobile-app
```

2️⃣ **Install dependencies**
```sh
npm install
# or
yarn install
```

3️⃣ **Run on Android**
```sh
npx react-native run-android
```

---

## 🔑 Update backend API

Change
```
API_BASE_URL=http://<your-api-server>:8000
```

---

## 📱 Usage

1. **Login/Register** – Create an account or log in.
2. **Start Tracking** – Press **Start Tracking** to collect signal & location data every 30 seconds.
3. **Stop Tracking** – Press **Stop Tracking** to end monitoring.

---
## 📦 APK Release & Download

The latest SinyalKu APK is built and released for direct installation on Android devices.
You can find it after building the project at:

`mobile-app\android\app\build\outputs\apk\release\app-release.apk`

To install:
1. Transfer app-release.apk to your Android device.
2. Enable Install from Unknown Sources in device settings.
3. Tap the APK file to install.
---

## 🛠 Development Notes

- **SignalStrengthModule** (Java/Kotlin) is implemented in `android/app/src/main/java/com/sinyalkuapp/`.
- Uses **CMake** for native builds (new architecture ready).
- Requires Android SDK 24+ and NDK for native module compilation.

---

## 📜 License

MIT License © 2025 – Albert
