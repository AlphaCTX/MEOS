// ==============================================================================
// ZOD VALIDATION SCHEMAS FOR MUTATIONS & RELATIONAL ENTITIES (MEOS)
// ==============================================================================

import { z } from 'zod';

// ------------------------------------------------------------------------------
// Enums Validation
// ------------------------------------------------------------------------------

export const MutationStatusSchema = z.enum(['DRAFT', 'FINAL', 'AMENDED', 'ARCHIVED']);

export const MutationTypeSchema = z.enum([
  'VRIJE_MUTATIE',
  'KLADMUTATIE',
  'INFORMATIERAPPORT',
  'PV_BEVINDINGEN',
  'PV_AANGIFTE',
  'PV_VERHOOR',
  'PV_AANHOUDING',
  'EIND_PV',
]);

export const IncidentCategorySchema = z.enum([
  'NARCOTICS_DRUGS',
  'PUBLIC_ORDER_DISTURBANCE',
  'TRAFFIC_VIOLATION_INCIDENT',
  'VIOLENT_CRIME_ASSAULT',
  'BURGLARY_THEFT',
  'WEAPONS_FIREARMS',
  'SUSPICIOUS_PERSON_ACTIVITY',
  'DOMESTIC_INCIDENT',
  'FRAUD_FINANCIAL',
  'PROPERTY_DAMAGE_VANDALISM',
  'ENVIRONMENTAL_HAZARD',
  'OTHER_OBSERVATION',
]);

export const PersonRoleSchema = z.enum([
  'REPORTER',            // Melder
  'PERSON_OF_INTEREST',  // Betrokkene
  'SUSPECT',             // Verdachte
  'VICTIM',              // Slachtoffer
  'WITNESS',             // Getuige
  'DRIVER',              // Bestuurder
  'PASSENGER',           // Inzittende
]);

export const VehicleRoleSchema = z.enum([
  'TARGET_SUSPECT_VEHICLE',
  'INVOLVED',
  'STOLEN',
  'FLEEING_VEHICLE',
  'WITNESS_VEHICLE',
  'RECOVERED',
  'IMPOUNDED',
]);

export const AssistingOfficerSchema = z.object({
  badgeNumber: z.string().min(1, 'Dienstnummer is verplicht'),
  name: z.string().min(1, 'Naam is verplicht'),
  rank: z.string().optional(),
  brigade: z.string().optional(),
  unitId: z.string().optional(),
  role: z.string().default('Tweede verbalisant'),
});

export const EvidenceCategorySchema = z.enum([
  'FIREARMS_WEAPONS',
  'NARCOTICS_CONTRABAND',
  'STOLEN_PROPERTY',
  'CASH_CURRENCY',
  'ELECTRONICS_DIGITAL',
  'DOCUMENTS_ID',
  'VEHICLE_PARTS',
  'OTHER_EVIDENCE',
]);

export const SeizureStatusSchema = z.enum([
  'SEIZED_CONFISCATED',
  'SECURED_CHAIN_OF_CUSTODY',
  'RETURNED_TO_OWNER',
  'TRANSFERRED_TO_LAB',
  'DISPOSED_DESTROYED',
  'NOT_SEIZED_INSPECTED',
]);

export const UserRoleSchema = z.string();

export const AuditActionSchema = z.enum([
  'CREATE',
  'READ',
  'UPDATE',
  'AMEND',
  'STATUS_CHANGE',
  'EXPORT',
  'PRINT_DOSSIER',
  'SEARCH',
  'LOGIN',
  'LOGOUT',
  'USER_CREATE',
  'USER_UPDATE',
  'USER_DELETE',
  'DATABASE_CLEAR',
  'DELETE_ATTEMPT_DENIED',
]);

// ------------------------------------------------------------------------------
// Entity Sub-Schemas
// ------------------------------------------------------------------------------

