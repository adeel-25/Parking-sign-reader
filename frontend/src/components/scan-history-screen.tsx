
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import {
    deleteScan,
    getScanHistory,
    type SavedScan,
} from '@/storage/scan-history';
import { translations } from '@/i18n/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
    onBack: () => void;
};

const COLORS = {
    background: '#07182B',
    card: '#102C46',
    cyan: '#40D8FF',
    white: '#FFFFFF',
    muted: '#AFC2D6',
};

export default function ScanHistoryScreen({ onBack }: Props) {
    const [language, setLanguage] = useState<'en' | 'es'>('en');
    const t = translations[language];
    useEffect(() => {
        AsyncStorage.getItem('@parkscan/preferred-language')
            .then((savedLanguage) => {
                if (savedLanguage === 'en' || savedLanguage === 'es') {
                    setLanguage(savedLanguage);
                }
            })
            .catch(() => { });
    }, []);
    const [history, setHistory] = useState<SavedScan[]>([]);
    const [selected, setSelected] = useState<SavedScan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadHistory = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            setHistory(await getScanHistory());
        } catch {
            setError(t.loadHistoryError);
        } finally {
            setLoading(false);
        }
    }, [t.loadHistoryError]);

    useEffect(() => {
        void loadHistory();
    }, [t.loadHistoryError]);

    function confirmDelete(scan: SavedScan) {
        Alert.alert(
            t.deleteScanTitle,
            t.deleteScanMessage,
            [
                { text: t.cancel, style: 'cancel' },
                {
                    text: t.delete,
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteScan(scan.id);
                            setSelected(null);
                            await loadHistory();
                        } catch {
                            Alert.alert(t.error, t.deleteScanError);
                        }
                    },
                },
            ]
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Pressable
                    onPress={() => selected ? setSelected(null) : onBack()}
                    style={styles.backButton}
                >
                    <Ionicons
                        name="arrow-back"
                        size={20}
                        color={COLORS.cyan}
                    />
                    <Text style={styles.backText}>
                        {selected ? t.backToHistory : t.backToHome}
                    </Text>
                </Pressable>

                <Text style={styles.heading}>
                    {selected ? t.savedAnalysis : t.scanHistory}
                </Text>

                {selected ? (
                    <View>
                        <Text style={styles.subtitle}>
                            {selected.mode === 'parking'
                                ? t.parkingScanner
                                : t.campusTitle}{' '}
                            •{new Date(selected.createdAt).toLocaleString(
                                language === 'es' ? 'es-ES' : 'en-US'
                            )}
                        </Text>

                        <View style={styles.card}>
                            <Text style={styles.label}>{t.detectedSigns}</Text>
                            <Text style={styles.count}>{selected.signCount}</Text>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.label}>{t.aiExplanation}</Text>
                            <Markdown style={markdownStyles}>
                                {selected.explanation || t.noExplanation}
                            </Markdown>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.label}>{t.extractedText}</Text>
                            <Text style={styles.subtitle}>
                                {selected.ocrText || t.noOcrText}
                            </Text>
                        </View>

                        {selected.warning ? (
                            <View style={styles.warningCard}>
                                <Text style={styles.warningText}>
                                    {selected.warning?.toLowerCase().includes(
                                        'ai explanations are for guidance only'
                                    )
                                        ? t.savedAiWarning
                                        : selected.warning}
                                </Text>
                            </View>
                        ) : null}

                        <View style={styles.warningCard}>
                            <Text style={styles.warningText}>
                                {t.savedScanWarning}
                            </Text>
                        </View>

                        <Pressable
                            style={styles.deleteButton}
                            onPress={() => confirmDelete(selected)}
                        >
                            <Text style={styles.deleteText}>{t.deleteThisScan}</Text>
                        </Pressable>
                    </View>
                ) : (
                    <>
                        <Text style={styles.subtitle}>
                            {t.historySubtitle}
                        </Text>

                        {loading ? (
                            <ActivityIndicator
                                size="large"
                                color={COLORS.cyan}
                                style={{ marginTop: 40 }}
                            />
                        ) : error ? (
                            <View style={styles.card}>
                                <Text style={styles.subtitle}>{error}</Text>
                                <Pressable onPress={() => void loadHistory()}>
                                    <Text style={styles.backText}>{t.tryAgain}</Text>
                                </Pressable>
                            </View>
                        ) : history.length === 0 ? (
                            <View style={styles.card}>
                                <Ionicons
                                    name="time-outline"
                                    size={40}
                                    color={COLORS.cyan}
                                />
                                <Text style={styles.emptyTitle}>{t.noSavedScans}</Text>
                                <Text style={styles.subtitle}>
                                    {t.emptyHistoryDescription}
                                </Text>
                            </View>
                        ) : (
                            history.map((scan) => (
                                <Pressable
                                    key={scan.id}
                                    style={styles.card}
                                    onPress={() => setSelected(scan)}
                                >
                                    <View style={styles.listRow}>
                                        <Ionicons
                                            name={scan.mode === 'parking'
                                                ? 'car-outline'
                                                : 'school-outline'}
                                            size={28}
                                            color={COLORS.cyan}
                                        />

                                        <View style={styles.listText}>
                                            <Text style={styles.itemTitle}>
                                                {scan.mode === 'parking'
                                                    ? t.parkingScanner
                                                    : t.campusTitle}
                                            </Text>
                                            <Text style={styles.subtitle}>
                                                {new Date(scan.createdAt).toLocaleString(
                                                    language === 'es' ? 'es-ES' : 'en-US'
                                                )}
                                            </Text>
                                            <Text
                                                style={styles.preview}
                                                numberOfLines={2}
                                            >
                                                {scan.ocrText || scan.explanation}
                                            </Text>
                                        </View>

                                        <Ionicons
                                            name="chevron-forward"
                                            size={22}
                                            color={COLORS.cyan}
                                        />
                                    </View>
                                </Pressable>
                            ))
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const markdownStyles = {
    body: {
        color: '#FFFFFF',
        fontSize: 16,
        lineHeight: 26,
    },
    heading1: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold' as const,
    },
    heading2: {
        color: '#FFFFFF',
        fontSize: 19,
        fontWeight: 'bold' as const,
    },
    strong: {
        fontWeight: 'bold' as const,
    },
    paragraph: {
        marginVertical: 8,
    },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 110,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        marginBottom: 20,
    },
    backText: {
        color: COLORS.cyan,
        fontSize: 16,
        fontWeight: '600',
    },
    heading: {
        color: COLORS.white,
        fontSize: 29,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    subtitle: {
        color: COLORS.muted,
        fontSize: 14,
        lineHeight: 22,
        marginTop: 8,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#204662',
        padding: 18,
        marginTop: 15,
    },
    label: {
        color: COLORS.cyan,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1.2,
        marginBottom: 12,
    },
    count: {
        color: COLORS.white,
        fontSize: 30,
        fontWeight: 'bold',
    },
    listRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    listText: {
        flex: 1,
    },
    itemTitle: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: 'bold',
    },
    preview: {
        color: COLORS.muted,
        fontSize: 13,
        marginTop: 8,
    },
    emptyTitle: {
        color: COLORS.white,
        fontSize: 19,
        fontWeight: 'bold',
        marginTop: 12,
    },
    warningCard: {
        backgroundColor: '#2B2B25',
        padding: 16,
        borderRadius: 14,
        marginTop: 15,
    },
    warningText: {
        color: '#F0D89C',
        fontSize: 13,
        lineHeight: 21,
    },
    deleteButton: {
        borderWidth: 1,
        borderColor: '#FF9999',
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        marginTop: 25,
    },
    deleteText: {
        color: '#FF9999',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
