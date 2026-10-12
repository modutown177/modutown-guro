import React, { useState, useEffect } from 'react';

type TabType = 'home' | 'places' | 'programs' | 'events' | 'courses';

interface ProgramItem {
  id: string;
  title: string;
  organization: string;
  period: string;
  targetGroup: string;
  locationDong: string;
  status: '접수중' | '마감임박' | '접수마감';
  fee: string;
  contact?: string;
  description?: string;
}

interface PlaceItem {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  dong: string;
  address: string;
  operatingHours: string;
  contact: string;
  lat: number;
  lng: number;
}

const GURO_DONGS = [
  '구로구 전체', '신도림동', '구로1동', '구로2동', '구로3동', '구로4동', '구로5동',
  '가리봉동', '고척1동', '고척2동', '개봉1동', '개봉2동', '개봉3동',
  '오류1동', '오류2동', '항동', '수궁동', '온수동'
];

const INITIAL_PROGRAMS: ProgramItem[] = [
  {
    id: 'prog-1',
    title: '주말 뚝딱뚝딱 토요 목공 메이커 교실',
    organization: '구립천왕동청소년문화의집',
    period: '2026.11.07 ~ 11.28 매주 토 10:00',
    targetGroup: '초등 3~6학년',
    locationDong: '오류2동',
    status: '접수중',
    fee: '무료',
    contact: '02-2060-1318',
    description: '원목 도구를 다루며 생활 소품을 직접 제작해보는 어린이 참여형 메이커 워크숍.'
  },
  {
    id: 'prog-2',
    title: '자연과 교감하는 주말 숲속 그림책 클럽',
    organization: '항동 주민자치센터',
    period: '2026.11.14 ~ 12.05 매주 토 11:00',
    targetGroup: '5~7세 유아 및 보호자',
    locationDong: '항동',
    status: '접수중',
    fee: '무료',
    contact: '02-2620-7950',
    description: '푸른수목원 잔디밭과 숲속에서 부모와 아이가 함께 나누는 따뜻한 생태 그림책 놀이.'
  },
  {
    id: 'prog-3',
    title: '온가족 빛그림 동화구연 & 팝업북 만들기',
    organization: '구로기적의도서관',
    period: '2026.11.08 일요일 14:00',
    targetGroup: '유아~초등 저학년 가족',
    locationDong: '신도림동',
    status: '마감임박',
    fee: '무료',
    contact: '02-2632-8878',
    description: '어두운 방을 은은하게 비추는 빛그림 동화 감상 후 나만의 입체 팝업북을 제작합니다.'
  },
  {
    id: 'prog-4',
    title: '청년 마음돌봄 힐링 티테라피 & 아로마 살롱',
    organization: '서울청년센터 구로 (청년이룸)',
    period: '2026.11.12 ~ 11.26 매주 목 19:30',
    targetGroup: '만 19~39세 청년',
    locationDong: '오류2동',
    status: '접수중',
    fee: '무료',
    contact: '070-4963-9991',
    description: '지친 일상에 쉼표를 찍는 티 블렌딩과 스트레스 완화 힐링 네트워킹 모임.'
  }
];

const GURO_COURSES = [
  {
    id: 'c-1',
    title: '자연과 숲길이 숨쉬는 항동 힐링 로드',
    tag: '힐링 쉼표',
    route: ['천왕역', '항동철길', '푸른수목원 & 항동저수지', '천왕산 책쉼터'],
    desc: '옛 철길의 레트로 정취를 걷고 서울시 1호 시립수목원에서 숲속 서가를 만나는 여유로운 산책길입니다.',
    address: '서울 구로구 연동로 240'
  },
  {
    id: 'c-2',
    title: '천왕산 숲속 생태 & 청소년 창작 하루 코스',
    tag: '가족·창작',
    route: ['오류동역', '천왕산 유아숲체험원', '천왕산 가족캠핑장', '온기도서관'],
    desc: '피톤치드 가득한 숲속 쉼터와 아이들의 자연 친화적 배움이 어우러진 코스입니다.',
    address: '서울 구로구 연동로12길 149'
  },
  {
    id: 'c-3',
    title: '신도림 도심 문화살롱 & 수변 예술산책',
    tag: '예술·도심',
    route: ['신도림역 문화철도 959', '구로기적의도서관', '오페라하우스', '도림천 생태길'],
    desc: '신도림역 예술 공간과 특화 도서관, 야외 원형극장을 잇는 도심 속 감성 문화 로드입니다.',
    address: '서울 구로구 경인로 688'
  }
];

