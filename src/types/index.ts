// ==============================================================================
// MEOS SYSTEM TYPES & INTERFACES (MEOS DIGITAAL MUTATIESYSTEEM)
// ==============================================================================

export type MutationStatus = 'DRAFT' | 'FINAL' | 'AMENDED' | 'ARCHIVED';

export type MutationType =
  | 'VRIJE_MUTATIE'
  | 'KLADMUTATIE'
  | 'INFORMATIERAPPORT'
  | 'PV_BEVINDINGEN'
  | 'PV_AANGIFTE'
  | 'PV_VERHOOR'
  | 'PV_AANHOUDING'
  | 'EIND_PV';

export type IncidentCategory =
  | 'WEAPONS_FIREARMS'
  | 'NARCOTICS_DRUGS'
  | 'TRAFFIC_VIOLATION_INCIDENT'
  | 'VIOLENT_CRIME_ASSAULT'
  | 'BURGLARY_THEFT'
  | 'PUBLIC_ORDER_DISTURBANCE'
  | 'SUSPICIOUS_PERSON_ACTIVITY'
  | 'DOMESTIC_INCIDENT'
  | 'FRAUD_FINANCIAL'
  | 'PROPERTY_DAMAGE_VANDALISM'
  | 'ENVIRONMENTAL_HAZARD'
  | 'OTHER_OBSERVATION';

export type PersonRole =
  | 'REPORTER'            // Melder
  | 'PERSON_OF_INTEREST'  // Betrokkene
  | 'SUSPECT'             // Verdachte
  | 'VICTIM'              // Slachtoffer
  | 'WITNESS'             // Getuige
  | 'DRIVER'              // Bestuurder
  | 'PASSENGER';          // Inzittende

export type VehicleRole =
  | 'TARGET_SUSPECT_VEHICLE'
  | 'INVOLVED'
  | 'STOLEN'
  | 'FLEEING_VEHICLE'
  | 'WITNESS_VEHICLE'
  | 'RECOVERED'
  | 'IMPOUNDED';

export type EvidenceCategory =
  | 'FIREARMS_WEAPONS'
  | 'NARCOTICS_CONTRABAND'
  | 'STOLEN_PROPERTY'
  | 'CASH_CURRENCY'
  | 'ELECTRONICS_DIGITAL'
  | 'DOCUMENTS_ID'
  | 'VEHICLE_PARTS'
  | 'OTHER_EVIDENCE';

export type SeizureStatus =
  | 'SEIZED_CONFISCATED'
  | 'SECURED_CHAIN_OF_CUSTODY'
  | 'RETURNED_TO_OWNER'
  | 'TRANSFERRED_TO_LAB'
  | 'DISPOSED_DESTROYED'
  | 'NOT_SEIZED_INSPECTED';

export type UserRole = string;

export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'AMEND'
  | 'STATUS_CHANGE'
  | 'EXPORT'
  | 'PRINT_DOSSIER'
  | 'SEARCH'
  | 'LOGIN'
  | 'DATABASE_CLEAR'
  | 'SYSTEM_SETTINGS_UPDATE'
  | 'SYSTEM_LOGIN'
  | 'USER_UPDATE_PROFILE'
  | 'LOGOUT'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'USER_DELETE'
  | 'BRIGADE_CREATE'
  | 'BRIGADE_UPDATE'
  | 'BRIGADE_DELETE'
  | 'PERMISSIONS_UPDATE'
  | 'DATABASE_CLEAR'
  | 'DELETE_ATTEMPT_DENIED';

// ------------------------------------------------------------------------------
// Koninklijke Marechaussee (KMar) Rangen
// ------------------------------------------------------------------------------
export const KMAR_RANKS = [
  // Manschappen
  'Marechaussee der 4e klasse',
  'Marechaussee der 3e klasse',
  'Marechaussee der 2e klasse',
  'Marechaussee der 1e klasse',
  // Onderofficieren
  'Wachtmeester',
  'Wachtmeester der 1e klasse',
  'Opperwachtmeester',
  'Adjudant-onderofficier',
  // Subalterne officieren
  'Tweede Luitenant',
  'Eerste Luitenant',
  'Kapitein',
  // Hoofdofficieren
  'Majoor',
  'Luitenant-kolonel',
  'Kolonel',
  // Opper- en vlagofficieren
  'Brigadegeneraal',
  'Generaal-majoor',
  'Luitenant-generaal',
] as const;

