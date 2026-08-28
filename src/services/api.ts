// ==============================================================================
// CLIENT API SERVICE LAYER (MEOS MUTATIESYSTEEM)
// ==============================================================================

import {
  MutationRecord,
  PersonEntity,
  VehicleEntity,
  AuditLogEntry,
  SystemStats,
  SearchFilterParams,
  UserSession,
  RdwVehicleData,
  AddressLookupResult,
  UserRole,
} from '../types/index.js';
import { CreateMutationInput } from '../lib/validations/mutation.js';

const STORAGE_SESSION_KEY = 'meos_user_session';

export class ApiService {
  // Default logged in user (Admin: AlphaCTX)
  private static userSession: UserSession | null = ApiService.loadStoredSession();

  private static loadStoredSession(): UserSession | null {
    // For now, always require manual login instead of loading from localStorage.
    return null;
  }

  public static getUserSession(): UserSession | null {
    return this.userSession;
  }

  public static setUserSession(session: UserSession | null) {
    if (session) {
      this.userSession = session;
      try {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
      } catch (e) {}
    } else {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    }
  }

  private static getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-user-badge': this.userSession?.badgeNumber || 'ADM-01',
      'x-user-name': this.userSession?.name || 'Systeembeheerder AlphaCTX',
      'x-user-role': this.userSession?.role || 'ADMIN',
      ...extraHeaders,
    };
  }

  // ----------------------------------------------------------------------------
  // AUTHENTICATION
  // ----------------------------------------------------------------------------
  public static async login(username: string, password: string): Promise<UserSession> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Aanmelden mislukt');
    }

    this.setUserSession(json.data);
    return json.data;
  }

  public static logout(): void {
    this.setUserSession(null);
  }

  // ----------------------------------------------------------------------------
  // ADMIN USER MANAGEMENT
  // ----------------------------------------------------------------------------
  public static async getAdminUsers(): Promise<any[]> {
    const res = await fetch('/api/admin/users', {
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij ophalen gebruikers');
    return json.data;
  }

  public static async createAdminUser(userData: {
    username: string;
    password?: string;
    email?: string;
    badgeNumber: string;
    name: string;
    rank: string;
    role: UserRole;
    department: string;
    activeBrigade?: string;
    activeUnit?: string;
  }): Promise<any> {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij aanmaken gebruiker');
    return json.data;
  }

  public static async updateAdminUser(username: string, updateData: any): Promise<any> {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(username)}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updateData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij bijwerken gebruiker');
    return json.data;
  }

  public static async deleteAdminUser(username: string): Promise<void> {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(username)}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij verwijderen gebruiker');
  }

  // ----------------------------------------------------------------------------
  // BRIGADES MANAGEMENT (KONINKLIJKE MARECHAUSSEE)
  // ----------------------------------------------------------------------------
  public static async getBrigades(): Promise<any[]> {
    const res = await fetch('/api/brigades', {
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij ophalen brigades');
    return json.data;
  }

  public static async createBrigade(data: any): Promise<any> {
    const res = await fetch('/api/brigades', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij aanmaken brigade');
    return json.data;
  }

  public static async updateBrigade(code: string, data: any): Promise<any> {
    const res = await fetch(`/api/brigades/${encodeURIComponent(code)}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij bijwerken brigade');
    return json.data;
  }

  public static async deleteBrigade(code: string): Promise<void> {
    const res = await fetch(`/api/brigades/${encodeURIComponent(code)}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij verwijderen brigade');
  }

  // ----------------------------------------------------------------------------
  // PERMISSIONS MATRIX (RBAC)
  // ----------------------------------------------------------------------------
  public static async getPermissionsMatrix(): Promise<any> {
    const res = await fetch('/api/admin/permissions', {
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij ophalen autorisatiematrix');
    return json.data;
  }

  public 

  public static async saveRole(role: import('../types/index.js').RoleDefinition, originalId?: string): Promise<void> {
    const res = await fetch('/api/admin/roles', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ role, originalId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij opslaan profiel');
  }

  public static async deleteRole(roleId: string): Promise<void> {
    const res = await fetch(`/api/admin/roles/${roleId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij verwijderen profiel');
  }


  static async savePermissionsMatrix(matrix: any): Promise<any> {
    const res = await fetch('/api/admin/permissions', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ matrix }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij opslaan autorisatiematrix');
    return json.data;
  }

  public static async resetPermissionsMatrix(): Promise<any> {
    const res = await fetch('/api/admin/permissions/reset', {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij herstellen autorisatiematrix');
    return json.data;
  }
  // ----------------------------------------------------------------------------
  // RDW KENTEKEN LOOKUP (OPEN DATA RDW)
  // ----------------------------------------------------------------------------
  public static async lookupRdw(licensePlate: string): Promise<{
    found: boolean;
    data: RdwVehicleData | null;
    message?: string;
  }> {
    const cleanPlate = (licensePlate || '').replace(/[^a-zA-Z0-9]/g, '');
    if (!cleanPlate) {
      return { found: false, data: null, message: 'Geen kenteken opgegeven' };
    }

    const res = await fetch(`/api/rdw/lookup/${encodeURIComponent(cleanPlate)}`, {
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Fout bij raadplegen RDW database');
    }
    return json;
  }

  // ----------------------------------------------------------------------------
  // LOCATIE LOOKUP VIA POSTCODE + HUISNUMMER (PDOK)
  // ----------------------------------------------------------------------------
  public static async lookupLocation(
    postcode: string,
    huisnummer: string,
    toevoeging: string = ''
  ): Promise<{ found: boolean; data: AddressLookupResult }> {
    const cleanPostcode = (postcode || '').replace(/\s+/g, '').toUpperCase();
    const query = new URLSearchParams({
      postcode: cleanPostcode,
      huisnummer: (huisnummer || '').trim(),
    });
    if (toevoeging) query.set('toevoeging', toevoeging.trim());

    const res = await fetch(`/api/location/lookup?${query.toString()}`, {
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Fout bij opvragen adresgegevens');
    }
    return json;
  }

  // Suggesties voor adresbalk
  public static async suggestLocations(
    queryText: string
  ): Promise<{ suggestions: Array<{ id: string; weergavenaam: string; type: string }> }> {
    const res = await fetch(`/api/location/suggest?q=${encodeURIComponent(queryText)}`, {
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) return { suggestions: [] };
    return json;
  }

  // ----------------------------------------------------------------------------
  // OFFICER PROFILE & PERSONAL MUTATIONS
  // ----------------------------------------------------------------------------
  public static async getUserProfile(): Promise<any> {
    const res = await fetch('/api/user/profile', {
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij ophalen profiel');
    return json.data;
  }

  public static async updateUserProfile(data: {
    email?: string;
    name?: string;
    department?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<UserSession> {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij bijwerken profiel');
    
    // Update local session state
    if (json.data) {
      this.setUserSession(json.data);
    }
    return json.data;
  }

  public static async getOfficerMutations(badgeNumber: string): Promise<{
    mutations: MutationRecord[];
    stats: {
      total: number;
      drafts: number;
      final: number;
      amended: number;
      asPrimary: number;
      asAssisting: number;
    };
  }> {
    const res = await fetch(`/api/officer/${encodeURIComponent(badgeNumber)}/mutations`, {
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij ophalen mutaties verbalisant');
    return json;
  }

  // ----------------------------------------------------------------------------
  // MUTATIONS CRUD & SEARCH
  // ----------------------------------------------------------------------------
  public static async getStats(): Promise<SystemStats> {
    const res = await fetch('/api/stats', {
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij ophalen statistieken');
    return json.data;
  }

  public static async searchMutations(params: SearchFilterParams = {}): Promise<{
    items: MutationRecord[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = new URLSearchParams();
    if (params.query) query.set('query', params.query);
    if (params.mutationType && params.mutationType !== 'ALL') query.set('mutationType', params.mutationType);
    if (params.licensePlate) query.set('licensePlate', params.licensePlate);
    if (params.personName) query.set('personName', params.personName);
    if (params.bsn) query.set('bsn', params.bsn);
    if (params.serviceNumber) query.set('serviceNumber', params.serviceNumber);
    if (params.location) query.set('location', params.location);
    if (params.category && params.category !== 'ALL') query.set('category', params.category);
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.district) query.set('district', params.district);
    if (params.unitId) query.set('unitId', params.unitId);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const res = await fetch(`/api/mutations?${query.toString()}`, {
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij doorzoeken mutaties');
    return json.data ? { items: json.data, total: json.total || json.data.length, page: json.page || 1, limit: json.limit || 20 } : json;
  }

  public static async getMutation(id: string, logAudit = true): Promise<MutationRecord> {
    const res = await fetch(`/api/mutations/${id}?audit=${logAudit}`, {
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Mutatie niet gevonden');
    return json.data;
  }

  public static async createMutation(input: CreateMutationInput): Promise<MutationRecord> {
    const res = await fetch('/api/mutations', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok) {
      const err = new Error(json.error || 'Opslaan van mutatie mislukt');
      (err as any).details = json.details;
      (err as any).rawErrors = json.rawErrors;
      throw err;
    }
    return json.data;
  }

  public static async amendMutation(
    id: string,
    amendmentReason: string,
    updatedFields: Partial<CreateMutationInput>
  ): Promise<MutationRecord> {
    const payload = {
      amendmentReason,
      officerBadge: this.userSession.badgeNumber,
      officerName: this.userSession.name,
      updatedFields,
    };

    const res = await fetch(`/api/mutations/${id}/amend`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Wijzigen van mutatie mislukt');
    return json.data;
  }

  public static async updateStatus(
    id: string,
    status: MutationRecord['status'],
    reason?: string
  ): Promise<MutationRecord> {
    const res = await fetch(`/api/mutations/${id}/status`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, reason }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Status wijzigen mislukt');
    return json.data;
  }

  
  public static async emailDossier(id: string, pdfData: string, email?: string): Promise<any> {
    const res = await fetch(`/api/mutations/${id}/email`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ pdfData, email }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'E-mailen van dossier mislukt');
    return json;
  }

  public static async exportDossier(id: string, justification: string): Promise<any> {
    const res = await fetch(`/api/mutations/${id}/export`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ justification }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Exporteren van dossier mislukt');
    return json.data;
  }

  // ----------------------------------------------------------------------------
  // REGISTRIES & AUDIT
  // ----------------------------------------------------------------------------
  public static async getPersons(): Promise<PersonEntity[]> {
    const res = await fetch('/api/entities/persons', {
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij ophalen personen');
    return json.data;
  }

  public static async getVehicles(): Promise<VehicleEntity[]> {
    const res = await fetch('/api/entities/vehicles', {
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij ophalen voertuigen');
    return json.data;
  }

  public static async getAuditLogs(filter?: {
    action?: string;
    mutationId?: string;
    userId?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    const q = new URLSearchParams();
    if (filter?.action) q.set('action', filter.action);
    if (filter?.mutationId) q.set('mutationId', filter.mutationId);
    if (filter?.userId) q.set('userId', filter.userId);
    if (filter?.limit) q.set('limit', String(filter.limit));

    const res = await fetch(`/api/audit-logs?${q.toString()}`, {
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij ophalen auditlogs');
    return json.data;
  }

  public static async clearData(): Promise<void> {
    const res = await fetch('/api/data/clear', {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Wissen van data mislukt');
  }

  public static async getPrismaSchema(): Promise<string> {
    const res = await fetch('/api/schema/prisma', {
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij ophalen Prisma schema');
    return json.schema;
  }
}
