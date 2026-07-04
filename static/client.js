// =====================================
// グローバル変数
// =====================================

let OdaiList = [];
let ValueList = [];

let currentIndexes = [];


// =====================================
// 設定取得
// =====================================

async function updateConfig() {

    try {

        const response = await fetch("/config");

        if (!response.ok) {

            setStatus("設定取得失敗", "red");

            return false;

        }

        const data = await response.json();

        OdaiList = data.odai;
        ValueList = data.value;

        if (OdaiList.length !== ValueList.length) {

            setStatus("設定データ異常", "red");

            return false;

        }

        setStatus("設定同期完了", "green");

        return true;

    }

    catch (e) {

        setStatus("サーバーへ接続できません", "red");

        return false;

    }

}


// =====================================
// 得点送信
// =====================================

async function sendScore(odai, score) {

    const team =
        Number(document.getElementById("team").value);

    try {

        const response = await fetch("/score", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                team: team,

                odai: odai,

                score: score

            })

        });

        if (response.ok) {

            setStatus("送信成功", "green");

        }

        else {

            setStatus("送信失敗", "red");

        }

    }

    catch (e) {

        setStatus("接続できません", "red");

    }

}


// =====================================
// 重複なし3個抽選
// =====================================

function decideN() {

    let result = [];

    while (result.length < 3) {

        const r = Math.floor(
            Math.random() * OdaiList.length
        );

        if (!result.includes(r)) {

            result.push(r);

        }

    }

    result.sort((a, b) => a - b);

    return result;

}


// =====================================
// 状態表示
// =====================================

function setStatus(text, color) {

    const label =
        document.getElementById("status");

    label.textContent = text;

    label.style.color = color;

}


// =====================================
// 開始
// =====================================

async function start() {

    const ok = await updateConfig();

    if (!ok) {
        return;
    }

    currentIndexes = decideN();

    const result = currentIndexes.map(
        i => OdaiList[i]
    );

    // お題表示
    document.getElementById("A").textContent =
        "A：" + result[0];

    document.getElementById("B").textContent =
        "B：" + result[1];

    document.getElementById("C").textContent =
        "C：" + result[2];

    // 入力欄初期化
    document.getElementById("scoreA").value = "";
    document.getElementById("scoreB").value = "";
    document.getElementById("scoreC").value = "";

    document.getElementById("declare").value = "";

    document.getElementById("total").textContent = "";

    setStatus("未送信", "blue");

    // 「倒す本数を宣言」の表示切替
    if (currentIndexes.includes(9)) {

        document.getElementById(
            "declareArea"
        ).style.display = "block";

    }
    else {

        document.getElementById(
            "declareArea"
        ).style.display = "none";

    }

    // お題決定時に0点送信
    await sendScore(result, 0);

}


// =====================================
// ボタン登録
// =====================================

document
    .getElementById("startButton")
    .addEventListener(
        "click",
        start
    );

// =====================================
// 合計計算（前半）
// =====================================

// =====================================
// 合計計算（Tkinter版と完全一致）
// =====================================

// =====================================
// 合計計算（お題ごとの独立計算・修正版）
// =====================================

async function calcSum() {

    if (!Array.isArray(currentIndexes) || currentIndexes.length !== 3) {
        document.getElementById("total").textContent = "先に開始";
        return;
    }

    if (!Array.isArray(ValueList) || ValueList.length === 0) {
        console.error("ValueList異常:", ValueList);
        return;
    }

    const keys = ["A", "B", "C"];
    const scores = [];

    // =========================
    // 入力取得とバリデーション
    // =========================
    for (let i = 0; i < 3; i++) {
        const box = document.getElementById("score" + keys[i]);
        if (!box) {
            scores.push(0);
            continue;
        }

        let rawValue = box.value.trim();
        if (rawValue === "") {
            document.getElementById("total").textContent = "入力エラー";
            return;
        }

        let value = Number(rawValue);

        if (isNaN(value) || !Number.isInteger(value)) {
            document.getElementById("total").textContent = "入力エラー";
            return;
        }

        if (value < 0 || value > 10) {
            document.getElementById("total").textContent = "0～10を入力";
            return;
        }
        scores.push(value);
    }

    let total = 0;

    // =========================
    // 計算本体（お題ごとに独立して計算）
    // =========================
    for (let i = 0; i < 3; i++) {
        const idx = currentIndexes[i];
        if (idx === undefined) continue;

        const score = scores[i];
        let weight = Number(ValueList?.[idx] ?? 0);

        // もしこのお題が「倒す本数を宣言（インデックス 9）」だった場合
        if (idx === 9) {
            const declareBox = document.getElementById("declare");
            
            if (!declareBox || declareBox.value.trim() === "") {
                document.getElementById("total").textContent = "宣言本数を入力";
                return;
            }

            let rawDeclared = declareBox.value.trim();
            let declared = Number(rawDeclared);
            
            if (isNaN(declared) || !Number.isInteger(declared)) {
                document.getElementById("total").textContent = "宣言本数は整数";
                return;
            }

            if (declared < 0 || declared > 10) {
                document.getElementById("total").textContent = "宣言本数は0～10";
                return;
            }

            // 宣言と実際のスコアが一致した場合のみ、倍率（weight）を上書きする
            if (score === declared) {
                if (declared === 0) {
                    // 0本的中の場合、倍率ではなく「得点そのものに+10」する仕様だったため
                    // ここで直接totalに10を足し、倍率(weight)は1のままにします
                    total += 10;
                    weight = 1; 
                } else if (declared >= 1 && declared <= 6) {
                    weight = 3;
                } else if (declared >= 7 && declared <= 9) {
                    weight = 3.5;
                } else if (declared === 10) {
                    weight = 5;
                }
            } else {
                // 宣言が外れた場合は、お題自体の基本倍率（1倍）のまま計算
                weight = 1;
            }
        }

        // 各お題の「得点 × 倍率」を合計していく
        total += score * weight;
    }

    // =========================
    // 最終計算（最後に一律10倍）
    // =========================
    total *= 10;

    // JavaScriptの小数計算誤差を排除して整数化
    total = Math.round(total);

    // =========================
    // 表示・送信
    // =========================
    document.getElementById("total").textContent = "合計：" + total;

    const odai = currentIndexes.map(i => OdaiList[i]);
    await sendScore(odai, total);
    sendResult(total);
}


// =====================================
// 計算ボタン登録
// =====================================

document
    .getElementById("calcButton")
    .addEventListener(
        "click",
        calcSum
    );
//======================================
//QRとか
//======================================
function sendResult(total) {

    fetch("/create_result", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            team: document.getElementById("team").value,
            score: total
        })
    })
    .then(res => res.json())
    .then(data => {

        console.log("create_result:", data);

        if (!data.url) {
            alert("サーバーからURLが返ってきません");
            return;
        }

        const url = window.location.origin + data.url;

        console.log(url);

        const qr = document.getElementById("qr");
        qr.innerHTML = "";

        new QRCode(qr, {
            text: url,
            width: 180,
            height: 180
        });

        alert("結果URL生成:\n" + url);

    })
    .catch(error => {
        console.error(error);
        alert("QR生成に失敗しました");
    });

}
