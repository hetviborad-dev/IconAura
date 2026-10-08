package com.iconaura

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.drawable.Icon
import android.os.Build
import android.util.Log
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

/**
 * Native module for creating Android home-screen shortcuts.
 *
 * Shortcuts created by this module:
 * - Launch the target application directly
 * - Do NOT launch IconAura first
 * - Are pinned to the user's home screen
 * - Use custom icons and labels
 * - Work across Android versions (API 24+)
 *
 * Uses ShortcutManagerCompat for compatibility across Android versions.
 */
class ShortcutModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val packageManager: PackageManager = reactContext.packageManager
  private val context: Context = reactContext

  companion object {
    private const val TAG = "IconAura.Shortcut"
    private const val ACTION_SHORTCUT_ADDED = "com.iconaura.SHORTCUT_ADDED"
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

    // Register receiver dynamically
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
      val patternType = config.getString("pattern") // "leopard", "crimson-bloom", or null

      Log.i(TAG, "Rendering icon: appId=$appId, colors=($iconColor, $backgroundColor), pattern=$patternType")

      // Create 1024x1024 bitmap
      val bitmap = android.graphics.Bitmap.createBitmap(1024, 1024, android.graphics.Bitmap.Config.ARGB_8888)
      val canvas = android.graphics.Canvas(bitmap)

      // Draw based on pattern type
      when (patternType) {
        "leopard" -> renderLeopardIcon(canvas, appId, iconColor, backgroundColor)
        "crimson-bloom" -> renderCrimsonBloomIcon(canvas, appId, iconColor)
        else -> renderSimpleIcon(canvas, appId, iconColor, backgroundColor)
      }

      // Convert bitmap to base64 PNG
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
    // Fill background
    canvas.drawColor(android.graphics.Color.parseColor(backgroundColor))

    // Draw icon shape (simplified - you'll expand this)
    val paint = android.graphics.Paint().apply {
      color = android.graphics.Color.parseColor(iconColor)
      isAntiAlias = true
    }

    // Placeholder: draw a circle with app initial
    canvas.drawCircle(512f, 512f, 400f, paint)
  }

  private fun renderLeopardIcon(canvas: android.graphics.Canvas, appId: String, iconColor: String, backgroundColor: String) {
    // Fill background
    canvas.drawColor(android.graphics.Color.parseColor(backgroundColor))

    // Draw leopard pattern + icon
    // TODO: Load leopard pattern asset and blend with icon
    renderSimpleIcon(canvas, appId, iconColor, backgroundColor)
  }

  private fun renderCrimsonBloomIcon(canvas: android.graphics.Canvas, appId: String, iconColor: String) {
    // Fill transparent for pattern overlay
    canvas.drawColor(android.graphics.Color.TRANSPARENT, android.graphics.PorterDuff.Mode.CLEAR)

    // TODO: Load crimson-bloom flower pattern and render icon on top
    val paint = android.graphics.Paint().apply {
      color = android.graphics.Color.parseColor(iconColor)
      isAntiAlias = true
    }
    canvas.drawCircle(512f, 512f, 360f, paint)
  }

  /**
   * Creates a home-screen shortcut that launches the target application.
   *
   * @param config Configuration for shortcut creation:
   *   - appPackageName: Package name of the target app (e.g., "com.instagram.android")
   *   - shortcutId: Unique identifier for the shortcut (e.g., "instagram_mono_light")
   *   - label: Display label on home screen (e.g., "Instagram")
   *   - iconColor: Theme icon/foreground color (e.g., "#000000")
   *   - backgroundColor: Theme background color (e.g., "#FFFFFF")
   *   - themeId: Theme identifier (optional, for logging)
   * @param promise Promise to resolve with result or error
   */
  @ReactMethod
  fun createShortcut(config: ReadableMap, promise: Promise) {
    try {
      // Extract configuration
      val appPackageName = config.getString("appPackageName")
        ?: throw IllegalArgumentException("appPackageName is required")
      val shortcutId = config.getString("shortcutId")
        ?: throw IllegalArgumentException("shortcutId is required")

      // FIX: Allow empty label for "without app name" preference
      val label = config.getString("label") ?: ""

      val iconColor = config.getString("iconColor")
        ?: throw IllegalArgumentException("iconColor is required")
      val backgroundColor = config.getString("backgroundColor")
        ?: throw IllegalArgumentException("backgroundColor is required")
      val iconPngBase64 = config.getString("iconPngBase64")
        ?: throw IllegalArgumentException("Rendered icon image is required")
      val themeId = config.getString("themeId") ?: "unknown"

      // New preferences
      val shape = config.getString("shape") ?: "round"
      val withAppName = if (config.hasKey("withAppName")) config.getBoolean("withAppName") else true

      Log.i(TAG, "Creating shortcut: id=$shortcutId, app=$appPackageName, label=$label, theme=$themeId, shape=$shape, withAppName=$withAppName")

      // Step 1: Verify target app exists and get its launch activity
      val launchIntent = getLaunchIntentForApp(appPackageName)
        ?: throw IllegalStateException("Target app ($appPackageName) is not installed or does not have a launch activity")

      // Step 2: Create high-resolution icon using new rendering pipeline
      val iconCompat = createIconFromBase64(iconPngBase64, label)

      // Step 3: Create ShortcutInfo
      val shortcutInfo = ShortcutInfoCompat.Builder(context, shortcutId)
        .setShortLabel(if (label.isEmpty()) " " else label)
        .setLongLabel(if (label.isEmpty()) " " else "$label")
        .setIcon(iconCompat)
        .setIntent(launchIntent)
        .build()

      // Step 4: Request pinning
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

  /**
   * Gets the launch intent for a given package.
   *
   * @param packageName Package name to get launch intent for
   * @return Intent that launches the app, or null if not found
   */
  private fun getLaunchIntentForApp(packageName: String): Intent? {
    return try {
      // First, verify the package is installed
      packageManager.getPackageInfo(packageName, 0)

      // Get the launch intent
      val intent = packageManager.getLaunchIntentForPackage(packageName)
      if (intent != null) {
        // Add flags to ensure clean launch
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

  /**
   * Creates an IconCompat using the high-resolution rendering pipeline.
   *
   * Renders SVG → High-res Bitmap (1024x1024) → IconCompat
   *
   * @param appName App name for icon lookup (e.g., "Instagram", "WhatsApp")
   * @param iconPngBase64 Base64 encoded PNG of the icon
   * @return IconCompat or null if creation failed
   */
  private fun createIconFromBase64(iconPngBase64: String, appName: String): IconCompat {
    val decodedBytes = android.util.Base64.decode(iconPngBase64, android.util.Base64.DEFAULT)
    val bitmap = android.graphics.BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
      ?: throw IllegalStateException("Could not decode captured SVG icon for $appName")

    Log.i(TAG, "Captured SVG icon created: ${bitmap.width}x${bitmap.height}px for $appName")
    return IconCompat.createWithBitmap(bitmap)
  }

  /**
   * Gets a display name for the target package.
   *
   * @param packageName Package name
   * @return Display name or package name if not found
   */
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