const GURO_EVENTS = [
  {
    id: 'ev-1',
    title: '2026 구로G페스티벌 & 안양천 빛축제',
    period: '가을 시즌 (9월~10월)',
    place: '안양천 고척교 일대',
    tag: '구로 대표축제',
    desc: '구민 노래자랑, 먹거리 장터, 수변 야간 빛 조명 로드와 버스킹 축제.'
  },
  {
    id: 'ev-2',
    title: '구로 청년 주간 & 커리어 네트워킹 페어',
    period: '매주 청년의 날 주간',
    place: '서울청년센터 구로 (청년이룸)',
    tag: '청년 특화',
    desc: '취·창업 멘토링, 힐링 워크숍, 문화살롱 토크콘서트 진행.'
  },
  {
    id: 'ev-3',
    title: '안양천 생태초화원 계절 꽃길 나들이',
    period: '봄·가을 상시',
    place: '안양천 생태초화원 (고척1동)',
    tag: '생태 나들이',
    desc: '수변을 따라 조성된 코스모스와 억새풀, 쉼터에서 즐기는 피크닉.'
  }
];

const SHEET_EXPORT_URL = 'https://docs.google.com/spreadsheets/d/1zu9MG7bNnrOYaxse9ofERX8fI_f86QDf9-WW_WyjyOA/export?format=csv&gid=0';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedDong, setSelectedDong] = useState<string>('구로구 전체');
  const [isDongMenuOpen, setIsDongMenuOpen] = useState(false);

  const [programs, setPrograms] = useState<ProgramItem[]>(INITIAL_PROGRAMS);
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);

  // 등록 모달
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [form, setForm] = useState<Partial<ProgramItem>>({});

  // 구글 시트 연동 (가볼만한곳)
  useEffect(() => {
    const fetchSheet = async () => {
      try {
        setLoadingPlaces(true);
        const res = await fetch(SHEET_EXPORT_URL);
        if (!res.ok) throw new Error('Fetch failed');
        const text = await res.text();
        const lines = text.split('\n').filter(l => l.trim() !== '');
        const items: PlaceItem[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 8 && cols[1]) {
            items.push({
              id: cols[0] || `place-${i}`,
              name: cols[1],
              category: cols[2] || 'relaxation',
              subCategory: cols[3] || '명소',
              dong: cols[4] || '구로동',
              address: cols[5] || '',
              lat: parseFloat(cols[6]) || 37.4955,
              lng: parseFloat(cols[7]) || 126.8874,
              description: cols[8] || '',
              operatingHours: cols[9] || '상시 개방',
              contact: cols[10] || ''
            });
          }
        }
        setPlaces(items);
      } catch (e) {
        console.warn('시트 로드:', e);
      } finally {
        setLoadingPlaces(false);
      }
    };

    fetchSheet();

    const saved = localStorage.getItem('guro_programs_v3');
    if (saved) {
      try {
        setPrograms(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // 필터링
  const filteredPrograms = programs.filter(p => {
    return selectedDong === '구로구 전체' || p.locationDong.includes(selectedDong.replace('구로구 전체', ''));
  });

  const filteredPlaces = places.filter(p => {
    return selectedDong === '구로구 전체' || p.dong.includes(selectedDong.replace('구로구 전체', ''));
  });

  const handleOpenRegister = () => {
    setForm({
      locationDong: selectedDong === '구로구 전체' ? '신도림동' : selectedDong,
      status: '접수중',
      fee: '무료'
    });
    setPinVerified(false);
    setPinInput('');
    setPinError(false);
    setRegisterModalOpen(true);
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'guro2026') {
      setPinVerified(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSaveProgram = (e: React.Form
