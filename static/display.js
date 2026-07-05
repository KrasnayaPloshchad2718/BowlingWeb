let laneData = [];
let rankingData = [];
const lastLaneData = {};

// ==============================
// ステータス表示
// ==============================

function setStatus(text, color) {
    const label = document.getElementById("status");
    if (!label) return;

    label.textContent = text;
    label.style.color = color;
}

// ==============================
// 難易度バー（既存HTMLの.fill前提）
// ==============================

function setDifficulty(value) {
    const fill = document.querySelector(".fill");
    if (!fill) return;

    const v = Math.max(0, Math.min(100, value));
    fill.style.width = v + "%";
}

// ==============================
// サーバー取得
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

        setStatus("更新中", "green");
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
// 画面更新（HTML完全準拠）
// ==============================

function updateDisplay(lanes, ranking) {

    const lanesContainer = document.querySelector(".lanes");
    if (!lanesContainer) return;

    lanesContainer.innerHTML = "";

    lanes.forEach(lane => {

        if (!lastLaneData[lane.team]) {
            lastLaneData[lane.team] = {
                odai: ["", "", ""],
                weight: null,
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

        // ======================
        // HTML構造そのまま再現
        // ======================

        const row = document.createElement("div");
        row.className = "lane-row";

        const laneDiv = document.createElement("div");
        laneDiv.className = "lane";

        laneDiv.innerHTML = `<p>LANE ${lane.team}</p>`;

        // レーンクリック処理（軽く維持）
        laneDiv.addEventListener("click", () => {
            last.score += 10;
            setStatus(`Lane ${lane.team} +10`, "white");
            updateDisplay(lanes, ranking);
        });

        // レーン1右パネル（HTML仕様通り）
        if (lane.team === 1) {

            const info = document.createElement("aside");
            info.className = "lane-info";

            info.innerHTML = `
                <div class="panel">
                    <h3>レーン1情報</h3>
                    <p>スコア：${last.score}</p>
                </div>
            `;

            row.appendChild(laneDiv);
            row.appendChild(info);

        } else {
            row.appendChild(laneDiv);
        }

        lanesContainer.appendChild(row);
    });

    // ======================
    // ランキング（HTML準拠）
    // ======================

    const ol = document.querySelector(".ranking ol");
    if (ol) {
        ol.innerHTML = "";

        ranking.slice(0, 3).forEach((r, i) => {
            const li = document.createElement("li");
            li.textContent = `${i + 1}位 ${r}`;
            ol.appendChild(li);
        });
    }
}

// ==============================
// 掲示板（そのまま使用）
// ==============================

function postMessage(text) {
    const board = document.querySelector(".board-content");
    if (!board) return;

    const p = document.createElement("p");
    p.textContent = text;
    board.appendChild(p);
}

// ==============================
// 起動
// ==============================

function startDisplay() {
    fetchScore();
    setInterval(fetchScore, 3000);
}

startDisplay();
