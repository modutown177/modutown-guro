import React, { useState, useEffect } from 'react';

type MainTab = 'places' | 'programs' | 'courses' | 'events';
type CategoryType = 'all' | 'relaxation' | 'culture_learning' | 'living_admin' | 'welfare_care';

interface PlaceItem {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  dong: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  operatingHours: string;
  contact: string;
}

interface ProgramItem {
  id: string;
  title: string;
  organization: string;
  category: CategoryType;
  targetGroup: string;
  specificAge?: string;
  locationDong: string;
  residencyReq: string;
  period: string;
  locationDetail: string;
  fee: string;
  contact: string;
  description: string;
  lat: number;
  lng: number;
}

const GURO_DONGS = [
  '전체', '신도림동', '구로1동', '구로2동', '구로3동', '구로4동', '구로5동',
  '가리봉동', '고척1동', '고척2동', '개봉1동', '개봉2동', '개봉3동',
  '오류1동', '오류2동', '항동', '수궁동', '온수동'
];

const CATEGORY_TABS: { id: CategoryType; label: string; icon: string }[] = [
  { id: 'all', label: '전체', icon: '✨' },
  { id: 'relaxation', label: '자연·쉼터', icon: '🌿' },
  { id: 'culture_learning', label: '문화·배움', icon: '🎨' },
  { id: 'living_admin', label: '마을·행정', icon: '🏛️' },
  { id: 'welfare_care', label: '돌봄·복지', icon: '🤝' },
];

const SHEET_EXPORT_URL = 'https://docs.google.com/spreadsheets/d/1zu9MG7bNnrOYaxse9ofERX8fI_f86QDf9-WW_WyjyOA/export?format=csv&gid=0';

const GURO_COURSES = [
  {
    id: 'c-1',
    title: '자연과 숲길이 숨쉬는 항동 힐링 로드',
    tag: '힐링 쉼표',
    route: ['천왕역', '항동철길', '푸른수목원 & 항동저수지', '천왕산 책쉼터'],
    desc: '옛 철길의 레트로 정취를 걷고 서울시 1호 시립수목원에서 숲속 서가를 만나는 여유로운 산책길입니다.',
    address: '서울 구로구 연동로 240',
    lat: 37.4828,
    lng: 126.8248
  },
  {
    id: 'c-2',
    title: '천왕산 숲속 생태 & 청소년 창작 하루 코스',
    tag: '가족·창작',
    route: ['오류동역', '천왕산 유아숲체험원', '천왕산 가족캠핑장', '온기도서관'],
    desc: '피톤치드 가득한 숲속 쉼터와 아이들의 자연 친화적 배움이 어우러진 코스입니다.',
    address: '서울 구로구 연동로12길 149',
    lat: 37.4801,
    lng: 126.8362
  },
  {
    id: 'c-3',
    title: '신도림 도심 문화살롱 & 수변 예술산책',
    tag: '예술·도심',
    route: ['신도림역 문화철도 959', '구로기적의도서관', '오페라하우스', '도림천 생태길'],
    desc: '신도림역 예술 공간과 특화 도서관, 야외 원형극장을 잇는 도심 속 감성 문화 로드입니다.',
    address: '서울 구로구 경인로 688',
    lat: 37.5085,
    lng: 126.8912
  }
];

