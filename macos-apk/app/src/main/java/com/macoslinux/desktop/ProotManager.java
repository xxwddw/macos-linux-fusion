package com.macoslinux.desktop;

import android.util.Log;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

/**
 * 真·用户态管理器：用 PRoot 在真实 arm64 Debian rootfs 目录里执行命令（Termux 式）。
 * 与模拟器不同，这里是“按命令”执行：网页终端每条命令调用一次 exec()。
 */
public class ProotManager {
    private static final String TAG = "ProotManager";
    private final String prootBin, rootfs;

    public ProotManager(String prootBin, String rootfs) {
        this.prootBin = prootBin;
        this.rootfs = rootfs;
    }

    public String exec(String cmd) {
        File bin = new File(prootBin);
        if (!bin.exists() || !bin.canExecute()) {
            return "[PRoot 不可用: " + prootBin + "]\n请把为鸿蒙/安卓编译的 proot 放到该路径。";
        }
        if (!new File(rootfs).isDirectory()) {
            return "[rootfs 不可用: " + rootfs + "]\n请先解压 arm64 rootfs（见 README）。";
        }
        String[] argv = { prootBin, "-S", rootfs, "--", "/bin/bash", "-c", cmd };
        try {
            ProcessBuilder pb = new ProcessBuilder(argv);
            pb.redirectErrorStream(true);
            Process p = pb.start();
            StringBuilder sb = new StringBuilder();
            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(p.getInputStream(), StandardCharsets.UTF_8))) {
                char[] buf = new char[1024];
                int n;
                while ((n = br.read(buf)) != -1) sb.append(buf, 0, n);
            }
            if (!p.waitFor(20, TimeUnit.SECONDS)) {
                p.destroyForcibly();
                sb.append("\n[命令执行超时]");
            }
            return sb.toString();
        } catch (Exception e) {
            return "[PRoot 执行错误: " + e.getMessage() + "]";
        }
    }
}
