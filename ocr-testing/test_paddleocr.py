from paddleocr import PaddleOCR

# Initialize PaddleOCR for English text
ocr = PaddleOCR(lang="en", enable_mkldnn=False)

# Image to test
image_path = "ocr-testing/new-testing-images/nyc_sign_test_1.jpg"

# Extract text from the parking sign
results = ocr.predict(image_path)

# Display extracted text
for result in results:
    print("\nExtracted Text:")
    for text in result["rec_texts"]:
        print(text)