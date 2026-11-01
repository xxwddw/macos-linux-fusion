package com.macoslinux.desktop;

import android.webkit.JavascriptInterface;
import java.lang.ref.WeakReference;

/**
 * JS 桥接对象：注入到 WebView 的 window.HarmonyShell。
 * 三种模式下，网页终端通过它访问真系统：
 *   - exec(cmd)      真·用户态（PRoot）：在真实 arm64 rootfs 里执行命令
 *   - emuStart()     真·模拟器（QEMU）：引导真实 arm64 Linux
 *   - emuRead()      读取 QEMU 串口输出（真实系统的回显/结果）
 *   - emuWrite(s)    把输入写入 QEMU 串口
 *   - emuStop()      关闭 QEMU
 */
public class HarmonyShell {
    public static final String MODE_SIM = "sim";
    public static final String MODE_USER = "user";
    public static final String MODE_EMU = "emu";

    private final WeakReference<MainActivity> activityRef;

    public HarmonyShell(MainActivity activity) {
        this.activityRef = new WeakReference<>(activity);
    }

    @JavascriptInterface
    public String getMode() {
        MainActivity a = activityRef.get();
        return a != null ? a.getCurrentModeName() : MODE_SIM;
    }

    /** 真·用户态：PRoot 在真实 arm64 Debian rootfs 中执行命令，返回输出。 */
    @JavascriptInterface
    public String exec(final String cmd) {
        MainActivity a = activityRef.get();
        if (a == null) return "";
        return a.getProotManager().exec(cmd);
    }

    /** 真·模拟器：启动 QEMU（若已在运行则直接返回 ok）。 */
    @JavascriptInterface
    public String emuStart() {
        MainActivity a = activityRef.get();
        if (a == null) return "no-activity";
        return a.getQemuManager().start() ? "ok" : "error";
    }

    /** 读取 QEMU 串口累积输出（读取后清空缓冲区）。 */
    @JavascriptInterface
    public String emuRead() {
        MainActivity a = activityRef.get();
        if (a == null) return "";
        return a.getQemuManager().readOutput();
    }

    /** 把字符串（含换行）写入 QEMU 串口，即发给真实系统的 shell。 */
    @JavascriptInterface
    public void emuWrite(String s) {
        MainActivity a = activityRef.get();
        if (a == null) return;
        a.getQemuManager().writeInput(s);
    }

    /** 关闭 QEMU 模拟器。 */
    @JavascriptInterface
    public void emuStop() {
        MainActivity a = activityRef.get();
        if (a == null) return;
        a.getQemuManager().stop();
    }
}
