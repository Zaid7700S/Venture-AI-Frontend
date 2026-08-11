import html2pdf from 'html2pdf.js';

export const usePdfExport = () => {
  const exportToPdf = (elementId, fileName) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#FFF2CF' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
  };

  return { exportToPdf };
};