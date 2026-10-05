# IconAura Shortcut Engine Testing Guide

## Implementation Summary

The Android home-screen shortcut engine is **FULLY IMPLEMENTED** and ready for testing on a physical device.

## Architecture Overview

### Flow Diagram
```
React Native (ThemeDetailScreen)
        ↓
    createShortcut()
        ↓
TypeScript Service (shortcutCreation.ts)
        ↓
Native Module Bridge (NativeModules.HomeShortcut)
        ↓
Kotlin Native Module (ShortcutModule.kt)
        ↓
    ShortcutManagerCompat
        ↓
    ShortcutInfoCompat.Builder
        ↓
    - Set custom Icon (IconCompat.createWithBitmap)
    - Set label
    - Set Intent (launches target app)
        ↓
    requestPinShortcut()
        ↓
    User confirms placement
        ↓
    ✅ Shortcut placed on home screen
        ↓
    User taps shortcut
        ↓
    ✅ Target app launches directly (NOT IconAura)
```

## Implementation Details

### Native Module (Kotlin)
**File:** `android/app/src/main/java/com/iconaura/ShortcutModule.kt`

Key features:
- ✅ Verifies target app is installed via `PackageManager`
- ✅ Resolves launch activity using `getLaunchIntentForPackage()`
- ✅ Creates custom icon from base64-encoded PNG using `IconCompat.createWithBitmap()`
- ✅ Uses `ShortcutInfoCompat` for Android API compatibility (24+)
- ✅ Sets proper Intent flags (`FLAG_ACTIVITY_NEW_TASK`, `FLAG_ACTIVITY_CLEAR_TOP`)
- ✅ Launches target app directly (not IconAura)
- ✅ Handles errors gracefully with detailed logging
- ✅ Returns structured result to React Native

### TypeScript Service
**File:** `src/services/shortcutCreation.ts`

Provides:
- Clean JavaScript API for shortcut creation
- Stable shortcut ID generation
- Type-safe interface

### Integration
- ✅ Native module registered in `MainApplication.kt`
- ✅ Permissions declared in `AndroidManifest.xml`
- ✅ UI integration in `ThemeDetailScreen.tsx`
- ✅ Icon generation utility in `utils/iconGeneration.ts`

## Permissions

**File:** `android/app/src/main/AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
<uses-permission android:name="com.android.launcher.permission.INSTALL_SHORTCUT" />
```

## Build and Test Instructions

### Step 1: Build Android APK

```bash
cd /Users/admin/RNProjects/IconAura

# Clean previous builds
cd android
./gradlew clean
cd ..

# Build debug APK
npm run android
# or
cd android && ./gradlew assembleDebug
```

**APK Location:** `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 2: Install on Physical Device

Connect Android device via USB and enable USB debugging:

```bash
# Check device is connected
adb devices

# Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or reinstall if already installed
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 3: Test Instagram Shortcut

1. **Ensure Instagram is installed** on the test device
2. Open IconAura app
3. Tap "Mono Light" theme
4. Find Instagram in the app list
5. Tap "Apply Theme" button
6. **Expected behavior:**
   - Alert appears: "Tap the home button to place 'Instagram' on your home screen"
   - Android shows shortcut placement UI
   - User drags shortcut to desired position
7. **Verify the shortcut:**
   - Custom mono light icon is visible
   - Label reads "Instagram"
8. **Tap the shortcut:**
   - ✅ **Instagram app launches directly**
   - ❌ IconAura should NOT launch first

### Step 4: Test WhatsApp Shortcut

Repeat the same process for WhatsApp:

1. Ensure WhatsApp is installed
2. Create shortcut from theme detail screen
3. Place on home screen
4. Tap shortcut
5. ✅ **WhatsApp launches directly**

### Step 5: Test Edge Cases

#### A. Duplicate Shortcut
1. Create Instagram shortcut
2. Try creating Instagram shortcut again (same theme)
3. **Expected:** Android allows duplicate or shows system message

