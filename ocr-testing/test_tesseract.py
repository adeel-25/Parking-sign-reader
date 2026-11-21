import pytesseract
from PIL import Image

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

image = Image.open("ocr-testing/new-testing-images/nyc_sign_test_3.jpg")

text = pytesseract.image_to_string(image, config="--psm 11")

print(text)