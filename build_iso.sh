#!/usr/bin/env bash
# =============================================================
#  build_iso.sh —— 把 macOS 风格 Web 桌面打包成真正可引导的 Linux Live ISO
#  依赖：debootstrap 已生成的 rootfs + squashfs-tools + xorriso + grub*
#  用法：sudo bash build_iso.sh
# =============================================================
set -e
ROOTFS=/root/iso/rootfs
ISO=/root/iso/iso_root
OUT=/workspace/linux-macos-desktop.iso
DESKTOP_SRC=/workspace            # 含 index.html / styles.css / app.js / apps.js
LOG=/tmp/build_iso.log

exec > >(tee -a "$LOG") 2>&1
echo "===== build start $(date) ====="

# ---------- 0. 复制桌面文件到 rootfs ----------
echo "[*] 复制 Web 桌面到 /opt/desktop"
mkdir -p "$ROOTFS/opt/desktop"
cp -f "$DESKTOP_SRC/index.html" "$DESKTOP_SRC/styles.css" \
      "$DESKTOP_SRC/app.js" "$DESKTOP_SRC/apps.js" "$ROOTFS/opt/desktop/"
cat > "$ROOTFS/opt/desktop/README.txt" <<'EOF'
macOS 风格 Linux 桌面（真·openbox 桌面 + 苹果原版素材）。
外观：苹果真·SF Pro 字体 + WhiteSur 图标 + McMojave 光标 + 苹果官方壁纸。
桌面里按 Ctrl+Alt+T 打开真实终端（xterm）；可在此运行 npx @deepseek-ai/dsh web 启动 DSH。
（/opt/desktop 为可选的网页桌面资源，已不再默认加载。）
EOF

# ---------- 1. 挂载虚拟文件系统 ----------
echo "[*] 绑定 /dev /proc /sys"
mount --bind /dev "$ROOTFS/dev" 2>/dev/null || true
mount --bind /proc "$ROOTFS/proc"
mount --bind /sys "$ROOTFS/sys"
mount --bind /dev/pts "$ROOTFS/dev/pts" 2>/dev/null || true
cp /etc/resolv.conf "$ROOTFS/etc/resolv.conf"

# ---------- 2. chroot 内配置 ----------
echo "[*] 进入 chroot 安装内核/live-boot/Xorg/openbox/xterm/Chromium 并配置 kiosk"
chroot "$ROOTFS" /bin/bash -c '
set -e
export DEBIAN_FRONTEND=noninteractive
export LC_ALL=C.UTF-8 LANG=C.UTF-8

echo "[chroot] apt update"; apt-get update -y

echo "[chroot] 安装内核 + live-boot"
apt-get install -y --no-install-recommends \
  linux-image-amd64 live-boot live-tools initramfs-tools \
  systemd systemd-sysv

echo "[chroot] 安装图形栈 + openbox + xterm + Chromium"
apt-get install -y --no-install-recommends \
  xserver-xorg-core xserver-xorg xinit x11-xserver-utils \
  xserver-xorg-video-all xserver-xorg-input-all \
  openbox xterm chromium fonts-dejavu fonts-noto-core sudo curl ca-certificates

echo "[chroot] 创建 live 用户"
id live >/dev/null 2>&1 || useradd -m -s /bin/bash live
echo "live:live" | chpasswd
echo "live ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/live
chmod 440 /etc/sudoers.d/live

echo "[chroot] tty1 自动登录"
mkdir -p /etc/systemd/system/getty@tty1.service.d
cat > /etc/systemd/system/getty@tty1.service.d/autologin.conf <<AUTO
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin live --noclear %I \$TERM
AUTO

echo "[chroot] 配置 startx（openbox 会话 + Chromium kiosk + Ctrl+Alt+T 终端）"
cat > /home/live/.bash_profile <<BASH
if [ -z "\$DISPLAY" ] && [ "\$(tty)" = "/dev/tty1" ]; then
  exec startx
fi
BASH

cat > /home/live/.xinitrc <<XINIT
#!/bin/sh
xsetroot -solid "#0b0f15"
exec openbox-session
XINIT
chmod +x /home/live/.xinitrc

