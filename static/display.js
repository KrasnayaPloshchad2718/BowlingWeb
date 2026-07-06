// =====================================
// グローバル
// =====================================

let laneData = [];
let rankingData = []; // ★ ここに「全期間の各レーンの最高スコア」を保持します
const lastLaneData = {};

// =====================================
// 状態表示
// =====================================

function setStatus(text, color) {
    const label = document.getElementById("status");
    if (!label) return;
    label.textContent = text;
    label.style.color = color;
}

// =====================================
// サーバーから取得 (役割: データの取得と集計・保存)
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

        // ===================================================
        // ★ 全期間のランキング集計ロジック
        // ===================================================
        laneData.forEach(lane => {
            if (lane.team == null || lane.score == null) return;

            // 既にランキングデータ（rankingData）にこのレーンがあるか探す
            const existingRecord = rankingData.find(item => item.team === lane.team);

            if (existingRecord) {
                // 既に記録がある場合、今回のスコアがこれまでの最高スコアを上回っていたら更新
                if (lane.score > existingRecord.score) {
                    existingRecord.score = lane.score;
                }
            } else {
                // 初めて登場したレーンの場合は、そのまま記録として追加
                rankingData.push({
                    team: lane.team,
                    score: lane.score
                });
            }
        });

        // スコアが高い順（降順）に並び替える
        rankingData.sort((a, b) => b.score - a.score);

        // 引数としてデータを引き渡して画面を更新する
        updateDisplay(laneData, rankingData);

        setStatus("更新中", "green");

    }
    catch (e) {
        console.error(e);
        setStatus("接続エラー", "red");
    }
}

//======================================
// 色の重み付け計算
//======================================
function getWeightColor(weight){
    if(weight == null){
        weight = 1;
    }
    if(weight == 0){
        return `hsl(0,0%,50%)`;
    }
    const max = 8;

    let t = Math.log(weight) / Math.log(max);
    t = Math.max(0, Math.min(1, t));

    let hue;
    if(t < 0.75){
        hue = 120 - 120 * (t / 0.75);
    } else {
        hue = 360 - 60 * ((t - 0.75) / 0.25);
    }

    return `hsl(${hue},100%,55%)`;
}

// =====================================
// 画面更新 (役割: 手元にあるデータをもとに描画する)
// =====================================

function updateDisplay(lanes, ranking) {
    try {
        const lanesContainer = document.getElementById("lanes");
        if (!lanesContainer) return;
        
        lanesContainer.innerHTML = "";

        lanes.forEach(lane => {

            // 初回作成
            if (!lastLaneData[lane.team]) {
                lastLaneData[lane.team] = {
                    odai: ["", "", ""],
                    weight: null,
                    score: 0
                };
            }

            // お題更新
            if (
                Array.isArray(lane.odai) &&
                lane.odai.some(text => text !== "")
            ) {
                lastLaneData[lane.team].odai = [...lane.odai];
            }

            // 倍率更新
            if (Array.isArray(lane.weight)) {
                lastLaneData[lane.team].weight = [...lane.weight];
            }

            // 得点更新
            if (lane.score != null) {
                lastLaneData[lane.team].score = lane.score;
            }

            const displayData = lastLaneData[lane.team];

            console.log("displayData", lane.team, displayData);

            const weights = Array.isArray(displayData.weight)
                ? displayData.weight
                : [1, 1, 1];

            // レーン生成
            const laneDiv = document.createElement("div");
            laneDiv.className = "lane";
            laneDiv.innerHTML = `
                <h2>LANE ${lane.team}</h2>
                <div class="odai">
                    <span class="label">お題：</span>
                    <span class="odaiList"></span>
                </div>
                <div class="score">
                    ${displayData.score}
                </div>
            `;

            // お題表示
            const odaiList = laneDiv.querySelector(".odaiList");
            displayData.odai.forEach((text, index) => {
                const span = document.createElement("span");
                span.textContent = text;
                span.style.display = "block";
                span.style.color = getWeightColor(weights[index]);
                odaiList.appendChild(span);
            });

            // 得点色
            const scoreElement = laneDiv.querySelector(".score");
            scoreElement.classList.remove("low", "middle", "high");

            if (displayData.score <= 500) {
                scoreElement.classList.add("low");
            } else if (displayData.score <= 1000) {
                scoreElement.classList.add("middle");
            } else {
                scoreElement.classList.add("high");
            }

            lanesContainer.appendChild(laneDiv);
        });

        // ==========================
        // ランキング更新 (LANE名と最高スコアを表示)
        // ==========================
        const r1 = document.getElementById("scoreRank1");
        const r2 = document.getElementById("scoreRank2");
        const r3 = document.getElementById("scoreRank3");

        if (r1) r1.textContent = ranking[0] ? `1st: ${ranking[0].score}` : "1st: ---";
        if (r2) r2.textContent = ranking[1] ? `2nd: ${ranking[1].score}` : "2nd: ---";
        if (r3) r3.textContent = ranking[2] ? `3rd: ${ranking[2].score}` : "3rd: ---";

    }
    catch (e) {
        console.error(e);
    }
}

// =====================================
// 掲示板（ニュース）データの取得と反映
// =====================================
async function fetchNews() {
    try {
        const response = await fetch("/news");
        if (!response.ok) {
            console.error("ニュースの取得に失敗しました");
            return;
        }
        
        // サーバーから届いた生テキストをそのまま取得
        const text = await response.text();
        
        const newsContent = document.getElementById("news-content");
        if (newsContent) {
            newsContent.textContent = text; // そのまま表示（エスケープ安全）
        }
    } catch (e) {
        console.error("ニュース接続エラー:", e);
    }
}

// =====================================
// 定期更新開始
// =====================================

function startDisplay() {
    fetchScore();
    fetchNews();
    setInterval(() => {
        fetchScore();
        fetchNews();
    }, 3000);
}

// =====================================
// 起動
// =====================================
startDisplay();
    
