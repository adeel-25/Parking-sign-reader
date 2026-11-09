
import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  Keyframe,
} from 'react-native-reanimated';

const INITIAL_SCALE_FACTOR =
  Dimensions.get('screen').height / 90;

const DURATION = 600;

// ParkScan Welcome Screen
export function AnimatedSplashOverlay() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [nativeSplashHidden, setNativeSplashHidden] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // Hide native Expo splash when our overlay is ready
  useEffect(() => {
    async function hideNativeSplash() {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn('Splash error:', error);
      } finally {
        setNativeSplashHidden(true);
      }
    }

    hideNativeSplash();
  }, []);

  // Close welcome screen when startup resources are ready
  useEffect(() => {
    if (imageLoaded && nativeSplashHidden) {
      const timer = setTimeout(() => {
        setFadeOut(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [imageLoaded, nativeSplashHidden]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.splashOverlay,
        fadeOut && styles.hiddenOverlay,
      ]}
      onLayout={() => {
        // Layout is ready
      }}
    >
      <Image
        source={require('@/assets/images/parkscan-welcome.png')}
        style={StyleSheet.absoluteFill}
        contentFit="fill"
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(true)}
      />

      {!fadeOut && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#00D9FF"
          />
          <Animated.Text style={styles.loadingText}>
            Loading ParkScan...
          </Animated.Text>
        </View>
      )}

      {fadeOut && (
        <SplashFadeOut
          onFinish={() => setVisible(false)}
        />
      )}
    </Animated.View>
  );
}

// Fade-out animation
function SplashFadeOut({
  onFinish,
}: {
  onFinish: () => void;
}) {
  useEffect(() => {
    // Allow the exit animation to finish
    const timer = setTimeout(onFinish, 450);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <Animated.View
      entering={new Keyframe({
        0: { opacity: 1 },
        100: { opacity: 0 },
      }).duration(400)}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
}

// Keep existing AnimatedIcon for other components
const keyframe = new Keyframe({
  0: {
    transform: [{ scale: INITIAL_SCALE_FACTOR }],
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
  },
  40: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
    easing: Easing.elastic(0.7),
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '0deg' }],
  },
  100: {
    transform: [{ rotateZ: '7200deg' }],
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View
        entering={glowKeyframe.duration(60 * 1000 * 4)}
        style={styles.glow}
      >
        <Image
          style={styles.glow}
          source={require('@/assets/images/logo-glow.png')}
        />
      </Animated.View>

      <Animated.View
        entering={keyframe.duration(DURATION)}
        style={styles.background}
      />

      <Animated.View
        style={styles.imageContainer}
        entering={logoKeyframe.duration(DURATION)}
      >
        <Image
          style={styles.image}
          source={require('@/assets/images/expo-logo.png')}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#04152B',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenOverlay: {
    opacity: 0,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },
  image: {
    width: 76,
    height: 71,
  },
  background: {
    borderRadius: 40,
    experimental_backgroundImage:
      'linear-gradient(180deg, #3C9FFE, #0274DF)',
    width: 128,
    height: 128,
    position: 'absolute',
  },
});
