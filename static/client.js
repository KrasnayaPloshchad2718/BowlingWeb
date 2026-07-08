// =====================================
// グローバル変数
// =====================================

let OdaiList = [];
let ValueList = [];

let currentIndexes = [];

// 達成不可能（トグル状態）を管理するフラグ（trueで0点扱い）
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
// 得点送信（エラー修正版）
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
            }) // ← 余計な = { ... } を削除してスッキリ直しました
        });

        if (response.ok) {
            setStatus("送信成功", "green");
        }
        else {
            setStatus("送信失敗", "red");
        }
    }
    catch (e) {
        console.error(e); // ブラウザのコンソールに詳細なエラーを出す
        setStatus("接続できません", "red");
    }
}

// =====================================
// ★追加：独自の出る重みリスト（出現確率）
// =====================================
// お題リスト（OdaiList）のインデックスと対応させて数値を設定します。
// 例: 1つ目のお題の出る重みを「10」、2つ目を「5」、3つ目を「1（レア）」など。
// ※設定されていないインデックス用には、デフォルト値（1.0）が適用される安全設計にしています。
const CustomLotteryWeights = [
    5,  // お題インデックス0 の出現重み（めちゃくちゃ出やすい）
    5,  // お題インデックス1
    5,   // お題インデックス2（普通の出やすさ）
    5,   // お題インデックス3
    5,   // お題インデックス4（レア）
    5,   // お題インデックス5（レア）
    5,
    5,
    5,
    10,//10
    5,
    5,
    5,
    2,
    3,
    1
    // 必要に応じて、登録されているお題の数だけ数値を並べてください
];


// =====================================
// ★修正：独自重みベースの重複なし3個抽選
// =====================================

function decideN() {
    let result = [];
    
    // 現在読み込まれているお題リストのインデックス（0, 1, 2...）を取得
    let availableIndexes = OdaiList.map((_, index) => index);

    // 3個選ぶまでループ
    while (result.length < 3 && availableIndexes.length > 0) {
        
        // 1. 残っている選択肢の「独自重みの総和」を計算
        let totalWeight = 0;
        availableIndexes.forEach(idx => {
            // もし独自の重みリストに設定がなければ、デフォルトの「1」として扱う
            const weight = CustomLotteryWeights[idx] !== undefined ? CustomLotteryWeights[idx] : 1.0;
            totalWeight += weight;
        });

        // 2. 0 から 総和 までのランダムな数（矢）を生成
        let randomTarget = Math.random() * totalWeight;

        // 3. ルーレットを回して、矢が刺さったインデックスを特定
        let currentSum = 0;
        let selectedIndex = availableIndexes[0];

        for (let i = 0; i < availableIndexes.length; i++) {
            const idx = availableIndexes[i];
            const weight = CustomLotteryWeights[idx] !== undefined ? CustomLotteryWeights[idx] : 1.0;
            currentSum += weight;
            
            if (randomTarget <= currentSum) {
                selectedIndex = idx;
                break;
            }
        }

        // 4. 当選したインデックスを結果に追加
        result.push(selectedIndex);

        // 5. 【重複防止】当選したインデックスを候補から除外
        availableIndexes = availableIndexes.filter(idx => idx !== selectedIndex);
    }

    // 最後にインデックスを昇順にソートして返す
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
// 開始（リセットと初期送信）
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

    // 入力欄初期化（すべて空、かつ有効化）
    ["A", "B", "C"].forEach(key => {
        const box = document.getElementById("score" + key);
        box.value = "";
        box.disabled = false;
        
        // 未達成ボタンも完全に有効化してリセット
        isSkipped[key] = false;
        const btn = document.getElementById("IsNotAchieved" + key);
        if (btn) {
            btn.disabled = false;
            btn.style.background = "#00d4ff"; // 通常のサイバーブルー
            btn.style.color = "#111";
        }
    });

    document.getElementById("declare").value = "";
    document.getElementById("total").textContent = "";

    // QR表示エリアをリセット
    document.getElementById("qr").innerHTML = "";

    setStatus("未送信", "blue");

    // 「倒す本数を宣言」の表示切替
    if (currentIndexes.includes(9)) {
        document.getElementById("declareArea").style.display = "block";
    }
    else {
        document.getElementById("declareArea").style.display = "none";
    }

    // 最初はお題決定時点の「0点」を送信
    const weights = currentIndexes.map(i => Number(ValueList[i]));
    await sendScore(result, 0, weights);
}


// =====================================
// QR生成
// =====================================

function generateQR(total) {
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
    qr.innerHTML = ""; // 前のQRをクリア

    new QRCode(qr, {
        text: url,
        width: 180,
        height: 180
    });

    console.log("QR Generated:", url);
}


// =====================================
// ★修正：リアルタイム自動計算ロジック（0点ロック対応版）
// =====================================

