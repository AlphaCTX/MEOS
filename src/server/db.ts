// ==============================================================================
// IN-MEMORY RELATIONAL DATABASE ENGINE (MEOS MUTATIESYSTEEM)
// Strict relational integrity, join tables, caution flags, and append-only audit trails
// ==============================================================================

import {
  MutationRecord,
  PersonEntity,
  VehicleEntity,
  LocationEntity,
  EvidenceEntity,
  AuditLogEntry,
  MutationPersonLink,
  MutationVehicleLink,
  MutationLocationLink,
  MutationEvidenceLink,
  AttachmentItem,
  SystemStats,
  SearchFilterParams,
  UserRole,
  AuditAction,
  UserSession,
  AssistingOfficer,
  MutationType,
  BrigadeEntity,
  PermissionDefinition,
  RolePermissionMatrix,
  RoleDefinition,
} from '../types/index.js';
import { CreateMutationInput, UpdateMutationInput } from '../lib/validations/mutation.js';

export interface UserAccount {
  username: string;
  passwordHash: string; // Plaintext check for prototype: Stormpie1!
  badgeNumber: string;
  name: string;
  rank: string;
  email?: string;
  role: UserRole;
  department: string;
  activeBrigade?: string;
  activeUnit: string;
  isActive?: boolean;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  {
    key: 'MUTATION_CREATE',
    label: 'Mutaties Aanmaken',
    description: 'Nieuwe ambtelijke waarnemingen, controles en incidenten invoeren',
    category: 'MUTATIES',
  },
  {
    key: 'MUTATION_AMEND',
    label: 'Mutaties Amenderen',
    description: 'Bestaande definitieve mutaties formeel wijzigen via ambtelijk proces-verbaal',
    category: 'MUTATIES',
  },
  {
    key: 'DOSSIER_VALIDATE',
    label: 'Dossier Bekrachtigen (Status FINAL)',
    description: 'Ambtseedige mutaties definitief bekrachtigen en sluiten',
    category: 'DOSSIERS',
  },
  {
    key: 'EXPORT_PDF',
    label: 'PDF Proces-Verbaal Genereren',
    description: 'Volledig ambtelijk exportdossier genereren en downloaden',
    category: 'DOSSIERS',
  },
  {
    key: 'ANPR_LOOKUP',
    label: 'RDW & ANPR Bevragingen',
    description: 'Rechtstreeks bevragen van het RDW kentekenregister en voertuigdata',
    category: 'ENTITEITEN',
  },
  {
    key: 'COERCION_AUTHORIZE',
    label: 'Dwangmiddelen & Cautie Registreren',
    description: 'Vastleggen van geweldsaanwending, fouillering en inbeslagnames (Art. 94 Sv)',
    category: 'ENTITEITEN',
  },
  {
    key: 'AUDIT_VIEW',
    label: 'Onomkeerbare Auditlog Inzien',
    description: 'Inzien van alle logging en verantwoording conform AVG en Wpg',
    category: 'ADMIN_BEHEER',
  },
  {
    key: 'USER_MANAGE',
    label: 'Verbalisanten & Accounts Beheren',
    description: 'Aanmaken, bewerken, deactiveren en verwijderen van MEOS profielen',
    category: 'ADMIN_BEHEER',
  },
  {
    key: 'BRIGADE_MANAGE',
    label: 'Brigades & Standplaatsen Beheren',
    description: 'Aanmaken, bewerken en beheren van KMar brigades en kazernes',
    category: 'ADMIN_BEHEER',
  },
  {
    key: 'PERMISSIONS_MANAGE',
    label: 'Autorisatiematrix Bewerken',
    description: 'Aanpassen en opslaan van rolgebaseerde rechten (RBAC)',
    category: 'ADMIN_BEHEER',
  },
  {
    key: 'DATABASE_RESET',
    label: 'Database Beheren & Resetten',
    description: 'Wissen van testdata of genereren van operationele testscenario\'s',
    category: 'ADMIN_BEHEER',
  },
];

const DEFAULT_PERMISSIONS: RolePermissionMatrix = {
  PATROL_OFFICER: {
    MUTATION_CREATE: true,
    MUTATION_AMEND: true,
    DOSSIER_VALIDATE: true,
    EXPORT_PDF: true,
    ANPR_LOOKUP: true,
    COERCION_AUTHORIZE: true,
    AUDIT_VIEW: false,
    USER_MANAGE: false,
    BRIGADE_MANAGE: false,
    PERMISSIONS_MANAGE: false,
    DATABASE_RESET: false,
  },
  INVESTIGATOR: {
    MUTATION_CREATE: true,
    MUTATION_AMEND: true,
    DOSSIER_VALIDATE: true,
    EXPORT_PDF: true,
    ANPR_LOOKUP: true,
    COERCION_AUTHORIZE: true,
    AUDIT_VIEW: true,
    USER_MANAGE: false,
    BRIGADE_MANAGE: false,
    PERMISSIONS_MANAGE: false,
    DATABASE_RESET: false,
  },
  WATCH_COMMANDER: {
    MUTATION_CREATE: true,
    MUTATION_AMEND: true,
    DOSSIER_VALIDATE: true,
    EXPORT_PDF: true,
    ANPR_LOOKUP: true,
    COERCION_AUTHORIZE: true,
    AUDIT_VIEW: true,
    USER_MANAGE: true,
    BRIGADE_MANAGE: true,
    PERMISSIONS_MANAGE: false,
    DATABASE_RESET: false,
  },
  ADMIN: {
    MUTATION_CREATE: true,
    MUTATION_AMEND: true,
    DOSSIER_VALIDATE: true,
    EXPORT_PDF: true,
    ANPR_LOOKUP: true,
    COERCION_AUTHORIZE: true,
    AUDIT_VIEW: true,
    USER_MANAGE: true,
    BRIGADE_MANAGE: true,
    PERMISSIONS_MANAGE: true,
    DATABASE_RESET: true,
  },
};


export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: 'ADMIN',
    title: 'Systeembeheerder (ADMIN)',
    desc: 'Volledige beheerrechten & auditrechten',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30',
  },
  {
    id: 'WATCH_COMMANDER',
    title: 'Hulp-Officier / Wachtcommandant',
    desc: 'Dossierautorisatie, dwangmiddelen & validatie',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30',
  },
  {
    id: 'INVESTIGATOR',
    title: 'Rechercheur / Onderzoeker',
    desc: 'Uitgebreide opsporing & dossierinzage',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
  },
  {
    id: 'PATROL_OFFICER',
    title: 'Patrouilleur / Verbalisant',
    desc: 'Ambtelijke registratie & waarnemingen',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30',
  }
];

