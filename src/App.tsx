import React, { useState, useEffect } from 'react';

type MainTab = 'places' | 'programs' | 'events' | 'courses';
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
  '구로구 전체', '신도림동', '구로1동', '구로2동', '구로3동', '구로4동', '구로5동',
  '가리봉동', '고척1동', '고척2동', '개봉1동', '개봉2동', '개봉3동',
  '오류1동', '오류2동', '항동', '수궁동', '온수동'
];

const CATEGORY_LABELS: Record<string, string> = {
  all: '전체',
  relaxation: '휴식·공원',
  culture_learning: '문화·학습',
  living_admin: '행정·마을활력',
  welfare_care: '복지·돌봄'
};

// 동별 기본 중심 좌표
const DONG_COORDS: Record<string, { lat: number; lng: number }> = {
  '신도림동': { lat: 37.5098, lng: 126.8913 },
  '구로1동': { lat: 37.4982, lng: 126.8715 },
  '구로2동': { lat: 37.4935, lng: 126.8862 },
  '구로3동': { lat: 37.4851, lng: 126.8974 },
  '구로4동': { lat: 37.4921, lng: 126.8891 },
  '구로5동': { lat: 37.4988, lng: 126.8893 },
  '가리봉동': { lat: 37.4828, lng: 126.8880 },
  '고척1동': { lat: 37.4985, lng: 126.8712 },
  '고척2동': { lat: 37.5028, lng: 126.8574 },
  '개봉1동': { lat: 37.4965, lng: 126.8552 },
  '개봉2동': { lat: 37.4942, lng: 126.8580 },
  '개봉3동': { lat: 37.4879, lng: 126.8565 },
  '오류1동': { lat: 37.4948, lng: 126.8465 },
  '오류2동': { lat: 37.4890, lng: 126.8402 },
  '항동': { lat: 37.4828, lng: 126.8248 },
  '수궁동': { lat: 37.4951, lng: 126.8321 },
  '온수동': { lat: 37.4998, lng: 126.8285 },
};

// 실시간 구글 시트 CSV 주소 (구로구_마을지도_데이터)
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR11cZ7m4z3Q2jW4yL3x5/pub?output=csv'; // 사용자 스프레드시트 연동용 fallback
const SHEET_EXPORT_URL = 'https://docs.google.com/spreadsheets/d/1zu9MG7bNnrOYaxse9ofERX8fI_f86QDf9-WW_WyjyOA/export?format=csv&gid=0';

// 하루 추천 코스
const GURO_COURSES = [
  {
    id: 'c-1',
    title: '자연과 숲길이 숨쉬는 항동 힐링 로드',
    theme: '🌿 자연 & 사색',
    route: ['천왕역', '항동철길', '푸른수목원 & 항동저수지', '천왕산 책쉼터'],
    desc: '옛 철길의 레트로 정취를 거닐고 서울시 1호 시립수목원에서 숲속 서가를 만나는 힐링 산책 코스입니다.',
    lat: 37.4828,
    lng: 126.8248
  },
  {
    id: 'c-2',
    title: '천왕산 생태공원 & 청소년 창작 하루 코스',
    theme: '🪵 가족 & 체험',
    route: ['오류동역', '천왕산 유아숲체험원', '천왕산 가족캠핑장', '온기도서관'],
    desc: '피톤치드 가득한 천왕산 자락 숲속 쉼터와 아이들의 자연 체험이 어우러진 코스입니다.',
    lat: 37.4801,
    lng: 126.8362
  },
  {
    id: 'c-3',
    title: '신도림 도심 문화살롱 & 도림천 산책로',
    theme: '🎨 예술 & 문화',
    route: ['신도림역 문화철도 959', '구로기적의도서관', '오페라하우스', '도림천 생태수변산책로'],
    desc: '신도림역 문화창작 공간과 어린이 특화도서관, 야외 무대를 잇는 도심형 힐링 코스입니다.',
    lat: 37.5085,
    lng: 126.8912
  }
];

