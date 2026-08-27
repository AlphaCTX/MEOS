import React, { useState, useEffect } from 'react';
import {
  Code2,
  Database,
  ShieldCheck,
  Server,
  Copy,
  Check,
  Layers,
  FileCode,
  Lock,
} from 'lucide-react';
import { ApiService } from '../services/api.js';

export const SchemaViewer: React.FC = () => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [prismaSchema, setPrismaSchema] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const schema = await ApiService.getPrismaSchema();
        setPrismaSchema(schema);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSchema();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Deliverables Header */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 shadow-md space-y-2">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white tracking-tight">
            Production Architecture & Deliverables Specification
          </h2>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Inspect the complete backend database models, Zod validation contracts, RESTful server endpoints, and RBAC matrix.
        </p>

        {/* Deliverables Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3">
          <button
            onClick={() => setActiveStep(1)}
            className={`p-2.5 rounded-lg text-xs font-semibold text-left border transition flex items-center gap-2 ${
              activeStep === 1
                ? 'bg-indigo-950/80 border-indigo-600 text-indigo-200 shadow'
                : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <span className="block text-[10px] text-zinc-500 font-mono">STEP 1</span>
              <span>Prisma Schema</span>
            </div>
          </button>

          <button
            onClick={() => setActiveStep(2)}
            className={`p-2.5 rounded-lg text-xs font-semibold text-left border transition flex items-center gap-2 ${
              activeStep === 2
                ? 'bg-indigo-950/80 border-indigo-600 text-indigo-200 shadow'
                : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
            }`}
          >
            <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="block text-[10px] text-zinc-500 font-mono">STEP 2</span>
              <span>Zod Schemas</span>
            </div>
          </button>

          <button
            onClick={() => setActiveStep(3)}
            className={`p-2.5 rounded-lg text-xs font-semibold text-left border transition flex items-center gap-2 ${
              activeStep === 3
                ? 'bg-indigo-950/80 border-indigo-600 text-indigo-200 shadow'
                : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
            }`}
          >
            <Server className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="block text-[10px] text-zinc-500 font-mono">STEP 3</span>
              <span>API & Actions</span>
            </div>
          </button>

          <button
            onClick={() => setActiveStep(4)}
            className={`p-2.5 rounded-lg text-xs font-semibold text-left border transition flex items-center gap-2 ${
              activeStep === 4
                ? 'bg-indigo-950/80 border-indigo-600 text-indigo-200 shadow'
                : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="block text-[10px] text-zinc-500 font-mono">STEP 4</span>
              <span>RBAC Matrix</span>
            </div>
          </button>
        </div>
      </div>

      {/* STEP 1: PRISMA SCHEMA */}
      {activeStep === 1 && (
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Prisma Schema Definition (schema.prisma)</span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                MariaDB (MySQL) Relational Schema with strict join tables, indexing, and append-only audit log.
              </p>
            </div>

            <button
              onClick={() => handleCopy(prismaSchema)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold border border-zinc-700 transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Schema'}</span>
            </button>
          </div>

          <pre className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] sm:text-xs text-indigo-300 font-mono overflow-x-auto leading-relaxed max-h-[500px]">
            {prismaSchema || '// Loading prisma/schema.prisma...'}
          </pre>
        </div>
      )}

      {/* STEP 2: ZOD VALIDATION */}
      {activeStep === 2 && (
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>Zod Validation Schemas (src/lib/validations/mutation.ts)</span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Type-safe input contracts for field mutations, multi-entity linking, and search parameters.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
              <span className="text-emerald-400 font-bold block">CreateMutationSchema</span>
              <ul className="text-zinc-300 space-y-1 text-[11px]">
                <li>• title: string (min 5, max 120)</li>
                <li>• category: IncidentCategory enum</li>
                <li>• priority: PriorityLevel (P1_CRITICAL..P4_INFO)</li>
                <li>• narrativeSummary: string (min 15, max 10000)</li>
                <li>• unitId & officerBadge: string required</li>
                <li>• primaryAddress & areaCode: string required</li>
                <li>• persons: array(PersonInputSchema)</li>
                <li>• vehicles: array(VehicleInputSchema)</li>
                <li>• evidence: array(EvidenceInputSchema)</li>
              </ul>
            </div>

            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
              <span className="text-purple-400 font-bold block">AmendMutationSchema & RBAC</span>
              <ul className="text-zinc-300 space-y-1 text-[11px]">
                <li>• amendmentReason: string (min 10 required)</li>
                <li>• officerBadge & officerName: sworn signature</li>
                <li>• updatedFields: Partial(CreateMutationSchema)</li>
                <li>• Prevents silent in-place overwrite</li>
                <li>• Generates immutable AMEND audit log</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: API ROUTES */}
      {activeStep === 3 && (
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 space-y-4 shadow-lg">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-400" />
              <span>Server Endpoints & Mutation Service Actions</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              RESTful APIs with automatic audit logging middleware and Zod schema parsing.
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 bg-indigo-950/80 text-indigo-300 font-bold rounded mr-2">GET</span>
                <span className="text-zinc-200">/api/mutations</span>
              </div>
              <span className="text-zinc-400 text-[11px] font-sans">
                Multi-parameter search (plate, person, BSN, keyword, date range)
              </span>
            </div>

            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 font-bold rounded mr-2">
                  POST
                </span>
                <span className="text-zinc-200">/api/mutations</span>
              </div>
              <span className="text-zinc-400 text-[11px] font-sans">
                Zod-validated mutation creation with entity linking + CREATE audit log
              </span>
            </div>

            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 bg-indigo-950/80 text-indigo-300 font-bold rounded mr-2">GET</span>
                <span className="text-zinc-200">/api/mutations/:id</span>
              </div>
              <span className="text-zinc-400 text-[11px] font-sans">
                Fetches full relational dossier + logs READ access in audit ledger
              </span>
            </div>

            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 bg-purple-950/80 text-purple-300 font-bold rounded mr-2">
                  POST
                </span>
                <span className="text-zinc-200">/api/mutations/:id/amend</span>
              </div>
              <span className="text-zinc-400 text-[11px] font-sans">
                Amends mutation with mandatory reason & provenance trail
              </span>
            </div>

            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 bg-amber-950/80 text-amber-300 font-bold rounded mr-2">
                  POST
                </span>
                <span className="text-zinc-200">/api/mutations/:id/export</span>
              </div>
              <span className="text-zinc-400 text-[11px] font-sans">
                Exports confidential PV dossier with required authorization reason
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: RBAC MATRIX */}
      {activeStep === 4 && (
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 space-y-4 shadow-lg">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Role-Based Access Control (RBAC) Permissions Matrix</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Enforces authorization boundaries between Street Patrol Officers, Detectives, and Command Administrators.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 text-zinc-300 font-mono border-b border-zinc-800">
                  <th className="p-3">Capability / Operation</th>
                  <th className="p-3 text-indigo-400">PATROL_OFFICER</th>
                  <th className="p-3 text-amber-400">INVESTIGATOR</th>
                  <th className="p-3 text-purple-400">ADMIN (Command)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-200">
                <tr>
                  <td className="p-3 font-medium">Log Field Draft & Final Mutation</td>
                  <td className="p-3 text-emerald-400 font-bold">✓ Granted</td>
                  <td className="p-3 text-emerald-400 font-bold">✓ Granted</td>
                  <td className="p-3 text-emerald-400 font-bold">✓ Granted</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Search Persons, Vehicles & Caution Flags</td>
                  <td className="p-3 text-emerald-400 font-bold">✓ Granted</td>
                  <td className="p-3 text-emerald-400 font-bold">✓ Granted</td>
                  <td className="p-3 text-emerald-400 font-bold">✓ Granted</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Official Amendment & Superseding</td>
                  <td className="p-3 text-zinc-500">✗ Restricted</td>
                  <td className="p-3 text-emerald-400 font-bold">✓ Granted (w/ reason)</td>
                  <td className="p-3 text-emerald-400 font-bold">✓ Granted</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Export Official Dossier (Proces-Verbaal)</td>
                  <td className="p-3 text-zinc-500">✗ Read Only</td>
                  <td className="p-3 text-emerald-400 font-bold">✓ Granted (Logged)</td>
                  <td className="p-3 text-emerald-400 font-bold">✓ Granted</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Global Audit Ledger Inspection</td>
                  <td className="p-3 text-zinc-500">✗ Restricted</td>
                  <td className="p-3 text-zinc-500">✗ Restricted</td>
                  <td className="p-3 text-emerald-400 font-bold">✓ Full Inspection</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
