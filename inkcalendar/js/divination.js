/* =========================================================
   水墨萬年曆 v8｜八卦占卜
   三錢搖卦、本卦與變卦、學業／愛情／財運
   ========================================================= */
/* =========================================================
   八卦占卜（整段包在 (() => { ... })() 裡面，
   變數不會和上面萬年曆的程式互相干擾）
   ========================================================= */
(() => {

/* =========================================================
   一、資料（和版本 1 相同）
   ========================================================= */
const NS = "http://www.w3.org/2000/svg";

const TRIGRAMS = {
  "乾": { img: "天", lines: [1,1,1] }, "兌": { img: "澤", lines: [1,1,0] },
  "離": { img: "火", lines: [1,0,1] }, "震": { img: "雷", lines: [1,0,0] },
  "巽": { img: "風", lines: [0,1,1] }, "坎": { img: "水", lines: [0,1,0] },
  "艮": { img: "山", lines: [0,0,1] }, "坤": { img: "地", lines: [0,0,0] }
};
const ORDER = ["乾","兌","離","震","巽","坎","艮","坤"];

// 六十四卦對照表：TABLE[上卦][下卦] = 卦序
const TABLE = [
  [1,10,13,25,44,6,33,12],
  [43,58,49,17,28,47,31,45],
  [14,38,30,21,50,64,56,35],
  [34,54,55,51,32,40,62,16],
  [9,61,37,42,57,59,53,20],
  [5,60,63,3,48,29,39,8],
  [26,41,22,27,18,4,52,23],
  [11,19,36,24,46,7,15,2]
];

// 六十四卦內容：[卦名, 卦意, 學業, 愛情, 財運]
const HEX = {
  1:  ["乾","剛健進取","自強不息，必登高峰","主動追求，剛柔並濟","財運亨通，忌驕自滿"],
  2:  ["坤","柔順包容","穩紮穩打，厚積薄發","溫柔體貼，以誠相待","守成為宜，積少成多"],
  3:  ["屯","萬事起頭","起步艱難，堅持可成","感情萌芽，耐心經營","開創維艱，切勿躁進"],
  4:  ["蒙","啟蒙求教","虛心求教，良師可遇","懵懂未明，多加了解","經驗不足，先學再投"],
  5:  ["需","等待時機","準備充分，靜待佳績","時機未到，耐心等候","時機將至，按兵不動"],
  6:  ["訟","爭執紛爭","莫與人爭，專注本分","易起口角，退讓為上","防範糾紛，契約謹慎"],
  7:  ["師","統眾出征","團隊合作，紀律致勝","需有擔當，正道而行","謀定後動，集眾成事"],
  8:  ["比","親近輔助","結伴學習，互助共進","情投意合，宜早親近","合夥得利，貴人相助"],
  9:  ["小畜","小有積蓄","小有進步，持續累積","感情漸濃，仍需時日","小財可得，大財未到"],
  10: ["履","謹慎踐行","循序漸進，步步踏實","以禮相待，謹言慎行","如履薄冰，小心投資"],
  11: ["泰","通泰和順","學運亨通，事半功倍","兩情相悅，和諧美滿","財源廣進，順勢而為"],
  12: ["否","閉塞不通","遇到瓶頸，調整方法","溝通不良，暫時冷靜","財路受阻，保守為宜"],
  13: ["同人","同心協力","同儕切磋，共同成長","志同道合，心意相通","合作生財，公開透明"],
  14: ["大有","豐收富有","成績豐碩，再接再厲","感情豐盈，彼此珍惜","財運大旺，宜行善施"],
  15: ["謙","謙虛受益","謙虛好學，終有大成","謙和待人，自得真心","低調理財，穩中求進"],
  16: ["豫","安樂愉悅","勿貪安逸，保持專注","甜蜜愉快，莫忘承諾","小有收穫，切忌揮霍"],
  17: ["隨","隨順應變","跟隨良師，順勢學習","隨緣自在，不必強求","順勢而為，跟對方向"],
  18: ["蠱","整治積弊","補強弱點，除舊布新","舊傷待解，坦誠修補","整頓財務，清理舊帳"],
  19: ["臨","親臨督導","好運降臨，積極把握","桃花將臨，主動出擊","財運漸來，把握良機"],
  20: ["觀","觀察省思","多看多想，觀摩學習","靜觀其變，看清對方","觀望為宜，不宜急進"],
  21: ["噬嗑","排除障礙","突破難關，咬緊牙根","誤會阻隔，說清講明","除去阻礙，財路可通"],
  22: ["賁","文飾美化","重視內涵，勿重表面","外表吸引，更重真心","勿為面子，衝動消費"],
  23: ["剝","剝落衰退","狀態下滑，回歸基礎","感情轉淡，宜多關心","財有流失，守住本錢"],
  24: ["復","一陽來復","重新出發，漸入佳境","舊情復燃，重新開始","否極泰來，財運回升"],
  25: ["無妄","真誠無妄","腳踏實地，不走捷徑","真心相待，勿存心機","不義之財，切莫貪取"],
  26: ["大畜","厚積大蓄","博學多聞，蓄勢待發","感情穩固，可談未來","積蓄豐厚，適合儲蓄"],
  27: ["頤","頤養修身","調養身心，讀書有成","言語謹慎，體貼照顧","開源有限，節制開銷"],
  28: ["大過","負荷過重","壓力過大，適度放鬆","付出失衡，宜求平衡","避免冒進，量力而為"],
  29: ["坎","重重險阻","困難重重，堅持到底","波折考驗，以誠相守","風險偏高，謹慎保守"],
  30: ["離","光明依附","思路清晰，表現亮眼","熱情如火，莫太黏人","財運明朗，依附貴人"],
  31: ["咸","感應相通","心有所感，學習投入","心有靈犀，佳緣天成","人緣帶財，合作有成"],
  32: ["恆","恆久不變","持之以恆，水滴石穿","長久穩定，細水長流","長期投資，穩定獲利"],
  33: ["遯","退避隱守","暫時退後，養精蓄銳","保持距離，冷靜觀察","見好就收，暫避風險"],
  34: ["大壯","強盛壯大","衝勁十足，勿太自負","熱情主動，留意分寸","財勢強旺，忌莽撞行"],
  35: ["晉","晉升進步","成績進步，步步高升","感情升溫，關係前進","財運上升，事業晉升"],
  36: ["明夷","光明受傷","暫時低潮，韜光養晦","隱忍委屈，靜待轉機","財運晦暗，謹防受騙"],
  37: ["家人","家庭和睦","家人支持，安心讀書","適合成家，相互扶持","家庭理財，開源節流"],
  38: ["睽","背離乖違","方向分歧，重新聚焦","意見不合，求同存異","合作生變，小事可成"],
  39: ["蹇","艱難險阻","遇到困難，尋求協助","好事多磨，勿輕放棄","財路艱難，停步檢討"],
  40: ["解","解除困境","難題解開，豁然開朗","誤會冰釋，重修舊好","困境解除，資金鬆動"],
  41: ["損","減損有益","去蕪存菁，專精一門","適度付出，不計得失","先捨後得，減少開支"],
  42: ["益","增益得利","進步神速，把握機會","互相增益，感情加溫","財運增長，積極把握"],
  43: ["夬","果決決斷","當機立斷，果斷選擇","勇敢表白，莫再猶豫","果斷取捨，停損得宜"],
  44: ["姤","不期而遇","意外收穫，把握機緣","邂逅良緣，慎辨真心","偶得之財，勿貪勿戀"],
  45: ["萃","聚集薈萃","群聚共學，集思廣益","聚會結緣，人氣旺盛","財氣匯聚，聚沙成塔"],
  46: ["升","上升成長","循序上升，前景光明","感情穩升，漸入佳境","財運漸升，積小成大"],
  47: ["困","困頓窮厄","陷入瓶頸，守志不移","情感受困，多些耐心","資金吃緊，節流為先"],
  48: ["井","源源不絕","打好根基，取之不竭","細心滋養，感情長久","穩定收入，細水長流"],
  49: ["革","變革更新","改變方法，煥然一新","關係轉變，勇於改變","改變策略，開創新局"],
  50: ["鼎","鼎新穩重","學有所成，地位穩固","感情穩定，可定終身","財運穩固，得貴人助"],
  51: ["震","震動驚醒","當頭棒喝，警醒奮發","突然變化，沉著應對","市場震盪，保持冷靜"],
  52: ["艮","止而不動","靜心專注，適可而止","暫緩腳步，留些空間","按兵不動，守住所得"],
  53: ["漸","循序漸進","按部就班，穩定進步","慢慢培養，水到渠成","漸進累積，財運漸好"],
  54: ["歸妹","婚嫁歸宿","選對方向，勿走偏門","名分未定，勿太急躁","謹慎投資，勿聽傳言"],
  55: ["豐","豐盛壯大","成果豐碩，居安思危","感情熱烈，珍惜當下","財運鼎盛，盛極防衰"],
  56: ["旅","羈旅漂泊","換個環境，增廣見聞","遠距戀情，信任為重","收入不定，節省開支"],
  57: ["巽","順風謙入","潛移默化，持續吸收","溫柔體貼，以柔克剛","小利可圖，順勢而為"],
  58: ["兌","喜悅和樂","學習愉快，教學相長","甜言蜜語，歡喜相處","口才生財，和氣致富"],
  59: ["渙","渙散離散","精神渙散，收心專注","感情疏離，用心挽回","財有散失，集中資源"],
  60: ["節","節制有度","規劃時間，張弛有度","適度分寸，不宜過密","節約開支，量入為出"],
  61: ["中孚","誠信於中","誠心向學，必有收穫","真誠相待，彼此信任","誠信經營，自然得財"],
  62: ["小過","小有過越","細節用心，勿太躁進","小摩擦多，互相包容","小財可得，大事勿為"],
  63: ["既濟","已經完成","目標達成，切勿鬆懈","感情圓滿，用心維持","已有所成，守成為上"],
  64: ["未濟","尚未完成","尚未完成，再接再厲","緣分未定，仍需努力","尚有機會，謹慎前行"]
};

const YAO_NAMES = ["初爻","二爻","三爻","四爻","五爻","上爻"];
const VALUE_NAME = { 6: "老陰", 7: "少陽", 8: "少陰", 9: "老陽" };

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const SPEED = REDUCED ? 0.3 : 1;

/* =========================================================
   二、小工具
   ========================================================= */
const wait = ms => new Promise(r => setTimeout(r, ms * SPEED));

function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

function findTrigram(three) {
  return ORDER.find(k => TRIGRAMS[k].lines.join("") === three.join(""));
}
function findHexagram(six) {
  const lower = findTrigram(six.slice(0, 3));
  const upper = findTrigram(six.slice(3, 6));
  const num = TABLE[ORDER.indexOf(upper)][ORDER.indexOf(lower)];
  const [name, meaning, study, love, money] = HEX[num];
  const full = upper === lower ? `${name}為${TRIGRAMS[upper].img}` : `${TRIGRAMS[upper].img}${TRIGRAMS[lower].img}${name}`;
  return { num, name, full, upper, lower, meaning, study, love, money };
}

/* ---------- 毛筆筆畫 ----------
   一筆橫畫：起筆稍粗、中段略細、收筆圓潤
   用「填色的形狀」而不是單純的線，比較像毛筆 */
function strokePath(x, y, len, h) {
  const r = h / 2;
  return `M${x + r} ${y - r * .9}
          C${x + len * .3} ${y - r * 1.05} ${x + len * .7} ${y - r * .7} ${x + len - r} ${y - r * .85}
          Q${x + len + r * .6} ${y} ${x + len - r} ${y + r * .9}
          C${x + len * .7} ${y + r * .75} ${x + len * .3} ${y + r * 1.1} ${x + r} ${y + r}
          Q${x - r * .5} ${y} ${x + r} ${y - r * .9}Z`;
}
// 一爻（陽 = 一筆，陰 = 兩筆），回傳 SVG 字串
function yaoStrokes(x, y, w, h, yang, op = 1) {
  const gap = w * .16;
  const half = (w - gap) / 2;
  const parts = yang ? [[x, w]] : [[x, half], [x + half + gap, half]];
  return parts.map(([px, pw]) =>
    `<path d="${strokePath(px, y, pw, h)}" fill="currentColor" fill-opacity="${op}" filter="url(#brush)"/>`).join("");
}
// 小卦象（結果用）
function hexSvg(lines, marks = []) {
  const w = 60, h = 8, step = 13, H = 6 * step + 4;
  let s = `<svg width="${w + 16}" height="${H}" viewBox="0 0 ${w + 16} ${H}" aria-hidden="true">`;
  lines.forEach((yang, i) => {
    const y = H - 8 - i * step;
    s += yaoStrokes(0, y, w, h, yang, .9);
    if (marks[i]) s += `<circle cx="${w + 10}" cy="${y}" r="3" fill="none" stroke="currentColor" stroke-width="1.4"/>`;
  });
  return s + "</svg>";
}

/* =========================================================
   三、水墨八卦
   ========================================================= */
function buildBagua() {
  const g = document.getElementById("baguaSpin");
  // 外圈：一筆畫成的不完全圓（留一個缺口，像書法的「圓相」）
  el("path", { d: "M-8 -164 C90 -168 166 -96 164 4 C162 104 84 166 -6 164 C-104 160 -166 86 -162 -10 C-158 -90 -100 -150 -30 -162",
    fill: "none", stroke: "currentColor", "stroke-width": 6, "stroke-linecap": "round", "stroke-opacity": .85, filter: "url(#brush)" }, g);
  el("circle", { r: 62, fill: "none", stroke: "currentColor", "stroke-width": 1.2, "stroke-opacity": .35, filter: "url(#brush)" }, g);

  // 太極：濃墨＋留白
  const tj = el("g", { filter: "url(#brush)" }, g);
  el("circle", { r: 46, fill: "var(--paper)", stroke: "currentColor", "stroke-width": 2 }, tj);
  el("path", { d: "M0,-46 A46,46 0 0,1 0,46 A23,23 0 0,1 0,0 A23,23 0 0,0 0,-46Z", fill: "currentColor", "fill-opacity": .92 }, tj);
  el("circle", { cy: -23, r: 6.5, fill: "currentColor", "fill-opacity": .92 }, tj);
  el("circle", { cy: 23, r: 6.5, fill: "var(--paper)" }, tj);

  // 先天八卦，每一爻都是毛筆筆畫；墨色每卦略有濃淡
  ["乾","巽","坎","艮","坤","震","離","兌"].forEach((key, i) => {
    const t = el("g", { transform: `rotate(${i * 45}) translate(0 -112)` }, g);
    const op = .7 + Math.random() * .3;
    t.innerHTML = TRIGRAMS[key].lines.map((yang, j) => yaoStrokes(-30, 16 - j * 16, 60, 9, yang, op)).join("");
    // 卦名小字
    const label = el("text", { y: -32, "text-anchor": "middle", "font-size": 13, fill: "currentColor", "fill-opacity": .55,
      "font-family": "LXGW WenKai TC, serif" }, t);
    label.textContent = key;
  });
}

/* =========================================================
   四、水墨銅錢：字面留白、背面濃墨，一眼就分得出來
   ========================================================= */
const coinLayer = document.getElementById("coins");

function makeCoin() {
  const outer = el("g", { opacity: 0 }, coinLayer);
  const spin = el("g", {}, outer);
  // 字面：白底墨圈墨字
  const face = el("g", { filter: "url(#brush)" }, spin);
  el("circle", { r: 30, fill: "var(--paper)", stroke: "currentColor", "stroke-width": 2.6 }, face);
  el("circle", { r: 24, fill: "none", stroke: "currentColor", "stroke-width": .8, "stroke-opacity": .5 }, face);
  el("rect", { x: -7.5, y: -7.5, width: 15, height: 15, fill: "none", stroke: "currentColor", "stroke-width": 2 }, face);
  [["太",0,-12],["平",0,20],["通",15,4],["寶",-15,4]].forEach(([w, x, y]) => {
    const t = el("text", { x, y, "text-anchor": "middle", "font-size": 11, fill: "currentColor", "font-family": "LXGW WenKai TC, serif" }, face);
    t.textContent = w;
  });
  // 背面：濃墨實心，中間留一個方孔
  const back = el("g", { visibility: "hidden", filter: "url(#brush)" }, spin);
  el("circle", { r: 30, fill: "currentColor", "fill-opacity": .88 }, back);
  el("rect", { x: -7.5, y: -7.5, width: 15, height: 15, fill: "var(--paper)" }, back);
  return { outer, spin, face, back };
}
const coins = [makeCoin(), makeCoin(), makeCoin()];

function tossCoin(coin, tx, ty, isFace, delay) {
  return new Promise(resolve => {
    const sx = 180 + (Math.random() - .5) * 40, sy = 220;  // 從框框下緣拋出
    const height = 80 + Math.random() * 20;  // 面板較小，拋低一點
    const spins = 3 + Math.floor(Math.random() * 3);
    const endAngle = isFace ? 0 : Math.PI;
    const duration = 1000 * SPEED;
    let start = null;
    coin.outer.setAttribute("opacity", 1);
    function frame(now) {
      if (start === null) start = now + delay * SPEED;
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      const ease = 1 - Math.pow(1 - t, 3);
      const x = sx + (tx - sx) * t;
      const y = sy + (ty - sy) * t - height * 4 * t * (1 - t);
      const scaleX = Math.cos(spins * 2 * Math.PI * (1 - ease) + endAngle);
      coin.outer.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      coin.spin.setAttribute("transform", `scale(${scaleX.toFixed(3)} 1)`);
      coin.face.setAttribute("visibility", scaleX >= 0 ? "visible" : "hidden");
      coin.back.setAttribute("visibility", scaleX >= 0 ? "hidden" : "visible");
      if (t < 1) requestAnimationFrame(frame); else resolve();
    }
    requestAnimationFrame(frame);
  });
}

/* =========================================================
   五、主流程
   ========================================================= */
const baguaBtn = document.getElementById("baguaBtn");
const hint = document.getElementById("hint");
const stage1 = document.getElementById("stage1");
const castArea = document.getElementById("castArea");
const castStatus = document.getElementById("castStatus");
const yaoList = document.getElementById("yaoList");
const result = document.getElementById("result");
const hexCards = document.getElementById("hexCards");
const HINT = "靜心默念所問之事　輕點八卦";
let busy = false;

function prepareList() {
  yaoList.innerHTML = YAO_NAMES.map(n =>
    `<li><span class="n">${n}</span><span class="t"></span><span class="d"></span><span class="m"></span></li>`).join("");
}

// 用毛筆「寫」出一爻：用遮罩從左到右慢慢露出
function writeYao(li, yang, mark) {
  const id = "m" + Math.random().toString(36).slice(2, 8);
  li.querySelector(".d").innerHTML =
    `<svg width="70" height="16" viewBox="0 0 70 16" aria-hidden="true">
       <defs><clipPath id="${id}"><rect x="0" y="0" width="0" height="16"><animate attributeName="width" from="0" to="70" dur="${.6 * SPEED}s" fill="freeze"/></rect></clipPath></defs>
       <g clip-path="url(#${id})">${yaoStrokes(2, 8, 66, 10, yang, .92)}</g>
     </svg>`;
  li.querySelector(".m").textContent = mark;
}

baguaBtn.addEventListener("click", async () => {
  if (busy) return;
  busy = true;

  // 1. 八卦像墨散開一樣消失
  baguaBtn.classList.add("gone");
  hint.textContent = "";
  await wait(800);
  stage1.style.display = "none";

  // 2. 換成搖卦區
  prepareList();
  castArea.classList.add("show");
  coins.forEach(c => c.outer.setAttribute("opacity", 0));
  const items = yaoList.querySelectorAll("li");
  const values = [];

  for (let i = 0; i < 6; i++) {
    castStatus.textContent = `第${"一二三四五六"[i]}擲`;
    const sides = [0, 1, 2].map(() => Math.random() < 0.5);   // true = 字面
    const spots = [[90, 130], [180, 146], [270, 128]];
    await Promise.all(coins.map((c, k) =>
      tossCoin(c, spots[k][0] + (Math.random() - .5) * 20, spots[k][1] + (Math.random() - .5) * 14, sides[k], k * 80)));
    await wait(350);   // 等銅錢停穩

    const v = sides.reduce((sum, isFace) => sum + (isFace ? 2 : 3), 0);
    values.push(v);
    const li = items[i];
    li.querySelector(".t").textContent = sides.map(s => s ? "字" : "背").join("") + "　" + VALUE_NAME[v];
    writeYao(li, v === 7 || v === 9, v === 9 ? "○" : v === 6 ? "×" : "");
    li.classList.add("done");
    await wait(800);
    if (i < 5) { coins.forEach(c => c.outer.setAttribute("opacity", 0)); await wait(150); }
  }

  castStatus.textContent = "六爻已成";
  showResult(values);
  busy = false;
});

/* =========================================================
   六、結果
   ========================================================= */
function card(title, h, lines, marks, note) {
  return `<article class="hexCard">
    <h2>${title}</h2>
    <div class="hexHead">${hexSvg(lines, marks)}
      <div><div class="hexName">${h.full}</div>
      <div class="hexMeta">第${h.num}卦　${h.meaning}</div>
      ${note ? `<div class="hexMeta">${note}</div>` : ""}</div>
    </div>
    <dl>
      <dt>學業</dt><dd>${h.study}</dd>
      <dt>愛情</dt><dd>${h.love}</dd>
      <dt>財運</dt><dd>${h.money}</dd>
    </dl>
  </article>`;
}

function showResult(values) {
  const benLines = values.map(v => (v === 7 || v === 9) ? 1 : 0);
  const changing = values.map(v => v === 6 || v === 9);
  const ben = findHexagram(benLines);
  const hasChange = changing.some(Boolean);
  let html = card("本卦", ben, benLines, changing,
    hasChange ? "變爻　" + YAO_NAMES.filter((_, i) => changing[i]).join("、") : "六爻皆靜");
  if (hasChange) {
    const bianLines = benLines.map((y, i) => changing[i] ? 1 - y : y);
    html += card("變卦", findHexagram(bianLines), bianLines, [], "事情後續的發展");
  }
  hexCards.innerHTML = html;
  result.classList.add("show");
  result.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "nearest" });
}

