import { Document, Packer, Paragraph, TextRun, Header, Footer, AlignmentType, BorderStyle } from "docx";

export const generateDocx = async (text: string): Promise<Blob> => {
  const lines = text.split('\n');
  const children = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
        children.push(new Paragraph({ text: "" })); // Linha vazia
        continue;
    }

    // Parser simples de Markdown Bold: **texto**
    // Divide a linha em segmentos normais e em negrito
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const runs = parts.map(part => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return new TextRun({
                text: part.replace(/\*\*/g, ''),
                bold: true,
                font: "Calibri",
                size: 24 // 12pt
            });
        }
        return new TextRun({
            text: part,
            font: "Calibri",
            size: 24 // 12pt
        });
    });

    children.push(new Paragraph({
        children: runs,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 360, after: 120 } // Espaçamento 1.5 e depois do parágrafo
    }));
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
            margin: {
                top: 720,    // ~1.27 cm
                bottom: 720, // ~1.27 cm
                left: 1700,  // ~3 cm
                right: 1134  // ~2 cm
            }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "PULINI", font: "Calibri Light", size: 64, color: "000000" }) // Fonte Grande
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "ADVOCACIA", font: "Calibri", size: 20, color: "000000" }) // Fonte Pequena
              ],
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 12, space: 4, color: "000000" } // Linha grossa
              },
              spacing: { after: 400 }
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "+55 14 99791-2815", font: "Calibri", size: 18, bold: true }),
                new TextRun({ text: "\npulini@adv.oabsp.org.br", break: 1, font: "Calibri", size: 18, bold: true }),
                new TextRun({ text: "\npuliniadvocacia.com.br", break: 1, font: "Calibri", size: 18, bold: true })
              ],
              alignment: AlignmentType.RIGHT,
              border: {
                top: { style: BorderStyle.SINGLE, size: 12, space: 4, color: "000000" } // Linha grossa
              }
            })
          ]
        })
      },
      children: children
    }]
  });

  return await Packer.toBlob(doc);
};