// ==============================================================================
// MEOS MUTATIE RAPPORT & PROCES-VERBAAL (PV) PDF GENERATION SERVICE
// ==============================================================================

import { jsPDF } from 'jspdf';
import { MutationRecord, IncidentCategory, MutationType } from '../types/index.js';

export class PdfService {
  public static generateMutationPdf(mutation: MutationRecord, asBase64: boolean = false): string | void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = 18;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 20) {
        doc.addPage();
        y = 20;
        drawPageHeader();
      }
    };

    const drawPageHeader = () => {
      // Top divider line
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.8);
      doc.line(margin, 12, pageWidth - margin, 12);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('MEOS • MUTATIE RAPPORT & AMBTELIJK DOSSIER', margin, 10);
      doc.text(`REF: ${mutation.referenceNumber}`, pageWidth - margin, 10, { align: 'right' });
    };

    // --------------------------------------------------------------------------
    // 1. HEADER BANNER (MEOS BRANDING)
    // --------------------------------------------------------------------------
    doc.setFillColor(15, 23, 42); // Slate-900 / Navy
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');

    // Accent Gold Stripe
    doc.setFillColor(201, 168, 78);
    doc.rect(margin, y + 23, contentWidth, 1.5, 'F');

    // Title inside banner
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('MEOS', margin + 6, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(226, 232, 240);
    doc.text('PROCES-VERBAAL VAN BEVINDINGEN & MUTATIE', margin + 6, y + 15);
    doc.text('Mobiel Effectief Op Straat • Digitaal Ambtelijk Verslag', margin + 6, y + 20);

    // Right Side Metadata in Banner
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(mutation.referenceNumber, pageWidth - margin - 6, y + 9, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(`Datum: ${new Date(mutation.timestamp).toLocaleDateString('nl-NL')}`, pageWidth - margin - 6, y + 15, { align: 'right' });
    doc.text(`Status: ${mutation.status}`, pageWidth - margin - 6, y + 20, { align: 'right' });

    y += 32;

    // --------------------------------------------------------------------------
    // 2. VERBALISANTEN & DIENSTNUMMERS (MEERDERE DIENSTNUMMERS)
    // --------------------------------------------------------------------------
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 22, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('AMBTELIJKE IDENTIFICATIE & BETROKKEN DIENSTNUMMERS', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    
    // Primary Officer
    doc.text(`Hoofdverbalisant: ${mutation.officerName} (Dienstnr: ${mutation.officerBadge})`, margin + 4, y + 12);
    doc.text(`Eenheid: ${mutation.unitId} • Afdeling: ${mutation.department}`, margin + 4, y + 17);

    // Assisting Officers (Gekoppelde Dienstnummers)
    const assistingText =
      mutation.assistingOfficers && mutation.assistingOfficers.length > 0
        ? mutation.assistingOfficers.map((a) => `${a.name} (${a.badgeNumber})`).join(', ')
        : 'Geen secundaire dienstnummers gekoppeld';
    
    doc.setFont('helvetica', 'bold');
    doc.text('Gekoppelde Dienstnummers:', margin + 95, y + 12);
    doc.setFont('helvetica', 'normal');
    const splitAssisting = doc.splitTextToSize(assistingText, contentWidth - 100);
    doc.text(splitAssisting, margin + 95, y + 17);

    y += 28;

    // --------------------------------------------------------------------------
    // 3. MUTATIESOORT, INCIDENT DETAILS & LOCATIEGEGEVENS
    // --------------------------------------------------------------------------
    const typeMap: Record<MutationType, string> = {
  VRIJE_MUTATIE: 'Vrije mutatie',
  KLADMUTATIE: 'Kladmutatie',
  INFORMATIERAPPORT: 'Informatierapport (ID)',
  PV_BEVINDINGEN: 'PV van Bevindingen',
  PV_AANGIFTE: 'PV van Aangifte',
  PV_VERHOOR: 'PV van Verhoor',
  PV_AANHOUDING: 'PV van Aanhouding',
  EIND_PV: 'Eind-PV (Opsporingsindicatie)',
};

    const catMap: Record<IncidentCategory, string> = {
      WEAPONS_FIREARMS: 'Wapens & Vuurwapens (WWM)',
      NARCOTICS_DRUGS: 'Verdovende Middelen (Opiumwet)',
      TRAFFIC_VIOLATION_INCIDENT: 'Verkeersincident / Wegenverkeerswet',
      VIOLENT_CRIME_ASSAULT: 'Geweldsmisdrijf / Mishandeling',
      BURGLARY_THEFT: 'Diefstal / Woninginbraak',
      PUBLIC_ORDER_DISTURBANCE: 'Openbare Orde Verstoring (APV)',
      SUSPICIOUS_PERSON_ACTIVITY: 'Verdacht Persoon / Situatie',
      DOMESTIC_INCIDENT: 'Huiselijk Geweld & Zorg',
      FRAUD_FINANCIAL: 'Fraude / Financieel Economisch',
      PROPERTY_DAMAGE_VANDALISM: 'Vernieling / Zaaksbeschadiging',
      ENVIRONMENTAL_HAZARD: 'Milieu & Veiligheid',
      OTHER_OBSERVATION: 'Overige Ambtelijke Waarneming',
    };

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('INCIDENT DETAILS & VOLLEDIGE LOCATIE', margin + 3, y + 4.5);

    y += 7;

    const rowH = 6;
    const tableData = [
      ['Mutatiesoort', typeMap[mutation.mutationType] || mutation.mutationType],
      ['Soort incident / Categorie', catMap[mutation.category] || mutation.category],
      ['Dossier Status', mutation.status],
      ['Volledig Adres & Locatie', mutation.primaryAddress || 'Onbekend'],
      ['District / Sector', mutation.district || 'Centrum'],
      ['Tijdstip Incident', new Date(mutation.incidentDate || mutation.timestamp).toLocaleString('nl-NL')],
    ];

    tableData.forEach(([label, val], idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, rowH, 'F');
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(label, margin + 3, y + 4.2);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const splitVal = doc.splitTextToSize(String(val), contentWidth - 55);
      doc.text(splitVal, margin + 50, y + 4.2);

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + rowH, margin + contentWidth, y + rowH);
      y += rowH;
    });

    y += 4;

    // --------------------------------------------------------------------------
    // 4. RELATERING VAN DE WAARNEMINGEN (NARRATIEF)
    // --------------------------------------------------------------------------
    checkPageBreak(30);
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('1. RELATERING VAN DE WAARNEMINGEN (AMBTSEIDIG NARRATIEF)', margin + 3, y + 4);

    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);

    const narrativeLines = doc.splitTextToSize(mutation.narrativeSummary, contentWidth);
    narrativeLines.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin, y);
      y += 4.5;
    });

    y += 3;

    // --------------------------------------------------------------------------
    // 5. GETROFFEN MAATREGELEN & OPTREDEN TER PLAATSE
    // --------------------------------------------------------------------------
    if (mutation.tacticalAction) {
      checkPageBreak(25);
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, 5.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text('2. GETROFFEN MAATREGELEN & AMBTELIJK OPTREDEN', margin + 3, y + 4);

      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);

      const actionLines = doc.splitTextToSize(mutation.tacticalAction, contentWidth);
      actionLines.forEach((line: string) => {
        checkPageBreak(5);
        doc.text(line, margin, y);
        y += 4.5;
      });
      y += 3;
    }

    // --------------------------------------------------------------------------
    // 6. BETROKKEN PERSONEN
    // --------------------------------------------------------------------------
    if (mutation.persons && mutation.persons.length > 0) {
      checkPageBreak(25);
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, 5.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`3. GEREGISTREERDE PERSONEN (${mutation.persons.length})`, margin + 3, y + 4);

      y += 8;

      const roleLabels: Record<string, string> = {
        SUSPECT: 'Verdachte',
        VICTIM: 'Slachtoffer',
        WITNESS: 'Getuige',
        REPORTER: 'Melder',
        PERSON_OF_INTEREST: 'Betrokkene',
        OFFICER: 'Collega / Verbalisant',
      };

      mutation.persons.forEach((p, idx) => {
        checkPageBreak(20);
        doc.setDrawColor(203, 213, 225);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(margin, y, contentWidth, 18, 1, 1, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(
          `${idx + 1}. ${p.person.lastName}, ${p.person.firstName} ${p.person.alias ? `(alias: "${p.person.alias}")` : ''}`,
          margin + 3,
          y + 5
        );

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`ROL: ${roleLabels[p.role] || p.role}`, pageWidth - margin - 3, y + 5, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(
          `BSN: ${p.person.bsnNumber || 'Niet geregistreerd'} • Geboortedatum: ${p.person.dateOfBirth || 'Onbekend'} • Nationaliteit: ${p.person.nationality || 'Nederlandse'}`,
          margin + 3,
          y + 10
        );
        doc.text(`Adres: ${p.person.address || 'Geen vaste woon- of verblijfplaats geregistreerd'}`, margin + 3, y + 15);

        y += 21;
      });
    }

    // --------------------------------------------------------------------------
    // 7. BETROKKEN VOERTUIGEN (RDW GEGEVENS)
    // --------------------------------------------------------------------------
    if (mutation.vehicles && mutation.vehicles.length > 0) {
      checkPageBreak(25);
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, 5.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`4. BETROKKEN VOERTUIGEN & RDW GEGEVENS (${mutation.vehicles.length})`, margin + 3, y + 4);

      y += 8;

      mutation.vehicles.forEach((v) => {
        checkPageBreak(18);
        doc.setDrawColor(203, 213, 225);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(margin, y, contentWidth, 16, 1, 1, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(`[${v.vehicle.licensePlate}]`, margin + 3, y + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text(`${v.vehicle.make} ${v.vehicle.model} (${v.vehicle.color}) • Rol: ${v.role}`, margin + 30, y + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        const rdwInfo = v.vehicle.rdwVerified ? 'RDW Geverifieerd' : 'Handmatige invoer';
        const impoundInfo = v.isImpounded ? '• INBESLAGGENOMEN' : '';
        doc.text(
          `Soort: ${v.vehicle.vehicleType || 'Personenauto'} • ${rdwInfo} ${impoundInfo} ${v.damageNotes ? `• Schade: ${v.damageNotes}` : ''}`,
          margin + 3,
          y + 12
        );

        y += 19;
      });
    }

    // --------------------------------------------------------------------------
    // 8. INBESLAGGENOMEN GOEDEREN / BEWIJS
    // --------------------------------------------------------------------------
    if (mutation.evidence && mutation.evidence.length > 0) {
      checkPageBreak(25);
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, 5.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`5. INBESLAGGENOMEN GOEDEREN & KETEN VAN BEWARING (${mutation.evidence.length})`, margin + 3, y + 4);

      y += 8;

      mutation.evidence.forEach((e) => {
        checkPageBreak(15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`• ${e.evidence.description} (${e.evidence.itemNumber})`, margin + 3, y + 4);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(`Status: ${e.evidence.seizureStatus} • Opslag: ${e.evidence.storageLocker || 'Hoofdbureau'}`, margin + 6, y + 9);

        y += 12;
      });
    }

    // --------------------------------------------------------------------------
    // 9. AMBTSEED / AMBTSBELOFTE ONDERTEKENING
    // --------------------------------------------------------------------------
    checkPageBreak(35);
    y += 5;
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + contentWidth, y);

    y += 6;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Waarvan door mij, verbalisant, is opgemaakt dit proces-verbaal op ambtseed / ambtsbelofte op ${new Date().toLocaleDateString('nl-NL')}.`,
      margin,
      y
    );

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(mutation.officerName, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dienstnummer: ${mutation.officerBadge} • Eenheid: ${mutation.unitId}`, margin, y + 4.5);

    // Official MEOS Stamp box
    doc.setDrawColor(201, 168, 78);
    doc.roundedRect(pageWidth - margin - 50, y - 4, 50, 18, 1, 1, 'D');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(201, 168, 78);
    doc.text('MEOS DIGITAAL PV', pageWidth - margin - 25, y + 2, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('GEVALIDEERD & GEWAARMERKT', pageWidth - margin - 25, y + 7, { align: 'center' });
    doc.text(new Date().toISOString().split('T')[0], pageWidth - margin - 25, y + 11, { align: 'center' });

    const filename = `MEOS-${mutation.referenceNumber}.pdf`;
    if (asBase64) {
      return doc.output('datauristring');
    }
    doc.save(filename);
  }
}
