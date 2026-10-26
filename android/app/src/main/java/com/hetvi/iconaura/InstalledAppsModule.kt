package com.hetvi.iconaura

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


class InstalledAppsModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val packageManager: PackageManager = reactContext.packageManager

  override fun getName(): String = "InstalledApps"

  
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

  @ReactMethod
  fun getAllInstalledApps(promise: Promise) {
    try {
      val result: WritableArray = WritableNativeArray()
      val apps = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        packageManager.getInstalledApplications(PackageManager.GET_META_DATA)
      } else {
        @Suppress("DEPRECATION")
        packageManager.getInstalledApplications(PackageManager.GET_META_DATA)
      }

      for (appInfo in apps) {
        val packageName = appInfo.packageName
        val launchIntent = getLaunchIntentForApp(packageName)

        if (launchIntent != null) {
          val appMap: WritableMap = WritableNativeMap()
          appMap.putString("id", packageName) 
          appMap.putString("packageName", packageName)
          appMap.putString("appName", appInfo.loadLabel(packageManager).toString())
          appMap.putBoolean("installed", true)
          appMap.putBoolean("launchable", true)
          result.pushMap(appMap)
        }
      }
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("ERROR", "Failed to get all installed apps: ${e.message}")
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
