import pytesseract
from PIL import Image

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

image = Image.open("images/sign2.jpg")
text = pytesseract.image_to_string(image, config="--psm 6")

print(text)