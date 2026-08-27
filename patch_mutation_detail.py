import re

with open('src/components/MutationDetail.tsx', 'r') as f:
    content = f.read()

email_icon = "Mail"
if "Mail" not in content.split("from 'lucide-react'")[0]:
    content = content.replace("FileEdit,", "FileEdit, Mail,")

handle_email = """
  const [isEmailing, setIsEmailing] = useState(false);

  const handleEmailPdf = async () => {
    try {
      setIsEmailing(true);
      const pdfBase64 = PdfService.generateMutationPdf(mutation, true) as string;
      await ApiService.emailDossier(mutation.id, pdfBase64);
      alert('PDF is succesvol naar uw e-mail verzonden.');
    } catch (e: any) {
      alert(e.message || 'Fout bij verzenden e-mail');
    } finally {
      setIsEmailing(false);
    }
  };
"""

if "handleEmailPdf" not in content:
    content = content.replace("const handleDownloadPdf = async () => {", handle_email + "\n  const handleDownloadPdf = async () => {")

email_button = """
          <button
            onClick={handleEmailPdf}
            disabled={isEmailing}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer ${
              isEmailing ? 'bg-indigo-600/50 text-white/70' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>{isEmailing ? 'Bezig met verzenden...' : 'Mail PDF'}</span>
          </button>
"""

if "Mail PDF" not in content:
    content = content.replace("{/* Direct PDF Download */}", email_button + "\n          {/* Direct PDF Download */}")

with open('src/components/MutationDetail.tsx', 'w') as f:
    f.write(content)
