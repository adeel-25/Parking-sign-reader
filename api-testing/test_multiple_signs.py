import os

from dotenv import load_dotenv
from google import genai


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY was not found in the .env file.")

client = genai.Client(api_key=api_key)

ocr_text = """
NO STANDING
MONDAY - FRIDAY
7 AM - 10 AM
EXCEPT COMMERCIAL VEHICLES

2 HOUR METERED PARKING
MONDAY - SATURDAY
10 AM - 7 PM

NO PARKING
TUESDAY
11 AM - 12:30 PM
STREET CLEANING
"""

prompt = f"""
The following text was extracted from one or more parking signs using OCR:

{ocr_text}

Explain each sign separately in simple language for the user.
Keep the answer short and use plain text only without Markdown symbols.
Include the exact days, times, restrictions, and exceptions shown in the OCR text.
Do not invent missing information, fines, towing rules, or additional exceptions.
Do not assume that the signs apply to the same parking space.
Do not define or expand legal terms such as "No Standing" or "No Parking."
Simply state that the listed restriction applies during the displayed days and times.
"""

response = client.models.generate_content(
    model="gemini-3.1-flash-lite",
    contents=prompt,
)

explanation = response.text.strip()

print(explanation)

print("\nImportant:")
print(
    "Multiple signs may apply differently based on their position and directional arrows."
)
print(
    "This AI explanation is for guidance only. "
    "Always check the physical signs and local parking rules before parking."
)