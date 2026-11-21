# ParkScan – Parking Sign and Campus Room Reader

ParkScan is a mobile application designed to help users understand parking restrictions and access campus room information using computer vision, Optical Character Recognition (OCR), and Artificial Intelligence (AI).

The application allows users to capture or upload images of parking signs, extracts the text, and generates a simple explanation of the restrictions. The project also aims to improve accessibility through translation and text-to-speech features.

This project is being developed as part of our Computer Science capstone project at Brooklyn College.

## Project Features

### Parking Sign Reader
- Capture parking sign images using the phone camera.
- Select existing images from the photo library.
- Detect individual parking signs using YOLO.
- Extract text from detected signs using PaddleOCR.
- Interpret parking restrictions using Gemini AI.
- Display extracted text and explanations in the mobile application.
- Identify unclear or incomplete information instead of guessing missing restrictions.

### Campus Room Reader (Planned)
- Scan campus room numbers using the phone camera.
- Identify room information using a campus database.
- Provide department and location information associated with recognized rooms.

### Accessibility Features (Planned)
- Translate explanations into supported languages.
- Read explanations aloud using text-to-speech.
- Provide an accessible interface for users who need assistance reading signs.

## Technologies Used

| Component | Technology |
|---|---|
| Mobile Frontend | React Native, Expo, TypeScript |
| Backend | Python, FastAPI |
| Object Detection | YOLO26 |
| Text Recognition | PaddleOCR |
| AI Interpretation | Google Gemini API |
| Dataset Preparation | Roboflow |
| Campus Database (Planned) | SQLite |
| Version Control | Git, GitHub |

## Current Progress

### 1. OCR Research and Testing
- Researched and tested Tesseract, EasyOCR, and PaddleOCR.
- Tested OCR performance on real parking sign images.
- Identified difficulties recognizing small, distant, and multiple signs.
- Compared OCR results to determine a suitable approach for the application.
- Selected PaddleOCR for integration with the parking sign processing pipeline.

### 2. Parking Sign Detection
- Collected parking sign images for testing.
- Created and annotated a custom NYC parking sign dataset using Roboflow.
- Trained a YOLO26 model to detect individual parking sign panels.
- Tested the model on additional parking sign images.
- Experimented with different YOLO model versions.
- Implemented sign detection and cropping before text recognition.

### 3. YOLO and PaddleOCR Integration
- Integrated YOLO object detection with PaddleOCR.
- Developed testing scripts to process detected parking sign regions.
- Tested extracting text from individual sign panels.
- Continued evaluating detection and recognition accuracy for complex parking signs.

### 4. Gemini AI Testing
- Configured the Gemini API for parking sign interpretation.
- Developed and tested prompts for explaining parking restrictions.
- Tested single signs, multiple signs, and incomplete OCR text.
- Tested campus directions, building hours, and signs containing multiple instructions.
- Improved prompts to reduce unsupported assumptions.
- Added guidance warnings to help users understand that explanations should be verified against posted signs.

### 5. Backend Development
- Developed a Python backend using FastAPI.
- Created an API endpoint for parking sign image analysis.
- Integrated YOLO detection, PaddleOCR text extraction, and Gemini interpretation into the backend.
- Implemented image processing and structured analysis responses.
- Successfully tested the backend locally.
- Verified that the backend can be reached from the mobile device over the local network.

### 6. Mobile Frontend Development
- Developed the ParkScan mobile interface using React Native, Expo, and TypeScript.
- Created the home screen and parking sign scanner interface.
- Added camera and photo library image selection.
- Implemented image preview functionality.
- Added functionality for sending selected images to the backend.
- Developed interface components for displaying OCR text and AI explanations.
- Added loading and error handling states.
- Continued testing frontend and backend communication.

**Current Status:** The backend processing pipeline has been implemented and tested locally. The mobile frontend is developed, but complete end-to-end image upload and analysis testing is still in progress.

## System Architecture

The parking sign processing pipeline follows these steps:

1. **Image Input:** The user captures or selects a parking sign image.
2. **Object Detection:** YOLO detects individual parking sign panels.
3. **Image Cropping:** Detected sign regions are cropped for processing.
4. **OCR:** PaddleOCR extracts text from the detected signs.
5. **AI Interpretation:** Gemini processes the extracted text and generates an explanation.
6. **Results:** The application displays the extracted text and interpretation.

**Processing Pipeline:**

Camera / Image Upload → YOLO Detection → Sign Cropping → PaddleOCR → Gemini AI → Results Display

## Testing and Evaluation

### OCR Testing
Tesseract, EasyOCR, and PaddleOCR were evaluated using parking sign images. Testing showed that directly applying OCR to complex images can produce inaccurate or incomplete text, particularly when signs are small or contain multiple panels.

Object detection was introduced to isolate individual signs before OCR processing.

### YOLO Testing
A custom parking sign dataset was created and annotated using Roboflow. YOLO models were trained and tested to identify individual parking sign panels.

Testing included evaluating detection performance on different parking sign images and experimenting with updated model versions.

### Gemini API Testing

**Test 1 – Single Parking Sign**

Tested whether Gemini could explain a single parking restriction while preserving the correct days, times, and exceptions.

**Test 2 – Multiple Parking Signs**

Tested whether Gemini could explain multiple parking restrictions separately. The prompt was refined after early responses combined restrictions or included unsupported information.

**Test 3 – Incomplete OCR Text**

Tested whether Gemini could recognize missing information without inventing details.

**Test 4 – Campus Signs**

Tested campus directions, building hours, and multiple instructions to evaluate how the AI handled different types of sign information.

### Backend Testing
- Tested the FastAPI backend locally.
- Tested the image processing pipeline with parking sign images.
- Verified the backend's accessibility from a mobile device on the same network.
- Continued troubleshooting image uploads from the Expo mobile application.

## Project Structure

The repository is organized into the following main directories:

- **frontend/** – React Native and Expo mobile application.
- **backend/** – FastAPI backend and image analysis pipeline.
- **ocr-testing/** – OCR experiments, YOLO testing scripts, and model development files.
- **api-testing/** – Gemini API testing and prompt experimentation.

## Current Limitations

- Mobile image uploading and complete end-to-end analysis still require further testing.
- Detection accuracy may vary depending on image quality, lighting, distance, and the number of signs.
- OCR may produce incomplete or incorrect text when signs are blurry or difficult to read.
- AI-generated explanations depend on the accuracy of extracted text and should not replace checking official posted parking restrictions.
- The backend currently runs locally and is not publicly deployed.
- Campus room identification, translation, and text-to-speech features are not yet implemented.

## Next Steps

- Complete frontend-to-backend integration testing.
- Improve parking sign detection and OCR accuracy.
- Test the complete application with additional real-world NYC parking signs.
- Continue improving handling of multiple signs and unclear restrictions.
- Implement campus room identification using SQLite.
- Compare Gemini API interpretation with a local LLM approach.
- Add translation and text-to-speech functionality.
- Improve the user interface and accessibility.
- Prepare the application for deployment and broader testing.

## Project Team

Developed by:

- **Muhammad Adeel Ashraf**
- **Fahad Haider**

Brooklyn College – Computer Science Capstone Project

## Disclaimer

ParkScan is an educational project currently under development. Parking sign interpretations generated by the application may contain errors or incomplete information. Users should always verify parking restrictions using official posted signs and applicable regulations.
