import React, { useState, useEffect } from 'react';

type CategoryType = 'all' | 'culture_learning' | 'welfare_care' | 'relaxation' | 'living_admin';

interface Program {
  id: string;
  title: string;
  organization: string;
  category: 'culture_learning' | 'welfare_care' | 'relaxation' | 'living_admin';
  targetGroup: '청년' | '성인' | '청년·성인 전체';
  specificAge?: string;
  locationDong: string;
  residencyReq: '구로구민 누구나' | '해당 동 주민 우선/제한' | '지역 무관 (누구나)';
  period: string;
  locationDetail: string;
  fee: string;
  contact: string;
  description: string;
  adminName?: string;
  adminContact?: string;
}

const GURO_DONGS = [
  '구로구 전체', '신도림동', '구로1동', '구로2동', '구로3동', '구로4동', '구로5동',
  '가리봉동', '고척1동', '고척2동', '개봉1동', '개봉2동', '개봉3동',
  '오류1동', '오류2동', '항동', '수궁동'
];

const INITIAL_PROGRAMS: Program[] = [
  {
    id: 'prog-1',
    title: '주말 뚝딱뚝딱 목공 메이커 교실',
    organization: '구립천왕동청소년문화의집',
    category: 'culture_learning',
    targetGroup: '청년·성인 전체',
    specificAge: '만 19세 이상 구민',
    locationDong: '오류2동',
    residencyReq: '구로구민 누구나',
    period: '매주 토 10:00 ~ 12:00',
    locationDetail: '지하 1층 창작공작소',
    fee: '무료',
    contact: '02-2060-1318',
    description: '원목 도구를 직접 다루며 생활 소품을 제작하는 참여형 메이커 워크숍입니다.'
  },
  {
    id: 'prog-2',
    title: '청년 마음돌봄 힐링 티테라피',
    organization: '구로청년이룸',
    category: 'relaxation',
    targetGroup: '청년',
    specificAge: '만 19세 ~ 39세',
    locationDong: '오류1동',
    residencyReq: '구로구민 누구나',
    period: '매주 화 저녁 7시',
    locationDetail: '청년이룸 다목적실',
    fee: '무료',
    contact: '070-4963-9991',
    description: '사회초년생과 청년들을 위한 저녁 힐링 티 블렌딩 및 스트레스 완화 모임.'
  }
];

const STORAGE_KEY = 'everyone_village_guro_programs';

