'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { WorkspaceHero } from '@/components/layout/WorkspaceHero';
import { Cpu } from 'lucide-react';


// ─── Types ────────────────────────────────────────────────────────────────────

interface AIUsageSummary {
  date: string;
  total_cloud_calls: number;
  global_daily_limit: number;
  global_monthly_limit: number;
  monthly_calls_used: number;
  by_role: Record<string, number>;
  by_provider: Record<string, number>;
  failed_requests: number;
  avg_latency_ms: number | null;
  total_tokens_in: number;
  total_tokens_out: number;
}

interface AIPolicy {
  cloud_ai_enabled: boolean;
  limits_per_role: Record<string, number>;
  global_daily_limit: number;
  global_monthly_limit: number;
  max_tokens_per_request: number;
  provider_order: string[];
  reset_time: string;
}

interface ModelHealthEntry {
  model_id: string;
  provider: string;
  type: string;
  available: boolean;
  description: string;
}

interface ModelHealthResponse {
  ollama_online: boolean;
  ollama_models: string[];
  okf: { available: boolean; document_count: number };
  models: ModelHealthEntry[];
}

interface KnowledgeDocEntry {
  id: string;
  title: string;
  category: string;
  access_scope: string;
  indexing_status: string;
  chunk_count: number;
  created_at: string;
}

// ─── Subcomponents ─────────────────────────────────────────────────────────────

function ProgressBar({ value, max, color = '#2563EB' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ background: '#E5E5E5', borderRadius: 4, height: 8, width: '100%', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.4s ease' }} />
    </div>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="min-w-[160px] flex-1 rounded-[22px] border border-[#dce5f1] bg-white px-6 py-5 shadow-[0_10px_25px_rgba(8,26,57,0.05)]">
      <p className="text-xs font-bold text-[#526783]">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-[#081a39]">{value}</p>
      {sub && <p className="mt-1 text-xs text-[#71849b]">{sub}</p>}
    </div>
  );
}

// ─── Role Labels & Colors ─────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  student: '#E5E5E5',
  faculty: '#DBEAFE',
  hod: '#D1FAE5',
  cos: '#FEF3C7',
  hos: '#FCE7F3',
  higher_authority: '#EDE9FE',
  admin: '#FEE2E2',
  super_admin: '#111',
};

