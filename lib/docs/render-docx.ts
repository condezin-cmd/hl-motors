import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import type { Doc, Block } from "./templates";

function toParagraphs(b: Block): Paragraph[] {
  switch (b.t) {
    case "h1":
      return [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
          children: [new TextRun({ text: b.text, bold: true, size: 30 })],
        }),
      ];
    case "h2":
      return [
        new Paragraph({
          spacing: { before: 200, after: 80 },
          children: [new TextRun({ text: b.text, bold: true, size: 22 })],
        }),
      ];
    case "p":
      return [
        new Paragraph({
          alignment: b.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
          spacing: { after: 120 },
          children: [new TextRun({ text: b.text, bold: b.bold, size: 20 })],
        }),
      ];
    case "kv":
      return [
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: b.label + ": ", bold: true, size: 20 }),
            new TextRun({ text: b.value, size: 20 }),
          ],
        }),
      ];
    case "small":
      return [
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 80, after: 120 },
          children: [new TextRun({ text: b.text, size: 16, color: "444444" })],
        }),
      ];
    case "sp":
      return [new Paragraph({ children: [] })];
    case "sign":
      return [
        new Paragraph({
          spacing: { before: 360 },
          children: [new TextRun({ text: "_______________________________________", size: 20 })],
        }),
        new Paragraph({ children: [new TextRun({ text: b.caption, size: 18 })] }),
      ];
    default:
      return [];
  }
}

export async function renderDocx(doc: Doc): Promise<Buffer> {
  const children = doc.blocks.flatMap(toParagraphs);
  const document = new Document({ sections: [{ properties: {}, children }] });
  return (await Packer.toBuffer(document)) as Buffer;
}
