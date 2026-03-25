import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { CHECKLIST, CATEGORY_MAX, CATEGORY_LABELS, Category } from '../../../data/checklist';
import { colors, spacing, radius } from '../../../constants/theme';
import { getScoreHex, calculatePercentage, getPerformanceLabel } from '../../../utils/scoring';

function StarRow({ count }: { count: number }) {
    return (
        <View style={{ flexDirection: 'row', gap: 4 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <Text key={i} style={{ fontSize: 20, color: i <= count ? colors.amber : colors.borderLight }}>
                    ★
                </Text>
            ))}
        </View>
    );
}

export default function PendingInspectionView() {
    const router = useRouter();
    const { resortId } = useLocalSearchParams<{ resortId: string }>();
    const { getResortById, getInspectionByResortId } = useApp();

    const resort = getResortById(resortId);
    const inspection = getInspectionByResortId(resortId);

    if (!resort || !inspection) {
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
                    <Text style={{ color: colors.textGrey }}>No inspection found.</Text>
                </View>
            </View>
        );
    }

    const categories: Category[] = ['A', 'B', 'C'];
    const scoreColor = getScoreHex(inspection.totalScore);

    const getCatScore = (cat: Category) =>
        CHECKLIST.filter(i => i.category === cat)
            .reduce((sum, item) => sum + (inspection.responses[item.id] ?? 0), 0);

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

            {/* Pending banner */}
            <View style={styles.pendingBanner}>
                <Text style={styles.pendingText}>⏳ Awaiting District Committee Approval</Text>
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
                    <Text style={[styles.bigScore, { color: scoreColor }]}>
                        {inspection.totalScore}
                    </Text>
                    <Text style={styles.outOf}>out of 200</Text>
                    <Text style={[styles.percentLabel, { color: scoreColor }]}>
                        {calculatePercentage(inspection.totalScore)} — {getPerformanceLabel(inspection.totalScore)}
                    </Text>
                    <StarRow count={inspection.starRating} />
                    <Text style={styles.autoCalc}>
                        {inspection.starRating} / 5 stars (auto-calculated)
                    </Text>
                </View>

                {/* Checklist by category */}
                {categories.map(cat => {
                    const items = CHECKLIST.filter(i => i.category === cat);
                    const catScore = getCatScore(cat);
                    const catMax = CATEGORY_MAX[cat];

                    return (
                        <View key={cat} style={styles.categorySection}>
                            <Text style={styles.categoryTitle}>
                                {cat}. {CATEGORY_LABELS[cat]}
                            </Text>

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
                </View>

                {/* Officer notes */}
                {inspection.officerNotes ? (
                    <View style={styles.notesCard}>
                        <Text style={styles.notesTitle}>Officer Notes</Text>
                        <Text style={styles.notesText}>{inspection.officerNotes}</Text>
                    </View>
                ) : null}
            </ScrollView>
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
    pendingBanner: {
        backgroundColor: '#FFF8E7',
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.amber,
    },
    pendingText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.amber,
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
        elevation: 2,
    },
    resortName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    areaText: {
        fontSize: 13,
        color: colors.textGrey,
        marginBottom: spacing.xs,
    },
    bigScore: {
        fontSize: 56,
        fontWeight: 'bold',
        lineHeight: 64,
    },
    outOf: {
        fontSize: 13,
        color: colors.textGrey,
    },
    percentLabel: {
        fontSize: 15,
        fontWeight: '600',
        marginVertical: spacing.xs,
    },
    autoCalc: {
        fontSize: 12,
        color: colors.textGrey,
    },
    categorySection: {
        gap: spacing.sm,
    },
    categoryTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.primary,
        paddingVertical: spacing.xs,
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
});