export type KMarRank = typeof KMAR_RANKS[number] | string;

// ------------------------------------------------------------------------------
// Brigade Entity (Koninklijke Marechaussee Standplaatsen & Brigades)
// ------------------------------------------------------------------------------
export interface BrigadeEntity {
  code: string;           // Unieke code, bijv. "BRIGADE-SCHIPHOL"
  name: string;           // Volledige naam, bijv. "Brigade Politie & Beveiliging Schiphol"
  region: string;         // Standplaats / Regio, bijv. "Luchthaven Schiphol & Grenstoezicht"
  taskType: string;       // Hoofdtaak, bijv. "Grensbewaking & Handhaving"
  stationLocation: string;// Locatie kazerne, bijv. "Schiphol-Centrum"
  commanderBadge?: string;// Commandant dienstnummer/naam
  isActive: boolean;      // Status
  description?: string;   // Toelichting
  officerCount?: number;  // Aantal geregistreerde verbalisanten
}

// ------------------------------------------------------------------------------
// Rechten & Autorisatiematrix (RBAC)
// ------------------------------------------------------------------------------
export interface PermissionDefinition {
  key: string;
  label: string;
  description: string;
  category: 'MUTATIES' | 'DOSSIERS' | 'ENTITEITEN' | 'ADMIN_BEHEER';
}

export type RolePermissionMatrix = Record<string, Record<string, boolean>>;

// ------------------------------------------------------------------------------
// Assisting Officers (Meerdere Dienstnummers & Brigades)
// ------------------------------------------------------------------------------

export interface AssistingOfficer {
  badgeNumber: string;
  name: string;
  rank?: string;
  brigade?: string;
  unitId?: string; // alias
  role?: string; // e.g. "Tweede verbalisant", "Bijstand", "Chauffeur", "Ondersteuning"
}

// ------------------------------------------------------------------------------
// Core Models
// ------------------------------------------------------------------------------

export interface CautionFlags {
  violent: boolean;
  weapon: boolean;
  flight: boolean;
  mental: boolean;
  drugs: boolean;
  notes?: string;
}

export interface PersonEntity {
  id: string;
  bsnNumber?: string;
  firstName: string;
  lastName: string;
  alias?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  gender?: string;
  nationality?: string;
  address?: string;
  phoneNumber?: string;
  cautionViolent: boolean;
  cautionWeapon: boolean;
  cautionFlight: boolean;
  cautionMental: boolean;
  cautionDrugs: boolean;
  cautionNotes?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MutationPersonLink {
  id: string;
  mutationId: string;
  personId: string;
  person: PersonEntity;
  role: PersonRole;
  statementSummary?: string;
  isDetained: boolean;
  cautionActive: boolean;
  createdAt: string;
}

export interface VehicleEntity {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  color: string;
  year?: number;
  vin?: string;
  vehicleType?: string;
  isStolen: boolean;
  isWanted: boolean;
  stolenReportRef?: string;
  remarks?: string;
  
  // RDW Gegevens
  rdwVerified?: boolean;
  fuelType?: string;
  bodyStyle?: string; // inrichting
  apkExpiryDate?: string;
  isInsured?: boolean;
  catalogPrice?: number;
  engineCapacity?: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface MutationVehicleLink {
  id: string;
  mutationId: string;
  vehicleId: string;
  vehicle: VehicleEntity;
  role: VehicleRole;
  damageNotes?: string;
  isImpounded: boolean;
  driverPersonId?: string;
  createdAt: string;
}

export interface LocationEntity {
  id: string;
  formalAddress: string;
  street: string;
  houseNumber?: string;
  city: string;
  postalCode: string;
  areaDistrict: string;
  coordinatesLat?: number;
  coordinatesLng?: number;
  buildingDetails?: string;
  knownHotspot?: boolean;
}

export interface MutationLocationLink {
  id: string;
  mutationId: string;
  locationId: string;
  location: LocationEntity;
  isPrimary: boolean;
  locationNotes?: string;
}

export interface EvidenceEntity {
  id: string;
  itemNumber: string;
  category: EvidenceCategory;
  description: string;
  serialNumber?: string;
  brand?: string;
  estimatedValue?: number;
  seizureStatus: SeizureStatus;
  storageLocker?: string;
  chainOfCustodyLogs?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MutationEvidenceLink {
  id: string;
  mutationId: string;
  evidenceId: string;
  evidence: EvidenceEntity;
  seizedByBadge: string;
  seizureLocation?: string;
  notes?: string;
}

export interface AttachmentItem {
  id: string;
  mutationId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  caption?: string;
  uploadedByBadge: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  targetMutationId?: string;
  targetPersonId?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  ipAddress: string;
  userAgent?: string;
  justification?: string;
  diffJson?: string;
  metadata?: string;
  timestamp: string;
}

export interface MutationRecord {
  id: string;
  referenceNumber: string; // MUT-YYYYMMDD-XXXX
  timestamp: string;
  incidentDate: string;
  mutationType: MutationType;
  category: IncidentCategory;
  status: MutationStatus;
  narrativeSummary: string;
  tacticalAction?: string;
  outcomeNotes?: string;
  
