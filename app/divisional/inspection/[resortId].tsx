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
import { CHECKLIST, Category, CATEGORY_MAX, CATEGORY_LABELS } from '../../../data/checklist';
import { colors, spacing, radius } from '../../../constants/theme';
import { saveDraft, loadDraft, deleteDraft } from '../../../utils/storage';
import { calculateStars, getPerformanceLabel } from '../../../utils/scoring';

console.log('Checklist count:', CHECKLIST.length);
console.log('IDs:', CHECKLIST.map(i => i.id).join(', '));

type Responses = Record<string, number | null>;

function calculateTotal(responses: Responses): number {
    return Object.values(responses).reduce((sum, val) => sum + (val ?? 0), 0);
}

function answeredCount(responses: Responses): number {
    return Object.values(responses).filter(v => v !== null).length;
}

function getCategoryScore(responses: Responses, category: Category): number {
    return CHECKLIST.filter(i => i.category === category)
        .reduce((sum, item) => sum + (responses[item.id] ?? 0), 0);
}

export default function InspectionForm() {
    const router = useRouter();
    const { resortId } = useLocalSearchParams<{ resortId: string }>();
    const { getResortById } = useApp();

    const resort = getResortById(resortId);

    const emptyResponses: Responses = Object.fromEntries(
        CHECKLIST.map(item => [item.id, null])
    );

    const [responses, setResponses] = useState<Responses>(emptyResponses);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [draftData, setDraftData] = useState<Responses | null>(null);

    useEffect(() => {
        async function checkDraft() {
            const draft = await loadDraft(resortId);
            if (draft) {
                setDraftData(draft);
                setShowRestoreModal(true);
            }
        }
        checkDraft();
    }, [resortId]);

    const handleResponse = (itemId: string, value: number | null) => {
        const updated = { ...responses, [itemId]: value };
        setResponses(updated);
        saveDraft(resortId, updated);
    };

    const handleYes = (itemId: string, maxMarks: number) => {
        const current = responses[itemId];
        handleResponse(itemId, current === maxMarks ? null : maxMarks);
    };

    const handleNo = (itemId: string) => {
        const current = responses[itemId];
        handleResponse(itemId, current === 0 ? null : 0);
    };

    const handleManualInput = (itemId: string, text: string, maxMarks: number, minMarks: number) => {
        if (text === '' || text === '-') {
            handleResponse(itemId, null);
            return;
        }
        const num = Number(text);
        if (isNaN(num)) return;
        if (num < minMarks || num > maxMarks) return;
        handleResponse(itemId, num);
    };

    const totalScore = calculateTotal(responses);
    const answered = answeredCount(responses);
    const allAnswered = answered === CHECKLIST.length;
    const percentage = ((totalScore / 200) * 100).toFixed(1);

    const categories: Category[] = ['A', 'B', 'C'];

    if (!resort) {
        return (
            <View style={styles.container}>
                <Text>Resort not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={colors.primaryDark} barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{resort.name}</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Score bar */}
            <View style={styles.scoreBar}>
                <Text style={styles.scoreText}>Score: {totalScore} / 200</Text>
                <Text style={styles.percentText}>{percentage}%</Text>
            </View>
            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${Math.min((totalScore / 200) * 100, 100)}%` },
                    ]}
                />
            </View>

            {/* Checklist */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {categories.map(cat => {
                    const items = CHECKLIST.filter(i => i.category === cat);
                    const catScore = getCategoryScore(responses, cat);
                    const catMax = CATEGORY_MAX[cat];

                    return (
                        <View key={cat} style={styles.categorySection}>
                            <View style={styles.categoryHeader}>
                                <Text style={styles.categoryTitle}>
                                    {cat}. {CATEGORY_LABELS[cat]}
                                </Text>
                                <Text style={styles.categoryScore}>
                                    {catScore} / {catMax} marks
                                </Text>
                            </View>

                            {items.map(item => {
                                const val = responses[item.id];
                                const isYes = val === item.maxMarks;
                                const isNo = val === 0;
                                const manualVal = val !== null && !isYes && !isNo
                                    ? String(val)
                                    : '';

                                return (
                                    <View key={item.id} style={styles.itemCard}>
                                        <View style={styles.itemTop}>
                                            <View style={styles.itemLabelContainer}>
                                                <Text style={styles.itemLabel}>{item.label}</Text>
                                                <View style={styles.itemMeta}>
                                                    <View style={styles.marksBadge}>
                                                        <Text style={styles.marksText}>{item.maxMarks} marks</Text>
                                                    </View>
                                                    <Text style={styles.subcategoryText}>{item.subcategory}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.inputGroup}>
                                                <TouchableOpacity
                                                    style={[styles.yesNoBtn, isYes && styles.yesBtnActive]}
                                                    onPress={() => handleYes(item.id, item.maxMarks)}
                                                >
                                                    <Text style={[styles.yesNoText, isYes && styles.yesNoTextActive]}>
                                                        Yes
                                                    </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[styles.yesNoBtn, isNo && styles.noBtnActive]}
                                                    onPress={() => handleNo(item.id)}
                                                >
                                                    <Text style={[styles.yesNoText, isNo && styles.noTextActive]}>
                                                        No
                                                    </Text>
                                                </TouchableOpacity>

                                                <TextInput
                                                    style={[styles.manualInput, val !== null && !isYes && !isNo && styles.manualInputActive]}
                                                    keyboardType="numeric"
                                                    placeholder="—"
                                                    placeholderTextColor={colors.textGrey}
                                                    value={val !== null && !isYes && !isNo ? String(val) : ''}
                                                    onChangeText={text =>
                                                        handleManualInput(item.id, text, item.maxMarks, item.minMarks)
                                                    }
                                                    maxLength={3}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    );
                })}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.answeredText}>{answered} / {CHECKLIST.length} answered</Text>
                <TouchableOpacity
                    style={[styles.proceedBtn, !allAnswered && styles.proceedBtnDisabled]}
                    disabled={!allAnswered}
                    onPress={() => router.push(`/divisional/summary/${resortId}`)}
                >
                    <Text style={styles.proceedBtnText}>→  Proceed to Rating</Text>
                </TouchableOpacity>
            </View>

            {/* Draft restore modal */}
            <Modal visible={showRestoreModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Resume Inspection?</Text>
                        <Text style={styles.modalBody}>
                            You have a saved draft for this resort. Would you like to resume or start fresh?
                        </Text>
                        <TouchableOpacity
                            style={styles.modalBtnPrimary}
                            onPress={() => {
                                if (draftData) setResponses(draftData);
                                setShowRestoreModal(false);
                            }}
                        >
                            <Text style={styles.modalBtnPrimaryText}>Resume Draft</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalBtnSecondary}
                            onPress={() => {
                                setShowRestoreModal(false);
                                setShowConfirmFreshModal(true);
                            }}
                        >
                            <Text style={styles.modalBtnSecondaryText}>Start Fresh</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Confirm start fresh modal */}
            <ConfirmFreshModal
                resortId={resortId}
                onConfirm={() => {
                    deleteDraft(resortId);
                    setResponses(emptyResponses);
                }}
            />
        </View>
    );
}

function ConfirmFreshModal({
    resortId,
    onConfirm,
}: {
    resortId: string;
    onConfirm: () => void;
}) {
    const [visible, setVisible] = useState(false);

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>Start Fresh?</Text>
                    <Text style={styles.modalBody}>
                        Starting fresh will permanently delete your saved progress. This cannot be undone.
                    </Text>
                    <TouchableOpacity
                        style={[styles.modalBtnPrimary, { backgroundColor: colors.red }]}
                        onPress={() => {
                            onConfirm();
                            setVisible(false);
                        }}
                    >
                        <Text style={styles.modalBtnPrimaryText}>Yes, Delete & Start Fresh</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.modalBtnSecondary}
                        onPress={() => setVisible(false)}
                    >
                        <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
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
    scoreBar: {
        backgroundColor: colors.primaryDark,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
    },
    scoreText: {
        color: colors.cardWhite,
        fontSize: 14,
        fontWeight: '600',
    },
    percentText: {
        color: colors.cardWhite,
        fontSize: 14,
        fontWeight: '600',
    },
    progressTrack: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        backgroundColor: colors.primaryDark,
    },
    progressFill: {
        height: 4,
        backgroundColor: colors.amber,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
    },
    categorySection: {
        gap: spacing.sm,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    categoryTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.primary,
        flex: 1,
    },
    categoryScore: {
        fontSize: 13,
        color: colors.textGrey,
        fontWeight: '500',
    },
    itemCard: {
        backgroundColor: colors.cardWhite,
        borderRadius: radius.md,
        padding: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    itemTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    itemLabelContainer: {
        flex: 1,
    },
    itemLabel: {
        fontSize: 13,
        color: colors.textDark,
        lineHeight: 20,
        marginBottom: spacing.xs,
    },
    itemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    marksBadge: {
        backgroundColor: '#E0F7F8',
        borderRadius: radius.lg,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
    },
    marksText: {
        fontSize: 11,
        color: colors.primary,
        fontWeight: '600',
    },
    subcategoryText: {
        fontSize: 11,
        color: colors.textGrey,
    },
    inputGroup: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    yesNoBtn: {
        width: 56,
        paddingVertical: spacing.sm,
        borderRadius: radius.sm,
        borderWidth: 1.5,
        borderColor: colors.borderLight,
        alignItems: 'center',
        backgroundColor: colors.cardWhite,
    },
    yesBtnActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    noBtnActive: {
        backgroundColor: colors.red,
        borderColor: colors.red,
    },
    yesNoText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textGrey,
    },
    yesNoTextActive: {
        color: colors.cardWhite,
    },
    noTextActive: {
        color: colors.cardWhite,
    },
    manualInput: {
        width: 56,
        paddingVertical: spacing.sm,
        borderRadius: radius.sm,
        borderWidth: 1.5,
        borderColor: colors.borderLight,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
        color: colors.textDark,
        backgroundColor: colors.cardWhite,
    },
    manualInputActive: {
        borderColor: colors.primary,
        backgroundColor: '#E0F7F8',
    },
    footer: {
        backgroundColor: colors.cardWhite,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        elevation: 8,
    },
    answeredText: {
        fontSize: 13,
        color: colors.textGrey,
        fontWeight: '500',
    },
    proceedBtn: {
        backgroundColor: colors.primary,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm + 2,
    },
    proceedBtnDisabled: {
        backgroundColor: colors.borderLight,
    },
    proceedBtnText: {
        color: colors.cardWhite,
        fontWeight: 'bold',
        fontSize: 14,
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