// =====================================
// お題マスター
// =====================================

let OdaiList = [];

async function loadConfig() {

    const response =
        await fetch("/config");

    const data =
        await response.json();

    OdaiList = data.odai;

}

//=====================================
// results.js 1/3（完全再設計版）
// 高解像度・座標系・データ確定
//=====================================
async function shareImage() {

    const canvas = document.getElementById("canvas");

    canvas.toBlob(async (blob) => {

        if (!blob) {
            alert("画像生成に失敗");
            return;
        }

        const file = new File([blob], "bowling-result.png", {
            type: "image/png"
        });

        //=========================
        // 共有可能チェック
        //=========================

        if (navigator.canShare && navigator.canShare({ files: [file] })) {

            try {

                await navigator.share({
                    title: "",
                    text: "結果を共有します",
                    files: [file]   // ← これが画像共有
                });

            } catch (err) {
                console.error(err);
            }

        } else {

            alert("この端末は画像共有に対応していません");
        }

    }, "image/png");
}

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

window.addEventListener("DOMContentLoaded", async () => {

    await loadConfig();

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    const dpr = 2;

    canvas.width = W * dpr;
    canvas.height = H * dpr;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.scale(dpr, dpr);

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

    const odaiIndexes =
        (params.get("odai") || "")
            .split(",")
            .map(Number);
    
    const odai = odaiIndexes.map(index => {
    
        if (
            index >= 0 &&
            index < OdaiList.length
        ) {
    
            return OdaiList[index];
    
        }
    
        return "不明";
    
    });

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

    const text = "Zeze1-2お題deボウリング　RESULT";

    // ===== 外側グロー（強） =====
    ctx.font = "bold 50px Arial";
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

function drawSimplePin(x, y) {

    ctx.save();

    // 影（軽く）
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 8;

    // 本体（普通のピン形状）
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;

    // 体（細長い楕円ベース）
    ctx.beginPath();
    ctx.ellipse(x + 20, y + 60, 18, 55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 赤ライン（1本だけ）
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#cc0000";
    ctx.fillRect(x + 5, y + 55, 30, 10);

    // 頭
    ctx.beginPath();
    ctx.arc(x + 20, y + 10, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

//=========================
// ピン（単体強化モデル）
//=========================

function drawPin(x, y) {

    ctx.save(); // ← 超重要（状態隔離）

    // 影はピンだけ
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 10;

    ctx.fillStyle = "#f8f5ee";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 4;

    roundRect(x, y, 55, 130, 14, true, true);

    // shadow解除（ここ重要）
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#d40000";
    ctx.fillRect(x, y + 35, 55, 14);
    ctx.fillRect(x, y + 62, 55, 14);

    ctx.beginPath();
    ctx.arc(x + 27, y - 8, 22, 0, Math.PI * 2);
    ctx.fillStyle = "#f8f5ee";
    ctx.fill();
    ctx.stroke();

    ctx.restore(); // ← 絶対必要
}

//=========================
// 並び（見せる配置ではなく“実物配置”）
//=========================

function drawSimplePin(x, y) {

    ctx.save();

    // 影（軽く）
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 8;

    // 本体（普通のピン形状）
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;

    // 体（細長い楕円ベース）
    ctx.beginPath();
    ctx.ellipse(x + 20, y + 60, 18, 55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 赤ライン（1本だけ）
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#cc0000";
    ctx.fillRect(x + 5, y + 55, 30, 10);

    // 頭
    ctx.beginPath();
    ctx.arc(x + 20, y + 10, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.stroke();

    ctx.restore();
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
