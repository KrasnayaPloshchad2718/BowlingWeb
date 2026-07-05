
// =====================================
// グローバル
// =====================================

let laneData = [];
const lastLaneData = {};

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
// サーバーから取得
// =====================================

async function fetchScore() {

    try {

        const response =
            await fetch("/display/data");

        if (!response.ok) {

            setStatus("取得失敗", "red");
            return;

        }

        const data =
            await response.json();
        console.log("display/data =", data);

        laneData = data.lanes;
        rankingData = data.ranking;

        updateDisplay();

        setStatus("更新中", "green");

    }

    catch (e) {

        setStatus("接続エラー", "red");

    }
}

//======================================
function getWeightColor(weight){

    const min = 1;
    const max = 8;

    let t =
        Math.log(weight) /
        Math.log(max);

    t = Math.max(
        0,
        Math.min(1,t)
    );

    let hue;

    if(t < 0.75){

        hue =
            120
            -
            120 *
            (t / 0.75);

    }

    else{

        hue =
            360
            -
            60 *
            (
                (t - 0.75)
                /
                0.25
            );

    }

    return `hsl(${hue},100%,55%)`;

}

// =====================================
// 画面更新
// =====================================

async function updateDisplay() {

    try {

        const response =
            await fetch("/display/data");

        if (!response.ok) {

            return;

        }

        const data =
            await response.json();

        console.log(
            "display/data",
            data
        );

        const lanes =
            document.getElementById("lanes");

        lanes.innerHTML = "";

        data.lanes.forEach(lane => {

            // ==========================
            // お題・倍率・得点をセットで保持
            // ==========================
            
            if (
                Array.isArray(lane.odai) &&
                lane.odai.some(text => text !== "") &&
                Array.isArray(lane.weight)
            ) {
            
                lastLaneData[lane.team] = {
            
                    odai: [...lane.odai],
            
                    weight: [...lane.weight],
            
                    score: lane.score
            
                };
            
            }
            
            const displayData =
                lastLaneData[lane.team] || {
            
                    odai: ["", "", ""],
            
                    weight: [1, 1, 1],
            
                    score: 0
            
                };
            // ==========================
            // レーン生成
            // ==========================

            const laneDiv =
                document.createElement("div");

            laneDiv.className = "lane";

            laneDiv.innerHTML = `

                <h2>LANE ${lane.team}</h2>

                <div class="odai">

                    <span class="label">
                        お題：
                    </span>

                    <span class="odaiList">
                    </span>

                </div>

                <div class="score">
                    ${lane.score}
                </div>

            `;

            // ==========================
            // お題表示
            // ==========================

            const odaiList =
                laneDiv.querySelector(
                    ".odaiList"
                );

            displayData.odai.forEach(
                (text, index) => {

                    const span =
                        document.createElement(
                            "span"
                        );

                    span.textContent =
                        text;

                    span.style.display =
                        "block";

                    span.style.color =
                        getWeightColor(
                            displayData.weight[index]
                        );

                    odaiList.appendChild(
                        span
                    );

                }
            );

            // ==========================
            // 得点色
            // ==========================

            const score =
                laneDiv.querySelector(
                    ".score"
                );

            score.classList.remove(
                "low",
                "middle",
                "high"
            );

            if (lane.score <= 500) {

                score.classList.add(
                    "low"
                );

            }

            else if (
                lane.score <= 1000
            ) {

                score.classList.add(
                    "middle"
                );

            }

            else {

                score.classList.add(
                    "high"
                );

            }

            lanes.appendChild(
                laneDiv
            );

        });

        // ==========================
        // ランキング
        // ==========================

        document.getElementById(
            "scoreRank1"
        ).textContent =
            data.ranking[0] ?? "---";

        document.getElementById(
            "scoreRank2"
        ).textContent =
            data.ranking[1] ?? "---";

        document.getElementById(
            "scoreRank3"
        ).textContent =
            data.ranking[2] ?? "---";

    }

    catch (e) {

        console.error(e);

    }

}
// =====================================
// 定期更新開始
// =====================================

function startDisplay() {

    fetchScore();
    
    setInterval(fetchScore, 3000);

}


// =====================================
// 起動
// =====================================

startDisplay();