/* =========================================================
   七、再占一次
   ========================================================= */
document.getElementById("againBtn").addEventListener("click", () => {
  result.classList.remove("show");
  castArea.classList.remove("show");
  stage1.style.display = "";
  hint.textContent = HINT;
  requestAnimationFrame(() => baguaBtn.classList.remove("gone"));
  document.getElementById("drawerBody").scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
});

buildBagua();

/* =========================================================
   八、抽屜：打開、關閉
   ========================================================= */
// 右上角小八卦：直接複製大八卦畫好的內容
document.getElementById("launcherBagua").innerHTML = document.getElementById("baguaSpin").innerHTML;

const drawer = document.getElementById("drawer");
const scrim = document.getElementById("scrim");
const launcher = document.getElementById("launcher");

function openDrawer() {
  drawer.inert = false;
  drawer.classList.add("open"); scrim.classList.add("open");
  launcher.setAttribute("aria-expanded", "true");
  document.getElementById("closeDrawer").focus();
}
function closeDrawer() {
  drawer.inert = true;
  drawer.classList.remove("open"); scrim.classList.remove("open");
  launcher.setAttribute("aria-expanded", "false");
  launcher.focus();
}
launcher.addEventListener("click", () => {
  document.querySelectorAll(".drawer.open .close").forEach(b => b.click());   // 先關掉其他抽屜
  openDrawer();
});
document.getElementById("closeDrawer").addEventListener("click", closeDrawer);
scrim.addEventListener("click", closeDrawer);                       // 點抽屜外面也能關
document.addEventListener("keydown", e => {                          // 按 Esc 關閉
  if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
});

})();
