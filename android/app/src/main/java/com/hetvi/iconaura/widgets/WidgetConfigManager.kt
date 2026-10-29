package com.hetvi.iconaura.widgets

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

data class WidgetConfig(
    val packageName: String,
    val iconBase64: String,
    val label: String,
    val showLabel: Boolean,
    val labelColor: String
)

class WidgetConfigManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("IconAuraWidgetPrefs", Context.MODE_PRIVATE)
    private val gson = Gson()

    companion object {
        private const val KEY_CONFIG_PREFIX = "widget_config_"
        private const val KEY_PENDING_QUEUE = "pending_widget_queue"
    }

    fun saveConfig(widgetId: Int, config: WidgetConfig) {
        val json = gson.toJson(config)
        prefs.edit().putString("${KEY_CONFIG_PREFIX}$widgetId", json).apply()
    }

    fun getConfig(widgetId: Int): WidgetConfig? {
        val json = prefs.getString("${KEY_CONFIG_PREFIX}$widgetId", null) ?: return null
        return gson.fromJson(json, WidgetConfig::class.java)
    }

    fun savePendingConfig(config: WidgetConfig) {
        val queue = getPendingQueue().toMutableList()
        queue.add(config)
        prefs.edit().putString(KEY_PENDING_QUEUE, gson.toJson(queue)).apply()
    }

    fun popPendingConfig(): WidgetConfig? {
        val queue = getPendingQueue().toMutableList()
        if (queue.isEmpty()) return null
        val config = queue.removeAt(0)
        prefs.edit().putString(KEY_PENDING_QUEUE, gson.toJson(queue)).apply()
        return config
    }

    fun getPendingQueue(): List<WidgetConfig> {
        val json = prefs.getString(KEY_PENDING_QUEUE, null) ?: return emptyList()
        val type = object : TypeToken<List<WidgetConfig>>() {}.type
        return gson.fromJson(json, type)
    }

    fun removeConfig(widgetId: Int) {
        prefs.edit().remove("${KEY_CONFIG_PREFIX}$widgetId").apply()
    }
}
