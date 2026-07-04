from flask import (
    Flask,
    session,
    jsonify,
    request,
    redirect,
    render_template,
    url_for
)

# =========================
# Flask設定
# =========================

app = Flask(__name__)
app.secret_key = "適当な長いランダム文字列"

HOST = "0.0.0.0"
PORT = 5000

# =========================
# ログイン
# =========================

USERNAME = "admin"
PASSWORD = "1234"

# =========================
# お題
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

                if line == "":
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

    i: {

        "odai": ["", "", ""],

        "score": 0

    }

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
# スコア受信
# =========================

@app.route("/score", methods=["POST"])
def score():

    data = request.get_json()

    if data is None:

        return jsonify({

            "result": "error"

        }), 400

    team = int(data["team"])

    if team not in teams:

        return jsonify({

            "result": "error"

        }), 400

    teams[team]["odai"] = data["odai"]

    teams[team]["score"] = int(data["score"])

    if int(data["score"]) > 0:

        score_history.append(int(data["score"]))

    return jsonify({

        "result": "ok"

    })
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

    ranking = sorted(
        score_history,
        reverse=True
    )[:3]

    return jsonify({

        "lanes": lanes,

        "ranking": ranking

    })


# =========================
# リセット
# =========================

@app.route("/reset", methods=["POST"])
def reset():

    global teams
    global score_history

    teams = {

        i: {

            "odai": ["", "", ""],

            "score": 0

        }

        for i in range(1, LANE_COUNT + 1)

    }

    score_history.clear()

    return jsonify({

        "result": "ok"

    })


# =========================
# サーバー情報
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
# 動作確認
# =========================

@app.route("/test")
def test():

    return "OK"


# =========================
# エラー
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
# Render / ローカル起動
# =========================

if __name__ == "__main__":

    app.run(

        host=HOST,

        port=PORT,

        debug=False

    )
