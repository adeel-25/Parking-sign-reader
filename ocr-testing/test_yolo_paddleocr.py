import cv2
from ultralytics import YOLO
from paddleocr import PaddleOCR

# Load our trained YOLO model
model = YOLO("ocr-testing/parking_sign_v6_best.pt")

# Initialize PaddleOCR
ocr = PaddleOCR(lang="en", enable_mkldnn=False)

# Image to test
image_path = "ocr-testing/new-testing-images/nyc_sign_test_2.jpg"

# Detect parking signs using YOLO
results = model(image_path, conf=0.25)

# Show the image with YOLO detection boxes
for result in results:
    result.show()

# Load the original image
image = cv2.imread(image_path)

# Process each detected sign
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

        # Extract text only from the cropped sign
        ocr_results = ocr.predict(sign_crop)

        for ocr_result in ocr_results:
            for text in ocr_result["rec_texts"]:
                print(text)

if sign_number == 0:
    print("No parking signs detected.")