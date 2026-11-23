
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ActivityIndicator,
    Alert,
    DeviceEventEmitter,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { translations } from '@/i18n/translations';

export const LANGUAGE_KEY = '@parkscan/preferred-language';

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]['code'];

type Props = {
    onBack: () => void;
};

export default function SettingsScreen({ onBack }: Props) {
    const [language, setLanguage] = useState<LanguageCode>('en');
    const t = translations[language];
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function loadLanguage() {
            try {
                const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
                const match = LANGUAGES.find(item => item.code === saved);

                if (match) {
                    setLanguage(match.code);
                }
            } catch {
                Alert.alert(
                    translations[language].error,
                    translations[language].loadLanguageError
                );
            } finally {
                setLoading(false);
            }
        }

        loadLanguage();
    }, []);

    async function selectLanguage(code: LanguageCode) {
        if (saving || code === language) return;

        setSaving(true);

        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, code);
            setLanguage(code);

            DeviceEventEmitter.emit('parkscan-language-changed', code);
        } catch {
            Alert.alert(
                t.error,
                t.saveLanguageError
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.content}>
                    <Pressable onPress={onBack} style={styles.back}>
                        <Ionicons name="arrow-back" size={24} color="#40D8FF" />
                        <Text style={styles.backText}>{t.backToHome}</Text>
                    </Pressable>

                    <Text style={styles.title}>{t.settings}</Text>
                    <Text style={styles.subtitle}>
                        {t.settingsSubtitle}
                    </Text>

                    <View style={styles.card}>
                        <View style={styles.headingRow}>
                            <Ionicons name="language-outline" size={25} color="#40D8FF" />
                            <Text style={styles.heading}>{t.preferredLanguage}</Text>
                        </View>

                        <Text style={styles.description}>
                            {t.languageDescription}
                        </Text>

                        {loading ? (
                            <ActivityIndicator color="#40D8FF" />
                        ) : (
                            LANGUAGES.map(item => (
                                <Pressable
                                    key={item.code}
                                    disabled={saving}
                                    onPress={() => selectLanguage(item.code)}
                                    style={styles.languageRow}
                                >
                                    <Text style={styles.languageText}>
                                        {item.code === 'en' ? t.englishLabel : t.spanishLabel}
                                    </Text>
                                    <Ionicons
                                        name={
                                            language === item.code
                                                ? 'radio-button-on'
                                                : 'radio-button-off'
                                        }
                                        size={24}
                                        color={language === item.code ? '#40D8FF' : '#AFC2D6'}
                                    />
                                </Pressable>
                            ))
                        )}
                    </View>

                    <View style={styles.infoCard}>
                        <Ionicons
                            name="information-circle-outline"
                            size={24}
                            color="#40D8FF"
                        />
                        <Text style={styles.infoText}>
                            {t.languageInfo}
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
        backgroundColor: '#07182B',
    },
    safeArea: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 120,
    },
    back: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 30,
    },
    backText: {
        color: '#40D8FF',
        fontSize: 16,
        fontWeight: '600',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    subtitle: {
        color: '#AFC2D6',
        fontSize: 15,
        marginBottom: 25,
    },
    card: {
        backgroundColor: '#102C46',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#286087',
        padding: 18,
    },
    headingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    heading: {
        color: '#FFFFFF',
        fontSize: 19,
        fontWeight: 'bold',
    },
    description: {
        color: '#AFC2D6',
        fontSize: 14,
        lineHeight: 21,
        marginBottom: 18,
    },
    languageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#286087',
    },
    languageText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    infoCard: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: '#153A58',
        borderRadius: 16,
        padding: 18,
        marginTop: 22,
    },
    infoText: {
        flex: 1,
        color: '#AFC2D6',
        fontSize: 13,
        lineHeight: 21,
    },
});