async function autoCalculate() {
    // そもそもお題が選ばれていなければスキップ
    if (!Array.isArray(currentIndexes) || currentIndexes.length !== 3) {
        return;
    }

    const keys = ["A", "B", "C"];
    let currentTotal = 0;
    let filledCount = 0; // 有効な入力の数をカウント
    const calculatedWeights = []; // リアルタイム計算された倍率を格納するリスト

    // 1項目ずつ検証・計算
    for (let i = 0; i < 3; i++) {
        const key = keys[i];
        const idx = currentIndexes[i];
        const box = document.getElementById("score" + key);
        
        let score = 0;
        let weight = Number(ValueList?.[idx] ?? 0);

        const rawValue = box.value.trim();
        
        // 入力欄がまだ空（null）なら、初期設定の倍率を仮格納して飛ばす
        if (rawValue === "") {
            calculatedWeights.push(weight);
            continue;
        }

        const value = Number(rawValue);
        // 0～10の整数チェック
        if (isNaN(value) || !Number.isInteger(value) || value < 0 || value > 10) {
            document.getElementById("total").textContent = "入力エラー(0～10)";
            return;
        }

        score = value;
        filledCount++; // 有効な数値（ボタンによる0含む）が入っているのでカウント

        // 特別お題「倒す本数を宣言(インデックス9)」の個別処理
        if (idx === 9) {
            const declareBox = document.getElementById("declare");
            const rawDeclared = declareBox.value.trim();

            if (rawDeclared === "") {
                // 宣言本数が未入力なら、初期倍率を仮格納して保留
                calculatedWeights.push(weight);
                continue;
            }

            const declared = Number(rawDeclared);
            if (isNaN(declared) || !Number.isInteger(declared) || declared < 0 || declared > 10) {
                document.getElementById("total").textContent = "宣言エラー(0～10)";
                return;
            }
            
            // 宣言通りのスコアならピン数に応じた特別倍率に昇格
            if (score === declared) {
                if (declared === 0) {
                    currentTotal += 10; // 0本宣言成功のボーナス
                    weight = 1;
                } else if (declared >= 1 && declared <= 6) {
                    weight = 3;
                } else if (declared >= 7 && declared <= 9) {
                    weight = 3.5;
                } else if (declared === 10) {
                    weight = 5;
                }
            } else {
                weight = 1; // 宣言失敗時は等倍
            }
        }

        // 決定した倍率をリストに格納
        calculatedWeights.push(weight);

        // 「個別スコア × 倍率」を途中合計に足す
        currentTotal += score * weight;
    }

    // 最後に一律10倍
    currentTotal *= 10;
    currentTotal = Math.round(currentTotal);

    // 画面の「合計：XX」表示を即座に更新
    document.getElementById("total").textContent = "現在の合計：" + currentTotal;

    // リアルタイムに計算した倍率リスト（calculatedWeights）を送信する
    const odai = currentIndexes.map(index => OdaiList[index]);
    await sendScore(odai, currentTotal, calculatedWeights);

    // 3つの入力欄がすべて埋まったら自動でQRコードを作成
    if (filledCount === 3) {
        // 特別お題(9)がある場合は、宣言欄も埋まっているか最終チェック
        if (currentIndexes.includes(9)) {
            const decVal = document.getElementById("declare").value.trim();
            if (decVal === "") return; // 宣言がまだならQRは出さない
        }
        generateQR(currentTotal);
        document.getElementById("total").textContent = "確定合計：" + currentTotal;
    } else {
        // まだ埋まりきっていない場合は古いQRコードを隠す
        document.getElementById("qr").innerHTML = "";
    }
}

// =====================================
// 0点ロックボタンのトグルイベント
// =====================================

function toggleAchieved(key) {
    const btn = document.getElementById("IsNotAchieved" + key);
    const box = document.getElementById("score" + key);
    if (!btn) return;

    // フラグを反転
    isSkipped[key] = !isSkipped[key];

    if (isSkipped[key]) {
        btn.style.background = "#444";  // ダークグレー
        btn.style.color = "#888";
        box.value = "0";               // 強制的に「0」にする
        box.disabled = true;           // 入力欄をロック
    } else {
        btn.style.background = "#00d4ff"; // サイバーブルーに戻す
        btn.style.color = "#111";
        box.value = "";                // 空欄に戻す
        box.disabled = false;          // ロック解除
    }

    // 状態が変わったら自動的にリアルタイム計算を走らせる
    autoCalculate();
}
// =====================================
// 未達成ボタンのトグルイベント
// =====================================

function toggleAchieved(key) {
    const btn = document.getElementById("IsNotAchieved" + key);
    const box = document.getElementById("score" + key);
    if (!btn) return;

    isSkipped[key] = !isSkipped[key];

    if (isSkipped[key]) {
        btn.style.background = "#444"; // ダークグレー
        btn.style.color = "#888";
        box.value = "0";             // 視覚的にも0にする
        box.disabled = true;         // 入力欄をロック
    } else {
        btn.style.background = "#00d4ff"; // サイバーブルーに戻す
        btn.style.color = "#111";
        box.value = "";              // 空欄に戻す
        box.disabled = false;        // ロック解除
    }

    // トグルが切り替わったら自動的にリアルタイム計算を走らせる
    autoCalculate();
}


// =====================================
// イベントリスナーの登録
// =====================================

// 開始ボタン
document.getElementById("startButton").addEventListener("click", start);

// 3つの入力欄（scoreA, scoreB, scoreC）に入力されたら自動計算
["A", "B", "C"].forEach(key => {
    document.getElementById("score" + key).addEventListener("input", autoCalculate);
    
    // 未達成ボタンのイベント登録
    const btn = document.getElementById("IsNotAchieved" + key);
    if (btn) {
        btn.addEventListener("click", () => toggleAchieved(key));
    }
});

// 宣言本数の入力欄に入力されたら自動計算
document.getElementById("declare").addEventListener("input", autoCalculate);

// （HTMLから不要になったボタン用コードの残骸があれば削除）
const oldCalcButton = document.getElementById("calcButton");
if (oldCalcButton) {
    oldCalcButton.style.display = "none"; // HTMLに残っていても画面上で非表示にします
}
