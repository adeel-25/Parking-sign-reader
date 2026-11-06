
import os
from pathlib import Path

import cv2
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from google import genai
from paddleocr import PaddleOCR
from ultralytics import YOLO

app = FastAPI(title="ParkScan API")

# Project paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
OCR_FOLDER = PROJECT_ROOT / "ocr-testing"
API_FOLDER = PROJECT_ROOT / "api-testing"

# Load existing Gemini API key
load_dotenv(API_FOLDER / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing from api-testing/.env")

# Initialize models once when the server starts
client = genai.Client(api_key=API_KEY)

model = YOLO(str(OCR_FOLDER / "parking_sign_v6_best.pt"))

ocr = PaddleOCR(lang="en", enable_mkldnn=False)


@app.get("/")
def home():
    return {"message": "ParkScan backend is running"}


@app.post("/analyze")
async def analyze_parking_sign(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image.")

    try:
        # Read uploaded photo
        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(status_code=400, detail="Image is empty.")

        image_array = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file.")

        # Detect individual parking signs
        results = model(image, conf=0.25)

        all_signs = []
        sign_number = 0

        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

                # Keep crop coordinates inside the image
                height, width = image.shape[:2]
                x1 = max(0, min(x1, width))
                x2 = max(0, min(x2, width))
                y1 = max(0, min(y1, height))
                y2 = max(0, min(y2, height))

                sign_crop = image[y1:y2, x1:x2]

                if sign_crop.size == 0:
                    continue

                sign_number += 1

                # Extract text from detected sign
                ocr_results = ocr.predict(sign_crop)
                sign_text = []

                for ocr_result in ocr_results:
                    sign_text.extend(ocr_result["rec_texts"])

                if sign_text:
                    all_signs.append(
                        f"Sign {sign_number}:\n" + "\n".join(sign_text)
                    )

        if not all_signs:
            return {
                "success": False,
                "message": "No readable parking sign text detected.",
                "ocr_text": "",
                "explanation": "",
                "sign_count": sign_number,
            }

        ocr_text = "\n\n".join(all_signs)

        # Existing Gemini prompt
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

        return {
            "success": True,
            "ocr_text": ocr_text,
            "explanation": explanation,
            "sign_count": sign_number,
            "warning": (
                "AI explanations are for guidance only. "
                "Always check the physical parking signs."
            ),
        }

    except HTTPException:
        raise
    except Exception as error:
        print(f"Analysis error: {error}")
        raise HTTPException(
            status_code=500,
            detail="Unable to analyze the parking sign."
        )
