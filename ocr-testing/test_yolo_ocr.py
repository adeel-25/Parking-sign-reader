import cv2

from ultralytics import YOLO
import easyocr

# Load our trained parking-sign detector
model = YOLO("../runs/detect/train-4/weights/best.pt")

# Load EasyOCR
reader = easyocr.Reader(["en"], gpu=False)

# Image we want to test
image_path = "images/sign3.png"

# Run YOLO detection
results = model(image_path, conf=0.10)

# Load the original image
image = cv2.imread(image_path)

# Go through every sign YOLO detected
for result in results:
    for box in result.boxes:

        # Get the bounding-box coordinates
        x1, y1, x2, y2 = map(int, box.xyxy[0])

        # Crop the detected sign from the original image
        sign_crop = image[y1:y2, x1:x2]
        cv2.imwrite("detected_sign.jpg", sign_crop)

        # Show the cropped sign
        cv2.imshow("Detected Sign", sign_crop)

cv2.waitKey(0)
cv2.destroyAllWindows()