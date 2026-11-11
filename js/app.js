/* =========================================================
   水墨萬年曆 v14（GitHub 完整版）｜萬年曆主程式
   月曆、當日資訊、行程、備忘、心情、提醒、花框、匯出匯入
   ========================================================= */

const WEEK = ["日","一","二","三","四","五","六"];
const now = new Date();
const todayKey = keyOf(now);
let viewYear = now.getFullYear();     // 目前顯示的年
let viewMonth = now.getMonth();       // 目前顯示的月（0 = 一月）
let pickedKey = todayKey;             // 被點選的日期（一開始是今天）

// 把文字裡的 < > & 換掉，避免使用者輸入的內容被當成 HTML
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const dateOf = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const inLunarRange = d => d.getFullYear() >= 1900 && d.getFullYear() <= 2100;

// 今年第幾天、還剩幾天
function dayInfo() {
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nth = Math.round((today - start) / 86400000) + 1;
  const total = Math.round((end - start) / 86400000);
  return `今天是 ${now.getFullYear()} 年第 ${nth} 天，今年還剩 ${total - nth} 天`;
}

// ===== 花邊 =====
// 每個月記住一個「種子」：同一個種子畫出來的花一模一樣
// 按「改變花框」就換一個種子，並存進瀏覽器，下次打開還是同一個樣子
let seeds = {};   // 每個月的花框種子
try { seeds = JSON.parse(localStorage.getItem("garlandSeeds") || "{}"); } catch (e) { seeds = {}; }
const seedOf = m => seeds[m] ?? (m + 1) * 1000;

function paintGarlands(month, animate) {
  const boxes = [document.getElementById("gTop"), document.getElementById("gBottom")];
  const draw = () => {
    boxes.forEach((box, i) => {
      box.innerHTML = "";
      const w = Math.max(200, Math.round(box.clientWidth));
      const h = Math.round(box.clientHeight);
      const k = .7 * Math.min(1, Math.max(.6, w / 720));     // 花縮小到 70%；畫面窄時再小一點
      setSeed(seedOf(month) + i * 7919);                       // 上下兩條用不同種子
      const svg = el("svg", { viewBox: `0 0 ${w} ${h}` }, box);
      // 下緣那條左右翻轉，粗的一端在右邊，上下看起來不會一樣
      const g = el("g", i === 1 ? { transform: `translate(${w} 0) scale(-1 1)` } : {}, svg);
      drawGarland(g, month, w, h, k);
    });
  };
  if (!animate) return draw();
  boxes.forEach(b => b.classList.add("fade"));
  setTimeout(() => { draw(); boxes.forEach(b => b.classList.remove("fade")); }, 250);
}

let lastFrameMonth = -1;
function drawFrame(month) {
  if (month === lastFrameMonth) return;
  lastFrameMonth = month;
  paintGarlands(month, true);
}

// 改變花框：只換目前這個月的花
document.getElementById("redraw").addEventListener("click", () => {
  seeds[viewMonth] = Math.floor(Math.random() * 1e9);
  try { localStorage.setItem("garlandSeeds", JSON.stringify(seeds)); } catch (e) {}
  paintGarlands(viewMonth, true);
});

// 視窗大小改變時，用同一個種子重畫（花的樣子不變，只是長度跟著變）
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => paintGarlands(viewMonth, false), 200);
});


/* ---------- 個人資料：存在瀏覽器裡，每次修改立刻存檔 ---------- */
const STORE_KEY = "inkCalendar";
const CATEGORIES = { work: "工作", life: "生活", birthday: "生日", anniversary: "紀念日", other: "其他" };
const MOODS = [{ v: 5, t: "喜" }, { v: 4, t: "樂" }, { v: 3, t: "平" }, { v: 2, t: "憂" }, { v: 1, t: "怒" }];
let store = { events: [], memos: {}, moods: {}, cards: [], learned: {} };   // cards、learned 是每日學習用的
try {
  const raw = localStorage.getItem(STORE_KEY);
  if (raw) store = { ...store, ...JSON.parse(raw) };
} catch (e) { /* 瀏覽器不允許存檔時，就只在這次開啟期間使用 */ }

let flashTimer;
function flash(text) {
  const s = document.getElementById("saveState");
  s.textContent = text; s.classList.add("show");
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => s.classList.remove("show"), 1400);
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); flash("已儲存"); }
  catch (e) { flash("無法存檔，瀏覽器可能關閉了儲存功能"); }
}

