import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { CHECKLIST, CATEGORY_MAX, CATEGORY_LABELS, Category } from '../../../data/checklist';
import { colors, spacing, radius } from '../../../constants/theme';
import {
    calculateStars,
    getPerformanceLabel,
    getScoreHex,
    calculatePercentage,
} from '../../../utils/scoring';
import AsyncStorage from '@react-native-async-storage/async-storage';

function StarRow({ count }: { count: number }) {
    return (
        <View style={{ flexDirection: 'row', gap: 4 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <Text key={i} style={{ fontSize: 28, color: i <= count ? colors.amber : colors.borderLight }}>
                    ★
                </Text>
            ))}
        </View>
    );
}

export default function InspectionSummary() {
    const router = useRouter();
    const { resortId } = useLocalSearchParams<{ resortId: string }>();
    const { getResortById, submitInspection } = useApp();
    const [officerNotes, setOfficerNotes] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const resort = getResortById(resortId);

    // Read responses from AsyncStorage draft
    const [responses, setResponses] = useState<Record<string, number | null>>({});
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(`draft_inspection_${resortId}`).then(raw => {
            if (raw) setResponses(JSON.parse(raw));
            setLoaded(true);
        });
    }, [resortId]);

    if (!resort || !loaded) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Inspection Summary</Text>
                    <View style={{ width: 40 }} />
                </View>
            </View>
        );
    }

    const totalScore = Object.values(responses).reduce((sum, v) => sum + (v ?? 0), 0);
    const stars = calculateStars(totalScore);
    const label = getPerformanceLabel(totalScore);
    const scoreColor = getScoreHex(totalScore);
    const percentage = calculatePercentage(totalScore);

    const categories: Category[] = ['A', 'B', 'C'];

    const getCatScore = (cat: Category) =>
        CHECKLIST.filter(i => i.category === cat)
            .reduce((sum, item) => sum + (responses[item.id] ?? 0), 0);

    const handleSubmit = () => {
        submitInspection({
            resortId,
            responses,
            totalScore,
            starRating: stars,
            performanceLabel: label,
            officerNotes,
        });
        router.replace(`/divisional/confirmation/${resortId}`);
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={colors.primaryDark} barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Inspection Summary</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Score card */}
                <View style={styles.scoreCard}>
                    <Text style={styles.resortName}>{resort.name}</Text>
                    <Text style={styles.areaText}>{resort.area}</Text>
                    <Text style={[styles.bigScore, { color: scoreColor }]}>{totalScore}</Text>
                    <Text style={styles.outOf}>out of 200</Text>
                    <Text style={[styles.percentLabel, { color: scoreColor }]}>
                        {percentage} — {label}
                    </Text>
                    <StarRow count={stars} />
                    <Text style={styles.autoCalc}>{stars} / 5 stars (auto-calculated)</Text>
                </View>

                {/* Score breakdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Score Breakdown</Text>
                    {categories.map(cat => (
                        <View key={cat} style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>
                                {cat}. {CATEGORY_LABELS[cat]}
                            </Text>
                            <Text style={styles.breakdownScore}>
                                {getCatScore(cat)} / {CATEGORY_MAX[cat]}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Officer notes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Officer Notes (optional)</Text>
                    <TextInput
                        style={styles.notesInput}
                        multiline
                        numberOfLines={4}
                        placeholder="Add observations, violations, or notes..."
                        placeholderTextColor={colors.textGrey}
                        value={officerNotes}
                        onChangeText={setOfficerNotes}
                        textAlignVertical="top"
                    />
                </View>

                {/* Submit button */}
                <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={() => setShowConfirmModal(true)}
                >
                    <Text style={styles.submitBtnText}>➤  Submit to District Committee</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Confirm submit modal */}
            <Modal visible={showConfirmModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Submit Inspection?</Text>
                        <Text style={styles.modalBody}>
                            Submit inspection for {resort.name} to the District Committee? This cannot be undone.
                        </Text>
                        <TouchableOpacity
                            style={styles.modalBtnPrimary}
                            onPress={() => {
                                setShowConfirmModal(false);
                                handleSubmit();
                            }}
                        >
                            <Text style={styles.modalBtnPrimaryText}>Yes, Submit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalBtnSecondary}
                            onPress={() => setShowConfirmModal(false)}
                        >
                            <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.primaryDark,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 48,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.md,
    },
    backBtn: {
        width: 40,
    },
    backText: {
        fontSize: 24,
        color: colors.cardWhite,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.cardWhite,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        gap: spacing.md,
        paddingBottom: spacing.xl,
    },
    scoreCard: {
        backgroundColor: colors.cardWhite,
        borderRadius: radius.md,
        padding: spacing.lg,
        alignItems: 'center',
        gap: spacing.xs,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    resortName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    areaText: {
        fontSize: 14,
        color: colors.textGrey,
        marginBottom: spacing.sm,
    },
    bigScore: {
        fontSize: 64,
        fontWeight: 'bold',
        lineHeight: 72,
    },
    outOf: {
        fontSize: 14,
        color: colors.textGrey,
    },
    percentLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginVertical: spacing.xs,
    },
    autoCalc: {
        fontSize: 12,
        color: colors.textGrey,
        marginTop: spacing.xs,
    },
    section: {
        backgroundColor: colors.cardWhite,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.xs,
    },
    breakdownLabel: {
        fontSize: 14,
        color: colors.textDark,
        flex: 1,
    },
    breakdownScore: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textDark,
    },
    notesInput: {
        backgroundColor: colors.background,
        borderRadius: radius.sm,
        padding: spacing.md,
        fontSize: 14,
        color: colors.textDark,
        minHeight: 100,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    submitBtn: {
        backgroundColor: colors.primary,
        borderRadius: radius.lg,
        padding: spacing.md,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    submitBtnText: {
        color: colors.cardWhite,
        fontWeight: 'bold',
        fontSize: 15,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalBox: {
        backgroundColor: colors.cardWhite,
        borderRadius: radius.md,
        padding: spacing.lg,
        width: '100%',
        gap: spacing.md,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: colors.textDark,
        textAlign: 'center',
    },
    modalBody: {
        fontSize: 14,
        color: colors.textGrey,
        textAlign: 'center',
        lineHeight: 21,
    },
    modalBtnPrimary: {
        backgroundColor: colors.primary,
        borderRadius: radius.sm,
        padding: spacing.md,
        alignItems: 'center',
    },
    modalBtnPrimaryText: {
        color: colors.cardWhite,
        fontWeight: 'bold',
        fontSize: 14,
    },
    modalBtnSecondary: {
        padding: spacing.sm,
        alignItems: 'center',
    },
    modalBtnSecondaryText: {
        color: colors.textGrey,
        fontSize: 14,
    },
});