export default function App() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedDong, setSelectedDong] = useState<string>('구로구 전체');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [form, setForm] = useState<Partial<Program>>({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPrograms(JSON.parse(saved));
      } catch (e) {
        setPrograms(INITIAL_PROGRAMS);
      }
    } else {
      setPrograms(INITIAL_PROGRAMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROGRAMS));
    }
  }, []);

  const handleOpenRegister = () => {
    setEditingProgram(null);
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

  const handleOpenEdit = (prog: Program) => {
    setEditingProgram(prog);
    setForm(prog);
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.organization) {
      alert('프로그램명과 주최기관명을 입력해주세요.');
      return;
    }

    const newProg: Program = {
      id: editingProgram ? editingProgram.id : `prog-${Date.now()}`,
      title: form.title || '',
      organization: form.organization || '',
      category: form.category || 'culture_learning',
      targetGroup: form.targetGroup || '청년·성인 전체',
      specificAge: form.specificAge || '',
      locationDong: form.locationDong || '신도림동',
      residencyReq: form.residencyReq || '구로구민 누구나',
      period: form.period || '일정 확인 필요',
      locationDetail: form.locationDetail || '',
      fee: form.fee || '무료',
      contact: form.contact || '',
      description: form.description || '',
      adminName: form.adminName || '',
      adminContact: form.adminContact || ''
    };

    let updated: Program[];
    if (editingProgram) {
      updated = programs.map(p => p.id === editingProgram.id ? newProg : p);
    } else {
      updated = [newProg, ...programs];
    }

    setPrograms(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const pin = prompt('프로그램 삭제를 위해 기관 PIN 코드를 입력하세요:');
    if (pin === 'guro2026') {
      if (confirm('해당 프로그램을 삭제하시겠습니까?')) {
        const updated = programs.filter(p => p.id !== id);
        setPrograms(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } else if (pin !== null) {
      alert('보안 코드가 일치하지 않습니다.');
    }
  };

  const filteredPrograms = programs.filter(p => {
    const matchDong = selectedDong === '구로구 전체' || p.locationDong === selectedDong;
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchQuery = !searchQuery || 
      p.title.includes(searchQuery) || 
      p.organization.includes(searchQuery) || 
      (p.description && p.description.includes(searchQuery));
    return matchDong && matchCat && matchQuery;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-emerald-600">🌿 모두의마을 구로</span>
          </div>
          <button
            onClick={handleOpenRegister}
            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            + 프로그램 등록
          </button>
        </div>
      </header>

      <section className="bg-gradient-to-b from-emerald-700 to-emerald-800 text-white px-4 py-10 shadow-inner">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <p className="text-xs uppercase tracking-widest text-emerald-200 font-semibold">Guro Community Platform</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
            하나의 프로그램에서,<br className="sm:hidden" /> 우리 동네의 하루로
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100">구로구 관내 복지·문화·힐링 프로그램을 한눈에 만나보세요.</p>
          
          <div className="pt-2 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="프로그램명 또는 기관 이름으로 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 mt-6 space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {GURO_DONGS.map(dong => (
            <button
              key={dong}
              onClick={() => setSelectedDong(dong)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                selectedDong === dong
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {dong}
            </button>
          ))}
        </div>

        <div className="flex gap-2 border-b border-slate-200 pb-2">
          {[
            { id: 'all', label: '전체' },
            { id: 'culture_learning', label: '문화·학습' },
            { id: 'relaxation', label: '휴식·힐링' },
            { id: 'welfare_care', label: '복지·돌봄' },
            { id: 'living_admin', label: '생활·행정' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as CategoryType)}
              className={`text-xs font-semibold pb-1.5 px-2 transition border-b-2 ${
                selectedCategory === tab.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-slate-700">
            신청 가능한 프로그램 <span className="text-emerald-600 font-extrabold">{filteredPrograms.length}</span>개
          </h2>
        </div>

        {filteredPrograms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-400 text-sm">해당 조건에 맞는 프로그램이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPrograms.map(p => (
              <div
                key={p.id}
                className="relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="text-xs font-medium text-slate-400 hover:text-emerald-600"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-xs font-medium text-slate-400 hover:text-red-500"
                  >
                    삭제
                  </button>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                      {p.targetGroup} {p.specificAge ? `· ${p.specificAge}` : ''}
                    </span>
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      📍 {p.locationDong}
                    </span>
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                      {p.residencyReq}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug mb-1 pr-12">{p.title}</h3>
                  <p className="text-xs text-slate-500 mb-3">{p.organization}</p>
                  
                  {p.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">{p.description}</p>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-1 text-xs text-slate-600">
                  <p>🕒 {p.period}</p>
                  <p>🏛️ {p.locationDetail || `${p.locationDong} 소재`}</p>
                  <p>💰 {p.fee}</p>

                  {p.contact && (
                    <div className="pt-2">
                      <a
                        href={p.contact.startsWith('http') ? p.contact : `tel:${p.contact}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full text-center rounded-xl bg-emerald-50 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                      >
                        신청 및 상세 문의
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {!pinVerified ? (
              <form onSubmit={handleVerifyPin} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">기관 담당자 보안 인증</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  프로그램 {editingProgram ? '수정' : '신규 등록'}을 위해 기관 공통 PIN 코드를 입력해주세요.
                </p>
                <input
                  type="password"
                  placeholder="보안 코드 (guro2026)"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-emerald-600 focus:outline-none"
                  autoFocus
                />
                {pinError && <p className="text-xs text-red-500">인증 코드가 올바르지 않습니다.</p>}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-1/2 rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-600 hover:bg-slate-200"
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
              <form onSubmit={handleSave} className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">
                    프로그램 {editingProgram ? '수정하기' : '등록하기'}
                  </h3>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">인증됨</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">프로그램/행사명 *</label>
                  <input
                    type="text"
                    required
                    value={form.title || ''}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">주최/운영 기관명 *</label>
                  <input
                    type="text"
                    required
                    value={form.organization || ''}
                    onChange={e => setForm({ ...form, organization: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">참여 대상 *</label>
                    <select
                      value={form.targetGroup}
                      onChange={e => setForm({ ...form, targetGroup: e.target.value as any })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                    >
                      <option value="청년">청년</option>
                      <option value="성인">성인</option>
                      <option value="청년·성인 전체">청년·성인 전체</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">세부 연령 (선택)</label>
                    <input
                      type="text"
                      placeholder="예: 만 19~39세"
                      value={form.specificAge || ''}
                      onChange={e => setForm({ ...form, specificAge: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">진행 장소(동) *</label>
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">참여 가능 거주지 *</label>
                    <select
                      value={form.residencyReq}
                      onChange={e => setForm({ ...form, residencyReq: e.target.value as any })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                    >
                      <option value="구로구민 누구나">구로구민 누구나</option>
                      <option value="해당 동 주민 우선/제한">해당 동 주민 우선/제한</option>
                      <option value="지역 무관 (누구나)">지역 무관 (누구나)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">일시/기간</label>
                    <input
                      type="text"
                      placeholder="예: 매주 수 14:00"
                      value={form.period || ''}
                      onChange={e => setForm({ ...form, period: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">세부 장소</label>
                    <input
                      type="text"
                      placeholder="예: 2층 배움터"
                      value={form.locationDetail || ''}
                      onChange={e => setForm({ ...form, locationDetail: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">신청 링크 또는 문의 연락처</label>
                  <input
                    type="text"
                    placeholder="https://... 또는 02-..."
                    value={form.contact || ''}
                    onChange={e => setForm({ ...form, contact: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">프로그램 한 줄 소개</label>
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
                    className="w-1/2 rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-600 hover:bg-slate-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    {editingProgram ? '수정 완료' : '등록 완료'}
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
