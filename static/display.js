
// =====================================
// グローバル
// =====================================

let laneData = [];


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

        laneData = data.lanes;
        rankingData = data.ranking;

        updateDisplay();

        setStatus("更新中", "green");

    }

    catch (e) {

        setStatus("接続エラー", "red");

    }
}

// =====================================
// 画面更新
// =====================================

function updateDisplay() {

    // -------------------------
    // 各レーン表示
    // -------------------------

    for (let i = 0; i < 4; i++) {

        const lane = laneData[i];

        if (!lane) continue;

        const laneDiv =
            document.getElementById("lane" + (i + 1));

        // チーム名
        laneDiv.querySelector(".team").textContent =
            "チーム：" + lane.team;

        // お題
        laneDiv.querySelector(".odai").innerHTML =
            `<span class="label">お題：</span>
             <span class="odaiList">${lane.odai.join("<br>")}</span>`;

        // スコア
        const scoreDiv =
            laneDiv.querySelector(".score");

        scoreDiv.textContent =
            "スコア：" + lane.score;

        // 色クラスをリセット
        scoreDiv.classList.remove(
            "low",
            "middle",
            "high"
        );

        // スコアによって色を変更
        if (lane.score <= 500) {

            scoreDiv.classList.add("low");

        }
        else if (lane.score <= 1000) {

            scoreDiv.classList.add("middle");

        }
        else {

            scoreDiv.classList.add("high");

        }

    }

    // -------------------------
    // ランキング表示
    // -------------------------

    for (let i = 0; i < 3; i++) {

        const rankDiv =
            document.getElementById(
                "scoreRank" + (i + 1)
            );

        if (rankingData[i] !== undefined) {

            rankDiv.textContent =
                `${i + 1}位：${rankingData[i]}点`;

        }
        else {

            rankDiv.textContent =
                `${i + 1}位：`;

        }

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