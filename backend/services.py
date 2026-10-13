
import math
import os
import re
from pathlib import Path

import gspread
from google.oauth2.service_account import Credentials

# Project root: โฟลเดอร์ Fuel-Webapp
BASE_DIR = Path(__file__).resolve().parent.parent

# Local ใช้ env/credentials.json
# Render ใช้ path จาก Environment Variable
CREDENTIALS_FILE = os.getenv(
    "GOOGLE_APPLICATION_CREDENTIALS",
    str(BASE_DIR / "env" / "credentials.json"),
)

SPREADSHEET_ID = "1kd_8lUj2pv3CBCygY5p6FdGjq5mQX9TVq8hHs_mfCrk"

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]


def get_worksheet():
    """เชื่อมต่อ Google Sheets และคืนค่า worksheet"""
    credentials = Credentials.from_service_account_file(
        CREDENTIALS_FILE,
        scopes=SCOPES,
    )

    client = gspread.authorize(credentials)
    spreadsheet = client.open_by_key(SPREADSHEET_ID)

    return spreadsheet.sheet1


def get_all_records():
    """อ่านข้อมูลทั้งหมดจาก Google Sheets"""
    worksheet = get_worksheet()
    return worksheet.get_all_records()


def _normalize_odometer(value):
    """คืนค่าเลขไมล์ที่เป็นตัวเลขที่ถูกต้อง และปฏิเสธค่าเสียหาย/ค่าว่าง"""
    if value is None:
        return None

    text = str(value).strip()

    if not text:
        return None

    cleaned = text.replace(",", "").replace(" ", "")

    if cleaned in {"", "-", ".", "+", "NaN", "None"}:
        return None

    if not re.fullmatch(r"[-+]?\d+(?:\.\d+)?", cleaned):
        return None

    number = float(cleaned)

    if not math.isfinite(number) or number < 0:
        return None

    return int(number) if number.is_integer() else number


def get_latest_odometer():
    """อ่านเฉพาะคอลัมน์เลขไมล์ปัจจุบัน แล้วคืนค่าล่าสุดที่ถูกต้อง"""
    worksheet = get_worksheet()
    column_values = worksheet.col_values(4)

    if not column_values:
        return {"เลขไมล์ปัจจุบัน": None}

    for value in reversed(column_values):
        normalized_value = str(value).strip().lower()

        if normalized_value in {
            "เลขไมล์ปัจจุบัน",
            "current odometer",
            "odometer",
        }:
            continue

        normalized = _normalize_odometer(value)

        if normalized is not None:
            return {"เลขไมล์ปัจจุบัน": normalized}

    return {"เลขไมล์ปัจจุบัน": None}


def get_all_values():
    """อ่านข้อมูลทุกแถว รวมถึงหัวตาราง"""
    worksheet = get_worksheet()
    return worksheet.get_all_values()


def create_record(record):
    """เพิ่มรายการเติมน้ำมันลง Google Sheets"""
    worksheet = get_worksheet()

    # เรียงข้อมูลให้ตรงกับคอลัมน์ A-J
    row = [
        record["วันที่"],
        record["ประเภทเชื้อเพลิง"],
        record["รุ่นรถ"],
        record["เลขไมล์ปัจจุบัน"],
        record["เลขไมล์ครั้งก่อน"],
        record["ระยะทาง"],
        record["จำนวนลิตร"],
        record["ราคาน้ำมันต่อลิตร"],
        record["ราคารวม"],
        record["ระยะทางที่คาดหวัง"],
    ]

    worksheet.append_row(
        row,
        value_input_option="USER_ENTERED",
    )

    return {"status": "success"}