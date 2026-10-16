// domains.ts — 도메인(사회문제) 메타데이터. 홈 카드 + 상세 정의 블록 공용 소스.

export type DomainStatus = 'live' | 'soon' | 'candidate';

export interface DomainMetric {
  label: string;
  value: string;
}

export interface DomainMeta {
  id: string;
  name: string;
  status: DomainStatus;
  shortDef: string;
  definition: string;
  nodeSummary?: string;
  metrics?: DomainMetric[];
  sourceNote?: string;
}

export const DOMAINS: DomainMeta[] = [
  {
    id: 'voice-phishing',
    name: '보이스피싱',
    status: 'live',
    shortDef: '전화·메시지로 피해자를 속여 금전과 개인정보를 가로채는 사기 범죄.',
    definition:
      '수사기관·금융기관 등을 사칭해 전화나 메시지로 피해자를 속이고, 자금 이체나 개인정보 제공을 유도해 금전적 피해를 입히는 전기통신금융사기. 사회공학적 기법과 통신·금융 인프라의 허점을 함께 악용한다는 점에서, 단일 원인이 아니라 여러 원인과 영향이 얽힌 복합 구조를 가진다.',
    nodeSummary: '22개 세부문제 · 22개 인과관계',
    metrics: [
      { label: '연간 발생 건수', value: '[값]' },
      { label: '연간 피해액', value: '[값]' },
      { label: '검거율', value: '[값]' },
    ],
    sourceNote: '기준: 2023년 · 출처: 경찰청, 금융감독원 — 실데이터 연결 예정',
  },
  {
    id: 'cyber-crime',
    name: '사이버범죄',
    status: 'soon',
    shortDef: '해킹·악성코드·온라인 사기 등 정보통신망을 악용한 범죄.',
    definition:
      '정보통신망을 이용하거나 정보통신망 자체를 대상으로 삼는 범죄의 총칭. 해킹, 악성프로그램 유포, 온라인 사기, 개인정보 침해 등을 포함한다.',
  },
  {
    id: 'single-household',
    name: '1인가구 안전',
    status: 'soon',
    shortDef: '홀로 사는 가구의 고독사와 생활 안전 사각지대 문제.',
    definition:
      '혼자 생활하는 가구가 겪는 고독사, 응급상황 대응 공백, 생활 안전 사각지대 등 사회적 고립과 안전 문제.',
  },
  {
    id: 'power-supply',
    name: '전력수급',
    status: 'candidate',
    shortDef: 'AI 데이터센터 증설·에너지 전환기의 전력 수급 불안정.',
    definition:
      'AI 데이터센터 증설과 에너지 전환이 맞물리며 발생하는 전력 수요 급증, 수급 불안정, 전력망 부담 문제.',
  },
];

export function getDomain(id: string): DomainMeta | undefined {
  return DOMAINS.find((d) => d.id === id);
}
