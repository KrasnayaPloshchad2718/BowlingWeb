// =====================================
// results.js（表示＆画像生成のみ）
// =====================================

let data = null;

// =====================================
// 初期化
// =====================================

window.addEventListener("load", async () => {
    await loadResult();
    drawResult();
});

// =====================================
// データ取得
// =====================================

async function loadResult() {

    const pathParts = window.location.pathname.split("/");
    const id = pathParts[pathParts.length - 1];

    try {
        const res = await fetch(`/results/${id}`);

        if (!res.ok) {
            throw new Error("Not Found");
        }

        data = await res.json().catch(() => null);

    } catch (e) {
        console.error(e);
        document.getElementById("status").textContent =
            "結果が見つかりません";
    }
}

// =====================================
// 画像生成（統一デザイン）
// =====================================

function drawResult() {

    const canvas = document.getElementById("canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // 背景（ダイナー統一）
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 上ライン（ストライプ）
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.fillStyle = (i / 40) % 2 === 0 ? "#b30000" : "#ffffff";
        ctx.fillRect(i, 0, 20, 12);
    }

    // タイトル
    ctx.fillStyle = "#ff3b3b";
    ctx.shadowColor = "#ff3b3b";
    ctx.shadowBlur = 25;
    ctx.font = "bold 42px Arial";
    ctx.textAlign = "center";

    ctx.fillText("BOWLING RESULT", canvas.width / 2, 90);

    ctx.shadowBlur = 0;

    // レーン
    const team = data?.team ?? "UNKNOWN";
    const score = data?.score ?? 0;

    ctx.fillStyle = "#fff";
    ctx.font = "bold 32px Arial";
    ctx.fillText(`レーン ${team}`, canvas.width / 2, 170);

    // スコア
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 70px Arial";
    ctx.fillText(score, canvas.width / 2, 280);

    // フレーム
    ctx.strokeStyle = "#ff3b3b";
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
}

// =====================================
// 共有ボタン（画像だけ）
// =====================================

async function shareImage() {

    const canvas = document.getElementById("canvas");
    if (!canvas) return;

    canvas.toBlob(async (blob) => {

        const file = new File([blob], "result.png", {
            type: "image/png"
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {

            await navigator.share({
                files: [file],
                title: "Bowling Result"
            });

        } else {
            alert("この端末は共有非対応です");
        }

    });
}

document
    .getElementById("shareBtn")
    ?.addEventListener("click", shareImage);
