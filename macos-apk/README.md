# macOS 风格 Linux 桌面 · APK（WebView 壳）

把单文件桌面 `assets/macos-linux.html` 用 Android `WebView` 全屏加载，
打包成可安装的 **APK**。**鸿蒙（非纯血）用户可用「卓易通」等 Android 兼容层直接安装运行。**

## 目录结构
```
macos-apk/
├─ app/src/main/
│  ├─ java/com/macoslinux/desktop/MainActivity.java   # WebView 入口
│  ├─ AndroidManifest.xml                             # 权限/启动 Activity
│  ├─ res/values/{strings,styles}.xml                 # 名称/全屏主题
│  ├─ res/drawable/ic_launcher.xml                    # 图标
│  └─ assets/macos-linux.html                         # 桌面本体（单文件 HTML）
├─ build_apk.sh                                       # 一键打包脚本
└─ macos-linux-desktop.apk                            # 已生成的可安装包
```

## 一键重新打包（需要 Debian/Ubuntu 的 android-sdk）
```bash
sudo apt-get install -y android-sdk android-sdk-build-tools android-sdk-platform-23
cd macos-apk
bash build_apk.sh          # 自动下载 r8(d8)，产出 macos-linux-desktop.apk
```
脚本不依赖 Android Studio / Gradle：用 `aapt2` 编译资源 → `javac` 编 Java → `d8` 转 DEX → `aapt add` 注入 → `zipalign` → `apksigner` 用 debug 证书签名。

## 修改桌面内容
改完 `../macos-linux.html` 后，重新拷进 assets 再打包：
```bash
cp ../macos-linux.html app/src/main/assets/macos-linux.html
bash build_apk.sh
```

## 安装到鸿蒙（卓易通）
1. 把 `macos-linux-desktop.apk` 传到手机（微信/USB/网盘均可）。
2. 用「卓易通」打开该 APK 完成安装。
3. 桌面图标「macOS 风格 Linux 桌面」启动即可。

> 若你的环境能直接装 APK（部分鸿蒙版本允许），也可直接用系统安装器。

## 说明
- 这是**前端仿真桌面**，不是内核级系统；在 WebView 内运行，完全离线、无需联网。
- 已对触屏做适配：进入应用自动跳过开机/登录动画，桌面图标支持点按打开。
- `minSdkVersion=21, targetSdkVersion=23`，兼容绝大多数 Android 兼容层。
