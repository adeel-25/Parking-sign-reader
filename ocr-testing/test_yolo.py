from ultralytics import YOLO

model = YOLO("parking_sign_best.pt")

results = model("images/sign1.jpg")

for result in results:
    print(result.boxes)