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
- Configured and tested the Gemini API using sample OCR text.
- Developed and validated a general prompt for both parking and campus signs.
- Tested single signs, multiple signs, incomplete text, campus directions, and building hours.
- Added fixed guidance warnings and checked response consistency across repeated runs.

## Gemini API Testing

Set up and tested the Gemini API for explaining sample OCR text from parking and campus signs. The AI component was tested separately before connecting it to the OCR pipeline.

### Tests Completed

- **Test 1 - Single Parking Sign:** Tested whether Gemini could explain one parking restriction with the correct days, times, and exception. Repeated testing showed small wording changes, but the meaning remained consistent.

- **Test 2 - Multiple Parking Signs:** Tested whether Gemini could explain multiple signs separately. Early responses combined restrictions or added unsupported details, so the prompt was revised and a fixed safety warning was added.

- **Test 3 - Incomplete OCR Text:** Tested whether Gemini could identify missing information without guessing. The final response correctly identified a missing end time. Major text-extraction errors will be handled by the OCR component.

- **Test 4 - Campus Signs:** Tested campus directions, building hours, and signs containing multiple instructions. The prompt was updated to support both parking and campus signs, keep related lines together, and provide consistent explanations.

### AI Testing Conclusion

The final prompt can explain both parking and campus signs in simple language. It avoids inventing missing details, identifies unclear information, keeps related instructions together, and uses a fixed guidance warning controlled by the application. The next step is to connect the tested Gemini component to actual OCR output through the backend.

## Current Processing Pipeline

Image → YOLO Sign Detection → Sign Cropping → OCR → AI Interpretation

## Next Steps

- Continue expanding and improving the parking sign dataset.
- Improve YOLO detection accuracy for multiple signs on the same pole.
- Complete the YOLO-to-OCR integration and compare OCR results before and after cropping.
- Begin development of the React Native/Expo mobile interface.
- Build the Python/FastAPI backend.
- Connect the tested Gemini API component to OCR output through the Python/FastAPI backend.
- Compare the Gemini API with a local LLM approach for sign interpretation.
- Add campus room identification, translation, and text-to-speech features.
