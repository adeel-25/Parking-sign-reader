
import { useState } from 'react';
import ParkingScanner from '@/components/parking-scanner';
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
  const [showParkingScanner, setShowParkingScanner] = useState(false);

  function comingSoon(feature: string) {
    Alert.alert(
      feature,
      'We will implement this feature next.'
    );
  }

  if (showParkingScanner) {
    return (
      <ParkingScanner
        onBack={() => setShowParkingScanner(false)}
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
                WELCOME TO
              </Text>

              <Text style={styles.appName}>
                Park
                <Text style={styles.cyanText}>
                  Scan
                </Text>
              </Text>

              <Text style={styles.tagline}>
                Your AI-powered scanning assistant
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>
                Γîù
              </Text>
            </View>
          </View>

          {/* Introduction */}
          <View style={styles.introCard}>
            <Text style={styles.sectionLabel}>
              SMART SCANNING
            </Text>

            <Text style={styles.introTitle}>
              What would you like to scan?
            </Text>

            <Text style={styles.introDescription}>
              Choose a feature to get started.
            </Text>
          </View>

          {/* Main Scanning Features */}
          <View style={styles.scanRow}>
            <Pressable
              style={({ pressed }) => [
                styles.scanCard,
                pressed && styles.pressed,
              ]}
              onPress={() => setShowParkingScanner(true)}
            >
              <View style={styles.scanIconContainer}>
                <Text style={styles.scanIcon}>
                  ≡ƒÜù
                </Text>
              </View>

              <Text style={styles.scanTitle}>
                Parking Signs
              </Text>

              <Text style={styles.scanDescription}>
                Scan signs and understand parking rules.
              </Text>

              <Text style={styles.scanArrow}>
                ΓåÆ
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.scanCard,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                comingSoon('Scan Campus Room')
              }
            >
              <View style={styles.scanIconContainer}>
                <Text style={styles.scanIcon}>
                  ≡ƒÅ½
                </Text>
              </View>

              <Text style={styles.scanTitle}>
                Campus Rooms
              </Text>

              <Text style={styles.scanDescription}>
                Find campus room information.
              </Text>

              <Text style={styles.scanArrow}>
                ΓåÆ
              </Text>
            </Pressable>
          </View>

          {/* Quick Access */}
          <Text style={styles.quickAccessHeading}>
            Quick Access
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.quickCard,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              comingSoon('Scan History')
            }
          >
            <View style={styles.quickIcon}>
              <Text style={styles.quickEmoji}>
                ≡ƒòÿ
              </Text>
            </View>

            <View style={styles.quickTextContainer}>
              <Text style={styles.quickTitle}>
                Scan History
              </Text>
              <Text style={styles.quickDescription}>
                View your previous scans
              </Text>
            </View>

            <Text style={styles.quickArrow}>
              ΓÇ║
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickCard,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              comingSoon('Settings')
            }
          >
            <View style={styles.quickIcon}>
              <Text style={styles.quickEmoji}>
                ΓÜÖ∩╕Å
              </Text>
            </View>

            <View style={styles.quickTextContainer}>
              <Text style={styles.quickTitle}>
                Settings
              </Text>
              <Text style={styles.quickDescription}>
                Language and accessibility preferences
              </Text>
            </View>

            <Text style={styles.quickArrow}>
              ΓÇ║
            </Text>
          </Pressable>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ParkScan
            </Text>
            <Text style={styles.footerSubtext}>
              Making parking and campus navigation easier
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
