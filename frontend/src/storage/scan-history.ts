
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@parkscan/scan-history/v1';
const MAX_HISTORY_ITEMS = 50;

export type ScanMode = 'parking' | 'campus';

export type SavedScan = {
  id: string;
  mode: ScanMode;
  createdAt: string;
  signCount: number;
  ocrText: string;
  explanation: string;
  warning?: string;
};

export type ScanData = {
  mode: ScanMode;
  signCount: number;
  ocrText: string;
  explanation: string;
  warning?: string;
};

export async function getScanHistory(): Promise<SavedScan[]> {
  const stored = await AsyncStorage.getItem(HISTORY_KEY);

  if (!stored) {
    return [];
  }

  const parsed: unknown = JSON.parse(stored);

  if (!Array.isArray(parsed)) {
    throw new Error('Saved scan history has an invalid format.');
  }

  return parsed as SavedScan[];
}

export async function saveScan(
  data: ScanData
): Promise<SavedScan> {
  const scan: SavedScan = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    mode: data.mode,
    createdAt: new Date().toISOString(),
    signCount: data.signCount,
    ocrText: data.ocrText,
    explanation: data.explanation,
    warning: data.warning,
  };

  const history = await getScanHistory();
  const updated = [scan, ...history].slice(0, MAX_HISTORY_ITEMS);

  await AsyncStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(updated)
  );

  return scan;
}

export async function deleteScan(id: string): Promise<void> {
  const history = await getScanHistory();
  const updated = history.filter((scan) => scan.id !== id);

  await AsyncStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(updated)
  );
}

export async function clearScanHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}
