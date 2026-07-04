// =====================================
// Bowling Rules JavaScript
// 第1回（整理版）
// =====================================


// =====================================
// Today's Special データ
// =====================================

const specialList = [

    "🎳 ストライクを目指そう！",
    "🍔 Enjoy Bowling & Diner!",
    "🥤 チームワークで高得点！",
    "⭐ 難しいお題ほど高得点！",
    "🎯 今日の目標：1000点突破！",
    "🏆 ランキング1位を狙え！",
    "🎉 思い切って挑戦しよう！",
    "🍟 アメリカンダイナーへようこそ！"

];


// =====================================
// Today's Special 更新
// =====================================

function updateSpecial(){

    const text =
        document.getElementById("specialText");

    if(!text) return;

    const index =
        Math.floor(Math.random() * specialList.length);

    text.style.opacity = "0";

    setTimeout(()=>{

        text.textContent = specialList[index];
        text.style.opacity = "1";

    }, 300);

}


// =====================================
// デジタル時計
// =====================================

function updateClock(){

    const clock =
        document.getElementById("clock");

    if(!clock) return;

    const now = new Date();

    const h = String(now.getHours()).padStart(2,"0");
    const m = String(now.getMinutes()).padStart(2,"0");
    const s = String(now.getSeconds()).padStart(2,"0");

    clock.textContent = `${h}:${m}:${s}`;
}


// =====================================
// タイトル点滅
// =====================================

function animateTitle(){

    const title =
        document.getElementById("title");

    if(!title) return;

    let on = false;

    setInterval(()=>{

        title.style.color = on ? "#ffffff" : "#ffe082";
        on = !on;

    }, 1000);

}


// =====================================
// 初期化（ここ1つだけ）
// =====================================

window.addEventListener("DOMContentLoaded", ()=>{

    // 即時実行
    updateSpecial();
    updateClock();

    // 定期更新
    setInterval(updateSpecial, 10000);
    setInterval(updateClock, 1000);

    animateTitle();

});

// =====================================
// Bowling Rules JavaScript
// 第2回（UI・演出系）
// =====================================


// =====================================
// FAQ 開閉
// =====================================

function initializeFAQ(){

    const buttons =
        document.querySelectorAll(".faq-button");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const item = button.parentElement;

            item.classList.toggle("open");

        });

    });

}


// =====================================
// カード出現アニメーション（初回のみ）
// =====================================

function animateCards(){

    const cards =
        document.querySelectorAll(".card");

    cards.forEach((card, index) => {

        card.style.opacity = "0";
        card.style.transform = "translateY(30px)";

        setTimeout(() => {

            card.style.transition = "0.6s";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";

        }, index * 150);

    });

}


// =====================================
// スクロールフェードイン
// =====================================

function scrollAnimation(){

    const cards =
        document.querySelectorAll(".card");

    const trigger =
        window.innerHeight * 0.85;

    cards.forEach(card => {

        const top =
            card.getBoundingClientRect().top;

        if(top < trigger){

            card.classList.add("show");

        }

    });

}


// =====================================
// カードクリック演出
// =====================================

function enableCardClick(){

    const cards =
        document.querySelectorAll(".card");

    cards.forEach(card => {

        card.addEventListener("click", () => {

            card.style.transform = "scale(0.97)";

            setTimeout(() => {

                card.style.transform = "";

            }, 120);

        });

    });

}


// =====================================
// ピン揺れアニメーション
// =====================================

function animatePins(){

    const pins =
        document.querySelectorAll(".pin");

    let angle = -5;

    setInterval(() => {

        angle *= -1;

        pins.forEach(pin => {

            pin.style.transform = `rotate(${angle}deg)`;

        });

    }, 1200);

}


// =====================================
// ナビゲーションホバー
// =====================================

function animateNavigation(){

    const links =
        document.querySelectorAll("nav a");

    links.forEach(link => {

        link.addEventListener("mouseenter", () => {

            link.style.letterSpacing = "2px";

        });

        link.addEventListener("mouseleave", () => {

            link.style.letterSpacing = "";

        });

    });

}