#### B. App Not Installed
1. Try creating shortcut for an app you don't have installed
2. **Expected:** Button should be disabled (app detection prevents this)
3. Or if somehow triggered: error message about app not being installed

#### C. Launcher Doesn't Support Pinning
1. Test on device/launcher without shortcut support
2. **Expected:** Alert: "Launcher does not support pinning shortcuts"

### Step 6: Inspect Logs

Monitor logcat for detailed native module output:

```bash
# Filter IconAura logs
adb logcat | grep "IconAura.Shortcut"

# Or use React Native logs
npx react-native log-android
```

**Expected log output:**
```
I/IconAura.Shortcut: Creating shortcut: id=instagram_mono_light, app=com.instagram.android, label=Instagram, theme=mono_light
I/IconAura.Shortcut: Launch intent resolved for com.instagram.android
I/IconAura.Shortcut: Icon created from base64 data for Instagram
I/IconAura.Shortcut: Shortcut creation initiated successfully: instagram_mono_light
```

## Test Checklist

- [ ] Build APK successfully
- [ ] Install on physical Android device
- [ ] Instagram shortcut created
- [ ] Instagram shortcut placed on home screen
- [ ] Instagram shortcut uses custom icon
- [ ] Tapping Instagram shortcut launches Instagram (not IconAura)
- [ ] WhatsApp shortcut created
- [ ] WhatsApp shortcut placed on home screen
- [ ] Tapping WhatsApp shortcut launches WhatsApp (not IconAura)
- [ ] Test duplicate shortcut behavior
- [ ] Test with app not installed (if possible)
- [ ] Inspect logcat for errors
- [ ] All logs show success messages

## Known Limitations

1. **Android API 26+ Required:** ShortcutManagerCompat requires API 26 (Android 8.0)
2. **Launcher Support:** Some launchers don't support pinning shortcuts
3. **User Confirmation Required:** Android always shows confirmation dialog
4. **Icon Size:** Custom icons should be square, ideally 192x192 or 512x512 pixels

## Troubleshooting

### Issue: Native module not found
```
Error: HomeShortcut native module not found
```
**Solution:** Rebuild Android app completely
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Issue: App doesn't launch
**Check logcat for:**
- "Package not found" → Target app not installed
- "No launch intent found" → App has no launchable activity
- "Launcher does not support pinning" → Use different launcher

### Issue: Icon doesn't appear
**Verify:**
- Base64 encoding is correct
- Image is valid PNG
- Icon size is reasonable (< 1MB)

## Implementation Notes

### What This Does ✅
- Creates **REAL** Android home-screen shortcuts
- Shortcuts launch **target apps directly**
- Uses **custom icons** from themes
- Works with **any Android launcher** that supports pinning
- Properly handles errors and edge cases

### What This Does NOT Do ❌
- Does NOT create a custom launcher
- Does NOT replace the user's launcher
- Does NOT create in-app fake shortcuts
- Does NOT launch IconAura before the target app

## Success Criteria

The implementation is successful when:

1. ✅ Instagram shortcut appears on home screen with custom icon
2. ✅ Tapping Instagram shortcut opens Instagram app directly
3. ✅ WhatsApp shortcut appears on home screen with custom icon
4. ✅ Tapping WhatsApp shortcut opens WhatsApp app directly
5. ✅ No errors in logcat
6. ✅ IconAura never launches when tapping shortcuts

## Next Steps After Testing

Once testing confirms the shortcuts work:

1. Document any issues found during testing
2. Test on multiple Android versions (8.0+, 10, 11, 12, 13, 14)
3. Test on different launcher apps (Nova, Samsung, Pixel, etc.)
4. Gather user feedback on icon quality and shortcut behavior
5. Consider adding features:
   - Batch shortcut creation
   - Shortcut management screen
   - Icon preview before creation
   - Custom icon upload

---

**Implementation Status:** ✅ COMPLETE - Ready for Device Testing

**Created:** 2026-10-05
