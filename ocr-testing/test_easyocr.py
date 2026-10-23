import easyocr

reader = easyocr.Reader(['en'], gpu=False)

results = reader.readtext("ocr-testing/new-testing-images/nyc_sign_test_3.jpg", detail=0)

for text in results:
    print(text)