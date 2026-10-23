import os

from dotenv import load_dotenv
from google import genai


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY was not found in the .env file.")

client = genai.Client(api_key=api_key)

ocr_text = """
SCIENCE BUILDING
VISITORS CHECK IN AT FRONT DESK
STUDENT ID REQUIRED AFTER 6 PM
NO FOOD OR DRINKS IN LABS
EMERGENCY EXIT - EAST HALLWAY
"""

prompt = f"""
The following text was extracted from one or more signs using OCR:

{ocr_text}

Explain each sign separately in simple language for the user.
Keep the answer short and use plain text without Markdown symbols.
Include only the locations, directions, hours, restrictions, instructions, and exceptions shown in the OCR text.
Do not invent missing information, legal details, fines, consequences, or additional instructions.
Do not assume that separate signs apply to the same location.
For a campus sign, clearly explain its location, directions, hours, or instructions.
For a parking sign, state the displayed restriction and exception without expanding its legal meaning.
If any information is incomplete or unclear, identify it clearly and do not guess.
Blank lines are the only sign separators. If there is no blank line, output exactly one sign.
"""

response = client.models.generate_content(
    model="gemini-3.1-flash-lite",
    contents=prompt,
)

explanation = response.text.strip()

print(explanation)

print("\nImportant:")
print(
    "Sign information may depend on its location, layout, and directional arrows."
)
print(
    "This AI explanation is for guidance only. "
    "Always check the physical sign and follow the posted instructions or local rules."
)