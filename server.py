from datetime import timedelta  # ★セッション有効期限の設定用に追加
from flask import (
    Flask,
    session,
    jsonify,
    request,
    redirect,
    render_template,
    url_for,
    Response
)

# =========================
# Flask設定
# =========================

app = Flask(__name__)
app.secret_key = "適当な長いランダム文字列"  # 本番ではランダムなバイト列を推奨

# ★ ログイン状態を持続させる設定（30日間）
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=30)

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
        with open(filename, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line == "" or "," not in line:
                    continue
                odai, value = line.split(",", 1)
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

teams = {
    i: {
        "odai": ["", "", ""],
        "weight": [1.0, 1.0, 1.0],
        "score": None
    }
    for i in range(1, LANE_COUNT + 1)
}

score_history = []

# =========================
# 掲示板（ニュース）管理
# =========================

current_news = "現在、お知らせはありません。"

# =========================
# HTMLページ表示ルート
# =========================

@app.route("/")
def login():
    """ログインページを表示"""
    # すでにログイン済みの場合は、そのまま管理画面等へスキップさせる処理
    if session.get("login"):
        return redirect(url_for("administrator"))
    return render_template("login.html")


@app.route("/login", methods=["POST"])
def login_post():
    """ログイン処理"""
    username = request.form.get("username")
    password = request.form.get("password")

    if username == USERNAME and password == PASSWORD:
        # ★ このセッションを永続的（Permanent）にすると宣言
        session.permanent = True
        session["login"] = True
        
        # ログイン成功後、新設した administrator ページへ遷移
        return redirect(url_for("administrator"))

    # 失敗したらリダイレクトページへ
    return redirect(url_for("redirect_page"))


@app.route("/logout")
def logout():
    """【任意使用】ログアウト処理"""
    session.clear()
    return redirect(url_for("login"))


@app.route("/administrator")
def administrator():
    """🛠️ 【新規追加】管理者ページ（要ログイン）"""
    if not session.get("login"):
        return redirect(url_for("login"))
    return render_template("administrator.html")


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

        weights = data.get("weight", [1.0, 1.0, 1.0])
        teams[team]["odai"] = data["odai"]
        teams[team]["weight"] = weights
        current_score = int(data["score"])
        teams[team]["score"] = current_score

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
    load_config()
    return jsonify({
        "odai": OdaiList,
        "value": ValueList
    })


@app.route("/status")
def status():
    return jsonify(teams)


@app.route("/display/data")
def display_data():
    lanes = []
    for i in range(1, LANE_COUNT + 1):
        lanes.append({
            "team": i,
            "odai": teams[i]["odai"],
            "weight": teams[i]["weight"],
            "score": teams[i]["score"]
        })

    ranking = sorted(score_history, reverse=True)[:3]

    return jsonify({
        "lanes": lanes,
        "ranking": ranking
    })


# =========================
# 掲示板（ニュース）API
# =========================

@app.route("/news", methods=["GET"])
def get_news():
    global current_news
    return Response(current_news, mimetype="text/plain")


@app.route("/upload", methods=["POST"])
def upload_news():
    global current_news
    uploaded_text = request.get_data(as_text=True)
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
    global teams
    global score_history
    global current_news

    teams = {
        i: {
            "odai": ["", "", ""],
            "weight": [1.0, 1.0, 1.0],
            "score": None
        }
        for i in range(1, LANE_COUNT + 1)
    }
    score_history.clear()
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
    return "OK"


# =========================
# エラーハンドラー
# =========================

@app.errorhandler(404)
def not_found(e):
    return jsonify({
        "result": "error",
        "message": "Not Found"
    }), 404


@app.errorhandler(500)
def internal_error(e):
    return jsonify({
        "result": "error",
        "message": "Internal Server Error"
    }), 500


# =========================
# メイン処理
# =========================

if __name__ == "__main__":
    app.run(
        host=HOST,
        port=PORT,
        debug=False
    )
