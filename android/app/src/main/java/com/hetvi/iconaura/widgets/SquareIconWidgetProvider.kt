package com.hetvi.iconaura.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import android.util.Log
import android.widget.RemoteViews
import com.hetvi.iconaura.R

class SquareIconWidgetProvider : AppWidgetProvider() {
    companion object {
        private const val TAG = "IconAura.SquareWidget"
    }

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        Log.i(TAG, "Updating ${appWidgetIds.size} widgets")
        val configManager = WidgetConfigManager(context)

        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId, configManager)
        }
    }

    private fun updateWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        configManager: WidgetConfigManager
    ) {
        var config = configManager.getConfig(appWidgetId)

        if (config == null) {
            Log.i(TAG, "Widget $appWidgetId has no config, checking pending queue...")
            config = configManager.popPendingConfig()
            if (config != null) {
                configManager.saveConfig(appWidgetId, config)
                Log.i(TAG, "Assigned pending config to widget $appWidgetId: ${config.packageName}")
            }
        }

        val views = RemoteViews(context.packageName, R.layout.square_icon_widget)

        if (config != null) {
            try {
                
                val decodedBytes = Base64.decode(config.iconBase64, Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)

                if (bitmap != null) {
                    views.setImageViewBitmap(R.id.widget_icon, bitmap)
                } else {
                    Log.e(TAG, "Decoded bitmap is null for widget $appWidgetId")
                }

                
                val launchIntent = context.packageManager.getLaunchIntentForPackage(config.packageName)
                if (launchIntent != null) {
                    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    val pendingIntent = PendingIntent.getActivity(
                        context,
                        appWidgetId, 
                        launchIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    views.setOnClickPendingIntent(R.id.widget_icon, pendingIntent)
                } else {
                    Log.e(TAG, "No launch intent found for ${config.packageName}")
                }

            } catch (e: Exception) {
                Log.e(TAG, "Error updating widget $appWidgetId", e)
            }
        } else {
            Log.w(TAG, "Widget $appWidgetId has no configuration available")
            
        }

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    override fun onDisabled(context: Context) {
        super.onDisabled(context)
        
    }
}
