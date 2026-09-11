import { renderToBuffer } from '@react-pdf/renderer';
import ReportDocument from './ReportDocument';
import React from 'react';

interface BuildPdfOptions {
  title: string;
  subtitle?: string;
  summary: { label: string; value: string }[];
  tables: {
    title: string;
    columns: { header: string; key: string; flex?: number }[];
    rows: Record<string, string | number>[];
  }[];
}

export async function buildPdf(opts: BuildPdfOptions): Promise<Buffer> {
  const doc = React.createElement(ReportDocument, opts);
  const buffer = await renderToBuffer(doc as any);
  return Buffer.from(buffer);
}