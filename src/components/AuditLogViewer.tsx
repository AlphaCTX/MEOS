import React, { useState, useEffect } from 'react';
import {
  History,
  Lock,
  Search,
  Filter,
  Shield,
  FileText,
  UserCheck,
  Printer,
  FileEdit,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import { AuditLogEntry, AuditAction } from '../types/index.js';
import { ApiService } from '../services/api.js';

interface AuditLogViewerProps {
  onSelectMutation: (id: string) => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ onSelectMutation }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getAuditLogs({
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
      });
      setLogs(data);
    } catch (err) {
      console.error('Fout bij ophalen auditlogs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.userId.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      (log.targetMutationId && log.targetMutationId.toLowerCase().includes(q)) ||
      (log.justification && log.justification.toLowerCase().includes(q))
    );
  });

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'CREATE':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      case 'AMEND':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'EXPORT':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800';
      case 'LOGIN':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'READ':
        return 'bg-zinc-800/80 text-zinc-300 border-zinc-700';
      case 'SEARCH':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
      case 'STATUS_CHANGE':
        return 'bg-purple-950/80 text-purple-300 border-purple-800';
      default:
        return 'bg-zinc-800/80 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-zinc-100 tracking-tight">
            Beveiligings- & Ambtelijk Auditlogboek (Wpg / Onwijzigbaar)
          </h2>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
          Conform de Wet politiegegevens (Wpg) en MEOS richtlijnen. Registreert onherroepelijk elke
          inzage, aanmaak, ambtelijke wijziging, zoekopdracht en dossier-export (PDF) uitgevoerd door
          beëdigde verbalisanten.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0c0c0e] border border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoek in auditlog op dienstnummer, naam verbalisant of toelichting..."
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-medium">Filter op actie:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none transition"
          >
            <option value="ALL">Alle Acties</option>
            <option value="LOGIN">LOGIN (Aanmelden)</option>
            <option value="CREATE">CREATE (Aanmaken)</option>
            <option value="AMEND">AMEND (Ambtelijk Wijzigen)</option>
            <option value="EXPORT">EXPORT (PDF / Uitdraai)</option>
            <option value="READ">READ (Inzien)</option>
            <option value="SEARCH">SEARCH (Zoeken)</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE (Statuswijziging)</option>
          </select>
        </div>
      </div>

      {/* Log list */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="text-center py-16 text-xs text-zinc-500">
            Auditlogs ophalen uit beveiligd register...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-16 text-xs text-zinc-500">
            Geen auditlog records gevonden.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-zinc-900/60 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getActionBadge(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                    <span className="font-bold text-zinc-200">{log.userName}</span>
                    <span className="font-mono text-zinc-400">({log.userId})</span>
                    <span className="text-[10px] text-zinc-500 font-mono">[{log.userRole}]</span>
                  </div>

                  <p className="text-zinc-300 font-sans text-xs">{log.justification || '-'}</p>

                  {log.targetMutationId && (
                    <div className="text-[11px] text-zinc-400">
                      Gekoppeld Mutatie ID:{' '}
                      <button
                        onClick={() => onSelectMutation(log.targetMutationId!)}
                        className="text-blue-400 hover:underline font-mono"
                      >
                        {log.targetMutationId}
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-zinc-500 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleString('nl-NL')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
