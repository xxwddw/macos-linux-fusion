# macOS-Linux Fusion · 四合一系统

> **Windows 生态 + macOS 外观 + Linux 轻便 + 安卓手机触控**
> 一台机器，四种气质。内核是真正的 Linux（Debian），外观套苹果原版素材，
> 用 Wine 跑 Windows 软件，用安卓 APK 把同款桌面搬上手机触屏。

---

## 这是什么

本项目把四件事融进同一个可启动系统与一个安卓 App：

| 你要的 | 这套系统怎么实现 | 来源（真实下载 / 安装） |
|--------|----------------|--------------------------|
| **macOS 的外观** | 真·SF Pro 字体 + WhiteSur 图标 + Materia-light 窗口主题 + McMojave 光标 + 苹果官方壁纸 | 苹果字体/壁纸按构建脚本从上游拉取；WhiteSur / McMojave 为 GitHub 真实开源主题 |
| **Windows 生态** | 内置 **Wine 8.0（32/64 位全架构）**，直接运行 Windows 的 `.exe` | Debian 官方仓库 `wine` + `wine32` + `wine64` |
| **Linux 的轻便** | 单文件 Live ISO（xz 压缩，约 1.3 GB），Debian 12 基础，无桌面全家桶，开机即桌面 | 沿用 `build_iso.sh` 的 live-boot 方案（openbox 会话） |
| **安卓手机触控** | 桌面内 `onboard` 屏幕键盘随桌面自启；另有独立安卓 APK（WebView 壳 + PRoot/QEMU），手机上直接跑同款桌面甚至 Linux | Debian `onboard`；`macos-apk/` 工程 |

> 把 ISO 写进 U 盘 / 虚拟机 / 平板的 Linux 容器即可启动。开机自动登录 `live` 用户进入 macOS 风格桌面。

---

## 架构

```
┌──────────────────────────────────────────────────────────┐
│  安卓 APK (macos-apk/)                                    │
│   WebView 全屏加载 macos-linux.html                       │
│   └─ ProotManager / QemuManager：手机里直接跑 Linux       │
└───────────────────────────┬──────────────────────────────┘
                            │ 同一份前端 (web-desktop/)
┌───────────────────────────┴──────────────────────────────┐
│  Live ISO (build_iso.sh → linux-macos-desktop.iso)        │
│   ├─ Linux 内核 (Debian 12, amd64)      ← Linux 的轻便    │
│   ├─ openbox 会话 + plank dock + onboard  ← 安卓手机触控   │
│   ├─ Wine 8.0                           ← Windows 生态     │
│   └─ SF Pro / WhiteSur / McMojave / 壁纸 ← macOS 的外观   │
└──────────────────────────────────────────────────────────┘
```

---

## 快速开始

### 1. PC / 虚拟机（最省事）
- **虚拟机**（VMware / VirtualBox / QEMU）：把 `linux-macos-desktop.iso` 当光盘启动。
- **物理机 U 盘**：`dd if=linux-macos-desktop.iso of=/dev/sdX bs=4M`，或用 Ventoy / Rufus。
- 开机自动登录 `live` 用户，进入 macOS 风格桌面。

> 注：ISO 体量大（约 1.3 GB），**不进 git**。请按下方「从源码构建」自己生成，或单独分发。

### 2. 安卓手机 / 鸿蒙（卓易通）
- 安装 `macos-apk/macos-linux-desktop.apk`（已用 debug 证书签名，可直接装）。
- 或用浏览器直接打开 `web-desktop/macos-linux.html`（单文件、自包含、已做触屏适配）。
- 详见 `macos-apk/README.md`。

### 3. 桌面内怎么用
- **macOS 外观**：开盖即 macOS 风格桌面（dock / 访达风格 / 设置）。
- **Windows 生态**：`Ctrl+Alt+T` 开终端，输入 `wine 程序.exe` 直接跑 Windows 软件；`winecfg` 调 Wine。
- **安卓触控**：屏幕键盘 `onboard` 随桌面自启；触屏点按即可。
- **MAC dock**：`plank` 随桌面自启，原生应用与 Wine 程序都能钉在上面。

