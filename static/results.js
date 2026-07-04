//=====================================
// results.js 1/3
// 基礎・Canvas初期化・データ取得
//=====================================


//=========================
// グローバル
//=========================

let canvas;
let ctx;

let W = 1080;
let H = 1350;

let resultData = null;


//=========================
// 初期化
//=========================

window.addEventListener("DOMContentLoaded", () => {

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    //=========================
    // 高解像度対応（重要）
    //=========================

    const dpr = window.devicePixelRatio || 2;

    canvas.width = W * dpr;
    canvas.height = H * dpr;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.scale(dpr, dpr);

    //=========================
    // URLからデータ取得
    //=========================

    resultData = parseURL();

    if (!resultData) {
        console.error("resultData is null");
        return;
    }

    render();
});


//=========================
// URLパース
//=========================

function parseURL() {

    const params = new URLSearchParams(window.location.search);

    const lane = params.get("lane");
    const score = params.get("score");

    const oa = params.get("oa");
    const ob = params.get("ob");
    const oc = params.get("oc");

    const sa = params.get("sa");
    const sb = params.get("sb");
    const sc = params.get("sc");

    if (!lane || !score) {
        return null;
    }

    return {
        lane: lane,
        score: score,
        odai: [oa, ob, oc],
        scores: [sa, sb, sc]
    };
}


//=========================
// メイン描画
//=========================

function render() {

    drawBackground();

    drawNeonTitle();

    drawScoreBlock();

    drawOdaiBlock();

    drawPins();

}

//=====================================
// results.js 2/3
// ネオンタイトル・スコア・お題表示
//=====================================


//=========================
// 背景（簡易ダイナー風）
//=========================

function drawBackground() {

    const g = ctx.createLinearGradient(0, 0, 0, H);

    g.addColorStop(0, "#1a0000");
    g.addColorStop(0.5, "#0f0f0f");
    g.addColorStop(1, "#000000");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
}


//=========================
// ネオンタイトル
//=========================

function drawNeonTitle() {

    const x = W / 2;
    const y = 140;

    ctx.textAlign = "center";
    ctx.font = "bold 72px Arial";

    // グロー（外側）
    ctx.shadowColor = "#ff0040";
    ctx.shadowBlur = 30;

    ctx.fillStyle = "#ff2a6d";
    ctx.fillText("BOWLING RESULT", x, y);

    // コア（内側）
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.fillText("BOWLING RESULT", x, y);

    // サブタイトル
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "22px Arial";
    ctx.fillText("American Diner Challenge", x, y + 40);
}


//=========================
// スコアブロック
//=========================

function drawScoreBlock() {

    const x = W / 2;

    ctx.textAlign = "center";

    // LANE（小さく）
    ctx.fillStyle = "#666";
    ctx.font = "20px Arial";
    ctx.fillText("LANE", x, 220);

    ctx.fillStyle = "#b00000";
    ctx.font = "bold 64px Arial";
    ctx.fillText(resultData.lane, x, 290);

    // SCORE
    ctx.fillStyle = "#111";
    ctx.font = "22px Arial";
    ctx.fillText("TOTAL SCORE", x, 360);

    ctx.fillStyle = "#d00000";
    ctx.font = "bold 90px Arial";
    ctx.fillText(resultData.score, x, 460);
}


//=========================
// お題ブロック
//=========================

function drawOdaiBlock() {

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(60, 520, 960, 300);

    ctx.textAlign = "left";

    // タイトル
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px Arial";
    ctx.fillText("ODAI", 100, 570);

    // お題
    ctx.font = "24px Arial";
    ctx.fillStyle = "#ffffff";

    ctx.fillText(resultData.odai[0] || "", 100, 630);
    ctx.fillText(resultData.odai[1] || "", 100, 680);
    ctx.fillText(resultData.odai[2] || "", 100, 730);

    // スコア右側
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffd700";

    ctx.fillText(resultData.scores[0] || "", 980, 630);
    ctx.fillText(resultData.scores[1] || "", 980, 680);
    ctx.fillText(resultData.scores[2] || "", 980, 730);
}

//=====================================
// results.js 3/3
// ピン描画・仕上げ・統合
//=====================================


//=========================
// ピン描画（強化版）
//=========================

function drawPin(x, y) {

    // 外枠（黒縁強化）
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;

    // 本体
    ctx.fillStyle = "#f2efe6";

    ctx.beginPath();
    ctx.roundRect(x, y, 50, 120, 12);
    ctx.fill();
    ctx.stroke();

    // 赤ライン（コントラスト強化）
    ctx.fillStyle = "#d40000";

    ctx.fillRect(x, y + 30, 50, 14);
    ctx.fillRect(x, y + 55, 50, 14);

    // 頭（球）
    ctx.beginPath();
    ctx.arc(x + 25, y - 5, 20, 0, Math.PI * 2);

    ctx.fillStyle = "#f2efe6";
    ctx.fill();
    ctx.stroke();
}


//=========================
// ピン配置（視認性重視）
//=========================

function drawPins() {

    const baseX = 420;
    const baseY = 900;

    const dx = 70;
    const dy = 85;

    // 1段目
    drawPin(baseX + dx * 1.5, baseY);

    // 2段目
    drawPin(baseX + dx * 1, baseY + dy);
    drawPin(baseX + dx * 2, baseY + dy);

    // 3段目
    drawPin(baseX + dx * 0.5, baseY + dy * 2);
    drawPin(baseX + dx * 1.5, baseY + dy * 2);
    drawPin(baseX + dx * 2.5, baseY + dy * 2);

    // 4段目
    drawPin(baseX, baseY + dy * 3);
    drawPin(baseX + dx, baseY + dy * 3);
    drawPin(baseX + dx * 2, baseY + dy * 3);
    drawPin(baseX + dx * 3, baseY + dy * 3);
}


//=========================
// フッター装飾
//=========================

function drawFooter() {

    ctx.textAlign = "center";

    ctx.fillStyle = "#444";
    ctx.font = "18px Arial";

    ctx.fillText("American Diner Bowling System", W / 2, H - 40);
}


//=========================
// 最終統合
//=========================

function render() {

    drawBackground();

    drawNeonTitle();

    drawScoreBlock();

    drawOdaiBlock();

    drawPins();

    drawFooter();
}
