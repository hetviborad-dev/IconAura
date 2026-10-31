package com.hetvi.iconaura

import android.os.Bundle

import com.facebook.react.ReactActivity
import com.zoontek.rnbootsplash.RNBootSplash
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        RNBootSplash.init(this, R.style.BootTheme)
        super.onCreate(savedInstanceState)
    }

  
  override fun getMainComponentName(): String = "IconAura"

  
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