---

## 目录结构

```
macos-linux-fusion/
├── build_iso.sh              # 把桌面打包成可引导 Live ISO（debootstrap rootfs → squashfs → grub）
├── assets-macos/
│   ├── fetch_icons.sh        # 抓取真实 macOS 应用图标（macosicons.com）
│   ├── fetch_assets.sh       # 抓取 SF Pro 字体 + 苹果壁纸（构建时用，不提交二进制）
│   └── README.md             # 素材来源与许可说明
├── macos-apk/                # 安卓 APK 工程（WebView 壳 + PRoot/QEMU）
│   ├── app/                  # Android 源码（MainActivity / ProotManager / QemuManager）
│   ├── build_apk.sh          # 一键打包（无需 Android Studio）
│   ├── macos-linux-desktop.apk  # 预编译可安装包
│   └── README.md
├── web-desktop/              # macOS 风格 Web 桌面前端（index.html / styles.css / app.js / apps.js）
│   └── macos-linux.html      # 单文件自包含版（给手机/浏览器直接用）
└── docs/
    ├── SYSTEM.md             # 一体化系统镜像说明（四栏对照）
    └── ANDROID-ROOT-ROADMAP.md  # 安卓真 root 路线图（想让 DSH 成为系统命令时参考）
```

---

## 从源码构建

### 前置依赖
```bash
# 宿主机
sudo apt-get install -y debootstrap squashfs-tools xorriso \
  grub-pc-bin grub-efi-amd64-bin mtools dosfstools
```

### 1. 拉取苹果原版素材（不进 git，构建时现拉）
```bash
bash assets-macos/fetch_icons.sh     # macOS 应用图标
bash assets-macos/fetch_assets.sh    # SF Pro 字体 + 苹果壁纸
```
拉取的字体放入 `assets-macos/fonts/`，图标放入 `assets-macos/icons/`，壁纸放入 `assets-macos/wallpapers/`。

### 2. 构建 ISO
`build_iso.sh` 在一个已 `debootstrap` 好的 Debian rootfs（`/root/iso/rootfs`）上做增量配置并出盘：
```bash
sudo bash build_iso.sh      # 产物：/workspace/linux-macos-desktop.iso
```
构建流程：复制桌面文件 → chroot 装内核/live-boot/Xorg/openbox/Wine → 套 macOS 外观与触控配置（`/opt/setup_final.sh`）→ mksquashfs(xz) → grub-mkrescue 出盘。

> 构建环境需能联网拉 Debian 包；约 15–25 分钟。成品为 BIOS+UEFI 双引导、可启动 Live 系统。

### 3. 构建安卓 APK
```bash
sudo apt-get install -y android-sdk android-sdk-build-tools android-sdk-platform-23
cd macos-apk && bash build_apk.sh   # 产出 macos-linux-desktop.apk
```

---

## 真机 / 平板落地

- **x86 PC / 虚拟机**：直接引导 ISO，四项全生效。
- **ARM 平板（如 MatePad）**：本 ISO 是 amd64，需在平板的 Linux 容器（HiSH / PRoot-distro）里用 `qemu-x86_64` 跑，或把 `build_iso.sh` 里的 `amd64` 换成 `arm64` 重新构建（触控与 Wine 在 arm64 上同样可用，Wine 支持 arm64 + box86/64）。
- **手机**：直接装 `macos-apk` 的 APK，或在浏览器打开 `macos-linux.html`。

---

## 许可与免责

- 代码与构建脚本以 **MIT** 许可证开源（见 `LICENSE`）。
- **苹果 SF Pro 字体、苹果官方壁纸**为 Apple 专有资源，**不随本仓库分发**，仅在本地构建时按 `fetch_assets.sh` 从上游拉取供个人使用，请遵守 Apple 相关许可，勿作再分发。
- WhiteSur 图标主题、McMojave 光标主题为其各自开源项目的成果，按其许可证使用。
- 本项目用于学习与研究；macOS 外观通过开源主题与素材还原，并非 macOS 本体（真·macOS 仅能运行于 Apple 硬件或黑苹果）。
