
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { File as ExpoFile } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { fetch as expoFetch } from 'expo/fetch';

const API_URL = 'http://172.20.10.2:8000/analyze';

type ParkingScannerProps = {
  onBack: () => void;
};

type AnalysisResult = {
  success: boolean;
  message?: string;
  ocr_text: string;
  explanation: string;
  sign_count: number;
  warning?: string;
};

export default function ParkingScanner({
  onBack,
}: ParkingScannerProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function selectPhoto(uri: string) {
    try {
      // Convert camera/gallery images to JPEG.
      const convertedImage =
        await ImageManipulator.manipulateAsync(
          uri,
          [],
          {
            compress: 0.9,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );

      console.log('Original photo:', uri);
      console.log('Converted JPEG:', convertedImage.uri);

      setPhoto(convertedImage.uri);
      setAnalysis(null);
      setError(null);
    } catch (err) {
      console.log('Image conversion error:', err);

      Alert.alert(
        'Image Error',
        'Unable to convert the selected photo to JPEG.'
      );
    }
  }

  async function takePhoto() {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Camera Permission',
          'Please allow camera access to take a photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        await selectPhoto(result.assets[0].uri);
      }
    } catch (err) {
      console.log('Camera error:', err);

      Alert.alert(
        'Camera Error',
        'Unable to open the camera.'
      );
    }
  }

  async function uploadPhoto() {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: false,
          quality: 1,
        });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];

        console.log('Selected image:', asset.fileName);
        console.log('Original MIME:', asset.mimeType);

        await selectPhoto(asset.uri);
      }
    } catch (err) {
      console.log('Gallery error:', err);

      Alert.alert(
        'Gallery Error',
        'Unable to open your photo library.'
      );
    }
  }

  function removePhoto() {
    if (loading) return;

    setPhoto(null);
    setAnalysis(null);
    setError(null);
  }

  async function analyzePhoto() {
    if (!photo || loading) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const imageFile = new ExpoFile(photo);

      console.log('----- IMAGE UPLOAD DEBUG -----');
      console.log('Photo URI:', photo);
      console.log('File name:', imageFile.name);
      console.log('File type:', imageFile.type);
      console.log('File size:', imageFile.size);
      console.log('File exists:', imageFile.exists);
      console.log('API URL:', API_URL);
      console.log('------------------------------');

      if (!imageFile.exists || imageFile.size === 0) {
        throw new Error(
          'The selected image file is missing or empty.'
        );
      }

      const formData = new FormData();
      formData.append('file', imageFile);

      console.log('Uploading JPEG to FastAPI...');

      // Expo fetch supports ExpoFile uploads.
      const response = await expoFetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      console.log('Server status:', response.status);

      const result: AnalysisResult & {
        detail?: string;
      } = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail ||
            'The server could not analyze the photo.'
        );
      }

      if (!result.success) {
        setError(
          result.message ||
            'No readable parking signs were detected.'
        );
        return;
      }

      console.log('Analysis successful!');
      console.log('Detected signs:', result.sign_count);

      setAnalysis(result);
    } catch (err) {
      console.log('Analysis error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to connect to the backend.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    if (loading) {
      Alert.alert(
        'Analysis in Progress',
        'Please wait until the analysis finishes.'
      );
      return;
    }

    if (!photo) {
      onBack();
      return;
    }

    Alert.alert(
      'Leave Parking Scanner?',
      'Your selected photo and analysis will be cleared.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: onBack,
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ← Back to Home
          </Text>
        </Pressable>

        <Text style={styles.label}>PARKSCAN</Text>

        <Text style={styles.title}>
          Parking Sign Scanner
        </Text>

        <Text style={styles.subtitle}>
          Capture a parking sign to understand its rules
          and restrictions.
        </Text>

        {!photo ? (
          <View style={styles.emptyCard}>
            <Text style={styles.cameraIcon}>📷</Text>

            <Text style={styles.emptyTitle}>
              Ready to Scan
            </Text>

            <Text style={styles.subtitle}>
              Take a photo or choose one from your gallery.
            </Text>
          </View>
        ) : (
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>
              Image Review
            </Text>

            <View style={styles.photoCard}>
              <Pressable
                onPress={() => setPreviewPhoto(photo)}
              >
                <Image
                  source={{ uri: photo }}
                  style={styles.photo}
                  resizeMode="contain"
                />

                <Text style={styles.previewHint}>
                  Tap image to enlarge
                </Text>
              </Pressable>

              {!loading && (
                <Pressable
                  style={styles.removeButton}
                  onPress={removePhoto}
                >
                  <Text style={styles.removeText}>
                    ✕ Remove Photo
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {!photo && (
          <>
            <Pressable
              style={styles.primaryButton}
              onPress={takePhoto}
            >
              <Text style={styles.primaryButtonText}>
                📷 Take Photo
              </Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={uploadPhoto}
            >
              <Text style={styles.secondaryButtonText}>
                🖼️ Upload from Gallery
              </Text>
            </Pressable>
          </>
        )}

        {photo && !loading && (
          <Pressable
            style={styles.analyzeButton}
            onPress={analyzePhoto}
          >
            <Text style={styles.primaryButtonText}>
              {analysis
                ? 'Analyze Again ↻'
                : 'Analyze Parking Sign →'}
            </Text>
          </Pressable>
        )}

        {loading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator
              size="large"
              color="#40D8FF"
            />

            <Text style={styles.loadingTitle}>
              Analyzing Parking Signs...
            </Text>

            <Text style={styles.subtitle}>
              Detecting signs, reading text, and generating
              an AI explanation.
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              Analysis Failed
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>

            <Text style={styles.errorHint}>
              Check the Expo terminal for image-upload
              diagnostic information.
            </Text>
          </View>
        )}

        {analysis && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>
              Analysis Results
            </Text>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>
                DETECTED SIGNS
              </Text>

              <Text style={styles.signCount}>
                {analysis.sign_count}
              </Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>
                AI EXPLANATION
              </Text>

              <Text style={styles.resultText}>
                {analysis.explanation ||
                  'No explanation returned.'}
              </Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>
                EXTRACTED TEXT (OCR)
              </Text>

              <Text style={styles.ocrText}>
                {analysis.ocr_text}
              </Text>
            </View>

            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                ⚠️{' '}
                {analysis.warning ||
                  'Always check the physical parking signs before parking.'}
              </Text>

              <Text style={styles.warningText}>
                Directional arrows and parking symbols may
                not be recognized.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={previewPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewPhoto(null)}
      >
        <View style={styles.modalContainer}>
          {previewPhoto && (
            <Image
              source={{ uri: previewPhoto }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}

          <Pressable
            style={styles.closeButton}
            onPress={() => setPreviewPhoto(null)}
          >
            <Text style={styles.primaryButtonText}>
              Close ✕
            </Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07182B',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 110,
  },

  backButton: {
    paddingVertical: 12,
    marginBottom: 20,
  },

  backText: {
    color: '#40D8FF',
    fontSize: 16,
    fontWeight: '600',
  },

  label: {
    color: '#40D8FF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: 'bold',
    marginTop: 10,
  },

  subtitle: {
    color: '#AFC2D6',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },

  emptyCard: {
    backgroundColor: '#102C46',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#286087',
    alignItems: 'center',
    padding: 32,
    marginVertical: 28,
  },

  cameraIcon: {
    fontSize: 50,
    marginBottom: 15,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  reviewSection: {
    marginVertical: 25,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  photoCard: {
    backgroundColor: '#102C46',
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#204662',
  },

  photo: {
    width: '100%',
    height: 230,
  },

  previewHint: {
    color: '#AFC2D6',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },

  removeButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },

  removeText: {
    color: '#FF9999',
    fontSize: 14,
    fontWeight: '600',
  },

  primaryButton: {
    backgroundColor: '#087CA3',
    borderRadius: 14,
    padding: 17,
    alignItems: 'center',
    marginBottom: 12,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  secondaryButton: {
    borderColor: '#40D8FF',
    borderWidth: 1,
    borderRadius: 14,
    padding: 17,
    alignItems: 'center',
    marginBottom: 12,
  },

  secondaryButtonText: {
    color: '#40D8FF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  analyzeButton: {
    backgroundColor: '#086A80',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
  },

  loadingCard: {
    backgroundColor: '#102C46',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    marginTop: 20,
  },

  loadingTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },

  errorCard: {
    backgroundColor: '#3B2028',
    borderColor: '#B85463',
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
  },

  errorTitle: {
    color: '#FF9999',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 21,
  },

  errorHint: {
    color: '#D6B7C0',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 10,
  },

  resultsSection: {
    marginTop: 30,
  },

  resultCard: {
    backgroundColor: '#102C46',
    borderRadius: 16,
    padding: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#204662',
  },

  resultLabel: {
    color: '#40D8FF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  signCount: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
  },

  resultText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 24,
  },

  ocrText: {
    color: '#AFC2D6',
    fontSize: 14,
    lineHeight: 22,
  },

  warningCard: {
    backgroundColor: '#2B2B25',
    borderRadius: 14,
    padding: 16,
    marginTop: 15,
  },

  warningText: {
    color: '#F0D89C',
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 6,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fullImage: {
    width: '95%',
    height: '75%',
  },

  closeButton: {
    backgroundColor: '#087CA3',
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
  },
});
