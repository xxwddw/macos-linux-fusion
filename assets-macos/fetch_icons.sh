#!/usr/bin/env bash
set -u
cd /workspace/assets-macos
mkdir -p icons
SLUGS=(
  wechat-QIcTG413MH
  adobe-photoshop-2ZwsaHa0CB
  adobe-creative-cloud-nCvWBotv6A
  adobe-illustrator-C9xVLliyPV
  adobe-after-effects-y7pYyJTBhu
  adobe-indesign-AMW8HMKP1C
  kdenlive-fmhrenSPlj
  warp-b0vlBEzgfj
  intellij-idea-MzJGxpYdjl
  zed-wgafyS8Bfo
  craft-QjUy3PLwVO
  redis-0M3AUPnqby
  safari-axXbZ8kQ2m
  firefox-macos-27-nxwoy4uDAe
  terminal-y6K9mN2xQp
  finder-AbCdEf1234
)
for s in "${SLUGS[@]}"; do
  html=$(curl -s --max-time 20 "https://macosicons.com/icon/$s")
  url=$(printf '%s' "$html" | grep -oiE 'https://s3-new\.macosicons\.com/[^"]+\.png' | head -1)
  if [ -n "$url" ]; then
    fn=$(printf '%s' "$s" | cut -d- -f1)
    curl -s --max-time 25 -o "icons/$fn.png" "$url" && echo "OK $fn"
  else
    echo "MISS $s"
  fi
done
echo "=== 已下图标 ==="
ls -lh icons/ | awk '{print $5, $9}'
