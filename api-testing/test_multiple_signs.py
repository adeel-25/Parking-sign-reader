
import os
from pathlib import Path

import cv2
from dotenv import load_dotenv
from google import genai
from ultralytics import YOLO
from paddleocr import PaddleOCR


# Project folders
project_root = Path(__file__).resolve().parent.parent
ocr_folder = project_root / "ocr-testing"

# Load Fahad's Gemini API configuration
load_dotenv(Path(__file__).resolve().parent / ".env")

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY was not found in the .env file.")

client = genai.Client(api_key=api_key)

# Load our trained YOLO model
model = YOLO(str(ocr_folder / "parking_sign_v6_best.pt"))

# Initialize PaddleOCR
ocr = PaddleOCR(lang="en", enable_mkldnn=False)

# Image to test
image_path = ocr_folder / "new-testing-images" / "nyc_sign_test_1.jpeg"

# Detect parking signs using YOLO
results = model(str(image_path), conf=0.25)

# Load the original image
image = cv2.imread(str(image_path))

if image is None:
    raise FileNotFoundError(f"Could not open image: {image_path}")

# Collect OCR text from all detected signs
all_signs = []
sign_number = 0

for result in results:
    for box in result.boxes:
        # Get bounding box coordinates
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

        # Crop the detected sign
        sign_crop = image[y1:y2, x1:x2]

        if sign_crop.size == 0:
            continue

        sign_number += 1
        print(f"\n--- Detected Sign {sign_number} ---")

        # Extract text from the cropped sign
        ocr_results = ocr.predict(sign_crop)

        sign_text = []

        for ocr_result in ocr_results:
            for text in ocr_result["rec_texts"]:
                print(text)
                sign_text.append(text)

        if sign_text:
            all_signs.append(
                f"Sign {sign_number}:\n" + "\n".join(sign_text)
            )

if not all_signs:
    print("No readable parking sign text detected.")

else:
    ocr_text = "\n\n".join(all_signs)

    # Fahad's Gemini prompt, updated for real OCR results
    prompt = f"""
The following text was extracted from one or more parking signs
using YOLO object detection and PaddleOCR.

Each numbered sign represents a separate detected sign.

{ocr_text}

Explain each sign separately in simple language for the user.
Keep the answer short and use plain text only without Markdown symbols.
Include the exact days, times, restrictions, and exceptions shown in the OCR text.
Do not invent missing information, fines, towing rules, or additional exceptions.
Do not assume that the signs apply to the same parking space.
Do not define or expand legal terms such as "No Standing" or "No Parking."
Simply state that the listed restriction applies during the displayed days and times.
Directional arrows and parking symbols have not been detected.
Do not assume arrow directions or missing symbol meanings.
If OCR text is unclear or incomplete, say so.
"""

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt,
    )

    explanation = (response.text or "").strip()

    print("\n--- Gemini Parking Explanation ---")
    print(explanation if explanation else "No explanation returned.")

    print("\nImportant:")
    print(
        "Multiple signs may apply differently based on their "
        "position and directional arrows."
    )
    print(
        "This AI explanation is for guidance only. "
        "Always check the physical signs and local parking rules before parking."
    )
