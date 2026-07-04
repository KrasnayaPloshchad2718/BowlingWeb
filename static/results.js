// =====================================
// Results.js
// American Diner Style
// Part 1
// =====================================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1080;
canvas.height = 1080;

const W = canvas.width;
const H = canvas.height;


//=====================================
// URLからデータ取得
//=====================================



//=====================================
// 読み込み
//=====================================

//=====================================
// 読み込み
//=====================================

window.addEventListener(

    "DOMContentLoaded",

    ()=>{

        drawImage();

    }

);

//=====================================
// サーバー取得
//=====================================

async function loadResult(){

    try{

        const res =
            await fetch(
                "/api/results/" + resultId
            );

        if(!res.ok){

            throw new Error();

        }

        resultData =
            await res.json();

    }

    catch(e){

        alert("結果が取得できません");

    }

}


//=====================================
// 全体描画
//=====================================

function drawImage(){

    if(!resultData)return;

    drawBackground();

    drawChecker();

    drawCard();

    drawPins();

    drawTexts();

}


//=====================================
// 背景
//=====================================

function drawBackground(){

    const g =
        ctx.createLinearGradient(
            0,
            0,
            0,
            H
        );

    g.addColorStop(
        0,
        "#6f0000"
    );

    g.addColorStop(
        1,
        "#2a0000"
    );

    ctx.fillStyle = g;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

}


//=====================================
// チェッカーフラッグ
//=====================================

function drawChecker(){

    const size = 40;

    for(
        let y=0;
        y<120;
        y+=size
    ){

        for(
            let x=0;
            x<W;
            x+=size
        ){

            const white =
                (
                    x/size+
                    y/size
                )%2===0;

            ctx.fillStyle=
                white
                ?"#ffffff"
                :"#111111";

            ctx.fillRect(
                x,
                y,
                size,
                size
            );

        }

    }

}


//=====================================
// メインカード
//=====================================

function drawCard(){

    ctx.fillStyle="#ffffff";

    roundRect(
        120,
        170,
        840,
        760,
        30
    );

    ctx.fill();

    ctx.lineWidth=8;

    ctx.strokeStyle="#b40000";

    ctx.stroke();

}


//=====================================
// ピン描画
//=====================================

function drawPins(){

    const baseX = 200;
    const baseY = 900;

    const rows = [1,2,3,4];

    let yOffset = 0;

    for(let i=0;i<rows.length;i++){

        let count = rows[i];
        let xOffset = (4 - count) * 25;

        for(let j=0;j<count;j++){

            // 🔥 白禁止 → 赤ベース＋黒縁
            ctx.beginPath();

            ctx.arc(
                baseX + xOffset + j * 55,
                baseY + yOffset,
                16,
                0,
                Math.PI * 2
            );

            // 塗り（赤）
            ctx.fillStyle = "#c00000";
            ctx.fill();

            // 縁（黒でくっきり）
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 4;
            ctx.stroke();

        }

        yOffset += 55;
    }
}

//=====================================
// ピン
//=====================================

function drawPin(x,y,s){

    ctx.save();

    ctx.translate(x,y);

    ctx.scale(s,s);

    ctx.fillStyle="#ffffff";

    ctx.beginPath();

    ctx.moveTo(0,-110);

    ctx.bezierCurveTo(

        -25,
        -50,

        -45,
        20,

        -30,
        120

    );

    ctx.lineTo(
        30,
        120
    );

    ctx.bezierCurveTo(

        45,
        20,

        25,
        -50,

        0,
        -110

    );

    ctx.fill();

    ctx.fillStyle="#d00000";

    ctx.fillRect(

        -25,
        -30,
        50,
        18

    );

    ctx.restore();

}
//=====================================
// 文字描画
//=====================================

//=====================================
// 文字描画
//=====================================
//=====================================
// 文字・ピン・レイアウト改善版
//=====================================
//=====================================
// レイアウト完全修正版
//=====================================

