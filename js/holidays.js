/* =========================================================
   水墨萬年曆 v15（GitHub 完整版）｜國定假日與節日
   官方辦公日曆表、補假規則、連假、農曆與世界節日
   ========================================================= */

// 日期轉成 "2026-02-16" 這種格式（存檔、比對都用它）
const keyOf = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const isWeekend = d => d.getDay() === 0 || d.getDay() === 6;

// 國定假日的全名與月曆上顯示的短名
const HOLIDAY_NAMES = {
  "開國紀念日": "元旦", "除夕前一日": "小年夜", "除夕": "除夕", "春節": "春節",
  "和平紀念日": "和平紀念日", "兒童節": "兒童節", "清明節": "清明節", "勞動節": "勞動節",
  "端午節": "端午節", "中秋節": "中秋節", "孔子誕辰紀念日／教師節": "教師節", "國慶日": "國慶日",
  "臺灣光復暨金門古寧頭大捷紀念日": "光復節", "行憲紀念日": "行憲紀念日", "補假": "補假"
};

// 官方公告：行政院人事行政總處「政府行政機關辦公日曆表」
// off：放假日，work：補班日（115、116 年都沒有補班）
// 之後每年公告新的日曆表，照這個格式加一年就好
const OFFICIAL = {
  2026: {
    off: {
      "2026-01-01": "開國紀念日",
      "2026-02-15": "除夕前一日", "2026-02-16": "除夕", "2026-02-17": "春節", "2026-02-18": "春節", "2026-02-19": "春節", "2026-02-20": "補假",
      "2026-02-27": "補假", "2026-02-28": "和平紀念日",
      "2026-04-03": "補假", "2026-04-04": "兒童節", "2026-04-05": "清明節", "2026-04-06": "補假",
      "2026-05-01": "勞動節", "2026-06-19": "端午節",
      "2026-09-25": "中秋節", "2026-09-28": "孔子誕辰紀念日／教師節",
      "2026-10-09": "補假", "2026-10-10": "國慶日",
      "2026-10-25": "臺灣光復暨金門古寧頭大捷紀念日", "2026-10-26": "補假",
      "2026-12-25": "行憲紀念日"
    },
    work: {}
  },
  2027: {
    off: {
      "2027-01-01": "開國紀念日",
      "2027-02-04": "除夕前一日", "2027-02-05": "除夕", "2027-02-06": "春節", "2027-02-07": "春節", "2027-02-08": "春節", "2027-02-09": "補假", "2027-02-10": "補假",
      "2027-02-28": "和平紀念日", "2027-03-01": "補假",
      "2027-04-04": "兒童節", "2027-04-05": "清明節", "2027-04-06": "補假",
      "2027-04-30": "補假", "2027-05-01": "勞動節", "2027-06-09": "端午節",
      "2027-09-15": "中秋節", "2027-09-28": "孔子誕辰紀念日／教師節",
      "2027-10-10": "國慶日", "2027-10-11": "補假",
      "2027-10-25": "臺灣光復暨金門古寧頭大捷紀念日",
      "2027-12-24": "補假", "2027-12-25": "行憲紀念日", "2027-12-31": "補假"
    },
    work: {}
  }
};

// 找出某一年農曆某月某日是國曆哪一天（用來算春節、端午、中秋）
function lunarToSolar(year, lm, ld) {
  // 農曆節日一定落在國曆 1 月中～隔年 2 月中之間，從 1 月 1 日往後找
  for (let d = new Date(year, 0, 1); d.getFullYear() === year; d = addDays(d, 1)) {
    const l = toLunar(d);
    if (l.month === lm && l.day === ld && !l.leap) return d;
  }
  return null;
}
// 除夕：農曆新年（正月初一）的前一天
function newYearsEve(year) { const ny = lunarToSolar(year, 1, 1); return ny ? addDays(ny, -1) : null; }

// 沒有官方資料的年份：依照現行規則推算
// 放假日逢星期六 → 前一個上班日補假；逢星期日 → 下一個上班日補假
// 除夕、春節逢例假日 → 連假之後的上班日補假
const ruleCache = {};
function ruleHolidays(year) {
  if (ruleCache[year]) return ruleCache[year];
  const off = {};
  const put = (d, name) => { if (d && d.getFullYear() === year) off[keyOf(d)] = name; };

  // 1. 固定日期的國定假日
  [[1, 1, "開國紀念日"], [2, 28, "和平紀念日"], [5, 1, "勞動節"], [9, 28, "孔子誕辰紀念日／教師節"],
   [10, 10, "國慶日"], [10, 25, "臺灣光復暨金門古寧頭大捷紀念日"], [12, 25, "行憲紀念日"]]
    .forEach(([m, d, n]) => put(new Date(year, m - 1, d), n));
  // 清明節（節氣）、兒童節（同一天時，兒童節提前一天）
  const qingming = new Date(year, 3, termDay(year, 6));
  put(qingming, "清明節");
  const children = new Date(year, 3, 4);
  put(keyOf(children) === keyOf(qingming) ? addDays(children, -1) : children, "兒童節");
  // 農曆節日
  put(lunarToSolar(year, 5, 5), "端午節");
  put(lunarToSolar(year, 8, 15), "中秋節");

  // 2. 一般國定假日的補假
  Object.keys(off).forEach(k => {
    const [y, m, d] = k.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    if (!isWeekend(date)) return;
    const step = date.getDay() === 6 ? -1 : 1;
    let c = addDays(date, step);
    while (isWeekend(c) || off[keyOf(c)]) c = addDays(c, step);
    put(c, "補假");
  });

  // 隔年元旦逢星期六 → 今年 12 月 31 日補假
  if (new Date(year + 1, 0, 1).getDay() === 6) put(new Date(year, 11, 31), "補假");

  // 3. 春節：除夕前一日、除夕、初一～初三；逢例假日就在連假之後補假
  const eve = newYearsEve(year);
  if (eve) {
    const block = [[-1, "除夕前一日"], [0, "除夕"], [1, "春節"], [2, "春節"], [3, "春節"]].map(([n, name]) => [addDays(eve, n), name]);
    block.forEach(([d, name]) => put(d, name));
    let owed = block.filter(([d]) => isWeekend(d)).length;
    let c = addDays(eve, 4);
    while (owed > 0) {
      if (!isWeekend(c) && !off[keyOf(c)]) { put(c, "補假"); owed--; }
      c = addDays(c, 1);
    }
  }
  return (ruleCache[year] = { off, work: {} });
}

