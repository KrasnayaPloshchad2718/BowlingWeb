// =====================================
// お題マスター
// =====================================

let OdaiList = [];

async function loadConfig() {
    const response = await fetch("/config");
    const data = await response.json();
    OdaiList = data.odai;
}

//=====================================
// results.js 1/3
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

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: "",
                    text: "結果を共有します",
                    files: [file]
                });
            } catch (err) {
                console.error(err);
            }
        } else {
            alert("この端末は画像共有に対応していません");
        }
    }, "image/png");
}

const W = 1080;
const H = 1350;

let canvas;
let ctx;
let data = null;

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

function parseParams() {
    const params = new URLSearchParams(window.location.search);

    const lane = params.get("lane");
    const score = params.get("score");

    const odaiIndexes = (params.get("odai") || "").split(",").map(Number);
    
    const odai = odaiIndexes.map(index => {
        if (index >= 0 && index < OdaiList.length) {
            return OdaiList[index];
        }
        return "不明";
    });

    const scores = [
        params.get("sa"),
        params.get("sb"),
        params.get("sc")
    ];

    if (!lane || !score) return null;

    return { lane, score, odai, scores };
}

//=====================================
// results.js 2/3
// アメリカン・ダイナー風デザイン修正版
//=====================================

//=========================
// 背景（情熱的な赤グラデーション＋チェッカー帯）
//=========================
function drawBackground() {
    // ベースのグラデーション
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#8b0000");   // 深い赤
    g.addColorStop(0.4, "#4b0000"); // 渋いダークレッド
    g.addColorStop(1, "#161616");   // 足元は引き締める黒

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // 上下のチェッカーフラッグ帯（CSSの雰囲気を移植）
    drawCheckerBand(0, 80);
    drawCheckerBand(H - 80, 80);
}

// チェッカー帯を描画する補助関数
function drawCheckerBand(y, height) {
    const size = 40; // 1マスのサイズ
    ctx.save();
    ctx.globalAlpha = 0.15; // 背景に馴染むよう薄く
    for (let bx = 0; bx < W; bx += size) {
        for (let by = y; by < y + height; by += size) {
            if ((Math.floor(bx / size) + Math.floor(by / size)) % 2 === 0) {
                ctx.fillStyle = "#ffffff";
            } else {
                ctx.fillStyle = "#000000";
            }
            ctx.fillRect(bx, by, size, size);
        }
    }
    ctx.restore();
}

//=========================
// ダイナー・ポップタイトル
//=========================
function drawTitle() {
    const x = W / 2;
    const y = 180;

    ctx.save();
    ctx.textAlign = "center";

    const text = "Zeze1-2お題deボウリング RESULT";

    // 強烈な黒いドロップシャドウ（アメコミ・レトロポップ風）
    ctx.font = "bold 52px 'Trebuchet MS', Arial, sans-serif";
    ctx.fillStyle = "#000000";
    ctx.fillText(text, x + 5, y + 5);

    // メインの白文字
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, x, y);

    // ダイナー風の極太アンダーライン（白＋赤の2重線）
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(x - 350, y + 25);
    ctx.lineTo(x + 350, y + 25);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.strokeStyle = "#b40000";
    ctx.beginPath();
    ctx.moveTo(x - 350, y + 25);
    ctx.lineTo(x + 350, y + 25);
    ctx.stroke();

    ctx.restore();
}

//=========================
// スコア表示（ダイナー看板風）
//=========================
function drawScore() {
    const x = W / 2;

    ctx.save();
    ctx.textAlign = "center";

    // LANE 表示
    ctx.fillStyle = "#ffe08a"; // 温かみのあるゴールドイエロー
    ctx.font = "bold 22px 'Trebuchet MS', Arial";
    ctx.fillText("★ LANE ★", x, 280);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 64px 'Trebuchet MS', Arial";
    // 文字に立体感を出す黒影
    ctx.fillStyle = "#000000"; ctx.fillText(data.lane, x + 3, 350 + 3);
    ctx.fillStyle = "#ffffff"; ctx.fillText(data.lane, x, 350);

    // TOTAL SCORE 表示
    ctx.fillStyle = "#ffe08a";
    ctx.font = "bold 22px 'Trebuchet MS', Arial";
    ctx.fillText("★ TOTAL SCORE ★", x, 430);

    // スコア数字（真っ赤ではなく、少し朱色がかったヴィンテージなポップレッド）
    ctx.font = "bold 110px 'Trebuchet MS', Arial";
    ctx.fillStyle = "#000000"; ctx.fillText(data.score, x + 4, 540 + 4);
    ctx.fillStyle = "#ff2323"; ctx.fillText(data.score, x, 540);

    ctx.restore();
}

