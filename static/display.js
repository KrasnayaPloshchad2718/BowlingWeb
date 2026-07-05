
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
    if(weight == null){
        weight = 1;
    }
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

        console.log("display/data =", data);

        const lanes =
            document.getElementById("lanes");

        lanes.innerHTML = "";

        data.lanes.forEach(lane => {

            // ==========================
            // 初回作成
            // ==========================

            if (!lastLaneData[lane.team]) {

                lastLaneData[lane.team] = {

                    odai: ["", "", ""],
                    weight: null,
                    score: 0

                };

            }

            // ==========================
            // お題更新
            // ==========================

            if (
                Array.isArray(lane.odai) &&
                lane.odai.some(text => text !== "")
            ) {

                lastLaneData[lane.team].odai =
                    [...lane.odai];

            }

            // ==========================
            // 倍率更新
            // ==========================

            if (
                Array.isArray(lane.weight)
            ) {

                lastLaneData[lane.team].weight =
                    [...lane.weight];

            }

            // ==========================
            // 得点更新
            // ==========================

            if (
                lane.score != null
            ) {

                lastLaneData[lane.team].score =
                    lane.score;

            }

            const displayData =
                lastLaneData[lane.team];

            console.log(
                "displayData",
                lane.team,
                displayData
            );

            const weights =
                Array.isArray(displayData.weight)
                ? displayData.weight
                : [1, 1, 1];

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

                    <span class="odaiList"></span>

                </div>

                <div class="score">
                    スコア：${displayData.score}
                </div>

            `;

            // ==========================
            // お題表示
            // ==========================

            const odaiList =
                laneDiv.querySelector(".odaiList");

            displayData.odai.forEach(
                (text, index) => {

                    const span =
                        document.createElement("span");

                    span.textContent =
                        text;

                    span.style.display =
                        "block";

                    span.style.color =
                        getWeightColor(
                            weights[index]
                        );

                    odaiList.appendChild(span);

                }
            );

            // ==========================
            // 得点色
            // ==========================

            const score =
                laneDiv.querySelector(".score");

            score.classList.remove(
                "low",
                "middle",
                "high"
            );

            if (displayData.score <= 500) {

                score.classList.add("low");

            }

            else if (
                displayData.score <= 1000
            ) {

                score.classList.add("middle");

            }

            else {

                score.classList.add("high");

            }

            lanes.appendChild(
                laneDiv
            );

        });

        // ==========================
        // ランキング
        // ==========================

        document.getElementById("scoreRank1").textContent =
            "1st:" + (data.ranking[0] ?? "---");

        document.getElementById("scoreRank2").textContent =
            "2nd:" + (data.ranking[1] ?? "---");

        document.getElementById("scoreRank3").textContent =
            "3rd:" + (data.ranking[2] ?? "---");

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
