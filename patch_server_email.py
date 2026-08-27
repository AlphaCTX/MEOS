import re

with open('server.ts', 'r') as f:
    content = f.read()

if "import nodemailer" not in content:
    content = content.replace("import express", "import express\nimport nodemailer from 'nodemailer';")

route = """
  app.post('/api/mutations/:id/email', async (req: Request, res: Response): Promise<void> => {
    try {
      const userCtx = getOfficerContext(req);
      const allUsers = db.getUsers ? db.getUsers() : (db as any).users ? Array.from((db as any).users.values()) : [];
      const user = allUsers.find((u: any) => u.username === userCtx.userId);
      const recipient = user?.email || req.body.email;
      
      if (!recipient) {
        res.status(400).json({ success: false, error: 'Geen e-mailadres gevonden. Stel dit in via uw profiel.' });
        return;
      }

      const mutation = (db as any).mutations ? (db as any).mutations.find((m: any) => m.id === req.params.id) : null;
      if (!mutation) {
        res.status(404).json({ success: false, error: 'Mutatie niet gevonden' });
        return;
      }

      const smtp = db.getSmtpSettings();
      if (!smtp || !smtp.host) {
        res.status(400).json({ success: false, error: 'Mailserver is niet geconfigureerd in admin panel' });
        return;
      }

      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: parseInt(smtp.port || '587'),
        secure: parseInt(smtp.port) === 465,
        auth: {
          user: smtp.user,
          pass: smtp.pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const pdfBase64 = req.body.pdfData.includes('base64,') ? req.body.pdfData.split('base64,')[1] : req.body.pdfData;
      
      await transporter.sendMail({
        from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
        to: recipient,
        subject: `Dossier: ${mutation.referenceNumber} - MEOS Systeem`,
        text: `Beste ${userCtx.userName},\\n\\nBijgaand ontvangt u de PDF-uitdraai van dossier ${mutation.referenceNumber}.\\n\\nMet vriendelijke groet,\\nMEOS Digitaal Mutatiesysteem`,
        attachments: [
          {
            filename: `MEOS-${mutation.referenceNumber}.pdf`,
            content: pdfBase64,
            encoding: 'base64'
          }
        ]
      });
      
      // Log audit
      (db as any).logAudit({
        action: 'EXPORT_PDF',
        userId: userCtx.userId,
        userName: userCtx.userName,
        userRole: userCtx.userRole,
        metadata: `PDF per e-mail verzonden naar ${recipient}`
      });

      res.json({ success: true, message: 'E-mail succesvol verzonden' });
    } catch(err: any) {
      console.error('Email error:', err);
      res.status(500).json({ success: false, error: err.message || 'Fout bij verzenden email' });
    }
  });
"""

if "/api/mutations/:id/email" not in content:
    content = content.replace("app.post('/api/mutations/:id/export'", route + "\n  app.post('/api/mutations/:id/export'")

with open('server.ts', 'w') as f:
    f.write(content)
