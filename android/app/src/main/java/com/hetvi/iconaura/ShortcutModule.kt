package com.hetvi.iconaura

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.drawable.Icon
import android.os.Build
import android.util.Log
import android.appwidget.AppWidgetManager
import com.hetvi.iconaura.widgets.WidgetConfig
import com.hetvi.iconaura.widgets.WidgetConfigManager
import com.hetvi.iconaura.widgets.SquareIconWidgetProvider
import androidx.core.content.pm.ShortcutInfoCompat
import androidx.core.content.pm.ShortcutManagerCompat
import androidx.core.graphics.drawable.IconCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File


class ShortcutModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val packageManager: PackageManager = reactContext.packageManager
  private val context: Context = reactContext

  companion object {
    private const val TAG = "IconAura.Shortcut"
    private const val ACTION_SHORTCUT_ADDED = "com.hetvi.iconaura.SHORTCUT_ADDED"
  }

  init {
    val receiver = object : BroadcastReceiver() {
      override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == ACTION_SHORTCUT_ADDED) {
          val shortcutId = intent.getStringExtra("shortcutId")
          Log.i(TAG, "Shortcut successfully pinned: $shortcutId")

          if (shortcutId != null && reactContext.hasActiveCatalystInstance()) {
            val params = Arguments.createMap()
            params.putString("shortcutId", shortcutId)
            params.putString("status", "success")

            reactContext
              .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
              .emit("ShortcutPinned", params)
          }
        }
      }
    }

    
    val filter = IntentFilter(ACTION_SHORTCUT_ADDED)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      reactContext.registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED)
    } else {
      reactContext.registerReceiver(receiver, filter)
    }
  }

  override fun getName(): String = "HomeShortcut"

  @ReactMethod
  fun renderIconToPng(config: ReadableMap, promise: Promise) {
    try {
      val appId = config.getString("appId") ?: throw IllegalArgumentException("appId required")
      val iconColor = config.getString("iconColor") ?: throw IllegalArgumentException("iconColor required")
      val backgroundColor = config.getString("backgroundColor") ?: throw IllegalArgumentException("backgroundColor required")
      val patternType = config.getString("pattern") 

      Log.i(TAG, "Rendering icon: appId=$appId, colors=($iconColor, $backgroundColor), pattern=$patternType")

      
      val bitmap = android.graphics.Bitmap.createBitmap(1024, 1024, android.graphics.Bitmap.Config.ARGB_8888)
      val canvas = android.graphics.Canvas(bitmap)

      
      when (patternType) {
        "leopard" -> renderLeopardIcon(canvas, appId, iconColor, backgroundColor)
        "crimson-bloom" -> renderCrimsonBloomIcon(canvas, appId, iconColor)
        else -> renderSimpleIcon(canvas, appId, iconColor, backgroundColor)
      }

      
      val baos = java.io.ByteArrayOutputStream()
      bitmap.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, baos)
      val base64 = android.util.Base64.encodeToString(baos.toByteArray(), android.util.Base64.NO_WRAP)

      val result = WritableNativeMap()
      result.putString("base64", base64)
      promise.resolve(result)
    } catch (e: Exception) {
      Log.e(TAG, "Icon rendering failed", e)
      promise.reject("RENDER_ERROR", e.message, e)
    }
  }

  private fun renderSimpleIcon(canvas: android.graphics.Canvas, appId: String, iconColor: String, backgroundColor: String) {
    
    canvas.drawColor(android.graphics.Color.parseColor(backgroundColor))

    
    val paint = android.graphics.Paint().apply {
      color = android.graphics.Color.parseColor(iconColor)
      isAntiAlias = true
    }

    
    canvas.drawCircle(512f, 512f, 400f, paint)
  }

  private fun renderLeopardIcon(canvas: android.graphics.Canvas, appId: String, iconColor: String, backgroundColor: String) {
    
    canvas.drawColor(android.graphics.Color.parseColor(backgroundColor))

    
    
    renderSimpleIcon(canvas, appId, iconColor, backgroundColor)
  }

  private fun renderCrimsonBloomIcon(canvas: android.graphics.Canvas, appId: String, iconColor: String) {
    
    canvas.drawColor(android.graphics.Color.TRANSPARENT, android.graphics.PorterDuff.Mode.CLEAR)

    
    val paint = android.graphics.Paint().apply {
      color = android.graphics.Color.parseColor(iconColor)
      isAntiAlias = true
    }
    canvas.drawCircle(512f, 512f, 360f, paint)
  }

  
  @ReactMethod
  fun getCurrentAppIcon(config: ReadableMap, promise: Promise) {
    try {
      val packageName = config.getString("packageName") ?: throw IllegalArgumentException("packageName required")
      Log.i(TAG, "Fetching current icon for: $packageName")

      val appInfo = packageManager.getApplicationInfo(packageName, 0)
      val icon = packageManager.getApplicationIcon(appInfo)

      val bitmap = if (icon is android.graphics.drawable.BitmapDrawable) {
        icon.bitmap
      } else {
        val b = android.graphics.Bitmap.createBitmap(
          icon.intrinsicWidth.coerceAtLeast(1),
          icon.intrinsicHeight.coerceAtLeast(1),
          android.graphics.Bitmap.Config.ARGB_8888
        )
        val canvas = android.graphics.Canvas(b)
        icon.setBounds(0, 0, b.width, b.height)
        icon.draw(canvas)
        b
      }

      val baos = java.io.ByteArrayOutputStream()
      bitmap.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, baos)
      val base64 = android.util.Base64.encodeToString(baos.toByteArray(), android.util.Base64.NO_WRAP)

      val result = WritableNativeMap()
      result.putString("base64", base64)
      promise.resolve(result)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to get current app icon", e)
      promise.reject("ICON_FETCH_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun createShortcut(config: ReadableMap, promise: Promise) {
    try {
      
      val appPackageName = config.getString("appPackageName")
        ?: throw IllegalArgumentException("appPackageName is required")
      val shortcutId = config.getString("shortcutId")
        ?: throw IllegalArgumentException("shortcutId is required")
      val rawLabel = config.getString("label")
        ?: throw IllegalArgumentException("label is required")
      // A completely empty label causes many launchers to fall back to the app name,
      // so use a blank (invisible) character for "no name" shortcuts.
      val label = if (rawLabel.isBlank()) "⠀" else rawLabel
      val iconColor = config.getString("iconColor")
        ?: throw IllegalArgumentException("iconColor is required")
      val backgroundColor = config.getString("backgroundColor")
        ?: throw IllegalArgumentException("backgroundColor is required")
      val iconPngBase64 = config.getString("iconPngBase64")
        ?: throw IllegalArgumentException("Rendered icon image is required")
      val themeId = config.getString("themeId") ?: "unknown"

      Log.i(TAG, "Creating shortcut: id=$shortcutId, app=$appPackageName, label=$label, theme=$themeId, colors=($iconColor, $backgroundColor)")

      
      val launchIntent = getLaunchIntentForApp(appPackageName)
        ?: throw IllegalStateException("Target app ($appPackageName) is not installed or does not have a launch activity")

      
      val iconCompat = createIconFromBase64(iconPngBase64, label)

      
      val shortcutInfo = ShortcutInfoCompat.Builder(context, shortcutId)
        .setShortLabel(label)
        .setLongLabel("$label")
        .setIcon(iconCompat)
        .setIntent(launchIntent)
        .build()

      
      val callbackIntent = Intent(ACTION_SHORTCUT_ADDED).apply {
  setPackage(context.packageName)
  putExtra("shortcutId", shortcutId)
}

val successCallback = PendingIntent.getBroadcast(
  context,
  shortcutId.hashCode(),
  callbackIntent,
  PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
)

      val success = ShortcutManagerCompat.requestPinShortcut(context, shortcutInfo, successCallback.intentSender)

      if (success) {
        Log.i(TAG, "Shortcut creation initiated successfully: $shortcutId")
        val result = WritableNativeMap()
        result.putString("shortcutId", shortcutId)
        result.putString("appPackageName", appPackageName)
        result.putString("label", label)
        result.putBoolean("success", true)
        result.putString("message", "Shortcut creation initiated. User confirmation required.")
        promise.resolve(result)
      } else {
        Log.w(TAG, "Launcher does not support pinning: $shortcutId")
        val result = WritableNativeMap()
        result.putString("shortcutId", shortcutId)
        result.putString("appPackageName", appPackageName)
        result.putBoolean("success", false)
        result.putString("error", "LAUNCHER_NO_SUPPORT")
        result.putString("message", "Launcher does not support pinning shortcuts")
        promise.resolve(result)
      }
    } catch (e: Exception) {
      Log.e(TAG, "Shortcut creation failed", e)
      promise.reject("SHORTCUT_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun createSquareWidget(config: ReadableMap, promise: Promise) {
    try {
      val appPackageName = config.getString("appPackageName") ?: throw IllegalArgumentException("appPackageName required")
      val iconPngBase64 = config.getString("iconPngBase64") ?: throw IllegalArgumentException("iconPngBase64 required")
      val label = config.getString("label") ?: throw IllegalArgumentException("label required")

      Log.i(TAG, "Requesting Square widget for: $appPackageName")

      val showLabel = config.getBoolean("showLabel")
      val labelColor = config.getString("labelColor") ?: "#FFFFFF"

      val widgetConfig = WidgetConfig(appPackageName, iconPngBase64, label, showLabel, labelColor)
      val configManager = WidgetConfigManager(context)
      configManager.savePendingConfig(widgetConfig)

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val provider = ComponentName(context, SquareIconWidgetProvider::class.java)

        val callbackIntent = Intent("com.hetvi.iconaura.WIDGET_ADDED").apply {
          setPackage(context.packageName)
          putExtra("widgetCreated", true)
        }
        val successCallback = PendingIntent.getBroadcast(
          context,
          0,
          callbackIntent,
          PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        
        
        
        
        val layoutId = if (showLabel) R.layout.square_icon_widget_with_name else R.layout.square_icon_widget_without_name
        val previewViews = android.widget.RemoteViews(context.packageName, layoutId)
        try {
          val decodedBytes = android.util.Base64.decode(iconPngBase64, android.util.Base64.DEFAULT)
          val bitmap = android.graphics.BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
          if (bitmap != null) {
            previewViews.setImageViewBitmap(R.id.widget_icon, bitmap)
          }
        } catch (e: Exception) {
          Log.e(TAG, "Failed to set preview bitmap", e)
        }

        val extras = android.os.Bundle().apply {
          putParcelable(AppWidgetManager.EXTRA_APPWIDGET_PREVIEW, previewViews)
        }
        var pinned = false

        
        try {
          val m1 = appWidgetManager.javaClass.getMethod("requestPinAppWidget", ComponentName::class.java, PendingIntent::class.java)
          m1.invoke(appWidgetManager, provider, successCallback)
          pinned = true
        } catch (e1: Exception) {
          Log.d(TAG, "Reflection Sig 1 failed: ${e1.message}")
        }

        if (!pinned) {
          
          try {
            val m2 = appWidgetManager.javaClass.getMethod("requestPinAppWidget", ComponentName::class.java, PendingIntent::class.java, android.os.Bundle::class.java)
            m2.invoke(appWidgetManager, provider, successCallback, extras)
            pinned = true
          } catch (e2: Exception) {
            Log.d(TAG, "Reflection Sig 2 failed: ${e2.message}")
          }
        }

        if (!pinned) {
          
          try {
            val m3 = appWidgetManager.javaClass.getMethod("requestPinAppWidget", ComponentName::class.java, android.os.Bundle::class.java, PendingIntent::class.java)
            m3.invoke(appWidgetManager, provider, extras, successCallback)
            pinned = true
          } catch (e3: Exception) {
            Log.d(TAG, "Reflection Sig 3 failed: ${e3.message}")
          }
        }

        if (!pinned) {
          Log.e(TAG, "All widget pinning attempts failed.")
          promise.reject("WIDGET_PIN_ERROR", "Could not find a valid requestPinAppWidget method on this device.")
          return
        }

        val result = WritableNativeMap()
        result.putBoolean("success", true)
        result.putString("message", "Widget pinning requested. User confirmation required.")
        promise.resolve(result)
      } else {
        promise.reject("SDK_TOO_LOW", "App widgets pinning requires Android 8.0+")
      }
    } catch (e: Exception) {
      Log.e(TAG, "Square widget creation failed", e)
      promise.reject("WIDGET_ERROR", e.message, e)
    }
  }

  
  private fun getLaunchIntentForApp(packageName: String): Intent? {
    return try {
      
      packageManager.getPackageInfo(packageName, 0)

      
      val intent = packageManager.getLaunchIntentForPackage(packageName)
      if (intent != null) {
        
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        Log.i(TAG, "Launch intent resolved for $packageName")
        intent
      } else {
        Log.w(TAG, "No launch intent found for $packageName")
        null
      }
    } catch (e: PackageManager.NameNotFoundException) {
      Log.w(TAG, "Package not found: $packageName")
      null
    } catch (e: Exception) {
      Log.e(TAG, "Error getting launch intent for $packageName", e)
      null
    }
  }

  
  private fun createIconFromBase64(iconPngBase64: String, appName: String): IconCompat {
    val decodedBytes = android.util.Base64.decode(iconPngBase64, android.util.Base64.DEFAULT)
    val bitmap = android.graphics.BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
      ?: throw IllegalStateException("Could not decode captured SVG icon for $appName")

    Log.i(TAG, "Captured SVG icon created: ${bitmap.width}x${bitmap.height}px for $appName")
    return IconCompat.createWithBitmap(bitmap)
  }

  
  private fun getAppNameFromPackage(packageName: String): String {
    return try {
      val appInfo = packageManager.getApplicationInfo(packageName, 0)
      val label = packageManager.getApplicationLabel(appInfo)
      label.toString()
    } catch (e: Exception) {
      Log.w(TAG, "Could not get app name for $packageName, using package name")
      packageName
    }
  }
}
