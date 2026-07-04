// =====================================
// 結果データ受け取り
// Flaskから window.RESULT_DATA として渡される前提
// =====================================

const data = window.RESULT_DATA;

if (!data) {
    console.error("RESULT_DATA がありません");
}

// =====================================
// canvas初期化
// =====================================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// 高解像度対応（ぼやけ防止）
canvas.width = 1080;
canvas.height = 1080;

// =====================================
// 画像描画メイン
// =====================================

function drawResult() {

    if (!data) return;

    // 背景
    ctx.fillStyle = "#0f172a"; // ダークネイビー
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // タイトル
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 70px sans-serif";
    ctx.fillText("BOWLING RESULT", 80, 140);

    // 区切り線
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(80, 180);
    ctx.lineTo(1000, 180);
    ctx.stroke();

    // チーム
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "40px sans-serif";
    ctx.fillText("レーン", 80, 300);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 80px sans-serif";
    ctx.fillText(String(data.team), 80, 400);

    // スコア
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "40px sans-serif";
    ctx.fillText("スコア", 80, 550);

    ctx.fillStyle = "#22c55e";
    ctx.font = "bold 120px sans-serif";
    ctx.fillText(String(data.score), 80, 680);

    // 装飾バー
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(80, 740, 900, 10);

    // QR案内（任意テキスト）
    ctx.fillStyle = "#94a3b8";
    ctx.font = "30px sans-serif";
    ctx.fillText("Scan QR to view full results", 80, 850);

    // プレビュー画像にも反映（任意）
    const img = document.getElementById("preview");
    if (img) {
        img.src = canvas.toDataURL("image/png");
    }
}

// 初期描画
drawResult();

// =====================================
// 共有機能（Instagram含むOS共有）
// =====================================

async function share() {

    const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, "image/png");
    });

    const file = new File([blob], "bowling-result.png", {
        type: "image/png"
    });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {

        try {
            await navigator.share({
                files: [file],
                title: "Bowling Result",
                text: "今日の結果！"
            });
        } catch (e) {
            console.error(e);
        }

    } else {
        alert("この端末は画像共有に対応していません");
    }
}

// =====================================
// グローバル公開（HTMLから呼ぶため）
// =====================================

window.share = share;
