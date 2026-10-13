
from flask import Flask, jsonify, request
from flask_cors import CORS

from services import get_all_records, create_record

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


@app.post("/api/records")
def add_record():
    try:
        record = request.get_json(silent=True)

        if not isinstance(record, dict):
            return jsonify({
                "error": "Request body must be a JSON object"
            }), 400

        required_fields = [
            "วันที่",
            "ประเภทเชื้อเพลิง",
            "รุ่นรถ",
            "เลขไมล์ปัจจุบัน",
            "เลขไมล์ครั้งก่อน",
            "ระยะทาง",
            "จำนวนลิตร",
            "ราคาน้ำมันต่อลิตร",
            "ราคารวม",
            "ระยะทางที่คาดหวัง",
        ]

        missing_fields = [
            field for field in required_fields
            if field not in record or record[field] is None
        ]

        if missing_fields:
            return jsonify({
                "error": "Missing required fields",
                "fields": missing_fields
            }), 400

        create_record(record)

        return jsonify({
            "status": "success",
            "message": "Fuel record saved successfully"
        }), 201

    except Exception:
        app.logger.exception("Failed to save fuel record")
        return jsonify({
            "error": "Unable to save fuel record"
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)