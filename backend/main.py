import os
import time
from pathlib import Path

import cv2
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
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

# Updated YOLO26 v9 model
model = YOLO(str(OCR_FOLDER / "parking_sign_v9_best.pt"))

ocr = PaddleOCR(
    lang="en",
    enable_mkldnn=True,
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
)

ARROW_CLASSES = ["arrow_left", "arrow_right", "arrow_both"]


@app.get("/")
def home():
    return {"message": "ParkScan backend is running"}


@app.post("/analyze")
async def analyze_parking_sign(
    file: UploadFile = File(...),
    language: str = Form("en")
):
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

        height, width = image.shape[:2]

        # Detect parking sign panels, arrows, and symbols
        print(f"Image size: {width}x{height}")

        yolo_start = time.perf_counter()
        results = model(image, conf=0.25)
        yolo_time = time.perf_counter() - yolo_start

        panels = []
        arrows = []
        symbols = []

        for result in results:
            for box in result.boxes:

                class_id = int(box.cls[0])
                class_name = model.names[class_id]
                confidence = float(box.conf[0])

                x1, y1, x2, y2 = map(
                    int, box.xyxy[0].tolist()
                )

                # Keep coordinates inside the image
                x1 = max(0, min(x1, width))
                x2 = max(0, min(x2, width))
                y1 = max(0, min(y1, height))
                y2 = max(0, min(y2, height))

                if x2 <= x1 or y2 <= y1:
                    continue

                detection = {
                    "class_name": class_name,
                    "confidence": confidence,
                    "box": [x1, y1, x2, y2],
                }

                if class_name == "parking_sign_panel":
                    panels.append(detection)

                elif class_name in ARROW_CLASSES:
                    arrows.append(detection)

                elif class_name in [
                    "night",
                    "no_parking_cleaning"
                ]:
                    symbols.append(detection)

        # Process signs from top to bottom
        panels.sort(key=lambda item: item["box"][1])

        all_signs = []
        sign_number = 0
        ocr_time = 0.0

        for panel in panels:

            x1, y1, x2, y2 = panel["box"]

            sign_crop = image[y1:y2, x1:x2]

            if sign_crop.size == 0:
                continue

            sign_number += 1

            # Extract text from the parking sign panel
            ocr_start = time.perf_counter()
            ocr_results = ocr.predict(sign_crop)
            ocr_time += time.perf_counter() - ocr_start
            sign_text = []

            for ocr_result in ocr_results:
                sign_text.extend(ocr_result["rec_texts"])

            # Find arrows belonging to this panel
            matching_arrows = []

            for arrow in arrows:
                ax1, ay1, ax2, ay2 = arrow["box"]

                arrow_center_x = (ax1 + ax2) / 2
                arrow_center_y = (ay1 + ay2) / 2

                # Match arrows whose center lies inside the panel
                if (
                    x1 <= arrow_center_x <= x2
                    and y1 <= arrow_center_y <= y2
                ):
                    matching_arrows.append(
                        arrow["class_name"]
                    )

            # Find symbols belonging to this panel
            matching_symbols = []

            for symbol in symbols:
                sx1, sy1, sx2, sy2 = symbol["box"]

                symbol_center_x = (sx1 + sx2) / 2
                symbol_center_y = (sy1 + sy2) / 2

                if (
                    x1 <= symbol_center_x <= x2
                    and y1 <= symbol_center_y <= y2
                ):
                    matching_symbols.append(
                        symbol["class_name"]
                    )

            # Build information for Gemini
            sign_info = f"Sign {sign_number}:\n"

            if sign_text:
                sign_info += "\n".join(sign_text)
            else:
                sign_info += "No readable text detected."

            if matching_arrows:
                directions = ", ".join(
                    sorted(set(matching_arrows))
                )
                sign_info += (
                    f"\nDetected arrow directions: {directions}"
                )
            else:
                sign_info += "\nArrow direction: Not detected"

            if matching_symbols:
                detected_symbols = ", ".join(
                    sorted(set(matching_symbols))
                )
                sign_info += (
                    f"\nDetected symbols: {detected_symbols}"
                )

            all_signs.append(sign_info)

        # Keep the existing response structure
        if not panels or not all_signs:
            return {
                "success": False,
                "message": "No parking sign panels detected.",
                "ocr_text": "",
                "explanation": "",
                "sign_count": 0,
            }

        ocr_text = "\n\n".join(all_signs)

        # Gemini prompt with language support,
        # arrow directions, and symbol interpretation
        prompt = f"""
Respond in {"Spanish" if language == "es" else "English"}.
Translate the explanation only. Preserve all original sign text,
numbers, days, times, and restrictions accurately.

The following information was extracted from NYC parking
signs using YOLO object detection and PaddleOCR.

Each numbered sign represents a separate detected panel.

The information includes:
1. OCR text extracted from each panel.
2. Directional arrows detected by YOLO.
3. Parking-related symbols detected by YOLO.

Detected parking sign information:

{ocr_text}

Explain each sign separately in simple language for the user.

Arrow meanings:
- arrow_left: The sign's restriction points left.
- arrow_right: The sign's restriction points right.
- arrow_both: The sign's restriction points both left and right.

These directions are relative to the photographed sign.
Do not assume the direction of travel or the exact street
boundaries.

Symbol meanings:
- night: A nighttime-related symbol was detected.
- no_parking_cleaning: A street-cleaning-related symbol
  was detected.

A detected symbol does not establish exact restrictions,
days, or times by itself.

Important rules:
- Keep the answer short.
- Use plain text only without Markdown symbols.
- Explain each sign separately.
- Include exact days, times, restrictions, and exceptions
  only when supported by the extracted text.
- Explain arrow directions when detected.
- Use only the arrows and symbols listed under each sign.
- Do not assign arrows or symbols from one sign to another.
- Do not invent missing information.
- Do not invent fines, towing rules, or exceptions.
- Do not assume different signs apply to the same space.
- Do not define or expand legal terms such as
  "No Standing" or "No Parking."
- Simply state that the listed restriction applies during
  the displayed days and times.
- If an arrow is not detected, say its direction is unknown.
- If OCR text is unclear or incomplete, say so.
- YOLO detections may be incorrect.
- Never claim that parking is definitely legal based
  only on this analysis.
"""

        gemini_start = time.perf_counter()
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
        )
        gemini_time = time.perf_counter() - gemini_start

        print(
            f"Timing | YOLO: {yolo_time:.2f}s | "
            f"OCR ({sign_number} panels): {ocr_time:.2f}s | "
            f"Gemini: {gemini_time:.2f}s"
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


@app.post("/analyze-campus")
async def analyze_campus_sign(
    file: UploadFile = File(...),
    language: str = Form("en")
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload an image."
        )

    try:
        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Image is empty."
            )

        image_array = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(
                status_code=400,
                detail="Invalid image file."
            )

        # Campus signs use OCR on the full image.
        # The parking-specific YOLO model is not used.
        ocr_results = ocr.predict(image)
        extracted_lines = []

        for ocr_result in ocr_results:
            extracted_lines.extend(ocr_result["rec_texts"])

        extracted_lines = [
            str(line).strip()
            for line in extracted_lines
            if str(line).strip()
        ]

        if not extracted_lines:
            return {
                "success": False,
                "message": "No readable campus sign text detected.",
                "ocr_text": "",
                "explanation": "",
                "sign_count": 0
            }

        ocr_text = "\n".join(extracted_lines)

        prompt = f"""
Respond in {"Spanish" if language == "es" else "English"}.
Translate the explanation only. Preserve original room numbers,
building names, locations, and other sign details accurately.

The following text was extracted from a campus room
or building sign using OCR:

{ocr_text}

Explain the campus sign in clear, simple language.

Instructions:
- Identify room numbers, building names, locations,
  directions, opening hours, and restrictions if present.
- Explain what the sign tells students or visitors.
- Preserve exact numbers, times, and instructions.
- Do not invent missing information.
- Do not assume directions or locations not shown.
- If text is incomplete or unclear, say so.
- Keep the explanation concise and use plain text.
"""

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
        )

        explanation = (response.text or "").strip()

        if not explanation:
            raise HTTPException(
                status_code=502,
                detail="AI did not return an explanation."
            )

        return {
            "success": True,
            "ocr_text": ocr_text,
            "explanation": explanation,
            "sign_count": 1,
            "warning": (
                "AI explanations are for guidance only. "
                "Always check the physical campus sign."
            )
        }

    except HTTPException:
        raise

    except Exception as error:
        print(f"Campus analysis error: {error}")
        raise HTTPException(
            status_code=500,
            detail="Unable to analyze the campus sign."
        )