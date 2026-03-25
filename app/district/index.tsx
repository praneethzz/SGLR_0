import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useApp, Inspection } from '../../context/AppContext';
import { Resort } from '../../data/resorts';
import { colors, spacing, radius } from '../../constants/theme';
import { getScoreHex, calculatePercentage, getPerformanceLabel } from '../../utils/scoring';

function StarRow({ count }: { count: number }) {
    return (
        <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <Text key={i} style={{ fontSize: 14, color: i <= count ? colors.amber : colors.borderLight }}>
                    ★
                </Text>
            ))}
        </View>
    );
}

function InspectionCard({
    inspection,
    resort,
    onPress,
}: {
    inspection: Inspection;
    resort: Resort;
    onPress: () => void;
}) {
    const isApproved = inspection.status === 'approved';
    const scoreColor = getScoreHex(inspection.totalScore);
    const percentage = calculatePercentage(inspection.totalScore);
    const label = getPerformanceLabel(inspection.totalScore);

    return (
        <TouchableOpacity
            style={[styles.card, isApproved && styles.cardApproved]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.cardTopRow}>
                <View style={[styles.statusBadge, isApproved ? styles.badgeApproved : styles.badgePending]}>
                    <Text style={[styles.badgeText, isApproved ? styles.badgeTextApproved : styles.badgeTextPending]}>
                        {isApproved ? '🔒 Approved & Frozen' : '⏳ Pending Approval'}
                    </Text>
                </View>
                <Text style={styles.roomCount}>
                    {resort.roomCount === 'Villa' ? 'Villa' : `${resort.roomCount} rooms`}
                </Text>
            </View>

            <Text style={styles.resortName}>{resort.name}</Text>
            <Text style={styles.areaText}>{resort.area}</Text>

            <Text style={[styles.bigScore, { color: scoreColor }]}>
                {inspection.totalScore}
            </Text>
            <Text style={styles.outOf}>out of 200</Text>
            <Text style={[styles.percentLabel, { color: scoreColor }]}>
                {percentage} {label}
            </Text>

            <StarRow count={inspection.starRating} />
            <Text style={styles.autoCalc}>
                {inspection.starRating} / 5 stars (auto-calculated)
            </Text>

            <View style={styles.cardDivider} />
            <Text style={styles.tapDetails}>Tap for full evaluation details</Text>
        </TouchableOpacity>
    );
}

export default function DistrictReview() {
    const router = useRouter();
    const { state } = useApp();
    const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
    const [search, setSearch] = useState('');

    const pendingInspections = state.inspections.filter(i => i.status === 'pending');
    const approvedInspections = state.inspections.filter(i => i.status === 'approved');

    const currentList = activeTab === 'pending' ? pendingInspections : approvedInspections;

    const filtered = currentList.filter(i => {
        const resort = state.resorts.find(r => r.id === i.resortId);
        return resort?.name.toLowerCase().includes(search.toLowerCase());
    });

    const pendingCount = pendingInspections.length;
    const approvedCount = approvedInspections.length;

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={colors.primaryDark} barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>District Committee Review</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Stats bar */}
            <View style={styles.statsBar}>
                <Text style={styles.statsText}>
                    {pendingCount} pending · {approvedCount} approved
                </Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
                    onPress={() => { setActiveTab('pending'); setSearch(''); }}
                >
                    <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
                        Pending ({pendingCount})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'approved' && styles.tabActive]}
                    onPress={() => { setActiveTab('approved'); setSearch(''); }}
                >
                    <Text style={[styles.tabText, activeTab === 'approved' && styles.tabTextActive]}>
                        Approved ({approvedCount})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search resorts..."
                    placeholderTextColor={colors.textGrey}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* List */}
            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                    const resort = state.resorts.find(r => r.id === item.resortId);
                    if (!resort) return null;
                    return (
                        <InspectionCard
                            inspection={item}
                            resort={resort}
                            onPress={() => router.push(`/district/detail/${item.id}`)}
                        />
                    );
                }}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {activeTab === 'pending' ? 'No pending reviews' : 'No approved inspections'}
                        </Text>
                    </View>
                }
            />
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
        fontSize: 17,
        fontWeight: 'bold',
        color: colors.cardWhite,
    },
    statsBar: {
        backgroundColor: colors.primaryDark,
        paddingBottom: spacing.sm,
        alignItems: 'center',
    },
    statsText: {
        fontSize: 13,
        color: colors.primary,
        fontWeight: '600',
    },
    tabRow: {
        flexDirection: 'row',
        backgroundColor: colors.cardWhite,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textGrey,
    },
    tabTextActive: {
        color: colors.primary,
    },
    searchContainer: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.cardWhite,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    searchInput: {
        backgroundColor: colors.background,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: 14,
        color: colors.textDark,
    },
    listContent: {
        padding: spacing.md,
        gap: spacing.md,
        paddingBottom: spacing.xl,
    },
    card: {
        backgroundColor: colors.cardWhite,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: spacing.xs,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    cardApproved: {
        borderWidth: 2,
        borderColor: colors.green,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    statusBadge: {
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderWidth: 1,
    },
    badgePending: {
        backgroundColor: '#FFF8E7',
        borderColor: colors.amber,
    },
    badgeApproved: {
        backgroundColor: '#E8FAF0',
        borderColor: colors.green,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    badgeTextPending: {
        color: colors.amber,
    },
    badgeTextApproved: {
        color: colors.green,
    },
    roomCount: {
        fontSize: 13,
        color: colors.textGrey,
    },
    resortName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textDark,
    },
    areaText: {
        fontSize: 13,
        color: colors.textGrey,
        marginBottom: spacing.xs,
    },
    bigScore: {
        fontSize: 48,
        fontWeight: 'bold',
        lineHeight: 56,
    },
    outOf: {
        fontSize: 13,
        color: colors.textGrey,
    },
    percentLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    autoCalc: {
        fontSize: 12,
        color: colors.textGrey,
        marginBottom: spacing.xs,
    },
    cardDivider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginVertical: spacing.xs,
    },
    tapDetails: {
        fontSize: 13,
        color: colors.primary,
        fontWeight: '600',
        textAlign: 'center',
    },
    emptyContainer: {
        paddingTop: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: colors.textGrey,
    },
});