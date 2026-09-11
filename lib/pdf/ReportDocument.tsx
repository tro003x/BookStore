import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
  title: { fontSize: 20, marginBottom: 4, fontFamily: 'Helvetica-Bold' },
  subtitle: { fontSize: 10, color: '#6B7280', marginBottom: 20 },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 8, color: '#0C0A00' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  summaryKey: { color: '#6B7280' },
  summaryValue: { fontFamily: 'Helvetica-Bold', color: '#0C0A00' },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F2EC',
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
    fontSize: 9,
  },
  cell: { flex: 1, paddingRight: 4 },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

interface SummaryItem {
  label: string;
  value: string;
}

interface TableData {
  title: string;
  columns: { header: string; key: string; flex?: number }[];
  rows: Record<string, string | number>[];
}

interface ReportDocumentProps {
  title: string;
  subtitle?: string;
  summary: SummaryItem[];
  tables: TableData[];
}

export default function ReportDocument({
  title,
  subtitle,
  summary,
  tables,
}: ReportDocumentProps) {
  const generated = new Date().toLocaleString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          Generated on {generated}
          {subtitle ? ` · ${subtitle}` : ''}
        </Text>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          {summary.map((item, i) => (
            <View key={i} style={styles.summaryRow}>
              <Text style={styles.summaryKey}>{item.label}</Text>
              <Text style={styles.summaryValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Tables */}
        {tables.map((table, ti) => (
          <View key={ti} style={styles.section} wrap>
            <Text style={styles.sectionTitle}>{table.title}</Text>

            <View style={styles.tableHeader}>
              {table.columns.map((col, ci) => (
                <Text
                  key={ci}
                  style={[styles.cell, col.flex ? { flex: col.flex } : {}]}
                >
                  {col.header}
                </Text>
              ))}
            </View>

            {table.rows.map((row, ri) => (
              <View key={ri} style={styles.tableRow} wrap={false}>
                {table.columns.map((col, ci) => (
                  <Text
                    key={ci}
                    style={[styles.cell, col.flex ? { flex: col.flex } : {}]}
                  >
                    {String(row[col.key] ?? '')}
                  </Text>
                ))}
              </View>
            ))}

            {table.rows.length === 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.cell}>No data available.</Text>
              </View>
            )}
          </View>
        ))}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `BoiStore Report · Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}