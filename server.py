from flask import (
    Flask,
    session,
    jsonify,
    request,
    redirect,
    render_template,
    url_for,
    Response  # プレーンテキスト返却用に追加
)

# =========================
# Flask設定
# =========================

app = Flask(__name__)
app.secret_key = "適当な長いランダム文字列"  # 本番ではランダムなバイト列を推奨

HOST = "0.0.0.0"
PORT = 5000

# =========================
# ログイン情報
# =========================

USERNAME = "admin"
PASSWORD = "1234"

# =========================
# お題管理
# =========================

CONFIG_FILE = "odai.txt"

OdaiList = []
ValueList = []


def load_config(filename=CONFIG_FILE):
    global OdaiList
    global ValueList

    OdaiList.clear()
    ValueList.clear()

    try:
        # odai.txt は UTF-8 で保存してください
        with open(filename, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line == "" or "," not in line:
                    continue
                # 行を「カンマ」で分割
                odai, value = line.split(",", 1) # 1回だけ分割（お題自体にカンマが含まれる場合考慮）
                OdaiList.append(odai.strip())
                ValueList.append(float(value.strip()))
    except FileNotFoundError:
        print(f"警告: {filename} が見つかりません。")
    except Exception as e:
        print(f"Error loading config: {e}")


# 起動時に一度読み込み
load_config()

# =========================
# レーン（チーム）状態管理
# =========================

LANE_COUNT = 4

# 各チームの現在の状態をメモリに保持
teams = {
    i: {
        "odai": ["", "", ""],
        "weight": [1.0, 1.0, 1.0],  # Noneから初期値に変更
        "score": None
    }
    for i in range(1, LANE_COUNT + 1)
}

# スコアの履歴（ランキング用）
score_history = []

# =========================
# 📢 【新規追加】掲示板（ニュース）管理
# =========================
# アップロードされたニュース原稿を保持する変数。
# 新しい内容を受け取り次第、この変数を完全に上書きします。
current_news = "現在、お知らせはありません。"

# =========================
# HTMLページ表示ルート
# =========================

@app.route("/")
def login():
    """ログインページを表示"""
    return render_template("login.html")


@app.route("/login", methods=["POST"])
def login_post():
    """ログイン処理"""
    username = request.form.get("username")
    password = request.form.get("password")

    if username == USERNAME and password == PASSWORD:
        session["login"] = True
        return redirect(url_for("client"))  # ログイン成功

    # 失敗したらリダイレクトページへ（またはログインページへ戻す）
    return redirect(url_for("redirect_page"))


@app.route("/client")
def client():
    """操作用クライアントページ（要ログイン）"""
    if not session.get("login"):
        return redirect(url_for("login"))
    return render_template("client.html")


@app.route("/display")
def display():
    """メイン表示ディスプレイページ"""
    return render_template("display.html")


@app.route("/rules")
def rules():
    """ルール表示ページ"""
    return render_template("rules.html")


@app.route("/redirect")
def redirect_page():
    """ログイン失敗時などのリダイレクト用ページ"""
    return render_template("redirect.html")


# =========================
# 結果発表ページ（共有用画像生成元）
# =========================

@app.route("/results")
def results_page():
    """
    指定されたレーンの結果を表示するページ。
    URLパラメータからデータを受け取ります。
    """
    return render_template(
        "results.html",
        lane=request.args.get("lane", ""),
        score=request.args.get("score", ""),
        odaiA=request.args.get("oa", ""),
        odaiB=request.args.get("ob", ""),
        odaiC=request.args.get("oc", ""),
        scoreA=request.args.get("sa", ""),
        scoreB=request.args.get("sb", ""),
        scoreC=request.args.get("sc", "")
    )

# =========================
# スコア受信API
# =========================

@app.route("/score", methods=["POST"])
def score():
    """クライアントからスコアデータを受信するAPI"""
    try:
        data = request.get_json()
    except Exception:
        data = None

    if data is None:
        return jsonify({"result": "error", "message": "Invalid JSON"}), 400

    try:
        team = int(data["team"])
        if team not in teams:
            return jsonify({"result": "error", "message": "Invalid team ID"}), 400

        # データを更新
        weights = data.get("weight", [1.0, 1.0, 1.0])
        teams[team]["odai"] = data["odai"]
        teams[team]["weight"] = weights
        current_score = int(data["score"])
        teams[team]["score"] = current_score

        # スコアが0より大きい場合のみ、ランキング履歴に追加
        if current_score > 0:
            score_history.append(current_score)

        return jsonify({"result": "ok"})
    except (KeyError, ValueError) as e:
        return jsonify({"result": "error", "message": f"Missing or invalid data: {e}"}), 400

# =========================
# システムAPI
# =========================

@app.route("/config")
def config():
    """現在のお題リストを取得するAPI"""
    load_config()  # リクエストのたびにファイルを再読み込み（デバッグ用。本番では適宜調整）
    return jsonify({
        "odai": OdaiList,
        "value": ValueList
    })


@app.route("/status")
def status():
    """全レーンの現在のステータス（内部用）を取得するAPI"""
    return jsonify(teams)


@app.route("/display/data")
def display_data():
    """ディスプレイ表示用に整理されたデータを取得するAPI（3秒ごとのポーリング用）"""
    lanes = []
    for i in range(1, LANE_COUNT + 1):
        lanes.append({
            "team": i,
            "odai": teams[i]["odai"],
            "weight": teams[i]["weight"],
            "score": teams[i]["score"]
        })

    # スコア履歴を降順にソートして、上位3件を取得
    ranking = sorted(score_history, reverse=True)[:3]

    return jsonify({
        "lanes": lanes,
        "ranking": ranking
    })


# =========================
# 📢 【新規追加】掲示板（ニュース）API
# =========================

@app.route("/news", methods=["GET"])
def get_news():
    """
    保存されているニュース原稿を、そのままプレーンテキストで流すAPI。
    ディスプレイ側は3秒ごとにここへアクセスします。
    """
    global current_news
    # HTMLではなく単なる「テキスト」として返すため、Responseオブジェクトを使用
    # mimetype="text/plain" を指定するのがポイントです。
    return Response(current_news, mimetype="text/plain")


@app.route("/upload", methods=["POST"])
def upload_news():
    """
    新しいニュース原稿を受け取るAPI。
    受け取った内容を保存し、古い内容はすべて上書きします。
    """
    global current_news

    # リクエストのBody全体をテキスト（生データ）として取得します。
    # mimetypeがapplication/json等でなくても、テキストとして取得可能です。
    # charsetを指定することで文字化けを防ぎます（デフォルトutf-8）。
    uploaded_text = request.get_data(as_text=True)

    if not uploaded_text:
        # 何もデータが届かなかった場合は、念のため空白にするなどの処理
        # current_news = "" # 空白に上書きする場合
        # return jsonify({"result": "error", "message": "No data received"}), 400
        pass

    # 受け取ったテキストでグローバル変数を完全に上書き
    current_news = uploaded_text

    print("📢 ニュース原稿が更新されました。")
    return jsonify({
        "result": "ok",
        "message": "News uploaded and overwritten successfully."
    })


# =========================
# システム操作API（リセット）
# =========================

@app.route("/reset", methods=["POST"])
def reset():
    """ゲーム状態を初期化するAPI"""
    global teams
    global score_history
    global current_news

    # 各レーンの状態をリセット
    teams = {
        i: {
            "odai": ["", "", ""],
            "weight": [1.0, 1.0, 1.0],
            "score": None
        }
        for i in range(1, LANE_COUNT + 1)
    }

    # スコア履歴をクリア
    score_history.clear()

    # ★ニュース原稿もリセット（初期メッセージに戻す）
    current_news = "現在、お知らせはありません。"

    print("🔄 システム状態がリセットされました。")
    return jsonify({
        "result": "ok"
    })


# =========================
# システム情報API
# =========================

@app.route("/info")
def info():
    """サーバーの基本情報を取得するAPI"""
    return jsonify({
        "host": HOST,
        "port": PORT,
        "lane_count": LANE_COUNT,
        "odai_count": len(OdaiList)
    })


# =========================
# 動作確認用
# =========================

@app.route("/test")
def test():
    """サーバーが生きているか確認するAPI"""
    return "OK"


# =========================
# エラーハンドラー
# =========================

@app.errorhandler(404)
def not_found(e):
    """404 Not Found エラー時のレスポンス"""
    return jsonify({
        "result": "error",
        "message": "Not Found"
    }), 404


@app.errorhandler(500)
def internal_error(e):
    """500 Internal Server Error 時のレスポンス"""
    return jsonify({
        "result": "error",
        "message": "Internal Server Error"
    }), 500


# =========================
# メイン処理（ローカル起動時）
# =========================

if __name__ == "__main__":
    # HOST, PORT は冒頭で定義されたものを使用
    # debug=False で起動（本番環境の動作に近づけるため）
    app.run(
        host=HOST,
        port=PORT,
        debug=False
    )