// 某一天有哪些行程（包含每年重複的生日、紀念日）
function eventsOn(d) {
  const k = keyOf(d);
  const l = inLunarRange(d) ? toLunar(d) : null;
  return store.events.filter(ev => {
    if (ev.date === k) return true;
    if (!ev.yearly || ev.date > k) return false;               // 開始日期之前不顯示
    const start = dateOf(ev.date);
    if (ev.lunar) {                                             // 以農曆計算：比對農曆月、日
      if (!l || l.leap || !inLunarRange(start)) return false;
      const s = toLunar(start);
      return l.month === s.month && l.day === s.day;
    }
    return d.getMonth() === start.getMonth() && d.getDate() === start.getDate();
  }).sort((a, b) => (b.important - a.important) || (a.time || "99").localeCompare(b.time || "99"));
}

/* ---------- 畫月曆 ---------- */
function render() {
  document.getElementById("title").innerHTML =
    `${viewYear} 年 ${viewMonth + 1} 月<small>${MONTHS[viewMonth].name}</small>`;
  document.getElementById("info").textContent = dayInfo();
  drawFrame(viewMonth);

  const first = new Date(viewYear, viewMonth, 1);
  const startWeekday = first.getDay();                       // 1 號是星期幾
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const weeks = Math.ceil((startWeekday + daysInMonth) / 7); // 這個月要幾列
  const breaks = longBreakKeys(viewYear, viewMonth);         // 連假的日子

  let html = "";
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(viewYear, viewMonth, 1 - startWeekday + i);
    const k = keyOf(d);
    const f = dayFestivals(d);
    const evs = eventsOn(d);
    const cls = [];
    if (d.getMonth() !== viewMonth) cls.push("other");
    if (isWeekend(d)) cls.push("weekend");
    if (f.off) cls.push("off");
    if (f.work) cls.push("work");
    if (breaks.has(k)) cls.push("longbreak");
    if (k === todayKey) cls.push("today");
    if (k === pickedKey) cls.push("picked");

    // 格子裡只放：日期、一個節日短名、第一個行程的主旨
    const first = evs[0];
    const evText = first ? `${first.important ? '<b class="star">★</b>' : ""}${esc(first.title)}${evs.length > 1 ? `<em>+${evs.length - 1}</em>` : ""}` : "";
    const aria = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${WEEK[d.getDay()]}` +
      (f.names.length ? "，" + f.names.map(n => n.text).join("、") : "") + (evs.length ? `，${evs.length} 個行程` : "");

    if (i % 7 === 0) html += "<tr>";
    html += `<td><button class="${cls.join(" ")}" data-key="${k}" aria-label="${esc(aria)}">
        <span class="num">${d.getDate()}</span>
        ${f.off ? '<span class="tag off">休</span>' : f.work ? '<span class="tag work">班</span>' : ""}
        <span class="label">${esc(f.label)}</span>
        <span class="ev">${evText}</span>
        ${evs.length ? '<span class="dot" aria-hidden="true"></span>' : ""}
      </button></td>`;
    if (i % 7 === 6) html += "</tr>";
  }
  document.getElementById("days").innerHTML = html;
  renderDetail();
  renderReminders();
}

/* ---------- 下方的「當日資訊」 ---------- */
function renderDetail() {
  const d = dateOf(pickedKey);
  const f = dayFestivals(d);
  // 第一行：完整日期；第二行：農曆（字小一點）
  document.getElementById("dDate").textContent = `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日　星期${WEEK[d.getDay()]}`;
  if (inLunarRange(d)) {
    const term = solarTerm(d);
    document.getElementById("dLunar").textContent = `農曆 ${lunarText(toLunar(d))}${term ? "　" + term : ""}`;
  } else {
    document.getElementById("dLunar").textContent = "農曆只能換算 1900～2100 年";
  }
  // 節日與假日
  const kindText = { holiday: "國定假日", makeup: "放假", work: "上班", lunar: "農曆節日", term: "節氣", folk: "紀念日", world: "節日" };
  let fest = f.names.map(n => `<span class="chip ${n.kind}">${esc(n.text)}<small>${kindText[n.kind]}</small></span>`).join("");
  if ((f.off || f.work) && !f.official) fest += '<span class="note">此年份尚無官方公告，依現行規則推算</span>';
  document.getElementById("dFest").innerHTML = fest;

  // 行程清單：只顯示主旨，點進去看詳情
  const evs = eventsOn(d);
  document.getElementById("evList").innerHTML = evs.length
    ? evs.map(ev => `<li><button class="ev-item" data-id="${ev.id}">
        ${ev.important ? '<b class="star">★</b>' : ""}<span class="t">${esc(ev.title)}</span>
        <span class="meta">${ev.time ? esc(ev.time) + "　" : ""}${CATEGORIES[ev.cat] || "其他"}${ev.yearly ? "　每年" : ""}</span>
      </button></li>`).join("")
    : '<li class="empty">這天還沒有安排</li>';

  // 備忘與心情
  const memo = document.getElementById("memo");
  if (document.activeElement !== memo) memo.value = store.memos[pickedKey] || "";
  document.querySelectorAll("#moods button").forEach(b => b.setAttribute("aria-checked", String(store.moods[pickedKey] === Number(b.dataset.v))));
}

/* ---------- 近日提醒：未來 7 天的生日、紀念日、每年重複的事 ---------- */
function renderReminders() {
  const box = document.getElementById("remind");
  const items = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(now, i);
    eventsOn(d).filter(ev => ev.yearly || ev.cat === "birthday" || ev.cat === "anniversary").forEach(ev => {
      const when = ["今天", "明天", "後天"][i] || `${i} 天後`;
      items.push(`${d.getMonth() + 1}/${d.getDate()} ${esc(ev.title)}（${when}）`);
    });
  }
  box.hidden = items.length === 0;
  box.innerHTML = items.length ? `<b>近日提醒</b>${items.join("、")}` : "";
}

/* ---------- 點日期 ---------- */
document.getElementById("days").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  pickedKey = btn.dataset.key;
  const d = dateOf(pickedKey);
  if (d.getMonth() !== viewMonth || d.getFullYear() !== viewYear) { viewYear = d.getFullYear(); viewMonth = d.getMonth(); }
  render();
});

// 切換月份、年份
function move(dy, dm) {
  const d = new Date(viewYear + dy, viewMonth + dm, 1);
  viewYear = d.getFullYear(); viewMonth = d.getMonth();
  render();
}
document.getElementById("prevYear").onclick = () => move(-1, 0);
document.getElementById("nextYear").onclick = () => move(1, 0);
document.getElementById("prevMonth").onclick = () => move(0, -1);
document.getElementById("nextMonth").onclick = () => move(0, 1);
document.getElementById("today").onclick = () => { viewYear = now.getFullYear(); viewMonth = now.getMonth(); pickedKey = todayKey; render(); };

/* ---------- 每日備忘（打字時自動存檔） ---------- */
let memoTimer;
document.getElementById("memo").addEventListener("input", e => {
  clearTimeout(memoTimer);
  const key = pickedKey, text = e.target.value;
  memoTimer = setTimeout(() => {
    if (text.trim()) store.memos[key] = text; else delete store.memos[key];
    save();
  }, 400);
});

/* ---------- 每日心情 ---------- */
document.getElementById("moods").innerHTML = MOODS.map(m =>
  `<button role="radio" aria-checked="false" data-v="${m.v}" aria-label="心情：${m.t}">${m.t}</button>`).join("");
document.getElementById("moods").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  const v = Number(b.dataset.v);
  if (store.moods[pickedKey] === v) delete store.moods[pickedKey]; else store.moods[pickedKey] = v;  // 再點一次可取消
  save(); renderDetail();
});

/* =========================================================
   五、行程視窗：查看詳情、新增、修改、刪除
   ========================================================= */
const dlg = document.getElementById("evDialog");
const $ = id => document.getElementById(id);
let editing = null;   // 正在看或修改的行程（新增時是 null）

function fillCategories() {
  $("fCat").innerHTML = Object.entries(CATEGORIES).map(([v, t]) => `<option value="${v}">${t}</option>`).join("");
}
fillCategories();

function setMode(mode) {   // mode：view 查看、edit 編輯
  $("evView").hidden = mode !== "view";
  $("evEdit").hidden = mode !== "edit";
  $("btnEdit").hidden = mode !== "view";
  $("btnSave").hidden = mode !== "edit";
  $("btnDelete").hidden = !editing;
  $("btnCancel").textContent = mode === "view" ? "關閉" : "取消";
  $("btnDelete").textContent = "刪除"; delete $("btnDelete").dataset.armed;
  $("fErr").textContent = "";
}

// 查看詳情
function openView(ev) {
  editing = ev;
  $("dlgTitle").textContent = "行程詳情";
  const d = dateOf(ev.date);
  let when = `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日（星期${WEEK[d.getDay()]}）${ev.time ? "　" + ev.time : ""}`;
  let repeat = "";
  if (ev.yearly) repeat = ev.lunar && inLunarRange(d)
    ? `每年農曆${lunarText(toLunar(d)).split("）")[1]}重複`
    : `每年 ${d.getMonth() + 1} 月 ${d.getDate()} 日重複`;
  $("evView").innerHTML = `
    <p class="v-title">${ev.important ? '<b class="star">★</b>' : ""}${esc(ev.title)}</p>
    <p class="v-meta">${when}</p>
    <p class="v-meta">${CATEGORIES[ev.cat] || "其他"}${ev.important ? "　重要" : ""}${repeat ? "　" + repeat : ""}</p>
    ${ev.note ? `<p class="v-note">${esc(ev.note)}</p>` : '<p class="v-meta">沒有詳細內容</p>'}`;
  setMode("view");
  if (!dlg.open) dlg.showModal();
}

// 新增或修改
function openEdit(ev) {
  editing = ev;
  $("dlgTitle").textContent = ev ? "修改行程" : "新增行程";
  $("fTitle").value = ev ? ev.title : "";
  $("fDate").value = ev ? ev.date : pickedKey;
  $("fTime").value = ev ? (ev.time || "") : "";
  $("fCat").value = ev ? ev.cat : "life";
  $("fImp").checked = ev ? !!ev.important : false;
  $("fYearly").checked = ev ? !!ev.yearly : false;
  $("fLunar").checked = ev ? !!ev.lunar : false;
  $("fNote").value = ev ? (ev.note || "") : "";
  syncLunarBox();
  setMode("edit");
  if (!dlg.open) dlg.showModal();
  $("fTitle").focus();
}

// 只有「每年重複」時，才能選「以農曆計算」
function syncLunarBox() {
  $("fLunar").disabled = !$("fYearly").checked;
  if (!$("fYearly").checked) $("fLunar").checked = false;
}
$("fYearly").addEventListener("change", syncLunarBox);
// 選生日或紀念日時，自動勾選「每年重複」
$("fCat").addEventListener("change", () => {
  if (["birthday", "anniversary"].includes($("fCat").value)) { $("fYearly").checked = true; syncLunarBox(); }
});
$("fTitle").addEventListener("input", () => { $("fErr").textContent = ""; });

$("addEvent").addEventListener("click", () => openEdit(null));
$("evList").addEventListener("click", e => {
  const b = e.target.closest(".ev-item");
  if (b) openView(store.events.find(ev => ev.id === b.dataset.id));
});
$("btnEdit").addEventListener("click", () => openEdit(editing));
$("btnCancel").addEventListener("click", () => dlg.close());

// 儲存（按 Enter 也會觸發）
$("evForm").addEventListener("submit", e => {
  e.preventDefault();
  const title = $("fTitle").value.trim();
  if (!title) { $("fErr").textContent = "請輸入主旨"; $("fTitle").focus(); return; }
  if (!$("fDate").value) { $("fErr").textContent = "請選擇日期"; $("fDate").focus(); return; }
  const data = {
    title, date: $("fDate").value, time: $("fTime").value, cat: $("fCat").value,
    important: $("fImp").checked, yearly: $("fYearly").checked, lunar: $("fLunar").checked, note: $("fNote").value.trim()
  };
  if (editing) Object.assign(editing, data);
  else store.events.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...data });
  save();
  dlg.close();
  pickedKey = data.date;                     // 跳到行程所在的日期
  const d = dateOf(data.date);
  viewYear = d.getFullYear(); viewMonth = d.getMonth();
  render();
});

// 刪除：按兩次才會真的刪掉，避免誤刪
$("btnDelete").addEventListener("click", () => {
  const b = $("btnDelete");
  if (!b.dataset.armed) { b.dataset.armed = "1"; b.textContent = "確定刪除？"; return; }
  store.events = store.events.filter(ev => ev !== editing);
  save(); dlg.close(); render();
});

/* =========================================================
   六、匯出、匯入備份
   ========================================================= */
$("exportBtn").addEventListener("click", () => {
  const backup = { app: "水墨萬年曆", version: 1, exportedAt: new Date().toISOString(), data: store, garlandSeeds: seeds };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `水墨萬年曆備份-${todayKey}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  flash("已匯出備份");
});
$("importBtn").addEventListener("click", () => $("importFile").click());
$("importFile").addEventListener("change", async e => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  try {
    const backup = JSON.parse(await file.text());
    const data = backup.data;
    if (!data || !Array.isArray(data.events)) throw new Error("格式不符");
    // 合併：相同 id 的行程用備份裡的版本，其他保留
    const ids = new Set(data.events.map(ev => ev.id));
    store.events = [...store.events.filter(ev => !ids.has(ev.id)), ...data.events];
    store.memos = { ...store.memos, ...(data.memos || {}) };
    store.moods = { ...store.moods, ...(data.moods || {}) };
    if (Array.isArray(data.cards)) {      // 每日學習：自己新增的學習卡
      const cids = new Set(data.cards.map(c => c.id));
      store.cards = [...(store.cards || []).filter(c => !cids.has(c.id)), ...data.cards];
    }
    store.learned = { ...(store.learned || {}), ...(data.learned || {}) };
    if (Array.isArray(data.cities)) store.cities = data.cities;   // 城市天氣的城市清單
    if (backup.garlandSeeds) { seeds = { ...seeds, ...backup.garlandSeeds }; try { localStorage.setItem("garlandSeeds", JSON.stringify(seeds)); } catch (err) {} }
    save(); lastFrameMonth = -1; render();
    flash(`已匯入 ${data.events.length} 筆行程`);
  } catch (err) {
    flash("這個檔案不是萬年曆的備份檔");
  }
});

// 程式啟動：畫出這個月
render();
