/* =========================================================
   水墨萬年曆 v22｜八卦游標＋白色乾筆尾巴
   1. 滑鼠：游標換成一個會旋轉的小八卦，移動時後面拖出一道白色的乾筆尾巴：整條都是一絲一絲的筆毛，越往後越散、越斷斷續續（飛白）
   2. 手機、平板：手指按下時，八卦出現在手指的位置；手指滑動時一樣拖出尾巴；放開後慢慢消失

   使用者在系統設定了「減少動態效果」時，八卦不轉、也不畫軌跡。
   整段包在 (() => { ... })() 裡，不和其他程式互相干擾
   ========================================================= */
(() => {
  // 占卜的大八卦（#baguaSpin）已經畫好了，游標直接複製它；這一頁沒有八卦就不做
  const source = document.getElementById("baguaSpin");
  if (!source) return;

  // matchMedia：問瀏覽器「這台裝置符不符合某個條件」
  // (hover: hover) and (pointer: fine)：有滑鼠（可以懸停、而且很精準）
  const hasMouse = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. 建立八卦游標 ---------- */
  const NS = "http://www.w3.org/2000/svg";
  const cursor = document.createElement("div");
  cursor.className = "ink-cursor";
  cursor.setAttribute("aria-hidden", "true");
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "-190 -190 380 380");
  const spin = document.createElementNS(NS, "g");
  spin.setAttribute("class", "ink-cursor-spin");
  spin.innerHTML = source.innerHTML;
  svg.appendChild(spin);
  cursor.appendChild(svg);
  document.body.appendChild(cursor);
  // 有滑鼠的裝置才藏起原本的游標（CSS 看到這個 class 才會藏）
  if (hasMouse) document.documentElement.classList.add("has-ink-cursor");

  /* ---------- 2. 毛筆軌跡：畫在一張蓋滿畫面的 canvas 上 ---------- */
  // canvas：一塊可以用程式畫圖的畫布（和 SVG 不同，它是一點一點的像素）
  const canvas = document.createElement("canvas");
  canvas.className = "ink-trail";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);    // 高解析度螢幕要畫得更細，才不會模糊
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener("resize", resize);

  const LIFE = 420;          // 每一點存在多久（毫秒），越大尾巴越長
  let points = [];           // 走過的點：{ x, y, t（時間） }
  let x = -100, y = -100;    // 八卦目前的位置
  let hideTimer;

  /* ---------- 開關：左下角的「關閉軌跡」按鈕（v22） ----------
     設定存在瀏覽器裡，下次打開還是同樣的狀態。關掉之後，八卦游標還在，只是不畫尾巴 */
  let trailOn = true;
  try { trailOn = localStorage.getItem("inkTrail") !== "off"; } catch (e) {}
  const trailBtn = document.getElementById("trailBtn");
  function syncTrailBtn() {
    if (!trailBtn) return;
    trailBtn.textContent = trailOn ? "關閉軌跡" : "開啟軌跡";   // 按鈕上寫的是「按下去會做什麼」
    trailBtn.setAttribute("aria-pressed", String(!trailOn));
  }
  if (trailBtn) {
    trailBtn.addEventListener("click", () => {
      trailOn = !trailOn;                                    // ! 是「相反」：開變關、關變開
      points = [];
      try { localStorage.setItem("inkTrail", trailOn ? "on" : "off"); } catch (e) {}
      syncTrailBtn();
    });
    syncTrailBtn();
  }

  function moveTo(px, py) {
    x = px; y = py;
    if (!reduced && trailOn) points.push({ x, y, t: performance.now() });   // 軌跡關掉時就不記錄
  }
  function show() { clearTimeout(hideTimer); cursor.classList.add("show"); }
  function hideLater(ms) {                                  // 過一段時間再藏起來
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { cursor.classList.remove("show", "tap"); points = []; }, ms);
  }

  /* ---------- 3. 滑鼠 ---------- */
  addEventListener("pointermove", e => {
    if (e.pointerType === "mouse") {
      moveTo(e.clientX, e.clientY);
      show();
      // 移到按鈕、連結上：八卦變大、轉快；移到輸入框：換回原本的文字游標
      const t = e.target;
      cursor.classList.toggle("hot", !!(t.closest && t.closest("a, button, select, summary, label, [role=tab], td a")));
      cursor.classList.toggle("hide", !!(t.closest && t.closest("input, textarea")));
    } else if (fingerDown) {
      moveTo(e.clientX, e.clientY);                         // 手指滑動
    }
  }, { passive: true });
  document.addEventListener("mouseleave", () => { cursor.classList.remove("show"); points = []; });

  /* ---------- 4. 手指（手機、平板） ---------- */
  let fingerDown = false;
  addEventListener("pointerdown", e => {
    if (e.pointerType === "mouse") return;
    fingerDown = true;
    points = [];
    cursor.classList.remove("hot", "hide");
    moveTo(e.clientX, e.clientY);
    cursor.classList.add("tap");                            // 出現時有一個「蓋印章」的放大縮小
    show();
  }, { passive: true });
  // 手指滑動時，畫面常常會跟著捲動，這時 pointermove 會停止，所以也聽 touchmove
  addEventListener("touchmove", e => {
    if (fingerDown && e.touches[0]) moveTo(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  // 手指離開螢幕：半秒後消失
  // （手指一滑動，畫面開始捲動時會收到 pointercancel，但手指其實還在螢幕上，
  //   所以用 touchend 判斷「真的放開了」）
  const fingerUp = () => { fingerDown = false; hideLater(500); };
  addEventListener("pointerup", e => { if (e.pointerType !== "mouse") fingerUp(); }, { passive: true });
  addEventListener("touchend", fingerUp, { passive: true });
  addEventListener("touchcancel", fingerUp, { passive: true });

  /* ---------- 5. 畫尾巴 ---------- */
  // 尾巴和八卦之間空出的距離（v18 是 0、v19 是 14，v20 取中間值 7）
  const GAP = 7;
  // offsetWidth 是八卦的寬度，一半就是半徑；變大（hot）時乘上 1.3
  const radius = () => cursor.offsetWidth / 2 * (cursor.classList.contains("hot") ? 1.3 : 1) + GAP;

  // 把太靠近八卦的點去掉，尾巴從圓的邊緣開始
  // list 是「最新的點在最前面」：先跳過還在圓裡面的點，遇到第一個在圓外的點，
  // 就在它和前一點之間找到圓邊，當作尾巴的最前端，後面的點全部保留
  function trimNearCursor(list, R) {
    const inside = p => Math.hypot(p.x - x, p.y - y) < R;
    let i = 0;
    while (i < list.length && inside(list[i])) i++;
    if (i >= list.length) return [];                       // 全部都在圓裡面：沒有尾巴
    const out = [];
    if (i > 0) {
      const a = list[i - 1], b = list[i];                  // a 在圓裡、b 在圓外
      let lo = 0, hi = 1;
      for (let k = 0; k < 12; k++) {                       // 二分法：一直對半找，找到剛好在圓邊上的位置
        const m = (lo + hi) / 2;
        const px = b.x + (a.x - b.x) * m, py = b.y + (a.y - b.y) * m;
        if (Math.hypot(px - x, py - y) < R) hi = m; else lo = m;
      }
      out.push({ x: b.x + (a.x - b.x) * lo, y: b.y + (a.y - b.y) * lo, t: a.t });
    }
    return out.concat(list.slice(i));
  }

  // 固定的「隨機」數：同一個 seed 每次算出來都一樣，筆毛的樣子才不會一直閃
  function rand(seed) {
    const v = Math.sin(seed * 12.9898) * 43758.5453;
    return v - Math.floor(v);                              // 0 ～ 1
  }

  /* ---------- 乾筆的形狀（v21.2：整條都是分岔的筆毛，沒有實心的部分） ----------
     靠近八卦（筆頭）：筆毛比較密、比較少斷開
     往後（筆尾）：筆毛散開、斷斷續續、長短不一（飛白）
     t 代表位置：0 是筆頭（最新的點），1 是筆尾（最舊的點） */
  const WIDTH = 5.5;                                        // 筆刷最寬的地方（v21.1：從 11 減半）
  // 每一根筆毛的設定：在筆刷裡的位置、粗細、在哪裡結束
  const BRISTLES = Array.from({ length: 28 }, (_, k) => ({
    offset: (rand(k + 1) - 0.5) * 1.1,                      // -0.55 ～ 0.55：在寬度裡的位置（稍微超出一點，筆尾會散開）
    width: 0.25 + rand(k + 20) * 0.75,                      // 粗細（v21.1：減半）
    end: 0.6 + rand(k + 40) * 0.4                           // 這根筆毛在 t = 0.6～1 之間結束，長短不一
  }));

  // 滑鼠移動很快時，兩點之間會隔很遠，畫出來的筆毛會太直。
  // 所以先在每兩點之間，每隔 3px 補一個點，筆毛才能「斷斷續續」
  function resample(list) {
    const out = [list[0]];
    for (let i = 1; i < list.length; i++) {
      const a = list[i - 1], b = list[i];
      const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 3));
      for (let s = 1; s <= steps; s++) {
        const m = s / steps;
        out.push({ x: a.x + (b.x - a.x) * m, y: a.y + (b.y - a.y) * m, t: a.t + (b.t - a.t) * m });
      }
    }
    return out;
  }

  // 每一點的「法線」：垂直於移動方向，用來把筆毛往兩側推開
  function normals(list) {
    return list.map((p, i) => {
      const a = list[Math.max(0, i - 1)], b = list[Math.min(list.length - 1, i + 1)];
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      return [-dy / len, dx / len];
    });
  }

  function drawBrush(list, now) {
    const n = normals(list);
    const tOf = p => Math.min(1, (now - p.t) / LIFE);

    // 筆毛：每一根各自畫成一條細線，越往後越容易斷開
    ctx.lineCap = "round";
    BRISTLES.forEach((br, k) => {
      for (let i = 1; i < list.length; i++) {
        const a = list[i - 1], b = list[i];
        const t = tOf(b);
        if (t > br.end) break;                              // 這根筆毛到這裡就結束了
        // 斷開的機率：筆頭幾乎不斷，越往筆尾越容易斷（乾筆的飛白）
        const dryness = 0.12 + t * 0.6;                     // 筆頭就有一點點斷開，越往後斷得越多
        if (rand(Math.round(b.x * 0.7 + b.y * 1.3) + k * 3.1) < dryness) continue;
        const spread = 0.8 + t * 0.8;                       // 筆頭比較收攏，越往後散得越開
        const oa = br.offset * WIDTH * spread, ob = oa;
        ctx.globalAlpha = 0.85 * (1 - t * 0.6);
        ctx.lineWidth = br.width * (1 - t * 0.5);
        ctx.beginPath();
        ctx.moveTo(a.x + n[i - 1][0] * oa, a.y + n[i - 1][1] * oa);
        ctx.lineTo(b.x + n[i][0] * ob, b.y + n[i][1] * ob);
        ctx.stroke();
      }
    });
  }

  // 每一幀（大約每秒 60 次）重畫一次
  function frame(now) {
    cursor.style.transform = `translate(${x}px, ${y}px)`;    // 八卦跟著走

    ctx.clearRect(0, 0, innerWidth, innerHeight);
    points = points.filter(p => now - p.t < LIFE);          // 太舊的點丟掉
    // 從最新的點往回整理（最新的在前面），去掉太靠近八卦的部分
    const tail = trimNearCursor([...points].reverse(), radius());
    if (tail.length > 2) {
      ctx.fillStyle = "#fff";                                // 白色的墨
      ctx.strokeStyle = "#fff";
      ctx.shadowColor = "rgba(0, 0, 0, .25)";                // 淡淡的灰色邊，淺色背景上才看得見白色
      ctx.shadowBlur = 2;
      drawBrush(resample(tail), now);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
