import os

from dotenv import load_dotenv
from google import genai


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY was not found in the .env file.")

client = genai.Client(api_key=api_key)

ocr_text = """
NO PARKING
MONDAY - FRIDAY
7 AM - 9 AM
"""

prompt = f"""
The following text was extracted from a parking sign using OCR:

{ocr_text}

Explain this parking rule in simple language.
Do not invent information that is not written on the sign.
"""

response = client.models.generate_content(
    model="gemini-3.1-flash-lite",
    contents=prompt,
)

print(response.text)