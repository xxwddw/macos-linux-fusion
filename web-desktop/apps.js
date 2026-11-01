/* ============================================================
   应用定义：SVG 图标、配色、以及每个 App 的内容渲染
   渲染函数接收 (body, ctx)：body=窗口内容容器，ctx 提供桌面 API
   ============================================================ */

const GLYPHS = {
  finder: `<svg viewBox="0 0 24 24" width="55%" height="55%"><path fill="#fff" d="M4 6h16l-1.5-2h-13L4 6z"/><path fill="#fff" d="M4 6v11a2 2 0 002 2h12a2 2 0 002-2V6H4z"/><path fill="rgba(0,0,0,.18)" d="M6 9h12v2H6z"/></svg>`,
  terminal: `<svg viewBox="0 0 24 24" width="55%" height="55%"><rect x="3" y="5" width="18" height="14" rx="2" fill="#fff"/><rect x="3" y="8" width="18" height="2" fill="rgba(0,0,0,.2)"/><path d="M6 11l3 2.5-3 2.5" stroke="rgba(0,0,0,.75)" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 16h5" stroke="rgba(0,0,0,.75)" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" width="55%" height="55%"><path fill="#fff" d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 6.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/><path fill="#fff" d="M18.3 13a8.5 8.5 0 000-2h2.4a9.9 9.9 0 00-1.2-3l-2.1 1.2a8.4 8.4 0 00-1.7-1.7l1.2-2.1a9.9 9.9 0 00-3-1.2V1.6h-2v2.4a10 10 0 00-3 1.2L5.4 5.2A9.9 9.9 0 004.2 8.2l-2.1-1.2A9.9 9.9 0 001 10h2.4a8.5 8.5 0 000 2H1a9.9 9.9 0 001.2 3l2.1-1.2a8.4 8.4 0 001.7 1.7l-1.2 2.1a9.9 9.9 0 003 1.2v2.4h2v-2.4a10 10 0 003-1.2l2.1 1.2a9.9 9.9 0 001.2-3l-2.1-1.2a8.4 8.4 0 001.7-1.7l2.1 1.2a9.9 9.9 0 001.2-3h-2.4z"/></svg>`,
  calculator: `<svg viewBox="0 0 24 24" width="50%" height="50%"><rect x="4" y="4" width="16" height="16" rx="3" fill="#fff"/><rect x="6" y="6" width="12" height="4" rx="1" fill="rgba(0,0,0,.8)"/><rect x="6" y="12" width="3.5" height="3.5" rx=".6" fill="rgba(0,0,0,.55)"/><rect x="10.5" y="12" width="3.5" height="3.5" rx=".6" fill="rgba(0,0,0,.55)"/><rect x="6" y="16.5" width="3.5" height="3.5" rx=".6" fill="rgba(0,0,0,.55)"/><rect x="10.5" y="16.5" width="3.5" height="3.5" rx=".6" fill="rgba(0,0,0,.55)"/><rect x="15.5" y="12" width="2.5" height="8" rx=".6" fill="rgba(0,0,0,.7)"/></svg>`,
  notes: `<svg viewBox="0 0 24 24" width="50%" height="50%"><rect x="5" y="4" width="14" height="16" rx="2" fill="#fff"/><path d="M8 9h8M8 12h8M8 15h5" stroke="rgba(0,0,0,.75)" stroke-width="1.3" stroke-linecap="round"/></svg>`,
  browser: `<svg viewBox="0 0 24 24" width="55%" height="55%"><circle cx="12" cy="12" r="9" fill="#fff"/><circle cx="12" cy="12" r="8" fill="none" stroke="rgba(0,0,0,.75)" stroke-width="1.5"/><path d="M12 6v12M6 12h12" stroke="rgba(0,0,0,.75)" stroke-width="1.5" stroke-linecap="round" transform="rotate(45 12 12)"/><circle cx="12" cy="12" r="1.8" fill="rgba(0,0,0,.75)"/></svg>`,
  about: `<svg viewBox="0 0 100 100" width="65%" height="65%"><path fill="#fff" d="M50 8c9 0 14 5 21 5 11 0 19-9 27-9 5 0 11 2 15 6-6 9-13 22-13 35 0 13 7 25 16 33-3 9-9 18-15 18-6 0-9-4-17-4s-11 4-17 4c-6 0-12-7-17-16C39 94 35 88 29 88c-12 0-23 10-30 10C-9 98-18 80-18 64 10 64 14 40 14 27 -2 24 -8 10 -8 2 -2 2 3 1 8 2 6 3 15 7 23 8z"/></svg>`,
  music: `<svg viewBox="0 0 24 24" width="55%" height="55%"><circle cx="7" cy="18" r="4" fill="#fff"/><path d="M7 18V6l12-3v12" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
  photos: `<svg viewBox="0 0 24 24" width="55%" height="55%"><rect x="3" y="5" width="18" height="14" rx="2" fill="#fff"/><circle cx="8" cy="10" r="1.6" fill="rgba(0,0,0,.25)"/><path d="M4 17l5-6 4 5 4-4 3 5z" fill="rgba(0,0,0,.18)"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" width="50%" height="50%"><path d="M6 7h12v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7z" fill="#fff"/><path d="M10 10v7M14 10v7M5 7h14" stroke="rgba(0,0,0,.75)" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  launchpad: `<svg viewBox="0 0 24 24" width="55%" height="55%"><rect x="4" y="4" width="4" height="4" rx="1" fill="#fff"/><rect x="10" y="4" width="4" height="4" rx="1" fill="#fff"/><rect x="16" y="4" width="4" height="4" rx="1" fill="#fff"/><rect x="4" y="10" width="4" height="4" rx="1" fill="#fff"/><rect x="10" y="10" width="4" height="4" rx="1" fill="#fff"/><rect x="16" y="10" width="4" height="4" rx="1" fill="#fff"/><rect x="4" y="16" width="4" height="4" rx="1" fill="#fff"/><rect x="10" y="16" width="4" height="4" rx="1" fill="#fff"/><rect x="16" y="16" width="4" height="4" rx="1" fill="#fff"/></svg>`,
};

