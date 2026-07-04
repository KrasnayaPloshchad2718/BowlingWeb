from flask import url_for,Flask, session,jsonify, request, redirect, render_template, Response
import os
import uuid
import json


# ==================================
# 結果保存（JSON）
# ==================================

RESULT_FILE = "results.json"


def load_results():
    if not os.path.exists(RESULT_FILE):
        return {}

    with open(RESULT_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except:
            return {}


def save_results(data):
    with open(RESULT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
results = load_results()
# ==================================
# サーバー設定
# ==================================

HOST = "0.0.0.0"
PORT = 5000

CONFIG_FILE = "odai.txt"

# ==================================
# お題データ
# ==================================

OdaiList = []
ValueList = []


def load_config(filename=CONFIG_FILE):
    """
    odai.txt を読み込む
    形式：
    両目隠し,4.5
    ピン数減少,4
    """

    global OdaiList
    global ValueList

    OdaiList.clear()
    ValueList.clear()

    if not os.path.exists(filename):
        return

    with open(filename, "r", encoding="utf-8") as f:

        for line in f:

            line = line.strip()

            if line == "":
                continue

            odai, value = line.split(",")

            OdaiList.append(odai)
            ValueList.append(float(value))


# 初回ロード
load_config()

# ==================================
# レーン情報
# ==================================

LANE_COUNT = 4

teams = {
    i: {
        "odai": ["", "", ""],
        "score": 0
    }
    for i in range(1, LANE_COUNT + 1)
}


# ==================================
# HTML
# ==================================

#from flask import Flask, render_template, request, redirect, session, url_for

app = Flask(__name__)
app.secret_key = "適当な長いランダム文字列"

USERNAME = "admin"
PASSWORD = "1234"


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
def display_page():

    #if not session.get("login"):
    #    return redirect(url_for("login"))

    return render_template("display.html")


@app.route("/rules")
def rules_page():

    #if not session.get("login"):
    #    return redirect(url_for("login"))

    return render_template("rules.html")


@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("login"))


@app.route("/redirect")
def redirect_page():
    return render_template("redirect.html")

@app.route("/results/<result_id>")
def results_page(result_id):

    results = load_results()

    data = results.get(result_id)

    if not data:
        return "Not Found", 404

    return render_template(
        "results.html",
        data=data,
        result_id=result_id
    )
# ==================================
# QR用結果作成
# ==================================

@app.route("/create_result", methods=["POST"])
def create_result():

    global results

    data = request.get_json()

    if data is None:
        return jsonify({
            "result": "error",
            "message": "no json"
        }), 400

    result_id = str(uuid.uuid4())[:8]

    results[result_id] = {
        "team": data.get("team"),
        "score": data.get("score")
    }

    save_results(results)

    return jsonify({
        "result": "ok",
        "id": result_id,
        "url": f"/results/{result_id}"
    })
# ==================================
# 結果ページ表示
# ==================================

@app.route("/results/<result_id>")
def result_page(result_id):

    results = load_results()

    data = results.get(result_id)

    if not data:
        return "Not Found", 404

    return render_template(
        "results.html",
        data=data,
        result_id=result_id
    )
# ==================================
# display用データAPI
# ==================================

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


# ==================================
# API（基本情報）
# ==================================

@app.route("/config")
def config():

    # 毎回読み直して即反映
    load_config()

    return jsonify({

        "odai": OdaiList,
        "value": ValueList

    })


@app.route("/status")
def status():

    return jsonify(teams)


# ==================================
# 得点受信
# ==================================

# サーバー起動後のスコア履歴
score_history = []

@app.route("/score", methods=["POST"])
def score():

    try:

        data = request.get_json()

        if data is None:
            return jsonify({
                "result": "error",
                "message": "JSONがありません"
            }), 400

        team = int(data["team"])

        if team not in teams:
            return jsonify({
                "result": "error",
                "message": "レーン番号不正"
            }), 400

        odai = data["odai"]
        score_value = int(data["score"])

        # 現在のレーン情報を更新
        teams[team]["odai"] = odai
        teams[team]["score"] = score_value

        # ランキング用履歴へ追加（0点は除外）
        if score_value > 0:
            score_history.append(score_value)

        return jsonify({
            "result": "ok"
        })

    except Exception as e:

        return jsonify({
            "result": "error",
            "message": str(e)
        }), 400


# ==================================
# お題再読込
# ==================================

@app.route("/reload", methods=["POST"])
def reload_config():

    try:

        load_config()

        return jsonify({

            "result": "ok",
            "count": len(OdaiList)

        })

    except Exception as e:

        return jsonify({

            "result": "error",
            "message": str(e)

        }), 500


# ==================================
# レーン初期化
# ==================================

@app.route("/reset", methods=["POST"])
def reset():

    global teams

    teams = {
        i: {
            "odai": ["", "", ""],
            "score": 0
        }
        for i in range(1, LANE_COUNT + 1)
    }

    return jsonify({
        "result": "ok"
    })


# ==================================
# サーバー情報
# ==================================

@app.route("/info")
def info():

    return jsonify({

        "host": HOST,
        "port": PORT,
        "lane_count": LANE_COUNT,
        "odai_count": len(OdaiList)

    })


# ==================================
# エラーハンドラ
# ==================================

@app.errorhandler(404)
def not_found(error):

    return jsonify({

        "result": "error",
        "message": "Not Found"

    }), 404


@app.errorhandler(500)
def internal_error(error):

    return jsonify({

        "result": "error",
        "message": "Internal Server Error"

    }), 500


# ==================================
# 起動
# ==================================

"""if __name__ == "__main__":

    print("=" * 40)
    print(" ボウリング Web サーバー ")
    print("=" * 40)

    load_config()

    print(f"HOST      : {HOST}")
    print(f"PORT      : {PORT}")
    print(f"レーン数   : {LANE_COUNT}")
    print(f"お題数     : {len(OdaiList)}")

    print()
    print("http://127.0.0.1:5000")
    print("http://localhost:5000")
    print()

    app.run(
        host=HOST,
        port=PORT,
        debug=False
    )"""

@app.route("/test")
def test():
    return "OK"

@app.route("/debug_results")
def debug_results():
    return jsonify(load_results())
