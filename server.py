from flask import Flask, session, jsonify, request, redirect, render_template, url_for
import uuid

# =========================
# Flask設定
# =========================

app = Flask(__name__)
app.secret_key = "適当な長いランダム文字列"

HOST = "0.0.0.0"
PORT = 5000

# =========================
# インメモリ保存（重要）
# =========================

results = {}

# =========================
# 認証
# =========================

USERNAME = "admin"
PASSWORD = "1234"

# =========================
# お題データ
# =========================

OdaiList = []
ValueList = []

CONFIG_FILE = "odai.txt"


def load_config(filename=CONFIG_FILE):

    global OdaiList, ValueList

    OdaiList = []
    ValueList = []

    try:
        with open(filename, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue

                odai, value = line.split(",")
                OdaiList.append(odai)
                ValueList.append(float(value))
    except:
        pass


load_config()

# =========================
# レーン
# =========================

LANE_COUNT = 4

teams = {
    i: {"odai": ["", "", ""], "score": 0}
    for i in range(1, LANE_COUNT + 1)
}

score_history = []

# =========================
# ページ
# =========================

@app.route("/")
def login():
    return render_template("login.html")


@app.route("/login", methods=["POST"])
def login_post():

    username = request.form.get("username")
    password = request.form.get("password")

    if username == USERNAME and password == PASSWORD:
        session["login"] = True
        return redirect(url_for("client"))

    return redirect(url_for("redirect_page"))


@app.route("/client")
def client():
    if not session.get("login"):
        return redirect(url_for("login"))

    return render_template("client.html")


@app.route("/display")
def display():
    return render_template("display.html")


@app.route("/rules")
def rules():
    return render_template("rules.html")


@app.route("/redirect")
def redirect_page():
    return render_template("redirect.html")

# =========================
# 結果ページ
# =========================

@app.route("/results/<result_id>")
def results_page(result_id):

    data = results.get(result_id)

    if not data:
        return "Not Found", 404

    return render_template(
        "results.html",
        data=data,
        result_id=result_id
    )

# =========================
# QR用結果作成
# =========================

@app.route("/create_result", methods=["POST"])
def create_result():

    data = request.get_json()

    if not data:
        return jsonify({"result": "error"}), 400

    result_id = str(uuid.uuid4())[:8]

    results[result_id] = {
        "team": data.get("team"),
        "score": data.get("score")
    }

    return jsonify({
        "result": "ok",
        "id": result_id
    })

# =========================
# スコア受信
# =========================

@app.route("/score", methods=["POST"])
def score():

    data = request.get_json()

    if not data:
        return jsonify({"result": "error"}), 400

    team = int(data["team"])
    score_value = int(data["score"])
    odai = data["odai"]

    if team not in teams:
        return jsonify({"result": "error"}), 400

    teams[team]["odai"] = odai
    teams[team]["score"] = score_value

    if score_value > 0:
        score_history.append(score_value)

    return jsonify({"result": "ok"})

# =========================
# API
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
            "score": teams[i]["score"]
        })

    ranking = sorted(score_history, reverse=True)[:3]

    return jsonify({
        "lanes": lanes,
        "ranking": ranking
    })

# =========================
# 管理
# =========================

@app.route("/reset", methods=["POST"])
def reset():

    global teams, score_history

    teams = {
        i: {"odai": ["", "", ""], "score": 0}
        for i in range(1, LANE_COUNT + 1)
    }

    score_history = []

    return jsonify({"result": "ok"})

# =========================
# エラー
# =========================

@app.errorhandler(404)
def not_found(e):
    return jsonify({"result": "error", "message": "Not Found"}), 404


@app.errorhandler(500)
def error(e):
    return jsonify({"result": "error", "message": "Internal Error"}), 500

# =========================
# Render用
# =========================

if __name__ == "__main__":
    app.run(host=HOST, port=PORT)
