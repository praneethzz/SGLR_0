import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { CHECKLIST, CATEGORY_MAX, CATEGORY_LABELS, Category } from '../../../data/checklist';
import { colors, spacing, radius } from '../../../constants/theme';
import { getScoreHex, calculatePercentage, getPerformanceLabel } from '../../../utils/scoring';

function StarRow({ count }: { count: number }) {
    return (
        <View style={{ flexDirection: 'row', gap: 4 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <Text key={i} style={{ fontSize: 16, color: i <= count ? colors.amber : colors.borderLight }}>
                    ★
                </Text>
            ))}
        </View>
    );
}

type ConfirmAction = {
    title: string;
    body: string;
    btnLabel: string;
    btnColor: string;
    onConfirm: () => void;
};

export default function InspectionDetail() {
    const router = useRouter();
    const { inspectionId } = useLocalSearchParams<{ inspectionId: string }>();
    const { getInspectionById, getResortById, approveInspection, rejectInspection, unfreezeInspection, removeInspection } = useApp();

    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

    const inspection = getInspectionById(inspectionId);
    const resort = inspection ? getResortById(inspection.resortId) : undefined;

    if (!inspection || !resort) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Inspection Details</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: colors.textGrey }}>Inspection not found.</Text>
                </View>
            </View>
        );
    }

    const categories: Category[] = ['A', 'B', 'C'];
    const scoreColor = getScoreHex(inspection.totalScore);
    const isPending = inspection.status === 'pending';

    const getCatScore = (cat: Category) =>
        CHECKLIST.filter(i => i.category === cat)
            .reduce((sum, item) => sum + (inspection.responses[item.id] ?? 0), 0);

    const handleApprove = () => {
        setConfirmAction({
            title: 'Approve Inspection?',
            body: `Approve and freeze the rating for ${resort.name}? This will make it official.`,
            btnLabel: 'Approve',
            btnColor: colors.green,
            onConfirm: () => {
                approveInspection(inspectionId);
                router.replace('/district');
            },
        });
    };

    const handleReject = () => {
        setConfirmAction({
            title: 'Reject Inspection?',
            body: `Reject this inspection? ${resort.name} will return to unrated status.`,
            btnLabel: 'Reject',
            btnColor: colors.red,
            onConfirm: () => {
                rejectInspection(inspectionId);
                router.replace('/district');
            },
        });
    };

    const handleUnfreeze = () => {
        setConfirmAction({
            title: 'Unfreeze Rating?',
            body: `Unfreeze ${resort.name}? The resort will return to unrated status.`,
            btnLabel: 'Unfreeze',
            btnColor: colors.primary,
            onConfirm: () => {
                unfreezeInspection(inspectionId);
                router.replace('/district');
            },
        });
    };

    const handleRemove = () => {
        setConfirmAction({
            title: 'Remove Inspection?',
            body: `Remove this inspection entirely? ${resort.name} will return to unrated status.`,
            btnLabel: 'Remove',
            btnColor: colors.red,
            onConfirm: () => {
                removeInspection(inspectionId);
                router.replace('/district');
            },
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={colors.primaryDark} barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Inspection Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Resort info */}
                <View style={styles.resortCard}>
                    <Text style={styles.resortName}>{resort.name}</Text>
                    <Text style={styles.areaText}>{resort.area}</Text>
                    <View style={styles.resortMeta}>
                        <Text style={styles.metaText}>Manager: {resort.ownerName}</Text>
                        <Text style={styles.metaText}>
                            Rooms: {resort.roomCount === 'Villa' ? 'Villa' : resort.roomCount}
                        </Text>
                    </View>
                </View>

                {/* Checklist by category */}
                {categories.map(cat => {
                    const items = CHECKLIST.filter(i => i.category === cat);
                    const catScore = getCatScore(cat);
                    const catMax = CATEGORY_MAX[cat];

                    return (
                        <View key={cat} style={styles.categorySection}>
                            <View style={styles.categoryHeader}>
                                <Text style={styles.categoryTitle}>
                                    {cat}. {CATEGORY_LABELS[cat]}
                                </Text>
                            </View>

                            {items.map(item => {
                                const val = inspection.responses[item.id] ?? 0;
                                const isYes = val === item.maxMarks;
                                const isNo = val === 0;
                                const isPartial = !isYes && !isNo;

                                return (
                                    <View key={item.id} style={styles.itemCard}>
                                        <View style={styles.itemRow}>
                                            <View style={styles.itemLeft}>
                                                <Text style={styles.itemId}>{item.id}</Text>
                                                <Text style={styles.itemLabel}>{item.label}</Text>
                                            </View>
                                            <View style={styles.itemRight}>
                                                <View style={[
                                                    styles.answerBadge,
                                                    isYes && styles.answerYes,
                                                    isNo && styles.answerNo,
                                                    isPartial && styles.answerPartial,
                                                ]}>
                                                    <Text style={[
                                                        styles.answerText,
                                                        isYes && styles.answerTextYes,
                                                        isNo && styles.answerTextNo,
                                                        isPartial && styles.answerTextPartial,
                                                    ]}>
                                                        {isYes ? 'YES' : isNo ? 'NO' : String(val)}
                                                    </Text>
                                                </View>
                                                <Text style={styles.marksAwarded}>
                                                    {val} / {item.maxMarks}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}

                            <View style={styles.catScoreRow}>
                                <Text style={styles.catScoreText}>
                                    Category Score: {catScore} / {catMax}
                                </Text>
                            </View>
                        </View>
                    );
                })}

                {/* Overall total */}
                <View style={styles.totalSection}>
                    <Text style={[styles.totalText, { color: scoreColor }]}>
                        Overall Total: {inspection.totalScore} / 200
                    </Text>
                    <StarRow count={inspection.starRating} />
                    <Text style={styles.performanceLabel}>
                        {calculatePercentage(inspection.totalScore)} — {getPerformanceLabel(inspection.totalScore)}
                    </Text>
                </View>

                {/* Officer notes */}
                {inspection.officerNotes ? (
                    <View style={styles.notesCard}>
                        <Text style={styles.notesTitle}>Officer Notes</Text>
                        <Text style={styles.notesText}>{inspection.officerNotes}</Text>
                    </View>
                ) : null}

                {/* Action buttons */}
                <View style={styles.actionsSection}>
                    {isPending ? (
                        <>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.actionBtnApprove]}
                                onPress={handleApprove}
                            >
                                <Text style={styles.actionBtnTextLight}>✓  Approve Inspection</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.actionBtnReject]}
                                onPress={handleReject}
                            >
                                <Text style={[styles.actionBtnText, { color: colors.red }]}>✕  Reject Inspection</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.actionBtnUnfreeze]}
                                onPress={handleUnfreeze}
                            >
                                <Text style={[styles.actionBtnText, { color: colors.primary }]}>🔓  Unfreeze Rating</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.actionBtnReject]}
                                onPress={handleRemove}
                            >
                                <Text style={[styles.actionBtnText, { color: colors.red }]}>🗑  Remove Inspection</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Confirm modal */}
            <Modal visible={!!confirmAction} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>{confirmAction?.title}</Text>
                        <Text style={styles.modalBody}>{confirmAction?.body}</Text>
                        <TouchableOpacity
                            style={[styles.modalBtnPrimary, { backgroundColor: confirmAction?.btnColor }]}
                            onPress={() => {
                                confirmAction?.onConfirm();
                                setConfirmAction(null);
                            }}
                        >
                            <Text style={styles.modalBtnPrimaryText}>{confirmAction?.btnLabel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalBtnSecondary}
                            onPress={() => setConfirmAction(null)}
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
    resortCard: {
        backgroundColor: colors.cardWhite,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: spacing.xs,
        elevation: 2,
    },
    resortName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textDark,
    },
    areaText: {
        fontSize: 13,
        color: colors.textGrey,
    },
    resortMeta: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginTop: spacing.xs,
    },
    metaText: {
        fontSize: 13,
        color: colors.textGrey,
    },
    categorySection: {
        gap: spacing.sm,
    },
    categoryHeader: {
        paddingVertical: spacing.xs,
    },
    categoryTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.primary,
    },
    itemCard: {
        backgroundColor: colors.cardWhite,
        borderRadius: radius.md,
        padding: spacing.md,
        elevation: 1,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: spacing.sm,
    },
    itemLeft: {
        flex: 1,
        gap: spacing.xs,
    },
    itemId: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.textGrey,
        letterSpacing: 0.5,
    },
    itemLabel: {
        fontSize: 13,
        color: colors.textDark,
        lineHeight: 20,
    },
    itemRight: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    answerBadge: {
        borderRadius: radius.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        minWidth: 48,
        alignItems: 'center',
    },
    answerYes: {
        backgroundColor: '#E8FAF0',
    },
    answerNo: {
        backgroundColor: '#FDECEA',
    },
    answerPartial: {
        backgroundColor: '#E0F7F8',
    },
    answerText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    answerTextYes: {
        color: colors.green,
    },
    answerTextNo: {
        color: colors.red,
    },
    answerTextPartial: {
        color: colors.primary,
    },
    marksAwarded: {
        fontSize: 12,
        color: colors.textGrey,
        fontWeight: '500',
    },
    catScoreRow: {
        alignItems: 'flex-end',
        paddingRight: spacing.xs,
    },
    catScoreText: {
        fontSize: 13,
        color: colors.textGrey,
        fontWeight: '600',
    },
    totalSection: {
        backgroundColor: colors.cardWhite,
        borderRadius: radius.md,
        padding: spacing.lg,
        alignItems: 'center',
        gap: spacing.sm,
        elevation: 2,
    },
    totalText: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    performanceLabel: {
        fontSize: 14,
        color: colors.textGrey,
        fontWeight: '500',
    },
    notesCard: {
        backgroundColor: colors.cardWhite,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: spacing.sm,
        elevation: 1,
    },
    notesTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
    },
    notesText: {
        fontSize: 13,
        color: colors.textDark,
        lineHeight: 20,
    },
    actionsSection: {
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    actionBtn: {
        borderRadius: radius.md,
        padding: spacing.md,
        alignItems: 'center',
        borderWidth: 2,
    },
    actionBtnApprove: {
        backgroundColor: colors.green,
        borderColor: colors.green,
    },
    actionBtnReject: {
        backgroundColor: colors.cardWhite,
        borderColor: colors.red,
    },
    actionBtnUnfreeze: {
        backgroundColor: colors.cardWhite,
        borderColor: colors.primary,
    },
    actionBtnText: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    actionBtnTextLight: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.cardWhite,
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