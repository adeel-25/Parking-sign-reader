from ultralytics import YOLO

model = YOLO("ocr-testing/parking_sign_v6_best.pt")

results = model("ocr-testing/new-testing-images/nyc_sign_test_3.jpg")

for result in results:
    print(result.boxes)

for result in results:
    result.show()