
import gspread
from google.oauth2.service_account import Credentials

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

credentials = Credentials.from_service_account_file(
    "env/credentials.json",
    scopes=SCOPES,
)

client = gspread.authorize(credentials)

# เปลี่ยนเป็น Spreadsheet ID ของคุณ
SPREADSHEET_ID = "1kd_8lUj2pv3CBCygY5p6FdGjq5mQX9TVq8hHs_mfCrk"

spreadsheet = client.open_by_key(SPREADSHEET_ID)
worksheet = spreadsheet.sheet1

print("Spreadsheet:", spreadsheet.title)
print("ข้อมูลในชีต:", worksheet.get_all_values())