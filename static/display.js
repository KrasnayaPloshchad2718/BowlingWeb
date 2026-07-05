let laneData = [];
let rankingData = [];
const lastLaneData = {};

// ==============================
// ステータス（存在すれば更新）
// ==============================

function setStatus(text, color) {
    const el = document.getElementById("status");
    if (!el) return;

    el.textContent = text;
    el.style.color = color;
}

// ==============================
// データ取得
// ==============================

async function fetchScore() {
    try {
        const res = await fetch("/display/data");

        if (!res.ok) {
            setStatus("取得失敗", "red");
            return;
        }

        const data = await res.json();

        laneData = data.lanes || [];
        rankingData = data.ranking || [];

        updateDisplay(laneData, rankingData);

        setStatus("更新中", "#4cff4c");
    }
    catch (e) {
        console.error(e);
        setStatus("接続エラー", "red");
    }
}

// ==============================
// 色計算（そのまま維持）
// ==============================

function getWeightColor(weight) {
    if (weight == null) weight = 1;

    const max = 8;

    let t = Math.log(weight) / Math.log(max);
    t = Math.max(0, Math.min(1, t));

    let hue;

    if (t < 0.75) {
        hue = 120 - 120 * (t / 0.75);
    } else {
        hue = 360 - 60 * ((t - 0.75) / 0.25);
    }

    return `hsl(${hue},100%,55%)`;
}

// ==============================
// 描画更新（HTML完全一致版）
// ==============================

function updateDisplay(lanes, ranking) {

    const container = document.getElementById("lanes");
    if (!container) return;

    container.innerHTML = "";

    lanes.forEach(lane => {

        // ----------------------
        // 初期化
        // ----------------------
        if (!lastLaneData[lane.team]) {
            lastLaneData[lane.team] = {
                odai: ["", "", ""],
                weight: [1, 1, 1],
                score: 0
            };
        }

        const last = lastLaneData[lane.team];

        if (Array.isArray(lane.odai) && lane.odai.some(v => v !== "")) {
            last.odai = [...lane.odai];
        }

        if (Array.isArray(lane.weight)) {
            last.weight = [...lane.weight];
        }

        if (lane.score != null) {
            last.score = lane.score;
        }

        const weights = Array.isArray(last.weight)
            ? last.weight
            : [1, 1, 1];

        // =========================
        // lane本体（HTML準拠）
        // =========================

        const laneDiv = document.createElement("div");
        laneDiv.className = "lane";

        // 左側
        const left = document.createElement("div");
        left.className = "lane-left";

        left.innerHTML = `
            <h2>LANE ${lane.team}</h2>

            <div class="odai">
                <span class="label">お題：</span>
                <div class="odaiList"></div>
            </div>

            <div class="scoreBox">
                <div class="scoreLabel">スコア：</div>
                <div class="score">${last.score}</div>
            </div>
        `;

        // お題描画
        const odaiList = left.querySelector(".odaiList");

        last.odai.forEach((text, i) => {
            const span = document.createElement("span");
            span.textContent = text;
            span.style.color = getWeightColor(weights[i]);
            odaiList.appendChild(span);
        });

        // スコア色付け
        const scoreEl = left.querySelector(".score");

        scoreEl.classList.remove("low", "middle", "high");

        if (last.score <= 500) {
            scoreEl.classList.add("low");
        } else if (last.score <= 1000) {
            scoreEl.classList.add("middle");
        } else {
            scoreEl.classList.add("high");
        }

        // 右側（難易度バー：1本だけ表示）
        const right = document.createElement("div");
        right.className = "lane-right";

        right.innerHTML = `
            <div class="difficulty">
                <div class="left">易</div>
                <div class="right">難</div>
            </div>
        `;

        // laneクリック（軽いスコア変化）
        laneDiv.addEventListener("click", () => {
            last.score += 10;
            updateDisplay(lanes, ranking);
        });

        // 組み立て
        laneDiv.appendChild(left);
        laneDiv.appendChild(right);

        container.appendChild(laneDiv);
    });

    // =========================
    // ランキング（完全対応）
    // =========================

    const r1 = document.getElementById("scoreRank1");
    const r2 = document.getElementById("scoreRank2");
    const r3 = document.getElementById("scoreRank3");

    if (r1) r1.textContent = ranking[0] ?? "---";
    if (r2) r2.textContent = ranking[1] ?? "---";
    if (r3) r3.textContent = ranking[2] ?? "---";
}

// ==============================
// 起動
// ==============================

function startDisplay() {
    fetchScore();
    setInterval(fetchScore, 3000);
}

startDisplay();
