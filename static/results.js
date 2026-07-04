
// =====================================
// Bowling Result JS
// 第1回：基本機能＋QR＋コピー
// =====================================


// Instagramリンク設定
function setupInstagramLink() {

    const link =
        document.getElementById("igLink");

    if (!link) return;

    link.href = "https://www.instagram.com/";
}


// -------------------------------------
// テキストコピー
// -------------------------------------
function copyText() {

    const text =
        `🏆 Bowling Result
Team: ${TEAM}
Score: ${SCORE}`;

    navigator.clipboard.writeText(text);

    alert("コピーしました！");
}


// -------------------------------------
// QRコード生成
// -------------------------------------
function generateQR() {

    const qrDiv =
        document.getElementById("qr");

    if (!qrDiv) return;

    qrDiv.innerHTML = "";

    const url =
        window.location.href;

    new QRCode(qrDiv, {

        text: url,
        width: 180,
        height: 180

    });
}


// -------------------------------------
// 初期化
// -------------------------------------
window.addEventListener("DOMContentLoaded", () => {

    setupInstagramLink();

    generateQR();

});


// =====================================
// 第2回：画像生成（Instagram用）
// =====================================


// -------------------------------------
// 画像生成（Canvas）
// -------------------------------------
function downloadImage() {

    const canvas =
        document.createElement("canvas");

    canvas.width = 1080;
    canvas.height = 1080;

    const ctx =
        canvas.getContext("2d");

    // 背景（ダイナー風）
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, 1080, 1080);

    // 外枠
    ctx.strokeStyle = "#b40000";
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 30, 1020, 1020);

    // タイトル
    ctx.fillStyle = "#ffd166";
    ctx.font = "bold 70px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("BOWLING RESULT", 540, 180);

    // サブ
    ctx.fillStyle = "#aaa";
    ctx.font = "30px sans-serif";
    ctx.fillText("American Diner Score Card", 540, 240);

    // TEAM
    ctx.fillStyle = "#ffffff";
    ctx.font = "50px sans-serif";
    ctx.fillText("TEAM", 300, 450);

    ctx.fillStyle = "#ffd166";
    ctx.font = "80px sans-serif";
    ctx.fillText(TEAM, 300, 550);

    // SCORE
    ctx.fillStyle = "#ffffff";
    ctx.font = "50px sans-serif";
    ctx.fillText("SCORE", 780, 450);

    ctx.fillStyle = "#ff1a1a";
    ctx.font = "80px sans-serif";
    ctx.fillText(SCORE, 780, 550);

    // 下部メッセージ
    ctx.fillStyle = "#666";
    ctx.font = "30px sans-serif";
    ctx.fillText("Share your result on Instagram!", 540, 900);

    // ダウンロード
    const link =
        document.createElement("a");

    link.download =
        `bowling_result_${TEAM}_${SCORE}.png`;

    link.href =
        canvas.toDataURL("image/png");

    link.click();
}


// =====================================
// 第3回：UX仕上げ（演出＋共有強化）
// =====================================


// -------------------------------------
// コピー成功演出
// -------------------------------------
function copyText() {

    const text =
        `🏆 Bowling Result
Team: ${TEAM}
Score: ${SCORE}`;

    navigator.clipboard.writeText(text);

    showToast("コピーしました！");
}


// -------------------------------------
// トースト表示（通知UI）
// -------------------------------------
function showToast(message) {

    let toast =
        document.createElement("div");

    toast.textContent = message;

    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "#b40000";
    toast.style.color = "white";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "10px";
    toast.style.fontSize = "16px";
    toast.style.zIndex = 9999;
    toast.style.opacity = 0;
    toast.style.transition = "0.3s";

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = 1;
    }, 50);

    setTimeout(() => {
        toast.style.opacity = 0;
    }, 1500);

    setTimeout(() => {
        toast.remove();
    }, 2000);
}


// -------------------------------------
// QRを少し演出（揺らす）
// -------------------------------------
function animateQR() {

    const qr =
        document.getElementById("qr");

    if (!qr) return;

    let angle = -2;

    setInterval(() => {

        angle *= -1;

        qr.style.transform =
            `rotate(${angle}deg) scale(1.02)`;

        setTimeout(() => {
            qr.style.transform = "none";
        }, 400);

    }, 2000);
}


// -------------------------------------
// Instagramリンク補強
// -------------------------------------
function setupInstagramLink() {

    const link =
        document.getElementById("igLink");

    if (!link) return;

    link.href = "https://www.instagram.com/";

    link.target = "_blank";
}


// -------------------------------------
// 初期化
// -------------------------------------
window.addEventListener("DOMContentLoaded", () => {

    setupInstagramLink();

    animateQR();

});
