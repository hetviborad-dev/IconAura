package com.iconaura

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.util.Base64
import android.util.Log
import androidx.core.graphics.PathParser
import java.io.ByteArrayOutputStream

/**
 * High-resolution SVG icon renderer for Android launcher shortcuts
 *
 * This module provides the critical SVG → Bitmap rendering pipeline that ensures
 * launcher icons look professional and consistent.
 *
 * ARCHITECTURE:
 * SVG Path Data → Android Path → Canvas Drawing → High-Res Bitmap → PNG → Base64
 *
 * DESIGN RULES:
 * - 512x512 base canvas (high resolution for sharp rendering)
 * - 64px safe padding on all sides (12.5% padding prevents launcher clipping)
 * - 384x384 actual icon area (centered, consistent scale)
 * - Proper theme colors applied
 * - Anti-aliasing enabled for smooth edges
 * - Professional appearance across all launchers
 */
object IconRenderer {
  private const val TAG = "IconAura.IconRenderer"

  // High-resolution canvas for sharp rendering
  private const val CANVAS_SIZE = 512

  // Safe padding prevents clipping on various launchers
  // Many launchers apply circular or rounded-square masks
  private const val SAFE_PADDING = 64 // 12.5% on each side

  // Actual icon rendering area
  private const val ICON_SIZE = CANVAS_SIZE - (SAFE_PADDING * 2) // 384px

  /**
   * Icon data structure
   */
  private data class IconData(
    val viewBox: Float,
    val pathData: String
  )

  /**
   * Supported apps with their SVG path data
   */
  private val APP_ICONS = mapOf(
    "instagram" to IconData(
      viewBox = 24f,
      pathData = "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"
    ),
    "whatsapp" to IconData(
      viewBox = 24f,
      pathData = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-1.052 0-2.069.335-2.955.967l-.21.126-2.152-.564.574 2.035-.13.208a4.908 4.908 0 0 0-.667 2.55c0 2.685 2.187 4.874 4.877 4.874.678 0 1.335-.135 1.965-.394l.149.075 2.189.573-.575-2.051.11-.175a4.877 4.877 0 0 0 .786-2.662c.001-2.688-2.186-4.876-4.874-4.876"
    )
  )

  /**
   * Render a themed icon to a high-resolution bitmap
   *
   * This is the main entry point for icon generation.
   *
   * @param appName App name (e.g., "Instagram", "WhatsApp")
   * @param iconColorHex Icon/foreground color (e.g., "#000000")
   * @param backgroundColorHex Background color (e.g., "#FFFFFF")
   * @return Base64-encoded PNG data (ready for ShortcutInfo)
   */
  fun renderThemedIcon(
    appName: String,
    iconColorHex: String,
    backgroundColorHex: String
  ): String {
    Log.i(TAG, "Rendering icon: app=$appName, icon=$iconColorHex, bg=$backgroundColorHex")

    // Step 1: Find the icon data
    val normalizedName = appName.lowercase()
    val iconKey = APP_ICONS.keys.find { normalizedName.contains(it) }
      ?: throw IllegalArgumentException("Unsupported app: $appName (supported: ${APP_ICONS.keys.joinToString()})")

    val iconData = APP_ICONS[iconKey]!!

    // Step 2: Parse colors
    val iconColor = try {
      Color.parseColor(iconColorHex)
    } catch (e: Exception) {
      Log.e(TAG, "Invalid icon color: $iconColorHex, using black", e)
      Color.BLACK
    }

    val backgroundColor = try {
      Color.parseColor(backgroundColorHex)
    } catch (e: Exception) {
      Log.e(TAG, "Invalid background color: $backgroundColorHex, using white", e)
      Color.WHITE
    }

    // Step 3: Create high-resolution bitmap
    val bitmap = Bitmap.createBitmap(CANVAS_SIZE, CANVAS_SIZE, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)

    // Step 4: Fill background
    canvas.drawColor(backgroundColor)

    // Step 5: Set up paint for icon rendering with anti-aliasing
    val paint = Paint().apply {
      isAntiAlias = true // Critical for smooth edges
      color = iconColor
      style = Paint.Style.FILL
      isDither = false // Prevent dithering artifacts
      isFilterBitmap = true
    }

    // Step 6: Parse SVG path using Android's built-in PathParser
    val path = try {
      PathParser.createPathFromPathData(iconData.pathData)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to parse SVG path for $appName", e)
      throw IllegalStateException("Invalid SVG path data for $appName", e)
    }

    // Step 7: Calculate scaling to fit icon in safe area
    // SVG viewBox → ICON_SIZE (384px)
    val scale = ICON_SIZE / iconData.viewBox

    // Step 8: Center the icon in the canvas
    val translateX = SAFE_PADDING.toFloat()
    val translateY = SAFE_PADDING.toFloat()

    // Step 9: Apply transformations and render SVG path
    canvas.save()
    canvas.translate(translateX, translateY)
    canvas.scale(scale, scale)
    canvas.drawPath(path, paint)
    canvas.restore()

    // Step 10: Convert to PNG with maximum quality
    val outputStream = ByteArrayOutputStream()
    val compressed = bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)

    if (!compressed) {
      Log.e(TAG, "Failed to compress bitmap to PNG")
      throw IllegalStateException("Bitmap compression failed")
    }

    val pngBytes = outputStream.toByteArray()

    // Step 11: Encode to base64
    val base64 = Base64.encodeToString(pngBytes, Base64.NO_WRAP)

    Log.i(
      TAG,
      "Icon rendered successfully: ${pngBytes.size} bytes PNG, " +
        "${base64.length} chars base64, ${CANVAS_SIZE}x${CANVAS_SIZE}px, " +
        "icon area: ${ICON_SIZE}x${ICON_SIZE}px"
    )

    // Step 12: Clean up
    bitmap.recycle()

    return base64
  }

  /**
   * Get rendering configuration for debugging
   */
  fun getRenderingConfig(): Map<String, Any> {
    return mapOf(
      "canvasSize" to CANVAS_SIZE,
      "safePadding" to SAFE_PADDING,
      "iconSize" to ICON_SIZE,
      "supportedApps" to APP_ICONS.keys.toList()
    )
  }
}
