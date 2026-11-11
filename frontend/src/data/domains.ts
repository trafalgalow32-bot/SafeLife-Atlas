// domains.ts — 도메인(사회문제) 메타데이터. 홈 카드 + 상세 정의 블록 공용 소스.

export type DomainStatus = 'live' | 'soon' | 'candidate';

export interface DomainMetric {
  label: string;
  value: string;
}

export interface DomainMeta {
  id: string;
  name: string;
  category?: string;
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
    category: '생활안전',
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
    category: '생활안전',
    status: 'live',
    shortDef: '해킹·악성코드·온라인 사기 등 정보통신망을 악용한 범죄.',
    definition:
      '정보통신망을 이용하거나 정보통신망 자체를 대상으로 삼는 범죄의 총칭. 경찰청 분류상 정보통신망 침해범죄(해킹·DDoS·악성프로그램)·이용범죄(사이버사기·사이버금융범죄·개인정보 침해)·불법콘텐츠 범죄로 나뉘며, 익명성·비대면성·시공간 무제약이라는 사이버공간의 구조적 특성과 얽힌 복합 구조를 가진다.',
    nodeSummary: '17개 세부문제 · 16개 인과관계',
    metrics: [
      { label: '연간 발생 건수', value: '217,807건' },
      { label: '사이버사기 비중', value: '64.8%' },
      { label: '랜섬웨어 증가율', value: '+141.7%' },
    ],
    sourceNote: '기준: 2021년 · 출처: 경찰청 「사이버범죄 트렌드」, KISTEP 문제개요서(권헌영) — 빅카인즈 최신성 보강',
  },
  {
    id: 'single-household',
    name: '1인가구 안전',
    category: '가족',
    status: 'soon',
    shortDef: '홀로 사는 가구의 고독사와 생활 안전 사각지대 문제.',
    definition:
      '혼자 생활하는 가구가 겪는 고독사, 응급상황 대응 공백, 생활 안전 사각지대 등 사회적 고립과 안전 문제.',
  },
  {
    id: 'power-supply',
    name: '전력수급',
    category: '에너지',
    status: 'candidate',
    shortDef: 'AI 데이터센터 증설·에너지 전환기의 전력 수급 불안정.',
    definition:
      'AI 데이터센터 증설과 에너지 전환이 맞물리며 발생하는 전력 수요 급증, 수급 불안정, 전력망 부담 문제.',
  },
  {
    id: 'jeonse-fraud',
    name: '전세사기',
    category: '기타',
    status: 'candidate',
    shortDef: '임차보증금을 노린 기망·구조적 사기로 세입자가 보증금을 잃는 피해.',
    definition:
      '전세보증금을 반환할 의사·능력 없이 계약하거나, 깡통전세·명의신탁·대항력 공백 등 제도적 허점을 악용해 임차인의 보증금을 가로채는 사기. 공식 10대 분야 43개 영역에는 미편입(기타)이나, 등기·거래 데이터 기반 위험탐지 등 과학기술 개입 여지가 있어 커버 대상.',
    sourceNote: '기타(오프-프레임워크) · 공식 R&D 미편입 — 커버 도메인',
  },
];

export function getDomain(id: string): DomainMeta | undefined {
  return DOMAINS.find((d) => d.id === id);
}
