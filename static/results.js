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

const parts = window.location.pathname.split("/");
const resultId = parts[parts.length - 1];

let resultData = null;


//=====================================
// 読み込み
//=====================================

window.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadResult();

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

    drawPin(180,850,0.85);

    drawPin(900,850,0.85);

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

function drawTexts(){

    // タイトル
    ctx.fillStyle="#b00000";
    ctx.font="bold 68px Arial";
    ctx.textAlign="center";

    ctx.fillText(
        "BOWLING RESULT",
        W/2,
        270
    );

    // サブタイトル
    ctx.fillStyle="#444";
    ctx.font="32px Arial";

    ctx.fillText(
        "American Diner Challenge",
        W/2,
        320
    );

    // 区切り線
    ctx.strokeStyle="#d00000";
    ctx.lineWidth=5;

    ctx.beginPath();
    ctx.moveTo(220,360);
    ctx.lineTo(860,360);
    ctx.stroke();

    // レーン表示
    ctx.fillStyle="#222";
    ctx.font="bold 56px Arial";

    ctx.fillText(
        "LANE",
        W/2,
        470
    );

    ctx.fillStyle="#b00000";
    ctx.font="bold 130px Arial";

    ctx.fillText(
        String(resultData.team),
        W/2,
        590
    );

    // SCORE
    ctx.fillStyle="#222";
    ctx.font="bold 56px Arial";

    ctx.fillText(
        "SCORE",
        W/2,
        710
    );

    ctx.fillStyle="#c00000";
    ctx.font="bold 150px Arial";

    ctx.fillText(
        String(resultData.score),
        W/2,
        855
    );

    // フッター
    ctx.fillStyle="#555";
    ctx.font="28px Arial";

    ctx.fillText(
        "Bowling Challenge",
        W/2,
        980
    );

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
