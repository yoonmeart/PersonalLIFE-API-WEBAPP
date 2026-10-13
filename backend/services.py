
import os
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


def get_all_values():
    """อ่านข้อมูลทุกแถว รวมถึงหัวตาราง"""
    worksheet = get_worksheet()
    return worksheet.get_all_values()