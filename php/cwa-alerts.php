<?php
/* =========================================================
   水墨萬年曆｜天氣警報中繼站
   流程：前端（weather.js）→ 這支 PHP → 中央氣象署 → 整理後回傳給前端
   好處：
   1. 授權碼藏在伺服器上，別人看不到
   2. 結果暫存 10 分鐘，不會每次都去打擾氣象署
   ========================================================= */

// 告訴瀏覽器：回傳的是 JSON，而且允許網頁讀取
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
date_default_timezone_set("Asia/Taipei");   // 時間用台灣時區

// 回傳 JSON 的小函式（JSON_UNESCAPED_UNICODE 讓中文不會變成 \u 編碼）
function reply($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// 1. 讀取設定檔
$configFile = __DIR__ . "/config.php";
if (!file_exists($configFile)) {
    reply(["ok" => false, "message" => "找不到 config.php，請先複製 config.sample.php 並填入授權碼"], 500);
}
require $configFile;

// 2. 有暫存而且還沒過期，就直接回傳暫存
$cacheFile = __DIR__ . "/cache/alerts.json";
$cacheSeconds = 600;   // 10 分鐘
if (file_exists($cacheFile) && time() - filemtime($cacheFile) < $cacheSeconds) {
    readfile($cacheFile);
    exit;
}

// 3. 向中央氣象署要「天氣特報－各別縣市地區目前之天氣警特報情形」（W-C0033-001）
$url = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/W-C0033-001"
     . "?format=JSON&Authorization=" . urlencode($CWA_API_KEY);
$context = stream_context_create(["http" => ["timeout" => 10]]);
$raw = @file_get_contents($url, false, $context);
if ($raw === false) {
    reply(["ok" => false, "message" => "無法連線到中央氣象署"], 502);
}
$data = json_decode($raw, true);
if (!is_array($data) || !isset($data["records"])) {
    reply(["ok" => false, "message" => "中央氣象署回傳的資料格式不符，請確認授權碼是否正確"], 502);
}

// 4. 整理成前端好用的格式：{ "臺北市": [{ phenomena: "大雨", significance: "特報" }] }
$alerts = [];
foreach ($data["records"]["location"] ?? [] as $loc) {
    $list = [];
    foreach ($loc["hazardConditions"]["hazards"] ?? [] as $h) {
        $list[] = [
            "phenomena"    => $h["info"]["phenomena"] ?? "",
            "significance" => $h["info"]["significance"] ?? "",
            "start"        => $h["validTime"]["startTime"] ?? "",
            "end"          => $h["validTime"]["endTime"] ?? ""
        ];
    }
    if (count($list) > 0) {
        $alerts[$loc["locationName"]] = $list;
    }
}

// 5. 存一份暫存，再回傳
$result = json_encode(["ok" => true, "updated" => date("c"), "alerts" => $alerts], JSON_UNESCAPED_UNICODE);
if (!is_dir(dirname($cacheFile))) {
    @mkdir(dirname($cacheFile), 0775, true);
}
@file_put_contents($cacheFile, $result);
echo $result;
