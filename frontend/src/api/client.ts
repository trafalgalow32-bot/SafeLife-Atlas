// client.ts (API 호출 모듈)

import type { DomainGraphResponse } from '../types/graph';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export async function fetchDomainGraph(domainId: string): Promise<DomainGraphResponse> {
  const response = await fetch(`${API_BASE_URL}/domains/${domainId}/graph`);
  if (!response.ok) {
    throw new Error(`데이터 로드 실패 (HTTP ${response.status})`);
  }
  return response.json();
}