const GURO_EVENTS = [
  {
    id: 'ev-1',
    title: '2026 구로G페스티벌 & 안양천 빛축제',
    period: '가을 시즌 (9월~10월)',
    place: '안양천 고척교 일대',
    tag: '구로 대표축제',
    desc: '구민 노래자랑, 먹거리 장터, 수변 야간 빛 조명 로드와 버스킹 축제.',
  },
  {
    id: 'ev-2',
    title: '구로 청년 주간 & 커리어 네트워킹 페어',
    period: '매주 청년의 날 주간',
    place: '서울청년센터 구로 (청년이룸)',
    tag: '청년 특화',
    desc: '취·창업 멘토링, 힐링 워크숍, 문화살롱 토크콘서트 진행.',
  },
  {
    id: 'ev-3',
    title: '안양천 생태초화원 계절 꽃길 나들이',
    period: '봄·가을 상시',
    place: '안양천 생태초화원 (고척1동)',
    tag: '생태 나들이',
    desc: '수변을 따라 조성된 코스모스와 억새풀, 쉼터에서 즐기는 피크닉.',
  }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<MainTab>('places');
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState<boolean>(true);

  const [programs, setPrograms] = useState<ProgramItem[]>([
    {
      id: 'prog-1',
      title: '주말 뚝딱뚝딱 목공 메이커 교실',
      organization: '구립 천왕동 청소년문화의집',
      category: 'culture_learning',
      targetGroup: '청년·성인 전체',
      locationDong: '오류2동',
      residencyReq: '구로구민 누구나',
      period: '매주 토 10:00 ~ 12:00',
      locationDetail: '지하 1층 창작공작소 (천왕로 56)',
      fee: '무료',
      contact: '02-2060-1318',
      description: '원목 도구를 다루며 생활 소품을 직접 제작해보는 주민 참여형 메이커 워크숍.',
      lat: 37.4890,
      lng: 126.8402
    },
    {
      id: 'prog-2',
      title: '청년 마음돌봄 힐링 티테라피',
      organization: '서울청년센터 구로 (청년이룸)',
      category: 'relaxation',
      targetGroup: '청년',
      specificAge: '만 19세 ~ 39세',
      locationDong: '오류2동',
      residencyReq: '구로구민 누구나',
      period: '매주 화 저녁 7시',
      locationDetail: '천왕역 4번출구 청년이룸 다목적실',
      fee: '무료',
      contact: '070-4963-9991',
      description: '사회초년생을 위한 저녁 티 블렌딩 및 스트레스 완화 힐링 모임.',
      lat: 37.4862,
      lng: 126.8385
    }
  ]);

  const [selectedDong, setSelectedDong] = useState<string>('전체');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [mapModalOpen, setMapModalOpen] = useState<boolean>(false);
  const [activeTarget, setActiveTarget] = useState<{ title: string; address?: string; lat: number; lng: number } | null>(null);

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [form, setForm] = useState<Partial<ProgramItem>>({});

  useEffect(() => {
    const fetchSheetData = async () => {
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
              category: cols[2] || 'living_admin',
              subCategory: cols[3] || '거점시설',
              dong: cols[4] || '구로동',
              address: cols[5] || '',
              lat: parseFloat(cols[6]) || 37.4955,
              lng: parseFloat(cols[7]) || 126.8874,
              description: cols[8] || '',
              operatingHours: cols[9] || '운영시간 문의',
              contact: cols[10] || ''
            });
          }
        }
        setPlaces(items);
      } catch (err) {
        console.warn('시트 연동 상태 확인:', err);
      } finally {
        setLoadingPlaces(false);
      }
    };

    fetchSheetData();

    const saved = localStorage.getItem('guro_programs_v2');
    if (saved) {
      try {
        setPrograms(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const filteredPlaces = places.filter(p => {
    const matchDong = selectedDong === '전체' || p.dong.includes(selectedDong);
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchQuery = !searchQuery || p.name.includes(searchQuery) || p.description.includes(searchQuery) || p.subCategory.includes(searchQuery);
    return matchDong && matchCat && matchQuery;
  });

  const filteredPrograms = programs.filter(p => {
    const matchDong = selectedDong === '전체' || p.locationDong.includes(selectedDong);
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchQuery = !searchQuery || p.title.includes(searchQuery) || p.organization.includes(searchQuery) || p.description.includes(searchQuery);
    return matchDong && matchCat && matchQuery;
  });

  const openMapModal = (item: { title: string; address?: string; lat: number; lng: number }) => {
    setActiveTarget(item);
    setMapModalOpen(true);
  };

  const handleOpenRegister = () => {
    setForm({
      category: 'culture_learning',
      targetGroup: '청년·성인 전체',
      locationDong: '신도림동',
      residencyReq: '구로구민 누구나',
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

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.organization) {
      alert('프로그램명과 기관명을 입력해주세요.');
      return;
    }
    const newProg: ProgramItem = {
      id: `prog-${Date.now()}`,
      title: form.title || '',
      organization: form.organization || '',
      category: form.category || 'culture_learning',
      targetGroup: form.targetGroup || '청년·성인 전체',
      specificAge: form.specificAge || '',
      locationDong: form.locationDong || '신도림동',
      residencyReq: form.residencyReq || '구로구민 누구나',
      period: form.period || '일정 문의',
      locationDetail: form.locationDetail || '',
      fee: form.fee || '무료',
      contact: form.contact || '',
      description: form.description || '',
      lat: 37.4955,
      lng: 126.8874
    };

    const updated = [newProg, ...programs];
    setPrograms(updated);
    localStorage.setItem('guro_programs_v2', JSON.stringify(updated));
    setRegisterModalOpen(false);
  };

  const currentLat = activeTarget?.lat || 37.4954;
  const currentLng = activeTarget?.lng || 126.8875;
  const targetTitle = activeTarget?.title || '구로구';
  const targetAddress = activeTarget?.address || '서울특별시 구로구';

  // 길찾기 및 네이티브 지도 링크
  const kakaoMapSearchUrl = `https://map.kakao.com/link/search/${encodeURIComponent(targetTitle)}`;
  const kakaoMapDirectUrl = `https://map.kakao.com/link/map/${encodeURIComponent(targetTitle)},${currentLat},${currentLng}`;
  const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(targetTitle)}`;

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-800">
      {/* 1. 상단 내비게이션 바 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-100/70 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentTab('places')}>
            <span className="text-2xl">🌿</span>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                모두의마을 <span className="text-emerald-600">구로</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200/50">
                구로구 로컬 아카이브
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openMapModal({ title: '구로구청 & 구로구 일대', address: '서울특별시 구로구 가마산로 245', lat: 37.4954, lng: 126.8875 })}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 bg-white transition"
            >
              <span>🗺️</span> 지도 모아보기
            </button>
            <button
              onClick={handleOpenRegister}
              className="text-xs font-bold px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
            >
              + 프로그램 등록
            </button>
          </div>
        </div>
      </header>

      {/* 2. 히어로 배너 */}
      <section className="bg-gradient-to-b from-[#EDF6F2] via-[#F4F9F6] to-[#F8FAF9] px-4 pt-10 pb-8 border-b border-emerald-50">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-emerald-800 bg-white/80 border border-emerald-200/60 rounded-full px-3 py-1 text-xs font-medium shadow-xs">
            <span>✨</span> 우리 곁의 따뜻한 공공·문화 쉼터
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-snug tracking-tight">
            골목의 배움에서 일상의 쉼표까지,<br />
            <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy decoration-2 underline-offset-4">구로구 마을 라이프</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            푸른수목원, 마을 도서관, 키움센터, 주민 참여 프로그램을 한곳에서 확인하세요.
          </p>

          <div className="pt-3 max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="예: 푸른수목원, 천왕산, 키움센터, 도서관, 목공..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 placeholder:text-slate-400 transition"
            />
            <span className="absolute left-4 top-6 text-slate-400 text-sm">🔍</span>
          </div>
        </div>
      </section>

      {/* 3. 메인 탭 */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 flex gap-6 overflow-x-auto scrollbar-none">
          {[
            { id: 'places', label: '🏛️ 거점 시설', count: places.length },
            { id: 'programs', label: '📋 프로그램', count: programs.length },
            { id: 'courses', label: '🚶 하루 추천코스', count: 3 },
            { id: 'events', label: '🎉 축제·소식', count: GURO_EVENTS.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as MainTab)}
              className={`py-3.5 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 flex items-center gap-1.5 transition ${
                currentTab === tab.id
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                currentTab === tab.id ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. 필터 바 */}
      {(currentTab === 'places' || currentTab === 'programs') && (
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-2 w-full space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {GURO_DONGS.map(dong => (
              <button
                key={dong}
                onClick={() => setSelectedDong(dong)}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition font-medium ${
                  selectedDong === dong
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {dong}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORY_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold flex items-center gap-1 transition ${
                  selectedCategory === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100 border border-emerald-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. 카드 리스트 */}
      <main className="max-w-6xl mx-auto px-4 py-4 flex-1 w-full">
        {currentTab === 'places' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-500">
                총 <strong className="text-slate-900">{filteredPlaces.length}</strong>곳의 공간
              </span>
            </div>

            {loadingPlaces ? (
              <div className="py-24 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                <span className="text-3xl animate-bounce inline-block">🌿</span>
                <p className="text-xs text-slate-500">구로구 마을 데이터를 불러오고 있습니다...</p>
              </div>
            ) : filteredPlaces.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-3xl border border-slate-200">
                <p className="text-xs text-slate-400">조건에 맞는 공간을 찾지 못했습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlaces.map(p => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                          {p.subCategory}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">📍 {p.dong}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition">
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {p.description || p.address}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                      <p className="truncate">🕒 {p.operatingHours}</p>
                      {p.contact && <p>📞 {p.contact}</p>}
                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => openMapModal({ title: p.name, address: p.address, lat: p.lat, lng: p.lng })}
                          className="flex-1 py-2 text-center rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition border border-slate-200"
                        >
                          🧭 위치 & 지도보기
                        </button>
                        {p.contact && (
                          <a
                            href={`tel:${p.contact}`}
                            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold text-center border border-slate-200"
                          >
                            전화
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === 'programs' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-500">
                총 <strong className="text-slate-900">{filteredPrograms.length}</strong>개의 프로그램
              </span>
            </div>

            {filteredPrograms.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-3xl border border-slate-200">
                <p className="text-xs text-slate-400">등록된 프로그램이 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPrograms.map(p => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          {p.targetGroup}
                        </span>
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          {p.residencyReq}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-auto">📍 {p.locationDong}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">{p.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{p.organization}</p>
                      <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">{p.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                      <p>🕒 {p.period}</p>
                      <p>🏛️ {p.locationDetail || `${p.locationDong} 소재`}</p>
                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => openMapModal({ title: p.title, address: p.locationDetail, lat: p.lat, lng: p.lng })}
                          className="flex-1 py-2 text-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition border border-slate-200"
                        >
                          위치 확인
                        </button>
                        {p.contact && (
                          <a
                            href={p.contact.startsWith('http') ? p.contact : `tel:${p.contact}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-2 text-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                          >
                            신청 / 문의
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {GURO_COURSES.map(course => (
              <div
                key={course.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-lg transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block">
                    {course.tag}
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg leading-snug">{course.title}</h3>
                  <div className="bg-[#F8FAF9] border border-emerald-100/70 rounded-2xl p-3.5">
                    <p className="text-[11px] font-bold text-emerald-700 mb-1">🚶 추천 코스 동선</p>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">{course.route.join(' ➔ ')}</p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{course.desc}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => openMapModal({ title: course.title, address: course.address, lat: course.lat, lng: course.lng })}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center transition shadow-xs"
                  >
                    🧭 코스 위치 & 길찾기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentTab === 'events' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {GURO_EVENTS.map(ev => (
              <div key={ev.id} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-3">
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 inline-block">
                  {ev.tag}
                </span>
                <h3 className="font-bold text-slate-900 text-lg">{ev.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{ev.desc}</p>
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  <p>📅 {ev.period}</p>
                  <p>📍 {ev.place}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 6. 위치 & 길찾기 팝업 모달 (브라우저 차단 없는 안전한 뷰) */}
      {mapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-xl">📍</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{targetTitle}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{targetAddress}</p>
                </div>
              </div>
              <button
                onClick={() => setMapModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <span>🧭</span> 위치 안내
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>{targetTitle}</strong>의 상세 위치를 스마트폰 지도 앱이나 웹 브라우저에서 바로 확인하실 수 있습니다.
                </p>
                <div className="text-[11px] text-slate-500 font-mono bg-white/80 p-2 rounded-lg border border-emerald-100">
                  위도: {currentLat.toFixed(5)} / 경도: {currentLng.toFixed(5)}
                </div>
              </div>

              {/* 카카오맵 / 네이버 지도 바로가기 버튼 */}
              <div className="space-y-2 pt-1">
                <a
                  href={kakaoMapDirectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <span>🟡</span> 카카오맵에서 상세 지도 및 길찾기 열기
                </a>
                <a
                  href={naverMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#03C75A] hover:bg-[#02B150] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <span>🟢</span> 네이버 지도에서 장소 검색하기
                </a>
              </div>
            </div>

            <div className="p-3 bg-slate-50 text-right border-t border-slate-100">
              <button
                onClick={() => setMapModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. 프로그램 등록 모달 (PIN: guro2026) */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {!pinVerified ? (
              <form onSubmit={handleVerifyPin} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">기관 담당자 보안 인증</h3>
                <p className="text-xs text-slate-500">
                  신규 프로그램 등록을 위해 기관 공통 PIN 코드를 입력해주세요.
                </p>
                <input
                  type="password"
                  placeholder="보안 코드 (guro2026)"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                  autoFocus
                />
                {pinError && <p className="text-xs text-red-500">보안 코드가 일치하지 않습니다.</p>}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRegisterModalOpen(false)}
                    className="w-1/2 rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-600"
                  >
                    닫기
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    확인
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveProgram} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
                  프로그램 신규 등록
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">프로그램명 *</label>
                  <input
                    type="text"
                    required
                    value={form.title || ''}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">기관명 *</label>
                  <input
                    type="text"
                    required
                    value={form.organization || ''}
                    onChange={e => setForm({ ...form, organization: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">동 선택 *</label>
                    <select
                      value={form.locationDong}
                      onChange={e => setForm({ ...form, locationDong: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                    >
                      {GURO_DONGS.filter(d => d !== '전체').map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">참여 대상</label>
                    <input
                      type="text"
                      placeholder="예: 청년, 전 연령"
                      value={form.targetGroup || ''}
                      onChange={e => setForm({ ...form, targetGroup: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">소개글</label>
                  <textarea
                    rows={2}
                    value={form.description || ''}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs resize-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRegisterModalOpen(false)}
                    className="w-1/2 rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-600"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    등록 완료
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
