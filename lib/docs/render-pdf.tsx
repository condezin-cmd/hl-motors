import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { Doc, Block } from "./templates";

const s = StyleSheet.create({
  page: { paddingHorizontal: 48, paddingVertical: 54, fontSize: 10, fontFamily: "Helvetica", lineHeight: 1.5, color: "#111" },
  h1: { fontSize: 15, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 8 },
  h2: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 12, marginBottom: 4 },
  p: { marginBottom: 6, textAlign: "justify" },
  pb: { fontFamily: "Helvetica-Bold" },
  pc: { textAlign: "center" },
  kvRow: { flexDirection: "row", marginBottom: 2 },
  kvLabel: { fontFamily: "Helvetica-Bold", width: 120 },
  kvVal: { flex: 1 },
  sp: { height: 12 },
  small: { fontSize: 8, color: "#444", marginVertical: 6, textAlign: "justify" },
  signWrap: { marginTop: 28 },
  signLine: { borderTopWidth: 1, borderTopColor: "#111", width: 280, marginBottom: 3 },
  signCap: { fontSize: 9 },
});

function B({ b }: { b: Block }) {
  switch (b.t) {
    case "h1":
      return <Text style={s.h1}>{b.text}</Text>;
    case "h2":
      return <Text style={s.h2}>{b.text}</Text>;
    case "p":
      return (
        <Text style={[s.p, b.bold ? s.pb : {}, b.center ? s.pc : {}]}>{b.text}</Text>
      );
    case "kv":
      return (
        <View style={s.kvRow}>
          <Text style={s.kvLabel}>{b.label}:</Text>
          <Text style={s.kvVal}>{b.value}</Text>
        </View>
      );
    case "small":
      return <Text style={s.small}>{b.text}</Text>;
    case "sp":
      return <View style={s.sp} />;
    case "sign":
      return (
        <View style={s.signWrap}>
          <View style={s.signLine} />
          <Text style={s.signCap}>{b.caption}</Text>
        </View>
      );
    default:
      return null;
  }
}

function DocPDF({ doc }: { doc: Doc }) {
  return (
    <Document title={doc.titulo}>
      <Page size="A4" style={s.page}>
        {doc.blocks.map((b, i) => (
          <B key={i} b={b} />
        ))}
      </Page>
    </Document>
  );
}

export async function renderPdf(doc: Doc): Promise<Buffer> {
  return (await renderToBuffer(<DocPDF doc={doc} />)) as Buffer;
}
