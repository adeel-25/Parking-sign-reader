import easyocr

reader = easyocr.Reader(['en'], gpu=False)

results = reader.readtext("images/sign2.jpg", detail=0)

for text in results:
    print(text)