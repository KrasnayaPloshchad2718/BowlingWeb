document.addEventListener("DOMContentLoaded", () => {
    const newsInput = document.getElementById("news-input");
    const submitBtn = document.getElementById("submit-news-btn");
    const statusMsg = document.getElementById("status-message");

    // =====================================
    // 1. 過去（現在サーバーにある）のニュースを取得
    // =====================================
    async function loadCurrentNews() {
        showStatus("最新のデータを取得中...", "loading");
        try {
            const response = await fetch("/news");
            if (!response.ok) throw new Error("取得失敗");
            
            // サーバーから返ってきた生テキストをそのまま取得
            const text = await response.text();
            
            // テキストエリアに挿入
            newsInput.value = text;
            showStatus("データの同期が完了しました", "success");
            
            // 2秒後にステータスメッセージを消す
            setTimeout(() => { statusMsg.textContent = ""; }, 2000);
        } catch (error) {
            console.error("News load error:", error);
            showStatus("過去のニュースの取得に失敗しました", "error");
        }
    }

    // =====================================
    // 2. 編集したニュースをサーバーへ送信（上書き）
    // =====================================
    async function uploadNews() {
        const textData = newsInput.value;
        
        showStatus("サーバーを更新中...", "loading");
        submitBtn.disabled = true; // 連打防止

        try {
            const response = await fetch("/upload", {
                method: "POST",
                // ここがポイント：JSONではなく、テキストエリアの文字をそのままBodyに乗せて送る
                body: textData,
                headers: {
                    "Content-Type": "text/plain; charset=utf-8"
                }
            });

            if (!response.ok) throw new Error("送信失敗");

            const result = await response.json();
            if (result.result === "ok") {
                showStatus("💥 掲示板を正常に更新しました！", "success");
            } else {
                showStatus("更新エラーが発生しました", "error");
            }
        } catch (error) {
            console.error("News upload error:", error);
            showStatus("通信エラー：更新に失敗しました", "error");
        } finally {
            submitBtn.disabled = false;
        }
    }

    // ステータス表示の切り替え補助関数
    function showStatus(msg, type) {
        statusMsg.textContent = msg;
        statusMsg.className = `status-message ${type}`;
    }

    // イベントリスナーの登録
    submitBtn.addEventListener("click", uploadNews);

    // 画面を開いたときに自動的に過去のニュースを読み込む
    loadCurrentNews();
});
