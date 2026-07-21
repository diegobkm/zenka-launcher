package com.zenkalauncher

import android.content.Context
import android.content.Intent
import android.net.wifi.WifiManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ZenkaLauncherModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "ZenkaLauncherModule"

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val intent = Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_LAUNCHER)
            }
            val resolvedApps = pm.queryIntentActivities(intent, 0)
            val results = Arguments.createArray()
            for (ri in resolvedApps) {
                val ai = Arguments.createMap().apply {
                    putString("packageName", ri.activityInfo.packageName)
                    putString("name", ri.loadLabel(pm).toString())
                    putString("id", ri.activityInfo.packageName)
                }
                results.pushMap(ai)
            }
            promise.resolve(results)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun launchApp(packageName: String, promise: Promise) {
        try {
            val intent = reactApplicationContext.packageManager
                .getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getCurrentWifiSSID(promise: Promise) {
        try {
            val wifiManager = reactApplicationContext
                .getSystemService(Context.WIFI_SERVICE) as WifiManager
            val ssid = wifiManager.connectionInfo.ssid?.trim('"') ?: ""
            promise.resolve(ssid)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}
