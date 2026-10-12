
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

print("Google Sheets authentication successful!")