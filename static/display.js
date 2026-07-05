// =====================================
// グローバル
// =====================================
let laneData = [];
let rankingData = [];
const lastLaneData = {};

// =====================================
// 状態表示（HTMLに存在しない場合のエラー防止処理付き）
// =====================================
function setStatus(text, color) {
    const label = document.getElementById("status");
    if (!label) return; // HTMLにstatus要素がなくてもエラーにしない
    label.textContent = text;
    label.style.color = color;
}

// =====================================
// サーバーから取得 (役割: データの取得と保存)
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

        // 手元のグローバル変数に保存
        laneData = data.lanes;
        rankingData = data.ranking;

        // 画面を更新する
        updateDisplay(laneData, rankingData, data.board); // ★掲示板データ(data.board)もあれば受け取れるように拡張

        setStatus("更新中", "green");
    }
    catch (e) {
        console.error(e);
        setStatus("接続エラー", "red");
    }
}

//======================================
// 倍率に応じたテキストカラー計算
//======================================
function getWeightColor(weight) {
    if (weight == null) {
        weight = 1;
    }
    const min = 1;
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
// 画面更新 (HTML構造に最適化)
// =====================================
function updateDisplay(lanes, ranking, boardText) {
    try {
        // --------------------------
        // 1. レーン情報の描画
        // --------------------------
        const lanesContainer = document.getElementById("lanes");
        if (lanesContainer) {
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
                if (Array.isArray(lane.odai) && lane.odai.some(text => text !== "")) {
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
                const weights = Array.isArray(displayData.weight) ? displayData.weight : [1, 1, 1];

                // 先ほどの新CSS（flexレイアウト）に適したHTML構造を生成
                const laneDiv = document.createElement("div");
                laneDiv.className = "lane";

                laneDiv.innerHTML = `
                    <div class="lane-left">
                        <h2>LANE ${lane.team}</h2>
                        <div class="odai">
                            <span class="label">お題：</span>
                            <span class="odaiList"></span>
                        </div>
                        <div class="score">
                            スコア：${displayData.score}
                        </div>
                    </div>
                    <div class="lane-right">
                        <!-- 必要に応じて右側に設置するインジケータ等用のスペース -->
                    </div>
                `;

                // お題の個別追加（色反映）
                const odaiList = laneDiv.querySelector(".odaiList");
                displayData.odai.forEach((text, index) => {
                    const span = document.createElement("span");
                    span.textContent = text;
                    span.style.display = "block";
                    span.style.color = getWeightColor(weights[index]);
                    odaiList.appendChild(span);
                });

                // スコアに応じた色クラスの付与（low / middle / high）
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
        }

        // --------------------------
        // 2. 掲示板（独立エリア）の更新
        // --------------------------
        const boardContent = document.getElementById("boardContent");
        if (boardContent && boardText !== undefined) {
            // APIからテキストが届いている場合はそれを表示、ない場合はデフォルトメッセージ
            boardContent.textContent = boardText || "現在、お知らせはありません。";
        }

        // --------------------------
        // 3. ランキング（フッター）の更新
        // --------------------------
        const r1 = document.getElementById("scoreRank1");
        const r2 = document.getElementById("scoreRank2");
        const r3 = document.getElementById("scoreRank3");

        if (r1) r1.textContent = "1st: " + (ranking[0] ?? "---");
        if (r2) r2.textContent = "2nd: " + (ranking[1] ?? "---");
        if (r3) r3.textContent = "3rd: " + (ranking[2] ?? "---");

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
