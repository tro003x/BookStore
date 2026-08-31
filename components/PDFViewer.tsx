'use client';

import { useState, useEffect } from 'react';
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PDFViewerProps {
  bookId: string;
  preview?: boolean;
}

export default function PDFViewer({ bookId, preview = false }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const res = await fetch(
          `/api/books/${bookId}?preview=${preview}`
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load PDF');
          setLoading(false);
          return;
        }

        setPdfUrl(data.url);
        setLoading(false);
      } catch (err) {
        setError('Failed to load PDF');
        setLoading(false);
      }
    };

    fetchPdf();
  }, [bookId, preview]);

  if (loading) return <div className="p-4 text-center">Loading PDF...</div>;
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;
  if (!pdfUrl) return <div className="p-4 text-center">No PDF available</div>;

  return (
    <div className="h-[600px] w-full border border-[#C9BFA8] rounded">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={pdfUrl}
          plugins={[defaultLayoutPluginInstance]}
          defaultScale={SpecialZoomLevel.PageFit}
        />
      </Worker>
    </div>
  );
}