const ROLE_LIMITS: Record<string, number> = {
  student: 0,
  faculty: 1,
  hod: 5,
  cos: 3,
  hos: 3,
  higher_authority: 3,
  admin: 50,
  super_admin: 50,
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AIUsageDashboardPage() {
  const [summary, setSummary] = useState<AIUsageSummary | null>(null);
  const [policy, setPolicy] = useState<AIPolicy | null>(null);
  const [health, setHealth] = useState<ModelHealthResponse | null>(null);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to today in IST
    const now = new Date();
    const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    return ist.toISOString().split('T')[0];
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, policyRes, healthRes, docsRes] = await Promise.all([
        api.get(`/ai/admin/usage?target_date=${selectedDate}`),
        api.get('/ai/admin/policy'),
        api.get('/ai/health/models').catch(() => ({ data: null })),
        api.get('/ai/knowledge/documents').catch(() => ({ data: { documents: [] } })),
      ]);
      setSummary(sumRes.data);
      setPolicy(policyRes.data);
      if (healthRes.data) setHealth(healthRes.data);
      if (docsRes.data?.documents) setKnowledgeDocs(docsRes.data.documents);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to load AI usage data. Ensure you have admin/HOD access.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const globalPct = summary ? Math.min(100, (summary.total_cloud_calls / summary.global_daily_limit) * 100) : 0;
  const monthlyPct = summary ? Math.min(100, (summary.monthly_calls_used / summary.global_monthly_limit) * 100) : 0;

  return (
      <div className="mx-auto max-w-7xl space-y-7 pb-8">
        {/* Header */}
        <WorkspaceHero eyebrow="Department intelligence" title={<>AIDA usage <span className="text-[#5dd9ff]">overview.</span></>} description="Monitor cloud AI consumption, model availability, and knowledge indexing." tone="navy" icon={Cpu} visual="aida" />
        <div className="flex flex-wrap items-center justify-end gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="rounded-xl border border-[#dce5f1] bg-white px-4 py-2.5 text-sm text-[#081a39]"
            />
            <button
              onClick={fetchData}
              className="rounded-full bg-[#1478ef] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#075fc9]"
            >
              Refresh
            </button>
        </div>

        {/* Kill switch banner */}
        {policy && !policy.cloud_ai_enabled && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18 }}>🔴</span>
            <div>
              <p style={{ fontWeight: 600, color: '#991B1B', margin: 0 }}>Cloud AI is DISABLED</p>
              <p style={{ fontSize: 13, color: '#B91C1C', margin: 0 }}>CLOUD_AI_ENABLED=false — all cloud AI requests are being blocked for all roles.</p>
            </div>
          </div>
        )}

        {policy && policy.cloud_ai_enabled && (
          <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: 8, padding: '10px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>🟢</span>
            <p style={{ fontSize: 13, color: '#065F46', margin: 0 }}>
              Cloud AI is <strong>active</strong>. Resets daily at <strong>{policy.reset_time}</strong>.
              Provider order: <strong>{policy.provider_order?.join(' → ')}</strong>
            </p>
          </div>
        )}

        {error && (
          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '12px 20px', marginBottom: 24 }}>
            <p style={{ color: '#92400E', margin: 0 }}>{error}</p>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 80, color: '#999' }}>
            Loading AI usage data…
          </div>
        )}

        {!loading && summary && (
          <>
            {/* Global Usage Stats */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
              <StatBox label="Cloud Requests Today" value={summary.total_cloud_calls} sub={`of ${summary.global_daily_limit} daily limit`} />
              <StatBox label="Monthly Cloud Calls" value={summary.monthly_calls_used} sub={`of ${summary.global_monthly_limit} monthly limit`} />
              <StatBox label="Failed Requests" value={summary.failed_requests} sub="today" />
              <StatBox label="Avg Latency" value={summary.avg_latency_ms ? `${summary.avg_latency_ms} ms` : '—'} sub="cloud calls" />
              <StatBox label="Tokens In" value={summary.total_tokens_in.toLocaleString()} sub="total today" />
              <StatBox label="Tokens Out" value={summary.total_tokens_out.toLocaleString()} sub="total today" />
            </div>

            {/* Usage Progress Bars */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {/* Daily Global */}
              <div style={{ border: '1px solid #E5E5E5', borderRadius: 8, padding: 24, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <p style={{ fontWeight: 600, color: '#111', margin: 0 }}>Daily Global Budget</p>
                  <span style={{ fontSize: 14, color: '#666' }}>{summary.total_cloud_calls} / {summary.global_daily_limit}</span>
                </div>
                <ProgressBar value={summary.total_cloud_calls} max={summary.global_daily_limit} color={globalPct > 80 ? '#EF4444' : '#2563EB'} />
                <p style={{ fontSize: 12, color: '#999', marginTop: 8, margin: '8px 0 0 0' }}>
                  {Math.max(0, summary.global_daily_limit - summary.total_cloud_calls)} calls remaining
                </p>
              </div>

              {/* Monthly Global */}
              <div style={{ border: '1px solid #E5E5E5', borderRadius: 8, padding: 24, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <p style={{ fontWeight: 600, color: '#111', margin: 0 }}>Monthly Global Budget</p>
                  <span style={{ fontSize: 14, color: '#666' }}>{summary.monthly_calls_used} / {summary.global_monthly_limit}</span>
                </div>
                <ProgressBar value={summary.monthly_calls_used} max={summary.global_monthly_limit} color={monthlyPct > 80 ? '#EF4444' : '#059669'} />
                <p style={{ fontSize: 12, color: '#999', marginTop: 8, margin: '8px 0 0 0' }}>
                  {Math.max(0, summary.global_monthly_limit - summary.monthly_calls_used)} calls remaining
                </p>
              </div>
            </div>

            {/* By Role Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ border: '1px solid #E5E5E5', borderRadius: 8, padding: 24, background: '#fff' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: '0 0 16px 0' }}>Usage by Role</h3>
                {Object.entries(ROLE_LIMITS).map(([role, limit]) => {
                  const used = summary.by_role[role] || 0;
                  return (
                    <div key={role} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            display: 'inline-block',
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: ROLE_COLORS[role] || '#E5E5E5',
                            border: role === 'super_admin' ? '1px solid #E5E5E5' : 'none',
                          }} />
                          <span style={{ fontSize: 14, color: '#111', textTransform: 'capitalize' }}>{role.replace('_', ' ')}</span>
                          {limit === 0 && <span style={{ fontSize: 11, color: '#999', background: '#F5F5F5', borderRadius: 3, padding: '1px 5px' }}>no cloud</span>}
                        </div>
                        <span style={{ fontSize: 14, color: '#666' }}>
                          {used}{limit > 0 ? ` / ${limit}` : ''}
                        </span>
                      </div>
                      {limit > 0 && <ProgressBar value={used} max={limit} color={ROLE_COLORS[role] !== '#E5E5E5' ? '#2563EB' : '#999'} />}
                    </div>
                  );
                })}
              </div>

              {/* By Provider Breakdown */}
              <div style={{ border: '1px solid #E5E5E5', borderRadius: 8, padding: 24, background: '#fff' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: '0 0 16px 0' }}>Usage by Provider</h3>
                {summary.total_cloud_calls === 0 ? (
                  <p style={{ color: '#999', fontSize: 14, textAlign: 'center', marginTop: 40 }}>No cloud calls recorded today.</p>
                ) : (
                  Object.entries(summary.by_provider).sort((a, b) => b[1] - a[1]).map(([provider, count]) => (
                    <div key={provider} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 14, color: '#111', textTransform: 'capitalize' }}>{provider}</span>
                        <span style={{ fontSize: 14, color: '#666' }}>{count} call{count !== 1 ? 's' : ''}</span>
                      </div>
                      <ProgressBar value={count} max={Math.max(...Object.values(summary.by_provider))} color="#6366F1" />
                    </div>
                  ))
                )}

                {/* Policy quick-reference */}
                {policy && (
                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #E5E5E5' }}>
                    <p style={{ fontSize: 12, color: '#999', margin: '0 0 8px 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Policy Config</p>
                    <div style={{ fontSize: 13, color: '#666' }}>
                      <p style={{ margin: '0 0 4px 0' }}>Max tokens / request: <strong style={{ color: '#111' }}>{policy.max_tokens_per_request.toLocaleString()}</strong></p>
                      <p style={{ margin: '0 0 4px 0' }}>Global daily cap: <strong style={{ color: '#111' }}>{policy.global_daily_limit}</strong></p>
                      <p style={{ margin: 0 }}>Global monthly cap: <strong style={{ color: '#111' }}>{policy.global_monthly_limit}</strong></p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Role Limits Reference Table */}
            {policy && (
              <div style={{ border: '1px solid #E5E5E5', borderRadius: 8, background: '#fff', overflow: 'hidden', marginBottom: 24 }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E5E5' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: 0 }}>Cloud AI Access Policy</h3>
                  <p style={{ fontSize: 13, color: '#666', margin: '4px 0 0 0' }}>Configured limits per role. Enforced server-side via atomic Redis counters.</p>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#FAFAFA' }}>
                      {['Role', 'Cloud Calls / Day', 'Browser SLM', 'Local Ollama', 'Deterministic Tools'].map(h => (
                        <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 12, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #E5E5E5' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(policy.limits_per_role).map(([role, limit], i) => (
                      <tr key={role} style={{ borderBottom: '1px solid #F5F5F5', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                        <td style={{ padding: '12px 20px', fontWeight: 500, color: '#111', textTransform: 'capitalize' }}>{role.replace('_', ' ')}</td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 4,
                            fontSize: 13,
                            fontWeight: 600,
                            background: limit === 0 ? '#FEE2E2' : limit <= 1 ? '#FEF3C7' : limit <= 3 ? '#DBEAFE' : '#D1FAE5',
                            color: limit === 0 ? '#991B1B' : limit <= 1 ? '#92400E' : limit <= 3 ? '#1E40AF' : '#065F46',
                          }}>
                            {limit === 0 ? '0 (blocked)' : `${limit} / day`}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', color: '#059669', fontSize: 14 }}>✓ Allowed</td>
                        <td style={{ padding: '12px 20px', color: '#059669', fontSize: 14 }}>✓ Allowed</td>
                        <td style={{ padding: '12px 20px', color: '#059669', fontSize: 14 }}>✓ Allowed</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Model Health & Capability Matrix (§48) */}
            {health && (
              <div style={{ border: '1px solid #D6D6D6', borderRadius: 8, background: '#fff', overflow: 'hidden', marginBottom: 24 }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #D6D6D6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: 0 }}>Model Health & Capability Matrix</h3>
                    <p style={{ fontSize: 13, color: '#666', margin: '4px 0 0 0' }}>Live operational status across all 7 intelligence tiers.</p>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 4, background: health.okf.available ? '#D1FAE5' : '#FEE2E2', color: health.okf.available ? '#065F46' : '#991B1B', fontWeight: 600 }}>
                      OKF: {health.okf.document_count} Docs Active
                    </span>
                    <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 4, background: health.ollama_online ? '#D1FAE5' : '#FEF3C7', color: health.ollama_online ? '#065F46' : '#92400E', fontWeight: 600 }}>
                      Ollama: {health.ollama_online ? 'Online' : 'Offline (Degraded to OKF/Cloud)'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, padding: 20 }}>
                  {health.models.map(m => (
                    <div key={m.model_id} style={{ border: '1px solid #E5E5E5', borderRadius: 8, padding: 16, background: '#FAFAFA' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{m.model_id}</span>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 9999,
                          background: m.available ? '#D1FAE5' : '#FEE2E2',
                          color: m.available ? '#065F46' : '#991B1B',
                          textTransform: 'uppercase',
                        }}>
                          {m.available ? 'Ready' : 'Not Configured'}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>
                        <span style={{ textTransform: 'uppercase', fontWeight: 500 }}>Provider: {m.provider}</span> · <span>{m.type}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#777', margin: 0 }}>{m.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Knowledge Base & RAG Documents Registry (§16) */}
            <div style={{ border: '1px solid #D6D6D6', borderRadius: 8, background: '#fff', overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #D6D6D6' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: 0 }}>Institutional Knowledge Documents (RAG / OKF)</h3>
                <p style={{ fontSize: 13, color: '#666', margin: '4px 0 0 0' }}>Indexed documents available for localized semantic grounding without cloud inference.</p>
              </div>
              {knowledgeDocs.length === 0 ? (
                <p style={{ padding: 24, color: '#999', fontSize: 13, margin: 0, textAlign: 'center' }}>No indexed RAG documents recorded yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#FAFAFA' }}>
                      {['Title', 'Category', 'Scope', 'Chunks', 'Status', 'Indexed Date'].map(h => (
                        <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 12, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #E5E5E5' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {knowledgeDocs.map((doc, i) => (
                      <tr key={doc.id} style={{ borderBottom: '1px solid #F5F5F5', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                        <td style={{ padding: '12px 20px', fontWeight: 500, color: '#111', fontSize: 13 }}>{doc.title}</td>
                        <td style={{ padding: '12px 20px', color: '#555', fontSize: 12, textTransform: 'capitalize' }}>{doc.category}</td>
                        <td style={{ padding: '12px 20px', color: '#666', fontSize: 12, fontFamily: 'monospace' }}>{doc.access_scope}</td>
                        <td style={{ padding: '12px 20px', color: '#111', fontSize: 13, fontWeight: 600 }}>{doc.chunk_count}</td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: doc.indexing_status.startsWith('indexed') ? '#D1FAE5' : '#FEF3C7', color: doc.indexing_status.startsWith('indexed') ? '#065F46' : '#92400E' }}>
                            {doc.indexing_status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', color: '#888', fontSize: 12 }}>
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
  );
}
