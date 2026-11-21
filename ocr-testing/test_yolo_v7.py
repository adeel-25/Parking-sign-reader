from ultralytics import YOLO

model = YOLO("parking_sign_v7_best.pt")

results = model.predict(
    source="new-testing-images/nyc_sign_test_1.jpeg",
    conf=0.25,
    save=True,
    project="runs/detect",
    name="v7_test"
)

for result in results:
    for box in result.boxes:
        class_id = int(box.cls[0])
        print(model.names[class_id])