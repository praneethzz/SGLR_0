import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_PREFIX = 'draft_inspection_';

export async function saveDraft(
    resortId: string,
    data: Record<string, number | null>
): Promise<void> {
    try {
        await AsyncStorage.setItem(
            `${DRAFT_PREFIX}${resortId}`,
            JSON.stringify(data)
        );
    } catch (e) {
        console.error('Failed to save draft:', e);
    }
}

export async function loadDraft(
    resortId: string
): Promise<Record<string, number | null> | null> {
    try {
        const raw = await AsyncStorage.getItem(`${DRAFT_PREFIX}${resortId}`);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.error('Failed to load draft:', e);
        return null;
    }
}

export async function deleteDraft(resortId: string): Promise<void> {
    try {
        await AsyncStorage.removeItem(`${DRAFT_PREFIX}${resortId}`);
    } catch (e) {
        console.error('Failed to delete draft:', e);
    }
}

export async function draftExists(resortId: string): Promise<boolean> {
    try {
        const raw = await AsyncStorage.getItem(`${DRAFT_PREFIX}${resortId}`);
        return raw !== null;
    } catch (e) {
        return false;
    }
}