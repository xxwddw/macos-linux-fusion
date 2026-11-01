#!/usr/bin/env bash
# =============================================================
#  fetch_assets.sh —— 构建时拉取「苹果原版素材」（不进 git）
#  仅用于本地构建 / 个人使用，请遵守 Apple 相关许可，勿再分发。
# =============================================================
set -u
cd "$(dirname "$0")"

# ---------- SF Pro 字体（来自 GitHub 镜像，已验证直连可用） ----------
FONT_REPO="https://raw.githubusercontent.com/sahibjotsaggu/San-Francisco-Pro-Fonts/master"
mkdir -p fonts
echo "[*] 拉取 SF Pro 字体 ..."
for f in \
  "SF-Pro-Display-Regular.otf" \
  "SF-Pro-Display-Medium.otf" \
  "SF-Pro-Text-Regular.otf" \
  "SF-Pro-Text-Semibold.otf"; do
  if [ ! -f "fonts/$f" ]; then
    curl -fsSL --max-time 60 -o "fonts/$f" "$FONT_REPO/$f" \
      && echo "OK  fonts/$f" || echo "MISS fonts/$f"
  else
    echo "skip fonts/$f (已存在)"
  fi
done

# ---------- 苹果官方壁纸 ----------
# LAYTAT/macOS-Wallpapers 仓库含完整官方壁纸，但体积较大（约 1.9 GB）。
# 下面提供「整仓克隆」与「按需取单张」两种方式，按需择一。
WALL_DIR=wallpapers
mkdir -p "$WALL_DIR"

# 方式 A：整仓浅克隆（最省事，得到全部官方壁纸）
# git clone --depth 1 https://github.com/LAYTAT/macOS-Wallpapers.git "$WALL_DIR/_full"

# 方式 B：只取几张代表壁纸（需已知文件名；示例为 Sonoma 官方壁纸）
# 如无法直连，请改用方式 A 或手动从 apple.com 官方页面下载后放入 $WALL_DIR。
echo "[*] 壁纸：建议用方式 A 浅克隆整仓；此处留空，构建脚本会退回到内置生成的蓝色渐变壁纸。"
echo "[*] 如需指定壁纸，把任意 jpg/png 放到 $WALL_DIR/ 并在 build_iso.sh 的 WALL 变量指向它。"

echo "=== 当前素材 ==="
ls -lh fonts/ 2>/dev/null | awk '{print $5, $9}'
ls -lh "$WALL_DIR"/ 2>/dev/null | awk '{print $5, $9}'
