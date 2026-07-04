// =====================================
// Bowling Login JavaScript
// =====================================


// =====================================
// 時計
// =====================================

function updateClock() {

    const clock =
        document.getElementById("clock");

    if (!clock) return;

    const now = new Date();

    const h =
        String(now.getHours()).padStart(2, "0");

    const m =
        String(now.getMinutes()).padStart(2, "0");

    const s =
        String(now.getSeconds()).padStart(2, "0");

    clock.textContent =
        `${h}:${m}:${s}`;

}


// =====================================
// タイトル点滅
// =====================================

function animateTitle() {

    const title =
        document.getElementById("title");

    if (!title) return;

    let gold = false;

    setInterval(() => {

        if (gold) {

            title.style.color = "#ffffff";

            title.style.textShadow =
                "0 0 10px #ff0000, 0 0 20px #ff4444";

        }

        else {

            title.style.color = "#ffe082";

            title.style.textShadow =
                "0 0 10px gold, 0 0 25px gold, 0 0 40px orange";

        }

        gold = !gold;

    }, 1000);

}


// =====================================
// パスワード表示
// =====================================

function initializePassword() {

    const check =
        document.getElementById(
            "showPassword"
        );

    const box =
        document.getElementById(
            "password"
        );

    if (!check || !box) return;

    check.addEventListener(

        "change",

        () => {

            if (check.checked) {

                box.type = "text";

            }

            else {

                box.type = "password";

            }

        }

    );

}


// =====================================
// ログインボタン演出
// =====================================

function initializeButton() {

    const button =
        document.getElementById(
            "loginButton"
        );

    if (!button) return;

    button.addEventListener(

        "mouseenter",

        () => {

            button.style.letterSpacing =
                "2px";

        }

    );

    button.addEventListener(

        "mouseleave",

        () => {

            button.style.letterSpacing =
                "";

        }

    );

}


// =====================================
// Enterキー
// =====================================

function initializeEnterKey() {

    const form =
        document.getElementById(
            "loginForm"
        );

    if (!form) return;

    form.addEventListener(

        "keydown",

        e => {

            if (e.key === "Enter") {

                form.submit();

            }

        }

    );

}


// =====================================
// ページフェードイン
// =====================================

function pageOpening() {

    document.body.style.opacity = "0";

    document.body.style.transition = "1s";

    setTimeout(() => {

        document.body.style.opacity = "1";

    }, 100);

}


// =====================================
// 背景色変化
// =====================================

function animateBackground() {

    const bg =
        document.querySelector(
            ".background-grid"
        );

    if (!bg) return;

    const colors = [

        "#4a0000",

        "#620000",

        "#4f1111",

        "#5c0000"

    ];

    let index = 0;

    setInterval(() => {

        index++;

        if (index >= colors.length) {

            index = 0;

        }

        bg.style.transition = "2s";

        bg.style.background =
            `linear-gradient(
                ${colors[index]},
                #1b1b1b
            )`;

    }, 8000);

}


// =====================================
// 初期化
// =====================================

window.addEventListener(

    "DOMContentLoaded",

    () => {

        pageOpening();

        updateClock();

        setInterval(
            updateClock,
            1000
        );

        animateTitle();

        initializePassword();

        initializeButton();

        initializeEnterKey();

        animateBackground();

    }

);