export const PersonInputSchema = z.object({
  id: z.string().optional(),
  bsnNumber: z
    .string()
    .regex(/^[0-9]{8,9}$/, 'BSN moet 8 of 9 cijfers bevatten')
    .optional()
    .or(z.literal('')),
  firstName: z.string().min(1, 'Voornaam is verplicht').max(60),
  lastName: z.string().min(1, 'Achternaam is verplicht').max(60),
  alias: z.string().max(60).optional(),
  dateOfBirth: z.string().optional(), // YYYY-MM-DD
  gender: z.string().max(20).optional(),
  nationality: z.string().max(30).default('Nederlandse'),
  address: z.string().max(120).optional(),
  phoneNumber: z.string().max(30).optional(),
  
  // Caution Flags
  cautionViolent: z.boolean().default(false),
  cautionWeapon: z.boolean().default(false),
  cautionFlight: z.boolean().default(false),
  cautionMental: z.boolean().default(false),
  cautionDrugs: z.boolean().default(false),
  cautionNotes: z.string().max(500).optional(),

  // Context in this mutation
  role: PersonRoleSchema.default('PERSON_OF_INTEREST'),
  statementSummary: z.string().max(2000).optional(),
  isDetained: z.boolean().default(false),
  cautionActive: z.boolean().default(false),
});

export const VehicleInputSchema = z.object({
  id: z.string().optional(),
  licensePlate: z
    .string()
    .min(2, 'Kenteken is verplicht')
    .max(16)
    .transform((val) => val.toUpperCase().trim()),
  make: z.string().min(1, 'Merk is verplicht').max(50),
  model: z.string().min(1, 'Model is verplicht').max(50),
  color: z.string().min(1, 'Kleur is verplicht').max(30),
  year: z.number().int().min(1950).max(2030).optional(),
  vin: z.string().max(30).optional(),
  vehicleType: z.string().max(40).default('Personenauto'),
  isStolen: z.boolean().default(false),
  isWanted: z.boolean().default(false),
  stolenReportRef: z.string().max(40).optional(),
  remarks: z.string().max(500).optional(),

  // RDW info
  rdwVerified: z.boolean().optional(),
  fuelType: z.string().optional(),
  bodyStyle: z.string().optional(),
  apkExpiryDate: z.string().optional(),
  isInsured: z.boolean().optional(),

  // Context in this mutation
  role: VehicleRoleSchema.default('INVOLVED'),
  damageNotes: z.string().max(500).optional(),
  isImpounded: z.boolean().default(false),
  driverPersonId: z.string().optional(),
});

export const LocationInputSchema = z.object({
  id: z.string().optional(),
  formalAddress: z.string().min(3, 'Adres is verplicht').max(150),
  street: z.string().min(1, 'Straatnaam is verplicht').max(80),
  houseNumber: z.string().max(20).optional(),
  city: z.string().min(1, 'Plaatsnaam is verplicht').max(60).default('Amsterdam'),
  postalCode: z.string().min(2, 'Postcode is verplicht').max(12),
  areaDistrict: z.string().min(1, 'District is verplicht').max(60).default('Centrum'),
  coordinatesLat: z.number().min(-90).max(90).optional(),
  coordinatesLng: z.number().min(-180).max(180).optional(),
  buildingDetails: z.string().max(200).optional(),
  knownHotspot: z.boolean().default(false),

  // Context
  isPrimary: z.boolean().default(true),
  locationNotes: z.string().max(500).optional(),
});

export const EvidenceInputSchema = z.object({
  id: z.string().optional(),
  itemNumber: z.string().optional(),
  category: EvidenceCategorySchema.default('OTHER_EVIDENCE'),
  description: z.string().min(2, 'Omschrijving is verplicht').max(200),
  serialNumber: z.string().max(60).optional(),
  brand: z.string().max(60).optional(),
  estimatedValue: z.number().min(0).optional(),
  seizureStatus: SeizureStatusSchema.default('SEIZED_CONFISCATED'),
  storageLocker: z.string().max(60).optional(),
  chainOfCustodyLogs: z.string().max(1000).optional(),

  // Context
  seizedByBadge: z.string().optional(),
  seizureLocation: z.string().max(120).optional(),
  notes: z.string().max(500).optional(),
});

export const AttachmentInputSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().int().positive(),
  url: z.string(),
  caption: z.string().max(200).optional(),
  uploadedByBadge: z.string(),
});

