// =====================================
// グローバル
// =====================================

let laneData = [];
let rankingData = [];
const lastLaneData = {};

// =====================================
// ステータス表示（あれば更新）
// =====================================

function setStatus(text, color) {
    const label = document.getElementById("status");
    if (!label) return;

    label.textContent = text;
    label.style.color = color;
}

// =====================================
// 難易度バー更新
// =====================================

function setDifficulty(value) {
    const fill = document.querySelector(".fill");
    if (!fill) return;

    const v = Math.max(0, Math.min(100, value));
    fill.style.width = v + "%";
}

// =====================================
// サーバー取得
// =====================================

async function fetchScore() {
    try {
        const response = await fetch("/display/data");

        if (!response.ok) {
            setStatus("取得失敗", "red");
            return;
        }

        const data = await response.json();
        console.log("display/data =", data);

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

// =====================================
// 色計算
// =====================================

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

// =====================================
// 画面更新（完全DOM対応版）
// =====================================

function updateDisplay(lanes, ranking) {
    try {
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

            if (Array.isArray(lane.odai) && lane.odai.some(t => t !== "")) {
                lastLaneData[lane.team].odai = [...lane.odai];
            }

            if (Array.isArray(lane.weight)) {
                lastLaneData[lane.team].weight = [...lane.weight];
            }

            if (lane.score != null) {
                lastLaneData[lane.team].score = lane.score;
            }

            const displayData = lastLaneData[lane.team];

            const weights = Array.isArray(displayData.weight)
                ? displayData.weight
                : [1, 1, 1];

            // ==========================
            // レーンDOM生成（今のCSS用）
            // ==========================

            const row = document.createElement("div");
            row.className = "lane-row";

            const laneDiv = document.createElement("div");
            laneDiv.className = "lane";

            laneDiv.innerHTML = `
                <p>LANE ${lane.team}</p>
            `;

            // クリック処理（スコア加算）
            laneDiv.addEventListener("click", () => {
                laneDiv.style.background = "#555";
                setTimeout(() => {
                    laneDiv.style.background = "#333";
                }, 150);

                displayData.score += Math.floor(Math.random() * 100);
                updateDisplay(lanes, ranking);
            });

            // 右情報（レーン1だけ表示）
            if (lane.team === 1) {
                const info = document.createElement("aside");
                info.className = "lane-info";

                info.innerHTML = `
                    <div class="panel">
                        <h3>レーン1情報</h3>
                        <p>スコア: ${displayData.score}</p>
                    </div>
                `;

                row.appendChild(laneDiv);
                row.appendChild(info);
            } else {
                row.appendChild(laneDiv);
            }

            lanesContainer.appendChild(row);
        });

        // ==========================
        // ランキング（今のHTML対応）
        // ==========================

        const ol = document.querySelector(".ranking ol");
        if (ol) {
            ol.innerHTML = "";

            ranking.slice(0, 3).forEach((r, i) => {
                const li = document.createElement("li");
                li.textContent = `${i + 1}位 - ${r}`;
                ol.appendChild(li);
            });
        }

    }
    catch (e) {
        console.error(e);
    }
}

// =====================================
// 掲示板
// =====================================

function postMessage(text) {
    const board = document.querySelector(".board-content");
    if (!board) return;

    const p = document.createElement("p");
    p.textContent = text;
    board.appendChild(p);
}

// =====================================
// 起動
// =====================================

function startDisplay() {
    fetchScore();
    setInterval(fetchScore, 3000);
}

startDisplay();
