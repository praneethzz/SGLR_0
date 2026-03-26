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
import { useApp } from '../../context/AppContext';
import { Resort } from '../../data/resorts';
import { colors, spacing, radius } from '../../constants/theme';

function getStatusLabel(resort: Resort): string {
    switch (resort.status) {
        case 'unrated': return 'Unrated';
        case 'pending': return 'Pending';
        case 'approved': return 'Approved';
        case 'rejected': return 'Recheck';
    }
}

function getStatusColor(resort: Resort): string {
    switch (resort.status) {
        case 'unrated': return colors.textGrey;
        case 'pending': return colors.amber;
        case 'approved': return colors.green;
        case 'rejected': return colors.red;
    }
}

function StarRow({ count }: { count: number }) {
    return (
        <View style={{ flexDirection: 'row', gap: 2, marginTop: 2 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <Text key={i} style={{ fontSize: 12, color: i <= count ? colors.amber : colors.borderLight }}>
                    ★
                </Text>
            ))}
        </View>
    );
}

export default function DivisionalResortList() {
    const router = useRouter();
    const { state } = useApp();
    const [search, setSearch] = useState('');

    const filtered = state.resorts.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleResortPress = (resort: Resort) => {
        if (resort.status === 'approved' || resort.status === 'pending') {
            router.push(`/divisional/view/${resort.id}`);
            return;
        }
        router.push(`/divisional/inspection/${resort.id}`);
    };

    const renderItem = ({ item }: { item: Resort }) => {
        const isLocked = item.status === 'approved';
        const statusLabel = getStatusLabel(item);
        const statusColor = getStatusColor(item);

        return (
            <TouchableOpacity
                style={[styles.card, isLocked && styles.cardLocked]}
                onPress={() => handleResortPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.cardLeft}>
                    <View style={styles.numberCircle}>
                        <Text style={styles.numberText}>{item.serialNumber}</Text>
                    </View>
                </View>

                <View style={styles.cardMiddle}>
                    <View style={styles.nameRow}>
                        <Text style={styles.resortName}>{item.name}</Text>
                        <Text style={[styles.statusLabel, { color: statusColor }]}>
                            {' '}({statusLabel})
                        </Text>
                    </View>
                    {item.currentRating && <StarRow count={item.currentRating} />}
                    <Text style={styles.detailText}>AREA: {item.area}</Text>
                    <Text style={styles.detailText}>PHONE: {item.ownerPhone}</Text>
                    <Text style={styles.detailText}>
                        ROOMS: {item.roomCount === 'Villa' ? 'Villa' : item.roomCount}
                    </Text>
                </View>

                <View style={styles.cardRight}>
                    {isLocked ? (
                        <Text style={styles.lockIcon}>🔒</Text>
                    ) : (
                        <Text style={styles.chevron}>›</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={colors.primaryDark} barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>SGLR Rating</Text>
                <View style={{ width: 40 }} />
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

            {/* Section label */}
            <View style={styles.sectionLabelContainer}>
                <Text style={styles.sectionLabel}>RESORTS</Text>
                <View style={styles.sectionUnderline} />
            </View>

            {/* List */}
            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No resorts found</Text>
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
        alignItems: 'flex-start',
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
    sectionLabelContainer: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        color: colors.primary,
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    sectionUnderline: {
        height: 2,
        backgroundColor: colors.primary,
        width: '100%',
    },
    listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
        gap: spacing.sm,
        paddingTop: spacing.sm,
    },
    card: {
        backgroundColor: colors.cardWhite,
        borderRadius: radius.md,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    cardLocked: {
        opacity: 0.75,
    },
    cardLeft: {
        marginRight: spacing.md,
    },
    numberCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
    },
    cardMiddle: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    resortName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.textDark,
    },
    statusLabel: {
        fontSize: 13,
        fontStyle: 'italic',
    },
    detailText: {
        fontSize: 12,
        color: colors.textGrey,
        marginTop: 2,
        letterSpacing: 0.3,
    },
    cardRight: {
        marginLeft: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lockIcon: {
        fontSize: 18,
    },
    chevron: {
        fontSize: 28,
        color: colors.primary,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textGrey,
        marginTop: spacing.xl,
        fontSize: 14,
    },
});