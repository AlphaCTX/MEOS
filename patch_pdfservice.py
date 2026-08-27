import re

with open('src/services/pdfService.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "public static generateMutationPdf(mutation: MutationRecord): void {", 
    "public static generateMutationPdf(mutation: MutationRecord, asBase64: boolean = false): string | void {"
)

old_save = """    // Download PDF directly
    const filename = `MEOS-${mutation.referenceNumber}.pdf`;
    doc.save(filename);"""

new_save = """    const filename = `MEOS-${mutation.referenceNumber}.pdf`;
    if (asBase64) {
      return doc.output('datauristring');
    }
    doc.save(filename);"""

content = content.replace(old_save, new_save)

with open('src/services/pdfService.ts', 'w') as f:
    f.write(content)
