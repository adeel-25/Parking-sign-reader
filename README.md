# ParkScan – Parking Sign and Campus Room Reader

ParkScan is a mobile application designed to help users understand parking restrictions and campus signs using computer vision, Optical Character Recognition (OCR), and Artificial Intelligence (AI).

Users capture or upload a photo of a parking sign or a campus room sign. The backend detects the sign panels and the directional arrows and parking symbols on them, extracts the text, and generates a plain-language explanation of the restrictions in English or Spanish.

This project is being developed as part of our Computer Science capstone project at Brooklyn College.

## Project Features

### Parking Sign Reader
- Capture parking sign images using the phone camera.
- Select existing images from the photo library.
- Preview and enlarge the selected image before analysis.
- Detect individual parking sign panels using a custom-trained YOLO26 model (v9).
- Detect directional arrows (left, right, and both directions) and parking symbols (nighttime and street-cleaning symbols).
- Match each detected arrow and symbol to the sign panel it belongs to.
- Extract text from each detected sign panel using PaddleOCR.
- Interpret each sign separately using Google Gemini, using the OCR text plus the arrows and symbols matched to that panel.
- Display the number of detected signs, the AI explanation, and the extracted text.
- Identify unclear or incomplete information instead of guessing missing restrictions.

### Campus Sign Reader
- Capture or upload a photo of a campus room or building sign.
- Extract text from the full image using PaddleOCR.
- Use Gemini to explain room numbers, building names, locations, directions, hours, and restrictions shown on the sign.

### Language Support
- English and Spanish interface.
- The preferred language is selected in **Settings** and saved on the device.
- The selected language is sent to the backend, and Gemini returns the explanation in that language while preserving the original sign text, numbers, days, and times.

### Scan History
- Successful scans are saved automatically on the device.
- Up to 50 recent scans are kept.
- Saved scans can be opened to review the detected sign count, AI explanation, and extracted text.
- Individual scans can be deleted.

### Planned Features
- Campus room lookup using a SQLite database of rooms, departments, and locations.
- Reading explanations aloud using text-to-speech.
- Additional accessibility improvements.

## Technologies Used

| Component | Technology |
|---|---|
| Mobile Frontend | React Native, Expo (SDK 58), Expo Router, TypeScript |
| On-Device Storage | AsyncStorage (language preference and scan history) |
| Backend | Python, FastAPI, Uvicorn |
| Object Detection | YOLO26 (Ultralytics), custom v9 model |
| Text Recognition | PaddleOCR |
| AI Interpretation | Google Gemini API |
| Dataset Preparation | Roboflow |
| Campus Database (Planned) | SQLite |
| Version Control | Git, GitHub |

## YOLO v9 Model

The backend uses the custom model at `ocr-testing/parking_sign_v9_best.pt`. It replaces the earlier v6 model (`ocr-testing/parking_sign_v6_best.pt`, kept in the repository for reference). The earlier model only detected sign panels. The v9 model detects these classes:

| Class | Meaning |
|---|---|
| `parking_sign_panel` | An individual parking sign panel |
| `arrow_left` | Arrow pointing left |
| `arrow_right` | Arrow pointing right |
| `arrow_both` | Arrow pointing both left and right |
| `night` | Nighttime-related symbol |
| `no_parking_cleaning` | Street-cleaning-related symbol |

**Matching arrows and symbols to panels:** After detection, the backend calculates the center point of each arrow and symbol. An arrow or symbol is assigned to a panel when its center falls inside that panel's bounding box. This keeps each sign's arrows and symbols attached to the correct panel when several signs appear in one photo. Panels are processed from top to bottom.

Arrow directions are reported relative to the photographed sign. They do not identify the direction of travel or exact street boundaries.

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
- Trained the YOLO26 v9 model to also detect directional arrows and parking symbols.

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
- Created the `/analyze` endpoint for parking sign analysis and the `/analyze-campus` endpoint for campus sign analysis.
- Integrated YOLO detection, PaddleOCR text extraction, and Gemini interpretation into the backend.
- Upgraded the backend to the YOLO26 v9 model with arrow and symbol detection.
- Implemented matching of arrows and symbols to individual sign panels.
- Added English and Spanish response support.
- Implemented image validation and structured analysis responses.
- Successfully tested the backend locally.
- Verified that the backend can be reached from the mobile device over the local network.

