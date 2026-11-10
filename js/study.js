/* =========================================================
   水墨萬年曆 v8｜每日學習
   英文與程式學習卡、新增學習卡
   ========================================================= */
/* =========================================================
   七、每日學習（英文／程式）
   整段包在 (() => { ... })() 裡，不和其他程式互相干擾
   ========================================================= */
(() => {
  // 內建學習卡：英文 30 則、程式 30 則
  // 欄位：front 正面（單字或標題）、pos 詞性、meaning 意思或說明、example 例句或程式碼、trans 例句翻譯
  const EN = [
    ["resilient", "形容詞", "有韌性的、能很快恢復的", "She is resilient and never gives up.", "她很有韌性，從不放棄。"],
    ["schedule", "名詞／動詞", "行程表；安排", "Let me check my schedule first.", "讓我先看看我的行程。"],
    ["remind", "動詞", "提醒", "Please remind me to call my mom.", "請提醒我打電話給媽媽。"],
    ["anniversary", "名詞", "週年紀念日", "Today is our tenth wedding anniversary.", "今天是我們結婚十週年紀念日。"],
    ["forecast", "名詞", "預報", "The weather forecast says it will rain.", "天氣預報說會下雨。"],
    ["humid", "形容詞", "潮濕的", "Taipei is very humid in summer.", "台北的夏天很潮濕。"],
    ["festival", "名詞", "節日、慶典", "The Mid-Autumn Festival is in September this year.", "今年的中秋節在九月。"],
    ["calendar", "名詞", "日曆、行事曆", "I wrote her birthday on the calendar.", "我把她的生日寫在日曆上。"],
    ["deadline", "名詞", "截止期限", "The deadline for the report is Friday.", "報告的截止日是星期五。"],
    ["habit", "名詞", "習慣", "Reading every day is a good habit.", "每天閱讀是個好習慣。"],
    ["patient", "形容詞", "有耐心的", "Be patient; learning takes time.", "要有耐心，學習需要時間。"],
    ["curious", "形容詞", "好奇的", "Children are curious about everything.", "小孩對什麼都很好奇。"],
    ["improve", "動詞", "改善、進步", "Practice will improve your English.", "練習會讓你的英文進步。"],
    ["achieve", "動詞", "達成", "You can achieve your goal step by step.", "你可以一步一步達成目標。"],
    ["balance", "名詞", "平衡", "It is important to keep a balance between work and rest.", "在工作與休息之間保持平衡很重要。"],
    ["grateful", "形容詞", "感激的", "I am grateful for your help.", "我很感謝你的幫忙。"],
    ["explore", "動詞", "探索", "We explored the old streets of Tainan.", "我們探索了台南的老街。"],
    ["peaceful", "形容詞", "寧靜的、平和的", "The lake looks peaceful in the morning.", "早晨的湖面看起來很寧靜。"],
    ["mist", "名詞", "薄霧", "The mountains were covered in mist.", "群山被薄霧籠罩。"],
    ["bamboo", "名詞", "竹子", "Bamboo grows very fast.", "竹子長得非常快。"],
    ["fortune", "名詞", "運氣；財富", "Good fortune comes to those who work hard.", "好運會降臨在努力的人身上。"],
    ["memory", "名詞", "記憶、回憶", "That trip is my favorite memory.", "那趟旅行是我最喜歡的回憶。"],
    ["effort", "名詞", "努力", "Your effort will pay off.", "你的努力會有回報。"],
    ["confident", "形容詞", "有自信的", "She felt confident before the exam.", "考試前她覺得很有自信。"],
    ["journey", "名詞", "旅程", "Life is a long journey.", "人生是一段漫長的旅程。"],
    ["celebrate", "動詞", "慶祝", "We celebrate the Lunar New Year with family.", "我們和家人一起慶祝農曆新年。"],
    ["tradition", "名詞", "傳統", "Eating rice dumplings is a Dragon Boat Festival tradition.", "吃粽子是端午節的傳統。"],
    ["sunrise", "名詞", "日出", "We woke up early to watch the sunrise.", "我們早起看日出。"],
    ["temperature", "名詞", "溫度", "The temperature will drop tonight.", "今晚氣溫會下降。"],
    ["focus", "動詞／名詞", "專注；焦點", "Turn off your phone and focus on your work.", "關掉手機，專心工作。"]
  ].map((c, i) => ({ id: "en-" + (i + 1), type: "en", front: c[0], pos: c[1], meaning: c[2], example: c[3], trans: c[4] }));

  const CODE = [
    ["HTML 的基本骨架", "每個網頁都從這個骨架開始：head 放設定，body 放看得到的內容。",
     '<!DOCTYPE html>\n<html lang="zh-Hant-TW">\n<head>\n  <meta charset="UTF-8">\n  <title>我的網頁</title>\n</head>\n<body>\n  <h1>你好</h1>\n</body>\n</html>'],
    ["標題與段落", "h1 到 h6 是標題，數字越小字越大；p 是一段文字。",
     "<h1>大標題</h1>\n<h2>小標題</h2>\n<p>這是一段文字。</p>"],
    ["連結與圖片", "a 是連結，img 是圖片；alt 是圖片無法顯示時的說明，也能幫助視障朋友。",
     '<a href="https://example.com">點我</a>\n<img src="cat.jpg" alt="一隻貓">'],
    ["CSS 選擇器", "標籤名稱直接寫，class 前面加「.」，id 前面加「#」。",
     "p { color: gray; }\n.note { font-size: 14px; }\n#title { font-weight: bold; }"],
    ["盒子模型", "每個元素都是一個盒子，由內到外是：內容、padding（內距）、border（框線）、margin（外距）。",
     ".box {\n  width: 200px;\n  padding: 10px;\n  border: 1px solid black;\n  margin: 20px;\n}"],
    ["透明度 rgba", "rgba 最後一個數字是透明度，0 是全透明、1 是不透明。萬年曆的表格就是用 0.5。",
     ".table { background: rgba(255, 255, 255, 0.5); }"],
    ["游標互動 :hover", "滑鼠移到元素上時才套用的樣式；transform 讓它往上浮一點。",
     "button:hover {\n  background: #eee;\n  transform: translateY(-2px);\n}"],
    ["Flexbox 排列", "讓裡面的東西橫向排列；gap 是間距，justify-content 控制對齊方式。",
     ".row {\n  display: flex;\n  gap: 10px;\n  justify-content: center;\n}"],
    ["CSS 動畫", "先用 @keyframes 定義動作，再用 animation 套用。背景的竹子搖曳就是這樣做的。",
     "@keyframes sway {\n  0%, 100% { transform: rotate(-1deg); }\n  50% { transform: rotate(1deg); }\n}\n.bamboo { animation: sway 7s ease-in-out infinite; }"],
    ["變數 let 與 const", "不會再改變的值用 const，之後會改變的值用 let。",
     'const name = "小明";   // 不會再改的值\nlet count = 0;        // 之後會改變的值\ncount = count + 1;'],
    ["字串樣板", "用反引號 ` 包起來，${ } 裡面可以直接放變數。",
     "const year = 2026;\nconst text = `今年是 ${year} 年`;"],
    ["if 判斷", "條件成立就執行第一段，不成立就執行 else 那一段。",
     'const hour = 14;\nif (hour < 12) {\n  console.log("早安");\n} else {\n  console.log("午安");\n}'],
    ["for 迴圈", "重複做同一件事。萬年曆畫出每一個格子，就是用迴圈。",
     'for (let i = 1; i <= 7; i++) {\n  console.log("第 " + i + " 天");\n}'],
    ["函式", "把一段程式包起來，可以重複使用；return 是回傳結果。",
     "function add(a, b) {\n  return a + b;\n}\nadd(2, 3);   // 5"],
    ["箭頭函式", "函式的簡短寫法，只有一行時可以省略 return。",
     "const double = n => n * 2;\ndouble(4);   // 8"],
    ["陣列", "用中括號存放一串資料；push 會加到最後面，length 是數量。",
     'const fruits = ["蘋果", "香蕉"];\nfruits.push("芭樂");\nfruits.length;   // 3'],
    ["物件", "用大括號把相關的資料放在一起，再用「.名稱」取出。",
     'const event = {\n  title: "媽媽生日",\n  date: "2026-11-12"\n};\nevent.title;   // "媽媽生日"'],
    ["陣列的 filter", "只留下符合條件的項目。找出某一天的行程，就是用 filter。",
     "const nums = [1, 5, 8, 12];\nconst big = nums.filter(n => n > 6);   // [8, 12]"],
    ["陣列的 map", "把每一項轉換成新的樣子，回傳一個新陣列。",
     'const days = [1, 2, 3];\nconst labels = days.map(d => d + " 日");   // ["1 日", "2 日", "3 日"]'],
    ["選取網頁元素", "先找到網頁上的元素，再改變它的內容。",
     'const title = document.getElementById("title");\ntitle.textContent = "2026 年 11 月";'],
    ["點擊事件", "使用者點擊時，執行指定的程式。",
     'button.addEventListener("click", () => {\n  alert("你按了按鈕");\n});'],
    ["classList", "用程式加上或移除 class，再搭配 CSS 改變外觀。",
     'cell.classList.add("today");\ncell.classList.remove("today");\ncell.classList.toggle("picked");'],
    ["Date 日期", "注意：月份是從 0 開始算，0 代表一月。",
     "const today = new Date();\ntoday.getFullYear();   // 年\ntoday.getMonth();      // 月（0 代表一月）\ntoday.getDate();       // 日"],
    ["一個月有幾天", "「下個月的第 0 天」就是這個月的最後一天，萬年曆用這招算天數。",
     "// 2026 年 2 月有幾天？（月份 2 代表三月）\nconst days = new Date(2026, 2, 0).getDate();   // 28"],
    ["localStorage 存檔", "把資料存在瀏覽器裡，關掉網頁再打開還會在。萬年曆的行程就是這樣存的。",
     'localStorage.setItem("memo", "記得繳電費");\nlocalStorage.getItem("memo");   // "記得繳電費"'],
    ["JSON", "localStorage 只能存文字，所以物件要先轉成 JSON 文字。",
     "const text = JSON.stringify({ a: 1 });   // 物件轉文字\nconst obj = JSON.parse(text);          // 文字轉物件"],
    ["setTimeout", "等一段時間再執行，單位是毫秒（1000 毫秒 = 1 秒）。",
     'setTimeout(() => {\n  console.log("一秒後執行");\n}, 1000);'],
    ["innerHTML 與 textContent", "使用者輸入的內容要用 textContent 顯示，比較安全。",
     'box.textContent = "<b>文字</b>";   // 原樣顯示\nbox.innerHTML = "<b>粗體</b>";     // 當成 HTML'],
    ["立即執行函式", "把變數關在自己的範圍裡，不會和其他程式打架。八卦占卜和這個每日學習都是這樣包起來的。",
     "(() => {\n  const secret = 42;\n})();\n// 外面看不到 secret"],
    ["fetch 取得資料", "從網路上取得資料，之後的天氣功能會用到。",
     'fetch("https://api.example.com/data")\n  .then(res => res.json())\n  .then(data => console.log(data));']
  ].map((c, i) => ({ id: "code-" + (i + 1), type: "code", front: c[0], meaning: c[1], example: c[2] }));

  // 自己新增的卡片也存在 store 裡，匯出備份時會一起帶走
  store.cards = store.cards || [];
  store.learned = store.learned || {};

  const $ = id => document.getElementById(id);
  let tab = "en";          // 目前分頁：en 英文、code 程式
  let offset = 0;          // 和「今天那一則」相差幾則（按上一則、下一則會改變）

  // 某一類的全部卡片：內建 + 自己新增
  const deck = type => [...(type === "en" ? EN : CODE), ...store.cards.filter(c => c.type === type)];

  // 今天是第幾則：用「今年第幾天」決定，每天自動換一則
  function todayIndex(len) {
    const start = new Date(now.getFullYear(), 0, 1);
    const nth = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - start) / 86400000);
    return nth % len;
  }

  function renderCard() {
    const cards = deck(tab);
    const base = todayIndex(cards.length);
    const i = ((base + offset) % cards.length + cards.length) % cards.length;
    const c = cards[i];
    document.querySelectorAll("#studyTabs button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === tab)));
    $("studyWhen").textContent = offset === 0 ? `今天的${tab === "en" ? "英文" : "程式"}` : `第 ${i + 1} 則`;
    $("studyCount").textContent = `${i + 1} ／ ${cards.length}`;

    const mine = c.id.startsWith("my-");
    let html = tab === "en"
      ? `<p class="s-front">${esc(c.front)}</p>
         ${c.pos ? `<p class="s-pos">${esc(c.pos)}</p>` : ""}
         <p class="s-meaning">${esc(c.meaning)}</p>
         ${c.example ? `<p class="s-example">${esc(c.example)}</p>` : ""}
         ${c.trans ? `<p class="s-trans">${esc(c.trans)}</p>` : ""}`
      : `<p class="s-front s-code-title">${esc(c.front)}</p>
         ${c.example ? `<pre class="s-code"><code>${esc(c.example)}</code></pre>` : ""}
         <p class="s-meaning">${esc(c.meaning)}</p>`;
    html += `<div class="s-actions">
        <button class="link" id="learnBtn" aria-pressed="${!!store.learned[c.id]}">${store.learned[c.id] ? "✓ 已記住" : "記住了"}</button>
        ${mine ? '<button class="link danger-link" id="delCard">刪除這張卡</button>' : '<span class="s-src">內建</span>'}
      </div>`;
    $("studyCard").innerHTML = html;
    $("studyCard").dataset.id = c.id;
    const learned = cards.filter(x => store.learned[x.id]).length;
    $("studyProgress").textContent = `已記住 ${learned} 則`;
    $("todayCard").hidden = offset === 0;
  }

  // 分頁切換
  $("studyTabs").addEventListener("click", e => {
    const b = e.target.closest("button[data-tab]");
    if (!b) return;
    tab = b.dataset.tab; offset = 0;
    $("cType").value = tab; syncFormLabels();
    renderCard();
  });
  $("prevCard").onclick = () => { offset--; renderCard(); };
  $("nextCard").onclick = () => { offset++; renderCard(); };
  $("todayCard").onclick = () => { offset = 0; renderCard(); };

  // 記住了、刪除
  $("studyCard").addEventListener("click", e => {
    const id = $("studyCard").dataset.id;
    if (e.target.id === "learnBtn") {
      if (store.learned[id]) delete store.learned[id]; else store.learned[id] = true;
      save(); renderCard();
    }
    if (e.target.id === "delCard") {
      const b = e.target;
      if (!b.dataset.armed) { b.dataset.armed = "1"; b.textContent = "確定刪除？"; return; }
      store.cards = store.cards.filter(c => c.id !== id);
      delete store.learned[id];
      save(); offset = 0; renderCard();
    }
  });

  /* ---------- 新增學習卡 ---------- */
  // 英文和程式的欄位名稱不同
  function syncFormLabels() {
    const en = $("cType").value === "en";
    $("lFront").firstChild.textContent = en ? "單字" : "標題";
    $("lMeaning").firstChild.textContent = en ? "中文意思" : "說明";
    $("lExample").firstChild.textContent = en ? "例句（選填）" : "程式碼（選填）";
    $("lPos").hidden = !en;
    $("lTrans").hidden = !en;
    $("cExample").classList.toggle("mono", !en);
  }
  $("cType").addEventListener("change", syncFormLabels);
  ["cFront", "cMeaning"].forEach(id => $(id).addEventListener("input", () => { $("cErr").textContent = ""; }));

  const newId = () => "my-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

  $("addCard").addEventListener("click", () => {
    const front = $("cFront").value.trim(), meaning = $("cMeaning").value.trim();
    if (!front) { $("cErr").textContent = $("cType").value === "en" ? "請輸入單字" : "請輸入標題"; $("cFront").focus(); return; }
    if (!meaning) { $("cErr").textContent = $("cType").value === "en" ? "請輸入中文意思" : "請輸入說明"; $("cMeaning").focus(); return; }
    const type = $("cType").value;
    store.cards.push({ id: newId(), type, front, meaning, pos: $("cPos").value.trim(), example: $("cExample").value, trans: $("cTrans").value.trim() });
    save();
    ["cFront", "cMeaning", "cPos", "cExample", "cTrans"].forEach(id => $(id).value = "");
    // 新增後直接顯示這張卡
    tab = type;
    const cards = deck(tab);
    offset = cards.length - 1 - todayIndex(cards.length);
    renderCard();
    $("studyBody").scrollTo({ top: 0, behavior: "smooth" });
  });

  // 一次貼上很多張：每行一張，用 | 分隔
  $("bulkAdd").addEventListener("click", () => {
    const type = $("cType").value;
    const lines = $("bulkText").value.split("\n").map(s => s.trim()).filter(Boolean);
    let added = 0;
    lines.forEach(line => {
      const p = line.split("|").map(s => s.trim());
      if (!p[0] || !p[1]) return;      // 至少要有正面和意思
      store.cards.push(type === "en"
        ? { id: newId(), type, front: p[0], meaning: p[1], example: p[2] || "", trans: p[3] || "", pos: "" }
        : { id: newId(), type, front: p[0], meaning: p[1], example: (p[2] || "").replace(/\\n/g, "\n") });
      added++;
    });
    $("bulkErr").textContent = added ? "" : "沒有可以新增的內容，請確認每行都有用 | 分隔";
    if (!added) return;
    save(); $("bulkText").value = "";
    flash(`已新增 ${added} 張學習卡`);
    tab = type; offset = 0; renderCard();
  });

  /* ---------- 抽屜：打開、關閉 ---------- */
  const drawer = $("studyDrawer"), scrim = $("studyScrim"), launcher = $("studyLauncher");
  function openStudy() {
    document.querySelectorAll(".drawer.open .close").forEach(b => b.click());   // 先關掉其他抽屜
    drawer.inert = false; drawer.classList.add("open"); scrim.classList.add("open");
    launcher.setAttribute("aria-expanded", "true");
    offset = 0; renderCard();
    $("closeStudy").focus();
  }
  function closeStudy() {
    drawer.inert = true; drawer.classList.remove("open"); scrim.classList.remove("open");
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }
  launcher.addEventListener("click", openStudy);
  $("closeStudy").addEventListener("click", closeStudy);
  scrim.addEventListener("click", closeStudy);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && drawer.classList.contains("open")) closeStudy(); });

  syncFormLabels();
})();