mkdir -p /home/live/.config/openbox
cat > /home/live/.config/openbox/rc.xml <<OB
<?xml version="1.0" encoding="UTF-8"?>
<openbox_config xmlns="http://openbox.org/3.4/rc">
  <keyboard>
    <keybind key="C-A-T">
      <action name="Execute"><execute>xterm -fullscreen</execute></action>
    </keybind>
    <keybind key="A-F4">
      <action name="Close"/></keybind>
  </keyboard>
  <mouse>
    <context name="Root">
      <mousebind button="Right" action="Press">
        <action name="ShowMenu"><menu>root-menu</menu></action>
      </mousebind>
    </context>
  </mouse>
  <menu id="root-menu" label="DSH Linux">
    <item label="终端 Terminal"><action name="Execute"><execute>xterm</execute></action></item>
    <item label="退出 Exit"><action name="Exit"/></item>
  </menu>
</openbox_config>
OB
chown -R live:live /home/live

echo "[chroot] 主机名 / hosts"
echo "macos-linux" > /etc/hostname
grep -q "127.0.0.1 macos-linux" /etc/hosts || echo "127.0.0.1 macos-linux" >> /etc/hosts

echo "[chroot] 尽力预装 Node22 + DSH（失败不阻断出盘）"
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null 2>&1 || true
apt-get install -y nodejs >/dev/null 2>&1 || true
npm i -g @deepseek-ai/dsh >/dev/null 2>&1 || echo "[warn] dsh 预装失败，可在系统内 npx @deepseek-ai/dsh 运行"

echo "[chroot] 重新生成 initramfs（含 live-boot 钩子）"
update-initramfs -c -k all

echo "[chroot] 应用 macOS 外观 / 触控 / dock 配置"
bash /opt/setup_final.sh

echo "[chroot] 清理"
apt-get clean
rm -rf /var/lib/apt/lists/*
'

# ---------- 3. 卸载绑定 ----------
echo "[*] 卸载绑定"
umount "$ROOTFS/dev/pts" 2>/dev/null || true
umount "$ROOTFS/sys" 2>/dev/null || true
umount "$ROOTFS/proc" 2>/dev/null || true
umount "$ROOTFS/dev" 2>/dev/null || true

# ---------- 4. 抽取内核与 initrd ----------
echo "[*] 抽取 vmlinuz / initrd"
mkdir -p "$ISO/live" "$ISO/boot/grub"
VMLINUZ=$(ls "$ROOTFS/boot/vmlinuz-"* | head -1)
INITRD=$(ls "$ROOTFS/boot/initrd.img-"* | head -1)
cp "$VMLINUZ" "$ISO/live/vmlinuz"
cp "$INITRD" "$ISO/live/initrd.img"

# ---------- 5. 打包 squashfs ----------
echo "[*] mksquashfs（xz 压缩；仅排除虚拟目录内容，保留空挂载点目录）"
rm -f "$ISO/live/filesystem.squashfs"
mkdir -p "$ROOTFS/dev" "$ROOTFS/proc" "$ROOTFS/sys" "$ROOTFS/run" "$ROOTFS/tmp"
chmod 1777 "$ROOTFS/tmp" 2>/dev/null; chmod 755 "$ROOTFS/run" 2>/dev/null
mksquashfs "$ROOTFS" "$ISO/live/filesystem.squashfs" -comp xz -wildcards \
  -e 'proc/*' 'sys/*' 'dev/*' 'run/*' 'tmp/*'

# ---------- 6. GRUB 配置 ----------
echo "[*] 写 grub.cfg"
cat > "$ISO/boot/grub/grub.cfg" <<GRUB
set timeout=5
set default=0
insmod all_video
menuentry "macOS 风格 Linux 桌面 (Live)" {
    linux /live/vmlinuz boot=live components quiet splash username=live
    initrd /live/initrd.img
}
menuentry "macOS 风格 Linux 桌面 (Live, 调试)" {
    linux /live/vmlinuz boot=live components username=live
    initrd /live/initrd.img
}
GRUB

# ---------- 7. 生成 ISO ----------
echo "[*] grub-mkrescue 生成 $OUT"
rm -f "$OUT"
grub-mkrescue -o "$OUT" "$ISO" || {
  echo "[!] grub-mkrescue 失败，尝试 xorriso 直出"
  xorriso -as mkisofs -o "$OUT" \
    -isohybrid-mbr /usr/lib/ISOLINUX/isohdpfx.bin \
    -c boot.cat -b isolinux.bin -no-emul-boot -boot-load-size 4 -boot-info-table \
    -eltorito-alt-boot -e boot/grub/efi.img -no-emul-boot -isohybrid-gpt-basdat \
    "$ISO"
}
echo "[*] 产物："; ls -lh "$OUT"
echo "===== build done $(date) ====="
