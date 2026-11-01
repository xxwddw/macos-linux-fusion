package com.macoslinux.desktop;

import android.util.Log;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * 真·模拟器管理器：在设备上用 qemu-system-aarch64 引导真实 arm64 Linux。
 * 内核/内存盘/磁盘镜像均由外部提供（见 README），串口以 TCP 暴露到 127.0.0.1:2323，
 * APK 连接该端口，把真实系统的输出缓冲起来供网页终端轮询（emuRead），并把输入写回（emuWrite）。
 */
public class QemuManager {
    private static final String TAG = "QemuManager";
    private static final int SERIAL_PORT = 2323;

    private final String qemuBin, kernel, initrd, disk;
    private Process process;
    private Socket socket;
    private OutputStream out;
    private final StringBuilder buffer = new StringBuilder();
    private final Object bufLock = new Object();
    private volatile boolean running = false;

    public QemuManager(String qemuBin, String kernel, String initrd, String disk) {
        this.qemuBin = qemuBin;
        this.kernel = kernel;
        this.initrd = initrd;
        this.disk = disk;
    }

    public synchronized boolean start() {
        if (running) return true;
        File bin = new File(qemuBin);
        if (!bin.exists() || !bin.canExecute()) {
            Log.e(TAG, "QEMU 二进制不可用: " + qemuBin);
            return false;
        }
        if (!new File(kernel).exists() || !new File(initrd).exists() || !new File(disk).exists()) {
            Log.e(TAG, "缺少内核/内存盘/磁盘镜像");
            return false;
        }
        String[] cmd = {
                qemuBin,
                "-machine", "virt,gic-version=2",
                "-cpu", "cortex-a57",
                "-smp", "2", "-m", "2048",
                "-kernel", kernel,
                "-initrd", initrd,
                "-append", "console=ttyAMA0",
                "-drive", "file=" + disk + ",if=virtio,format=raw",
                "-serial", "tcp:127.0.0.1:" + SERIAL_PORT + ",server,nowait",
                "-display", "none", "-no-reboot"
        };
        try {
            ProcessBuilder pb = new ProcessBuilder(cmd);
            pb.redirectErrorStream(true);
            process = pb.start();
            running = true;
            new Thread(this::connectAndRead, "qemu-serial").start();
            return true;
        } catch (Exception e) {
            Log.e(TAG, "启动 QEMU 失败", e);
            running = false;
            return false;
        }
    }

    private void connectAndRead() {
        for (int i = 0; i < 75 && running; i++) {
            try {
                socket = new Socket("127.0.0.1", SERIAL_PORT);
                out = socket.getOutputStream();
                BufferedReader br = new BufferedReader(
                        new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
                String line;
                while (running && (line = br.readLine()) != null) {
                    synchronized (bufLock) { buffer.append(line).append("\n"); }
                }
                return;
            } catch (IOException e) {
                try { Thread.sleep(200); } catch (InterruptedException ie) { return; }
            }
        }
    }

    /** 取出并清空串口输出缓冲。 */
    public String readOutput() {
        synchronized (bufLock) {
            if (buffer.length() == 0) return "";
            String s = buffer.toString();
            buffer.setLength(0);
            return s;
        }
    }

    public void writeInput(String s) {
        if (out == null) return;
        try {
            out.write(s.getBytes(StandardCharsets.UTF_8));
            out.flush();
        } catch (IOException e) {
            Log.e(TAG, "写入串口失败", e);
        }
    }

    public synchronized void stop() {
        running = false;
        try { if (out != null) out.close(); } catch (IOException ignored) {}
        try { if (socket != null) socket.close(); } catch (IOException ignored) {}
        if (process != null) process.destroy();
        process = null;
    }

    public boolean isRunning() { return running; }
}
