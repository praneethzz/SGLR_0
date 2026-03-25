import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { colors, spacing, radius } from '../../../constants/theme';

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

function formatDateTime(isoString: string): string {
    const date = new Date(isoString);
    const day = date.getDate();
    const month = date.toLocaleString('en-IN', { month: 'short' });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}`;
}

export default function SubmissionConfirmation() {
    const router = useRouter();
    const { resortId } = useLocalSearchParams<{ resortId: string }>();
    const { getResortById, getInspectionByResortId } = useApp();

    const resort = getResortById(resortId);
    const inspection = getInspectionByResortId(resortId);

    if (!resort || !inspection) {
        return (
            <View style={styles.container}>
                <Text>Something went wrong.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={colors.primaryDark} barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={{ width: 40 }} />
                <Text style={styles.headerTitle}>Submitted for Approval</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {/* Checkmark */}
                <View style={styles.checkCircle}>
                    <Text style={styles.checkMark}>✓</Text>
                </View>

                <Text style={styles.successTitle}>Submitted for Approval</Text>
                <Text style={styles.resortName}>{resort.name}</Text>
                <Text style={styles.areaText}>{resort.area}</Text>

                {/* Details card */}
                <View style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Date & Time</Text>
                        <Text style={styles.detailValue}>
                            {formatDateTime(inspection.submittedAt)}
                        </Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total Score</Text>
                        <Text style={styles.detailValue}>
                            {inspection.totalScore} / 200 (
                            {((inspection.totalScore / 200) * 100).toFixed(1)}%)
                        </Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>SGLR Rating</Text>
                        <StarRow count={inspection.starRating} />
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.pendingBanner}>
                        <Text style={styles.pendingIcon}>⏳</Text>
                        <Text style={styles.pendingText}>
                            Pending District Committee Approval
                        </Text>
                    </View>
                </View>

                {/* Back button */}
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.replace('/divisional')}
                >
                    <Text style={styles.backBtnText}>🏠  Back to Resort List</Text>
                </TouchableOpacity>
            </View>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.cardWhite,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        gap: spacing.md,
    },
    checkCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.green,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    checkMark: {
        fontSize: 40,
        color: colors.cardWhite,
        fontWeight: 'bold',
    },
    successTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
    },
    resortName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textDark,
    },
    areaText: {
        fontSize: 14,
        color: colors.textGrey,
        marginBottom: spacing.sm,
    },
    detailsCard: {
        backgroundColor: colors.cardWhite,
        borderRadius: radius.md,
        padding: spacing.md,
        width: '100%',
        gap: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.xs,
    },
    detailLabel: {
        fontSize: 14,
        color: colors.textGrey,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textDark,
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
    },
    pendingBanner: {
        backgroundColor: '#FFF8E7',
        borderRadius: radius.sm,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    pendingIcon: {
        fontSize: 16,
    },
    pendingText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.amber,
    },
    backBtn: {
        backgroundColor: colors.primary,
        borderRadius: radius.lg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        width: '100%',
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    backBtnText: {
        color: colors.cardWhite,
        fontWeight: 'bold',
        fontSize: 15,
    },
});