// 取得某一年的假日資料，並標記是不是官方公告
function yearHolidays(year) {
  return OFFICIAL[year] ? { ...OFFICIAL[year], official: true } : { ...ruleHolidays(year), official: false };
}

// 是否放假（國定假日或週末，但補班日要上班）
function isOffDay(d) {
  const h = yearHolidays(d.getFullYear());
  const k = keyOf(d);
  if (h.work[k]) return false;
  return !!h.off[k] || isWeekend(d);
}

// 連假：連續 3 天以上的放假日，而且其中至少有一天是國定假日
function longBreakKeys(year, month) {
  const set = new Set();
  const start = addDays(new Date(year, month, 1), -10);
  const end = addDays(new Date(year, month + 1, 0), 10);
  let run = [];
  const flush = () => {
    if (run.length >= 3 && run.some(d => yearHolidays(d.getFullYear()).off[keyOf(d)])) run.forEach(d => set.add(keyOf(d)));
    run = [];
  };
  for (let d = start; d <= end; d = addDays(d, 1)) { if (isOffDay(d)) run.push(d); else flush(); }
  flush();
  return set;
}

// ===== 不放假的節日 =====
// 農曆節日（月、日、名稱）；除夕另外計算
const LUNAR_FESTIVALS = [
  [1, 1, "春節"], [1, 9, "天公生"], [1, 15, "元宵節"], [3, 23, "媽祖誕辰"], [5, 5, "端午節"],
  [7, 7, "七夕"], [7, 15, "中元節"], [8, 15, "中秋節"], [9, 9, "重陽節"], [10, 15, "下元節"],
  [12, 8, "臘八節"], [12, 16, "尾牙"], [12, 24, "送神"]
];
// 國曆的民俗與紀念節日
const SOLAR_FESTIVALS = {
  "3-8": "婦女節", "3-12": "植樹節", "3-29": "青年節", "8-8": "父親節", "9-3": "軍人節", "11-12": "國父誕辰紀念日"
};
// 世界性節日
const WORLD_DAYS = {
  "1-1": "新年", "2-14": "情人節", "3-14": "白色情人節", "4-1": "愚人節", "4-22": "世界地球日",
  "4-23": "世界閱讀日", "6-5": "世界環境日", "10-31": "萬聖節", "12-24": "平安夜", "12-25": "聖誕節"
};
// 第幾個星期幾的節日：母親節（5 月第 2 個星期日）、感恩節（11 月第 4 個星期四）
function nthWeekday(d, month, weekday, nth) {
  if (d.getMonth() !== month || d.getDay() !== weekday) return false;
  return Math.ceil(d.getDate() / 7) === nth;
}

// 整理某一天的所有節日資訊
// 回傳 { off, work, names: [{ text, kind }], label, official }
// kind：holiday 國定假日、makeup 補假、work 補班、lunar 農曆節日、term 節氣、folk 民俗、world 世界
function dayFestivals(d) {
  const k = keyOf(d), y = d.getFullYear();
  const h = yearHolidays(y);
  const names = [];
  const off = h.off[k], work = h.work[k];
  if (off) names.push({ text: off, kind: off === "補假" ? "makeup" : "holiday" });
  if (work) names.push({ text: "補班", kind: "work" });

  if (y >= 1900 && y <= 2100) {
    const l = toLunar(d);
    LUNAR_FESTIVALS.forEach(([m, dd, n]) => { if (!l.leap && l.month === m && l.day === dd) names.push({ text: n, kind: "lunar" }); });
    // 除夕：明天是正月初一
    const t = toLunar(addDays(d, 1));
    if (t.month === 1 && t.day === 1 && !t.leap) names.push({ text: "除夕", kind: "lunar" });
    const term = solarTerm(d);
    if (term) names.push({ text: term, kind: "term" });
  }
  const md = `${d.getMonth() + 1}-${d.getDate()}`;
  if (SOLAR_FESTIVALS[md]) names.push({ text: SOLAR_FESTIVALS[md], kind: "folk" });
  if (WORLD_DAYS[md]) names.push({ text: WORLD_DAYS[md], kind: "world" });
  if (nthWeekday(d, 4, 0, 2)) names.push({ text: "母親節", kind: "world" });
  if (nthWeekday(d, 10, 4, 4)) names.push({ text: "感恩節", kind: "world" });

  // 同一個名字只留一次（例如國定假日的端午節和農曆的端午節）
  const seen = new Set();
  const unique = names.filter(n => { const s = HOLIDAY_NAMES[n.text] || n.text; if (seen.has(s)) return false; seen.add(s); return true; });

  // 月曆格子裡只放一個短名：國定假日 > 補假／補班 > 農曆節日 > 節氣 > 其他
  const order = ["holiday", "makeup", "work", "lunar", "term", "folk", "world"];
  const top = [...unique].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind))[0];
  return {
    off: !!off, work: !!work, names: unique, official: h.official,
    label: top ? (HOLIDAY_NAMES[top.text] || top.text) : ""
  };
}
