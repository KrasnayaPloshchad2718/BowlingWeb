// =====================================
// グローバル
// =====================================

let laneData = [];
let rankingData = []; // ★ ここが未定義、または正しく使われていませんでした
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
// サーバーから取得 (役割: データの取得と保存)
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

        // 手元のグローバル変数にしっかり保存
        laneData = data.lanes;
        rankingData = data.ranking;

        // ★ 引数として手元のデータを引き渡して画面を更新する
        updateDisplay(laneData, rankingData);

        setStatus("更新中", "green");

    }

    catch (e) {
        console.error(e);
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
// 画面更新 (役割: 手元にあるデータをもとに描画するだけに変更)
// =====================================

function updateDisplay(lanes, ranking) { // ★ 引数を受け取るようにし、async を外しました

    try {
        // ★ ここで再度 fetch していた不要な処理を丸ごと削除しました！

        const lanesContainer =
            document.getElementById("lanes");

        lanesContainer.innerHTML = "";

        lanes.forEach(lane => {

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

            lanesContainer.appendChild(
                laneDiv
            );

        });

        // ==========================
        // ランキング (引数の ranking を使うように変更)
        // ==========================

        document.getElementById("scoreRank1").textContent =
            "1st:" + (ranking[0] ?? "---");

        document.getElementById("scoreRank2").textContent =
            "2nd:" + (ranking[1] ?? "---");

        document.getElementById("scoreRank3").textContent =
            "3rd:" + (ranking[2] ?? "---");

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
