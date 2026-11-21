
from pathlib import Path

import cv2
import easyocr
from ultralytics import YOLO

# --------------------------------------------------
# FILE PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "parking_sign_v6_best.pt"

IMAGE_PATH = (
    BASE_DIR / "new-testing-images" / "nyc_sign_test_1.jpeg"
)

OUTPUT_DIR = BASE_DIR / "runs" / "ocr" / "easyocr_test_1"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# --------------------------------------------------
# LOAD MODEL AND OCR
# --------------------------------------------------

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

if not IMAGE_PATH.exists():
    raise FileNotFoundError(f"Image not found: {IMAGE_PATH}")

print("Loading YOLO model...")
model = YOLO(str(MODEL_PATH))

print("Loading EasyOCR...")
reader = easyocr.Reader(["en"], gpu=False)

image = cv2.imread(str(IMAGE_PATH))

if image is None:
    raise ValueError("Could not read the image.")

# --------------------------------------------------
# DETECT PARKING SIGNS
# --------------------------------------------------

results = model.predict(
    source=str(IMAGE_PATH),
    imgsz=640,
    conf=0.25,
    verbose=False
)

boxes = results[0].boxes

print(f"\nDetected {len(boxes)} parking sign panel(s).")

# Sort detected signs from top to bottom
detected_boxes = sorted(
    boxes,
    key=lambda box: float(box.xyxy[0][1])
)

# --------------------------------------------------
# IMAGE ENHANCEMENT FUNCTION
# --------------------------------------------------

def enhance_image(crop):

    # Enlarge image 3 times
    enlarged = cv2.resize(
        crop,
        None,
        fx=3,
        fy=3,
        interpolation=cv2.INTER_CUBIC
    )

    # Convert to grayscale
    gray = cv2.cvtColor(
        enlarged,
        cv2.COLOR_BGR2GRAY
    )

    # Improve local contrast
    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )

    enhanced = clahe.apply(gray)

    # Sharpen the text
    blurred = cv2.GaussianBlur(
        enhanced,
        (0, 0),
        1.0
    )

    sharpened = cv2.addWeighted(
        enhanced,
        1.5,
        blurred,
        -0.5,
        0
    )

    return sharpened


# --------------------------------------------------
# TEST EACH DETECTED SIGN
# --------------------------------------------------

height, width = image.shape[:2]

for i, box in enumerate(detected_boxes, start=1):

    x1, y1, x2, y2 = map(
        int,
        box.xyxy[0].tolist()
    )

    # Keep crop coordinates inside image
    x1 = max(0, min(x1, width))
    x2 = max(0, min(x2, width))
    y1 = max(0, min(y1, height))
    y2 = max(0, min(y2, height))

    crop = image[y1:y2, x1:x2]

    if crop.size == 0:
        print(f"Sign {i}: Empty crop, skipped.")
        continue

    # Save original crop
    original_path = OUTPUT_DIR / f"sign_{i}_original.jpg"

    cv2.imwrite(
        str(original_path),
        crop
    )

    # Create and save enhanced crop
    enhanced = enhance_image(crop)

    enhanced_path = OUTPUT_DIR / f"sign_{i}_enhanced.jpg"

    cv2.imwrite(
        str(enhanced_path),
        enhanced
    )

    # Run EasyOCR on both versions
    original_text = reader.readtext(
        crop,
        detail=0
    )

    enhanced_text = reader.readtext(
        enhanced,
        detail=0
    )

    print(f"\n{'=' * 45}")
    print(f"SIGN {i}")
    print(f"YOLO confidence: {float(box.conf[0]):.2f}")
    print(f"{'=' * 45}")

    print("\nORIGINAL IMAGE OCR:")
    print("\n".join(original_text) if original_text else "No text detected.")

    print("\nENHANCED IMAGE OCR:")
    print("\n".join(enhanced_text) if enhanced_text else "No text detected.")

    print(f"\nOriginal crop: {original_path}")
    print(f"Enhanced crop: {enhanced_path}")

print("\nEasyOCR comparison completed!")
