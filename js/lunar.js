/* =========================================================
   水墨萬年曆 v14（GitHub 完整版）｜農曆換算
   國曆轉農曆、24 節氣、干支與生肖（1900～2100 年）
   ========================================================= */

/* ---------- 農曆換算（1900～2100） ----------
   LUNAR_INFO 每一年用一個數字記錄：
   - 最後 4 位元：閏哪個月（0 代表沒有閏月）
   - 中間 12 位元：每個月是大月（30 天）還是小月（29 天）
   - 第 17 位元：閏月是大月還是小月 */
const LUNAR_INFO = [0x4bd8, 0x4ae0, 0xa570, 0x54d5, 0xd260, 0xd950, 0x16554, 0x56a0, 0x9ad0, 0x55d2, 0x4ae0, 0xa5b6, 0xa4d0, 0xd250, 0x1d255, 0xb540, 0xd6a0, 0xada2, 0x95b0, 0x14977, 0x4970, 0xa4b0, 0xb4b5, 0x6a50, 0x6d40, 0x1ab54, 0x2b60, 0x9570, 0x52f2, 0x4970, 0x6566, 0xd4a0, 0xea50, 0x6e95, 0x5ad0, 0x2b60, 0x186e3, 0x92e0, 0x1c8d7, 0xc950, 0xd4a0, 0x1d8a6, 0xb550, 0x56a0, 0x1a5b4, 0x25d0, 0x92d0, 0xd2b2, 0xa950, 0xb557, 0x6ca0, 0xb550, 0x15355, 0x4da0, 0xa5b0, 0x14573, 0x52b0, 0xa9a8, 0xe950, 0x6aa0, 0xaea6, 0xab50, 0x4b60, 0xaae4, 0xa570, 0x5260, 0xf263, 0xd950, 0x5b57, 0x56a0, 0x96d0, 0x4dd5, 0x4ad0, 0xa4d0, 0xd4d4, 0xd250, 0xd558, 0xb540, 0xb6a0, 0x195a6, 0x95b0, 0x49b0, 0xa974, 0xa4b0, 0xb27a, 0x6a50, 0x6d40, 0xaf46, 0xab60, 0x9570, 0x4af5, 0x4970, 0x64b0, 0x74a3, 0xea50, 0x6b58, 0x5ac0, 0xab60, 0x96d5, 0x92e0, 0xc960, 0xd954, 0xd4a0, 0xda50, 0x7552, 0x56a0, 0xabb7, 0x25d0, 0x92d0, 0xcab5, 0xa950, 0xb4a0, 0xbaa4, 0xad50, 0x55d9, 0x4ba0, 0xa5b0, 0x15176, 0x52b0, 0xa930, 0x7954, 0x6aa0, 0xad50, 0x5b52, 0x4b60, 0xa6e6, 0xa4e0, 0xd260, 0xea65, 0xd530, 0x5aa0, 0x76a3, 0x96d0, 0x4afb, 0x4ad0, 0xa4d0, 0x1d0b6, 0xd250, 0xd520, 0xdd45, 0xb5a0, 0x56d0, 0x55b2, 0x49b0, 0xa577, 0xa4b0, 0xaa50, 0x1b255, 0x6d20, 0xada0, 0x14b63, 0x9370, 0x49f8, 0x4970, 0x64b0, 0x168a6, 0xea50, 0x6b20, 0x1a6c4, 0xaae0, 0x92e0, 0xd2e3, 0xc960, 0xd557, 0xd4a0, 0xda50, 0x5d55, 0x56a0, 0xa6d0, 0x55d4, 0x52d0, 0xa9b8, 0xa950, 0xb4a0, 0xb6a6, 0xad50, 0x55a0, 0xaba4, 0xa5b0, 0x52b0, 0xb273, 0x6930, 0x7337, 0x6aa0, 0xad50, 0x14b55, 0x4b60, 0xa570, 0x54e4, 0xd160, 0xe968, 0xd520, 0xdaa0, 0x16aa6, 0x56d0, 0x4ae0, 0xa9d4, 0xa4d0, 0xd150, 0xf252, 0xd520];
// 24 節氣日期表：每年 24 個字元，每個字元是日期（36 進位）
const TERM_DAYS = "6k4j6l5k6l6m7n8n8n9o8n7m6l4j6l5l6m6m8n8o8o9o8n8m6l5j6l6l6m7m8o8o8o9o8n8n6l5k7m6l7m7m8o9o9o9o8n8n7l5k6l5k6l6m7n8n8n9o8n7m6l4j6l5l6m6m8n8o8o9o8n8m6l5j6l6l6m6m8o8o8o9o8n8n6l5k7m6l7m7m8o9o9o9o8n8n7l5k6l5k6l6m7n8n8n9o8n7m6l4j6l5l6m6m8n8o8o9o8n8m6l5j6l6l6m6m8o8o8o9o8n8n6l5k7m6l7m7m8o9o9o9o8n8n7l5k6l5k6l6m7n8n8n9o8m7m6k4j6l5l6m6m8n8o8n9o8n8m6l4j6l5l6m6m8o8o8o9o8n8n6l5k6m6l6m7m8o8o9o9o8n8n6l5k6l5k6l6m7n8n8n8o8m7m6k4j6l5l6l6m8n8o8n9o8n8m6l4j6l5l6m6m8o8o8o9o8n8m6l5k6m6l6m7m8o8o9o9o8n8n6l5k6l5k6l6m7n8n8n8o8m7m6k4j6l5k6l6m8n8o8n9o8n7m6l4j6l5l6m6m8o8o8o9o8n8m6l5j6l6l6m7m8o8o9o9o8n8n6l5k6l5k6l6m7n8n8n8o8m7m6k4j6l5k6l6m8n8o8n9o8n7m6l4j6l5l6m6m8n8o8o9o8n8m6l5j6l6l6m7m8o8o9o9o8n8n6l5k6l5k6l6m7n8n8n8n7m7m6k4j6l5k6l6m7n8n8n9o8n7m6l4j6l5l6m6m8n8o8o9o8n8m6l5j6l6l6m7m8o8o8o9o8n8n6l5k6l5k6l6l7n8n8n8n7m7m6k4j6l5k6l6m7n8n8n9o8n7m6l4j6l5l6m6m8n8o8o9o8n8m6l5j6l6l6m6m8o8o8o9o8n8n6l5k6l5k6l6l7n8n8n8n7m7m6k4j6l5k6l6m7n8n8n9o8n7m6l4j6l5l6m6m8n8o8o9o8n8m6l5j6l6l6m6m8o8o8o9o8n8n6l5k6l5k6l6l7n8n8n8n7m7m6k4j6l5k6l6m7n8n8n9o8n7m6l4j6l5l6m6m8n8o8o9o8n8m6l5j6l6l6m6m8o8o8o9o8n8n6l5k6l5k5l6l7n8n8n8n7m7m6k4j6l5k6l6m7n8n8n8o8m7m6k4j6l5l6m6m8n8o8n9o8n8m6l4j6l5l6m6m8o8o8o9o8n8n6l5k5l5k5l6l7n7n8n8n7m7m5k4j6l5k6l6m7n8n8n8o8m7m6k4j6l5k6l6m8n8o8n9o8n8m6l4j6l5l6m6m8o8o8o9o8n8n6l5k5l5k5l6l7n7n8n8n7m7m5k4j6l5k6l6m7n8n8n8o8m7m6k4j6l5k6l6m8n8o8n9o8n7m6l4j6l5l6m6m8n8o8o9o8n8m6l5k5k5k5l6l7n7n8n8n7m7m5k4j6l5k6l6m7n8n8n8o8m7m6k4j6l5k6l6m7n8n8n9o8n7m6l4j6l5l6m6m8n8o8o9o8n8m6l5j5k5k5l6l7n7n7n8n7m7m5k4j6l5k6l6l7n8n8n8n7m7m6k4j6l5k6l6m7n8n8n9o8n7m6l4j6l5l6m6m8n8o8o9o8n8m6l5j5k5k5l6l7n7n7n8n7m7m5k4j6l5k6l6l7n8n8n8n7m7m6k4j6l5k6l6m7n8n8n9o8n7m6l4j6l5l6m6m8n8o8o9o8n8m6l5j5k5k5l5l7n7n7n8n7m7m5k4j6l5k6l6l7n8n8n8n7m7m6k4j6l5k6l6m7n8n8n9o8n7m6l4j6l5l6m6m8n8o8o9o8n8m6l5j5k5k5l5l7n7n7n8n7m7m5k4j6l5k5l6l7n8n8n8n7m7m6k4j6l5k6l6m7n8n8n9o8n7m6l4j6l5l6m6m8n8o8n9o8n8m6l5j5k4k5l5l7n7n7n8n7m7m5k4j6l5k5l6l7n7n8n8n7m7m6k4j6l5k6l6m7n8n8n8o8n7m6k4j6l5l6l6m8n8o8n9o8n8m6l5j5k4k5l5l7n7n7n8n7m7m5k4j6l5k5l6l7n7n8n8n7m7m6k4j6l5k6l6m7n8n8n8o8m7m6k4j6l5k6l6m8n8o8n9o8n8m6l4j5k4k5l5l7m7n7n8n7m7m5k4j5l5k5l6l7n7n8n8n7m7m5k4j6l5k6l6m7n8n8n8o8m7m6k4j6l5k6l6m7n8o8n9o8n7m6l4j5k4k5l5l7m7n7n8n7m7l5k4j5k5k5l6l7n7n7n8n7m7m5k4j6l5k6l6l7n8n8n8o8m7m6k4j6l5k6l6m7n8n8n9o8n7m6l4j5k4k5l5l7m7n7n8n7m7l5k4i5k5k5l6l7n7n7n8n7m7m5k4j6l5k6l6l7n8n8n8n7m7m6k4j6l5k6l6m7n8n8n9o8n7m6l4j5k4k5l5l7m7n7n8n7m7l5k4i5k5k5l5l7n7n7n8n7m7m5k4j6l5k6l6l7n8n8n8n7m7m6k4j6l5k6l6m7n8n8n9o8n7m6l4j5k4k5l5l7m7n7n8n7m7l5k4i5k5k5l5l7n7n7n8n7m7m5k4j6l5k6l6l7n8n8n8n7m7m6k4j6l5k6l6m7n8n8n9o8n7m6l4j5k4k5l5l7m7n7n8n7m7l5k4i5k5k5l5l7n7n7n8n7m7m5k4j6l5k5l6l7n7n8n8n7m7m6k4j6l5k6l6m7n8n8n9o8n7m6l4j5k4k5l5l7m7n7m8n7m7l5k4i5k4k5l5l7n7n7n8n7m7m5k4j6l5k5l6l7n7n8n8n7m7m6k4j6l5k6l6m7n8n8n8o8n7m6l4j5k4k5k5l7m7n7m8n7m7l5k4i5k4k5l5l7m7n7n8n7m7m5k4j6l5k5l6l7n7n8n8n7m7m6k4j6l5k6l6m7n8n8n8o8m7m6k4j5k4j5k5l7m7n7m8n7m7l5k3i5k4k5l5l7m7n7n8n7m7m5k4j5l5k5l6l7n7n8n8n7m7m5k4j6l5k6l6l7n8n8n8o8m7m6k4j5k4j5k5l6m7m7m8n7m7l5k3i5k4k5l5l7m7n7n8n7m7l5k4j5k5k5l6l7n7n7n8n7m7m5k4j6l5k6l6l7n8n8n8o8m7m6k4j5k4j5k5l6m7m7m8n7m6l5k3i5k4k5l5l7m7n7n8n7m7l5k4i5k5k5l5l7n7n7n8n7m7m5k4j6l5k6l6l7n8n8n8n7m7m6k4j5k4j5k5l6m7m7m8n7m6l5k3i5k4k5l5l7m7n7n8n7m7l5k4i5k5k5l5l7n7n7n8n7m7m5k4j6l5k6l6l7n8n8n8n7m7m6k4j5k4j5k5l6m7m7m8n7m6l5k3i5k4k5l5l7m7n7n8n7m7l5k4i5k5k5l5l7n7n7n8n7m7m5k4j6l5k5l6l7n7n8n8n7m7m6k4j5k4j5k5l6m7m7m8n7m6l5k3i5k4k5l5l7m7n7n8n7m7l5k4i5k5k5l5l7n7n7n8n7m7m5k4j6l5k5l6l7n7n8n8n7m7m6k4j5k4j5k5l6m7m7m8n7m6l5k3i5k4k5k5l7m7n7m8n7m7l5k4i5k4k5l5l7n7n7n8n7m7m5k4j6l5k5l6l7n7n8n8n7m7m6k4j5k4j5k5l6m7m7m7n7m6l5k3i5k4j5k5l7m7n7m8n7m7l5k4i5k4k5l5l7m7n7n8n7m7m5k4j6l5k5l6l7n7n8n8n7m7m6k4j5k4j5k5k6m7m7m7n7l6l5j3i5k4j5k5l6m7m7m8n7m7l5k3i5k4k5l5l7m7n7n8n7m7m5k4j5k5k5l6l7n7n7n8n7m7m5k4j5k4j5k5k6m7m7m7n7l6l5j3i5k4j5k5l6m7m7m8n7m7l5k3i5k4k5l5l7m7n7n8n7m7m5k4j5k5k5l5l7n7n7n8n7m7m5k4j5k4j5k5k6m7m7m7n7l6l5j3i5k4j5k5l6m7m7m8n7m6l5k3i5k4k5l5l7m7n7n8n7m7l5k4j5k5k5l5l7n7n7n8n7m7m5k4j5k4j5k5k6m7m7m7m6l6l5j3i5k4j5k5l6m7m7m8n7m6l5k3i5k4k5l5l7m7n7n8n7m7l5k4i5k5k5l5l7n7n7n8n7m7m5k4j5k4j5k5k6m7m7m7m6l6l5j3i5k4j5k5l6m7m7m8n7m6l5k3i5k4k5l5l7m7n7n8n7m7l5k4i5k5k5l5l7n7n7n8n7m7m5k4j5k4j4k5k6m6m7m7m6l6l5j3i5k4j5k5l6m7m7m8n7m6l5k3i5k4k5k5l7m7n7m8n7m7l5k4i5k5k5l5l7n7n7n8n7m7m5k4j5k4j4k5k6m6m7m7m6l6l5j3i5k4j5k5l6m7m7m7n7m6l5k3i5k4k5k5l7m7n7m8n7m7l5k4i5k4k5l5l7m7n7n8n7m7m5k4j5k4j4k5k6m6m7m7m6l6l5j3i5k4j5k5l6m7m7m7n7m6l5k3i5k4j5k5l6m7n7m8n7m7l5k4i5k4k5l5l7m7n7n8n7m7m5k4j5k4j4k5k6m6m7m7m6l6l5j3i5k4j5k5k6m7m7m7n7l6l5k3i5k4j5k5l6m7m7m8n7m7l5k3i5k4k5l5l7m7n7n8n7m7m5k4j4j4j4k5k6m6m6m7m6l6l4j3i5k4j5k5k6m7m7m7n7l6l5j3i5k4j5k5l6m7m7m8n7m7l5k3i5k4k5l5l7m7n7n8n7m7m5k4j4j4j4k4k6m6m6m7m6l6l4j3i5k4j5k5k6m7m7m7n7l6l5j3i5k4j5k5l6m7m7m8n7m6l5k3i5k4k5l5l7m7n7n8n7m7l5k4j4j4j4k4k6m6m6m7m6l6l4j3i5k4j5k5k6m7m7m7m6l6l5j3i5k4j5k5l6m7m7m8n7m6l5k3i5k4k5l5l7m7n7n8n7m7l5k4i4j4j4k4k6m6m6m7m6l6l4j3i5k4j5k5k6m6m7m7m6l6l5j3i5k4j5k5l6m7m7m8n7m6l5k3i5k4k5l5l7m7n7n8n7m7l5k4i5k5k5l5l7n7n7n8n7m7m";
const TERM_NAMES = ["小寒","大寒","立春","雨水","驚蟄","春分","清明","穀雨","立夏","小滿","芒種","夏至",
                    "小暑","大暑","立秋","處暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"];
