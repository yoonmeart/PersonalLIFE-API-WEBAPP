
from flask import Flask, jsonify
from flask_cors import CORS

from services import get_all_records

app = Flask(__name__)

# อนุญาต Frontend ระหว่างพัฒนา
CORS(app)


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/api/records")
def records():
    try:
        data = get_all_records()
        return jsonify(data)
    except Exception:
        app.logger.exception("Failed to read Google Sheets")
        return jsonify({
            "error": "Unable to read Google Sheets"
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)