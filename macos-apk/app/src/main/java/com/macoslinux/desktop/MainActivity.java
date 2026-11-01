package com.macoslinux.desktop;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.Toast;

import java.io.File;

/**
 * 鸿蒙端（卓易通等 Android 兼容层）三模启动器：
 *   - 仿真(sim)        ：纯网页 macOS 风格 Linux 桌面（内置假 shell）
 *   - 真用户态(user)    ：PRoot + 真实 arm64 Debian rootfs，终端执行真实命令（Termux 式）
 *   - 真模拟器(emu)     ：QEMU 引导真实 arm64 Linux，网页终端连接其串口
 *
 * 真系统所需的二进制与镜像（qemu-system-aarch64 / proot / vmlinuz / initramfs.gz /
 * debian-arm64.img / rootfs）需放到 getExternalFilesDir("harmony") 下，详见 README。
 */
public class MainActivity extends Activity {
    private WebView webView;
    private QemuManager qemuManager;
    private ProotManager prootManager;
    private String currentMode = HarmonyShell.MODE_SIM;

    private File baseDir;
    private Button btnSim, btnUser, btnEmu;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                             WindowManager.LayoutParams.FLAG_FULLSCREEN);

        baseDir = new File(getExternalFilesDir(null), "harmony");
        baseDir.mkdirs();

        qemuManager = new QemuManager(
                new File(baseDir, "qemu-system-aarch64").getAbsolutePath(),
                new File(baseDir, "vmlinuz-6.1.0-50-arm64").getAbsolutePath(),
                new File(baseDir, "initramfs.gz").getAbsolutePath(),
                new File(baseDir, "debian-arm64.img").getAbsolutePath());
        prootManager = new ProotManager(
                new File(baseDir, "proot").getAbsolutePath(),
                new File(baseDir, "rootfs").getAbsolutePath());

        // 顶部模式选择栏 + 下方 WebView
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);

        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER);
        bar.setBackgroundColor(Color.parseColor("#1b1b1f"));
        int h = (int) (48 * getResources().getDisplayMetrics().density);
        bar.setLayoutParams(new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, h));
        btnSim  = makeModeButton("仿真",     HarmonyShell.MODE_SIM);
        btnUser = makeModeButton("真用户态", HarmonyShell.MODE_USER);
        btnEmu  = makeModeButton("真模拟器", HarmonyShell.MODE_EMU);
        bar.addView(btnSim); bar.addView(btnUser); bar.addView(btnEmu);
        root.addView(bar);

        webView = new WebView(this);
        webView.setLayoutParams(new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        root.addView(webView);
        setContentView(root);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setSupportZoom(false);

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                injectMode();
            }
        });
        webView.addJavascriptInterface(new HarmonyShell(this), "HarmonyShell");
        webView.loadUrl("file:///android_asset/macos-linux.html");

        setMode(HarmonyShell.MODE_SIM);
    }

    private Button makeModeButton(String label, final String mode) {
        Button b = new Button(this);
        b.setText(label);
        b.setTextSize(13);
        b.setAllCaps(false);
        int p = (int) (10 * getResources().getDisplayMetrics().density);
        b.setPadding(p, 0, p, 0);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.MATCH_PARENT, 1f);
        b.setLayoutParams(lp);
        b.setOnClickListener(v -> setMode(mode));
        return b;
    }

    private void updateBar() {
        int on = Color.parseColor("#0a84ff"), off = Color.parseColor("#2c2c30");
        btnSim.setBackgroundColor(currentMode.equals(HarmonyShell.MODE_SIM)  ? on : off);
        btnUser.setBackgroundColor(currentMode.equals(HarmonyShell.MODE_USER) ? on : off);
        btnEmu.setBackgroundColor(currentMode.equals(HarmonyShell.MODE_EMU)  ? on : off);
    }

    private void injectMode() {
        webView.evaluateJavascript("window.__HARMONY_MODE__='" + currentMode + "';", null);
    }

    public void setMode(String mode) {
        // 离开模拟器模式时关闭 QEMU
        if (!mode.equals(HarmonyShell.MODE_EMU) && currentMode.equals(HarmonyShell.MODE_EMU)) {
            qemuManager.stop();
        }
        currentMode = mode;
        if (mode.equals(HarmonyShell.MODE_EMU)) {
            if (!qemuManager.start()) {
                Toast.makeText(this, "QEMU 启动失败：请确认 baseDir 下的 qemu/内核/镜像就绪",
                        Toast.LENGTH_LONG).show();
            }
        } else if (mode.equals(HarmonyShell.MODE_USER)) {
            ensureRootfs();
        }
        updateBar();
        injectMode();
    }

    /** 用户态首次使用前，把 rootfs 压缩包解压到 baseDir/rootfs（Android 自带 tar）。 */
    private void ensureRootfs() {
        File rootfs = new File(baseDir, "rootfs");
        if (rootfs.isDirectory()) return;
        File tar = new File(baseDir, "debian-arm64-rootfs.tar.xz");
        if (!tar.exists()) return;
        try {
            Process p = Runtime.getRuntime().exec(
                    new String[]{"tar", "xf", tar.getAbsolutePath(), "-C", baseDir.getAbsolutePath()});
            p.waitFor();
        } catch (Exception e) {
            Toast.makeText(this, "rootfs 解压失败: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    public String getCurrentModeName() { return currentMode; }
    public QemuManager getQemuManager() { return qemuManager; }
    public ProotManager getProotManager() { return prootManager; }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        qemuManager.stop();
        if (webView != null) { webView.destroy(); webView = null; }
        super.onDestroy();
    }
}
