# 一体化桌面系统镜像（macOS 外观 · Windows 生态 · Linux 内核 · 触控）

把原来的 `linux-macos-desktop.iso` 改造为**一台机器四种气质**的可启动 Live 系统。

| 你要的 | 这套系统怎么实现 | 来源（真实下载/安装） |
|--------|----------------|----------------------|
| **MAC 的外观** | Web 桌面（dock/访达/启动台）+ 原生 WhiteSur 图标 + Materia-light 窗口主题 + McMojave 光标 + macOS 渐变壁纸 | GitHub 真实克隆 WhiteSur 图标/光标主题；Debian 官方 `materia-gtk-theme` |
| **Windows 生态** | 内置 **Wine 8.0（32/64 位全架构）**，直接运行 Windows 的 `.exe`；右键菜单含 `Wine 配置 / explorer / winetricks` | Debian 官方仓库 `wine` + `wine32` + `wine64` |
| **Linux 的轻便** | 单文件 Live ISO（xz 压缩，1.3GB），Debian 12 基础，无桌面全家桶，开机即桌面 | 沿用原 `build_iso.sh` 的 live-boot 方案 |
| **安卓手机端触控** | **onboard** 屏幕键盘随桌面自启；Web 桌面本身为触屏优化（大图标、点按交互） | Debian 官方 `onboard`、`xinput` |

> 把 ISO 写进 U 盘 / 虚拟机 / 平板的 Linux 容器即可启动。开机自动登录 `live` 用户，全屏加载 macOS 风格 Web 桌面。

## 启动后怎么用

- **MAC 外观**：开盖即 macOS 风格桌面（含 dock、访达、启动台、设置）。
- **Windows 生态**：按 `Ctrl+Alt+T` 开终端，输入：
  ```bash
  wine /路径/程序.exe      # 直接跑 Windows 软件
  winecfg                  # Wine 控制面板
  winetricks corefonts     # 装 Windows 字体
  ```
  桌面**右键** → “Windows 生态 (Wine)” 也能一键进入。
- **安卓触控**：屏幕键盘 `onboard` 已随桌面自启；触屏点按即可，右键弹出菜单含“屏幕键盘(触控)”。
- **MAC dock**：`plank` 已随桌面自启，原生应用与 Wine 程序都能钉在上面。

## 文件清单

- `linux-macos-desktop.iso`（1.3GB，可启动）—— 改造后的成品镜像
- `build_iso.sh` —— 重建脚本（已追加“应用外观/触控配置”步骤，重跑即重新生成 ISO）
- `index.html / styles.css / app.js / apps.js` —— macOS 风格 Web 桌面（kiosk 加载）
- `/root/iso/rootfs/opt/setup_final.sh` —— 镜像内外观/触控/ dock 配置脚本（被 build_iso.sh 自动调用）

## 关于“真实 macOS / Windows 下载”

- **macOS 外观**用的是开源 WhiteSur 主题（GitHub 官方仓库真实克隆），不是 macOS 本体——真·macOS 只能跑在 Apple 硬件或黑苹果（x86 PC + OpenCore），无法塞进这个 Debian 镜像。
- **Windows** 通过 Wine 运行 Windows 软件（兼容层），不是 Windows 内核；要真 Windows 需另装虚拟机镜像。
- 两者都按你说的“换种方式下载”——GitHub tarball 被墙就改用 `git clone`，apt 没有的包就走上游脚本，全部落地成功。

## 真机/真平板落地说明

- **x86 PC / 虚拟机**：直接引导 ISO，四项全生效。
- **ARM 平板（如你的 MatePad）**：本 ISO 是 amd64，需在平板的 Linux 容器（如 HiSH/PRoot-distro）里用 `qemu-x86_64` 跑，或直接重新 build 一份 `arm64` 版（把 `build_iso.sh` 里的 `amd64` 换成 `arm64`、`live-boot` 不变即可）。触控与 Wine 在 arm64 上同样可用（Wine 支持 arm64 + box86/64）。