### 6. Mobile Frontend Development
- Developed the ParkScan mobile interface using React Native, Expo, and TypeScript.
- Created the home screen with parking and campus scanning options.
- Added camera and photo library image selection.
- Implemented image preview and full-screen image viewing.
- Implemented image uploads to the backend.
- Developed interface components for displaying the sign count, OCR text, and AI explanations.
- Added loading and error handling states.
- Added the Settings screen with English and Spanish language selection.
- Added the Scan History screen with saved scan details and deletion.

**Current Status:** The full parking sign pipeline (YOLO v9 detection, arrow and symbol matching, PaddleOCR, and Gemini interpretation) and the campus sign pipeline (PaddleOCR and Gemini) are implemented and have been tested locally with the backend running on a computer and the Expo app running on a phone on the same network. English and Spanish language support and on-device scan history are implemented. The SQLite campus room database and text-to-speech have not been implemented yet.

## System Architecture

ParkScan has two main parts:

- **Mobile app (`frontend/`):** An Expo app that captures or selects photos, converts them to JPEG, and sends them to the backend together with the user's selected language. It displays the results and saves them to scan history on the device.
- **Backend (`backend/main.py`):** A FastAPI server that loads the YOLO v9 model, PaddleOCR, and the Gemini client once at startup, then processes each uploaded image.

| Endpoint | Method | Purpose |
|---|---|---|
| `/` | GET | Health check. Returns `ParkScan backend is running`. |
| `/analyze` | POST | Parking sign analysis. Form fields: `file` (image), `language` (`en` or `es`). |
| `/analyze-campus` | POST | Campus sign analysis. Form fields: `file` (image), `language` (`en` or `es`). |

### Parking Sign Pipeline

1. **Image Input:** The user captures or selects a parking sign image. The app converts it to JPEG and uploads it.
2. **Object Detection:** YOLO v9 detects sign panels, directional arrows, and parking symbols.
3. **Panel Matching:** Arrows and symbols are assigned to the panel that contains their center point.
4. **Image Cropping:** Each detected panel is cropped, ordered from top to bottom.
5. **OCR:** PaddleOCR extracts the text from each cropped panel.
6. **AI Interpretation:** Gemini receives the text, arrows, and symbols for each panel and explains each sign separately in the selected language.
7. **Results:** The app displays the sign count, explanation, extracted text, and warnings, and saves the scan to history.

**Processing Pipeline:**

Camera / Image Upload → YOLO v9 Detection (panels, arrows, symbols) → Arrow and Symbol Matching → Panel Cropping → PaddleOCR → Gemini AI → Results Display → Scan History

### Campus Sign Pipeline

Camera / Image Upload → PaddleOCR (full image) → Gemini AI → Results Display → Scan History

The parking-specific YOLO model is not used for campus signs.

## Testing and Evaluation

### OCR Testing
Tesseract, EasyOCR, and PaddleOCR were evaluated using parking sign images. Testing showed that directly applying OCR to complex images can produce inaccurate or incomplete text, particularly when signs are small or contain multiple panels.

Object detection was introduced to isolate individual signs before OCR processing.

### YOLO Testing
A custom parking sign dataset was created and annotated using Roboflow. YOLO models were trained and tested to identify individual parking sign panels.

Testing included evaluating detection performance on different parking sign images and experimenting with updated model versions. The v9 model added classes for directional arrows and parking symbols.

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
- Tested image uploads from the Expo mobile application.

## Project Structure

The repository is organized into the following main directories:

