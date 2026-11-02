import { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [signType, setSignType] = useState<'parking' | 'campus' | null>(null);
  const [photoSource, setPhotoSource] = useState<'camera' | 'library' | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      alert('Camera permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImages((prevImages) => [
        ...prevImages,
        result.assets[0].uri,
      ]);
      setPhotoSource('camera');
    }
  };

  const uploadPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImages((prevImages) => [
        ...prevImages,
        result.assets[0].uri,
      ]);
      setPhotoSource('library');
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setSelectedImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {!signType ? (
          <>
            <Text style={styles.title}>
              Parking & Campus Sign Reader
            </Text>

            <Text style={styles.subtitle}>
              Select the type of sign you want to scan.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setSignType('parking')}
            >
              <Text style={styles.primaryButtonText}>🅿️ Parking Sign</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setSignType('campus')}
            >
              <Text style={styles.primaryButtonText}>🏫 Campus Sign</Text>
            </TouchableOpacity>

          </>
        ) : selectedImages.length === 0 ? (
          <>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setSignType(null);
                setSelectedImages([]);
              }}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>
              {signType === 'parking' ? 'Parking Sign' : 'Campus Sign'}
            </Text>

            <Text style={styles.subtitle}>
              Take or upload a photo of a sign to get a simple explanation.
            </Text>

            {selectedImages.map((imageUri, index) => (
              <Image
                key={index}
                source={{ uri: imageUri }}
                style={{ width: 250, height: 250, alignSelf: 'center', marginBottom: 10 }}
                resizeMode="contain"
              />
            ))}

            {selectedImages.length > 0 && (
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Analyze Sign</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.primaryButton} onPress={takePhoto}>
              <Text style={styles.primaryButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={uploadPhoto}>
              <Text style={styles.secondaryButtonText}>Upload Photo</Text>
            </TouchableOpacity>

          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                Alert.alert(
                  'Discard selected photos?',
                  'Your selected photos will be removed.',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Discard',
                      style: 'destructive',
                      onPress: () => setSelectedImages([]),
                    },
                  ]
                );
              }}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <ScrollView
              style={{ width: '100%' }}
              contentContainerStyle={{
                paddingTop: 120,
                paddingBottom: 140,
              }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.title}>Image Review</Text>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 20,
                  marginBottom: 20,
                }}
              >
                {selectedImages.map((imageUri, index) => (
                  <View
                    key={index}
                    style={{
                      position: 'relative',
                      width: selectedImages.length === 1 ? 250 : 100,
                      height: selectedImages.length === 1 ? 180 : 120,
                    }}
                  >
                    <TouchableOpacity
                      style={{ width: '100%', height: '100%' }}
                      onPress={() => setPreviewImage(imageUri)}
                    >
                      <Image
                        source={{ uri: imageUri }}
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => removePhoto(index)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: 'black',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 16,
                          fontWeight: 'bold',
                        }}
                      >
                        ×
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { marginBottom: 15 },
                  selectedImages.length >= 3 && { opacity: 0.4 },
                ]}
                onPress={() => {
                  if (photoSource === 'camera') {
                    takePhoto();
                  } else {
                    uploadPhoto();
                  }
                }}
                disabled={selectedImages.length >= 3}
              >
                <Text style={styles.secondaryButtonText}>+ Add Another Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Analyze Sign</Text>
              </TouchableOpacity>

            </ScrollView>
            <Modal
              visible={previewImage !== null}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setPreviewImage(null)}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {previewImage && (
                  <Image
                    source={{ uri: previewImage }}
                    style={{
                      width: '95%',
                      height: '80%',
                    }}
                    resizeMode="contain"
                  />
                )}

                <TouchableOpacity
                  onPress={() => setPreviewImage(null)}
                  style={{
                    position: 'absolute',
                    top: 60,
                    right: 25,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: 'black',
                      fontSize: 24,
                      fontWeight: 'bold',
                    }}
                  >
                    ×
                  </Text>
                </TouchableOpacity>
              </View>
            </Modal>
          </>
        )}

      </View>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({

  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },

  backButtonText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#222222',
  },

  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },

  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 40,
    lineHeight: 24,
  },

  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 15,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },

  secondaryButton: {
    borderWidth: 2,
    borderColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
  },

  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});