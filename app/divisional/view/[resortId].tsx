import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { CHECKLIST, CATEGORY_MAX, CATEGORY_LABELS, Category } from '../../../data/checklist';
import { colors, spacing, radius } from '../../../constants/theme';
import { getScoreHex, calculatePercentage, getPerformanceLabel } from '../../../utils/scoring';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

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

function generateHTML(
    resortName: string,
    area: string,
    ownerName: string,
    ownerPhone: string,
    submittedAt: string,
    responses: Record<string, number | null>,
    totalScore: number,
    starRating: number
): string {

    const categories: Category[] = ['A', 'B', 'C'];

    const getCatScore = (cat: Category) =>
        CHECKLIST.filter(i => i.category === cat)
            .reduce((sum, item) => sum + (responses[item.id] ?? 0), 0);

    const tableRows = CHECKLIST.map(item => {
        const val = responses[item.id] ?? 0;
        return `
      <tr>
        <td>${item.id}</td>
        <td>${item.label}</td>
        <td style="text-align:center">${item.maxMarks}</td>
        <td style="text-align:center">${val}</td>
      </tr>
    `;
    }).join('');

    const subtotalRows = categories.map(cat => `
    <tr>
      <td colspan="3"><strong>${cat}. ${CATEGORY_LABELS[cat]}</strong></td>
      <td style="text-align:center"><strong>${CATEGORY_MAX[cat]}</strong></td>
      <td style="text-align:center"><strong>${getCatScore(cat)}</strong></td>
    </tr>
  `).join('');

    const stars = '★'.repeat(starRating) + '☆'.repeat(5 - starRating);
    const starsInWords = `${starRating} out of 5 stars`;

    const sigBoxStyle = `
    display: inline-block;
    width: 16%;
    margin: 0 1%;
    text-align: center;
    vertical-align: top;
  `;

    const sigBoxes = (prefix: string) =>
        [1, 2, 3, 4, 5].map(n => `
      <div style="${sigBoxStyle}">
        <div style="height: 60px; border-bottom: 1px solid #000; margin-bottom: 6px;"></div>
        <div style="font-size: 11px; color: #444;">${prefix} ${n}</div>
      </div>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 13px;
          color: #111;
          padding: 32px;
          line-height: 1.5;
        }
        h1 {
          text-align: center;
          font-size: 22px;
          letter-spacing: 3px;
          margin-bottom: 4px;
          color: #0D7377;
        }
        h2 {
          text-align: center;
          font-size: 18px;
          margin-bottom: 16px;
          color: #1A1A2E;
        }
        .info-block {
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 12px 16px;
          margin-bottom: 24px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px 32px;
        }
        .info-item {
          font-size: 13px;
        }
        .info-label {
          font-weight: bold;
          color: #0D7377;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }
        th {
          background-color: #0D7377;
          color: white;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        td {
          padding: 7px 8px;
          border-bottom: 1px solid #e0e0e0;
          font-size: 12px;
          vertical-align: top;
        }
        tr:nth-child(even) {
          background-color: #f7f7f7;
        }
        .subtotal-section {
          margin-top: 8px;
          margin-bottom: 24px;
        }
        .subtotal-section table {
          width: 50%;
          margin-left: auto;
        }
        .subtotal-section td {
          padding: 6px 8px;
          border-bottom: 1px solid #ccc;
        }
        .total-row td {
          border-top: 2px solid #0D7377;
          font-weight: bold;
          font-size: 13px;
          padding-top: 8px;
        }
        .stars-section {
          text-align: center;
          margin: 24px 0;
          padding: 16px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
        }
        .star-symbols {
          font-size: 32px;
          color: #F4A423;
          letter-spacing: 4px;
        }
        .star-text {
          font-size: 14px;
          color: #444;
          margin-top: 6px;
        }
        .signatures-section {
          margin-top: 40px;
        }
        .sig-group-title {
          font-size: 13px;
          font-weight: bold;
          color: #0D7377;
          margin-bottom: 16px;
          border-bottom: 1px solid #0D7377;
          padding-bottom: 4px;
        }
        .sig-row {
          margin-bottom: 40px;
        }
      </style>
    </head>
    <body>

      <h1>SGLR RATING</h1>
      <h2>${resortName}</h2>

      <div class="info-block">
        <div class="info-item"><span class="info-label">Area:</span> ${area}</div>
        <div class="info-item"><span class="info-label">Manager:</span> ${ownerName}</div>
        <div class="info-item"><span class="info-label">Phone:</span> ${ownerPhone}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:6%">ID</th>
            <th style="width:64%">Description</th>
            <th style="width:15%; text-align:center">Max Marks</th>
            <th style="width:15%; text-align:center">Marks Awarded</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="subtotal-section">
        <table>
          <tbody>
            ${subtotalRows}
            <tr class="total-row">
              <td colspan="3"><strong>Total</strong></td>
              <td style="text-align:center"><strong>200</strong></td>
              <td style="text-align:center"><strong>${totalScore}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="stars-section">
        <div class="star-symbols">${stars}</div>
        <div class="star-text">${starsInWords}</div>
      </div>

      <div class="signatures-section">
        <div class="sig-row">
          <div class="sig-group-title">Divisional Committee Members</div>
          <div>${sigBoxes('Member')}</div>
        </div>
        <div class="sig-row">
          <div class="sig-group-title">District Committee Members</div>
          <div>${sigBoxes('Member')}</div>
        </div>
      </div>

    </body>
    </html>
  `;
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

    const handleDownloadPDF = async () => {
        try {
            const html = generateHTML(
                resort.name,
                resort.area,
                resort.ownerName,
                resort.ownerPhone,
                inspection.submittedAt,
                inspection.responses,
                inspection.totalScore,
                inspection.starRating
            );

            const { uri } = await Print.printToFileAsync({ html });
            const canShare = await Sharing.isAvailableAsync();

            if (canShare) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: `SGLR Report — ${resort.name}`,
                    UTI: 'com.adobe.pdf',
                });
            } else {
                Alert.alert('Sharing not available on this device.');
            }
        } catch (e) {
            Alert.alert('Failed to generate PDF. Please try again.');
            console.error(e);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={colors.primaryDark} barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{resort.name}</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={[
                styles.pendingBanner,
                resort.status === 'approved' && styles.approvedBanner
            ]}>
                <Text style={[
                    styles.pendingText,
                    resort.status === 'approved' && styles.approvedText
                ]}>
                    {resort.status === 'approved'
                        ? '🔒 Approved & Frozen'
                        : '⏳ Awaiting District Committee Approval'}
                </Text>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
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

                <View style={styles.totalSection}>
                    <Text style={[styles.totalText, { color: scoreColor }]}>
                        Overall Total: {inspection.totalScore} / 200
                    </Text>
                    <StarRow count={inspection.starRating} />
                </View>

                {/* Download PDF button */}
                <TouchableOpacity style={styles.pdfBtn} onPress={handleDownloadPDF}>
                    <Text style={styles.pdfBtnText}>⬇  Download PDF Report</Text>
                </TouchableOpacity>
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
    pdfBtn: {
        backgroundColor: colors.primaryDark,
        borderRadius: radius.lg,
        padding: spacing.md,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    pdfBtnText: {
        color: colors.cardWhite,
        fontWeight: 'bold',
        fontSize: 15,
    },
    approvedBanner: {
        backgroundColor: '#E8FAF0',
        borderBottomColor: colors.green,
    },
    approvedText: {
        color: colors.green,
    },
});