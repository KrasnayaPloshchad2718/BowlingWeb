//=====================================
// results.js 1/3（完全再設計版）
// 高解像度・座標系・データ確定
//=====================================


//=========================
// 基本設定
//=========================

const W = 1080;
const H = 1350;

let canvas;
let ctx;

let data = null;


//=========================
// 初期化
//=========================

window.addEventListener("DOMContentLoaded", () => {

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    //=================================
    // 超重要：画質崩壊防止（DPR固定）
    //=================================

    const dpr = 2;

    canvas.width = W * dpr;
    canvas.height = H * dpr;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.scale(dpr, dpr);

    //=========================
    // データ取得（URL統一）
    //=========================

    data = parseParams();

    if (!data) {
        console.error("invalid url data");
        return;
    }

    render();
});


//=========================
// URL解析（完全固定仕様）
//=========================

function parseParams() {

    const p = new URLSearchParams(window.location.search);

    const lane = p.get("lane");
    const score = p.get("score");

    const odai = [
        p.get("oa"),
        p.get("ob"),
        p.get("oc")
    ];

    const scores = [
        p.get("sa"),
        p.get("sb"),
        p.get("sc")
    ];

    if (!lane || !score) return null;

    return { lane, score, odai, scores };
}
//=====================================
// results.js 2/3（デザイン完全修正版）
// ネオン・スコア・レイアウト改善
//=====================================


//=========================
// 背景（ダイナー強化版）
//=========================

function drawBackground() {

    const g = ctx.createLinearGradient(0, 0, 0, H);

    g.addColorStop(0, "#120000");
    g.addColorStop(0.5, "#050505");
    g.addColorStop(1, "#000000");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
}


//=========================
// ネオンタイトル（完全修正版）
//=========================

function drawTitle() {

    const x = W / 2;
    const y = 160;

    ctx.textAlign = "center";

    const text = "BOWLING RESULT";

    // ===== 外側グロー（強） =====
    ctx.font = "bold 80px Arial";
    ctx.shadowColor = "#ff0033";
    ctx.shadowBlur = 40;
    ctx.fillStyle = "#ff2b6d";
    ctx.fillText(text, x, y);

    // ===== 白コア（読みやすさ確保） =====
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, x, y);

    // ===== 下線ネオンバー =====
    ctx.strokeStyle = "#ff0044";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 260, y + 20);
    ctx.lineTo(x + 260, y + 20);
    ctx.stroke();
}


//=========================
// スコア表示（レイアウト修正）
//=========================

function drawScore() {

    const x = W / 2;

    ctx.textAlign = "center";

    // LANE（小さく・上に移動）
    ctx.fillStyle = "#888";
    ctx.font = "18px Arial";
    ctx.fillText("LANE", x, 260);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 54px Arial";
    ctx.fillText(data.lane, x, 320);

    // SCORE
    ctx.fillStyle = "#888";
    ctx.font = "18px Arial";
    ctx.fillText("TOTAL", x, 400);

    ctx.fillStyle = "#ff0033";
    ctx.font = "bold 96px Arial";
    ctx.shadowColor = "#ff0033";
    ctx.shadowBlur = 25;
    ctx.fillText(data.score, x, 500);

    ctx.shadowBlur = 0;
}


//=========================
// お題（完全再配置）
//=========================

function drawOdai() {

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(80, 560, 920, 260);

    ctx.textAlign = "left";

    ctx.fillStyle = "#fff";
    ctx.font = "bold 26px Arial";
    ctx.fillText("ODAI", 120, 610);

    ctx.font = "22px Arial";

    for (let i = 0; i < 3; i++) {

        ctx.fillStyle = "#ffffff";
        ctx.fillText(data.odai[i] || "", 120, 670 + i * 55);

        ctx.textAlign = "right";
        ctx.fillStyle = "#ffd000";
        ctx.fillText(data.scores[i] || "", 940, 670 + i * 55);

        ctx.textAlign = "left";
    }
}
//=====================================
// results.js 3/3（完成版）
// ピン単体・強視認・最終統合
//=====================================


//=========================
// ピン（単体強化モデル）
//=========================

function drawPin(x, y) {

    //=========================
    // 影（背景から分離）
    //=========================

    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 15;

    //=========================
    // 本体（白＋厚み）
    //=========================

    ctx.fillStyle = "#f8f5ee";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 5;

    roundRect(x, y, 55, 130, 14, true, true);

    //=========================
    // 赤リング（視認性強化）
    //=========================

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#d40000";

    ctx.fillRect(x, y + 35, 55, 14);
    ctx.fillRect(x, y + 62, 55, 14);

    //=========================
    // 頭（球体強調）
    //=========================

    ctx.beginPath();
    ctx.arc(x + 27, y - 8, 22, 0, Math.PI * 2);

    ctx.fillStyle = "#f8f5ee";
    ctx.fill();
    ctx.stroke();
}


//=========================
// 並び（見せる配置ではなく“実物配置”）
//=========================

function drawPins() {

    const baseX = W / 2 - 120;
    const baseY = 880;

    const dx = 75;
    const dy = 95;

    // 1
    drawPin(baseX + dx * 1.5, baseY);

    // 2
    drawPin(baseX + dx * 1, baseY + dy);
    drawPin(baseX + dx * 2, baseY + dy);

    // 3
    drawPin(baseX + dx * 0.5, baseY + dy * 2);
    drawPin(baseX + dx * 1.5, baseY + dy * 2);
    drawPin(baseX + dx * 2.5, baseY + dy * 2);

    // 4
    drawPin(baseX, baseY + dy * 3);
    drawPin(baseX + dx, baseY + dy * 3);
    drawPin(baseX + dx * 2, baseY + dy * 3);
    drawPin(baseX + dx * 3, baseY + dy * 3);
}


//=========================
// 丸角矩形（補助関数）
//=========================

function roundRect(x, y, w, h, r, fill, stroke) {

    ctx.beginPath();

    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);

    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}


//=========================
// フッター
//=========================

function drawFooter() {

    ctx.textAlign = "center";
    ctx.fillStyle = "#444";
    ctx.font = "16px Arial";

    ctx.fillText("American Diner Bowling System", W / 2, H - 40);
}


//=========================
// 最終統合
//=========================

function render() {

    drawBackground();
    drawTitle();
    drawScore();
    drawOdai();
    drawPins();
    drawFooter();
}
