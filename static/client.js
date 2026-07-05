// =====================================
// グローバル変数
// =====================================

let OdaiList = [];
let ValueList = [];

let currentIndexes = [];

// ★追加: 達成不可能（トグル状態）を管理するフラグ（trueで0点扱い）
let isSkipped = { A: false, B: false, C: false };


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

async function sendScore(odai, score, weight = null) {
    const team = Number(document.getElementById("team").value);
    try {
        const response = await fetch("/score", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                team: team,
                odai: odai,
                weight: weight,
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
        const r = Math.floor(Math.random() * OdaiList.length);
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
    const label = document.getElementById("status");
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
    const result = currentIndexes.map(i => OdaiList[i]);

    // お題表示
    document.getElementById("A").textContent = "A：" + result[0];
    document.getElementById("B").textContent = "B：" + result[1];
    document.getElementById("C").textContent = "C：" + result[2];

    // 入力欄初期化
    document.getElementById("scoreA").value = "";
    document.getElementById("scoreB").value = "";
    document.getElementById("scoreC").value = "";
    
    // 入力欄のdisabled状態も解除（★追加）
    document.getElementById("scoreA").disabled = false;
    document.getElementById("scoreB").disabled = false;
    document.getElementById("scoreC").disabled = false;

    document.getElementById("declare").value = "";
    document.getElementById("total").textContent = "";

    setStatus("未送信", "blue");

    // ★追加: 達成不可能トグルの状態を初期化（通常状態に戻す）
    const keys = ["A", "B", "C"];
    keys.forEach(key => {
        isSkipped[key] = false;
        const btn = document.getElementById("IsNotAchieved" + key);
        if (btn) {
            btn.style.background = "#00d4ff"; // 元のサイバーブルー
            btn.style.color = "#111";
            btn.textContent = "未達成"; // テキスト表記（お好みで変更してください）
        }
    });

    // 「倒す本数を宣言」の表示切替
    if (currentIndexes.includes(9)) {
        document.getElementById("declareArea").style.display = "block";
    }
    else {
        document.getElementById("declareArea").style.display = "none";
    }

    const weights = currentIndexes.map(i => Number(ValueList[i]));

    // お題決定時に0点送信
    await sendScore(result, 0, weights);

    // ★ 計算ボタンを有効化する
    document.getElementById("calcButton").disabled = false;
}


// =====================================
// QR生成（修正版：odaiは番号のみ）
// =====================================

function sendResult(total) {
    const lane = document.getElementById("team").value;
    const odaiIndexes = currentIndexes.join(",");

    const scoreA = document.getElementById("scoreA").value;
    const scoreB = document.getElementById("scoreB").value;
    const scoreC = document.getElementById("scoreC").value;

    const params = new URLSearchParams({
        lane: lane,
        score: total,
        odai: odaiIndexes,
        sa: scoreA,
        sb: scoreB,
        sc: scoreC
    });

    const url = window.location.origin + "/results?" + params.toString();
    const qr = document.getElementById("qr");
    qr.innerHTML = "";

    new QRCode(qr, {
        text: url,
        width: 180,
        height: 180
    });

    console.log("QR URL:", url);
}


// =====================================
// 合計計算（お題ごとの独立計算・修正版）
// =====================================

async function calcSum() {
    const usedWeights = [];
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
        const key = keys[i];
        const box = document.getElementById("score" + key);
        if (!box) {
            scores.push(0);
            continue;
        }

        // ★修正: 達成不可能（有効時）は入力を無視して強制的に0点として扱う
        if (isSkipped[key]) {
            scores.push(0);
            box.value = "0"; // 視覚的にも0にする
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
        // ★修正: ただし、インデックス9が「達成不可能」になっていない場合のみ宣言チェックを行う
        if (idx === 9 && !isSkipped[keys[i]]) {
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
                weight = 1;
            }
        } else if (idx === 9 && isSkipped[keys[i]]) {
            // インデックス9でかつ達成不可能が押されている場合は、一律で掛け算も0（スコア0 * 倍率1）
            weight = 1;
        }

        // 各お題の「得点 × 倍率」を合計していく
        total += score * weight;
    }

    // =========================
    // 最終計算（最後に一律10倍）
    // =========================
    total *= 10;
    total = Math.round(total);

    // ★ 計算ボタンと達成不可能ボタンを一律無効化する（★修正）
    document.getElementById("calcButton").disabled = true;
    keys.forEach(key => {
        const btn = document.getElementById("IsNotAchieved" + key);
        if (btn) btn.disabled = true;
    });

    // =========================
    // 表示・送信
    // =========================
    document.getElementById("total").textContent = "合計：" + total;

    const odai = currentIndexes.map(i => OdaiList[i]);
    const weights = currentIndexes.map(i => Number(ValueList[i]));
    
    await sendScore(odai, total, weights);
    sendResult(total);
}


// =====================================
// ★追加: 達成不可能ボタンのトグルイベント登録
// =====================================
function toggleAchieved(key) {
    const btn = document.getElementById("IsNotAchieved" + key);
    const box = document.getElementById("score" + key);
    if (!btn) return;

    // トグル状態を反転
    isSkipped[key] = !isSkipped[key];

    if (isSkipped[key]) {
        // 【有効（グレー）状態】
        btn.style.background = "#444"; // ダークグレー
        btn.style.color = "#888";
        box.value = "0";             // 入力を0にする
        box.disabled = true;         // 入力不可にする
    } else {
        // 【無効（通常ボタン）状態】
        btn.style.background = "#00d4ff"; // サイバーブルーに戻す
        btn.style.color = "#111";
        box.value = "";              // 入力を空にして再入力を促す
        box.disabled = false;        // 入力可能にする
    }
}

// A, B, Cそれぞれのボタンにイベントを設定
["A", "B", "C"].forEach(key => {
    const btn = document.getElementById("IsNotAchieved" + key);
    if (btn) {
        btn.addEventListener("click", () => toggleAchieved(key));
    }
});


// =====================================
// ボタン登録と初期状態設定
// =====================================

document.getElementById("startButton").addEventListener("click", start);

const calcButton = document.getElementById("calcButton");
calcButton.addEventListener("click", calcSum);

// ★ 画面起動時はまだ開始されていないので、計算ボタンをはじめから無効化しておく
calcButton.disabled = true;
