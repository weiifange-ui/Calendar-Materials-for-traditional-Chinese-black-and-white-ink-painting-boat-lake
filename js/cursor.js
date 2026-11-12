/* =========================================================
   水墨萬年曆 v24.1｜二胡游標＋飄出來的音符
   1. 滑鼠：游標換成一把正在拉弦的水墨二胡（動畫圖片），游標的位置在最下面的琴筒；
      移動時，琴筒會一路飄出白色的音符，慢慢往上飄、淡掉，像二胡拉出來的旋律
   2. 手機、平板：手指按下時，二胡出現在手指的位置；手指滑動時一樣會飄出音符；放開後慢慢消失

   使用者在系統設定了「減少動態效果」時，二胡改成不動的圖片，也不會飄出音符。
   整段包在 (() => { ... })() 裡，不和其他程式互相干擾
   ========================================================= */
(() => {
  // matchMedia：問瀏覽器「這台裝置符不符合某個條件」
  // (hover: hover) and (pointer: fine)：有滑鼠（可以懸停、而且很精準）
  const hasMouse = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. 建立二胡游標 ----------
     圖片是一把正在拉弦的二胡（images/cursor-erhu.webp，會動的 WebP 圖）
     圖片的「熱點」（對準滑鼠的那一點）在最下面的琴筒，位置由 CSS 的 margin 決定 */
  const cursor = document.createElement("div");
  cursor.className = "ink-cursor";
  cursor.setAttribute("aria-hidden", "true");
  const img = document.createElement("img");
  img.src = reduced ? "images/cursor-erhu-still.webp" : "images/cursor-erhu.webp";   // 減少動態效果：用不動的圖
  img.alt = "";
  img.draggable = false;
  cursor.appendChild(img);
  document.body.appendChild(cursor);
  // 有滑鼠的裝置才藏起原本的游標（CSS 看到這個 class 才會藏）
  if (hasMouse) document.documentElement.classList.add("has-ink-cursor");

  /* ---------- 2. 音符：畫在一張蓋滿畫面的 canvas 上 ---------- */
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

  const LIFE = 1200;         // 每個音符存在多久（毫秒）
  const SPACING = 28;        // 滑鼠每移動多少 px，就飄出一個音符
  let notes = [];            // 畫面上的音符：{ x, y, vx, vy, born, kind, size, rot, spin }
  let travelled = 0;         // 上一個音符之後，滑鼠又走了多遠
  let x = -100, y = -100;    // 二胡（琴筒）目前的位置
  let hideTimer;

  /* ---------- 開關：左下角的「關閉音符」按鈕 ----------
     設定存在瀏覽器裡，下次打開還是同樣的狀態。關掉之後，二胡游標還在，只是不飄音符 */
  let trailOn = true;
  try { trailOn = localStorage.getItem("inkTrail") !== "off"; } catch (e) {}
  const trailBtn = document.getElementById("trailBtn");
  function syncTrailBtn() {
    if (!trailBtn) return;
    trailBtn.textContent = trailOn ? "關閉音符" : "開啟音符";   // 按鈕上寫的是「按下去會做什麼」
    trailBtn.setAttribute("aria-pressed", String(!trailOn));
  }
  if (trailBtn) {
    trailBtn.addEventListener("click", () => {
      trailOn = !trailOn;                                    // ! 是「相反」：開變關、關變開
      notes = [];
      try { localStorage.setItem("inkTrail", trailOn ? "on" : "off"); } catch (e) {}
      syncTrailBtn();
    });
    syncTrailBtn();
  }

  // 移動到新的位置；走得夠遠了，就從琴筒飄出一個音符
  function moveTo(px, py) {
    const dx = px - x, dy = py - y;
    const jump = Math.hypot(dx, dy);
    x = px; y = py;
    if (reduced || !trailOn || jump > 300) { travelled = 0; return; }   // 關掉了，或一下子跳太遠（例如剛進入畫面）就不飄
    travelled += jump;
    if (travelled < SPACING) return;
    travelled = 0;
    spawnNote(dx / (jump || 1), dy / (jump || 1));
  }

  // 飄出一個音符：往「滑鼠移動的反方向」慢慢退開，同時往上飄
  const KINDS = ["quarter", "eighth", "eighth", "beamed"];   // 四分音符、八分音符（多一點）、兩個連在一起的八分音符
  function spawnNote(dirX, dirY) {
    notes.push({
      x, y,
      vx: -dirX * 0.03 + (Math.random() - 0.5) * 0.02,      // 每毫秒移動多少 px
      vy: -dirY * 0.03 - 0.035,                              // 往上飄（y 越小越上面）
      born: performance.now(),
      kind: KINDS[Math.floor(Math.random() * KINDS.length)],
      size: (13 + Math.random() * 7) / 3,                    // 大小：原本 13～20px 的 1/3，約 4～7px（v24.1）
      rot: (Math.random() - 0.5) * 0.5,                      // 一開始稍微歪一點
      spin: (Math.random() - 0.5) * 0.0008                   // 飄的時候慢慢轉
    });
    if (notes.length > 40) notes.shift();                    // 最多 40 個，太多就把最舊的拿掉
  }
  function show() { clearTimeout(hideTimer); cursor.classList.add("show"); }
  function hideLater(ms) {                                  // 過一段時間再藏起來
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { cursor.classList.remove("show", "tap"); }, ms);
  }

  /* ---------- 3. 滑鼠 ---------- */
  addEventListener("pointermove", e => {
    if (e.pointerType === "mouse") {
      moveTo(e.clientX, e.clientY);
      show();
      // 移到按鈕、連結上：二胡稍微變大；移到輸入框：換回原本的文字游標
      const t = e.target;
      cursor.classList.toggle("hot", !!(t.closest && t.closest("a, button, select, summary, label, [role=tab], td a")));
      cursor.classList.toggle("hide", !!(t.closest && t.closest("input, textarea")));
    } else if (fingerDown) {
      moveTo(e.clientX, e.clientY);                         // 手指滑動
    }
  }, { passive: true });
  document.addEventListener("mouseleave", () => { cursor.classList.remove("show"); });

  /* ---------- 4. 手指（手機、平板） ---------- */
  let fingerDown = false;
  addEventListener("pointerdown", e => {
    if (e.pointerType === "mouse") return;
    fingerDown = true;
    travelled = 0;
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

  /* ---------- 5. 畫音符 ----------
     不用文字符號（♪），而是用線條和橢圓自己畫，每台電腦看起來都一樣
     ctx.save() / ctx.restore()：先記住畫筆的狀態，移動、旋轉畫完一個音符後再還原 */
  function drawNote(n, alpha, scale) {
    const s = n.size * scale;
    ctx.save();
    ctx.translate(n.x, n.y);
    ctx.rotate(n.rot);
    ctx.globalAlpha = alpha;
    ctx.lineWidth = Math.max(1, s * 0.09);
    ctx.lineCap = "round";

    // 符頭：一個斜斜的實心橢圓
    const head = (hx, hy) => {
      ctx.beginPath();
      ctx.ellipse(hx, hy, s * 0.3, s * 0.21, -0.45, 0, Math.PI * 2);
      ctx.fill();
    };
    // 符桿：從符頭右邊往上畫一條直線
    const stem = (hx, hy, top) => {
      ctx.beginPath();
      ctx.moveTo(hx + s * 0.27, hy - s * 0.05);
      ctx.lineTo(hx + s * 0.27, top);
      ctx.stroke();
    };

    if (n.kind === "beamed") {
      // 兩個連在一起的八分音符（♫）
      head(0, 0); head(s * 0.75, -s * 0.15);
      stem(0, 0, -s); stem(s * 0.75, -s * 0.15, -s * 1.12);
      ctx.lineWidth = s * 0.17;                              // 上面那條粗粗的橫桿
      ctx.beginPath();
      ctx.moveTo(s * 0.27, -s);
      ctx.lineTo(s * 1.02, -s * 1.12);
      ctx.stroke();
    } else {
      head(0, 0);
      stem(0, 0, -s);
      if (n.kind === "eighth") {
        // 八分音符（♪）的小尾巴：從符桿頂端往右下彎
        ctx.beginPath();
        ctx.moveTo(s * 0.27, -s);
        ctx.quadraticCurveTo(s * 0.75, -s * 0.72, s * 0.55, -s * 0.38);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 每一幀（大約每秒 60 次）重畫一次
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(50, now - last);                     // 距離上一幀過了幾毫秒
    last = now;
    cursor.style.transform = `translate(${x}px, ${y}px)`;    // 二胡跟著走

    ctx.clearRect(0, 0, innerWidth, innerHeight);
    notes = notes.filter(n => now - n.born < LIFE);          // 太舊的音符拿掉
    if (notes.length) {
      ctx.fillStyle = "#fff";                                // 白色的音符
      ctx.strokeStyle = "#fff";
      ctx.shadowColor = "rgba(0, 0, 0, .35)";                // 淡淡的灰色邊，淺色背景上才看得見白色
      ctx.shadowBlur = 2;
      for (const n of notes) {
        n.x += n.vx * dt; n.y += n.vy * dt; n.rot += n.spin * dt;   // 移動、旋轉
        const age = (now - n.born) / LIFE;                   // 0 剛出現，1 快消失
        const alpha = age < 0.15 ? age / 0.15 : 1 - (age - 0.15) / 0.85;   // 先淡入，再慢慢淡出
        const scale = 0.6 + 0.4 * Math.min(1, age / 0.2);    // 一開始小，很快長到原本大小
        drawNote(n, alpha, scale);
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