// 구로구 주요 소식 & 축제
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
    desc: '청년 취·창업 멘토링, 힐링 워크숍, 문화살롱 토크콘서트 진행.',
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

  // 로컬 등록 프로그램
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
      locationDetail: '지하 1층 창작공작소',
      fee: '무료',
      contact: '02-2060-1318',
      description: '원목 도구를 직접 다루며 생활 소품을 제작하는 참여형 워크숍.',
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

  const [selectedDong, setSelectedDong] = useState<string>('구로구 전체');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // 모바일 전용: 목록 / 지도 토글 뷰 ('list' | 'map')
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

  // 현재 선택된 지도 핀 위치 (기본 구로구청 인근)
  const [activeItem, setActiveItem] = useState<{ name: string; lat: number; lng: number } | null>(null);

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [form, setForm] = useState<Partial<ProgramItem>>({});

  // 1. 구글 시트 실시간 데이터 가져오기 (fetch)
  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        setLoadingPlaces(true);
        // 구글 시트 CSV 내보내기 URL 호출
        const response = await fetch(SHEET_EXPORT_URL);
        if (!response.ok) throw new Error('Network error');
        const text = await response.text();
        
        // CSV 파싱
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const items: PlaceItem[] = [];

        // 1번째 줄은 헤더(id, name, category...)이므로 index 1부터 시작
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 8 && cols[1]) {
            items.push({
              id: cols[0] || `row-${i}`,
              name: cols[1],
              category: cols[2] || 'living_admin',
              subCategory: cols[3] || '거점기관',
              dong: cols[4] || '구로구',
              address: cols[5] || '',
              lat: parseFloat(cols[6]) || 37.4955,
              lng: parseFloat(cols[7]) || 126.8874,
              description: cols[8] || '',
              operatingHours: cols[9] || '운영시간 확인 필요',
              contact: cols[10] || ''
            });
          }
        }
        setPlaces(items);
      } catch (err) {
        console.warn('구글 시트 연동 대기 중 - 기본 데이터 로드:', err);
      } finally {
        setLoadingPlaces(false);
      }
    };

    fetchSheetData();

    // 로컬스토리지 프로그램 로드
    const saved = localStorage.getItem('guro_programs_v2');
    if (saved) {
      try {
        setPrograms(JSON.parse(saved));
      } catch (e) {
        // fallback
      }
    }
  }, []);

  // 필터링된 거점 장소
  const filteredPlaces = places.filter(p => {
    const matchDong = selectedDong === '구로구 전체' || p.dong.includes(selectedDong.replace('구로구 전체', ''));
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchQuery =
      !searchQuery ||
      p.name.includes(searchQuery) ||
      p.description.includes(searchQuery) ||
      p.subCategory.includes(searchQuery);
    return matchDong && matchCat && matchQuery;
  });

  // 필터링된 프로그램
  const filteredPrograms = programs.filter(p => {
    const matchDong = selectedDong === '구로구 전체' || p.locationDong === selectedDong;
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchQuery =
      !searchQuery ||
      p.title.includes(searchQuery) ||
      p.organization.includes(searchQuery) ||
      p.description.includes(searchQuery);
    return matchDong && matchCat && matchQuery;
  });

  // 지도 중심 계산
  const mapCenter = activeItem
    ? { lat: activeItem.lat, lng: activeItem.lng }
    : selectedDong !== '구로구 전체' && DONG_COORDS[selectedDong]
    ? DONG_COORDS[selectedDong]
    : { lat: 37.4954, lng: 126.8875 }; // 구로구청 중심

  const mapIframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 0.018}%2C${mapCenter.lat - 0.012}%2C${mapCenter.lng + 0.018}%2C${mapCenter.lat + 0.012}&layer=mapnik&marker=${mapCenter.lat}%2C${mapCenter.lng}`;

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
    setModalOpen(true);
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
      alert('프로그램명과 주최기관명을 입력해주세요.');
      return;
    }
    const dong = form.locationDong || '신도림동';
    const coords = DONG_COORDS[dong] || { lat: 37.4955, lng: 126.8874 };

    const newProg: ProgramItem = {
      id: `prog-${Date.now()}`,
      title: form.title || '',
      organization: form.organization || '',
      category: form.category || 'culture_learning',
      targetGroup: form.targetGroup || '청년·성인 전체',
      specificAge: form.specificAge || '',
      locationDong: dong,
      residencyReq: form.residencyReq || '구로구민 누구나',
      period: form.period || '일정 문의',
      locationDetail: form.locationDetail || '',
      fee: form.fee || '무료',
      contact: form.contact || '',
      description: form.description || '',
      lat: coords.lat,
      lng: coords.lng
    };

    const updated = [newProg, ...programs];
    setPrograms(updated);
    localStorage.setItem('guro_programs_v2', JSON.stringify(updated));
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* 1. 상단 공통 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentTab('places')}>
            <span className="text-xl font-black text-emerald-600">🌿 모두의마을 구로</span>
            <span className="hidden sm:inline-block text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
              실시간 시트 연동
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenRegister}
              className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
            >
              + 프로그램 등록
            </button>
          </div>
        </div>
      </header>

      {/* 2. 상단 탭 & 필터 바 */}
      <div className="bg-white border-b border-slate-200 flex-shrink-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto scrollbar-none py-2.5">
            <button
              onClick={() => setCurrentTab('places')}
              className={`text-xs sm:text-sm font-bold whitespace-nowrap pb-1 border-b-2 transition ${
                currentTab === 'places' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              🏛️ 구로 거점기관·시설 ({places.length})
            </button>
            <button
              onClick={() => setCurrentTab('programs')}
              className={`text-xs sm:text-sm font-bold whitespace-nowrap pb-1 border-b-2 transition ${
                currentTab === 'programs' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              📋 진행 프로그램 ({programs.length})
            </button>
            <button
              onClick={() => setCurrentTab('courses')}
              className={`text-xs sm:text-sm font-bold whitespace-nowrap pb-1 border-b-2 transition ${
                currentTab === 'courses' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              🚶 하루 추천코스
            </button>
            <button
              onClick={() => setCurrentTab('events')}
              className={`text-xs sm:text-sm font-bold whitespace-nowrap pb-1 border-b-2 transition ${
                currentTab === 'events' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              🎉 축제·행사 소식
            </button>
          </div>

          {/* 검색 및 동네 선택 필터 */}
          <div className="py-2.5 border-t border-slate-100 flex flex-col sm:flex-row gap-2 justify-between items-center">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              {GURO_DONGS.map(dong => (
                <button
                  key={dong}
                  onClick={() => {
                    setSelectedDong(dong);
                    setActiveItem(null);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition ${
                    selectedDong === dong
                      ? 'bg-slate-800 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {dong}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="검색어 입력..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. 메인 콘텐츠: PC 분할 레이아웃 (좌: 목록 45% / 우: 고정 지도 55%) & 모바일 토글 */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* [좌측 / 모바일 목록 영역] */}
        <div
          className={`lg:w-5/12 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${
            mobileView === 'map' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* 목록 상단 카테고리 필터 */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              {currentTab === 'places' && `등록 시설 ${filteredPlaces.length}곳`}
              {currentTab === 'programs' && `진행 프로그램 ${filteredPrograms.length}개`}
              {currentTab === 'courses' && '테마 추천 코스 3선'}
              {currentTab === 'events' && '구로구 대표 축제'}
            </span>

            {/* 카테고리 셀렉터 */}
            {(currentTab === 'places' || currentTab === 'programs') && (
              <div className="flex gap-1 text-xs">
                {(['all', 'relaxation', 'culture_learning', 'living_admin', 'welfare_care'] as CategoryType[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-md font-medium transition ${
                      selectedCategory === cat ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 스크롤 가능한 카드 리스트 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[calc(100vh-220px)]">
            {/* 1) 시설/거점 목록 */}
            {currentTab === 'places' && (
              <>
                {loadingPlaces ? (
                  <div className="p-8 text-center text-xs text-slate-400">구글 시트 데이터를 불러오는 중입니다...</div>
                ) : filteredPlaces.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">조건에 맞는 장소가 없습니다.</div>
                ) : (
                  filteredPlaces.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setActiveItem({ name: p.name, lat: p.lat, lng: p.lng });
                        if (window.innerWidth < 1024) setMobileView('map');
                      }}
                      className={`p-4 rounded-xl border transition cursor-pointer hover:shadow-md ${
                        activeItem?.name === p.name ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {p.subCategory}
                        </span>
                        <span className="text-xs text-slate-400">📍 {p.dong}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{p.name}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-2">{p.description}</p>
                      <div className="border-t border-slate-100 pt-2 text-xs text-slate-500 space-y-0.5">
                        <p>🕒 {p.operatingHours}</p>
                        <p>📞 {p.contact || '연락처 미등록'}</p>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* 2) 프로그램 목록 */}
            {currentTab === 'programs' && (
              <>
                {filteredPrograms.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">등록된 프로그램이 없습니다.</div>
                ) : (
                  filteredPrograms.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setActiveItem({ name: p.title, lat: p.lat, lng: p.lng });
                        if (window.innerWidth < 1024) setMobileView('map');
                      }}
                      className={`p-4 rounded-xl border transition cursor-pointer hover:shadow-md ${
                        activeItem?.name === p.title ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          {p.targetGroup}
                        </span>
                        <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          {p.residencyReq}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{p.title}</h4>
                      <p className="text-xs text-slate-500 mb-1">{p.organization}</p>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-2">{p.description}</p>
                      <div className="border-t border-slate-100 pt-2 text-xs text-slate-500 space-y-0.5">
                        <p>🕒 {p.period}</p>
                        <p>🏛️ {p.locationDetail || `${p.locationDong} 소재`}</p>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* 3) 추천 코스 */}
            {currentTab === 'courses' && (
              <>
                {GURO_COURSES.map(course => (
                  <div
                    key={course.id}
                    onClick={() => {
                      setActiveItem({ name: course.title, lat: course.lat, lng: course.lng });
                      if (window.innerWidth < 1024) setMobileView('map');
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer hover:shadow-md ${
                      activeItem?.name === course.title ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                      {course.theme}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-2 mb-1">{course.title}</h4>
                    <p className="text-xs text-emerald-700 font-semibold mb-2">동선: {course.route.join(' ➔ ')}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{course.desc}</p>
                  </div>
                ))}
              </>
            )}

            {/* 4) 축제 및 소식 */}
            {currentTab === 'events' && (
              <>
                {GURO_EVENTS.map(ev => (
                  <div key={ev.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
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

        {/* [우측 / 모바일 지도 뷰 영역] */}
        <div
          className={`lg:w-7/12 flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] lg:min-h-0 ${
            mobileView === 'list' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">📍 지도 탐색</span>
              {activeItem ? (
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  선택: {activeItem.name}
                </span>
              ) : (
                <span className="text-xs text-slate-400">목록 카드를 누르면 해당 위치로 이동합니다</span>
              )}
            </div>
            {activeItem && (
              <button
                onClick={() => setActiveItem(null)}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                중심 리셋
              </button>
            )}
          </div>

          <div className="flex-1 w-full relative min-h-[350px]">
            <iframe
              title="Guro Map"
              className="w-full h-full border-0 absolute inset-0"
              src={mapIframeUrl}
            />
          </div>
        </div>
      </div>

      {/* 4. 모바일 전용 하단 고정 플로팅 토글 바 (스마트폰에서만 표시) */}
      <div className="lg:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-slate-900/90 text-white backdrop-blur px-1.5 py-1.5 rounded-full shadow-xl flex gap-1 border border-slate-700">
          <button
            onClick={() => setMobileView('list')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition ${
              mobileView === 'list' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            📋 목록 보기
          </button>
          <button
            onClick={() => setMobileView('map')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition ${
              mobileView === 'map' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            🗺️ 지도 보기
          </button>
        </div>
      </div>

      {/* 5. 기관 프로그램 등록 모달 (PIN: guro2026) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
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
                    onClick={() => setModalOpen(false)}
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
                      {GURO_DONGS.filter(d => d !== '구로구 전체').map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">참여 대상</label>
                    <input
                      type="text"
                      placeholder="예: 청년, 만 19~39세"
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
                    onClick={() => setModalOpen(false)}
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
