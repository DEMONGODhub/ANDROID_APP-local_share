import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.localshare.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.localshare.app"
        minSdk = 21            // Android 5.0+ (covers ~99% of devices)
        targetSdk = 35
        versionCode = 69
        versionName = "2.44.1"
    }

    // Release signing: your own keystore via keystore.properties (kept out of git), or GitHub-secret env vars. Neither set = unsigned.
    signingConfigs {
        val kp = Properties().apply { rootProject.file("keystore.properties").takeIf { it.exists() }?.inputStream()?.use { load(it) } }
        val ks = kp.getProperty("storeFile") ?: System.getenv("KEYSTORE_FILE")
        if (ks != null) create("release") {
            storeFile = rootProject.file(ks)
            storePassword = kp.getProperty("storePassword") ?: System.getenv("KEYSTORE_PASSWORD")
            keyAlias = kp.getProperty("keyAlias") ?: System.getenv("KEY_ALIAS")
            keyPassword = kp.getProperty("keyPassword") ?: System.getenv("KEY_PASSWORD")
        }
    }

    buildTypes {
        release {
            signingConfigs.findByName("release")?.let { signingConfig = it }
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures { compose = true }
    androidResources { noCompress += listOf("js", "html") }
    packaging { resources.excludes += setOf("/META-INF/{AL2.0,LGPL2.1}", "/META-INF/*.version", "DebugProbesKt.bin", "kotlin-tooling-metadata.json") }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.12.01")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.animation:animation")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.documentfile:documentfile:1.0.1")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    implementation("androidx.profileinstaller:profileinstaller:1.4.1")
    implementation("com.google.zxing:core:3.5.3")
    implementation("com.google.android.gms:play-services-code-scanner:16.1.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
}