// ------------------------------------------------------------------------------
// Core Mutation Creation & Update Schemas (No Title, No Priority)
// ------------------------------------------------------------------------------

export const CreateMutationSchema = z.object({
  // Mutation Type & Category
  mutationType: MutationTypeSchema.default('VRIJE_MUTATIE'),
  category: IncidentCategorySchema,
  status: MutationStatusSchema.default('FINAL'),
  incidentDate: z.string().default(() => new Date().toISOString()),

  // Narrative (Tactical Free-text & structured notes)
  narrativeSummary: z
    .string()
    .min(10, 'Waarnemingen / toedracht moet minimaal 10 karakters bevatten')
    .max(10000, 'Narratief overschrijdt de maximale lengte'),
  tacticalAction: z.string().max(2000).optional(),
  outcomeNotes: z.string().max(2000).optional(),

  // Specific operational indicators
  cautionGiven: z.boolean().default(false),
  coercionUsed: z.boolean().default(false),
  welfareNotified: z.boolean().default(false),
  breathTestConducted: z.boolean().default(false),

  // Officer & Unit
  unitId: z.string().min(2, 'Eenheid / Roepnummer is verplicht').max(30),
  officerBadge: z.string().min(2, 'Dienstnummer is verplicht').max(20),
  officerName: z.string().min(2, 'Naam verbalisant is verplicht').max(60),
  department: z.string().max(60).default('Handhaving & Noodhulp'),
  district: z.string().max(60).default('Centrum'),
  
  // Gekoppelde Dienstnummers / Assisterende collega's
  assistingOfficers: z.array(AssistingOfficerSchema).default([]),

  // Location
  primaryAddress: z.string().min(3, 'Volledig adres is verplicht').max(150),
  coordinatesLat: z.number().optional(),
  coordinatesLng: z.number().optional(),
  areaCode: z.string().max(20).default('020'),
  streetName: z.string().optional(),
  houseNumber: z.string().optional(),
  city: z.string().optional(),

  // Relational Entities
  persons: z.array(PersonInputSchema).default([]),
  vehicles: z.array(VehicleInputSchema).default([]),
  locations: z.array(LocationInputSchema).default([]),
  evidence: z.array(EvidenceInputSchema).default([]),
  attachments: z.array(AttachmentInputSchema).default([]),
});

export const UpdateMutationSchema = CreateMutationSchema.partial().extend({
  amendmentReason: z
    .string()
    .min(10, 'Een ambtelijke reden is verplicht om een mutatie te wijzigen')
    .optional(),
  status: MutationStatusSchema.optional(),
});

export const AmendMutationSchema = z.object({
  amendmentReason: z
    .string()
    .min(10, 'Een ambtelijke motivering van minimaal 10 karakters is verplicht'),
  officerBadge: z.string().min(2),
  officerName: z.string().min(2),
  updatedFields: CreateMutationSchema.partial(),
});

// ------------------------------------------------------------------------------
// Search & Query Schemas
// ------------------------------------------------------------------------------

export const SearchQuerySchema = z.object({
  query: z.string().optional(),
  mutationType: z.union([MutationTypeSchema, z.literal('ALL')]).optional(),
  category: z.union([IncidentCategorySchema, z.literal('ALL')]).optional(),
  status: z.union([MutationStatusSchema, z.literal('ALL')]).optional(),
  licensePlate: z.string().optional(),
  personName: z.string().optional(),
  bsn: z.string().optional(),
  district: z.string().optional(),
  location: z.string().optional(),
  unitId: z.string().optional(),
  serviceNumber: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateMutationInput = z.infer<typeof CreateMutationSchema>;
export type UpdateMutationInput = z.infer<typeof UpdateMutationSchema>;
export type PersonInput = z.infer<typeof PersonInputSchema>;
export type VehicleInput = z.infer<typeof VehicleInputSchema>;
export type LocationInput = z.infer<typeof LocationInputSchema>;
export type EvidenceInput = z.infer<typeof EvidenceInputSchema>;
export type SearchQueryInput = z.infer<typeof SearchQuerySchema>;
