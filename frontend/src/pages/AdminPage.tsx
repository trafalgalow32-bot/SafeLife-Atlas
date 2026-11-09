// AdminPage.tsx — 관리자 전용 자료실 관리 화면 (slice 3)
//
// 공개 셸 밖의 독립 라우트(/admin). 토큰 없으면 로그인, 있으면 관리 대시보드.
// 워크플로: 작성 중(draft) → 검토 중(review) → 발행됨(published). 공개 자료실은 '발행됨'만 노출.
// 톤: 본 플랫폼과 동일한 슬레이트+앰버 인라인 스타일(Tailwind 미사용 규율 연속).

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  login,
  getToken,
  setToken,
  clearToken,
  listRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  AdminApiError,
  type AdminRecord,
  type RecordInput,
} from '../api/adminClient';

// 상태 배지 메타(3단).
const STATUS_META: Record<string, { label: string; bg: string; fg: string }> = {
  draft: { label: '작성 중', bg: '#f1f5f9', fg: '#475569' },
  review: { label: '검토 중', bg: '#fef3c7', fg: '#b45309' },
  published: { label: '발행됨', bg: '#dcfce7', fg: '#15803d' },
};

// 상태별 허용 전환(검토→발행 워크플로 + 되돌림 경로).
const TRANSITIONS: Record<string, { to: string; label: string }[]> = {
  draft: [{ to: 'review', label: '검토 요청' }],
  review: [
    { to: 'published', label: '발행' },
    { to: 'draft', label: '반려' },
  ],
  published: [{ to: 'draft', label: '내리기' }],
};

export default function AdminPage() {
  const [token, setTokenState] = useState<string | null>(getToken());

  if (!token) {
    return (
      <LoginView
        onSuccess={(t) => {
          setToken(t);
          setTokenState(t);
        }}
      />
    );
  }
  return (
    <DashboardView
      onLogout={() => {
        clearToken();
        setTokenState(null);
      }}
    />
  );
}

// ───────────────────────── 로그인 ─────────────────────────

