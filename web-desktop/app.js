/* ============================================================
   桌面引擎：开机/登录、菜单栏、Dock 放大、窗口管理、
   聚光灯光标、Launchpad、聚焦搜索、右键菜单、设置联动
   ============================================================ */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const desktop = $("#desktop");

  /* ---------- 跟随光标的聚光灯（让光标处更亮） ---------- */
  const glow = $("#cursor-glow");
  window.addEventListener("mousemove", (e) => {
    glow.style.setProperty("--mx", e.clientX + "px");
    glow.style.setProperty("--my", e.clientY + "px");
  }, { passive: true });

  /* ---------- 开机 → 登录 → 桌面 ---------- */
  const boot = $("#boot");
  const params = new URLSearchParams(location.search);
  const skipLogin = params.has("skip") || params.has("kiosk");

  function startBoot() {
    requestAnimationFrame(() => boot.classList.add("done"));
    const go = () => {
      boot.classList.add("fade");
      setTimeout(() => {
        boot.classList.add("hidden");
        if (skipLogin) enterDesktop();
        else showLogin();
      }, 600);
    };
    if (skipLogin) { setTimeout(go, 200); }
    else setTimeout(go, 2400);
  }

  function showLogin() {
    const login = $("#login");
    login.classList.remove("hidden");
    tickClock($("#login-clock"), true);
    $("#login-form").addEventListener("submit", (e) => {
      e.preventDefault();
      login.classList.add("fade");
      setTimeout(() => { login.classList.add("hidden"); enterDesktop(); }, 500);
    });
    $("#login-pass").focus();
  }

  function enterDesktop() {
    desktop.classList.remove("hidden");
    buildDesktopIcons();
    buildDock();
    buildLaunchpad();
    bindMenubar();
    bindContextMenu();
    bindGlobalKeys();
    tickClock();
    setInterval(tickClock, 1000 * 30);
    // 默认打开「访达」和「终端」各一个，营造桌面已启动的感觉
    openApp("finder");
    setTimeout(() => openApp("notes"), 250);
  }

  /* ---------- 时钟 / 日期 ---------- */
  function tickClock(el, force) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const t = `${hh}:${mm}`;
    const wd = ["周日","周一","周二","周三","周四","周五","周六"][now.getDay()];
    const d = `${wd} ${now.getMonth() + 1}月${now.getDate()}日`;
    if (el) el.textContent = t;
    const c = $("#mb-clock"); if (c) c.textContent = t;
    const dt = $("#mb-date"); if (dt) dt.textContent = d;
  }

  /* ---------- 桌面图标 ---------- */
  function buildDesktopIcons() {
    const wrap = $("#desktop-icons");
    wrap.innerHTML = DESKTOP_ICONS.map((it, i) =>
      `<div class="dicon" data-open="${it.open}">
         <div class="glyph" style="background:${it.color}">${it.glyph}</div>
         <div class="label">${it.label}</div>
       </div>`).join("");
    const open = (el) => openApp(el.dataset.open);
    wrap.querySelectorAll(".dicon").forEach(el => {
      el.addEventListener("click", open);
      el.addEventListener("dblclick", open);
    });
  }

  /* ---------- Dock ---------- */
  function buildDock() {
    const dock = $("#dock");
    dock.innerHTML = "";
    DOCK_ORDER.forEach((id) => {
      if (id === "__sep__") { const s = document.createElement("div"); s.className = "dock-sep"; dock.appendChild(s); return; }
      if (id === "launchpad") {
        const a = makeDockApp(GLYPHS.launchpad, "linear-gradient(135deg,#6a5cff,#16c2c2)", "启动台");
        a.onclick = toggleLaunchpad;
        dock.appendChild(a); return;
      }
      const app = APPS[id];
      const a = makeDockApp(app.glyph, app.color, app.name);
      a.dataset.appid = id;
      a.onclick = () => openApp(id);
      dock.appendChild(a);
    });
    // 放大效果
    const apps = [...dock.querySelectorAll(".dock-app")];
    const dockWrap = $("#dock-wrap");
    dockWrap.addEventListener("mousemove", (e) => {
      const rect = dockWrap.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      apps.forEach((a) => {
        const r = a.getBoundingClientRect();
        const ax = r.left + r.width / 2 - rect.left;
        const dist = Math.abs(mx - ax);
        const scale = Math.max(1, 1 + 0.6 * Math.exp(-(dist * dist) / (2 * 26 * 26)));
        a.style.setProperty("--scale", scale.toFixed(3));
      });
    });
    dockWrap.addEventListener("mouseleave", () =>
      apps.forEach((a) => a.style.setProperty("--scale", "1")));
  }
  function makeDockApp(icon, color, title) {
    const a = document.createElement("div");
    a.className = "dock-app";
    a.title = title;
    a.style.background = color;
    a.innerHTML = `${icon}<span class="dot"></span>`;
    return a;
  }
  function markRunning(id, on) {
    const el = $(`.dock-app[data-appid="${id}"]`);
    if (el) el.querySelector(".dot").style.opacity = on ? "1" : "0";
  }

  /* ---------- Launchpad ---------- */
  function buildLaunchpad() {
    const grid = $("#lp-grid");
    const all = Object.entries(APPS);
    grid.innerHTML = all.map(([id, a]) =>
      `<div class="lp-app" data-open="${id}">
         <div class="ic" style="background:${a.color}">${a.glyph}</div>
         <div class="nm">${a.name}</div>
       </div>`).join("");
    grid.querySelectorAll(".lp-app").forEach(el =>
      el.onclick = () => { toggleLaunchpad(false); openApp(el.dataset.open); });
    $("#lp-search-input").addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      grid.querySelectorAll(".lp-app").forEach(el => {
        const nm = el.querySelector(".nm").textContent.toLowerCase();
        el.style.display = (!q || nm.includes(q)) ? "" : "none";
      });
    });
  }
  function toggleLaunchpad(force) {
    const lp = $("#launchpad");
    const show = force === undefined ? lp.classList.contains("hidden") : force;
    lp.classList.toggle("hidden", !show);
    if (show) $("#lp-search-input").value = "", $("#lp-search-input").focus();
  }

  /* ---------- 窗口管理 ---------- */
  const windowsBox = $("#windows");
  let zTop = 100;
  const openWins = {}; // appId -> winEl

  function openApp(id) {
    const app = APPS[id];
    if (!app) return;
    if (openWins[id] && !openWins[id].dataset.minimized) { focusWin(openWins[id]); return; }
    if (openWins[id] && openWins[id].dataset.minimized) { restoreWin(openWins[id]); return; }

    const win = document.createElement("div");
    win.className = "win focus-anim";
    win.dataset.appid = id;
    const offset = (Object.keys(openWins).length % 6) * 26;
    const w = Math.min(app.dock ? 760 : 440, Math.max(300, window.innerWidth - 24));
    const h = Math.min(app.dock ? 480 : 400, Math.max(220, window.innerHeight - 110));
    win.style.width = w + "px";
    win.style.height = h + "px";
    win.style.left = Math.max(8, Math.round((window.innerWidth - w) / 2 + (offset - 65))) + "px";
    win.style.top = Math.max(32, 80 + offset) + "px";
    win.style.zIndex = ++zTop;

    win.innerHTML = `
      <div class="titlebar">
        <div class="traffic">
          <span class="light close" title="关闭"><svg viewBox="0 0 8 8"><path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke-width="1.3" fill="none" stroke-linecap="round"/></span>
          <span class="light min" title="最小化"><svg viewBox="0 0 8 8"><path d="M2 4h4" stroke-width="1.3" fill="none" stroke-linecap="round"/></span>
          <span class="light max" title="缩放"><svg viewBox="0 0 8 8"><path d="M2 2h4v4H2z" stroke-width="1.3" fill="none"/></span>
        </div>
        <div class="win-title">${app.title || app.name}</div>
      </div>
      <div class="win-body"></div>
      <div class="win-resize"></div>`;

    windowsBox.appendChild(win);
    openWins[id] = win;
    markRunning(id, true);

    // 内容渲染
    const body = win.querySelector(".win-body");
    try { app.render(body, { openApp, close: () => closeWin(win), api: DesktopAPI }); }
    catch (err) { body.innerHTML = `<div style="padding:20px;color:red">渲染出错：${escapeHTML(err.message)}</div>`; }

    // 交互绑定
    bindWin(win);
    focusWin(win);
    win.addEventListener("animationend", () => win.classList.remove("focus-anim"), { once: true });
  }

  function focusWin(win) {
    Object.values(openWins).forEach((w) => w.classList.add("inactive"));
    win.classList.remove("inactive");
    win.style.zIndex = ++zTop;
    const id = win.dataset.appid;
    const app = APPS[id];
    if (app) { $("#mb-appname").textContent = app.name; }
  }

  function closeWin(win) {
    win.classList.add("closing");
    setTimeout(() => {
      win.remove();
      const id = win.dataset.appid;
      delete openWins[id];
      markRunning(id, false);
    }, 180);
  }
  function minimizeWin(win) {
    win.dataset.minimized = "1";
    win.classList.add("minimizing");
    setTimeout(() => { win.classList.add("hidden"); win.classList.remove("minimizing"); }, 220);
  }
  function restoreWin(win) {
    win.classList.remove("hidden");
    delete win.dataset.minimized;
    focusWin(win);
  }
  function toggleMax(win) {
    if (win.dataset.maxed) {
      const r = JSON.parse(win.dataset.maxed);
      Object.assign(win.style, r);
      delete win.dataset.maxed;
    } else {
      win.dataset.maxed = JSON.stringify({
        left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height
      });
      win.style.left = "0px"; win.style.top = "26px";
      win.style.width = "100vw"; win.style.height = "calc(100vh - 26px - 80px)";
      focusWin(win);
    }
  }

  function bindWin(win) {
    const resize = win.querySelector(".win-resize");
    win.addEventListener("pointerdown", () => focusWin(win));
    // 缩放（Pointer Events：鼠标 + 触屏通用）
    resize.addEventListener("pointerdown", (e) => {
      e.preventDefault(); e.stopPropagation();
      try { resize.setPointerCapture(e.pointerId); } catch (_) {}
      const sw = win.offsetWidth, sh = win.offsetHeight;
      const sx = e.clientX, sy = e.clientY;
      const move = (ev) => {
        win.style.width = Math.max(280, Math.min(window.innerWidth - 20, sw + ev.clientX - sx)) + "px";
        win.style.height = Math.max(200, Math.min(window.innerHeight - 40, sh + ev.clientY - sy)) + "px";
      };
      const up = () => { resize.removeEventListener("pointermove", move); resize.removeEventListener("pointerup", up); };
      resize.addEventListener("pointermove", move);
      resize.addEventListener("pointerup", up);
    });
    // 交通灯
    win.querySelector(".light.close").onclick = (e) => { e.stopPropagation(); closeWin(win); };
    win.querySelector(".light.min").onclick = (e) => { e.stopPropagation(); minimizeWin(win); };
    win.querySelector(".light.max").onclick = (e) => { e.stopPropagation(); toggleMax(win); };
  }

  // 标题栏拖动（Pointer Events：鼠标 + 触屏通用，避免拖太快丢失）
  windowsBox.addEventListener("pointerdown", (e) => {
    const bar = e.target.closest(".titlebar");
    if (!bar || e.target.closest(".light")) return;
    e.preventDefault();
    const win = bar.closest(".win");
    try { win.setPointerCapture(e.pointerId); } catch (_) {}
    const startX = e.clientX, startY = e.clientY;
    const l = parseFloat(win.style.left), t = parseFloat(win.style.top);
    const move = (ev) => {
      win.style.left = Math.max(-win.offsetWidth + 80, Math.min(window.innerWidth - 80, l + ev.clientX - startX)) + "px";
      win.style.top = Math.max(26, Math.min(window.innerHeight - 40, t + ev.clientY - startY)) + "px";
    };
    const up = () => { win.removeEventListener("pointermove", move); win.removeEventListener("pointerup", up); };
    win.addEventListener("pointermove", move);
    win.addEventListener("pointerup", up);
  });

  /* ---------- 菜单栏 ---------- */
  function bindMenubar() {
    $("#apple-menu").onclick = (e) => {
      e.stopPropagation();
      const dd = $("#apple-dropdown");
      dd.innerHTML = `
        <div class="mi" data-a="about">关于本机 <span class="sc"></span></div>
        <div class="sep"></div>
        <div class="mi" data-a="settings">系统设置…</div>
        <div class="mi" data-a="lock">锁定屏幕</div>
        <div class="mi" data-a="restart">重新启动…</div>
        <div class="mi" data-a="shutdown">关机…</div>`;
      positionDropdown(dd, e.currentTarget, "mb-left");
      dd.querySelectorAll(".mi").forEach(m => m.onclick = () => {
        hideDropdown();
        const a = m.dataset.a;
        if (a === "about") openApp("about");
        else if (a === "settings") openApp("settings");
        else if (a === "lock") { desktop.classList.add("hidden"); showLogin(); }
        else if (a === "restart") location.reload();
        else if (a === "shutdown") { desktop.classList.add("hidden"); boot.classList.remove("hidden","fade"); $("#boot").style.background="#000"; }
      });
    };
    // 应用菜单（点击显示占位菜单）
    document.querySelectorAll(".mb-item").forEach(it => it.onclick = (e) => {
      e.stopPropagation();
      const dd = $("#apple-dropdown");
      const map = {
        file: [["新建窗口","⌘N"],["打开…","⌘O"],["sep"],["关闭窗口","⌘W"]],
        edit: [["撤销","⌘Z"],["重做","⇧⌘Z"],["sep"],["剪切","⌘X"],["拷贝","⌘C"],["粘贴","⌘V"]],
        view: [["进入全屏幕","⌃⌘F"],["显示标签页栏"]],
        go: [["前往文件夹…","⇧⌘G"],["个人收藏"]],
        window: [["最小化","⌘M"],["缩放"],["sep"],["全部置于顶层"]],
        help: [["macOS 风格 Linux 帮助"]]
      };
      const items = map[it.dataset.menu] || [];
      dd.innerHTML = items.map(x => x[0]==="sep" ? `<div class="sep"></div>`
        : `<div class="mi">${x[0]}<span class="sc">${x[1]||""}</span></div>`).join("");
      positionDropdown(dd, e.currentTarget, "mb-left");
    });
    document.addEventListener("click", hideDropdown);
  }
  function positionDropdown(dd, anchor, side) {
    dd.classList.remove("hidden");
    const r = anchor.getBoundingClientRect();
    dd.style.top = (r.bottom + 4) + "px";
    dd.style.left = Math.max(8, r.left) + "px";
  }
  function hideDropdown() { $("#apple-dropdown").classList.add("hidden"); }

  /* ---------- 右键菜单 ---------- */
  function bindContextMenu() {
    desktop.addEventListener("contextmenu", (e) => {
      if (e.target.closest(".win") || e.target.closest(".dock-wrap")) return;
      e.preventDefault();
      const cm = $("#context-menu");
      cm.innerHTML = `
        <div class="mi" data-a="wallpaper">更改桌面背景…</div>
        <div class="mi" data-a="term">打开终端</div>
        <div class="sep"></div>
        <div class="mi" data-a="about">关于本机</div>
        <div class="mi" data-a="lp">打开启动台</div>`;
      cm.classList.remove("hidden");
      cm.style.top = e.clientY + "px";
      cm.style.left = e.clientX + "px";
      cm.querySelectorAll(".mi").forEach(m => m.onclick = () => {
        cm.classList.add("hidden");
        const a = m.dataset.a;
        if (a === "wallpaper") openApp("settings");
        else if (a === "term") openApp("terminal");
        else if (a === "about") openApp("about");
        else if (a === "lp") toggleLaunchpad(true);
      });
    });
    document.addEventListener("click", () => $("#context-menu").classList.add("hidden"));
  }

  /* ---------- 全局快捷键 ---------- */
  function bindGlobalKeys() {
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.code === "Space") {
        e.preventDefault();
        const sp = $("#spotlight");
        const show = sp.classList.contains("hidden");
        sp.classList.toggle("hidden", !show);
        if (show) { const i = $("#spotlight-input"); i.value = ""; i.focus(); renderSpotlight(""); }
        return;
      }
      if (e.key === "Escape") {
        $("#spotlight").classList.add("hidden");
        toggleLaunchpad(false);
      }
      if (e.key === "F4") { e.preventDefault(); toggleLaunchpad(); }
    });
    // 聚焦搜索
    const si = $("#spotlight-input");
    si.addEventListener("input", () => renderSpotlight(si.value));
    si.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const first = $("#spotlight-results .r");
        if (first) { first.click(); }
      }
    });
  }
  function renderSpotlight(q) {
    const res = $("#spotlight-results");
    q = (q || "").toLowerCase().trim();
    const list = Object.entries(APPS).filter(([id, a]) => !q || a.name.toLowerCase().includes(q) || id.includes(q));
    if (!list.length) { res.innerHTML = `<div class="empty">没有找到 “${escapeHTML(q)}”</div>`; return; }
    res.innerHTML = list.map(([id, a]) =>
      `<div class="r" data-open="${id}"><span class="ri" style="background:${a.color};border-radius:6px;width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center">${a.glyph}</span><span>${a.name}</span></div>`).join("");
    res.querySelectorAll(".r").forEach(r => r.onclick = () => {
      $("#spotlight").classList.add("hidden");
      openApp(r.dataset.open);
    });
  }

  /* ---------- 对外 API（供 App 调用） ---------- */
  window.DesktopAPI = {
    setTheme(t) {
      document.body.classList.toggle("theme-dark", t === "dark");
      const seg = $("#seg-theme"); // 若在设置页内则刷新
    },
    setAccent(a) { document.body.dataset.accent = a; },
    setWallpaper(k) {
      desktop.className = desktop.className.replace(/\bwp-\w+\b/g, "").trim();
      if (k && k !== "bigsur") desktop.classList.add("wp-" + k);
    },
    openApp
  };

  /* ---------- 启动 ---------- */
  startBoot();
})();