  // Specific structured data for mutation types
  cautionGiven?: boolean;        // Cautie medegedeeld (bij aanhouding/verhoor)
  coercionUsed?: boolean;        // Dwangmiddelen/Geweld toegepast
  welfareNotified?: boolean;     // Zorginstantie (Veilig Thuis/Crisisdienst) geïnformeerd
  breathTestConducted?: boolean; // Blaastest / Speekseltest afgenomen
  
  // Primary Officer & Brigade
  brigade?: string;
  unitId: string; // alias
  officerBadge: string;
  officerName: string;
  department: string;
  email?: string;
  district: string;
  
  // Multiple Service Numbers (Gekoppelde Dienstnummers / Assisterende Verbalisanten)
  assistingOfficers?: AssistingOfficer[];
  serviceNumbers?: string[]; // All service numbers for quick querying

  // Primary Location
  primaryAddress: string;
  coordinatesLat?: number;
  coordinatesLng?: number;
  areaCode: string;
  streetName?: string;
  houseNumber?: string;
  city?: string;
  
  isAmended: boolean;
  supersededById?: string;
  amendmentReason?: string;
  
  // Relational aggregates
  persons: MutationPersonLink[];
  vehicles: MutationVehicleLink[];
  locations: MutationLocationLink[];
  evidence: MutationEvidenceLink[];
  attachments: AttachmentItem[];
  auditLogs: AuditLogEntry[];

  createdAt: string;
  updatedAt: string;
}

export interface UserAccountData {
  username: string;
  badgeNumber: string;
  name: string;
  rank: string;
  role: UserRole;
  department: string;
  email?: string;
  activeBrigade?: string;
  activeUnit: string;
  password?: string;
  isActive?: boolean;
}

export interface UserSession {
  username?: string;
  badgeNumber: string;
  name: string;
  rank: string;
  role: UserRole;
  department: string;
  email?: string;
  activeBrigade?: string;
  activeUnit: string;
  isAdmin?: boolean;
  permissions?: string[];
}

export interface SearchFilterParams {
  query?: string;
  mutationType?: MutationType | 'ALL';
  category?: IncidentCategory | 'ALL';
  status?: MutationStatus | 'ALL';
  licensePlate?: string;
  personName?: string;
  bsn?: string;
  district?: string;
  location?: string;
  brigade?: string;
  unitId?: string;
  serviceNumber?: string; // Search by service number / badge
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface SystemStats {
  totalMutations: number;
  draftsCount: number;
  finalCount: number;
  amendedCount: number;
  todayCount: number;
  activePersonsWithCaution: number;
  stolenVehiclesTracked: number;
  seizedEvidenceCount: number;
  arrestsCount: number;
  reportsCount: number;
  myMutationsCount?: number;
  brigadeMutationsCount?: number;
}

export interface RdwVehicleData {
  kenteken: string;
  merk: string;
  handelsbenaming: string;
  eersteKleur: string;
  tweedeKleur?: string;
  bouwjaar?: number;
  voertuigsoort: string;
  inrichting?: string;
  vervaldatumApk?: string;
  brandstofOmschrijving?: string;
  wamVerzekerd?: string;
  catalogusprijs?: number;
  aantalZitplaatsen?: number;
  cilinderinhoud?: number;
  massaLeegVoertuig?: number;
}

export interface AddressLookupResult {
  volledigAdres: string;
  weergavenaam: string;
  straatnaam: string;
  huisnummer: string;
  huisletter?: string;
  postcode: string;
  woonplaatsnaam: string;
  gemeentenaam: string;
  lat?: number;
  lng?: number;
}

export interface RoleDefinition {
  id: string;
  title: string;
  desc: string;
  badgeColor: string;
}
