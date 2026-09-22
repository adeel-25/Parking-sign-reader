# Parking-sign-reader
Mobile application that uses OCR and AI to interpret parking and campus signs.

# Planned features
-  Capture or upload images of parking and campus signs.
-  Extract sign text using OCR.
-  Generate a simple explanation using AI.
-  Translate the explanation into supported languages.
-  Read the explanation aloud using text-to-speech


## Current Progress

- Researched and tested Tesseract, EasyOCR, and PaddleOCR for parking sign text recognition.
- Successfully tested Tesseract and EasyOCR on sample parking sign images.
- Identified limitations when OCR is used directly on complex images containing multiple or distant signs.
- Added object detection before OCR to improve the image processing pipeline.
- Created and annotated a custom NYC parking sign dataset using Roboflow.
- Trained a YOLO26 object detection model to detect individual parking sign panels.
- Expanded the dataset to 21 images and created separate training and validation sets.
- Tested the trained detector on additional parking sign images.
- Began integrating YOLO detection and automatic sign cropping with EasyOCR.

## Current Processing Pipeline

Image → YOLO Sign Detection → Sign Cropping → OCR → AI Interpretation

## Next Steps

- Continue expanding and improving the parking sign dataset.
- Improve YOLO detection accuracy for multiple signs on the same pole.
- Complete the YOLO-to-OCR integration and compare OCR results before and after cropping.
- Begin development of the React Native/Expo mobile interface.
- Build the Python/FastAPI backend.
- Integrate API-based and local LLM approaches for sign interpretation.
- Add campus room identification, translation, and text-to-speech features.
