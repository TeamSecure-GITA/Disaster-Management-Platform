# 📱 Disaster Sentinel — Android APK Build & Deployment Guide

This guide explains how to build and package the **Disaster Sentinel Mobile App** (`mobile/`) into a standalone **`.apk`** file installable on any Android smartphone or tablet.

---

## ⚡ Method 1: 1-Click Free GitHub Actions Build (Recommended — No Local Setup)

A production-ready GitHub Actions workflow is provided at [`.github/workflows/build-android-apk.yml`](../.github/workflows/build-android-apk.yml).

### Steps to build:
1. Push your repository to GitHub.
2. In your GitHub repository, navigate to the **Actions** tab.
3. In the left sidebar, click **Build Android APK**.
4. Click **Run workflow**:
   - Branch: `main`
   - Build Type: `release` (or `debug`)
5. Click **Run workflow**.
6. The workflow will automatically:
   - Set up Java 17 and the Android SDK
   - Install mobile dependencies
   - Run `expo prebuild` to generate native Android source
   - Compile the standalone `.apk` using Gradle
   - Upload the downloadable `.apk` to the workflow run.
7. Once finished (typically 4–7 minutes), scroll to the **Artifacts** section at the bottom of the run page and click **`disaster-sentinel-release-apk`** to download your ready-to-install `.apk`!

---

## ☁️ Method 2: EAS Cloud Build (Expo Application Services)

Expo provides the EAS Build cloud service to compile APKs directly without requiring a local Android SDK.

### Steps:
1. Open your terminal in the `mobile` folder:
   ```bash
   cd mobile
   ```

2. Log into your free Expo account (create one at [expo.dev](https://expo.dev) if you don't have one):
   ```bash
   npx eas-cli login
   ```

3. Initialize your project ID:
   ```bash
   npx eas-cli project:init
   ```

4. Build the standalone `.apk`:
   ```bash
   npm run build:apk
   # Or directly:
   npx eas-cli build --platform android --profile apk
   ```

5. When the build finishes, EAS will output:
   - A direct download link for the `.apk`
   - A QR code you can scan with your phone camera to download and install immediately.

---

## 💻 Method 3: Local Offline Build with Gradle

If you have **Android Studio** or the **Android SDK** installed locally on your machine:

### Prerequisites:
- JDK 17 (verified installed: OpenJDK 21/17)
- Android SDK (`ANDROID_HOME` pointing to your SDK path, e.g. `export ANDROID_HOME=$HOME/Android/Sdk`)
- Android build tools and platform `android-34`

### Steps:
1. Navigate to the mobile directory and install dependencies:
   ```bash
   cd mobile
   npm install
   ```

2. Generate the native Android project:
   ```bash
   npx expo prebuild --platform android --clean
   ```

3. Compile the APK using the Gradle wrapper:
   - **For Debug APK** (testing and sideloading without signing keys):
     ```bash
     cd android
     ./gradlew assembleDebug
     ```
     Output location:
     `mobile/android/app/build/outputs/apk/debug/app-debug.apk`

   - **For Release APK**:
     ```bash
     cd android
     ./gradlew assembleRelease
     ```
     Output location:
     `mobile/android/app/build/outputs/apk/release/app-release-unsigned.apk` (or signed if keystore configured)

---

## 📲 How to Install the `.apk` on Your Android Phone

1. **Transfer the `.apk`**:
   - Download the `.apk` from GitHub Actions, EAS, or copy from your computer via USB, Google Drive, WhatsApp, or Telegram.
2. **Enable Unknown Apps**:
   - When tapping the downloaded `.apk`, Android may ask: *"For your security, your phone is not allowed to install unknown apps from this source."*
   - Tap **Settings** and toggle on **Allow from this source**.
3. **Install**:
   - Tap **Install** and open **Disaster Sentinel**!

---

## ⚙️ Configuration Files Reference

- **[eas.json](eas.json)**:
  Contains the `apk` and `preview` profiles configured with `"buildType": "apk"`.
- **[app.json](app.json)**:
  Configured with package name `com.disastermanagement.sentinel`, icons, splash screens, permissions, and plugins.
- **[package.json](package.json)**:
  Provides quick npm build scripts (`npm run build:apk`, `npm run prebuild`).
- **[.github/workflows/build-android-apk.yml](../.github/workflows/build-android-apk.yml)**:
  Automated GitHub Actions CI/CD workflow to compile APKs on the cloud for free.