const APPS = {
  finder: {
    name: "访达", color: "#2aa9ff", dock: true, title: "访达",
    render(body, ctx) {
      body.innerHTML = `
        <div class="finder">
          <div class="finder-side">
            <h4>个人收藏</h4>
            <div class="row active">🖥️ 桌面</div>
            <div class="row">📁 文稿</div>
            <div class="row">⬇️ 下载</div>
            <div class="row">🎵 音乐</div>
            <div class="row">🖼️ 图片</div>
            <h4>位置</h4>
            <div class="row">💽 根目录 /</div>
            <div class="row">🐧 Linux 内核</div>
          </div>
          <div class="finder-main">
            <div class="finder-toolbar">
              <span>⬅️ ➡️</span><span>🔍</span>
              <span style="margin-left:auto">6 个项目</span>
            </div>
            <div class="finder-grid">
              ${[["📁","home"],["📁","etc"],["📁","usr"],["📁","var"],["⚙️","config"],["📄","readme.txt"]]
                .map(([ic,nm]) => `<div class="fitem"><div class="ic">${ic}</div><div class="nm">${nm}</div></div>`).join("")}
            </div>
          </div>
        </div>`;
    }
  },

  terminal: {
    name: "终端", color: "#1e1e1e", dock: true, title: "Linux — bash",
    render(body, ctx) {
      body.innerHTML = `<div class="term" id="term"></div>`;
      const term = body.querySelector("#term");
      const input = document.createElement("input");
      const user = "linuxuser", host = "macbook-linux";
      const promptHTML = () => `<span class="prompt">${user}@${host}</span>:<span class="path">~</span>$ `;

      const print = (html, cls="") => {
        const d = document.createElement("div");
        d.className = "line " + cls;
        d.innerHTML = html;
        term.appendChild(d);
      };
      const printRaw = (text) => { const d=document.createElement("div"); d.className="line"; d.textContent=text; term.appendChild(d); };

      // 启动横幅
      print(`<span class="ascii">  _           ___  ___\n | |_ _ _ ___|   \\| __|\n |  _| '_/ -_) |) | _| \n  \\__|_| \\___|___/|___|  Linux 桌面环境</span>`);
      print(`<span class="ok">上次登录：</span> 通过 tty1 本地登录`);

      const history = [];
      let histIdx = -1;

      const run = (cmd) => {
        print(promptHTML() + escapeHTML(cmd));
        // —— 真系统模式：把命令转发给 APK 注入的真实 arm64 shell ——
        if (window.__HARMONY_REAL__ && window.HarmonyShell) {
          let out = "";
          try { out = window.HarmonyShell.exec(cmd) || ""; }
          catch (e) { out = "shell error: " + e; }
          out.split("\n").forEach(l => printRaw(l));
          term.scrollTop = term.scrollHeight;
          return;
        }
        const [c, ...args] = cmd.trim().split(/\s+/);
        switch (c) {
          case "": break;
          case "help":
            print(`可用命令：help, ls, pwd, whoami, uname, cat, date, echo, neofetch, clear, about`);
            break;
          case "ls":
            printRaw("Desktop  Documents  Downloads  Music  Pictures  .config  readme.txt");
            break;
          case "pwd": printRaw("/home/linuxuser"); break;
          case "whoami": printRaw(user); break;
          case "date": printRaw(new Date().toString()); break;
          case "echo": printRaw(args.join(" ")); break;
          case "cat":
            if (args[0] === "readme.txt") printRaw("这是一个披着 macOS 外衣的 Linux 桌面环境。内核：Linux。界面：macOS 风格。");
            else print(`<span class="ok">cat: ${escapeHTML(args[0]||"")}: 没有那个文件</span>`);
            break;
          case "uname":
            if (args.includes("-a")) printRaw("Linux macbook-linux 6.8.0-linux-desktop #1 SMP PREEMPT x86_64 GNU/Linux");
            else printRaw("Linux");
            break;
          case "neofetch":
            print(`<span class="ascii">       🐧\n   linuxuser@macbook-linux\n   ----------------------\n   OS: macOS-styled Linux\n   Kernel: 6.8.0-linux-desktop\n   Shell: bash 5.2\n   DE: macOS WebUI\n   Theme: ${document.body.classList.contains('theme-dark')?'Dark':'Light'}</span>`);
            break;
          case "about": print(`这是一个用 Web 技术复刻的 macOS 风格 Linux 桌面。详见「关于本机」。`); break;
          case "clear": term.innerHTML = ""; return;
          default: print(`<span class="ok">${escapeHTML(c)}: command not found</span>`);
        }
        term.scrollTop = term.scrollHeight;
      };

      const line = document.createElement("div");
      line.className = "term-input";
      line.innerHTML = promptHTML();
      line.appendChild(input);
      term.appendChild(line);
      input.focus();
      term.addEventListener("click", () => input.focus());

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const v = input.value;
          if (v.trim()) { history.push(v); histIdx = history.length; }
          run(v);
          input.value = "";
          term.appendChild(line); term.scrollTop = term.scrollHeight;
        } else if (e.key === "ArrowUp") {
          if (histIdx > 0) { histIdx--; input.value = history[histIdx]; }
          e.preventDefault();
        } else if (e.key === "ArrowDown") {
          if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; }
          else { histIdx = history.length; input.value = ""; }
          e.preventDefault();
        }
      });
    }
  },

  settings: {
    name: "系统设置", color: "#8e8e93", dock: true, title: "系统设置",
    render(body, ctx) {
      const accents = ["blue","purple","pink","red","orange","green","graphite"];
      const wps = [["bigsur","默认(大苏尔)"],["sonoma","Sonoma"],["ventura","Ventura"],["mono","石墨"],["graphite","深空灰"]];
          body.innerHTML = `
        <div class="settings">
          <div class="settings-side">
            <div class="srow active" data-p="general"><span class="si">🎨</span> 外观</div>
            <div class="srow" data-p="about"><span class="si">ℹ️</span> 关于本机</div>
            <div class="srow" data-p="linux"><span class="si">🐧</span> Linux 信息</div>
          </div>
          <div class="settings-main" id="set-main"></div>
        </div>`;
      const main = body.querySelector("#set-main");
      const curWp = () => {
        const m = [...document.getElementById('desktop').classList].find(c => c.startsWith('wp-'));
        return m ? m.slice(3) : 'bigsur';
      };
      const draw = (p) => {
        if (p === "general") {
          const wpNow = curWp();
          main.innerHTML = `
            <h2>外观</h2>
            <div class="field">
              <label>主题</label>
              <div class="seg" id="seg-theme">
                <button data-t="light" class="${!document.body.classList.contains('theme-dark')?'on':''}">浅色</button>
                <button data-t="dark" class="${document.body.classList.contains('theme-dark')?'on':''}">深色</button>
              </div>
            </div>
            <div class="field">
              <label>强调色</label>
              <div class="swatches" id="sw-accents">
                ${accents.map(a=>`<div class="swatch sw-${a} ${document.body.dataset.accent===a?'sel':''}" data-a="${a}" style="background:${ACCENT_COLORS[a]}"></div>`).join("")}
              </div>
            </div>
            <div class="field">
              <label>墙纸</label>
              <div class="wp-thumbs" id="wp-thumbs">
                ${wps.map(([k,n])=>`<div class="wp-thumb wp-${k} ${k===wpNow?'sel':''}" data-w="${k}" title="${n}"></div>`).join("")}
              </div>
            </div>`;
          // 主题
          main.querySelectorAll("#seg-theme button").forEach(b=>b.onclick=()=>{
            ctx.api.setTheme(b.dataset.t); draw("general");
          });
          // 强调色
          main.querySelectorAll("#sw-accents .swatch").forEach(s=>s.onclick=()=>{
            ctx.api.setAccent(s.dataset.a); draw("general");
          });
          // 墙纸
          main.querySelectorAll("#wp-thumbs .wp-thumb").forEach(t=>t.onclick=()=>{
            ctx.api.setWallpaper(t.dataset.w); draw("general");
          });
        } else if (p === "about") {
          main.innerHTML = `
            <h2>关于本机</h2>
            <div class="about" style="text-align:left;padding:0">
              <p><b>macOS-styled Linux Desktop</b></p>
              <p style="opacity:.6;margin:6px 0 16px">版本 1.0（Web 复刻版）</p>
              <table>
                <tr><td>芯片</td><td>Web Engine · Chromium</td></tr>
                <tr><td>内存</td><td>${Math.round(Math.min(16, navigator.deviceMemory||8))} GB</td></tr>
                <tr><td>启动磁盘</td><td>虚拟磁盘 (/)</td></tr>
                <tr><td>显示</td><td>${window.innerWidth} × ${window.innerHeight}</td></tr>
              </table>
            </div>`;
        } else if (p === "linux") {
          main.innerHTML = `
            <h2>Linux 信息</h2>
            <p style="opacity:.7;line-height:1.8">这是一个运行在 <b>Linux 内核</b> 之上的桌面环境，<br>前端被重做成 macOS 风格（正如你所要求的）。</p>
            <pre style="background:rgba(127,127,127,.15);padding:14px;border-radius:10px;margin-top:14px;font-size:12.5px;line-height:1.6">$ uname -a
Linux macbook-linux 6.8.0-linux-desktop #1 SMP PREEMPT x86_64 GNU/Linux

$ cat /etc/os-release
NAME="macOS-styled Linux"
ID=linux-desktop
PRETTY_NAME="Linux with macOS frontend"</pre>`;
        }
      };
      body.querySelectorAll(".srow").forEach(r=>r.onclick=()=>{
        body.querySelectorAll(".srow").forEach(x=>x.classList.remove("active"));
        r.classList.add("active"); draw(r.dataset.p);
      });
      draw("general");
    }
  },

  calculator: {
    name: "计算器", color: "#1c1c1e", dock: true, title: "计算器",
    render(body, ctx) {
      body.innerHTML = `
        <div class="calc">
          <div class="calc-display" id="calc-disp">0</div>
          <div class="calc-grid">
            <button class="fn" data-k="C">AC</button>
            <button class="fn" data-k="neg">±</button>
            <button class="fn" data-k="%">%</button>
            <button class="op" data-k="/">÷</button>
            <button data-k="7">7</button><button data-k="8">8</button><button data-k="9">9</button>
            <button class="op" data-k="*">×</button>
            <button data-k="4">4</button><button data-k="5">5</button><button data-k="6">6</button>
            <button class="op" data-k="-">−</button>
            <button data-k="1">1</button><button data-k="2">2</button><button data-k="3">3</button>
            <button class="op" data-k="+">+</button>
            <button class="zero" data-k="0">0</button><button data-k=".">.</button>
            <button class="op" data-k="=">=</button>
          </div>
        </div>`;
      const disp = body.querySelector("#calc-disp");
      let cur = "0", prev = null, op = null, fresh = true;
      const show = () => disp.textContent = cur.length>12 ? parseFloat(cur).toPrecision(8) : cur;
      const compute = () => {
        const a = parseFloat(prev), b = parseFloat(cur);
        let r = b;
        if (op==="+") r=a+b; else if(op==="-") r=a-b; else if(op==="*") r=a*b; else if(op==="/") r=b?a/b:0;
        cur = String(+r.toFixed(10)); prev=null; op=null;
      };
      body.querySelectorAll("button").forEach(b=>b.onclick=()=>{
        const k = b.dataset.k;
        if (/[0-9]/.test(k)) { cur = (fresh||cur==="0") ? k : cur+k; fresh=false; }
        else if (k===".") { if(!cur.includes(".")) cur+="."; }
        else if (k==="C") { cur="0"; prev=null; op=null; fresh=true; }
        else if (k==="neg") { cur=String(parseFloat(cur)*-1); }
        else if (k==="%") { cur=String(parseFloat(cur)/100); }
        else if (k==="=") { if(op!==null){compute();} fresh=true; }
        else { if(op!==null && !fresh){compute();} prev=cur; op=k; fresh=true; }
        show();
      });
    }
  },

  notes: {
    name: "备忘录", color: "#ffe24a", dock: true, title: "备忘录",
    render(body, ctx) {
      body.innerHTML = `
        <div class="notes">
          <div class="notes-side">
            <div class="nrow active">📝 购物清单</div>
            <div class="nrow">💡 灵感</div>
            <div class="nrow">🐧 Linux 笔记</div>
          </div>
          <div class="notes-main"><textarea placeholder="开始输入…">牛奶、鸡蛋、咖啡豆
macOS 风格的 Linux 桌面：
- 菜单栏毛玻璃 ✅
- Dock 放大 ✅
- 光标处更亮 ✅</textarea></div>
        </div>`;
    }
  },

  browser: {
    name: "浏览器", color: "#1fa2ff", dock: true, title: "浏览器",
    render(body, ctx) {
      body.innerHTML = `
        <div class="browser">
          <div class="browser-bar">
            <span>⬅️➡️🔄</span>
            <input value="https://linux.macos.local" />
          </div>
          <div class="browser-page">
            <h1>欢迎来到 macOS 风格的 Linux</h1>
            <p>这是一个示意页面。下方是几个可点击的「App」入口：</p>
            <p>
              <a href="#" data-open="terminal">打开终端</a> ·
              <a href="#" data-open="settings">系统设置</a> ·
              <a href="#" data-open="finder">访达</a> ·
              <a href="#" data-open="about">关于本机</a>
            </p>
            <p style="opacity:.6;margin-top:18px">提示：按 <b>⌘ + 空格</b> 打开聚焦搜索，按 <b>F4</b> 或点击 Dock 最右侧打开启动台。</p>
          </div>
        </div>`;
      body.querySelectorAll("[data-open]").forEach(a=>a.onclick=(e)=>{e.preventDefault(); ctx.openApp(a.dataset.open);});
    }
  },

  about: {
    name: "关于本机", color: "#555", dock: false, title: "关于本机",
    render(body, ctx) {
      body.innerHTML = `
        <div class="about">
          <div class="logo">🍎</div>
          <h1>macOS-styled Linux Desktop</h1>
          <div class="ver">版本 1.0 · Web 复刻版</div>
          <table>
            <tr><td>芯片</td><td>Web Engine</td></tr>
            <tr><td>内核</td><td>Linux 6.8.0</td></tr>
            <tr><td>内存</td><td>${Math.round(Math.min(16, navigator.deviceMemory||8))} GB</td></tr>
            <tr><td>分辨率</td><td>${window.innerWidth} × ${window.innerHeight}</td></tr>
            <tr><td>前端</td><td>macOS 风格（自定）</td></tr>
          </table>
        </div>`;
    }
  },

  music: { name: "音乐", color: "#fb5c74", dock: false, title: "音乐",
    render(body){ body.innerHTML = `<div style="padding:30px;text-align:center;color:var(--text)"><div style="font-size:56px">🎵</div><h2 style="margin:12px 0">音乐</h2><p style="opacity:.6">（示例 App，可继续扩展）</p></div>`; } },
  photos: { name: "照片", color: "#a3d14a", dock: false, title: "照片",
    render(body){ body.innerHTML = `<div style="padding:30px;text-align:center;color:var(--text)"><div style="font-size:56px">🌄</div><h2 style="margin:12px 0">照片</h2><p style="opacity:.6">（示例 App，可继续扩展）</p></div>`; } },
  trash: { name: "废纸篓", color: "#8e8e93", dock: true, title: "废纸篓",
    render(body){ body.innerHTML = `<div style="padding:30px;text-align:center;color:var(--text)"><div style="font-size:56px">🗑️</div><p style="opacity:.6;margin-top:12px">废纸篓是空的</p></div>`; } },
};

