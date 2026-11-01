#!/usr/bin/env bash
# 手动把 macOS 风格 Linux 桌面打包成 APK（基于系统 android-sdk + r8 的 d8）
set -e
cd "$(dirname "$0")"

SDK=/usr/lib/android-sdk
BT=$SDK/build-tools/29.0.3
AAPT2=$BT/aapt2
ZIPALIGN=$BT/zipalign
APKSIGNER=$BT/apksigner
ANDROID_JAR=$SDK/platforms/android-23/android.jar
R8=/tmp/r8.jar
# r8 含 d8（Debian 的 android-sdk 不自带），缺失则自动从 Google Maven 下载
if [ ! -f "$R8" ]; then
  echo "[准备] 下载 r8 (含 d8) ..."
  curl -fsSL -o "$R8" "https://dl.google.com/dl/android/maven2/com/android/tools/r8/8.3.37/r8-8.3.37.jar" \
    || { echo "r8 下载失败，请手动下载到 $R8"; exit 1; }
fi

APP=app/src/main
OUT=build
mkdir -p "$OUT/res" "$OUT/classes" "$OUT/gen" "$OUT/assets"

echo "[1/6] aapt2 编译资源"
$AAPT2 compile -o "$OUT/res" --dir "$APP/res"

echo "[2/6] aapt2 链接资源 + 生成 R.java (并把 assets 打进包)"
$AAPT2 link -o "$OUT/app-unsigned.apk" \
  -I "$ANDROID_JAR" \
  --manifest "$APP/AndroidManifest.xml" \
  -A "$APP/assets" \
  $(find "$OUT/res" -name '*.flat' -printf '-R %p ') \
  --java "$OUT/gen" \
  --auto-add-overlay

echo "[3/6] javac 编译 Java (含 R.java)"
javac -encoding UTF-8 -cp "$ANDROID_JAR" -d "$OUT/classes" \
  $(find "$APP/java" -name '*.java') \
  $(find "$OUT/gen" -name 'R.java')

echo "[3b] 打包 class 为 jar（d8 需要 jar/zip 输入）"
jar cf "$OUT/classes.jar" -C "$OUT/classes" .

echo "[4/6] d8 把 jar 编译为 classes.dex"
rm -rf "$OUT/dexout"; mkdir -p "$OUT/dexout"
java -cp "$R8" com.android.tools.r8.D8 \
  --release --output "$OUT/dexout" \
  --lib "$ANDROID_JAR" \
  "$OUT/classes.jar"
ls -la "$OUT/dexout/classes.dex"

echo "[5/6] 把 classes.dex 加入 APK（必须位于根目录 classes.dex）"
cp "$OUT/dexout/classes.dex" "$OUT/classes.dex"
( cd "$OUT" && "$BT/aapt" add app-unsigned.apk classes.dex ) || \
( cd "$OUT" && "$BT/aapt" add app-unsigned.apk dexout/classes.dex )

echo "[6/6] zipalign + debug 签名"
"$ZIPALIGN" -f 4 "$OUT/app-unsigned.apk" "$OUT/app-aligned.apk"

KEYSTORE="$OUT/debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -v -keystore "$KEYSTORE" -alias androiddebugkey \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=macOSLinux, OU=Dev, O=macOSLinux, L=Local, S=Local, C=CN" \
    -storepass android -keypass android >/dev/null 2>&1
fi
"$APKSIGNER" sign --ks "$KEYSTORE" --ks-key-alias androiddebugkey \
  --ks-pass pass:android --key-pass pass:android \
  --out macos-linux-desktop.apk "$OUT/app-aligned.apk"

echo "DONE -> $(ls -la macos-linux-desktop.apk | awk '{print $5, $NF}')"
