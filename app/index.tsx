import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { colors, spacing, radius } from '../constants/theme';

export default function RoleSelection() {
    const router = useRouter();
    const { setRole } = useApp();

    const handleRoleSelect = (role: 'divisional' | 'district') => {
        setRole(role);
        if (role === 'divisional') {
            router.push('/divisional');
        } else {
            router.push('/district');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                    <Image
                        source={require('../assets/images/icon.png')}
                        style={styles.logoImage}
                        resizeMode="cover"
                    />
                </View>
                <Text style={styles.title}>Beach Resort</Text>
                <Text style={styles.subtitle}>SGLR Rating</Text>
                <Text style={styles.wave}>~ ~ ~</Text>
            </View>

            <View style={styles.bottomSection}>
                <Text style={styles.selectLabel}>SELECT YOUR ROLE TO CONTINUE</Text>

                <TouchableOpacity
                    style={styles.roleCard}
                    onPress={() => handleRoleSelect('divisional')}
                >
                    <Text style={styles.roleTitle}>Divisional Committee</Text>
                    <Text style={styles.roleSubtitle}>Inspect & rate resorts</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.roleCard, styles.roleCardDistrict]}
                    onPress={() => handleRoleSelect('district')}
                >
                    <Text style={[styles.roleTitle, styles.roleTitleDistrict]}>
                        District Committee
                    </Text>
                    <Text style={styles.roleSubtitle}>Review & approve ratings</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
        justifyContent: 'space-between',
        paddingTop: 80,
        paddingBottom: 48,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: colors.primaryDark,
        backgroundColor: colors.cardWhite,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    logoImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.md,
    },
    wave: {
        fontSize: 20,
        color: colors.primary,
        letterSpacing: 8,
    },
    bottomSection: {
        gap: spacing.md,
    },
    selectLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textGrey,
        letterSpacing: 1.5,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    roleCard: {
        backgroundColor: '#EAF7F8',
        borderWidth: 2,
        borderColor: colors.primary,
        borderRadius: radius.md,
        padding: spacing.lg,
        alignItems: 'center',
    },
    roleCardDistrict: {
        backgroundColor: colors.cardWhite,
    },
    roleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 4,
    },
    roleTitleDistrict: {
        color: colors.primary,
    },
    roleSubtitle: {
        fontSize: 14,
        color: colors.textGrey,
    },
});