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

    ctx.fillStyle = "#ffffff";

    const baseX = 200;
    const baseY = 980;

    const rows = [1,2,3,4];

    let yOffset = 0;

    for(let i=0;i<rows.length;i++){

        let count = rows[i];

        let xOffset = (4 - count) * 25;

        for(let j=0;j<count;j++){

            ctx.beginPath();

            ctx.arc(
                baseX + xOffset + j * 50,
                baseY + yOffset,
                14,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = "#ffffff";
            ctx.fill();

            ctx.strokeStyle = "#b00000";
            ctx.lineWidth = 3;
            ctx.stroke();

        }

        yOffset += 45;
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

function drawTexts(){

    //=========================
    // 背景タイトル
    //=========================

    ctx.fillStyle = "#8b0000";
    ctx.font = "bold 72px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "BOWLING RESULT",
        W / 2,
        180
    );

    // サブタイトル（少し下げる）
    ctx.fillStyle = "#333";
    ctx.font = "28px Arial";

    ctx.fillText(
        "American Diner Challenge",
        W / 2,
        230
    );

    //=========================
    // レーン＆スコア（中央上寄せ）
    //=========================

    ctx.fillStyle = "#111";
    ctx.font = "bold 48px Arial";

    ctx.fillText("LANE", W / 2, 320);

    ctx.fillStyle = "#b00000";
    ctx.font = "bold 110px Arial";

    ctx.fillText(
        String(resultData.lane),
        W / 2,
        430
    );

    ctx.fillStyle = "#111";
    ctx.font = "bold 40px Arial";

    ctx.fillText("TOTAL SCORE", W / 2, 520);

    ctx.fillStyle = "#d00000";
    ctx.font = "bold 110px Arial";

    ctx.fillText(
        String(resultData.score),
        W / 2,
        630
    );

    //=========================
    // お題エリア（下に大きくずらす）
    //=========================

    // 半透明背景（可読性改善）
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(80, 700, 920, 260);

    // お題タイトル
    ctx.fillStyle = "#fff";
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "left";

    ctx.fillText("ODAI", 120, 750);

    // お題
    ctx.font = "28px Arial";

    ctx.fillStyle = "#ffffff";
    ctx.fillText(resultData.odai[0], 120, 810);
    ctx.fillText(resultData.odai[1], 120, 860);
    ctx.fillText(resultData.odai[2], 120, 910);

    //=========================
    // スコア（右側・強調）
    //=========================

    ctx.textAlign = "right";

    ctx.fillStyle = "#ffd700"; // 金色で強調
    ctx.font = "bold 28px Arial";

    ctx.fillText(resultData.scores[0], 960, 810);
    ctx.fillText(resultData.scores[1], 960, 860);
    ctx.fillText(resultData.scores[2], 960, 910);

    //=========================
    // ピン装飾（見えるように強化）
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