// =====================================
// 初期化（第2回）
// ※ DOMContentLoadedはまだ統合しない
// =====================================

window.addEventListener("DOMContentLoaded", () => {

    initializeFAQ();
    animateCards();
    enableCardClick();
    animatePins();
    animateNavigation();
    scrollAnimation();

});

window.addEventListener("scroll", scrollAnimation);

// =====================================
// Bowling Rules JavaScript
// 第3回（演出・背景・全体エフェクト）
// =====================================


// =====================================
// ページフェードイン
// =====================================

function pageOpening(){

    document.body.style.opacity = "0";
    document.body.style.transition = "1.2s";

    setTimeout(() => {

        document.body.style.opacity = "1";

    }, 100);

}


// =====================================
// ダイナー背景グラデーション変化
// =====================================

function dinerBackground(){

    const colors = [

        "#5a0000",
        "#690000",
        "#730000",
        "#5f1010"

    ];

    let index = 0;

    setInterval(() => {

        index = (index + 1) % colors.length;

        const bg =
            document.querySelector(".background-grid");

        if(!bg) return;

        bg.style.transition = "2s";
        bg.style.background =
            `linear-gradient(${colors[index]}, #222222)`;

    }, 8000);

}


// =====================================
// Special点滅（演出強化版）
// =====================================

function flashSpecial(){

    const special =
        document.getElementById("special");

    if(!special) return;

    let on = false;

    setInterval(() => {

        if(on){

            special.style.transform = "scale(1)";
            special.style.boxShadow = "0 10px 25px rgba(0,0,0,0.35)";

        }else{

            special.style.transform = "scale(1)";
            special.style.boxShadow = "0 0 25px rgba(255,255,255,0.4)";

        }

        on = !on;

    }, 1200);

}


// =====================================
// キーボードショートカット
// RキーでSpecial更新
// =====================================

function keyboardShortcut(){

    document.addEventListener("keydown", (e) => {

        if(e.key === "r" || e.key === "R"){

            updateSpecial();

        }

    });

}


// =====================================
// ランダム回転ホバー演出
// =====================================

function randomRotate(){

    const cards =
        document.querySelectorAll(".card");

    cards.forEach(card => {

        card.addEventListener("mouseenter", () => {

            const deg = Math.random() * 4 - 2;

            card.style.transform =
                `rotate(${deg}deg) translateY(-6px)`;

        });

        card.addEventListener("mouseleave", () => {

            card.style.transform = "";

        });

    });

}


// =====================================
// タイトルアニメーション（ページタイトル変更）
// =====================================

function titleAnimation(){

    const list = [

        "Bowling Challenge",
        "American Diner",
        "Strike!!",
        "Let's Bowling!"

    ];

    let i = 0;

    setInterval(() => {

        document.title = list[i];

        i = (i + 1) % list.length;

    }, 3000);

}


// =====================================
// 時計（最終版：ここで統一）
// =====================================

function updateClock(){

    const clock =
        document.getElementById("clock");

    if(!clock) return;

    const now = new Date();

    const h = String(now.getHours()).padStart(2,"0");
    const m = String(now.getMinutes()).padStart(2,"0");
    const s = String(now.getSeconds()).padStart(2,"0");

    clock.textContent = `${h}:${m}:${s}`;
}


// =====================================
// 時計開始
// =====================================

function startClock(){

    updateClock();
    setInterval(updateClock, 1000);

}


// =====================================
// 初期化（第3回）
// =====================================

window.addEventListener("DOMContentLoaded", () => {

    pageOpening();
    dinerBackground();
    flashSpecial();
    keyboardShortcut();
    randomRotate();
    titleAnimation();
    startClock();

});


// =====================================
// スクロール監視（第2回と連動）
// =====================================

window.addEventListener("scroll", scrollAnimation);