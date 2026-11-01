# 真·宿主 Root 路线图（2026 可行版）

> 目标：让 DSH 成为设备上的**真 root 系统命令**（uid 0、能改 /system、锁屏后台常驻、完全控制设备）。
> 前提事实：华为 MatePad（HarmonyOS 7.0 SP8）**做不到**宿主 root（BL 锁死、无公开 exp、Magisk 不支持鸿蒙）。
> 结论：**唯一真路是换一台 BL 可解锁的设备**。下面是可落地的步骤。

---

## 一、先选一台"能真 root"的设备（别买错）

2026 年各品牌 root 可行性（来源：gizdev.com Rootable Android Phones 2026、thecustomrom.com）：

| 品牌 | 能否真 root | 难度 | 备注 |
|------|------------|------|------|
| **Google Pixel（含 Pixel Tablet）** | ✅ 全线 | 易 | `fastboot flashing unlock` 官方解锁，Magisk 改 init_boot 即可；社区最全 |
| **OnePlus（一加）** | ✅ 全线 | 易 | 官方解锁通道，二手 1500–3000 元，救砖成本低 |
| Nothing / Fairphone / Motorola（零售版） | ✅ | 易 | 解锁友好 |
| 小米 / Redmi / POCO | ⚠️ | 难 | 需 Mi Unlock 等 7–30 天 |
| **华为 / 荣耀** | ❌ | 不可能 | 你的 MatePad 在这 |
| 三星（新机）/ OPPO / vivo / iQOO / Asus | ❌/受限 | 难 | 新机已移除 OEM 解锁开关 |

**平板形态首选**：Pixel Tablet（可 root，二手可得）或确认带 OEM 解锁开关的 Lenovo Tab / Redmi 平板。
**买前必查**：设置→关于→连点版本号→开发者选项里**必须有「OEM 解锁」开关**，否则放弃。

---

## 二、拿到设备后的真实 root 步骤（以 Pixel / 类 GKI 设备为例）

1. **开发者选项**：设置→关于手机→连点版本号 7 下；开发者选项里开 **OEM 解锁 + USB 调试**。
2. **解锁 BL**（会清空数据，先备份）：
   ```
   adb reboot bootloader
   fastboot flashing unlock      # 音量键确认
   ```
3. **取 init_boot.img**：下载与你**精确版本号**一致的工厂包，解压出 `init_boot.img`。
4. **Magisk 修补**：手机装 Magisk v30.7（github.com/topjohnwu/Magisk）→ Install → 选并修补 init_boot.img → 生成 `magisk_patched.img`。
5. **刷入**：
   ```
   adb reboot bootloader
   fastboot flash init_boot magisk_patched.img
   fastboot reboot
   ```
6. **验证**：Magisk 显示 "Installed"，`su` 后提示符变 `#` → **真宿主 root 到手**（内核 5.10+ 也可用 KernelSU，更干净）。

> 内核 5.10+ 优先 KernelSU（不改 system 分区，systemless）；老内核用 Magisk。两者都给真 uid-0。

---

## 三、在真 root 设备上把 DSH 装成 root 系统命令

已 root 的安卓上，Termux 里 `su` 即是设备真 root。DSH 已有现成方案：

- **dsh-termux**（github.com/ErEbusE/dsh-termux）：在 Termux 用 glibc 运行时装官方 Node + DSH，**无需 root 也能跑**；**root 后 `su` 即真 root**。
  ```bash
  pkg install glibc-repo glibc glibc-runner
  curl -fsSL https://github.com/ErEbusE/dsh-termux/releases/latest/download/install.sh | bash -s -- -y
  ```
- **DSHBox**（github.com/WSK-build/DSHBox）：开源 App，本地跑完整 DSH（含 PRoot/Debian/Node/WebView），无需 Termux；root 后权限拉满。

**要"系统级"（改 /system、锁屏后台）**，在已 root 设备上这样做：
```bash
su                      # 切真 root
dsh "..."              # DSH 以 uid 0 运行，可读写 /system、常驻后台
```
或直接把 DSH 装进系统分区做常驻服务（Magisk module / init.d）。

---

## 四、最终你能拿到什么（vs 你现在的 MatePad）

| 能力 | MatePad（现） | 换 Pixel/一加 + root 后 |
|------|--------------|------------------------|
| DSH 当系统命令 | ❌ | ✅ |
| 真 root（uid 0） | ❌ | ✅ |
| 改 /system 系统文件 | ❌ | ✅ |
| 锁屏/后台继续干活 | ❌ | ✅ |
| 完全控制设备 | ❌ | ✅ |
| 只用一台设备 | ✅（但无能） | ✅（且全权） |

---

## 五、诚实边界

- 这条路**要换硬件**（一台 BL 可解锁的设备），不是在你现平板上改出来的——那是物理焊死的。
- root 有变砖/失保风险，但 Pixel/一加 是社区最成熟、救砖成本最低的选择。
- 如果你**只想在现 MatePad 上尽量多干活而不换机**，那只能停在沙箱层（HiSH/DSHBox 非 root 版），永远碰不到宿主。

## 六、下一步（你定）

1. 我帮你**选定具体机型 + 一键购买核对清单**（确认 OEM 解锁开关）。
2. 我直接**写一份"root 后 DSH 常驻系统服务"的脚本**（Magisk module / init.d），你 root 完直接刷。
3. 你先去搞设备，过程中任何一步我全程陪跑。
