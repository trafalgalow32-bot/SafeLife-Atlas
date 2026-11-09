// adminClient.ts — 관리자(slice 3) API 호출. 공개 client.ts와 분리된 보호 영역 전용.
// JWT는 localStorage에 보관(백엔드 TTL 8h). 보호된 호출이 401이면 만료로 간주해 토큰 폐기.

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1';

const TOKEN_KEY = 'sla_admin_token';

// 백엔드 ArchiveAdminItem과 1:1 (id·status 포함).
export interface AdminRecord {
  id: number;
  title: string;
  field: string;
  license: string;
  org: string;
  date: string;
  url?: string | null;
  status: string;
}

// 생성·수정 입력(공통). status는 생성 시 백엔드가 draft로 기본 처리.
export interface RecordInput {
  title: string;
  field: string;
  license: string;
  org: string;
  date: string;
  url?: string;
  status?: string;
}

// 호출 측에서 503(DB 미연결)·401(인증) 등을 분기할 수 있도록 상태코드를 품은 에러.
export class AdminApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// FastAPI는 에러를 {detail: "..."}로 주므로 그 메시지를 그대로 노출.
async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.detail === 'string') return data.detail;
  } catch {
    /* 본문 없음 */
  }
  return `요청 실패 (HTTP ${res.status})`;
}

// 로그인만은 OAuth2PasswordRequestForm → x-www-form-urlencoded 바디.
export async function login(username: string, password: string): Promise<string> {
  const body = new URLSearchParams();
  body.set('username', username);
  body.set('password', password);
  const res = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new AdminApiError(res.status, await parseError(res));
  const data = await res.json();
  return data.access_token as string;
}

// 보호된 호출 공통 래퍼: Bearer 부착 + 401이면 토큰 폐기(세션 만료).
async function authed(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (res.status === 401) {
    clearToken();
    throw new AdminApiError(401, '세션이 만료되었습니다. 다시 로그인해 주세요.');
  }
  return res;
}

export async function listRecords(): Promise<AdminRecord[]> {
  const res = await authed('/admin/archive');
  if (!res.ok) throw new AdminApiError(res.status, await parseError(res));
  return res.json();
}

export async function createRecord(input: RecordInput): Promise<AdminRecord> {
  const res = await authed('/admin/archive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new AdminApiError(res.status, await parseError(res));
  return res.json();
}

export async function updateRecord(id: number, patch: Partial<RecordInput>): Promise<AdminRecord> {
  const res = await authed(`/admin/archive/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new AdminApiError(res.status, await parseError(res));
  return res.json();
}

export async function deleteRecord(id: number): Promise<void> {
  const res = await authed(`/admin/archive/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new AdminApiError(res.status, await parseError(res));
}
