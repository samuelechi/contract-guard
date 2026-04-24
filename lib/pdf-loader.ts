import PDFParser from "pdf2json";

export async function extractTextFromPdf(fileBuffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new (PDFParser as any)(null, 1);

        pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));

        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            // If getRawTextContent() is empty, we manually pull text from pages
            let text = (pdfParser as any).getRawTextContent();

            if (!text || text.trim().length === 0) {
                text = pdfData.Pages.map((page: any) => {
                    return page.Texts.map((t: any) => decodeURIComponent(t.R[0].T)).join(" ");
                }).join("\n");
            }

            console.log("✅ Text extracted successfully. Length:", text.length);
            resolve(text);
        });

        pdfParser.parseBuffer(fileBuffer);
    });
}