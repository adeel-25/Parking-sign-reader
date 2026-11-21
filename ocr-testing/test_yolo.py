from ultralytics import YOLO

model = YOLO("ocr-testing/parking_sign_v9_best.pt")

results = model("ocr-testing/parking-sign-dataset/raw-images/nyc_sign_012.jpeg")

for result in results:
    print(result.boxes)

for result in results:
    result.save(filename="ocr-testing/v9_test_result_012.jpg")