import React, { useState, useEffect, useRef } from 'react';

declare const L: any;

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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [form, setForm] = useState<Partial<ProgramItem>>({});

  // Leaflet 지도 Ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  // 1. 구글 시트 연동
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
        console.warn('시트 연동 상태:', err);
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

  // 2. Leaflet 지도 초기화
  useEffect(() => {
    if (!mapContainerRef.current || typeof L === 'undefined') return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [37.4954, 126.8875], // 구로구 중심
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapInstanceRef.current = map;
    }
  }, []);

  // 필터 데이터 계산
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

  // 3. 탭이나 필터 변경 시 지도 마커 갱신
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || typeof L === 'undefined') return;

    // 기존 마커 전체 제거
    Object.values(markersRef.current).forEach((marker: any) => map.removeLayer(marker));
    markersRef.current = {};

    let activeItems: { id: string; title: string; sub: string; lat: number; lng: number }[] = [];

    if (currentTab === 'places') {
      activeItems = filteredPlaces.map(p => ({ id: p.id, title: p.name, sub: p.subCategory, lat: p.lat, lng: p.lng }));
    } else if (currentTab === 'programs') {
      activeItems = filteredPrograms.map(p => ({ id: p.id, title: p.title, sub: p.organization, lat: p.lat, lng: p.lng }));
    } else if (currentTab === 'courses') {
      activeItems = GURO_COURSES.map(c => ({ id: c.id, title: c.title, sub: c.tag, lat: c.lat, lng: c.lng }));
    }

    if (activeItems.length === 0) return;

    const bounds = L.latLngBounds([]);

    activeItems.forEach(item => {
      if (!item.lat || !item.lng) return;

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div class="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md border-2 border-white whitespace-nowrap cursor-pointer hover:bg-emerald-800 transition transform hover:scale-110">
                📍 ${item.title.length > 7 ? item.title.slice(0, 7) + '...' : item.title}
               </div>`,
        iconSize: [80, 30],
        iconAnchor: [40, 15],
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedId(item.id);
        map.flyTo([item.lat, item.lng], 15, { duration: 0.8 });
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <strong style="color: #065f46; font-size: 13px;">${item.title}</strong><br/>
          <span style="color: #64748b;">${item.sub}</span><br/>
          <div style="margin-top: 6px;">
            <a href="https://map.kakao.com/link/search/${encodeURIComponent(item.title)}" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: bold;">카카오맵 길찾기</a>
          </div>
        </div>
      `);

      markersRef.current[item.id] = marker;
      bounds.extend([item.lat, item.lng]);
    });

    if (activeItems.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [currentTab, filteredPlaces, filteredPrograms, selectedDong, selectedCategory]);

  // 카드 클릭 시 해당 마커로 날아가기
  const handleCardClick = (id: string, lat: number, lng: number) => {
    setSelectedId(id);
    const map = mapInstanceRef.current;
    if (map && lat && lng) {
      map.flyTo([lat, lng], 16, { duration: 0.8 });
      if (markersRef.current[id]) {
        markersRef.current[id].openPopup();
      }
    }
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

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F8FAF9] text-slate-800 font-sans overflow-hidden">
      {/* 1. 상단 내비게이션 바 */}
      <header className="h-14 bg-white/95 backdrop-blur border-b border-emerald-100 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-30 shadow-xs">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentTab('places')}>
          <span className="text-xl">🌿</span>
          <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
            모두의마을 <span className="text-emerald-600">구로</span>
          </span>
          <span className="hidden md:inline-block ml-2 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200/50">
            실시간 로컬 맵
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenRegister}
            className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            + 프로그램 등록
          </button>
        </div>
      </header>

      {/* 2. 상단 탭 & 필터 툴바 */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex-shrink-0 z-20 space-y-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-4 overflow-x-auto scrollbar-none">
            {[
              { id: 'places', label: '🏛️ 거점 시설', count: places.length },
              { id: 'programs', label: '📋 프로그램', count: programs.length },
              { id: 'courses', label: '🚶 하루 추천코스', count: 3 },
              { id: 'events', label: '🎉 축제·소식', count: GURO_EVENTS.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as MainTab)}
                className={`py-1 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 flex items-center gap-1.5 transition ${
                  currentTab === tab.id ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  currentTab === tab.id ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="w-full sm:w-56">
            <input
              type="text"
              placeholder="빠른 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* 동네 태그 바 */}
        {(currentTab === 'places' || currentTab === 'programs') && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none pt-1">
            {GURO_DONGS.map(dong => (
              <button
                key={dong}
                onClick={() => setSelectedDong(dong)}
                className={`text-[11px] px-2.5 py-0.5 rounded-full whitespace-nowrap transition font-medium ${
                  selectedDong === dong ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dong}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Lovable 스타일 2-Pane 메인 바디 (좌: 리스트 / 우: 인터랙티브 상시 지도) */}
      <div className="flex-1 flex flex-col-reverse lg:flex-row overflow-hidden relative">
        {/* [좌측 카드 리스트 패널] */}
        <div className="w-full lg:w-[460px] h-[55%] lg:h-full bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-10 shadow-sm">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>
              {currentTab === 'places' && `등록 공간 ${filteredPlaces.length}곳`}
              {currentTab === 'programs' && `진행 프로그램 ${filteredPrograms.length}개`}
              {currentTab === 'courses' && '추천 하루 코스 3선'}
              {currentTab === 'events' && '구로구 대표 축제'}
            </span>
            <span className="text-[11px] text-emerald-700">카드를 누르면 지도가 이동합니다</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* 거점 시설 */}
            {currentTab === 'places' && (
              <>
                {loadingPlaces ? (
                  <div className="p-12 text-center text-xs text-slate-400">구글 시트 연동 중...</div>
                ) : (
                  filteredPlaces.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleCardClick(p.id, p.lat, p.lng)}
                      className={`p-4 rounded-2xl border transition cursor-pointer hover:shadow-md ${
                        selectedId === p.id ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-200' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                          {p.subCategory}
                        </span>
                        <span className="text-[11px] text-slate-400">📍 {p.dong}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{p.name}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">{p.description || p.address}</p>
                      <div className="border-t border-slate-100 pt-2 text-xs text-slate-500 flex justify-between items-center">
                        <span className="truncate max-w-[200px]">🕒 {p.operatingHours}</span>
                        <a
                          href={`https://map.kakao.com/link/search/${encodeURIComponent(p.name)}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          길찾기 ➔
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* 프로그램 */}
            {currentTab === 'programs' && (
              <>
                {filteredPrograms.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleCardClick(p.id, p.lat, p.lng)}
                    className={`p-4 rounded-2xl border transition cursor-pointer hover:shadow-md ${
                      selectedId === p.id ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-200' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {p.targetGroup}
                      </span>
                      <span className="text-[11px] text-slate-400">📍 {p.locationDong}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{p.title}</h4>
                    <p className="text-xs text-slate-500 mb-1">{p.organization}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">{p.description}</p>
                    <div className="border-t border-slate-100 pt-2 text-xs text-slate-500 flex justify-between items-center">
                      <span>🕒 {p.period}</span>
                      {p.contact && (
                        <a
                          href={p.contact.startsWith('http') ? p.contact : `tel:${p.contact}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-emerald-700 font-bold hover:underline"
                        >
                          신청/문의 ➔
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* 추천 코스 */}
            {currentTab === 'courses' && (
              <>
                {GURO_COURSES.map(course => (
                  <div
                    key={course.id}
                    onClick={() => handleCardClick(course.id, course.lat, course.lng)}
                    className={`p-4 rounded-2xl border transition cursor-pointer hover:shadow-md ${
                      selectedId === course.id ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-200' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                      {course.tag}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1.5 mb-1">{course.title}</h4>
                    <p className="text-xs text-emerald-700 font-semibold mb-1">동선: {course.route.join(' ➔ ')}</p>
                    <p className="text-xs text-slate-600 leading-relaxed mb-2">{course.desc}</p>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">지도에서 코스 시작점 보기 ➔</span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* 축제 및 행사 */}
            {currentTab === 'events' && (
              <>
                {GURO_EVENTS.map(ev => (
                  <div key={ev.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                      {ev.tag}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{ev.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{ev.desc}</p>
                    <div className="border-t border-slate-100 pt-2 text-xs text-slate-500 space-y-0.5">
                      <p>📅 {ev.period}</p>
                      <p>📍 {ev.place}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* [우측 상시 노출 인터랙티브 지도] */}
        <div className="flex-1 h-[45%] lg:h-full w-full relative bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        </div>
      </div>

      {/* 4. 프로그램 등록 모달 */}
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