- **frontend/** – React Native and Expo mobile application.
  - `src/app/` – Screens and navigation (Expo Router).
  - `src/components/parking-scanner.tsx` – Parking and campus scanner screen, including the backend URL (`API_BASE_URL`).
  - `src/components/scan-history-screen.tsx` and `src/storage/scan-history.ts` – Scan history.
  - `src/components/settings-screen.tsx` – Language settings.
  - `src/i18n/translations.ts` – English and Spanish interface text.
- **backend/** – FastAPI backend (`main.py`) and Python dependencies (`requirements.txt`).
- **ocr-testing/** – OCR experiments, YOLO testing scripts, and trained model weights (`parking_sign_v6_best.pt`, `parking_sign_v9_best.pt`).
- **api-testing/** – Gemini API testing scripts and the `.env` file containing the Gemini API key (an `.env.example` template is provided).

## Installation and Setup

These instructions are for running ParkScan locally for the first time on Windows. The backend runs on your computer, and the mobile app runs on your phone through Expo Go.

> **Note:** These steps were written from the current project files. A full clean installation on a new machine has not been tested yet. If you run into a problem, please open an issue.

### 1. Prerequisites

Install the following before you begin:

| Tool | Notes |
|---|---|
| [Git](https://git-scm.com/downloads) | Used to clone the repository. |
| [Python 3.11](https://www.python.org/downloads/) | During installation, check **Add Python to PATH**. |
| [Node.js](https://nodejs.org/) (LTS) | Includes **npm**. |
| [Expo Go](https://expo.dev/go) | Install on your iPhone or Android phone. The installed Expo Go version must support the project's Expo SDK (SDK 58). |

You also need a **Google Gemini API key**, which you can create in [Google AI Studio](https://aistudio.google.com/).

Check that the tools are installed:

```powershell
git --version
py -3.11 --version
node --version
npm --version
```

### 2. Clone the Repository

```powershell
git clone https://github.com/adeel-25/Parking-sign-reader.git
cd Parking-sign-reader
```

All remaining commands assume you start in the repository root folder.

### 3. Create and Activate a Python Virtual Environment

From the repository root:

```powershell
py -3.11 -m venv .venv
.venv\Scripts\activate
```

When the environment is active, your terminal prompt starts with `(.venv)`.

> **PowerShell tip:** If activation fails with a message about running scripts being disabled, run this once and then try again:
>
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
> ```
>
> In Command Prompt (cmd), use `.venv\Scripts\activate.bat` instead.

### 4. Install Backend Dependencies

With the virtual environment active:

```powershell
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

This installs FastAPI, Uvicorn, PaddleOCR, PaddlePaddle, Ultralytics (YOLO), PyTorch, OpenCV, and the Gemini SDK. The download is large and may take several minutes.

### 5. Add Your Gemini API Key

Copy the example environment file:

```powershell
copy api-testing\.env.example api-testing\.env
```

Open `api-testing/.env` in a text editor and replace the placeholder with your own key:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Never commit your `.env` file or share your API key.** The `.env` file is already listed in `.gitignore`.

### 6. Start the FastAPI Backend

From the repository root, with the virtual environment active:

```powershell
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

- `--host 0.0.0.0` allows your phone to reach the backend over the local network.
- Startup can take a while because the YOLO model, PaddleOCR, and the Gemini client are loaded at startup.
- **On the first run, PaddleOCR may download its OCR models.** This requires an internet connection and can take several minutes. Later runs use the downloaded models.

Check that the backend is running by opening this address in a browser on your computer:

```
http://localhost:8000
```

You should see:

```json
{"message": "ParkScan backend is running"}
```

Leave this terminal open while you use the app.

### 7. Find Your Computer's IPv4 Address

Open a new terminal and run:

```powershell
ipconfig
```

Find the network adapter you are currently using (usually **Wireless LAN adapter Wi-Fi**) and copy its **IPv4 Address**, for example `192.168.1.25`.

> Your IP address can change when you switch networks or reconnect. If the app stops connecting, check this value again.

### 8. Point the App to Your Backend

Open `frontend/src/components/parking-scanner.tsx` and update `API_BASE_URL` near the top of the file with your IPv4 address. Keep port `8000`:

```ts
const API_BASE_URL = 'http://YOUR_IPV4_ADDRESS:8000';
```

For example:

```ts
const API_BASE_URL = 'http://192.168.1.25:8000';
```

Both parking sign scanning (`/analyze`) and campus sign scanning (`/analyze-campus`) use this address.

> This is a local setting. Avoid committing your personal IP address unless your team has agreed on it.

### 9. Install Frontend Dependencies

In a new terminal (the backend should keep running in the first one):

```powershell
cd frontend
npm ci
```

`npm ci` installs the exact dependency versions listed in `frontend/package-lock.json`.

### 10. Start Expo

From the `frontend` folder:

```powershell
npx expo start
```

A QR code appears in the terminal.

### 11. Connect Your Phone and Test the App

1. Connect your **computer and phone to the same Wi-Fi network** (or connect the computer to your phone's hotspot).
2. Open the QR code:
   - **Android:** Scan it with the Expo Go app.
   - **iPhone:** Scan it with the Camera app, then open it in Expo Go.
3. Before testing the app, open `http://YOUR_IPV4_ADDRESS:8000` in your phone's browser to confirm the phone can reach the backend.
4. In ParkScan, choose **Parking Sign Scanner** or **Campus Rooms**, take or upload a photo, and tap **Analyze**.
5. Optionally, change the language in **Settings** and review saved results in **Scan History**.

### 12. Troubleshooting

**The app shows "Unable to connect to the backend" or the analysis never finishes**
- Make sure the backend terminal is still running and shows no errors.
- Confirm that `API_BASE_URL` matches your computer's current IPv4 address and uses port `8000`.
- Make sure the computer and phone are on the same network. Guest or public Wi-Fi networks often block connections between devices.
- Make sure the backend was started with `--host 0.0.0.0`.
- Open `http://YOUR_IPV4_ADDRESS:8000` in the phone's browser. If it does not load, the problem is the network or firewall, not the app.
- Windows Firewall may block incoming connections. When Windows asks, allow Python on **Private networks**, or add an inbound rule for TCP port `8000`. Also check that your Wi-Fi network is set to **Private** in Windows settings.
- After changing `API_BASE_URL`, reload the app in Expo Go (shake the phone and tap **Reload**, or press `r` in the Expo terminal).

**The backend stops with `GEMINI_API_KEY is missing from api-testing/.env`**
- Confirm that the file is named exactly `.env` (not `.env.txt`) and is in the `api-testing` folder.
- Confirm that the line reads `GEMINI_API_KEY=your_key` with no quotes or spaces around `=`.
- Restart the backend after editing the file.

**The analysis fails with "Unable to analyze the parking sign" or "Unable to analyze the campus sign"**
- Check the backend terminal for the full error message.
- If the message mentions an invalid API key, authentication, permission, or quota, verify your key in Google AI Studio, update `api-testing/.env`, and restart the backend.

**`uvicorn` is not recognized, or modules such as `fastapi` cannot be found**
- Activate the virtual environment (`.venv\Scripts\activate`) and run the command from the repository root.

**Expo Go reports an incompatible SDK version**
- Update Expo Go to the latest version from your phone's app store.

## Current Limitations

- Detection accuracy may vary depending on image quality, lighting, distance, angle, and the number of signs.
- Directional arrows and parking symbols are detected automatically but may be missed or misclassified.
- Arrows and symbols are matched to panels by their center point, which may fail when detections overlap neighboring panels.
- Only two parking symbol types (`night` and `no_parking_cleaning`) are currently detected.
- Arrow directions are relative to the photo and do not identify street boundaries or the direction of travel.
- OCR may produce incomplete or incorrect text when signs are blurry or difficult to read.
- AI-generated explanations depend on the accuracy of detection and extracted text and should not replace checking official posted parking restrictions.
- Campus sign analysis relies on OCR and Gemini only. It does not yet look up rooms in a campus database.
- Text-to-speech is not yet implemented.
- Scan history is stored only on the device and is not synced between devices.
- The backend URL is hard-coded in the frontend and must be updated manually when the computer's IP address changes.
- The backend currently runs locally and is not publicly deployed.
- A clean installation on a new machine has not been fully tested yet.

## Next Steps

- Implement campus room identification using a SQLite database.
- Add text-to-speech for reading explanations aloud.
- Improve parking sign, arrow, and symbol detection accuracy, and add more symbol types.
- Test the complete application with additional real-world NYC parking signs.
- Continue improving handling of multiple signs and unclear restrictions.
- Compare Gemini API interpretation with a local LLM approach.
- Move the backend URL into a configuration setting instead of hard-coding it.
- Test the installation steps on a clean machine.
- Improve the user interface and accessibility.
- Prepare the application for deployment and broader testing.

## Project Team

Developed by:

- **Muhammad Adeel Ashraf**
- **Fahad Haider**

Brooklyn College – Computer Science Capstone Project

## Disclaimer

ParkScan is an educational project currently under development. Parking sign interpretations generated by the application may contain errors or incomplete information. Users should always verify parking restrictions using official posted signs and applicable regulations.
