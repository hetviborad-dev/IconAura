package com.iconaura

import android.content.pm.PackageManager
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap

/**
 * Native module for detecting installed applications on the device.
 *
 * Handles package visibility requirements for Android 11+ (API 30+).
 * Uses the QUERY_ALL_PACKAGES permission to support app detection across all scenarios.
 */
class InstalledAppsModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val packageManager: PackageManager = reactContext.packageManager

  override fun getName(): String = "InstalledApps"

  /**
   * Gets installation status of supported applications.
   *
   * @param appPackageNames Array of package names to check
   * @param promise Promise to resolve with app installation status
   */
  @ReactMethod
  fun getInstalledApps(appPackageNames: com.facebook.react.bridge.ReadableArray, promise: Promise) {
    try {
      val result: WritableArray = WritableNativeArray()

      for (i in 0 until appPackageNames.size()) {
        val packageData = appPackageNames.getMap(i)
        val id = packageData?.getString("id") ?: continue
        val packageName = packageData.getString("packageName") ?: continue
        val appName = packageData.getString("appName") ?: ""

        val launchIntent = getLaunchIntentForApp(packageName)

        val appInfo: WritableMap = WritableNativeMap()
        appInfo.putString("id", id)
        appInfo.putString("packageName", packageName)
        appInfo.putString("appName", appName)
        appInfo.putBoolean("installed", launchIntent != null)
        appInfo.putBoolean("launchable", launchIntent != null)

        result.pushMap(appInfo)
      }

      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("ERROR", "Failed to get installed apps: ${e.message}")
    }
  }

  private fun getLaunchIntentForApp(packageName: String): android.content.Intent? {
    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        packageManager.getPackageInfo(packageName, PackageManager.PackageInfoFlags.of(0))
      } else {
        @Suppress("DEPRECATION")
        packageManager.getPackageInfo(packageName, 0)
      }
      packageManager.getLaunchIntentForPackage(packageName)
    } catch (_: PackageManager.NameNotFoundException) {
      null
    } catch (_: Exception) {
      null
    }
  }

}