/* 让 APPS 自动挂上对应的 SVG 图标 */
Object.keys(APPS).forEach(id => { APPS[id].glyph = GLYPHS[id] || APPS[id].glyph || ""; });

/* 桌面图标（右侧） */
const DESKTOP_ICONS = [
  { glyph: GLYPHS.finder, color: "linear-gradient(135deg,#2aa9ff,#1c7fd6)", label: "Macintosh HD", open: "finder" },
  { glyph: `<svg viewBox="0 0 24 24" width="60%" height="60%"><path fill="#fff" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/></svg>`, color: "linear-gradient(135deg,#34d058,#1a7f37)", label: "Linux 内核", open: "settings" },
  { glyph: GLYPHS.trash, color: "linear-gradient(135deg,#b0b0b5,#7c7c82)", label: "废纸篓", open: "trash" },
];

/* Dock 顺序（launchpad 为特殊启动台入口） */
const DOCK_ORDER = ["finder","terminal","settings","calculator","notes","browser","__sep__","launchpad","about","trash"];

/* 强调色色板 */
const ACCENT_COLORS = {
  blue:"#007AFF", purple:"#9B59FF", pink:"#FF2D92", red:"#FF3B30",
  orange:"#FF9400", green:"#28CD41", graphite:"#8E8E93"
};

function escapeHTML(s){ return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
