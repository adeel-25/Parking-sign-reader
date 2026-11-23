
import { useEffect, useState } from 'react';
import ParkingScanner from '@/components/parking-scanner';
import { Ionicons } from '@expo/vector-icons';
import ScanHistoryScreen from '@/components/scan-history-screen';
import SettingsScreen from '@/components/settings-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, type LanguageCode } from '@/i18n/translations';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#07182B',
  card: '#102C46',
  cardLight: '#153A58',
  cyan: '#40D8FF',
  white: '#FFFFFF',
  muted: '#AFC2D6',
};

export default function HomeScreen() {
  const [scannerMode, setScannerMode] = useState<'parking' | 'campus' | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const t = translations[language];

  useEffect(() => {
    async function loadLanguage() {
      try {
        const saved = await AsyncStorage.getItem('@parkscan/preferred-language');
        setLanguage(saved === 'es' ? 'es' : 'en');
      } catch (error) {
        console.error('Unable to load language preference:', error);
      }
    }

    loadLanguage();
  }, [showSettings]);

  function comingSoon(feature: string) {
    Alert.alert(
      feature,
      'We will implement this feature next.'
    );
  }

  if (showSettings) {
    return (
      <SettingsScreen
        onBack={() => setShowSettings(false)}
      />
    );
  }

  if (showHistory) {
    return (
      <ScanHistoryScreen
        onBack={() => setShowHistory(false)}
      />
    );
  }

  if (scannerMode !== null) {
    return (
      <ParkingScanner
        mode={scannerMode}
        onBack={() => setScannerMode(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>
                {t.welcomeTo}
              </Text>

              <Text style={styles.appName}>
                Park
                <Text style={styles.cyanText}>
                  Scan
                </Text>
              </Text>

              <Text style={styles.tagline}>
                {t.tagline}
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons
                name="scan-outline"
                size={34}
                color={COLORS.cyan}
              />
            </View>
          </View>

          {/* Introduction */}
          <View style={styles.introCard}>
            <Text style={styles.sectionLabel}>
              {t.smartScanning}
            </Text>

            <Text style={styles.introTitle}>
              {t.scanQuestion}
            </Text>

            <Text style={styles.introDescription}>
              {t.chooseFeature}
            </Text>
          </View>

          {/* Main Scanning Features */}
          <View style={styles.scanRow}>
            <Pressable
              style={({ pressed }) => [
                styles.scanCard,
                pressed && styles.pressed,
              ]}
              onPress={() => setScannerMode('parking')}
            >
              <View style={styles.scanIconContainer}>
                <Ionicons
                  name="car-outline"
                  size={29}
                  color={COLORS.cyan}
                />
              </View>

              <Text style={styles.scanTitle}>
                {t.parkingScanner}
              </Text>

              <Text style={styles.scanDescription}>
                {t.parkingDescription}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={25}
                color={COLORS.cyan}
                style={{ marginTop: 10, alignSelf: 'flex-end' }}
              />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.scanCard,
                pressed && styles.pressed,
              ]}
              onPress={() => setScannerMode('campus')}
            >
              <View style={styles.scanIconContainer}>
                <Ionicons
                  name="school-outline"
                  size={29}
                  color={COLORS.cyan}
                />
              </View>

              <Text style={styles.scanTitle}>
                {t.campusTitle}
              </Text>

              <Text style={styles.scanDescription}>
                {t.campusDescription}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={25}
                color={COLORS.cyan}
                style={{ marginTop: 10, alignSelf: 'flex-end' }}
              />
            </Pressable>
          </View>

          {/* Quick Access */}
          <Text style={styles.quickAccessHeading}>
            {t.quickAccess}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.quickCard,
              pressed && styles.pressed,
            ]}
            onPress={() => setShowHistory(true)}
          >
            <View style={styles.quickIcon}>
              <Ionicons
                name="time-outline"
                size={25}
                color={COLORS.cyan}
              />
            </View>

            <View style={styles.quickTextContainer}>
              <Text style={styles.quickTitle}>
                {t.scanHistory}
              </Text>
              <Text style={styles.quickDescription}>
                {t.historyDescription}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={28}
              color={COLORS.cyan}
              style={{ marginLeft: 10 }}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickCard,
              pressed && styles.pressed,
            ]}
            onPress={() => setShowSettings(true)}
          >
            <View style={styles.quickIcon}>
              <Ionicons
                name="settings-outline"
                size={25}
                color={COLORS.cyan}
              />
            </View>

            <View style={styles.quickTextContainer}>
              <Text style={styles.quickTitle}>
                {t.settings}
              </Text>
              <Text style={styles.quickDescription}>
                {t.settingsDescription}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={28}
              color={COLORS.cyan}
              style={{ marginLeft: 10 }}
            />
          </Pressable>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ParkScan
            </Text>
            <Text style={styles.footerSubtext}>
              {t.footerTagline}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 110,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },

  welcomeText: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
  },

  appName: {
    color: COLORS.white,
    fontSize: 38,
    fontWeight: 'bold',
    marginTop: 4,
  },

  cyanText: {
    color: COLORS.cyan,
  },

  tagline: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
  },

  headerIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: COLORS.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#286087',
  },

  headerIconText: {
    fontSize: 34,
    color: COLORS.cyan,
  },

  introCard: {
    backgroundColor: COLORS.card,
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#204662',
    marginBottom: 20,
  },

  sectionLabel: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  introTitle: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  introDescription: {
    color: COLORS.muted,
    fontSize: 14,
  },

  scanRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },

  scanCard: {
    flex: 1,
    minHeight: 215,
    backgroundColor: COLORS.cardLight,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#286087',
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  scanIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#0C2B43',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  scanIcon: {
    fontSize: 29,
  },

  scanTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  scanDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
  },

  scanArrow: {
    color: COLORS.cyan,
    fontSize: 25,
    marginTop: 10,
    textAlign: 'right',
  },

  quickAccessHeading: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 17,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#204662',
  },

  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  quickEmoji: {
    fontSize: 23,
  },

  quickTextContainer: {
    flex: 1,
  },

  quickTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },

  quickDescription: {
    color: COLORS.muted,
    fontSize: 12,
  },

  quickArrow: {
    color: COLORS.cyan,
    fontSize: 28,
    marginLeft: 10,
  },

  footer: {
    alignItems: 'center',
    marginTop: 35,
  },

  footerText: {
    color: COLORS.cyan,
    fontSize: 16,
    fontWeight: 'bold',
  },

  footerSubtext: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
});