const GAN = "甲乙丙丁戊己庚辛壬癸";
const ZHI = "子丑寅卯辰巳午未申酉戌亥";
const ZODIAC = "鼠牛虎兔龍蛇馬羊猴雞狗豬";
const LUNAR_MONTH = ["正","二","三","四","五","六","七","八","九","十","冬","臘"];
const LUNAR_DAY = ["初一","初二","初三","初四","初五","初六","初七","初八","初九","初十",
                   "十一","十二","十三","十四","十五","十六","十七","十八","十九","二十",
                   "廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"];

function leapMonth(y) { return LUNAR_INFO[y - 1900] & 0xf; }
function leapDays(y) { return leapMonth(y) ? ((LUNAR_INFO[y - 1900] & 0x10000) ? 30 : 29) : 0; }
function monthDays(y, m) { return (LUNAR_INFO[y - 1900] & (0x10000 >> m)) ? 30 : 29; }
function yearDays(y) {
  let sum = 348;                                   // 12 個月 × 29 天
  for (let bit = 0x8000; bit > 0x8; bit >>= 1) if (LUNAR_INFO[y - 1900] & bit) sum++;
  return sum + leapDays(y);
}

// 國曆 → 農曆，回傳 { year, month, day, leap }
function toLunar(date) {
  const base = Date.UTC(1900, 0, 31);              // 1900/1/31 是農曆 1900 年正月初一
  let offset = Math.round((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - base) / 86400000);
  let y = 1900;
  while (y < 2101 && offset >= yearDays(y)) { offset -= yearDays(y); y++; }
  const leap = leapMonth(y);
  let m = 1, isLeap = false;
  while (true) {
    const days = isLeap ? leapDays(y) : monthDays(y, m);
    if (offset < days) break;
    offset -= days;
    if (leap === m && !isLeap) isLeap = true;      // 下一個是閏月
    else { isLeap = false; m++; }
  }
  return { year: y, month: m, day: offset + 1, leap: isLeap };
}

// 某一年第 i 個節氣（0 = 小寒）是幾號
function termDay(y, i) { return parseInt(TERM_DAYS[(y - 1900) * 24 + i], 36); }
// 某一天是不是節氣，是的話回傳名稱
function solarTerm(date) {
  const y = date.getFullYear(), m = date.getMonth();
  if (y < 1900 || y > 2100) return "";
  for (const i of [m * 2, m * 2 + 1]) if (termDay(y, i) === date.getDate()) return TERM_NAMES[i];
  return "";
}
// 干支年、生肖（以農曆年計算）
function ganzhiYear(ly) { return GAN[(ly - 4) % 10] + ZHI[(ly - 4) % 12]; }
function zodiac(ly) { return ZODIAC[(ly - 4) % 12]; }
// 農曆文字：例如「丙午年（馬）九月廿二」
function lunarText(l) {
  return `${ganzhiYear(l.year)}年（${zodiac(l.year)}）${l.leap ? "閏" : ""}${LUNAR_MONTH[l.month - 1]}月${LUNAR_DAY[l.day - 1]}`;
}
