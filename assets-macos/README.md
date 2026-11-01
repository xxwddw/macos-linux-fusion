# 苹果原版素材（assets-macos）

本目录**只放抓取脚本，不放专有二进制**。构建 ISO 前请先跑下面的脚本把苹果原版素材拉到本地（字体/壁纸/图标），它们仅供本地构建与个人使用，**不随仓库分发，请勿再分发**。

## 脚本

| 脚本 | 作用 | 拉取后落点 |
|------|------|-----------|
| `fetch_icons.sh` | 抓取真实 macOS 应用图标（macosicons.com 的 S3 真实提取图） | `icons/` |
| `fetch_assets.sh` | 抓取 SF Pro 字体 + 苹果官方壁纸 | `fonts/` `wallpapers/` |

```bash
bash fetch_icons.sh
bash fetch_assets.sh
```

## 素材来源与许可

- **SF Pro 字体**：来自 GitHub 镜像 `sahibjotsaggu/San-Francisco-Pro-Fonts`（Apple 专有，个人使用）。
- **macOS 应用图标**：`macosicons.com` 的真实提取图标（社区资源）。
- **苹果官方壁纸**：`LAYTAT/macOS-Wallpapers`（Apple 专有，个人使用）。
- **WhiteSur 图标主题 / McMojave 光标主题**：开源项目，按其各自许可证使用，由 `build_iso.sh` 经 apt / 上游脚本安装。

## 备注

- 拉取失败不影响出盘：`build_iso.sh` 在缺字体/壁纸时会退回内置生成的蓝色渐变壁纸与系统默认字体。
- 若网络无法直连上述源，可手动下载对应文件放入 `fonts/`、`icons/`、`wallpapers/` 后继续构建。
