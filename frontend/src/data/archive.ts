// archive.ts — 자료실 타입 + 번들 폴백.
// 원천(source of truth)은 backend/app/data/archive.json. 아래 폴백은 백엔드 /archive 가
// 콜드스타트·오류로 미응답일 때만 쓰여 공개 화면이 비는 것을 막는다(슬라이스 1에서 DB+폴백으로 확장).

export interface ArchiveItem {
  title: string;
  field: string;
  license: string;
  org: string;
  date: string;
  url?: string;
}

export const ARCHIVE_FALLBACK: ArchiveItem[] = [
  { title: '보이스피싱 범죄 피해 현황과 대응 방안', field: '생활안전', license: '제1유형', org: '경찰청', date: '2026.09' },
  { title: '2025 사회문제해결 R&D 우수성과 사례집', field: '종합', license: '제1유형', org: 'KISTEP', date: '2026.08' },
  { title: '1인가구 고독사 실태조사 보고서', field: '가족', license: '제1유형', org: '보건복지부', date: '2026.07' },
  { title: '사이버범죄 발생 추이 통계', field: '생활안전', license: '제1유형', org: '경찰청', date: '2026.06' },
  { title: '자연재해 피해 및 복구 현황', field: '재난재해', license: '제1유형', org: '행정안전부', date: '2026.05' },
];