class LawEnforcementDatabase {
  private mutations: Map<string, MutationRecord> = new Map();
  private persons: Map<string, PersonEntity> = new Map();
  private vehicles: Map<string, VehicleEntity> = new Map();
  private locations: Map<string, LocationEntity> = new Map();
  private evidence: Map<string, EvidenceEntity> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  private users: Map<string, UserAccount> = new Map();
  private brigades: Map<string, BrigadeEntity> = new Map();
  private roleDefinitions: RoleDefinition[] = JSON.parse(JSON.stringify(DEFAULT_ROLES));
  private rolePermissions: RolePermissionMatrix = JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS));
  private sequenceCounter: number = 1000;

  private smtpSettings: any = {
    host: '',
    port: '587',
    user: '',
    pass: '',
    fromEmail: 'noreply@marechaussee.nl',
    fromName: 'MEOS Systeem'
  };

  public getSmtpSettings(): any {
    return this.smtpSettings;
  }

  public saveSmtpSettings(adminContext: { userId: string; userName: string; userRole: string }, settings: any): any {
    this.smtpSettings = { ...this.smtpSettings, ...settings };
    this.logAudit({
      action: 'SYSTEM_SETTINGS_UPDATE',
      userId: adminContext.userId,
      userName: adminContext.userName,
      userRole: adminContext.userRole,
      metadata: 'SMTP instellingen bijgewerkt',
    });
    return this.smtpSettings;
  }


  constructor() {
    this.initBrigades();
    this.initUsers();
    // Default: Geen test data (Clean operational database)
  }

  // ----------------------------------------------------------------------------
  // BRIGADES MANAGEMENT (KONINKLIJKE MARECHAUSSEE BRIGADES & KAZERNES)
  // ----------------------------------------------------------------------------
  private initBrigades(): void {
    const defaultBrigades: BrigadeEntity[] = [
      {
        code: 'BRIGADE-SCHIPHOL',
        name: 'Brigade Politie & Beveiliging Schiphol',
        region: 'Luchthaven Schiphol / Noord-Holland',
        taskType: 'Luchthavenbeveiliging & Grensbewaking',
        stationLocation: 'Koningin Máximakazerne, Schiphol-Centrum',
        commanderBadge: 'KMar-8401 (Kapitein J. Bakker)',
        isActive: true,
        description: 'Verantwoordelijk voor integrale politietaak, grensbewaking en beveiliging van de burgerluchtvaart.',
      },
      {
        code: 'BRIGADE-HOOG-RISICO',
        name: 'Brigade Hoog Risico Beveiliging (HRB)',
        region: 'Landelijk / Den Haag & Omstreken',
        taskType: 'Gewapende Beveiliging & Interventie',
        stationLocation: 'Campagnekazerne, Den Haag',
        commanderBadge: 'KMar-7102 (Majoor D. de Boer)',
        isActive: true,
        description: 'Gespecialiseerd in zware objectbeveiliging, diplomatieke missies en terrorismegevolgbestrijding.',
      },
      {
        code: 'BRIGADE-GRENZEN-ZUID',
        name: 'Brigade Grensbewaking Zuid & Vreemdelingentoezicht',
        region: 'Zeeland & Noord-Brabant & Limburg',
        taskType: 'Mobiel Toezicht Veiligheid (MTV)',
        stationLocation: 'Willem III Kazerne, Apeldoorn/Eindhoven',
        commanderBadge: 'KMar-6204 (Kapitein S. Meijer)',
        isActive: true,
        description: 'Toezicht op de binnengrenzen (MTV), bestrijding mensensmokkel en grensoverschrijdende criminaliteit.',
      },
      {
        code: 'BRIGADE-GRENZEN-OOST',
        name: 'Brigade Grensbewaking Oost (MTV)',
        region: 'Overijssel, Gelderland & Drenthe',
        taskType: 'Grenscontrole & Snelwegsurveillance',
        stationLocation: 'Kazerne Zevenaar / De Lutte',
        commanderBadge: 'KMar-5519 (Opperwachtmeester R. Jansen)',
        isActive: true,
        description: 'Surveillance op de snelweg- en spoorwegcorridors richting Duitsland.',
      },
      {
        code: 'BRIGADE-GRENZEN-NOORD',
        name: 'Brigade Grensbewaking Noord',
        region: 'Groningen, Friesland & Waddenzee',
        taskType: 'Kustbewaking & Zeehavens',
        stationLocation: 'Eemshaven Kazerne',
        commanderBadge: 'KMar-4911 (Eerste Luitenant P. Visser)',
        isActive: true,
        description: 'Grenstoezicht zeehavens, visserij-inspecties en maritieme grensbewaking.',
      },
      {
        code: 'BRIGADE-RECHERCHE',
        name: 'Brigade Recherche & Forensische Opsporing KMar',
        region: 'Landelijk Opsporingsdomein',
        taskType: 'Recherche & Ondermijning',
        stationLocation: 'Staf KMar, Utrechtse Heuvelrug',
        commanderBadge: 'KMar-7721 (Kapitein K. Visser)',
        isActive: true,
        description: 'Opsporing van mensenhandel, documentfraude, witwassen en militaire delicten.',
      },
      {
        code: 'BRIGADE-BEVEILIGING',
        name: 'Brigade Speciale Beveiligingsopdrachten (BSB)',
        region: 'Nationaal & Internationaal',
        taskType: 'Special Forces & Persoonsbeveiliging',
        stationLocation: 'Koningin Beatrixkazerne, Den Haag',
        commanderBadge: 'KMar-9010 (Luitenant-kolonel M. Hendriks)',
        isActive: true,
        description: 'Interventie-eenheid, persoonsbeveiliging van hoogwaardigheidsbekleders en getuigenbescherming.',
      },
      {
        code: 'BRIGADE-DENHAAG',
        name: 'Brigade Den Haag & Paleisbeveiliging',
        region: 'Haaglanden / Koninklijk Huis',
        taskType: 'Ceremoniële Dienst & Paleiswacht',
        stationLocation: 'Paleis Noordeinde / Binnenhof',
        commanderBadge: 'KMar-3301 (Majoor H. van Gelder)',
        isActive: true,
        description: 'Beveiliging van de koninklijke paleizen, ministeries en officiële residenties.',
      },
      {
        code: 'BRIGADE-HQ-COMMAND',
        name: 'Staf Korpsleiding & Commandant KMar',
        region: 'Staf Den Haag / Apeldoorn',
        taskType: 'Leiding, Beleid & Systeembeheer',
        stationLocation: 'Frederikkazerne, Den Haag',
        commanderBadge: 'ADM-01 (Luitenant-kolonel AlphaCTX)',
        isActive: true,
        description: 'Centrale korpsleiding, IT-beheer en MEOS autorisaties.',
      },
    ];

    for (const b of defaultBrigades) {
      this.brigades.set(b.code, b);
    }
  }

  public getAllBrigades(): BrigadeEntity[] {
    const list = Array.from(this.brigades.values());
    // Calculate officer count dynamically
    return list.map((b) => {
      const officerCount = Array.from(this.users.values()).filter(
        (u) => (u.activeBrigade || u.activeUnit) === b.code
      ).length;
      return { ...b, officerCount };
    });
  }

  public getBrigade(code: string): BrigadeEntity | null {
    const clean = (code || '').trim().toUpperCase();
    const b = this.brigades.get(clean);
    if (!b) return null;
    const officerCount = Array.from(this.users.values()).filter(
      (u) => (u.activeBrigade || u.activeUnit) === b.code
    ).length;
    return { ...b, officerCount };
  }

  public createBrigade(
    data: {
      code: string;
      name: string;
      region: string;
      taskType: string;
      stationLocation: string;
      commanderBadge?: string;
      description?: string;
      isActive?: boolean;
    },
    adminContext: { userId: string; userName: string; userRole: UserRole }
  ): BrigadeEntity {
    const cleanCode = (data.code || '').trim().toUpperCase().replace(/\s+/g, '-');
    if (!cleanCode) throw new Error('Brigade code is verplicht.');
    if (this.brigades.has(cleanCode)) {
      throw new Error(`Brigade met code "${cleanCode}" bestaat al.`);
    }

    const newBrigade: BrigadeEntity = {
      code: cleanCode,
      name: data.name.trim(),
      region: data.region.trim(),
      taskType: data.taskType.trim(),
      stationLocation: data.stationLocation.trim(),
      commanderBadge: data.commanderBadge?.trim() || '',
      description: data.description?.trim() || '',
      isActive: data.isActive !== false,
    };

    this.brigades.set(cleanCode, newBrigade);

    this.logAudit({
      action: 'BRIGADE_CREATE',
      userId: adminContext.userId,
      userName: adminContext.userName,
      userRole: adminContext.userRole,
      justification: `Nieuwe KMar Brigade geregistreerd: ${newBrigade.name} (${newBrigade.code})`,
    });

    return { ...newBrigade, officerCount: 0 };
  }

  public updateBrigade(
    code: string,
    updateData: Partial<BrigadeEntity>,
    adminContext: { userId: string; userName: string; userRole: UserRole }
  ): BrigadeEntity {
    const cleanCode = (code || '').trim().toUpperCase();
    const existing = this.brigades.get(cleanCode);
    if (!existing) {
      throw new Error(`Brigade met code "${code}" niet gevonden.`);
    }

    let newCode = cleanCode;
    if (updateData.code && updateData.code.trim().toUpperCase() !== cleanCode) {
      newCode = updateData.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      if (this.brigades.has(newCode)) {
        throw new Error(`Er bestaat al een brigade met code "${newCode}".`);
      }
    }

    const updated: BrigadeEntity = {
      ...existing,
      code: newCode,
      name: updateData.name ? updateData.name.trim() : existing.name,
      region: updateData.region ? updateData.region.trim() : existing.region,
      taskType: updateData.taskType ? updateData.taskType.trim() : existing.taskType,
      stationLocation: updateData.stationLocation ? updateData.stationLocation.trim() : existing.stationLocation,
      commanderBadge: updateData.commanderBadge !== undefined ? updateData.commanderBadge.trim() : existing.commanderBadge,
      description: updateData.description !== undefined ? updateData.description.trim() : existing.description,
      isActive: updateData.isActive !== undefined ? updateData.isActive : existing.isActive,
    };

    if (newCode !== cleanCode) {
      this.brigades.delete(cleanCode);
      for (const [username, user] of this.users.entries()) {
        let changed = false;
        if (user.activeBrigade === cleanCode) {
          user.activeBrigade = newCode;
          changed = true;
        }
        if (user.activeUnit === cleanCode) {
          user.activeUnit = newCode;
          changed = true;
        }
        if (changed) {
          this.users.set(username, user);
        }
      }
    }
    this.brigades.set(newCode, updated);

    this.logAudit({
      action: 'BRIGADE_UPDATE',
      userId: adminContext.userId,
      userName: adminContext.userName,
      userRole: adminContext.userRole,
      justification: `KMar Brigade bijgewerkt: ${updated.name} (${updated.code})`,
    });

    const officerCount = Array.from(this.users.values()).filter(
      (u) => (u.activeBrigade || u.activeUnit) === updated.code
    ).length;

    return { ...updated, officerCount };
  }

  public deleteBrigade(
    code: string,
    adminContext: { userId: string; userName: string; userRole: UserRole }
  ): boolean {
    const cleanCode = (code || '').trim().toUpperCase();
    if (cleanCode === 'BRIGADE-HQ-COMMAND') {
      throw new Error('De Staf/HQ Brigade kan niet worden verwijderd.');
    }
    const existing = this.brigades.get(cleanCode);
    if (!existing) return false;

    // Check if officers are assigned
    const assignedOfficers = Array.from(this.users.values()).filter(
      (u) => (u.activeBrigade || u.activeUnit) === cleanCode
    );
    if (assignedOfficers.length > 0) {
      throw new Error(
        `Kan brigade ${existing.name} niet verwijderen omdat er nog ${assignedOfficers.length} verbalisant(en) aan gekoppeld zijn.`
      );
    }

    this.brigades.delete(cleanCode);

    this.logAudit({
      action: 'BRIGADE_DELETE',
      userId: adminContext.userId,
      userName: adminContext.userName,
      userRole: adminContext.userRole,
      justification: `KMar Brigade verwijderd: ${existing.name} (${existing.code})`,
    });

    return true;
  }

  // ----------------------------------------------------------------------------
  // PERMISSIONS MATRIX (RBAC)
  // ----------------------------------------------------------------------------
  
  
  public checkPermission(userRole: string, permissionKey: string): boolean {
    if (userRole === 'ADMIN') return true;
    const perms = this.rolePermissions[userRole];
    if (!perms) return false;
    return perms[permissionKey] === true;
  }

  public getRoleDefinitions(): RoleDefinition[] {
    return this.roleDefinitions;
  }

  public saveRoleDefinition(
    adminContext: { userId: string; userName: string; userRole: UserRole },
    role: RoleDefinition,
    originalId?: string
  ): void {
    if (originalId && originalId !== role.id) {
      // It's a rename
      if (originalId === 'ADMIN' && role.id !== 'ADMIN') {
        throw new Error('De ID van het hoofd-beheerdersprofiel (ADMIN) kan niet worden gewijzigd');
      }
      if (this.roleDefinitions.some(r => r.id === role.id)) {
        throw new Error(`Er bestaat al een profiel met ID ${role.id}`);
      }
      
      const idx = this.roleDefinitions.findIndex(r => r.id === originalId);
      if (idx >= 0) {
        this.roleDefinitions[idx] = role;
      }
      
      // Migrate users
      for (const [uid, user] of this.users.entries()) {
        if (user.role === originalId) {
          user.role = role.id as UserRole;
        }
      }
      
      // Migrate permissions
      if (this.rolePermissions[originalId]) {
        this.rolePermissions[role.id] = this.rolePermissions[originalId];
        delete this.rolePermissions[originalId];
      }
    } else {
      const idx = this.roleDefinitions.findIndex(r => r.id === role.id);
      if (idx >= 0) {
        this.roleDefinitions[idx] = role;
      } else {
        this.roleDefinitions.push(role);
        if (!this.rolePermissions[role.id]) {
          this.rolePermissions[role.id] = {};
          PERMISSION_DEFINITIONS.forEach(def => {
            this.rolePermissions[role.id][def.key] = false;
          });
        }
      }
    }
    
    this.logAudit({
      action: 'PERMISSIONS_UPDATE',
      userId: adminContext.userId,
      userName: adminContext.userName,
      userRole: adminContext.userRole,
      metadata: 'Opgeslagen profiel: ' + role.title + (originalId && originalId !== role.id ? ` (Voorheen: ${originalId})` : ''),
    });
  }

  public deleteRoleDefinition(
    adminContext: { userId: string; userName: string; userRole: UserRole },
    roleId: string
  ): void {
    let hasUsers = false;
    for (const user of this.users.values()) {
      if (user.role === roleId) {
        hasUsers = true;
        break;
      }
    }
    if (roleId === 'ADMIN') {
      throw new Error('Het hoofd-beheerdersprofiel (ADMIN) kan niet worden verwijderd');
    }
    if (hasUsers) {
      throw new Error('Kan dit profiel niet verwijderen omdat er nog gebruikers aan gekoppeld zijn');
    }
    this.roleDefinitions = this.roleDefinitions.filter(r => r.id !== roleId);
    delete this.rolePermissions[roleId];
    this.logAudit({
      action: 'PERMISSIONS_UPDATE',
      userId: adminContext.userId,
      userName: adminContext.userName,
      userRole: adminContext.userRole,
      metadata: 'Verwijderd profiel: ' + roleId,
    });
  }

  public getPermissionsMatrix(): any {
    return {
      matrix: JSON.parse(JSON.stringify(this.rolePermissions)),
      definitions: PERMISSION_DEFINITIONS,
      roles: this.roleDefinitions,
    };
  }

  public savePermissionsMatrix(
    newMatrix: RolePermissionMatrix,
    adminContext: { userId: string; userName: string; userRole: UserRole }
  ): RolePermissionMatrix {
    this.rolePermissions = JSON.parse(JSON.stringify(newMatrix));

    this.logAudit({
      action: 'PERMISSIONS_UPDATE',
      userId: adminContext.userId,
      userName: adminContext.userName,
      userRole: adminContext.userRole,
      justification: `Autorisatiematrix (RBAC rechten) succesvol bijgewerkt en bekrachtigd door beheerder`,
    });

    return JSON.parse(JSON.stringify(this.rolePermissions));
  }

  public resetPermissionsMatrix(
    adminContext: { userId: string; userName: string; userRole: UserRole }
  ): RolePermissionMatrix {
    this.rolePermissions = JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS));

    this.logAudit({
      action: 'PERMISSIONS_UPDATE',
      userId: adminContext.userId,
      userName: adminContext.userName,
      userRole: adminContext.userRole,
      justification: `Autorisatiematrix hersteld naar officiële standaardinstellingen`,
    });

    return JSON.parse(JSON.stringify(this.rolePermissions));
  }

  // ----------------------------------------------------------------------------
  // USER ACCOUNTS & AUTHENTICATION (KONINKLIJKE MARECHAUSSEE RANKS & BRIGADES)
  // ----------------------------------------------------------------------------
  private initUsers(): void {
    // Default Admin Account (AlphaCTX / Stormpie1!)
    this.users.set('alphactx', {
      username: 'AlphaCTX',
      passwordHash: 'Stormpie1!',
      badgeNumber: 'ADM-01',
      name: 'Systeembeheerder AlphaCTX',
      rank: 'Luitenant-kolonel',
      role: 'ADMIN',
      department: 'Korpsstaf & MEOS Systeembeheer',
      activeBrigade: 'BRIGADE-HQ-COMMAND',
      activeUnit: 'BRIGADE-HQ-COMMAND',
      isActive: true,
    });
  }

    public authenticate(usernameInput: string, passwordInput: string): UserSession | null {
    const user = this.users.get(usernameInput.toLowerCase());
    
    // Default system admin bypass for alphactx
    if (usernameInput.toLowerCase() === 'alphactx' && passwordInput === 'Stormpie1!') {
      return {
        username: 'AlphaCTX',
        badgeNumber: 'ADM-01',
        name: 'Systeembeheerder AlphaCTX',
        rank: 'Hoofdinspecteur / Admin',
        role: 'ADMIN',
        department: 'Korpsleiding & Systeembeheer',
        activeUnit: 'HQ-COMMAND',
        isAdmin: true,
        permissions: PERMISSION_DEFINITIONS.map(d => d.key)
      };
    }

    if (user && user.passwordHash === passwordInput && user.isActive !== false) {
      this.logAudit({
        action: 'SYSTEM_LOGIN',
        userId: user.username,
        userName: user.name,
        userRole: user.role,
        metadata: 'Succesvolle inlog via systeem'
      });
      
      const rolePerms = this.rolePermissions[user.role] || {};
      const activePerms = Object.entries(rolePerms).filter(([_, val]) => val).map(([key, _]) => key);

      return {
        username: user.username,
        badgeNumber: user.badgeNumber,
        name: user.name,
        rank: user.rank,
        role: user.role,
        department: user.department,
        activeBrigade: user.activeBrigade,
        activeUnit: user.activeUnit || user.activeBrigade,
        isAdmin: user.role === 'ADMIN',
        permissions: activePerms
      };
    }

    return null;
  }

  public getAllUsers(): UserAccount[] {
    return Array.from(this.users.values()).map((u) => ({
      ...u,
      activeBrigade: u.activeBrigade || u.activeUnit,
      passwordHash: '••••••••', // Mask in API responses
    }));
  }

  public getUser(username: string): UserAccount | null {
    const clean = (username || '').trim().toLowerCase();
    const u = this.users.get(clean);
    if (!u) return null;
    return {
      ...u,
      activeBrigade: u.activeBrigade || u.activeUnit,
      passwordHash: '••••••••',
    };
  }

  public createUser(
    userData: {
      username: string;
      password?: string;
      badgeNumber: string;
      name: string;
      rank: string;
  email?: string;
      role: UserRole;
      department: string;
      activeBrigade?: string;
      activeUnit?: string;
    },
    adminContext: { userId: string; userName: string; userRole: UserRole }
  ): UserAccount {
    const cleanUser = userData.username.trim().toLowerCase();
    if (this.users.has(cleanUser)) {
      throw new Error(`Gebruikersnaam "${userData.username}" bestaat al.`);
    }

    const brigadeCode = (userData.activeBrigade || userData.activeUnit || 'BRIGADE-SCHIPHOL').trim();

    const newUser: UserAccount = {
      username: userData.username.trim(),
      passwordHash: userData.password || 'KMar2026!',
      badgeNumber: userData.badgeNumber.trim(),
      name: userData.name.trim(),
      rank: userData.rank.trim() || 'Wachtmeester',
      role: userData.role || 'PATROL_OFFICER',
      department: userData.department || 'Grensbewaking & Handhaving',
      activeBrigade: brigadeCode,
      activeUnit: brigadeCode,
      isActive: true,
    };

    this.users.set(cleanUser, newUser);

    this.logAudit({
      action: 'USER_CREATE',
      userId: adminContext.userId,
      userName: adminContext.userName,
      userRole: adminContext.userRole,
      justification: `Nieuw KMar profiel aangemaakt: ${newUser.name} (${newUser.badgeNumber}), Rang: ${newUser.rank}, Brigade: ${newUser.activeBrigade}`,
    });

    return { ...newUser, passwordHash: '••••••••' };
  }

  public updateUser(
    username: string,
    updateData: Partial<UserAccount>,
    adminContext: { userId: string; userName: string; userRole: UserRole }
  ): UserAccount {
    const clean = username.trim().toLowerCase();
    const existing = this.users.get(clean);
    if (!existing) {
      throw new Error(`Gebruiker ${username} niet gevonden.`);
    }

    const brigadeVal = updateData.activeBrigade || updateData.activeUnit || existing.activeBrigade || existing.activeUnit;

    const updated: UserAccount = {
      ...existing,
      name: updateData.name ? updateData.name.trim() : existing.name,
      badgeNumber: updateData.badgeNumber ? updateData.badgeNumber.trim() : existing.badgeNumber,
      rank: updateData.rank ? updateData.rank.trim() : existing.rank,
      role: updateData.role || existing.role,
      department: updateData.department ? updateData.department.trim() : existing.department,
      activeBrigade: brigadeVal,
      activeUnit: brigadeVal,
      isActive: updateData.isActive !== undefined ? updateData.isActive : existing.isActive,
      passwordHash: updateData.passwordHash && updateData.passwordHash !== '••••••••' ? updateData.passwordHash : existing.passwordHash,
    };

    this.users.set(clean, updated);

    this.logAudit({
      action: 'USER_UPDATE',
      userId: adminContext.userId,
      userName: adminContext.userName,
      userRole: adminContext.userRole,
      justification: `KMar profiel bijgewerkt: ${updated.name} (${updated.badgeNumber}), Rang: ${updated.rank}, Brigade: ${updated.activeBrigade}`,
    });

    return { ...updated, passwordHash: '••••••••' };
  }

  public deleteUser(
    username: string,
    adminContext: { userId: string; userName: string; userRole: UserRole }
  ): boolean {
    const clean = username.trim().toLowerCase();
    if (clean === 'alphactx') {
      throw new Error('Het hoofd-admin account (AlphaCTX) kan niet worden verwijderd.');
    }
    const existing = this.users.get(clean);
    if (!existing) return false;

    this.users.delete(clean);

    this.logAudit({
      action: 'USER_DELETE',
      userId: adminContext.userId,
      userName: adminContext.userName,
      userRole: adminContext.userRole,
      justification: `KMar profiel verwijderd: ${existing.name} (${existing.badgeNumber})`,
    });

    return true;
  }

  // ----------------------------------------------------------------------------
  // REFERENCE NUMBER GENERATOR (MUT-YYYYMMDD-XXXX)
  // ----------------------------------------------------------------------------
  public generateReferenceNumber(date: Date = new Date()): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    this.sequenceCounter += 1;
    const seq = String(this.sequenceCounter).padStart(4, '0');
    return `MUT-${yyyy}${mm}${dd}-${seq}`;
  }

  public generateEvidenceNumber(date: Date = new Date()): string {
    const yyyy = date.getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `EV-${yyyy}-${rand}`;
  }

  // ----------------------------------------------------------------------------
  // IMMUTABLE AUDIT TRAIL LOGGING
  // ----------------------------------------------------------------------------
  public logAudit(entry: {
    action: AuditAction;
    targetMutationId?: string;
    targetPersonId?: string;
    userId: string;
    userName: string;
    userRole: UserRole;
    ipAddress?: string;
    justification?: string;
    diffJson?: string;
    metadata?: string;
  }): AuditLogEntry {
    const log: AuditLogEntry = {
      id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action: entry.action,
      targetMutationId: entry.targetMutationId,
      targetPersonId: entry.targetPersonId,
      userId: entry.userId || 'ADM-01',
      userName: entry.userName || 'Systeembeheerder AlphaCTX',
      userRole: entry.userRole || 'ADMIN',
      ipAddress: entry.ipAddress || '127.0.0.1',
      justification: entry.justification,
      diffJson: entry.diffJson,
      metadata: entry.metadata,
      timestamp: new Date().toISOString(),
    };

    this.auditLogs.unshift(log); // newest first
    return log;
  }

  // ----------------------------------------------------------------------------
  // PERSON REGISTRY
  // ----------------------------------------------------------------------------
  public getOrCreatePerson(data: Partial<PersonEntity>): PersonEntity {
    if (data.id && this.persons.has(data.id)) {
      return this.persons.get(data.id)!;
    }
    if (data.bsnNumber) {
      for (const p of this.persons.values()) {
        if (p.bsnNumber && p.bsnNumber === data.bsnNumber) {
          return p;
        }
      }
    }

    const id = data.id || `PER-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const person: PersonEntity = {
      id,
      bsnNumber: data.bsnNumber || undefined,
      firstName: data.firstName || 'Onbekend',
      lastName: data.lastName || 'Persoon',
      alias: data.alias,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender || 'Onbekend',
      nationality: data.nationality || 'Nederlandse',
      address: data.address,
      phoneNumber: data.phoneNumber,
      cautionViolent: !!data.cautionViolent,
      cautionWeapon: !!data.cautionWeapon,
      cautionFlight: !!data.cautionFlight,
      cautionMental: !!data.cautionMental,
      cautionDrugs: !!data.cautionDrugs,
      cautionNotes: data.cautionNotes,
      photoUrl: data.photoUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.persons.set(id, person);
    return person;
  }

  public getAllPersons(): PersonEntity[] {
    return Array.from(this.persons.values());
  }

  // ----------------------------------------------------------------------------
  // VEHICLE REGISTRY
  // ----------------------------------------------------------------------------
  public getOrCreateVehicle(data: Partial<VehicleEntity>): VehicleEntity {
    const formattedPlate = (data.licensePlate || '').toUpperCase().trim();
    if (data.id && this.vehicles.has(data.id)) {
      return this.vehicles.get(data.id)!;
    }
    if (formattedPlate) {
      for (const v of this.vehicles.values()) {
        if (v.licensePlate === formattedPlate) {
          return v;
        }
      }
    }

    const id = data.id || `VEH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const vehicle: VehicleEntity = {
      id,
      licensePlate: formattedPlate || 'ONBEKEND',
      make: data.make || 'Onbekend',
      model: data.model || 'Onbekend',
      color: data.color || 'Onbekend',
      year: data.year,
      vin: data.vin,
      vehicleType: data.vehicleType || 'Personenauto',
      isStolen: !!data.isStolen,
      isWanted: !!data.isWanted,
      stolenReportRef: data.stolenReportRef,
      remarks: data.remarks,
      rdwVerified: !!data.rdwVerified,
      fuelType: data.fuelType,
      bodyStyle: data.bodyStyle,
      apkExpiryDate: data.apkExpiryDate,
      isInsured: data.isInsured,
      catalogPrice: data.catalogPrice,
      engineCapacity: data.engineCapacity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  public getAllVehicles(): VehicleEntity[] {
    return Array.from(this.vehicles.values());
  }

  // ----------------------------------------------------------------------------
  // LOCATION REGISTRY
  // ----------------------------------------------------------------------------
  public getOrCreateLocation(data: Partial<LocationEntity>): LocationEntity {
    const id = data.id || `LOC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const location: LocationEntity = {
      id,
      formalAddress: data.formalAddress || 'Adres onbekend',
      street: data.street || data.formalAddress?.split(',')[0] || 'Straat',
      houseNumber: data.houseNumber,
      city: data.city || 'Amsterdam',
      postalCode: data.postalCode || '1012 AB',
      areaDistrict: data.areaDistrict || 'Centrum',
      coordinatesLat: data.coordinatesLat,
      coordinatesLng: data.coordinatesLng,
      buildingDetails: data.buildingDetails,
      knownHotspot: !!data.knownHotspot,
    };
    this.locations.set(id, location);
    return location;
  }

  // ----------------------------------------------------------------------------
  // EVIDENCE REGISTRY
  // ----------------------------------------------------------------------------
  public createEvidence(data: Partial<EvidenceEntity>): EvidenceEntity {
    const id = data.id || `EV-ID-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const itemNumber = data.itemNumber || this.generateEvidenceNumber();
    const ev: EvidenceEntity = {
      id,
      itemNumber,
      category: data.category || 'OTHER_EVIDENCE',
      description: data.description || 'Inbeslaggenomen goed',
      serialNumber: data.serialNumber,
      brand: data.brand,
      estimatedValue: data.estimatedValue,
      seizureStatus: data.seizureStatus || 'SEIZED_CONFISCATED',
      storageLocker: data.storageLocker || 'Kluis Bureau',
      chainOfCustodyLogs: data.chainOfCustodyLogs || `Geregistreerd in beslag op ${new Date().toLocaleDateString('nl-NL')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.evidence.set(id, ev);
    return ev;
  }

  // ----------------------------------------------------------------------------
  // MUTATION CRUD
  // ----------------------------------------------------------------------------
  public createMutation(
    input: CreateMutationInput,
    userContext: { userId: string; userName: string; userRole: UserRole; ipAddress?: string }
  ): MutationRecord {
    const id = `MUT-ID-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const referenceNumber = this.generateReferenceNumber();
    const now = new Date().toISOString();

    // Map linked persons
    const persons: MutationPersonLink[] = (input.persons || []).map((pInput) => {
      const personEntity = this.getOrCreatePerson({
        ...pInput,
        id: pInput.id,
      });

      return {
        id: `MP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        mutationId: id,
        personId: personEntity.id,
        person: personEntity,
        role: pInput.role || 'PERSON_OF_INTEREST',
        statementSummary: pInput.statementSummary,
        isDetained: !!pInput.isDetained,
        cautionActive:
          !!pInput.cautionActive ||
          personEntity.cautionViolent ||
          personEntity.cautionWeapon ||
          personEntity.cautionFlight,
        createdAt: now,
      };
    });

    // Map linked vehicles
    const vehicles: MutationVehicleLink[] = (input.vehicles || []).map((vInput) => {
      const vehicleEntity = this.getOrCreateVehicle({
        ...vInput,
        id: vInput.id,
      });

      return {
        id: `MV-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        mutationId: id,
        vehicleId: vehicleEntity.id,
        vehicle: vehicleEntity,
        role: vInput.role || 'INVOLVED',
        damageNotes: vInput.damageNotes,
        isImpounded: !!vInput.isImpounded,
        driverPersonId: vInput.driverPersonId,
        createdAt: now,
      };
    });

    // Map locations
    const locations: MutationLocationLink[] = (input.locations || []).map((locInput, idx) => {
      const locationEntity = this.getOrCreateLocation(locInput);
      return {
        id: `ML-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        mutationId: id,
        locationId: locationEntity.id,
        location: locationEntity,
        isPrimary: locInput.isPrimary ?? idx === 0,
        locationNotes: locInput.locationNotes,
      };
    });

    // Map evidence
    const evidence: MutationEvidenceLink[] = (input.evidence || []).map((evInput) => {
      const evidenceEntity = this.createEvidence(evInput);
      return {
        id: `ME-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        mutationId: id,
        evidenceId: evidenceEntity.id,
        evidence: evidenceEntity,
        seizedByBadge: evInput.seizedByBadge || input.officerBadge,
        seizureLocation: evInput.seizureLocation || input.primaryAddress,
        notes: evInput.notes,
      };
    });

    // Map attachments
    const attachments: AttachmentItem[] = (input.attachments || []).map((att) => ({
      id: `ATT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      mutationId: id,
      fileName: att.fileName,
      fileType: att.fileType,
      fileSize: att.fileSize,
      url: att.url,
      caption: att.caption,
      uploadedByBadge: att.uploadedByBadge || input.officerBadge,
      createdAt: now,
    }));

    // Collect all service numbers for cross-indexing
    const assistingList: AssistingOfficer[] = input.assistingOfficers || [];
    const allServiceNumbers = Array.from(
      new Set([
        input.officerBadge.trim(),
        ...assistingList.map((a) => a.badgeNumber.trim()),
      ])
    ).filter(Boolean);

    const mutation: MutationRecord = {
      id,
      referenceNumber,
      timestamp: now,
      incidentDate: input.incidentDate || now,
      mutationType: input.mutationType || 'PV_BEVINDINGEN',
      category: input.category,
      status: input.status || 'FINAL',
      narrativeSummary: input.narrativeSummary,
      tacticalAction: input.tacticalAction,
      outcomeNotes: input.outcomeNotes,
      cautionGiven: !!input.cautionGiven,
      coercionUsed: !!input.coercionUsed,
      welfareNotified: !!input.welfareNotified,
      breathTestConducted: !!input.breathTestConducted,
      unitId: input.unitId,
      officerBadge: input.officerBadge,
      officerName: input.officerName,
      department: input.department || 'Noodhulp & Handhaving',
      district: input.district || 'Centrum',
      assistingOfficers: assistingList,
      serviceNumbers: allServiceNumbers,
      primaryAddress: input.primaryAddress,
      coordinatesLat: input.coordinatesLat,
      coordinatesLng: input.coordinatesLng,
      areaCode: input.areaCode || '020',
      streetName: input.streetName,
      houseNumber: input.houseNumber,
      city: input.city,
      isAmended: false,
      persons,
      vehicles,
      locations,
      evidence,
      attachments,
      auditLogs: [],
      createdAt: now,
      updatedAt: now,
    };

    this.mutations.set(id, mutation);

    // Write CREATE audit log
    this.logAudit({
      action: 'CREATE',
      targetMutationId: id,
      userId: userContext.userId,
      userName: userContext.userName,
      userRole: userContext.userRole,
      ipAddress: userContext.ipAddress,
      justification: `Nieuwe mutatie geregistreerd: ${referenceNumber} (${input.mutationType} - ${input.category}) door ${input.officerName} (${input.officerBadge})`,
      diffJson: JSON.stringify({
        referenceNumber,
        mutationType: input.mutationType,
        category: input.category,
        officerBadge: input.officerBadge,
        serviceNumbers: allServiceNumbers,
      }),
    });

    return mutation;
  }

  public getMutationById(
    id: string,
    userContext?: { userId: string; userName: string; userRole: UserRole; ipAddress?: string; logRead?: boolean }
  ): MutationRecord | null {
    const mutation = this.mutations.get(id);
    if (!mutation) return null;

    if (userContext && userContext.logRead) {
      this.logAudit({
        action: 'READ',
        targetMutationId: id,
        userId: userContext.userId,
        userName: userContext.userName,
        userRole: userContext.userRole,
        ipAddress: userContext.ipAddress,
        justification: `Dossier ingezien: ${mutation.referenceNumber}`,
      });
    }

    const relevantAudit = this.auditLogs.filter((a) => a.targetMutationId === id);
    return {
      ...mutation,
      auditLogs: relevantAudit,
    };
  }

  // ----------------------------------------------------------------------------
  // AMEND MUTATION
  // ----------------------------------------------------------------------------
  public amendMutation(
    id: string,
    amendmentReason: string,
    updatedData: Partial<CreateMutationInput>,
    userContext: { userId: string; userName: string; userRole: UserRole; ipAddress?: string }
  ): MutationRecord | null {
    const original = this.mutations.get(id);
    if (!original) return null;

    const now = new Date().toISOString();
    
    // Update assisting officers if supplied
    const updatedAssisting = updatedData.assistingOfficers ?? original.assistingOfficers ?? [];
    const allServiceNumbers = Array.from(
      new Set([
        (updatedData.officerBadge ?? original.officerBadge).trim(),
        ...updatedAssisting.map((a) => a.badgeNumber.trim()),
      ])
    ).filter(Boolean);

    const updated: MutationRecord = {
      ...original,
      mutationType: updatedData.mutationType ?? original.mutationType,
      category: updatedData.category ?? original.category,
      narrativeSummary: updatedData.narrativeSummary ?? original.narrativeSummary,
      tacticalAction: updatedData.tacticalAction ?? original.tacticalAction,
      outcomeNotes: updatedData.outcomeNotes ?? original.outcomeNotes,
      primaryAddress: updatedData.primaryAddress ?? original.primaryAddress,
      district: updatedData.district ?? original.district,
      assistingOfficers: updatedAssisting,
      serviceNumbers: allServiceNumbers,
      isAmended: true,
      status: 'AMENDED',
      amendmentReason: amendmentReason,
      updatedAt: now,
    };

    this.mutations.set(id, updated);

    this.logAudit({
      action: 'AMEND',
      targetMutationId: id,
      userId: userContext.userId,
      userName: userContext.userName,
      userRole: userContext.userRole,
      ipAddress: userContext.ipAddress,
      justification: `Ambtelijke wijziging / Aanvullend proces-verbaal: ${amendmentReason}`,
      diffJson: JSON.stringify({
        amendmentReason,
        mutationType: updated.mutationType,
      }),
    });

    return updated;
  }

  // ----------------------------------------------------------------------------
  // UPDATE STATUS
  // ----------------------------------------------------------------------------
  public updateStatus(
    id: string,
    newStatus: MutationRecord['status'],
    userContext: { userId: string; userName: string; userRole: UserRole; ipAddress?: string; reason?: string }
  ): MutationRecord | null {
    const record = this.mutations.get(id);
    if (!record) return null;

    const oldStatus = record.status;
    record.status = newStatus;
    record.updatedAt = new Date().toISOString();
    this.mutations.set(id, record);

    this.logAudit({
      action: 'STATUS_CHANGE',
      targetMutationId: id,
      userId: userContext.userId,
      userName: userContext.userName,
      userRole: userContext.userRole,
      ipAddress: userContext.ipAddress,
      justification: userContext.reason || `Status gewijzigd van ${oldStatus} naar ${newStatus}`,
      diffJson: JSON.stringify({ oldStatus, newStatus }),
    });

    return record;
  }

  // ----------------------------------------------------------------------------
  // MULTI-PARAMETER SEARCH
  // ----------------------------------------------------------------------------
  public searchMutations(params: SearchFilterParams): {
    items: MutationRecord[];
    total: number;
    page: number;
    limit: number;
  } {
    let list = Array.from(this.mutations.values());

    const q = (params.query || '').trim().toLowerCase();
    const plate = (params.licensePlate || '').trim().toUpperCase();
    const personName = (params.personName || '').trim().toLowerCase();
    const bsn = (params.bsn || '').trim();
    const serviceNum = (params.serviceNumber || '').trim().toLowerCase();
    const locSearch = (params.location || '').trim().toLowerCase();

    if (q) {
      list = list.filter((m) => {
        const textMatch =
          m.referenceNumber.toLowerCase().includes(q) ||
          m.narrativeSummary.toLowerCase().includes(q) ||
          m.primaryAddress.toLowerCase().includes(q) ||
          m.unitId.toLowerCase().includes(q) ||
          m.officerBadge.toLowerCase().includes(q) ||
          m.officerName.toLowerCase().includes(q) ||
          (m.serviceNumbers && m.serviceNumbers.some((s) => s.toLowerCase().includes(q)));

        const personMatch = m.persons.some((p) =>
          `${p.person.firstName} ${p.person.lastName} ${p.person.alias || ''} ${p.person.bsnNumber || ''}`
            .toLowerCase()
            .includes(q)
        );

        const vehicleMatch = m.vehicles.some((v) =>
          `${v.vehicle.licensePlate} ${v.vehicle.make} ${v.vehicle.model}`.toLowerCase().includes(q)
        );

        const evidenceMatch = m.evidence.some((e) =>
          `${e.evidence.description} ${e.evidence.serialNumber || ''} ${e.evidence.itemNumber}`
            .toLowerCase()
            .includes(q)
        );

        return textMatch || personMatch || vehicleMatch || evidenceMatch;
      });
    }

    // Mutatiesoort filter
    if (params.mutationType && params.mutationType !== 'ALL') {
      list = list.filter((m) => m.mutationType === params.mutationType);
    }

    // Dienstnummer / Service number search
    if (serviceNum) {
      list = list.filter((m) => {
        const primaryMatch = m.officerBadge.toLowerCase().includes(serviceNum);
        const assistingMatch =
          m.assistingOfficers?.some((a) =>
            a.badgeNumber.toLowerCase().includes(serviceNum) ||
            a.name.toLowerCase().includes(serviceNum)
          ) || false;
        const allNumsMatch =
          m.serviceNumbers?.some((s) => s.toLowerCase().includes(serviceNum)) || false;

        return primaryMatch || assistingMatch || allNumsMatch;
      });
    }

    // Location search (street, city, postcode, district)
    if (locSearch) {
      list = list.filter(
        (m) =>
          m.primaryAddress.toLowerCase().includes(locSearch) ||
          m.district.toLowerCase().includes(locSearch) ||
          (m.areaCode && m.areaCode.toLowerCase().includes(locSearch)) ||
          (m.city && m.city.toLowerCase().includes(locSearch)) ||
          (m.streetName && m.streetName.toLowerCase().includes(locSearch))
      );
    }

    if (plate) {
      list = list.filter((m) =>
        m.vehicles.some((v) =>
          v.vehicle.licensePlate
            .replace(/[^A-Z0-9]/g, '')
            .includes(plate.replace(/[^A-Z0-9]/g, ''))
        )
      );
    }

    if (personName) {
      list = list.filter((m) =>
        m.persons.some((p) =>
          `${p.person.firstName} ${p.person.lastName} ${p.person.alias || ''}`
            .toLowerCase()
            .includes(personName)
        )
      );
    }

    if (bsn) {
      list = list.filter((m) => m.persons.some((p) => p.person.bsnNumber === bsn));
    }

    if (params.category && params.category !== 'ALL') {
      list = list.filter((m) => m.category === params.category);
    }

    if (params.status && params.status !== 'ALL') {
      list = list.filter((m) => m.status === params.status);
    }

    if (params.district) {
      list = list.filter((m) =>
        m.district.toLowerCase().includes(params.district!.toLowerCase())
      );
    }

    if (params.unitId) {
      list = list.filter((m) =>
        m.unitId.toLowerCase().includes(params.unitId!.toLowerCase())
      );
    }

    // Date range filter
    if (params.startDate) {
      const start = new Date(params.startDate).getTime();
      if (!isNaN(start)) {
        list = list.filter((m) => new Date(m.incidentDate || m.timestamp).getTime() >= start);
      }
    }
    if (params.endDate) {
      const end = new Date(params.endDate).getTime();
      if (!isNaN(end)) {
        list = list.filter((m) => new Date(m.incidentDate || m.timestamp).getTime() <= end);
      }
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const page = params.page || 1;
    const limit = params.limit || 20;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      items: paginated,
      total: list.length,
      page,
      limit,
    };
  }

  // ----------------------------------------------------------------------------
  // OFFICER PROFILE MUTATIONS
  // ----------------------------------------------------------------------------
  public getMutationsByOfficer(badgeNumber: string): {
    mutations: MutationRecord[];
    stats: {
      total: number;
      drafts: number;
      final: number;
      amended: number;
      asPrimary: number;
      asAssisting: number;
    };
  } {
    const cleanBadge = (badgeNumber || '').trim().toLowerCase();
    const list = Array.from(this.mutations.values()).filter((m) => {
      const isPrimary = m.officerBadge.trim().toLowerCase() === cleanBadge;
      const isAssisting =
        m.assistingOfficers?.some((a) => a.badgeNumber.trim().toLowerCase() === cleanBadge) ||
        m.serviceNumbers?.some((s) => s.trim().toLowerCase() === cleanBadge) ||
        false;
      return isPrimary || isAssisting;
    });

    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const drafts = list.filter((m) => m.status === 'DRAFT').length;
    const final = list.filter((m) => m.status === 'FINAL').length;
    const amended = list.filter((m) => m.status === 'AMENDED').length;
    const asPrimary = list.filter((m) => m.officerBadge.trim().toLowerCase() === cleanBadge).length;
    const asAssisting = list.length - asPrimary;

    return {
      mutations: list,
      stats: {
        total: list.length,
        drafts,
        final,
        amended,
        asPrimary,
        asAssisting,
      },
    };
  }

  // ----------------------------------------------------------------------------
  // AUDIT LOGS
  // ----------------------------------------------------------------------------
  public getAuditLogs(filter?: {
    action?: AuditAction;
    mutationId?: string;
    userId?: string;
    limit?: number;
  }): AuditLogEntry[] {
    let list = [...this.auditLogs];
    if (filter?.action) {
      list = list.filter((a) => a.action === filter.action);
    }
    if (filter?.mutationId) {
      list = list.filter((a) => a.targetMutationId === filter.mutationId);
    }
    if (filter?.userId) {
      list = list.filter((a) => a.userId.toLowerCase().includes(filter.userId!.toLowerCase()));
    }
    return list.slice(0, filter?.limit || 100);
  }

  // ----------------------------------------------------------------------------
  // STATS
  // ----------------------------------------------------------------------------
  public getStats(userBadge?: string, userBrigade?: string): SystemStats {
    const list = Array.from(this.mutations.values());
    const today = new Date().toISOString().split('T')[0];

    const draftsCount = list.filter((m) => m.status === 'DRAFT').length;
    const finalCount = list.filter((m) => m.status === 'FINAL').length;
    const amendedCount = list.filter((m) => m.status === 'AMENDED').length;
    const todayCount = list.filter((m) => m.timestamp.startsWith(today)).length;
    const arrestsCount = list.filter((m) => m.mutationType === 'PV_AANHOUDING' || m.persons.some((p) => p.isDetained)).length;
    const reportsCount = list.filter((m) => m.mutationType === 'PV_AANGIFTE').length;

    const activePersonsWithCaution = Array.from(this.persons.values()).filter(
      (p) => p.cautionViolent || p.cautionWeapon || p.cautionFlight
    ).length;

    const stolenVehiclesTracked = Array.from(this.vehicles.values()).filter(
      (v) => v.isStolen || v.isWanted
    ).length;
    const seizedEvidenceCount = Array.from(this.evidence.values()).filter(
      (e) =>
        e.seizureStatus === 'SEIZED_CONFISCATED' ||
        e.seizureStatus === 'SECURED_CHAIN_OF_CUSTODY'
    ).length;


    let myMutationsCount = 0;
    let brigadeMutationsCount = 0;
    
    if (userBadge) {
      myMutationsCount = list.filter(m => m.authorBadge === userBadge).length;
    }
    if (userBrigade) {
      brigadeMutationsCount = list.filter(m => m.authorBrigade === userBrigade).length;
    }

    return {
      totalMutations: list.length,
      draftsCount,
      finalCount,
      amendedCount,
      todayCount,
      activePersonsWithCaution,
      stolenVehiclesTracked,
      seizedEvidenceCount,
      arrestsCount,
      reportsCount,
      myMutationsCount,
      brigadeMutationsCount
    };
  }

  // Clear all data (Clean empty reset)
  public clearAllData(): void {
    this.mutations.clear();
    this.persons.clear();
    this.vehicles.clear();
    this.locations.clear();
    this.evidence.clear();
    this.auditLogs = [];
  }

  // ----------------------------------------------------------------------------
}

export const db = new LawEnforcementDatabase();