function drawTexts(){

    //=========================
    // タイトル（上・強め）
    //=========================

    ctx.fillStyle = "#8b0000";
    ctx.font = "bold 64px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "BOWLING RESULT",
        W / 2,
        120
    );

    ctx.fillStyle = "#333";
    ctx.font = "22px Arial";

    ctx.fillText(
        "American Diner Challenge",
        W / 2,
        160
    );

    //=========================
    // LANE（小さく・控えめ）
    //=========================

    ctx.fillStyle = "#666";
    ctx.font = "20px Arial";

    ctx.fillText("LANE", W / 2, 210);

    ctx.fillStyle = "#b00000";
    ctx.font = "bold 60px Arial";

    ctx.fillText(
        String(resultData.lane),
        W / 2,
        280
    );

    //=========================
    // SCORE（少し上へ）
    //=========================

    ctx.fillStyle = "#111";
    ctx.font = "24px Arial";

    ctx.fillText("TOTAL SCORE", W / 2, 340);

    ctx.fillStyle = "#d00000";
    ctx.font = "bold 80px Arial";

    ctx.fillText(
        String(resultData.score),
        W / 2,
        430
    );

    //=========================
    // お題エリア（さらに下げて分離）
    //=========================

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(60, 500, 980, 320);

    ctx.textAlign = "left";

    ctx.fillStyle = "#fff";
    ctx.font = "bold 26px Arial";

    ctx.fillText("ODAI", 100, 550);

    ctx.font = "24px Arial";

    ctx.fillText(resultData.odai[0], 100, 610);
    ctx.fillText(resultData.odai[1], 100, 660);
    ctx.fillText(resultData.odai[2], 100, 710);

    //=========================
    // スコア（右側・強調）
    //=========================

    ctx.textAlign = "right";

    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 26px Arial";

    ctx.fillText(resultData.scores[0], 1000, 610);
    ctx.fillText(resultData.scores[1], 1000, 660);
    ctx.fillText(resultData.scores[2], 1000, 710);

    //=========================
    // ピン（白禁止・強コントラスト）
    //=========================

    drawPins();
}

//=====================================
// 角丸四角形
//=====================================

function roundRect(x,y,w,h,r){

    ctx.beginPath();

    ctx.moveTo(x+r,y);

    ctx.lineTo(x+w-r,y);

    ctx.quadraticCurveTo(
        x+w,
        y,
        x+w,
        y+r
    );

    ctx.lineTo(
        x+w,
        y+h-r
    );

    ctx.quadraticCurveTo(
        x+w,
        y+h,
        x+w-r,
        y+h
    );

    ctx.lineTo(
        x+r,
        y+h
    );

    ctx.quadraticCurveTo(
        x,
        y+h,
        x,
        y+h-r
    );

    ctx.lineTo(
        x,
        y+r
    );

    ctx.quadraticCurveTo(
        x,
        y,
        x+r,
        y
    );

    ctx.closePath();

}

//=====================================
// PNGダウンロード
//=====================================

function downloadImage(){

    const link =
        document.createElement("a");

    link.download =
        "BowlingResult.png";

    link.href =
        canvas.toDataURL("image/png");

    link.click();

}


//=====================================
// 共有
//=====================================

async function share(){

    canvas.toBlob(

        async(blob)=>{

            if(!blob){

                alert("画像生成失敗");

                return;

            }

            const file =
                new File(

                    [blob],

                    "BowlingResult.png",

                    {
                        type:"image/png"
                    }

                );

            if(

                navigator.canShare &&

                navigator.canShare({

                    files:[file]

                })

            ){

                try{

                    await navigator.share({

                        files:[file],

                        title:
                        "Bowling Challenge",

                        text:
                        "Bowling Challenge"

                    });

                }

                catch(e){

                    console.log(e);

                }

            }

            else{

                downloadImage();

            }

        },

        "image/png"

    );

}


//=====================================
// ボタン登録
//=====================================

window.addEventListener(

    "DOMContentLoaded",

    ()=>{

        const shareButton=
            document.getElementById(
                "shareButton"
            );

        if(shareButton){

            shareButton.addEventListener(

                "click",

                share

            );

        }

        const saveButton=
            document.getElementById(
                "saveButton"
            );

        if(saveButton){

            saveButton.addEventListener(

                "click",

                downloadImage

            );

        }

    }

);


//=====================================
// リサイズ対応
//=====================================

window.addEventListener(

    "resize",

    ()=>{

        if(resultData){

            drawImage();

        }

    }

);


//=====================================
// デバッグ
//=====================================

console.log(
    "Results.js Loaded"
);

console.log(
    "Result ID:",
    resultId
);
