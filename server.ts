import express, { Request, Response } from "express";
import nodemailer from "nodemailer";
import path from "path";
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';
import {
  CreateMutationSchema,
  SearchQuerySchema,
  AmendMutationSchema,
} from './src/lib/validations/mutation.js';
import { UserRole } from './src/types/index.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper to extract authenticated officer context from headers
  const getOfficerContext = (req: Request) => {
    const userId = (req.headers['x-user-badge'] as string) || 'ADM-01';
    const userName = (req.headers['x-user-name'] as string) || 'Systeembeheerder AlphaCTX';
    const userRole = ((req.headers['x-user-role'] as string) || 'ADMIN') as UserRole;
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const justification = req.headers['x-justification'] as string | undefined;

    return { userId, userName, userRole, ipAddress, justification };
  };

  // ----------------------------------------------------------------------------
  // AUTHENTICATION ROUTES
  // ----------------------------------------------------------------------------
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Gebruikersnaam en wachtwoord zijn verplicht',
      });
    }

    const session = db.authenticate(username, password);
    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Onjuiste inloggegevens. Controleer uw gebruikersnaam en wachtwoord.',
      });
    }

    res.json({
      success: true,
      message: `Succesvol ingelogd als ${session.name}`,
      data: session,
    });
  });

  app.get('/api/auth/users', (_req: Request, res: Response) => {
    const users = db.getAllUsers();
    res.json({ success: true, data: users });
  });

  // ----------------------------------------------------------------------------
  // ADMIN MANAGEMENT (GEBRUIKERSBEHEER, BRIGADES & AUTORISATIEMATRIX)
  // ----------------------------------------------------------------------------
  app.get('/api/admin/users', (_req: Request, res: Response) => {
    const users = db.getAllUsers();
    res.json({ success: true, data: users });
  });

  app.post('/api/admin/users', (req: Request, res: Response) => {
    try {
      const userCtx = getOfficerContext(req);
      const { username, password, badgeNumber, name, rank, role, department, activeBrigade, activeUnit } = req.body;
      
      if (!username || !badgeNumber || !name) {
        return res.status(400).json({
          success: false,
          error: 'Gebruikersnaam, dienstnummer en naam zijn verplicht',
        });
      }

      const created = db.createUser(
        {
          username,
          password: password || 'KMar2026!',
          badgeNumber,
          name,
          rank: rank || 'Wachtmeester',
          role: role || 'PATROL_OFFICER',
          department: department || 'Grensbewaking & Handhaving',
          activeBrigade: activeBrigade || activeUnit || 'BRIGADE-SCHIPHOL',
          activeUnit: activeBrigade || activeUnit || 'BRIGADE-SCHIPHOL',
        },
        userCtx
      );

      res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/admin/users/:username', (req: Request, res: Response) => {
    try {
      const userCtx = getOfficerContext(req);
      const updated = db.updateUser(req.params.username, req.body, userCtx);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/admin/users/:username', (req: Request, res: Response) => {
    try {
      const userCtx = getOfficerContext(req);
      const deleted = db.deleteUser(req.params.username, userCtx);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Gebruiker niet gevonden' });
      }
      res.json({ success: true, message: 'Gebruiker succesvol verwijderd' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ----------------------------------------------------------------------------
  // BRIGADES MANAGEMENT (KONINKLIJKE MARECHAUSSEE BRIGADES)
  // ----------------------------------------------------------------------------
  app.get('/api/brigades', (_req: Request, res: Response) => {
    const list = db.getAllBrigades();
    res.json({ success: true, data: list });
  });

  app.get('/api/brigades/:code', (req: Request, res: Response) => {
    const brigade = db.getBrigade(req.params.code);
    if (!brigade) {
      return res.status(404).json({ success: false, error: 'Brigade niet gevonden' });
    }
    res.json({ success: true, data: brigade });
  });

  app.post('/api/brigades', (req: Request, res: Response) => {
    try {
      const userCtx = getOfficerContext(req);
      const created = db.createBrigade(req.body, userCtx);
      res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/brigades/:code', (req: Request, res: Response) => {
    try {
      const userCtx = getOfficerContext(req);
      const updated = db.updateBrigade(req.params.code, req.body, userCtx);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/brigades/:code', (req: Request, res: Response) => {
    try {
      const userCtx = getOfficerContext(req);
      const deleted = db.deleteBrigade(req.params.code, userCtx);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Brigade niet gevonden' });
      }
      res.json({ success: true, message: 'Brigade succesvol verwijderd' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ----------------------------------------------------------------------------
  // PERMISSIONS MATRIX (RBAC) ROUTES
  // ----------------------------------------------------------------------------
  
  app.get('/api/admin/smtp', (req: Request, res: Response) => {
    try {
      getOfficerContext(req); // just check auth
      res.json({ success: true, data: db.getSmtpSettings() });
    } catch(err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  });

  app.put('/api/admin/smtp', (req: Request, res: Response) => {
    try {
      const userCtx = getOfficerContext(req);
      const updated = db.saveSmtpSettings(userCtx, req.body);
      res.json({ success: true, data: updated, message: 'SMTP instellingen opgeslagen' });
    } catch(err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  });

  app.get('/api/admin/permissions', (_req: Request, res: Response) => {
    const data = db.getPermissionsMatrix();
    res.json({ success: true, data });
  });

  
  app.post('/api/admin/roles', (req: Request, res: Response) => {
    try {
      const userCtx = getOfficerContext(req);
      db.saveRoleDefinition(userCtx, req.body.role, req.body.originalId);
      res.json({ success: true, message: 'Profiel succesvol opgeslagen' });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/admin/roles/:id', (req: Request, res: Response) => {
    try {
      const userCtx = getOfficerContext(req);
      db.deleteRoleDefinition(userCtx, req.params.id);
      res.json({ success: true, message: 'Profiel succesvol verwijderd' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/admin/permissions', (req: Request, res: Response) => {
    try {
      const userCtx = getOfficerContext(req);
      const updated = db.savePermissionsMatrix(req.body.matrix, userCtx);
      res.json({ success: true, data: updated, message: 'Autorisatiematrix succesvol opgeslagen' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin/permissions/reset', (req: Request, res: Response) => {
    try {
      const userCtx = getOfficerContext(req);
      const reset = db.resetPermissionsMatrix(userCtx);
      res.json({ success: true, data: reset, message: 'Autorisatiematrix hersteld naar standaard' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Seed KMar Test Scenarios
  // ----------------------------------------------------------------------------
  // RDW KENTEKEN OPHALEN (OPEN DATA RDW API)
  // ----------------------------------------------------------------------------
  app.get('/api/rdw/lookup/:plate', async (req: Request, res: Response) => {
    try {
      const rawPlate = req.params.plate || '';
      const cleanPlate = rawPlate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

      if (!cleanPlate || cleanPlate.length < 4) {
        return res.status(400).json({
          success: false,
          error: 'Ongeldig kenteken opgegeven (minimaal 4 karakters)',
        });
      }

      // Fetch basic vehicle specs from Open Data RDW
      const rdwUrl = `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${cleanPlate}`;
      const response = await fetch(rdwUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'MEOS-Incident-System/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`RDW API status ${response.status}`);
      }

      const rdwItems = (await response.json()) as any[];

      if (!rdwItems || rdwItems.length === 0) {
        return res.json({
          success: true,
          found: false,
          message: `Geen RDW-registratie gevonden voor kenteken ${cleanPlate}`,
          data: null,
        });
      }

      const raw = rdwItems[0];

      // Also try fetching fuel data
      let brandstofOmschrijving = 'Benzine';
      try {
        const fuelUrl = `https://opendata.rdw.nl/resource/8ys7-d773.json?kenteken=${cleanPlate}`;
        const fuelResp = await fetch(fuelUrl, {
          headers: { Accept: 'application/json' },
        });
        if (fuelResp.ok) {
          const fuelItems = (await fuelResp.json()) as any[];
          if (fuelItems.length > 0 && fuelItems[0].brandstof_omschrijving) {
            brandstofOmschrijving = fuelItems[0].brandstof_omschrijving;
          }
        }
      } catch (fErr) {
        // Fallback fuel
      }

      // Parse year from datum_eerste_toelating
      let bouwjaar: number | undefined;
      if (raw.datum_eerste_toelating) {
        const yearStr = String(raw.datum_eerste_toelating).substring(0, 4);
        bouwjaar = parseInt(yearStr, 10);
      }

      const formattedData = {
        kenteken: raw.kenteken || cleanPlate,
        merk: raw.merk || 'ONBEKEND',
        handelsbenaming: raw.handelsbenaming || '',
        eersteKleur: raw.eerste_kleur || 'Onbekend',
        tweedeKleur: raw.tweede_kleur || undefined,
        bouwjaar: isNaN(bouwjaar!) ? undefined : bouwjaar,
        voertuigsoort: raw.voertuigsoort || 'Personenauto',
        inrichting: raw.inrichting || '',
        vervaldatumApk: raw.vervaldatum_apk_dt || raw.vervaldatum_apk || undefined,
        brandstofOmschrijving,
        wamVerzekerd: raw.wam_verzekerd || 'Ja',
        catalogusprijs: raw.catalogusprijs ? parseFloat(raw.catalogusprijs) : undefined,
        aantalZitplaatsen: raw.aantal_zitplaatsen ? parseInt(raw.aantal_zitplaatsen, 10) : undefined,
        cilinderinhoud: raw.cilinderinhoud ? parseInt(raw.cilinderinhoud, 10) : undefined,
        massaLeegVoertuig: raw.massa_ledig_voertuig ? parseInt(raw.massa_ledig_voertuig, 10) : undefined,
      };

      res.json({
        success: true,
        found: true,
        message: `Voertuig gevonden: ${formattedData.merk} ${formattedData.handelsbenaming}`,
        data: formattedData,
      });
    } catch (err: any) {
      console.error('RDW lookup error:', err);
      res.json({
        success: true,
        found: false,
        message: 'RDW service tijdelijk niet bereikbaar of kenteken niet gevonden.',
        data: null,
      });
    }
  });

  // ----------------------------------------------------------------------------
  // LOCATIE LOOKUP VIA POSTCODE + HUISNUMMER (PDOK BAG LOCATIESERVER V3.1)
  // Geeft de officiële volledige adresregel terug (bv. "Maria Stuartplein 472, 2595BW 's-Gravenhage")
  // ----------------------------------------------------------------------------
  app.get('/api/location/lookup', async (req: Request, res: Response) => {
    try {
      const rawPostcode = (req.query.postcode as string) || '';
      const postcode = rawPostcode.replace(/\s+/g, '').toUpperCase();
      const rawHuisnummer = (req.query.huisnummer as string) || '';
      const huisnummer = rawHuisnummer.trim();
      const toevoeging = ((req.query.toevoeging as string) || '').trim();

      if (!postcode || !huisnummer) {
        return res.status(400).json({
          success: false,
          error: 'Postcode en huisnummer zijn verplicht voor adresverificatie',
        });
      }

      // Officiële PDOK Locatieserver v3.1 zoek-URL
      let queryStr = `${postcode} ${huisnummer}`;
      if (toevoeging) {
        queryStr += ` ${toevoeging}`;
      }

      const pdokUrl = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(
        queryStr
      )}&fq=type:adres&rows=1`;

      const response = await fetch(pdokUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'MEOS-Incident-System/2.6 (Politie/Rijksoverheid)',
        },
      });

      if (!response.ok) {
        throw new Error(`PDOK API error status ${response.status}`);
      }

      const data = (await response.json()) as any;
      const docs = data.response?.docs || [];

      if (docs.length === 0) {
        // Fallback: probeer met Solr field query als vrije query niks vond
        const solrUrl = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=postcode:${postcode}+AND+huisnummer:${huisnummer}&fq=type:adres&rows=1`;
        const solrResp = await fetch(solrUrl, {
          headers: { Accept: 'application/json', 'User-Agent': 'MEOS-Incident-System/2.6' },
        });

        if (solrResp.ok) {
          const solrData = (await solrResp.json()) as any;
          const solrDocs = solrData.response?.docs || [];
          if (solrDocs.length > 0) {
            docs.push(solrDocs[0]);
          }
        }
      }

      if (docs.length === 0) {
        // Indien echt onbekend in BAG
        const fallbackDisplay = `${postcode} ${huisnummer}${toevoeging ? ' ' + toevoeging : ''}`;
        return res.json({
          success: true,
          found: false,
          message: 'Adres niet aangetroffen in BAG kadaster register',
          data: {
            volledigAdres: fallbackDisplay,
            weergavenaam: fallbackDisplay,
            straatnaam: 'Onbekend',
            huisnummer: huisnummer,
            huisletter: toevoeging || undefined,
            postcode: postcode,
            woonplaatsnaam: 'Nederland',
            gemeentenaam: 'Nederland',
          },
        });
      }

      const doc = docs[0];
      let lat: number | undefined;
      let lng: number | undefined;

      if (doc.centroide_ll) {
        const match = doc.centroide_ll.match(/POINT\s*\(\s*([\d.]+)\s+([\d.]+)\s*\)/);
        if (match) {
          lng = parseFloat(match[1]);
          lat = parseFloat(match[2]);
        }
      }

      // Officiële BAG adresnotatie conform Rijkshuisstijl
      const street = doc.straatnaam || '';
      const num = doc.huisnummer ? String(doc.huisnummer) : huisnummer;
      const letter = doc.huisletter ? ` ${doc.huisletter}` : (doc.huisnummertoevoeging ? `-${doc.huisnummertoevoeging}` : (toevoeging ? ` ${toevoeging}` : ''));
      const pc = doc.postcode || postcode;
      const city = doc.woonplaatsnaam || '';
      
      const formattedFullAddress = doc.weergavenaam || `${street} ${num}${letter}, ${pc} ${city}`;

      res.json({
        success: true,
        found: true,
        data: {
          volledigAdres: formattedFullAddress,
          weergavenaam: formattedFullAddress,
          straatnaam: street,
          huisnummer: num,
          huisletter: doc.huisletter || toevoeging || undefined,
          postcode: pc,
          woonplaatsnaam: city,
          gemeentenaam: doc.gemeentenaam || city,
          buurtnaam: doc.buurtnaam,
          wijknaam: doc.wijknaam,
          provincie: doc.provincienaam,
          lat,
          lng,
        },
      });
    } catch (err: any) {
      console.error('Location lookup error:', err);
      const postcode = ((req.query.postcode as string) || '').toUpperCase();
      const huisnummer = (req.query.huisnummer as string) || '';
      const fallbackAdres = `${postcode} ${huisnummer}`;
      res.json({
        success: true,
        found: false,
        data: {
          volledigAdres: fallbackAdres,
          weergavenaam: fallbackAdres,
          straatnaam: 'Onbekend',
          huisnummer: huisnummer,
          postcode: postcode,
          woonplaatsnaam: 'Nederland',
          gemeentenaam: 'Nederland',
        },
      });
    }
  });

  // Suggesties voor adresbalk via officiële search endpoint
  app.get('/api/location/suggest', async (req: Request, res: Response) => {
    try {
      const q = ((req.query.q as string) || '').trim();
      if (!q || q.length < 2) {
        return res.json({ success: true, suggestions: [] });
      }

      const pdokUrl = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest?q=${encodeURIComponent(
        q
      )}&rows=7`;
      const resp = await fetch(pdokUrl, {
        headers: { Accept: 'application/json', 'User-Agent': 'MEOS-Incident-System/2.6' },
      });

      if (!resp.ok) {
        return res.json({ success: true, suggestions: [] });
      }

      const data = (await resp.json()) as any;
      const docs = data.response?.docs || [];

      const suggestions = docs.map((d: any) => ({
        id: d.id,
        weergavenaam: d.weergavenaam,
        type: d.type,
      }));

      res.json({ success: true, suggestions });
    } catch (err: any) {
      res.json({ success: true, suggestions: [] });
    }
  });

  // ----------------------------------------------------------------------------
  // OFFICER PROFILE & PERSONAL MUTATIONS
  // ----------------------------------------------------------------------------
  app.get('/api/officer/:badgeNumber/mutations', (req: Request, res: Response) => {
    const { badgeNumber } = req.params;
    const result = db.getMutationsByOfficer(badgeNumber);
    res.json({ success: true, ...result });
  });

  // ----------------------------------------------------------------------------
  // SYSTEM STATS & MUTATIONS API
  // ----------------------------------------------------------------------------
  app.get('/api/stats', (req: Request, res: Response) => {
    const badgeNumber = req.header('x-user-badge');
    let userBrigade = undefined;
    if (badgeNumber) {
      const users = Array.from((db as any).users.values());
      const user = users.find(u => u.badgeNumber === badgeNumber);
      if (user) {
        userBrigade = user.activeBrigade;
      }
    }
    const stats = db.getStats(badgeNumber, userBrigade);
    res.json({ success: true, data: stats });
  });

  // Multi-parameter Mutation Search
  app.get('/api/mutations', (req: Request, res: Response) => {
    try {
      const parsed = SearchQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: 'Ongeldige zoekparameters',
          details: parsed.error.format(),
        });
      }

      const results = db.searchMutations(parsed.data);

      if (
        req.query.query ||
        req.query.licensePlate ||
        req.query.personName ||
        req.query.bsn ||
        req.query.serviceNumber ||
        req.query.location
      ) {
        const user = getOfficerContext(req);
        db.logAudit({
          action: 'SEARCH',
          userId: user.userId,
          userName: user.userName,
          userRole: user.userRole,
          ipAddress: user.ipAddress,
          metadata: JSON.stringify({
            query: req.query.query,
            plate: req.query.licensePlate,
            person: req.query.personName,
            bsn: req.query.bsn,
            serviceNumber: req.query.serviceNumber,
            location: req.query.location,
            resultsCount: results.total,
          }),
        });
      }

      res.json({ success: true, ...results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get Single Mutation Dossier
  app.get('/api/mutations/:id', (req: Request, res: Response) => {
    const user = getOfficerContext(req);
    const logRead = req.query.audit !== 'false';
    const mutation = db.getMutationById(req.params.id, { ...user, logRead });

    if (!mutation) {
      return res.status(404).json({ success: false, error: 'Mutatie dossier niet gevonden' });
    }

    res.json({ success: true, data: mutation });
  });

  // Create New Mutation
  app.post('/api/mutations', (req: Request, res: Response) => {
    try {
      const validation = CreateMutationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Validatiefout bij aanmaken mutatie',
          details: validation.error.flatten().fieldErrors,
          rawErrors: validation.error.issues,
        });
      }

      const user = getOfficerContext(req);
      const created = db.createMutation(validation.data, user);

      res.status(201).json({
        success: true,
        message: `Mutatie ${created.referenceNumber} succesvol geregistreerd`,
        data: created,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Amend Mutation
  app.post('/api/mutations/:id/amend', (req: Request, res: Response) => {
    try {
      const validation = AmendMutationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Ambtelijke wijziging vereist een geldige motivering en autorisatie',
          details: validation.error.flatten().fieldErrors,
        });
      }

      const user = getOfficerContext(req);
      const amended = db.amendMutation(
        req.params.id,
        validation.data.amendmentReason,
        validation.data.updatedFields,
        user
      );

      if (!amended) {
        return res.status(404).json({ success: false, error: 'Mutatie niet gevonden' });
      }

      res.json({
        success: true,
        message: `Mutatie ${amended.referenceNumber} succesvol gewijzigd`,
        data: amended,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update Status
  app.post('/api/mutations/:id/status', (req: Request, res: Response) => {
    const { status, reason } = req.body;
    if (!['DRAFT', 'FINAL', 'AMENDED', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Ongeldige status' });
    }

    const user = getOfficerContext(req);
    const updated = db.updateStatus(req.params.id, status, { ...user, reason });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Mutatie niet gevonden' });
    }

    res.json({ success: true, data: updated });
  });

  // Export Dossier to PDF/Printable PV & log audit
  
  app.post('/api/mutations/:id/email', async (req: Request, res: Response): Promise<void> => {
    try {
      const userCtx = getOfficerContext(req);
      const allUsers = (db as any).getAdminUsers ? (db as any).getAdminUsers() : (db as any).users ? Array.from((db as any).users.values()) : [];
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
        text: `Beste ${userCtx.userName},\n\nBijgaand ontvangt u de PDF-uitdraai van dossier ${mutation.referenceNumber}.\n\nMet vriendelijke groet,\nMEOS Digitaal Mutatiesysteem`,
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

  app.post('/api/mutations/:id/export', (req: Request, res: Response) => {
    const { justification } = req.body;
    const user = getOfficerContext(req);
    const mutation = db.getMutationById(req.params.id);

    if (!mutation) {
      return res.status(404).json({ success: false, error: 'Mutatie niet gevonden' });
    }

    // Log EXPORT action in immutable audit trail
    db.logAudit({
      action: 'EXPORT',
      targetMutationId: mutation.id,
      userId: user.userId,
      userName: user.userName,
      userRole: user.userRole,
      ipAddress: user.ipAddress,
      justification: justification || 'Officiële PDF uitdraai Proces-Verbaal',
    });

    res.json({
      success: true,
      message: 'Proces-Verbaal export geregistreerd in auditlog',
      mutation,
    });
  });

  // Registries
  app.get('/api/entities/persons', (_req: Request, res: Response) => {
    const persons = db.getAllPersons();
    res.json({ success: true, data: persons });
  });

  app.get('/api/entities/vehicles', (_req: Request, res: Response) => {
    const vehicles = db.getAllVehicles();
    res.json({ success: true, data: vehicles });
  });

  app.get('/api/audit-logs', (req: Request, res: Response) => {
    const action = req.query.action as any;
    const mutationId = req.query.mutationId as string;
    const userId = req.query.userId as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    const logs = db.getAuditLogs({ action, mutationId, userId, limit });
    res.json({ success: true, data: logs });
  });

  // Clear data
  app.post('/api/data/clear', (_req: Request, res: Response) => {
    db.clearAllData();
    res.json({ success: true, message: 'Alle data succesvol gewist (0 testdata)' });
  });

  // Prisma Schema
  app.get('/api/schema/prisma', (_req: Request, res: Response) => {
    try {
      const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
      const content = fs.readFileSync(schemaPath, 'utf8');
      res.json({ success: true, schema: content });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ----------------------------------------------------------------------------
  // VITE DEV MIDDLEWARE / STATIC PRODUCTION SERVING
  // ----------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MEOS Mutatiesysteem Server gestart op http://0.0.0.0:${PORT}`);
  });
}

startServer();
