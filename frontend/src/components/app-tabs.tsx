import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { AppState, DeviceEventEmitter, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const [language, setLanguage] = useState<'en' | 'es'>('en');

  useEffect(() => {
    let active = true;

    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(
          '@parkscan/preferred-language'
        );

        if (active) {
          setLanguage(saved === 'es' ? 'es' : 'en');
        }
      } catch (error) {
        console.log('Unable to load tab language:', error);
      }
    };

    loadLanguage();

    const languageSubscription = DeviceEventEmitter.addListener(
      'parkscan-language-changed',
      (code: 'en' | 'es') => {
        setLanguage(code);
      }
    );

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        loadLanguage();
      }
    });

    return () => {
      active = false;
      subscription.remove();
      languageSubscription.remove();
    };
  }, []);

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>
          {language === 'es' ? 'Inicio' : 'Home'}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>
          {language === 'es' ? 'Explorar' : 'Explore'}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
