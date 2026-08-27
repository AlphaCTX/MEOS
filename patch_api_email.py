import re

with open('src/services/api.ts', 'r') as f:
    content = f.read()

email_fn = """
  public static async emailDossier(id: string, pdfData: string): Promise<any> {
    const res = await fetch(`/api/mutations/${id}/email`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ pdfData }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'E-mailen van dossier mislukt');
    return json;
  }
"""

if "emailDossier" not in content:
    content = content.replace("public static async exportDossier", email_fn + "\n  public static async exportDossier")

with open('src/services/api.ts', 'w') as f:
    f.write(content)