function LoginView({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const t = await login(username, password);
      onSuccess(t);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : '로그인에 실패했습니다.');
      setBusy(false);
    }
  };

  return (
    <div style={shell.page}>
      <div style={{ maxWidth: 380, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: '#64748b' }}>
          관리자
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '8px 0 4px' }}>자료실 관리 로그인</h1>
        <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 24px' }}>
          SafeLife-Atlas 자료실 검토·발행을 위한 단일 관리자 영역입니다.
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={fieldLabel}>아이디</span>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={input}
              required
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={fieldLabel}>비밀번호</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={input}
              required
            />
          </label>

          {err && (
            <div role="alert" style={{ fontSize: 13, color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px' }}>
              {err}
            </div>
          )}

          <button type="submit" disabled={busy} style={{ ...primaryBtn, marginTop: 4, opacity: busy ? 0.6 : 1 }}>
            {busy ? '확인 중…' : '로그인'}
          </button>
        </form>

        <div style={{ marginTop: 24, fontSize: 13 }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>
            ← 공개 사이트로
          </Link>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── 대시보드 ─────────────────────────

function DashboardView({ onLogout }: { onLogout: () => void }) {
  const [records, setRecords] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRecord | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // 공통 에러 처리: 401=세션만료 로그아웃 / 503=DB 미연결 안내 / 그 외 배너.
  const handleErr = useCallback(
    (e: unknown) => {
      if (e instanceof AdminApiError) {
        if (e.status === 401) {
          onLogout();
          return;
        }
        if (e.status === 503) {
          setBanner({
            kind: 'info',
            text: 'DB가 아직 연결되지 않았습니다. Render에 DATABASE_URL을 주입하면 자료 관리가 활성화됩니다. (현재 공개 자료실은 seed 폴백으로 정상 동작)',
          });
          return;
        }
        setBanner({ kind: 'error', text: e.message });
        return;
      }
      setBanner({ kind: 'error', text: '요청 처리 중 오류가 발생했습니다.' });
    },
    [onLogout],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listRecords();
      setRecords(data);
      setBanner(null);
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 503) setRecords([]);
      handleErr(e);
    } finally {
      setLoading(false);
    }
  }, [handleErr]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeStatus = async (rec: AdminRecord, to: string) => {
    setBusyId(rec.id);
    try {
      const updated = await updateRecord(rec.id, { status: to });
      setRecords((rs) => rs.map((r) => (r.id === updated.id ? updated : r)));
    } catch (e) {
      handleErr(e);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: number) => {
    setBusyId(id);
    try {
      await deleteRecord(id);
      setRecords((rs) => rs.filter((r) => r.id !== id));
      setConfirmId(null);
    } catch (e) {
      handleErr(e);
    } finally {
      setBusyId(null);
    }
  };

  // RecordForm에서 호출. 성공 시 폼 닫기, 실패 시 throw(폼이 인라인 표시).
  const handleFormSubmit = async (input: RecordInput) => {
    try {
      if (editing) {
        const updated = await updateRecord(editing.id, input);
        setRecords((rs) => rs.map((r) => (r.id === updated.id ? updated : r)));
      } else {
        const created = await createRecord(input);
        setRecords((rs) => [created, ...rs]);
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 401) {
        onLogout();
        return;
      }
      throw e;
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (rec: AdminRecord) => {
    setEditing(rec);
    setFormOpen(true);
  };

  return (
    <div style={shell.page}>
      {/* 상단 바 */}
      <header style={{ background: '#0f172a', color: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <strong style={{ fontSize: 16 }}>자료실 관리</strong>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>SafeLife-Atlas · 검토 → 발행 워크플로</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link to="/archive" style={{ fontSize: 13, color: '#cbd5e1', textDecoration: 'none' }}>
              공개 자료실 ↗
            </Link>
            <button type="button" onClick={onLogout} style={{ ...ghostBtnDark }}>
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 56px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <p style={{ color: '#475569', fontSize: 13, margin: 0, maxWidth: 620 }}>
            작성 중·검토 중 자료는 비공개이며, <strong style={{ color: '#15803d' }}>발행됨</strong> 자료만 공개 자료실에 노출됩니다.
          </p>
          <button type="button" onClick={openCreate} style={primaryBtn}>
            + 새 자료 등록
          </button>
        </div>

        {banner && (
          <div
            role="alert"
            style={{
              fontSize: 13,
              borderRadius: 8,
              padding: '11px 14px',
              marginBottom: 16,
              border: '1px solid ' + (banner.kind === 'error' ? '#fecaca' : '#fde68a'),
              background: banner.kind === 'error' ? '#fef2f2' : '#fffbeb',
              color: banner.kind === 'error' ? '#b91c1c' : '#92400e',
            }}
          >
            {banner.text}
          </div>
        )}

        {formOpen && (
          <RecordForm
            initial={
              editing
                ? { title: editing.title, field: editing.field, license: editing.license, org: editing.org, date: editing.date, url: editing.url ?? '' }
                : null
            }
            editing={!!editing}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
          />
        )}

        {/* 목록 */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 14, padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, color: '#64748b' }}>
            <div style={{ flex: 1, minWidth: 0 }}>자료 제목</div>
            <div style={{ width: 150 }}>분야 · 라이선스</div>
            <div style={{ width: 92 }}>기관</div>
            <div style={{ width: 64 }}>발행</div>
            <div style={{ width: 72 }}>상태</div>
            <div style={{ width: 240, textAlign: 'right' }}>작업</div>
          </div>

          {loading ? (
            <div style={emptyBox}>목록을 불러오는 중…</div>
          ) : records.length === 0 ? (
            <div style={emptyBox}>등록된 자료가 없습니다. “새 자료 등록”으로 첫 자료를 추가해 보세요.</div>
          ) : (
            records.map((rec, i) => {
              const meta = STATUS_META[rec.status] ?? { label: rec.status, bg: '#f1f5f9', fg: '#475569' };
              const busy = busyId === rec.id;
              return (
                <div key={rec.id} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 20px', borderBottom: i < records.length - 1 ? '1px solid #f1f5f9' : 'none', opacity: busy ? 0.55 : 1 }}>
                  <div style={{ flex: 1, minWidth: 0, fontWeight: 500, fontSize: 14 }}>{rec.title}</div>
                  <div style={{ width: 150, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#f1f5f9', color: '#475569' }}>{rec.field}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#eff6ff', color: '#1d4ed8' }}>{rec.license}</span>
                  </div>
                  <div style={{ width: 92, fontSize: 13, color: '#475569' }}>{rec.org}</div>
                  <div style={{ width: 64, fontSize: 13, color: '#64748b' }}>{rec.date}</div>
                  <div style={{ width: 72 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: meta.bg, color: meta.fg }}>{meta.label}</span>
                  </div>
                  <div style={{ width: 240, display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {confirmId === rec.id ? (
                      <>
                        <span style={{ fontSize: 12, color: '#b91c1c', alignSelf: 'center' }}>삭제할까요?</span>
                        <button type="button" disabled={busy} onClick={() => remove(rec.id)} style={dangerBtn}>삭제</button>
                        <button type="button" onClick={() => setConfirmId(null)} style={ghostBtn}>취소</button>
                      </>
                    ) : (
                      <>
                        {(TRANSITIONS[rec.status] ?? []).map((t) => (
                          <button key={t.to} type="button" disabled={busy} onClick={() => changeStatus(rec, t.to)} style={t.to === 'published' ? primarySmBtn : ghostBtn}>
                            {t.label}
                          </button>
                        ))}
                        <button type="button" disabled={busy} onClick={() => openEdit(rec)} style={ghostBtn}>수정</button>
                        <button type="button" disabled={busy} onClick={() => setConfirmId(rec.id)} style={ghostBtn}>삭제</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

// ───────────────────────── 자료 폼(등록/수정 공용) ─────────────────────────

function RecordForm({
  initial,
  editing,
  onSubmit,
  onCancel,
}: {
  initial: RecordInput | null;
  editing: boolean;
  onSubmit: (input: RecordInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [f, setF] = useState<RecordInput>(
    initial ?? { title: '', field: '', license: '제1유형', org: '', date: '', url: '' },
  );
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof RecordInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const payload: RecordInput = {
        title: f.title.trim(),
        field: f.field.trim(),
        license: f.license.trim(),
        org: f.org.trim(),
        date: f.date.trim(),
        url: f.url?.trim() ? f.url.trim() : undefined,
      };
      await onSubmit(payload);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : '저장에 실패했습니다.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{editing ? '자료 수정' : '새 자료 등록'}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <Field label="제목" required value={f.title} onChange={set('title')} />
        <Field label="분야" required value={f.field} onChange={set('field')} placeholder="생활안전 · 가족 …" />
        <Field label="공공누리 유형" required value={f.license} onChange={set('license')} placeholder="제1유형" />
        <Field label="발행기관" required value={f.org} onChange={set('org')} placeholder="경찰청 · KISTEP …" />
        <Field label="발행 시점" required value={f.date} onChange={set('date')} placeholder="2026.09" />
        <Field label="원문 URL (선택)" value={f.url ?? ''} onChange={set('url')} placeholder="https://… (공공누리 원문)" />
      </div>

      {err && (
        <div role="alert" style={{ fontSize: 13, color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', marginTop: 14 }}>
          {err}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <button type="button" onClick={onCancel} style={ghostBtn}>취소</button>
        <button type="submit" disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}>
          {saving ? '저장 중…' : editing ? '수정 저장' : '등록(작성 중)'}
        </button>
      </div>
      {!editing && (
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '12px 0 0' }}>
          새 자료는 ‘작성 중’으로 등록됩니다. 검토 후 발행하면 공개 자료실에 노출됩니다.
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={fieldLabel}>
        {label}
        {required && <span style={{ color: '#dc2626' }}> *</span>}
      </span>
      <input type="text" value={value} onChange={onChange} placeholder={placeholder} required={required} style={input} />
    </label>
  );
}

// ───────────────────────── 스타일 토큰 ─────────────────────────

const shell = {
  page: {
    minHeight: '100%',
    background: '#f8fafc',
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
    color: '#0f172a',
  } as React.CSSProperties,
};

const fieldLabel: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#475569' };

const input: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: 14,
  padding: '9px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  color: '#0f172a',
  background: '#fff',
};

const primaryBtn: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: 14,
  fontWeight: 600,
  padding: '9px 16px',
  borderRadius: 8,
  border: 'none',
  background: '#0f172a',
  color: '#fff',
  cursor: 'pointer',
};

const primarySmBtn: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: 12,
  fontWeight: 600,
  padding: '6px 11px',
  borderRadius: 7,
  border: '1px solid #15803d',
  background: '#15803d',
  color: '#fff',
  cursor: 'pointer',
};

const ghostBtn: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: 12,
  fontWeight: 500,
  padding: '6px 11px',
  borderRadius: 7,
  border: '1px solid #e2e8f0',
  background: '#fff',
  color: '#475569',
  cursor: 'pointer',
};

const ghostBtnDark: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: 13,
  fontWeight: 500,
  padding: '6px 12px',
  borderRadius: 7,
  border: '1px solid #334155',
  background: 'transparent',
  color: '#cbd5e1',
  cursor: 'pointer',
};

const dangerBtn: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: 12,
  fontWeight: 600,
  padding: '6px 11px',
  borderRadius: 7,
  border: '1px solid #dc2626',
  background: '#dc2626',
  color: '#fff',
  cursor: 'pointer',
};

const emptyBox: React.CSSProperties = {
  padding: '48px 20px',
  textAlign: 'center',
  color: '#64748b',
  fontSize: 14,
};
