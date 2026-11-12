/* =========================================================
   水墨萬年曆 v16（GitHub 完整版）｜城市天氣
   天氣資料：Open-Meteo（免費、不需要授權碼，台灣與國外都能查）
   天氣特報：中央氣象署（只有台灣；在 config.js 填入授權碼才會顯示，選用）
   整段包在 (() => { ... })() 裡，不和其他程式互相干擾
   ========================================================= */
(() => {
  const $ = id => document.getElementById(id);

  /* ---------- 內建城市清單（名稱、緯度、經度） ---------- */
  // 台灣 22 縣市（名稱和中央氣象署一致，才能對上天氣警報）
  const TAIWAN = [
    ["臺北市", 25.0330, 121.5654], ["新北市", 25.0120, 121.4650], ["基隆市", 25.1276, 121.7392],
    ["桃園市", 24.9936, 121.3010], ["新竹市", 24.8138, 120.9675], ["新竹縣", 24.8390, 121.0040],
    ["苗栗縣", 24.5602, 120.8214], ["臺中市", 24.1477, 120.6736], ["彰化縣", 24.0518, 120.5161],
    ["南投縣", 23.9157, 120.6639], ["雲林縣", 23.7092, 120.5434], ["嘉義市", 23.4801, 120.4491],
    ["嘉義縣", 23.4590, 120.3330], ["臺南市", 22.9999, 120.2270], ["高雄市", 22.6273, 120.3014],
    ["屏東縣", 22.6727, 120.4884], ["宜蘭縣", 24.7570, 121.7530], ["花蓮縣", 23.9871, 121.6015],
    ["臺東縣", 22.7583, 121.1444], ["澎湖縣", 23.5711, 119.5793], ["金門縣", 24.4493, 118.3767],
    ["連江縣", 26.1608, 119.9517]
  ];
  // 常見國外城市
  const WORLD = [
    ["東京", 35.6762, 139.6503], ["大阪", 34.6937, 135.5023], ["首爾", 37.5665, 126.9780],
    ["香港", 22.3193, 114.1694], ["新加坡", 1.3521, 103.8198], ["曼谷", 13.7563, 100.5018],
    ["杜拜", 25.2048, 55.2708], ["雪梨", -33.8688, 151.2093], ["倫敦", 51.5074, -0.1278],
    ["巴黎", 48.8566, 2.3522], ["柏林", 52.5200, 13.4050], ["紐約", 40.7128, -74.0060],
    ["洛杉磯", 34.0522, -118.2437], ["溫哥華", 49.2827, -123.1207]
  ];

  // 天氣代碼（WMO）→ 中文說明與圖示種類
  function describe(code) {
    const table = {
      0: ["晴", "sun"], 1: ["大致晴朗", "sun"], 2: ["多雲", "cloudsun"], 3: ["陰", "cloud"],
      45: ["霧", "fog"], 48: ["霧淞", "fog"],
      51: ["毛毛雨", "rain"], 53: ["毛毛雨", "rain"], 55: ["較強毛毛雨", "rain"], 56: ["凍毛毛雨", "rain"], 57: ["凍毛毛雨", "rain"],
      61: ["小雨", "rain"], 63: ["中雨", "rain"], 65: ["大雨", "rain"], 66: ["凍雨", "rain"], 67: ["凍雨", "rain"],
      71: ["小雪", "snow"], 73: ["中雪", "snow"], 75: ["大雪", "snow"], 77: ["雪粒", "snow"],
      80: ["陣雨", "rain"], 81: ["較強陣雨", "rain"], 82: ["豪大陣雨", "rain"], 85: ["陣雪", "snow"], 86: ["較強陣雪", "snow"],
      95: ["雷雨", "storm"], 96: ["雷雨伴隨冰雹", "storm"], 99: ["強雷雨伴隨冰雹", "storm"]
    };
    return table[code] || ["—", "cloud"];
  }

  // 水墨風天氣圖示（用 SVG 畫，顏色跟著深淺模式變）
  function icon(kind, size = 40) {
    const sun = '<circle cx="24" cy="22" r="9" fill="currentColor" fill-opacity=".15" stroke="currentColor" stroke-width="2.2"/>';
    const cloud = (x = 0, op = .2) => `<path transform="translate(${x} 0)" d="M12 34 Q4 34 5 27 Q6 21 13 22 Q15 14 24 15 Q33 15 34 23 Q42 22 42 29 Q42 34 35 34 Z" fill="currentColor" fill-opacity="${op}" stroke="currentColor" stroke-width="2"/>`;
    const parts = {
      sun: sun + '<g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M24 6v4M24 34v4M8 22h4M36 22h4M12.5 10.5l2.8 2.8M32.7 30.7l2.8 2.8M12.5 33.5l2.8-2.8M32.7 13.3l2.8-2.8"/></g>',
      cloudsun: '<circle cx="30" cy="16" r="7" fill="currentColor" fill-opacity=".12" stroke="currentColor" stroke-width="2"/>' + cloud(-3, .25),
      cloud: cloud(0, .3),
      fog: '<g stroke="currentColor" stroke-width="2.4" stroke-linecap="round" opacity=".8"><path d="M8 18h32M5 25h36M10 32h30M14 39h20"/></g>',
      rain: cloud(0, .3) + '<g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 38l-2 5M24 38l-2 5M32 38l-2 5"/></g>',
      snow: cloud(0, .3) + '<g fill="currentColor"><circle cx="15" cy="41" r="1.8"/><circle cx="24" cy="43" r="1.8"/><circle cx="33" cy="41" r="1.8"/></g>',
      storm: cloud(0, .35) + '<path d="M25 34l-5 7h5l-3 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>'
    };
    return `<svg class="w-icon" width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true"><g filter="url(#brush)">${parts[kind]}</g></svg>`;
  }

  /* ---------- 儲存的城市 ---------- */
  // 每個城市：{ id, name, lat, lon, tw（是不是台灣縣市）, fav（收藏） }
  if (!Array.isArray(store.cities)) {
    store.cities = [
      { id: "c-tpe", name: "臺北市", lat: 25.0330, lon: 121.5654, tw: true, fav: true },
      { id: "c-khh", name: "高雄市", lat: 22.6273, lon: 120.3014, tw: true, fav: false },
      { id: "c-tyo", name: "東京", lat: 35.6762, lon: 139.6503, tw: false, fav: false }
    ];
  }
  const weather = {};      // 天氣資料暫存：{ 城市 id: Open-Meteo 回傳的資料 }
  let alerts = null;       // 氣象署天氣警報：{ "臺北市": [{ phenomena, significance }] }
  let alertState = "";     // 警報的取得狀態說明
  let lastUpdate = null;
  let view = "list";       // list 城市卡片、compare 清單（所有城市排成一張表）
  const openForecast = new Set();

  /* ---------- 取得天氣（直接向 Open-Meteo 要，免費、不需要授權碼） ---------- */
  async function fetchCity(c) {
    const url = "https://api.open-meteo.com/v1/forecast"
      + `?latitude=${c.lat}&longitude=${c.lon}`
      + "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m"
      + "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset"
      + "&timezone=auto&forecast_days=7";
    const res = await fetch(url);
    if (!res.ok) throw new Error("天氣資料取得失敗");
    return res.json();
  }

  // 有逾時限制的 fetch：超過幾秒沒回應就放棄
  async function fetchWithTimeout(url, ms) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try { return await fetch(url, { signal: ctrl.signal }); } finally { clearTimeout(t); }
  }

  /* ---------- 台灣天氣特報（中央氣象署，選用） ----------
     config.js 有填授權碼，才會向氣象署取得特報；沒填就略過。
     不管有沒有填，每個城市都會依照天氣數值顯示高溫、低溫、降雨、強風、雷雨提醒。 */
  function parseCwa(json) {
    const out = {};
    const list = (json.records && json.records.location) || [];
    list.forEach(loc => {
      const hazards = (loc.hazardConditions && loc.hazardConditions.hazards) || [];
      const items = hazards.map(h => ({ phenomena: (h.info && h.info.phenomena) || "", significance: (h.info && h.info.significance) || "" }))
                           .filter(h => h.phenomena);
      if (items.length) out[loc.locationName] = items;
    });
    return out;
  }
  async function fetchAlerts() {
    alerts = null; alertState = "";
    if (!CONFIG.CWA_API_KEY) return;            // 沒有授權碼：不顯示特報，也不顯示任何錯誤
    try {
      const url = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/W-C0033-001?format=JSON&Authorization=" + encodeURIComponent(CONFIG.CWA_API_KEY);
      const res = await fetchWithTimeout(url, 8000);
      alerts = parseCwa(await res.json());
      alertState = "天氣警報：中央氣象署";
    } catch (e) { /* 連不上就只顯示數值提醒 */ }
  }

  async function refresh() {
    $("wStatus").textContent = "更新中…";
    await Promise.all([
      ...store.cities.map(async c => {
        try { weather[c.id] = await fetchCity(c); delete weather[c.id + ":err"]; }
        catch (e) { weather[c.id + ":err"] = true; }
      }),
      fetchAlerts()
    ]);
    lastUpdate = new Date();
    renderWeather();
  }

  /* ---------- 小工具 ---------- */
  const hm = iso => (iso || "").slice(11, 16);                       // "2026-11-10T06:08" → "06:08"
  const pad = n => String(n).padStart(2, "0");
  const round = n => (n === undefined || n === null) ? "—" : Math.round(n);

  // 城市當地時間與時差（用 Open-Meteo 回傳的 utc_offset_seconds 計算）
  function localTime(w) {
    if (!w) return { time: "—", diff: "" };
    const t = new Date(Date.now() + w.utc_offset_seconds * 1000);
    const myOffset = -new Date().getTimezoneOffset() * 60;
    const diffH = (w.utc_offset_seconds - myOffset) / 3600;
    const diff = diffH === 0 ? "與這裡相同" : `時差 ${diffH > 0 ? "+" : ""}${Number.isInteger(diffH) ? diffH : diffH.toFixed(1)} 小時`;
    return { time: `${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}`, diff };
  }

  // 依天氣數值判斷的提醒（每個城市都有，包含國外）
  function autoWarnings(w) {
    const out = [];
    if (!w) return out;
    const c = w.current, d = w.daily;
    if (d.temperature_2m_max[0] >= 35) out.push("高溫");
    if (d.temperature_2m_min[0] <= 10) out.push("低溫");
    if (d.precipitation_probability_max[0] >= 70) out.push("降雨機率高");
    if (c.wind_gusts_10m >= 62) out.push("強風");
    if ([95, 96, 99].includes(c.weather_code)) out.push("雷雨");
    return out;
  }

  /* ---------- 畫面 ---------- */
  function sortedCities() { return [...store.cities].sort((a, b) => (b.fav - a.fav)); }   // 收藏的排前面

  function cardHtml(c) {
    const w = weather[c.id];
    const lt = localTime(w);
    let body;
    if (weather[c.id + ":err"]) body = '<p class="w-msg">無法取得天氣資料，請確認網路連線</p>';
    else if (!w) body = '<p class="w-msg">讀取中…</p>';
    else {
      const cur = w.current, d = w.daily;
      const [desc, kind] = describe(cur.weather_code);
      const cwa = (c.tw && alerts && alerts[c.county || c.name]) || [];   // 鄉鎮市區用它所屬縣市的特報
      const warns = [...cwa.map(a => `${a.phenomena}${a.significance}`), ...autoWarnings(w).map(t => t + "提醒")];
      body = `
        <div class="w-now">${icon(kind, 46)}
          <div><div class="w-temp">${round(cur.temperature_2m)}<small>°C</small></div><div class="w-desc">${desc}</div></div>
          <dl class="w-meta">
            <dt>體感</dt><dd>${round(cur.apparent_temperature)}°</dd>
            <dt>濕度</dt><dd>${round(cur.relative_humidity_2m)}%</dd>
            <dt>降雨</dt><dd>${round(d.precipitation_probability_max[0])}%</dd>
            <dt>高低</dt><dd>${round(d.temperature_2m_max[0])}°／${round(d.temperature_2m_min[0])}°</dd>
          </dl>
        </div>
        <p class="w-sun">日出 ${hm(d.sunrise[0])}　日落 ${hm(d.sunset[0])}　風速 ${round(cur.wind_speed_10m)} km/h</p>
        ${warns.length ? `<div class="w-warns">${warns.map(t => `<span class="w-warn ${cwa.length && !t.endsWith("提醒") ? "cwa" : ""}">${esc(t)}</span>`).join("")}</div>` : ""}
        <button class="link w-more" data-act="forecast" data-id="${c.id}" aria-expanded="${openForecast.has(c.id)}">${openForecast.has(c.id) ? "收起預報" : "七日預報"}</button>
        ${openForecast.has(c.id) ? forecastHtml(w) : ""}`;
    }
    return `<article class="w-card" data-id="${c.id}">
      <header class="w-head">
        <button class="w-fav" data-act="fav" data-id="${c.id}" aria-pressed="${!!c.fav}" aria-label="${c.fav ? "取消收藏" : "收藏"}${esc(c.name)}">${c.fav ? "★" : "☆"}</button>
        <h3>${esc(c.name)}</h3>
        <span class="w-time">${lt.time}<small>${lt.diff}</small></span>
        <button class="w-del" data-act="del" data-id="${c.id}" aria-label="刪除${esc(c.name)}">×</button>
      </header>
      ${body}
    </article>`;
  }

  function forecastHtml(w) {
    const d = w.daily;
    return `<ol class="w-week">${d.time.map((t, i) => {
      const date = new Date(t + "T00:00");
      const [desc, kind] = describe(d.weather_code[i]);
      return `<li><span class="wd">${i === 0 ? "今天" : "週" + WEEK[date.getDay()]}</span>${icon(kind, 26)}
        <span class="hi">${round(d.temperature_2m_max[i])}°</span><span class="lo">${round(d.temperature_2m_min[i])}°</span>
        <span class="pr">${round(d.precipitation_probability_max[i])}%</span><span class="sr-only">${desc}</span></li>`;
    }).join("")}</ol>`;
  }

  // 城市天氣比較：一張表，溫度用長條表示
  function compareHtml() {
    const rows = sortedCities().filter(c => weather[c.id]);
    if (!rows.length) return '<p class="w-msg">還沒有天氣資料可以比較</p>';
    const temps = rows.map(c => weather[c.id].current.temperature_2m);
    const min = Math.min(...temps, 0), max = Math.max(...temps, 1);
    return `<table class="w-compare">
      <thead><tr><th>城市</th><th>溫度</th><th>體感</th><th>濕度</th><th>降雨</th></tr></thead>
      <tbody>${rows.map(c => {
        const w = weather[c.id], cur = w.current;
        const pct = ((cur.temperature_2m - min) / (max - min || 1)) * 100;
        return `<tr><th scope="row">${esc(c.name)}<small>${describe(cur.weather_code)[0]}</small></th>
          <td><span class="bar"><i style="width:${Math.max(4, pct).toFixed(0)}%"></i></span>${round(cur.temperature_2m)}°</td>
          <td>${round(cur.apparent_temperature)}°</td><td>${round(cur.relative_humidity_2m)}%</td><td>${round(w.daily.precipitation_probability_max[0])}%</td></tr>`;
      }).join("")}</tbody></table>`;
  }

  function renderWeather() {
    document.querySelectorAll("#wTabs button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.view === view)));
    $("wList").innerHTML = view === "list"
      ? (store.cities.length ? sortedCities().map(cardHtml).join("") : '<p class="w-msg">還沒有城市，從上面選一個加入吧</p>')
      : compareHtml();
    $("wStatus").textContent = lastUpdate ? `更新於 ${pad(lastUpdate.getHours())}:${pad(lastUpdate.getMinutes())}` : "";
    $("wAlertState").textContent = alertState;
  }

  /* ---------- 加入城市（v16：台灣縣市可以再選鄉鎮市區） ---------- */
  function fillSelect() {
    const opt = list => list.map(([n, la, lo]) => `<option value="${la},${lo}">${n}</option>`).join("");
    $("wSelect").innerHTML = `<option value="">選擇城市</option>
      <optgroup label="台灣縣市">${opt(TAIWAN)}</optgroup><optgroup label="國外城市">${opt(WORLD)}</optgroup>`;
    fillTowns();
  }

  // 第二個選單：選了台灣的縣市，才列出它的鄉鎮市區（TOWNSHIPS 在 townships.js 裡）
  function fillTowns() {
    const sel = $("wSelect");
    const county = sel.value ? sel.options[sel.selectedIndex].text : "";
    const towns = TOWNSHIPS[county];
    const town = $("wTown");
    if (!towns) { town.hidden = true; town.innerHTML = ""; return; }   // 國外城市或還沒選：藏起來
    town.hidden = false;
    town.innerHTML = `<option value="">整個${county}</option>` +
      towns.map(([n, la, lo]) => `<option value="${la},${lo}">${n}</option>`).join("");
  }

  // county：這個城市屬於哪個縣市（天氣特報是用縣市來對應的）
  function addCity(name, lat, lon, tw, county) {
    if (store.cities.some(c => c.name === name)) { $("wErr").textContent = `「${name}」已經在清單裡了`; return; }
    const c = { id: "c-" + Date.now().toString(36), name, lat: Number(lat), lon: Number(lon), tw, fav: false };
    if (county) c.county = county;
    store.cities.push(c); save();
    $("wErr").textContent = "";
    renderWeather();
    fetchCity(c).then(w => { weather[c.id] = w; renderWeather(); }).catch(() => { weather[c.id + ":err"] = true; renderWeather(); });
  }
  $("wAdd").addEventListener("click", () => {
    const sel = $("wSelect"), town = $("wTown");
    if (!sel.value) { $("wErr").textContent = "請先選擇一個城市"; return; }
    const county = sel.options[sel.selectedIndex].text;
    const isTaiwan = TAIWAN.some(t => t[0] === county);
    if (isTaiwan && town.value) {
      // 有選鄉鎮市區：名稱變成「新北市板橋區」，座標用鄉鎮市區的中心點
      const [lat, lon] = town.value.split(",");
      addCity(county + town.options[town.selectedIndex].text, lat, lon, true, county);
    } else {
      const [lat, lon] = sel.value.split(",");
      addCity(county, lat, lon, isTaiwan, isTaiwan ? county : "");
    }
    sel.value = ""; fillTowns();
  });
  $("wSelect").addEventListener("change", () => { $("wErr").textContent = ""; fillTowns(); });

  // 搜尋其他城市（Open-Meteo 地名搜尋，用英文名稱搜尋）
  $("wSearchBtn").addEventListener("click", searchCity);
  $("wSearch").addEventListener("keydown", e => { if (e.key === "Enter") searchCity(); });
  async function searchCity() {
    const q = $("wSearch").value.trim();
    if (!q) { $("wErr").textContent = "請輸入英文城市名稱"; return; }
    $("wResults").innerHTML = '<li class="w-msg">搜尋中…</li>';
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`);
      const json = await res.json();
      const list = json.results || [];
      $("wResults").innerHTML = list.length
        ? list.map(r => `<li><button class="link" data-lat="${r.latitude}" data-lon="${r.longitude}" data-name="${esc(r.name)}">
            ${esc(r.name)}<small>${esc([r.admin1, r.country].filter(Boolean).join(", "))}</small></button></li>`).join("")
        : '<li class="w-msg">找不到這個城市，換個拼法試試看</li>';
    } catch (e) {
      $("wResults").innerHTML = '<li class="w-msg">無法搜尋，請確認網路連線</li>';
    }
  }
  $("wResults").addEventListener("click", e => {
    const b = e.target.closest("button[data-lat]");
    if (!b) return;
    addCity(b.dataset.name, b.dataset.lat, b.dataset.lon, false);
    $("wResults").innerHTML = ""; $("wSearch").value = "";
  });

  /* ---------- 卡片上的按鈕：收藏、刪除、七日預報 ---------- */
  $("wList").addEventListener("click", e => {
    const b = e.target.closest("button[data-act]");
    if (!b) return;
    const c = store.cities.find(x => x.id === b.dataset.id);
    if (!c) return;
    if (b.dataset.act === "fav") { c.fav = !c.fav; save(); renderWeather(); }
    if (b.dataset.act === "forecast") { openForecast.has(c.id) ? openForecast.delete(c.id) : openForecast.add(c.id); renderWeather(); }
    if (b.dataset.act === "del") {
      if (!b.dataset.armed) { b.dataset.armed = "1"; b.textContent = "確定？"; b.classList.add("armed"); return; }   // 按兩次才刪
      store.cities = store.cities.filter(x => x.id !== c.id); save(); renderWeather();
    }
  });

  $("wTabs").addEventListener("click", e => {
    const b = e.target.closest("button[data-view]");
    if (b) { view = b.dataset.view; renderWeather(); }
  });
  $("wRefresh").addEventListener("click", refresh);

  /* ---------- 抽屜：打開、關閉 ---------- */
  const drawer = $("weatherDrawer"), scrim = $("weatherScrim"), launcher = $("weatherLauncher");
  let clockTimer;
  function openWeather() {
    document.querySelectorAll(".drawer.open .close").forEach(b => b.click());   // 先關掉其他抽屜
    drawer.inert = false; drawer.classList.add("open"); scrim.classList.add("open");
    launcher.setAttribute("aria-expanded", "true");
    renderWeather();
    // 超過 10 分鐘沒更新才重新抓
    if (!lastUpdate || Date.now() - lastUpdate > 10 * 60 * 1000) refresh();
    clockTimer = setInterval(renderWeather, 30 * 1000);   // 每 30 秒更新當地時間
    $("closeWeather").focus();
  }
  function closeWeather() {
    drawer.inert = true; drawer.classList.remove("open"); scrim.classList.remove("open");
    launcher.setAttribute("aria-expanded", "false");
    clearInterval(clockTimer);
    launcher.focus();
  }
  launcher.addEventListener("click", openWeather);
  $("closeWeather").addEventListener("click", closeWeather);
  scrim.addEventListener("click", closeWeather);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && drawer.classList.contains("open")) closeWeather(); });

  fillSelect();
})();