//=========================
// お題（ホワイトボード・メニュー風）
//=========================
function drawOdai() {
    // CSSの「.card」と同じ、太い赤枠の白い看板をイメージ
    ctx.save();
    
    // 看板の影
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#ffffff"; // クリーミーな白背景
    roundRect(80, 600, 920, 280, 22, true, false);
    
    // 影をリセットして太い赤枠線を描画
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#b40000";
    ctx.lineWidth = 8;
    roundRect(80, 600, 920, 280, 22, false, true);

    // 見出し "TODAY'S ODAI MENU"
    ctx.textAlign = "left";
    ctx.fillStyle = "#b40000";
    ctx.font = "bold 30px 'Trebuchet MS', Arial";
    ctx.fillText("TODAY'S ODAI", 130, 660);

    // アンダーライン
    ctx.strokeStyle = "#b40000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(130, 675);
    ctx.lineTo(350, 675);
    ctx.stroke();

    // お題リスト
    ctx.font = "bold 24px Arial";

    for (let i = 0; i < 3; i++) {
        // テキスト（ダークグレーで視認性確保）
        ctx.textAlign = "left";
        ctx.fillStyle = "#222222";
        ctx.fillText(data.odai[i] || "---", 130, 735 + i * 55);

        // スコア（アメリカンポップなブルーに変更）
        ctx.textAlign = "right";
        ctx.fillStyle = "#0044cc";
        ctx.fillText(data.scores[i] || "0", 930, 735 + i * 55);
    }
    ctx.restore();
}

//=====================================
// results.js 3/3
// ピン単体・強視認・最終統合
//=====================================

// 元のコードにあった2パターンのピン描画、および drawPins() の定義を引き継ぎつつ、
// 色味をアイボリーホワイト(#f8f5ee)とダイナーレッド(#b40000)に統一してリファインします。

function drawSimplePin(x, y) {
    ctx.save();

    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 8;

    ctx.fillStyle = "#f8f5ee"; // ダイナー風アイボリー
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 3;

    // 体
    ctx.beginPath();
    ctx.ellipse(x + 20, y + 60, 18, 55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 赤ライン
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#b40000"; // ダイナー赤
    ctx.fillRect(x + 5, y + 55, 30, 10);

    // 頭
    ctx.beginPath();
    ctx.arc(x + 20, y + 10, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#f8f5ee";
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

function drawPin(x, y) {
    ctx.save();

    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 10;

    ctx.fillStyle = "#f8f5ee";
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 4;

    roundRect(x, y, 55, 130, 14, true, true);

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#b40000";
    ctx.fillRect(x, y + 35, 55, 14);
    ctx.fillRect(x, y + 62, 55, 14);

    ctx.beginPath();
    ctx.arc(x + 27, y - 8, 22, 0, Math.PI * 2);
    ctx.fillStyle = "#f8f5ee";
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

// 空白だったピンの並び処理を、元コードの構成を崩さない範囲でシンプルに配置
function drawPins() {
    // お題枠の下（y=940付近）に、可愛いピンのデコレーションを並べます
    const startX = W / 2 - 140;
    const y = 960;
    for (let i = 0; i < 4; i++) {
        drawSimplePin(startX + i * 80, y);
    }
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
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffe082"; // ゴールド
    ctx.font = "bold 18px 'Trebuchet MS', Arial";

    ctx.fillText("★ American Diner Bowling System ★", W / 2, H - 40);
    ctx.restore();
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
