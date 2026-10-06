package com.iconaura

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.util.Base64
import android.util.Log
import androidx.core.graphics.PathParser
import java.io.ByteArrayOutputStream

/** Renders bundled SVG path data to high-resolution launcher icon bitmaps. */
object IconRenderer {
  private const val TAG = "IconAura.IconRenderer"
  private const val CANVAS_SIZE = 512
  private const val SAFE_PADDING = 64
  private const val ICON_SIZE = CANVAS_SIZE - (SAFE_PADDING * 2)
  private const val VIEWBOX_SIZE = 24f

  /** Render all paths of one Simple Icons mark using the app's theme colors. */
  fun renderThemedIcon(
    appName: String,
    iconColorHex: String,
    backgroundColorHex: String,
    pathData: List<String>
  ): String {
    require(pathData.isNotEmpty()) { "No icon paths supplied for $appName" }

    val iconColor = parseColor(iconColorHex, Color.BLACK, "icon")
    val backgroundColor = parseColor(backgroundColorHex, Color.WHITE, "background")
    val bitmap = Bitmap.createBitmap(CANVAS_SIZE, CANVAS_SIZE, Bitmap.Config.ARGB_8888)

    try {
      val canvas = Canvas(bitmap)
      canvas.drawColor(backgroundColor)
      val paint = Paint().apply {
        isAntiAlias = true
        color = iconColor
        style = Paint.Style.FILL
        isDither = false
        isFilterBitmap = true
      }

      canvas.save()
      canvas.translate(SAFE_PADDING.toFloat(), SAFE_PADDING.toFloat())
      val scale = ICON_SIZE / VIEWBOX_SIZE
      canvas.scale(scale, scale)
      pathData.forEachIndexed { index, data ->
        val path = PathParser.createPathFromPathData(data)
          ?: throw IllegalArgumentException("Invalid SVG path $index for $appName")
        canvas.drawPath(path, paint)
      }
      canvas.restore()

      val outputStream = ByteArrayOutputStream()
      check(bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)) {
        "Could not encode rendered icon for $appName"
      }
      val pngBytes = outputStream.toByteArray()
      Log.i(TAG, "Rendered ${pathData.size} paths for $appName (${pngBytes.size} bytes)")
      return Base64.encodeToString(pngBytes, Base64.NO_WRAP)
    } finally {
      bitmap.recycle()
    }
  }

  private fun parseColor(value: String, fallback: Int, label: String): Int = try {
    Color.parseColor(value)
  } catch (error: IllegalArgumentException) {
    Log.w(TAG, "Invalid $label color '$value'; using fallback", error)
    fallback
  }
}
