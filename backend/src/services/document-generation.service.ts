import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import { PDFDocument } from 'pdf-lib';

export class DocumentGenerationService {
  static async generateFromTemplate(templateContent: any, variables: any): Promise<Buffer> {
    const template = Handlebars.compile(templateContent.html || '');
    const html = template(variables);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    });

    await browser.close();
    return pdf;
  }

  static async mergePDFs(pdfBuffers: Buffer[]): Promise<Buffer> {
    const mergedPdf = await PDFDocument.create();

    for (const pdfBuffer of pdfBuffers) {
      const pdf = await PDFDocument.load(pdfBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    return Buffer.from(await mergedPdf.save());
  }

  static async addWatermark(pdfBuffer: Buffer, watermarkText: string): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();

    pages.forEach((page) => {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width / 2 - 100,
        y: height / 2,
        size: 50,
        opacity: 0.2,
      });
    });

    return Buffer.from(await pdfDoc.save());
  }
}
