package com.hetvi.iconaura

import android.app.WallpaperManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import java.io.InputStream
import java.net.URL
import java.util.concurrent.Executors

class WallpaperModule(private val reactContext: ReactApplicationContext) : com.facebook.react.bridge.ReactContextBaseJavaModule() {

    override fun getName(): String = "WallpaperModule"

    private val executor = Executors.newSingleThreadExecutor()

    @com.facebook.react.bridge.ReactMethod
    fun setWallpaper(url: String, target: String, promise: Promise) {
        executor.execute {
            try {
                val bitmap = downloadBitmap(url)
                val wallpaperManager = WallpaperManager.getInstance(reactContext)

                when (target) {
                    "home" -> wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_SYSTEM)
                    "lock" -> wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_LOCK)
                    else -> throw IllegalArgumentException("Invalid target: $target")
                }

                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("WALLPAPER_ERROR", e.message)
            }
        }
    }

    private fun downloadBitmap(urlStr: String): Bitmap {
        val url = URL(urlStr)
        val connection = url.openConnection()
        connection.doInput = true
        connection.connect()
        val inputStream: InputStream = connection.getInputStream()
        return BitmapFactory.decodeStream(inputStream)
    }
}
