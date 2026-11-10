/* =========================================================
   水墨萬年曆 v8｜水墨花朵與花邊
   畫十二個月的花、上下花邊（「改變花框」用的也是這裡的函式）
   ========================================================= */

const NS = "http://www.w3.org/2000/svg";

// 建立 SVG 元素
function el(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

// 可重複的隨機數：給同一個種子（seed）就會得到同樣的結果
let rnd = Math.random;
function setSeed(seed) {
  let a = seed;
  rnd = function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
// 在 -amount 到 +amount 之間隨機
const jitter = amount => (rnd() - 0.5) * 2 * amount;

/* =========================================================
   二、花瓣形狀：都從花心 (0,0) 往上長，長度 L、寬度 W
   ========================================================= */
function petalPath(L, W, tip) {
  if (tip === "round")   // 圓瓣：梅、杏、山茶
    return `M0 0 C${W} ${-L*.25} ${W*.95} ${-L*.95} 0 ${-L} C${-W*.95} ${-L*.95} ${-W} ${-L*.25} 0 0Z`;
  if (tip === "pointed") // 尖瓣：桃、荷、水仙
    return `M0 0 C${W} ${-L*.3} ${W*.6} ${-L*.8} 0 ${-L} C${-W*.6} ${-L*.8} ${-W} ${-L*.3} 0 0Z`;
  if (tip === "ruffle")  // 波浪瓣：牡丹、石榴
    return `M0 0 C${W} ${-L*.25} ${W} ${-L*.9} ${W*.45} ${-L} Q${W*.2} ${-L*.86} 0 ${-L*.97} Q${-W*.2} ${-L*.86} ${-W*.45} ${-L} C${-W} ${-L*.9} ${-W} ${-L*.25} 0 0Z`;
  // thin 細長瓣：菊花
  return `M0 0 Q${W} ${-L*.5} 0 ${-L} Q${-W} ${-L*.5} 0 0Z`;
}

/* =========================================================
   三、畫一朵花
   rings：一層一層的花瓣（外層先畫，內層後畫，才會疊在上面）
   arc：花瓣只分布在某個角度範圍（例如荷花的側面）
   ========================================================= */
function flower(svg, cx, cy, scale, rings, center) {
  const g = el("g", { transform: `translate(${cx} ${cy}) scale(${scale})` }, svg);
  rings.forEach(r => {
    const from = r.arc ? -r.arc : 0;
    const span = r.arc ? r.arc * 2 : 360;
    const step = r.arc ? span / (r.n - 1) : span / r.n;
    const start = from + (r.offset || 0) + (r.arc ? 0 : jitter(20));
    for (let i = 0; i < r.n; i++) {
      const angle = start + i * step + jitter(r.arc ? 6 : 8);
      const L = r.L * (1 + jitter(.15));   // 每片長度不一樣，看起來才自然
      const W = r.W * (1 + jitter(.15));
      const p = el("path", {
        d: petalPath(L, W, r.tip),
        transform: `rotate(${angle.toFixed(1)})`,
        fill: "currentColor",
        "fill-opacity": (r.op * (1 + jitter(.3))).toFixed(3), // 墨色深淺也隨機
        stroke: "currentColor", "stroke-opacity": .5, "stroke-width": .9,
        filter: "url(#ink)"
      }, g);
      // 芙蓉的花瓣上有放射狀的紋路
      if (r.veins) {
        for (let v = -1; v <= 1; v++) {
          el("path", { d: `M0 ${-L*.2} Q${v*W*.35} ${-L*.55} ${v*W*.5} ${-L*.85}`, transform: `rotate(${angle.toFixed(1)})`,
            fill: "none", stroke: "currentColor", "stroke-opacity": .25, "stroke-width": .7 }, g);
        }
      }
    }
  });
  // 花心
  if (center === "stamen" || center === "both") {   // 花蕊：細線加小點
    const n = 9 + Math.floor(rnd() * 5);
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2, len = 8 + rnd() * 7;
      const x = Math.cos(a) * len, y = Math.sin(a) * len;
      el("line", { x1: 0, y1: 0, x2: x, y2: y, stroke: "currentColor", "stroke-opacity": .7, "stroke-width": .7 }, g);
      el("circle", { cx: x, cy: y, r: 1.3, fill: "currentColor", "fill-opacity": .85 }, g);
    }
  }
  if (center === "dot" || center === "both") el("circle", { r: 3.5, fill: "currentColor", "fill-opacity": .8, filter: "url(#ink)" }, g);
  if (center === "dense") {   // 菊花中心：很多小點
    for (let i = 0; i < 26; i++) {
      const a = rnd() * Math.PI * 2, d = rnd() * 7;
      el("circle", { cx: Math.cos(a) * d, cy: Math.sin(a) * d, r: 1.4, fill: "currentColor", "fill-opacity": .7 }, g);
    }
  }
  if (center === "cup") {     // 水仙中心的小杯子
    el("circle", { r: 8, fill: "currentColor", "fill-opacity": .22, stroke: "currentColor", "stroke-opacity": .7, "stroke-width": 1.2, filter: "url(#ink)" }, g);
    el("circle", { r: 2.5, fill: "currentColor", "fill-opacity": .7 }, g);
  }
  return g;
}

// 樹枝：粗細兩道墨線疊在一起，比較有毛筆感
function branch(svg, d, width = 6) {
  el("path", { d, fill: "none", stroke: "currentColor", "stroke-width": width, "stroke-opacity": .82, "stroke-linecap": "round", filter: "url(#ink)" }, svg);
  el("path", { d, fill: "none", stroke: "currentColor", "stroke-width": width * 1.8, "stroke-opacity": .12, "stroke-linecap": "round", filter: "url(#wash)" }, svg);
}

// 葉子：深墨，加一條葉脈
function leaf(svg, x, y, angle, len, w, op = .6) {
  const g = el("g", { transform: `translate(${x} ${y}) rotate(${angle + jitter(6)})` }, svg);
  el("path", { d: petalPath(len, w, "pointed"), fill: "currentColor", "fill-opacity": op, filter: "url(#wash)" }, g);
  el("line", { x1: 0, y1: -2, x2: 0, y2: -len * .9, stroke: "var(--paper)", "stroke-opacity": .5, "stroke-width": .8 }, g);
}

// 淡墨背景暈染（例如荷葉）
function washBlob(svg, cx, cy, rx, ry, op) {
  el("ellipse", { cx, cy, rx, ry, fill: "currentColor", "fill-opacity": op, filter: "url(#wash)" }, svg);
}

/* =========================================================
   四、十二個月，每個月一個構圖
   ========================================================= */
const MONTHS = [
  { m: "一月", name: "梅花", note: "五瓣圓瓣", draw: s => {
      branch(s, "M8 192 C45 160 60 128 104 108 S160 70 192 28", 7);
      branch(s, "M104 108 C122 124 142 128 166 134", 3.5);
      const R = [{ n: 5, L: 22, W: 15, tip: "round", op: .1 }];
      flower(s, 104, 100, 1, R, "stamen"); flower(s, 164, 130, .75, R, "stamen");
      flower(s, 58, 140, .7, R, "stamen");
      el("circle", { cx: 178, cy: 48, r: 5, fill: "currentColor", "fill-opacity": .55, filter: "url(#ink)" }, s);
  }},
  { m: "二月", name: "杏花", note: "淡墨圓瓣", draw: s => {
      branch(s, "M192 186 C150 158 130 120 92 100 S40 60 14 30", 6);
      const R = [{ n: 5, L: 26, W: 17, tip: "round", op: .07 }];
      flower(s, 94, 92, 1, R, "both"); flower(s, 40, 58, .8, R, "both"); flower(s, 150, 150, .7, R, "both");
  }},
  { m: "三月", name: "桃花", note: "尖瓣帶嫩葉", draw: s => {
      branch(s, "M10 180 C60 150 90 140 130 112 S180 70 194 60", 6);
      const R = [{ n: 5, L: 26, W: 14, tip: "pointed", op: .16 }];
      flower(s, 120, 104, 1, R, "stamen"); flower(s, 62, 140, .8, R, "stamen");
      leaf(s, 160, 88, 30, 26, 8, .55); leaf(s, 160, 88, 80, 22, 7, .45); leaf(s, 90, 130, -30, 20, 6, .5);
  }},
  { m: "四月", name: "牡丹", note: "三層波浪瓣", draw: s => {
      leaf(s, 70, 160, -60, 50, 16, .5); leaf(s, 130, 162, 55, 46, 15, .5); leaf(s, 100, 168, 5, 40, 13, .6);
      flower(s, 100, 94, 1, [
        { n: 9, L: 58, W: 30, tip: "ruffle", op: .08 },
        { n: 8, L: 44, W: 24, tip: "ruffle", op: .1, offset: 20 },
        { n: 6, L: 28, W: 16, tip: "ruffle", op: .14, offset: 10 }
      ], "dot");
  }},
  { m: "五月", name: "石榴花", note: "皺瓣與花萼", draw: s => {
      branch(s, "M100 196 C98 170 102 150 100 128", 4);
      leaf(s, 100, 160, -55, 34, 7, .55); leaf(s, 100, 150, 60, 30, 6, .55);
      el("path", { d: "M88 96 L92 130 L108 130 L112 96 L118 86 L106 94 L100 84 L94 94 L82 86Z",
        fill: "currentColor", "fill-opacity": .7, filter: "url(#ink)" }, s);
      flower(s, 100, 92, 1, [{ n: 6, L: 40, W: 22, tip: "ruffle", op: .16, arc: 75 }], null);
  }},
  { m: "六月", name: "荷花", note: "側面杯狀", draw: s => {
      washBlob(s, 64, 160, 64, 24, .18); washBlob(s, 150, 176, 46, 14, .12);
      branch(s, "M112 196 C110 170 114 150 110 120", 3);
      flower(s, 110, 120, 1, [
        { n: 7, L: 62, W: 20, tip: "pointed", op: .08, arc: 72 },
        { n: 5, L: 50, W: 18, tip: "pointed", op: .11, arc: 45 }
      ], null);
  }},
  { m: "七月", name: "鳳仙花", note: "小花沿莖而生", draw: s => {
      branch(s, "M60 196 C80 150 110 110 150 30", 3);
      [[78, 150], [100, 112], [126, 74]].forEach(([x, y], i) => {
        leaf(s, x + 6, y + 6, 70 + jitter(15), 32, 8, .5);
        leaf(s, x - 4, y + 4, -60 + jitter(15), 28, 7, .5);
        flower(s, x - 16, y - 2, .9 - i * .1, [{ n: 5, L: 16, W: 12, tip: "round", op: .18 }], "dot");
      });
  }},
  { m: "八月", name: "桂花", note: "細碎小花成簇", draw: s => {
      branch(s, "M6 120 C60 112 110 100 194 70", 5);
      [[40, 114, -40], [80, 106, 40], [120, 96, -35], [160, 82, 45], [180, 76, -30]].forEach(([x, y, a]) => leaf(s, x, y, a, 34, 9, .65));
      for (let i = 0; i < 22; i++) {   // 一簇一簇的小花
        const t = rnd();
        const x = 20 + t * 160, y = 118 - t * 44 + 8 + rnd() * 18;
        flower(s, x, y, 1, [{ n: 4, L: 6, W: 5, tip: "round", op: .35 }], null);
      }
  }},
  { m: "九月", name: "菊花", note: "多層細長瓣", draw: s => {
      branch(s, "M100 196 C104 170 96 150 100 132", 3);
      leaf(s, 100, 172, -55, 30, 12, .55); leaf(s, 100, 160, 55, 26, 11, .55);
      flower(s, 100, 92, 1, [
        { n: 22, L: 58, W: 5, tip: "thin", op: .1 },
        { n: 18, L: 44, W: 5, tip: "thin", op: .13, offset: 8 },
        { n: 14, L: 28, W: 4, tip: "thin", op: .18, offset: 4 }
      ], "dense");
  }},
  { m: "十月", name: "芙蓉", note: "大瓣與花紋", draw: s => {
      leaf(s, 52, 170, -40, 42, 20, .45); leaf(s, 156, 168, 45, 40, 19, .45);
      flower(s, 100, 98, 1, [{ n: 5, L: 52, W: 34, tip: "round", op: .07, veins: true }], "both");
  }},
  { m: "十一月", name: "山茶", note: "層疊圓瓣與厚葉", draw: s => {
      leaf(s, 64, 150, -70, 44, 17, .78); leaf(s, 140, 150, 70, 44, 17, .78); leaf(s, 100, 160, 180, 40, 16, .7);
      flower(s, 100, 98, 1, [
        { n: 7, L: 40, W: 25, tip: "round", op: .1 },
        { n: 6, L: 29, W: 19, tip: "round", op: .13, offset: 25 },
        { n: 5, L: 17, W: 12, tip: "round", op: .16 }
      ], "stamen");
  }},
  { m: "十二月", name: "水仙", note: "六瓣與副冠", draw: s => {
      ["M80 198 C78 150 70 110 54 70", "M92 198 C94 150 100 120 96 96", "M104 198 C112 160 130 130 156 116", "M70 198 C60 170 40 150 24 140"]
        .forEach(d => el("path", { d, fill: "none", stroke: "currentColor", "stroke-width": 6, "stroke-opacity": .38, "stroke-linecap": "round", filter: "url(#wash)" }, s));
      const R = [{ n: 6, L: 30, W: 11, tip: "pointed", op: .07 }];
      flower(s, 96, 78, 1, R, "cup"); flower(s, 148, 104, .72, R, "cup");
  }}
];


/* =========================================================
   一之二、花邊：把花沿著一條「水平」的枝條排列，當作表格的上下框線
   ========================================================= */

// 每個月的花邊設定
// spine：枝條種類（branch 木枝、stem 細莖、water 水面、none 無）
// rings / center：花的樣子（和上面「十二月花」相同的寫法）
// count：花的數量，size：花的大小範圍，leaves：葉子數量與大小
const GARLAND = [
  { spine: "branch", rings: [{ n: 5, L: 22, W: 15, tip: "round", op: .1 }], center: "stamen", count: [6, 8], size: [.7, 1.05], buds: 5 },
  { spine: "branch", rings: [{ n: 5, L: 26, W: 17, tip: "round", op: .07 }], center: "both", count: [5, 7], size: [.65, 1], buds: 4 },
  { spine: "branch", rings: [{ n: 5, L: 26, W: 14, tip: "pointed", op: .16 }], center: "stamen", count: [5, 7], size: [.65, .95], leaves: [6, 22, 7, .5] },
  { spine: "stem", rings: [
      { n: 9, L: 58, W: 30, tip: "ruffle", op: .08 },
      { n: 8, L: 44, W: 24, tip: "ruffle", op: .1, offset: 20 },
      { n: 6, L: 28, W: 16, tip: "ruffle", op: .14, offset: 10 }], center: "dot", count: [2, 3], size: [.55, .7], leaves: [6, 40, 14, .5] },
  { spine: "branch", rings: [{ n: 6, L: 30, W: 18, tip: "ruffle", op: .16 }], center: "dot", count: [4, 6], size: [.7, 1], leaves: [8, 28, 6, .55] },
  { spine: "water", lotus: true, count: [2, 3], size: [.55, .7] },
  { spine: "stem", rings: [{ n: 5, L: 16, W: 12, tip: "round", op: .18 }], center: "dot", count: [7, 10], size: [.8, 1.1], leaves: [9, 28, 7, .5] },
  { spine: "branch", osmanthus: true, leaves: [9, 32, 9, .65] },
  { spine: "stem", rings: [
      { n: 22, L: 58, W: 5, tip: "thin", op: .1 },
      { n: 18, L: 44, W: 5, tip: "thin", op: .13, offset: 8 },
      { n: 14, L: 28, W: 4, tip: "thin", op: .18, offset: 4 }], center: "dense", count: [3, 4], size: [.5, .7], leaves: [6, 26, 11, .55] },
  { spine: "branch", rings: [{ n: 5, L: 52, W: 34, tip: "round", op: .07, veins: true }], center: "both", count: [3, 4], size: [.5, .65], leaves: [5, 38, 18, .45] },
  { spine: "branch", rings: [
      { n: 7, L: 40, W: 25, tip: "round", op: .1 },
      { n: 6, L: 29, W: 19, tip: "round", op: .13, offset: 25 },
      { n: 5, L: 17, W: 12, tip: "round", op: .16 }], center: "stamen", count: [3, 5], size: [.55, .75], leaves: [7, 34, 13, .78] },
  { spine: "none", narcissus: true, rings: [{ n: 6, L: 30, W: 11, tip: "pointed", op: .07 }], center: "cup", count: [4, 5], size: [.7, .9] }
];

// 在 a～b 之間取隨機數
const between = (a, b) => a + rnd() * (b - a);

// 產生一條水平、微微起伏的枝條；回傳 SVG 路徑與「在 x 位置的高度」函式
function makeSpine(width, midY) {
  const pts = [];
  for (let x = -20; x <= width + 20; x += 90 + rnd() * 40) pts.push([x, midY + jitter(7)]);
  pts.push([width + 20, midY + jitter(7)]);
  // 把點串成平滑曲線（Catmull-Rom 轉成貝茲曲線）
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  const yAt = x => {               // 用直線近似求出某個 x 的枝條高度
    for (let i = 0; i < pts.length - 1; i++) {
      if (x >= pts[i][0] && x <= pts[i + 1][0]) {
        const t = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
        return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t;
      }
    }
    return midY;
  };
  return { d, yAt };
}

// 在 0～width 之間挑 n 個彼此不要太近的位置
function spreadX(n, width) {
  const gap = width / n;
  return Array.from({ length: n }, (_, i) => gap * (i + .5) + jitter(gap * .3));
}

// 畫一整條花邊
function drawGarland(svg, month, width, height, k) {
  const g = GARLAND[month];
  const midY = height / 2;
  const { d, yAt } = makeSpine(width, midY);
  const root = el("g", {}, svg);

  // 1. 枝條／莖／水面
  if (g.spine === "branch") {
    branch(root, d, 5 * k);
    // 幾根小分枝，方向保持接近水平
    for (let i = 0; i < Math.round(width / 160); i++) {
      const x = between(30, width - 30), y = yAt(x);
      const dir = rnd() < .5 ? -1 : 1, len = between(35, 60) * k;
      branch(root, `M${x} ${y} Q${x + dir * len * .5} ${y + jitter(10)} ${x + dir * len} ${y + jitter(14)}`, 2.4 * k);
    }
  } else if (g.spine === "stem") {
    el("path", { d, fill: "none", stroke: "currentColor", "stroke-width": 2.2 * k, "stroke-opacity": .7, filter: "url(#ink)" }, root);
  } else if (g.spine === "water") {
    el("path", { d, fill: "none", stroke: "currentColor", "stroke-width": 8 * k, "stroke-opacity": .12, filter: "url(#wash)" }, root);
    el("path", { d, fill: "none", stroke: "currentColor", "stroke-width": 1, "stroke-opacity": .35, filter: "url(#ink)" }, root);
  }

  // 2. 葉子：沿著枝條，尖端朝左或朝右（接近水平）
  if (g.leaves) {
    const [n, len, w, op] = g.leaves;
    const count = Math.round(n * width / 700);
    spreadX(count, width).forEach(x => {
      const dir = rnd() < .5 ? -1 : 1;
      leaf(root, x, yAt(x), dir * between(62, 112), len * k, w * k, op);
    });
  }

  // 3. 特殊月份
  if (g.lotus) {      // 荷：荷葉浮在水面，荷花立在上面
    spreadX(Math.round(5 * width / 700), width).forEach(x =>
      washBlob(root, x, yAt(x) + 4, between(38, 56) * k, between(9, 13) * k, .22));
    spreadX(Math.round(between(...g.count) * width / 700), width).forEach(x => {
      const s = between(...g.size) * k;
      el("line", { x1: x, y1: yAt(x), x2: x, y2: yAt(x) - 8 * k, stroke: "currentColor", "stroke-width": 1.5, "stroke-opacity": .6 }, root);
      flower(root, x, yAt(x) - 6 * k, s, [
        { n: 7, L: 62, W: 20, tip: "pointed", op: .08, arc: 72 },
        { n: 5, L: 50, W: 18, tip: "pointed", op: .11, arc: 45 }], null);
    });
  }
  if (g.narcissus) {  // 水仙：細長的葉子沿著框線水平延伸
    for (let i = 0; i < Math.round(9 * width / 700); i++) {
      const x = between(0, width), y = yAt(x) + jitter(6), dir = rnd() < .5 ? -1 : 1, len = between(90, 160) * k;
      el("path", { d: `M${x} ${y} Q${x + dir * len * .5} ${y - between(4, 14)} ${x + dir * len} ${y + jitter(10)}`,
        fill: "none", stroke: "currentColor", "stroke-width": between(3, 5.5) * k, "stroke-opacity": .38, "stroke-linecap": "round", filter: "url(#wash)" }, root);
    }
  }
  if (g.osmanthus) {  // 桂：沿著枝條一簇一簇的小花
    for (let i = 0; i < Math.round(40 * width / 700); i++) {
      const x = between(10, width - 10);
      flower(root, x, yAt(x) + jitter(14 * k), k, [{ n: 4, L: 6, W: 5, tip: "round", op: .35 }], null);
    }
  }

  // 4. 花朵：沿著枝條排列，大小不一
  if (g.rings && g.count) {
    spreadX(Math.round(between(...g.count) * width / 700), width).forEach(x => {
      flower(root, x, yAt(x) + jitter(6 * k), between(...g.size) * k, g.rings, g.center);
    });
  }
  // 5. 花苞
  if (g.buds) {
    for (let i = 0; i < Math.round(g.buds * width / 700); i++) {
      const x = between(10, width - 10);
      el("circle", { cx: x, cy: yAt(x) + jitter(8), r: between(3, 5) * k, fill: "currentColor", "fill-opacity": .55, filter: "url(#ink)" }, root);
    }
  }
}
