// =====================================
// グローバル
// =====================================

let laneData = [];
let rankingData = []; // ★ 全期間の各レーンの最高スコアを保持
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

        // バックグラウンド復帰時などに不正なデータが来た場合の安全対策
        if (!data || !Array.isArray(data.lanes) || data.lanes.length === 0) {
            return;
        }

        laneData = data.lanes;

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
    const max = 10;

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
        // 引数が不正、または空配列だったら処理をスキップ（上書きバグ防止）
        if (!lanes || lanes.length === 0) return;

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

            // お題更新（有効な文字列が1つでもある場合のみキャッシュを更新）
            if (
                Array.isArray(lane.odai) &&
                lane.odai.some(text => text !== "")
            ) {
                lastLaneData[lane.team].odai = [...lane.odai];
            }

            // 倍率更新（有効な配列データがある場合のみキャッシュを更新）
            if (Array.isArray(lane.weight) && lane.weight.length > 0) {
                lastLaneData[lane.team].weight = [...lane.weight];
            }

            // 得点更新
            if (lane.score != null) {
                lastLaneData[lane.team].score = lane.score;
            }

            const displayData = lastLaneData[lane.team];

            console.log("displayData", lane.team, displayData);

            // キャッシュ（lastLaneData）側も未取得(null)ならデフォルト[1,1,1]にする
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
                
                // 対応するインデックスの重みデータがない場合の安全処理
                const w = weights[index] !== undefined ? weights[index] : 1;
                span.style.color = getWeightColor(w);
                
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
// 掲示板（ニュース）データの取得と反映（★改行区切り＆消失バグ対策版）
// =====================================
async function fetchNews() {
    try {
        const response = await fetch("/news");
        if (!response.ok) {
            console.error("ニュースの取得に失敗しました");
            return;
        }
        
        // サーバーから届いた生テキスト
        const text = await response.text();
        
        // タブ復帰時などのエラーでデータが空、または空白文字だけなら更新せず現在の表示を維持
        if (!text || text.trim() === "") {
            return; 
        }

        const newsContent = document.getElementById("news-content");
        if (newsContent) {
            // 改行コード（Windows/Mac/Linuxすべてに対応）で分割
            const lines = text.split(/\r?\n/);
            
            // 空行を除外した、実際に中身がある行だけの配列を作る
            const validLines = lines.filter(line => line.trim() !== "");
            
            // 有効な行が1行もない場合は画面を書き換えない
            if (validLines.length === 0) return;

            // 新しいデータが正しく存在することを確認してから要素をクリア
            newsContent.innerHTML = "";

            validLines.forEach(line => {
                // 1行ずつの塊（アイテム）としてdivを作成
                const itemDiv = document.createElement("div");
                itemDiv.className = "news-item"; // CSSスタイリング用
                itemDiv.textContent = line;       // エスケープ安全に挿入

                newsContent.appendChild(itemDiv);
            });
        }
    } catch (e) {
        console.error("ニュース接続エラー:", e);
    }
}

// =====================================
// ★ 新機能: 株価データの取得と反映（バグ対策版）
// =====================================
async function fetchStock() {
    try {
        // ※ 実際のサーバー側の仕様に合わせてエンドポイントのURLを変更してください
        const response = await fetch("/api/stock"); 
        if (!response.ok) {
            console.error("株価の取得に失敗しました");
            return;
        }

        const data = await response.json();
        
        // データが破損している、または不完全な場合は処理をスキップ
        if (!data || data.price == null) return;

        const stockContent = document.getElementById("stock-content");
        if (stockContent) {
            // サーバーから { price: 35000, change: "+150" } のようなJSONが返る想定
            stockContent.textContent = `株価: ￥${data.price} (${data.change || '±0'})`;
        }
    } catch (e) {
        console.error("株価接続エラー:", e);
    }
}

// =====================================
// 定期更新開始
// =====================================

function startDisplay() {
    // 初回実行
    fetchScore();
    fetchNews();
    fetchStock();

    // 3秒ごとの定期ループ
    setInterval(() => {
        fetchScore();
        fetchNews();
        fetchStock();
    }, 3000);
}

// =====================================
// 起動
// =====================================
startDisplay();
