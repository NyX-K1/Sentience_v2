import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
    family: 'Open Sans',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-italic.ttf', fontStyle: 'italic' },
    ]
});

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Open Sans', backgroundColor: '#ffffff', color: '#1a1a1a' },
    header: { borderBottom: '2pt solid #1a1a1a', paddingBottom: 15, marginBottom: 25 },
    title: { fontSize: 24, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 },
    subtitle: { fontSize: 10, color: '#666666', marginTop: 5, textTransform: 'uppercase', letterSpacing: 0.5 },
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 14, fontWeight: 600, backgroundColor: '#f5f5f5', padding: '6 10', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    colLine: { flexDirection: 'row', paddingBottom: 8, borderBottom: '1pt solid #eeeeee', marginBottom: 8 },
    label: { fontSize: 10, fontWeight: 600, width: '40%', color: '#666' },
    value: { fontSize: 10, width: '60%' },
    statBoxList: { flexDirection: 'row', gap: 10, marginBottom: 15 },
    statBox: { flex: 1, padding: 12, border: '1pt solid #e5e5e5', borderRadius: 4 },
    statValue: { fontSize: 18, fontWeight: 600, marginBottom: 4 },
    statLabel: { fontSize: 9, color: '#666', textTransform: 'uppercase' },
    bullet: { fontSize: 10, marginBottom: 6, lineHeight: 1.4, paddingLeft: 10 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#fafafa', padding: 8, borderBottom: '1pt solid #ddd', fontSize: 9, fontWeight: 600, textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', padding: 8, borderBottom: '1pt solid #eee', fontSize: 9, lineHeight: 1.4 },
    colThought: { width: '45%', paddingRight: 10 },
    colReframe: { width: '55%' },
    italic: { fontStyle: 'italic', color: '#555' }
});

export interface ClinicalReportProps {
    dateRange: string;
    generationDate: string;
    metrics: {
        mood: {
            avgValence: string;
            avgArousal: string;
            topTriggers: { name: string; count: number }[];
        };
        cbt: {
            totalSessions: number;
            avgBeliefShift: string;
            topDistortions: { name: string; count: number }[];
            recentReframes: { thought: string; reframe: string }[];
        };
        journal: {
            predominantSentiment: string;
            recentInsights: string[];
        };
    };
}

export const ClinicalReportPDF = ({ dateRange, generationDate, metrics }: ClinicalReportProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Patient Clinical Summary</Text>
                <View style={[styles.row, { marginTop: 10 }]}>
                    <Text style={styles.subtitle}>Date Range: {dateRange}</Text>
                    <Text style={styles.subtitle}>Generated: {generationDate}</Text>
                </View>
            </View>

            {/* Section 1: Affect & Triggers */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Affect & Triggers (Mood Logs)</Text>
                <View style={styles.statBoxList}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.mood.avgValence}</Text>
                        <Text style={styles.statLabel}>Avg Valence (-1 to 1)</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.mood.avgArousal}</Text>
                        <Text style={styles.statLabel}>Avg Arousal (1 to 5)</Text>
                    </View>
                </View>
                <Text style={[styles.label, { marginBottom: 8 }]}>Primary Identified Triggers:</Text>
                {metrics.mood.topTriggers.length > 0 ? (
                    metrics.mood.topTriggers.map((t, i) => (
                        <Text key={i} style={styles.bullet}>• {t.name} ({t.count} occurrences)</Text>
                    ))
                ) : (
                    <Text style={styles.bullet}>No triggers recorded in this period.</Text>
                )}
            </View>

            {/* Section 2: Cognitive Restructuring */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Cognitive Restructuring (CBT)</Text>
                <View style={styles.statBoxList}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.cbt.totalSessions}</Text>
                        <Text style={styles.statLabel}>Total Completed Sessions</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.cbt.avgBeliefShift}%</Text>
                        <Text style={styles.statLabel}>Avg Belief De-escalation</Text>
                    </View>
                </View>

                <Text style={[styles.label, { marginBottom: 8 }]}>Predominant Cognitive Distortions:</Text>
                {metrics.cbt.topDistortions.length > 0 ? (
                    metrics.cbt.topDistortions.map((d, i) => (
                        <Text key={i} style={styles.bullet}>• {d.name} ({d.count} sessions)</Text>
                    ))
                ) : (
                    <Text style={styles.bullet}>No distortions recorded in this period.</Text>
                )}

                <Text style={[styles.label, { marginTop: 15, marginBottom: 8 }]}>Recent Automatic Thoughts vs. Reframes:</Text>
                {metrics.cbt.recentReframes.length > 0 ? (
                    <View style={{ marginTop: 5 }}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.colThought}>Automatic Thought</Text>
                            <Text style={styles.colReframe}>Selected Reframe</Text>
                        </View>
                        {metrics.cbt.recentReframes.map((r, i) => (
                            <View key={i} style={styles.tableRow}>
                                <Text style={[styles.colThought, styles.italic]}>"{r.thought}"</Text>
                                <Text style={styles.colReframe}>{r.reframe}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.bullet}>No recent thought reframes recorded.</Text>
                )}
            </View>

            {/* Section 3: AI Journal Insights */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Smart Journal Reflection Insights</Text>
                <View style={styles.colLine}>
                    <Text style={styles.label}>Predominant Sentiment:</Text>
                    <Text style={styles.value}>{metrics.journal.predominantSentiment || 'N/A'}</Text>
                </View>

                <Text style={[styles.label, { marginTop: 10, marginBottom: 8 }]}>Recent AI Core Insights (Based on Entry Content):</Text>
                {metrics.journal.recentInsights.length > 0 ? (
                    metrics.journal.recentInsights.map((insight, i) => (
                        <Text key={i} style={styles.bullet}>• {insight}</Text>
                    ))
                ) : (
                    <Text style={styles.bullet}>No journal insights generated in this period.</Text>
                )}
            </View>

            <View style={{ position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: '1pt solid #eee', paddingTop: 10 }}>
                <Text style={{ fontSize: 8, color: '#999', textAlign: 'center' }}>
                    Sentience AI — Clinical Summary Report (Strictly Confidential)
                </Text>
            </View>
        </Page>
    </Document>
);
