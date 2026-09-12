/* ╔══════════════════════════════════════════════════════════════╗
   ║  ★ 바람나무숲 앱 설정 — 여기서 내용을 직접 수정하세요 ★      ║
   ╚══════════════════════════════════════════════════════════════╝ */
const CONFIG = {

  /* ── 사이트 기본 정보 ── */
  siteName:    "바람나무숲",
  siteSubtitle:"청소년을 위한 교육연구소",
  tagline:     "바람처럼, 나무같이, 행복한 교육공동체",

  /* ── 연락처 (여러 곳에 자동 반영됩니다) ── */
  contact: {
    phone:   "010-7207-9004",
    email:   "baram@baramnamu.net",
    address: "경기도 화성시 노각로 175, 1713호",
    hours:   "월~토 10:00 – 21:00",
    kakao:   "바람나무숲 채널",
    website: "sup365.kr"
  },

  /* ── 메뉴 이름 (사이드바·헤더에 자동 반영) ── */
  menus: {
    home:    "홈",
    daum:    "다움공부",
    academy: "인문학교실",
    consult: "교육상담",
    blog:    "칼럼·블로그",
    contact: "문의하기",
    faq:     "안내 & FAQ"
  },

  /* ── 홈 통계 수치
       ★ 구글 시트 연동 시: SHEET_ID를 실제 ID로 교체하면 자동 로딩됩니다
       ★ 시트 연동 전에는 아래 기본값이 표시됩니다 ── */
  stats: {
    programs: 3,   // 운영 프로그램 수
    notices:  2,   // 새 공지 수
    students: 12   // 등록 학생 수
  },

  /* ── 구글 시트 연동 설정 ──
       1. 구글 시트 → 파일 → 공유 → '링크가 있는 모든 사용자' 공개 설정
       2. 시트 URL의 /d/ 뒤 긴 문자열을 복사해 SHEET_ID에 붙여넣기
       3. 시트 첫 행: programs | notices | students (순서대로)
       ※ sheetEnabled를 false로 두면 위 stats 기본값이 표시됩니다 ── */
  sheetEnabled: false,
  sheetId: "여기에_구글시트_ID를_붙여넣으세요",

  /* ── Formspree 이메일 폼 설정 ──
       1. https://formspree.io 에서 baram@baramnamu.net 으로 가입
       2. 새 폼 생성 후 받은 URL 마지막 코드를 아래에 입력
       ※ formspreeId가 비어있으면 토스트 메시지만 표시됩니다 ── */
  formspreeId: "",  // 예: "xpzgkqrb"
  scriptUrl: "https://script.google.com/macros/s/AKfycbw61j7k0ZZC2WDX_9SPD420dPjeA0tycXSl9St78FrPrKZw_yZZDXTtmTdahd4y1XM1/exec",

  /* ── 관리자 이메일 (Supabase 등록 이메일과 동일하게) ── */
  adminEmail: "baram@baramnamu.net"

};
/* ══════════════════════════════════════════════════════════════ */


/* ── CONFIG 값을 화면에 자동 적용 ── */
function applyConfig() {
  // 사이트 이름·부제
  document.querySelectorAll('.header-logo-name, .sidebar-logo-name')
    .forEach(el => el.textContent = CONFIG.siteName);
  document.querySelectorAll('.header-logo-sub, .sidebar-logo-sub')
    .forEach(el => el.textContent = CONFIG.siteSubtitle);

  // 연락처 자동 반영
  document.querySelectorAll('[data-contact]').forEach(el => {
    const key = el.dataset.contact;
    if (CONFIG.contact[key]) el.textContent = CONFIG.contact[key];
  });

  // 메뉴 이름
  document.querySelectorAll('[data-menu]').forEach(el => {
    const key = el.dataset.menu;
    if (CONFIG.menus[key]) el.textContent = CONFIG.menus[key];
  });

  // 통계 기본값 적용
  setStats(CONFIG.stats.programs, CONFIG.stats.notices, CONFIG.stats.students);
}

function setStats(programs, notices, students) {
  const p = document.getElementById('stat-programs');
  const n = document.getElementById('stat-notices');
  const s = document.getElementById('stat-students');
  const nb = document.getElementById('nav-badge-blog');
  if (p) p.textContent = programs;
  if (n) n.textContent = notices;
  if (s) s.textContent = students;
  if (nb) nb.textContent = notices;
}

/* ── 구글 시트에서 통계 로딩 ── */
async function loadSheetStats() {
  if (!CONFIG.sheetEnabled || !CONFIG.sheetId ||
      CONFIG.sheetId.includes('여기에')) return;
  try {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/export?format=csv&gid=0`;
    const res  = await fetch(url);
    const text = await res.text();
    const rows = text.trim().split('\n');
    if (rows.length >= 2) {
      const vals = rows[1].split(',');
      setStats(
        parseInt(vals[0]) || CONFIG.stats.programs,
        parseInt(vals[1]) || CONFIG.stats.notices,
        parseInt(vals[2]) || CONFIG.stats.students
      );
    }
  } catch(e) {
    console.log('시트 로딩 실패 — 기본값 사용');
  }
}

/* ── 문의 폼 설정 ── */
function setupForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  if (CONFIG.formspreeId) {
    form.action = `https://formspree.io/f/${CONFIG.formspreeId}`;
    form.method = 'POST';
    // 수신 이메일 hidden field
    const hid = document.createElement('input');
    hid.type = 'hidden'; hid.name = '_replyto';
    hid.value = CONFIG.contact.email;
    form.appendChild(hid);
    // 제목
    const sub = document.createElement('input');
    sub.type = 'hidden'; sub.name = '_subject';
    sub.value = '바람나무숲 앱 문의';
    form.appendChild(sub);
  } else {
    // Formspree 미설정 시 — 자체 제출 처리
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      showToast('문의가 접수되었습니다. 빠르게 연락드리겠습니다.');
      form.reset();
    });
  }
}

/* ── 날짜 ── */
const d = new Date();
const dateEl = document.getElementById('today-date');
if(dateEl) dateEl.textContent = d.getFullYear()+'년 '+(d.getMonth()+1)+'월 '+d.getDate()+'일 '+
  ['일','월','화','수','목','금','토'][d.getDay()]+'요일';

/* ── 블로그 초기 로드 ── */
loadBlogRSS();

/* ── 사이드바 ── */
const menuBtn = document.getElementById('menuBtn');
const sidebar  = document.getElementById('sidebar');
const overlay  = document.getElementById('overlay');
menuBtn.addEventListener('click', () => {
  const open = sidebar.classList.toggle('open');
  overlay.classList.toggle('open', open);
  menuBtn.classList.toggle('open', open);
});
function closeSidebar(){
  sidebar.classList.remove('open');
  overlay.classList.remove('open');
  menuBtn.classList.remove('open');
}

/* ── 페이지 전환 ── */

function showAcademyFullSchedule(){
  const weeks = window.academyWeeks || [];
  const container = document.getElementById('academy-full-week-list');
  if(!container) return;
  if(weeks.length === 0){
    container.innerHTML = '<div style="text-align:center;padding:24px;color:var(--sub);font-size:.85rem;">등록된 일정이 없습니다.</div>';
  } else {
    container.innerHTML = weeks.map((w,i)=>`
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">
        <div style="background:var(--teal);color:#fff;border-radius:8px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.85rem;flex-shrink:0;">${w.week}주</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:.88rem;font-weight:700;color:var(--navy);">${w.title||''}</div>
          <div style="font-size:.74rem;color:var(--sub);margin-top:2px;">${w.dateRange||''}</div>
        </div>
        <button onclick="openAcademyWeekDetail(${i})" style="background:none;border:none;color:var(--teal);cursor:pointer;padding:4px 8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      </div>
    `).join('');
  }
  document.getElementById('academy-full-schedule').style.display='block';
}

function openAcademyWeekDetail(idx){
  const w = (window.academyWeeks||[])[idx];
  if(!w) return;
  const el = document.getElementById('academy-week-detail-content');
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <div style="font-size:1rem;font-weight:800;color:var(--navy);">${w.week}주 · ${w.title||''}</div>
      <button onclick="document.getElementById('academy-week-detail').style.display='none'" style="background:none;border:none;font-size:1.4rem;color:var(--sub);cursor:pointer;">×</button>
    </div>
    ${w.dateRange?`<div style="font-size:.78rem;color:var(--sub);margin-bottom:12px;">${w.dateRange}</div>`:''}
    ${w.goal?`<div style="background:var(--gold-l);border-radius:10px;padding:12px 14px;margin-bottom:12px;"><div style="font-size:.75rem;font-weight:700;color:#9a5f00;margin-bottom:4px;">이번 주 목표</div><div style="font-size:.84rem;color:var(--navy);line-height:1.75;">${w.goal}</div></div>`:''}
    ${w.coreQuestion?`<div style="background:#f0f4ff;border-radius:10px;padding:12px 14px;margin-bottom:12px;font-size:.84rem;font-weight:600;color:var(--navy);line-height:1.6;">${w.coreQuestion}</div>`:''}
    ${w.content?`<div style="margin-bottom:12px;"><div style="font-size:.78rem;font-weight:700;color:var(--navy);margin-bottom:8px;">핵심 내용</div>${w.content}</div>`:''}
    ${w.pdfUrl?`<div style="margin-top:12px;"><a href="${w.pdfUrl}" target="_blank" style="display:flex;align-items:center;gap:8px;padding:12px 14px;background:#f5f5f8;border-radius:10px;color:var(--teal);font-size:.85rem;font-weight:600;text-decoration:none;">📄 자료 PDF 열기</a></div>`:''}
  `;
  document.getElementById('academy-week-detail').style.display='block';
}

window.academyWeeks = [];

function initAcademyMaterials(){
  const weeks = window.academyWeeks || [];
  const container = document.getElementById('academy-week-list');
  if(!container) return;
  if(weeks.length === 0){
    container.innerHTML = '<div style="text-align:center;padding:28px 16px;color:var(--sub);font-size:.85rem;">등록된 자료가 없습니다.</div>';
  } else {
    container.innerHTML = weeks.map((w,i)=>`
      <div style="display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid var(--border);cursor:pointer;" onclick="openAcademyWeekDetail(${i})">
        <div style="background:${w.isCurrentWeek?'var(--teal)':'#ddd'};color:#fff;border-radius:8px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.85rem;flex-shrink:0;">${w.week}주</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:.88rem;font-weight:700;color:var(--navy);display:flex;align-items:center;gap:6px;">${w.title||''}${w.isCurrentWeek?'<span style="font-size:.68rem;background:var(--teal);color:#fff;padding:2px 7px;border-radius:20px;">이번 주</span>':''}</div>
          <div style="font-size:.74rem;color:var(--sub);margin-top:2px;">${w.dateRange||''}</div>
        </div>
        <button onclick="event.stopPropagation();openAcademyWriting(${i})" style="background:none;border:1.5px solid var(--border);border-radius:8px;color:var(--sub);cursor:pointer;padding:6px 8px;flex-shrink:0;" title="생각 쓰기">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      </div>
    `).join('');
  }
}

function openAcademyWriting(idx){
  const w = (window.academyWeeks||[])[idx];
  if(!w) return;
  showToast('준비 중입니다');
}
function goPage(id, navEl){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const target = document.getElementById('page-'+id);
  if(target) target.classList.add('active');
  if(id==='blog'){ loadBlogPosts('all'); }
  if(id==='daum'){ loadDaumCourses(); }
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  if(navEl) navEl.classList.add('active');
  window.scrollTo(0,0);
  closeSidebar();
  // 플로팅 신청 버튼 — daum/consult 페이지에서만 표시
  const floatBtn = document.getElementById('float-apply-btn');
  if(floatBtn){
    const showPages = ['consult'];
    const labels = {consult:'💬 상담 신청'};
    if(showPages.includes(id)){
      floatBtn.textContent = labels[id] || '✏️ 신청하기';
      floatBtn.dataset.page = id;
      floatBtn.classList.add('visible');
    } else {
      floatBtn.classList.remove('visible');
    }
  }
}

/* ── 신청 모달 열기/닫기 ── */
function openApplyModal(){
  const page = document.getElementById('float-apply-btn')?.dataset.page;
  const modalId = page === 'consult' ? 'modal-consult-apply' : 'modal-daum-apply';
  document.getElementById(modalId)?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeApplyModal(id){
  document.getElementById(id)?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── 상담 유형 카드 선택 ── */
function selectConsultType(el){
  document.querySelectorAll('.type-select-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  const type = el.dataset.type;
  // 신청 모달의 select 자동 선택
  const sel = document.getElementById('consult-type');
  if(sel) sel.value = type;
  // 0.25초 후 신청 모달 열기
  setTimeout(() => openApplyModal(), 280);
}

/* ── 칩 탭 ── */
/* ── 인문학교실 탭 ── */
function setAcademyTab(el, tabId) {
  document.getElementById('academy-tabs').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.academy-tab').forEach(t => t.style.display = 'none');
  const tab = document.getElementById('academy-' + tabId);
  if (tab) tab.style.display = 'block';
}

/* ── 다움공부 탭 ── */
function setConsultTab(el, tabId) {
  document.getElementById('consult-tabs').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.consult-tab').forEach(t => t.style.display = 'none');
  const tab = document.getElementById('consult-' + tabId);
  if (tab) tab.style.display = 'block';
}

function setBlogTab(el, tabId) {
  document.getElementById('blog-tabs').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.blog-tab').forEach(t => t.style.display = 'none');
  const tab = document.getElementById('blog-' + tabId);
  if (tab) tab.style.display = 'block';
  // 카테고리별 글 동적 로딩
  const catMap = {all:'all', life:'삶', book:'책', edu:'교육단상'};
  loadBlogPosts(catMap[tabId] || 'all');
}



function scrollToDaumApply() {
  const el = document.getElementById('daum-apply-section');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setDaumTab(el, tabId) {
  document.getElementById('daum-tabs').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.daum-tab').forEach(t => t.style.display = 'none');
  const tab = document.getElementById('daum-' + tabId);
  if (tab) tab.style.display = 'block';
}

function setChip(el){
  el.closest('.chip-tabs').querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
}

/* ── 바람나무숲은? 탭 ── */
function setAboutTab(el, tabId){
  el.closest('.chip-tabs').querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.about-tab').forEach(t=>t.style.display='none');
  const tab = document.getElementById('about-'+tabId);
  if(tab) tab.style.display='block';
}

/* ── 블로그 RSS ── */
function loadBlogRSS(){
  const loading = document.getElementById('blog-loading');
  const list = document.getElementById('blog-list');
  const errorDiv = document.getElementById('blog-error');
  if(loading) loading.style.display='block';
  if(list) list.style.display='none';
  if(errorDiv) errorDiv.style.display='none';

  const rssUrl = 'https://sup365.kr/rss';
  const apiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl) + '&count=10';
  fetch(apiUrl)
    .then(r=>r.json())
    .then(data=>{
      if(!list) return;
      if(data.status==='ok' && data.items && data.items.length > 0){
        list.innerHTML = data.items.map(item=>{
          const date = new Date(item.pubDate).toLocaleDateString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).replace(/\. /g,'.').replace(/\.$/,'');
          const excerpt = (item.description||'').replace(/<[^>]+>/g,'').substring(0,80);
          return `<div class="blog-card" onclick="window.open('${item.link}','_blank')">
            <div class="blog-meta"><span class="blog-cat">블로그</span><span>${date}</span></div>
            <div class="blog-title">${item.title}</div>
            <div class="blog-excerpt">${excerpt}${excerpt.length>=80?'…':''}</div>
          </div>`;
        }).join('');
        if(loading) loading.style.display='none';
        list.style.display='block';
      } else {
        throw new Error('no items');
      }
    })
    .catch(()=>{
      if(loading) loading.style.display='none';
      if(errorDiv) errorDiv.style.display='block';
    });
}


/* ── FAQ ── */
function toggleFaq(el){ el.classList.toggle('open'); }

/* ── 토스트 ── */
let toastTimer;

/* ── 인문학교실 참여 신청 ── */
async function submitConsultApply() {
  const name  = (document.getElementById('consult-name')?.value || '').trim();
  const phone = (document.getElementById('consult-phone')?.value || '').trim();
  const child = (document.getElementById('consult-child')?.value || '').trim();
  const type  = document.getElementById('consult-type')?.value || '';
  const memo  = (document.getElementById('consult-memo')?.value || '').trim();
  if (!name || !phone) { showToast('이름과 연락처를 입력해주세요.'); return; }
  if (!memo) { showToast('상담 희망 내용을 입력해주세요.'); return; }
  const fields = ['consult-name','consult-phone','consult-child','consult-type','consult-memo'];
  showToast('신청 중...');
  try {
    const { error } = await sb.from('consultations').insert({
      name, phone, child_name: child, consult_type: type, memo
    });
    if (error) throw error;
    closeApplyModal('modal-consult-apply');
    document.querySelectorAll('.type-select-card').forEach(c => c.classList.remove('selected'));
    showToast('✅ 상담 신청이 접수되었습니다! 1~2일 이내 연락드리겠습니다.');
    fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  } catch(e) { showToast('오류가 발생했습니다. 전화로 문의해주세요.'); }
}

async function submitContact() {
  const name  = (document.getElementById('contact-name')?.value || '').trim();
  const phone = (document.getElementById('contact-phone')?.value || '').trim();
  const type  = document.getElementById('contact-type')?.value || '';
  const memo  = (document.getElementById('contact-memo')?.value || '').trim();
  if (!name || !phone) { showToast('이름과 연락처를 입력해주세요.'); return; }
  if (!memo) { showToast('문의 내용을 입력해주세요.'); return; }
  const fields = ['contact-name','contact-phone','contact-type','contact-memo'];
  showToast('접수 중...');
  try {
    const { error } = await sb.from('contacts').insert({ name, phone, contact_type: type, memo });
    if (error) throw error;
    showToast('✅ 문의가 접수되었습니다! 1~2일 이내 답변드리겠습니다.');
    fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  } catch(e) { showToast('오류가 발생했습니다. 전화로 문의해주세요.'); }
}

async function submitDaumApply() {
  const name    = (document.getElementById('daum-name')?.value || '').trim();
  const phone   = (document.getElementById('daum-phone')?.value || '').trim();
  const school  = (document.getElementById('daum-school')?.value || '').trim();
  const subject = document.getElementById('daum-subject')?.value || '';
  const time    = document.getElementById('daum-time')?.value || '';
  const route   = document.getElementById('daum-route')?.value || '';
  const memo    = (document.getElementById('daum-memo')?.value || '').trim();

  if (!name || !phone) { showToast('학생 이름과 연락처를 입력해주세요.'); return; }
  if (!school) { showToast('학교/학년을 입력해주세요.'); return; }
  if (!memo) { showToast('현재 상황 또는 상담 요청 사항을 입력해주세요.'); return; }

  const fields = ['daum-name','daum-phone','daum-school','daum-subject','daum-time','daum-route','daum-memo'];
  showToast('신청 중...');
  try {
    const { error } = await sb.from('enrollments').insert({
      type: 'daum', student_name: name, phone, school,
      subject, preferred_time: time, route, memo
    });
    if (error) throw error;
    closeApplyModal('modal-daum-apply');
    showToast('✅ 신청이 접수되었습니다! 2일 이내 연락드리겠습니다.');
    fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  } catch(e) {
    showToast('오류가 발생했습니다. 전화로 문의해주세요.');
  }
}

async function submitApply() {
  const name   = (document.getElementById('apply-name')?.value || '').trim();
  const phone  = (document.getElementById('apply-phone')?.value || '').trim();
  const email  = (document.getElementById('apply-email')?.value || '').trim();
  const school = (document.getElementById('apply-school')?.value || '').trim();
  const route  = document.getElementById('apply-route')?.value || '';
  const intro  = (document.getElementById('apply-intro')?.value || '').trim();

  if (!name || !phone) { showToast('이름과 연락처를 입력해주세요.'); return; }
  if (!intro) { showToast('참여 동기를 입력해주세요.'); return; }

  const fields = ['apply-name','apply-phone','apply-email','apply-school','apply-route','apply-intro'];
  showToast('신청 중...');
  try {
    const { error } = await sb.from('academy_applies').insert({ name, phone, email, school, route, intro });
    if (error) throw error;
    showToast('✅ 신청이 접수되었습니다! 2일 이내 연락드리겠습니다.');
    fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  } catch(e) {
    showToast('오류가 발생했습니다. 전화로 문의해주세요.');
  }
}

/* ── 인문학교실 세미나일정·읽기자료 로드 ── */
async function renderSheetData() {
  if (!CONFIG.scriptUrl) return;
  try {
    const res  = await fetch(CONFIG.scriptUrl + '?type=schedule');
    const data = await res.json();

    if (data.schedule && data.schedule.length > 0) {
      const list = document.getElementById('academy-schedule-list');
      if (list) {
        list.innerHTML = data.schedule.map(item => `
          <div class="link-item">
            <div class="link-icon">🗓️</div>
            <div class="link-body">
              <div class="link-name">${item.title || ''}</div>
              <div class="link-sub">${item.date || ''} ${item.note ? '· ' + item.note : ''}</div>
            </div>
          </div>`).join('');
      }
    }

    if (data.materials && data.materials.length > 0) {
      const list = document.getElementById('academy-materials-list');
      if (list) {
        list.innerHTML = data.materials.map(item => `
          <div class="link-item" ${item.url ? `onclick="window.open('${item.url}','_blank')"` : ''} style="${item.url ? 'cursor:pointer' : ''}">
            <div class="link-icon">📄</div>
            <div class="link-body">
              <div class="link-name">${item.title || ''}</div>
              <div class="link-sub">${item.desc || ''}</div>
            </div>
            ${item.url ? '<span class="link-arrow">›</span>' : ''}
          </div>`).join('');
      }
    }
  } catch(e) {
    console.log('인문학교실 데이터 로딩 실패:', e);
  }
}

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2800);
}

/* ── 초기화 ── */
applyConfig();
loadSheetStats();
setupForm();
renderSheetData();

/* ════════════════════════════════════════════════════
   ★ SUPABASE & ADMIN SYSTEM
   ════════════════════════════════════════════════════ */

/* ── Supabase 초기화 ── */
const sb = window.supabase.createClient('https://rdkuqqrkxwqakllncyaq.supabase.co', 'sb_publishable_xlzcfl2PWvEjGY_SIb2O2Q_GJhtkhHy');

/* ── 관리자 상태 ── */
let isAdmin = false;
let _tapCnt = 0, _tapTimer = null, _noticeEditId = null, _blogEditId = null;

/* ── Admin Trigger: 로고 1.5초 꾹 누르기 ── */
let _longPressTimer = null;
function startAdminPress() {
  if (isAdmin) return;
  _longPressTimer = setTimeout(() => {
    openModal('modal-admin-login');
    setTimeout(() => document.getElementById('admin-pw')?.focus(), 300);
  }, 1500);
}
function cancelAdminPress() {
  if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; }
}

/* ── 모달 helpers ── */
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

/* ── 관리자 로그인 ── */
async function adminLogin() {
  const email = CONFIG.adminEmail;
  const pw    = document.getElementById('admin-pw')?.value || '';
  if (!pw) { showToast('비밀번호를 입력하세요'); return; }
  showToast('로그인 중...');
  const { data, error } = await sb.auth.signInWithPassword({ email, password: pw });
  if (error) {
    showToast('❌ ' + (error.message.includes('Invalid') ? '이메일 또는 비밀번호 오류' : error.message));
    return;
  }
  isAdmin = true;
  closeModal('modal-admin-login');
  document.getElementById('admin-email').value = '';
  document.getElementById('admin-pw').value = '';
  enterAdminMode();
  showToast('✅ 관리자 모드 시작');
}

function enterAdminMode() {
  document.getElementById('sidebar-user-nav').style.display = 'none';
  document.getElementById('sidebar-admin-nav').style.display = 'block';
  document.getElementById('admin-badge').style.display = 'flex';
  goAdminPage('notices', document.querySelector('.admin-nav-item'));
  closeSidebar();
  // URL을 /admin으로 변경 (새로고침 없이)
  if (window.location.pathname !== '/admin') {
    history.replaceState(null, '', '/admin');
  }
}

async function adminLogout() {
  await sb.auth.signOut();
  isAdmin = false;
  document.getElementById('sidebar-user-nav').style.display = 'block';
  document.getElementById('sidebar-admin-nav').style.display = 'none';
  document.getElementById('admin-badge').style.display = 'none';
  document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
  history.replaceState(null, '', '/');
  goPage('home', null);
  showToast('로그아웃 되었습니다');
}

/* ── 관리자 페이지 이동 ── */
function goAdminPage(pageId, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById('admin-' + pageId);
  if (page) page.classList.add('active');
  if (el) el.classList.add('active');
  const loaders = {
    'notices': loadAdminNotices,
    'enrollments': loadAdminEnrollments,
    'consultations': loadAdminConsultations,
    'academy-applies': loadAdminAcademy,
    'contacts': loadAdminContacts,
    'courses': loadAdminCourses,
    'blog': loadAdminBlog,
  };
  if (loaders[pageId]) loaders[pageId]();
  closeSidebar();
}

/* ── 날짜 포맷 ── */
function fmtDate(ts) {
  const d = new Date(ts);
  return `${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}

/* ── 홈 공지사항 동적 로드 ── */
async function loadHomeNotices() {
  const container = document.getElementById('notice-list-home');
  if (!container) return;
  try {
    const { data } = await sb.from('notices')
      .select('*').order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false }).limit(5);
    if (!data?.length) return;
    // 공지 데이터를 임시 저장 (클릭 시 참조)
    window._homeNotices = data;
    container.innerHTML = data.map((n,i) => `
      <div class="notice-item${n.content ? ' has-content' : ''}" ${n.content ? `onclick="showNoticeDetail(${i})"` : ''}>
        <span class="notice-dot${n.is_new ? ' new' : ''}"></span>
        <span class="notice-text">${n.is_pinned ? '📌 ' : ''}${n.title}${n.content ? ' <span style="font-size:.7rem;color:var(--teal);">▶</span>' : ''}</span>
        <span class="notice-date">${n.display_date || fmtDate(n.created_at)}</span>
      </div>`).join('');
  } catch(e) { /* 오프라인 시 기존 정적 공지 유지 */ }
}

/* ── 홈 바람생각 최근 3개 로딩 ── */
async function loadHomeBlog() {
  const list = document.getElementById('home-blog-list');
  if (!list) return;
  try {
    const { data } = await sb.from('blog_posts')
      .select('id,title,category,created_at,tags')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3);
    if (!data?.length) {
      list.innerHTML = '<div style="padding:20px 16px;text-align:center;color:var(--sub);font-size:.82rem;">아직 작성된 글이 없습니다.</div>';
      return;
    }
    list.innerHTML = data.map(p => `
      <div class="blog-card" onclick="goPage('blog',null)">
        <div class="blog-meta">
          <span class="blog-cat">${p.category || ''}</span>
          <span>${fmtDate(p.created_at)}</span>
        </div>
        <div class="blog-title">${p.title}</div>
        ${p.tags?.length ? `<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px;">${p.tags.map(t=>`<span style="font-size:.68rem;background:#e6f7f6;color:var(--teal);padding:2px 7px;border-radius:8px;">#${t}</span>`).join('')}</div>` : ''}
      </div>`).join('');
  } catch(e) { list.innerHTML = ''; }
}

/* ── 바람생각 페이지 글 로딩 ── */
async function loadBlogPosts(category) {
  const tabs = {all:'all', 삶:'life', 책:'book', 교육단상:'edu'};
  const listIds = {all:'blog-list-all', life:'blog-list-life', book:'blog-list-book', edu:'blog-list-edu'};
  const targetId = tabs[category] || 'all';
  const listEl = document.getElementById(listIds[targetId]);
  if (!listEl || listEl.dataset.loaded) return;
  listEl.innerHTML = '<div style="padding:20px 16px;text-align:center;color:var(--sub);font-size:.82rem;">불러오는 중...</div>';
  try {
    let query = sb.from('blog_posts').select('*').eq('published', true).order('created_at', { ascending: false });
    if (category !== 'all') query = query.eq('category', category);
    const { data } = await query;
    if (!data?.length) {
      listEl.innerHTML = '<div style="padding:28px 16px;text-align:center;color:var(--sub);font-size:.85rem;">작성된 글이 없습니다.</div>';
      return;
    }
    listEl.innerHTML = data.map(p => `
      <div class="blog-card" style="margin:0 16px 12px;cursor:pointer;" onclick="openBlogPost('${p.id}')">
        <div class="blog-meta">
          <span class="blog-cat">${p.category || ''}</span>
          <span>${fmtDate(p.created_at)}</span>
        </div>
        <div class="blog-title">${p.title}</div>
        ${p.content ? `<div class="blog-excerpt">${p.content.substring(0,80)}${p.content.length>80?'…':''}</div>` : ''}
        ${p.tags?.length ? `<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px;">${p.tags.map(t=>`<span style="font-size:.68rem;background:#e6f7f6;color:var(--teal);padding:2px 7px;border-radius:8px;">#${t}</span>`).join('')}</div>` : ''}
      </div>`).join('');
    listEl.dataset.loaded = '1';
  } catch(e) { listEl.innerHTML = ''; }
}

function openBlogPost(id) {
  // 글 상세보기 모달 (추후 확장 가능)
  goPage('blog', null);
}

/* ── 다움공부 수업안내 동적 로딩 ── */
async function loadDaumCourses() {
  const list = document.getElementById('daum-course-list');
  if (!list) return;
  try {
    const { data, error } = await sb.from('courses')
      .select('*').order('level_order', { ascending: true }).order('created_at', { ascending: true });
    if (error || !data?.length) {
      list.innerHTML = '<div style="font-size:.82rem;color:var(--sub);padding:8px 0;">등록된 수업 정보가 없습니다.</div>';
      return;
    }
    const rowStyle = 'display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);font-size:.82rem;';
    const labelStyle = 'color:var(--sub);flex-shrink:0;width:42px;font-weight:600;';
    const valueStyle = 'color:var(--navy);flex:1;line-height:1.6;';
    list.innerHTML = data.map(c => `
      <div style="margin-bottom:4px;">
        <div style="${rowStyle}">
          <span style="${labelStyle}">교과</span>
          <span style="${valueStyle};font-weight:700;">${c.name}</span>
        </div>
        ${c.target ? `<div style="${rowStyle}"><span style="${labelStyle}">대상</span><span style="${valueStyle}">${c.target}</span></div>` : ''}
        ${c.description ? `<div style="${rowStyle}border-bottom:2px solid var(--teal);margin-bottom:8px;"><span style="${labelStyle}">내용</span><span style="${valueStyle}">${c.description}</span></div>` : '<div style="border-bottom:2px solid var(--teal);margin-bottom:8px;"></div>'}
      </div>`).join('');
  } catch(e) { /* 오프라인 시 무시 */ }
}

/* ── 공지 상세보기 (비관리자용) ── */
function showNoticeDetail(idx) {
  const n = (window._homeNotices || [])[idx];
  if (!n) return;
  document.getElementById('notice-detail-title').textContent = (n.is_pinned ? '📌 ' : '') + n.title;
  document.getElementById('notice-detail-content').textContent = n.content || '';
  document.getElementById('notice-detail-date').textContent = n.display_date || fmtDate(n.created_at);
  openModal('modal-notice-detail');
}

/* ── 공지사항 관리 ── */
async function loadAdminNotices() {
  const list = document.getElementById('admin-notice-list');
  if (!list) return;
  list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--sub);font-size:.85rem;">불러오는 중...</div>';
  const { data, error } = await sb.from('notices')
    .select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
  if (error) { list.innerHTML = `<div style="color:#dc2626;padding:12px;">${error.message}</div>`; return; }
  if (!data.length) { list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--sub);">등록된 공지가 없습니다</div>'; return; }
  list.innerHTML = data.map(n => `
    <div class="nadm-item">
      ${n.is_pinned ? '<span class="nadm-pin">📌 고정</span>' : ''}
      <div class="nadm-title">${n.is_new ? '🆕 ' : ''}${n.title}</div>
      ${n.content ? `<div style="font-size:.78rem;color:var(--sub);margin-top:4px;line-height:1.6;">${n.content}</div>` : ''}
      <div class="nadm-date">${n.display_date || fmtDate(n.created_at)}</div>
      <div class="nadm-actions">
        <button class="btn-sm btn-edit" onclick='editNotice(${JSON.stringify(n)})'>수정</button>
        <button class="btn-sm btn-del" onclick="deleteNotice('${n.id}')">삭제</button>
      </div>
    </div>`).join('');
}

function showNoticeForm() {
  _noticeEditId = null;
  document.getElementById('notice-modal-title').textContent = '새 공지 작성';
  document.getElementById('notice-edit-id').value = '';
  document.getElementById('notice-title-input').value = '';
  document.getElementById('notice-content-input').value = '';
  document.getElementById('notice-pinned').checked = false;
  document.getElementById('notice-is-new').checked = true;
  openModal('modal-notice');
  setTimeout(() => document.getElementById('notice-title-input')?.focus(), 300);
}

function editNotice(n) {
  _noticeEditId = n.id;
  document.getElementById('notice-modal-title').textContent = '공지 수정';
  document.getElementById('notice-title-input').value = n.title || '';
  document.getElementById('notice-content-input').value = n.content || '';
  document.getElementById('notice-pinned').checked = !!n.is_pinned;
  document.getElementById('notice-is-new').checked = !!n.is_new;
  openModal('modal-notice');
}

async function saveNotice() {
  const title = (document.getElementById('notice-title-input')?.value || '').trim();
  if (!title) { showToast('제목을 입력하세요'); return; }
  const payload = {
    title,
    content: (document.getElementById('notice-content-input')?.value || '').trim(),
    is_pinned: document.getElementById('notice-pinned')?.checked || false,
    is_new: document.getElementById('notice-is-new')?.checked !== false,
    display_date: fmtDate(new Date().toISOString()),
    updated_at: new Date().toISOString()
  };
  const { error } = _noticeEditId
    ? await sb.from('notices').update(payload).eq('id', _noticeEditId)
    : await sb.from('notices').insert(payload);
  if (error) { showToast('❌ ' + error.message); return; }
  closeModal('modal-notice');
  showToast('✅ 저장되었습니다');
  loadAdminNotices();
  loadHomeNotices();
}

async function deleteNotice(id) {
  if (!confirm('이 공지를 삭제하시겠습니까?')) return;
  const { error } = await sb.from('notices').delete().eq('id', id);
  if (error) { showToast('❌ ' + error.message); return; }
  showToast('삭제되었습니다');
  loadAdminNotices();
  loadHomeNotices();
}

/* ── 바람생각 관리 ── */
/* ── 수업안내(교과개설) 관리 ── */
async function loadAdminCourses() {
  const list = document.getElementById('admin-course-list');
  if (!list) return;
  list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--sub);font-size:.85rem;">불러오는 중...</div>';
  const { data, error } = await sb.from('courses')
    .select('*').order('level_order', { ascending: true }).order('created_at', { ascending: true });
  if (error) { list.innerHTML = `<div style="color:#dc2626;padding:12px;">${error.message}</div>`; return; }
  if (!data || !data.length) { list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--sub);">등록된 교과가 없습니다</div>'; return; }
  list.innerHTML = data.map(c => `
    <div class="nadm-item">
      <div style="font-size:.7rem;color:var(--teal);font-weight:700;margin-bottom:2px;">${c.level || ''}</div>
      <div class="nadm-title">${c.name}</div>
      ${c.target ? `<div style="font-size:.78rem;color:var(--sub);margin-top:2px;">대상: ${c.target}</div>` : ''}
      ${c.description ? `<div style="font-size:.78rem;color:var(--sub);margin-top:2px;line-height:1.6;">${c.description}</div>` : ''}
      <div class="nadm-actions">
        <button class="btn-sm btn-edit" onclick='editCourse(${JSON.stringify(c)})'>수정</button>
        <button class="btn-sm btn-del" onclick="deleteCourse('${c.id}')">삭제</button>
      </div>
    </div>`).join('');
}

let _courseEditId = null;
function showCourseForm() {
  _courseEditId = null;
  document.getElementById('course-modal-title').textContent = '새 교과 추가';
  document.getElementById('course-edit-id').value = '';
  document.getElementById('course-name-input').value = '';
  document.getElementById('course-target-input').value = '';
  document.getElementById('course-desc-input').value = '';
  document.getElementById('course-order-input').value = '0';
  openModal('modal-course');
  setTimeout(() => document.getElementById('course-name-input')?.focus(), 200);
}

function editCourse(c) {
  _courseEditId = c.id;
  document.getElementById('course-modal-title').textContent = '교과 수정';
  document.getElementById('course-edit-id').value = c.id;
  document.getElementById('course-name-input').value = c.name || '';
  document.getElementById('course-target-input').value = c.target || '';
  document.getElementById('course-desc-input').value = c.description || '';
  document.getElementById('course-order-input').value = c.level_order ?? 0;
  openModal('modal-course');
}

async function saveCourse() {
  const name = (document.getElementById('course-name-input')?.value || '').trim();
  const target = (document.getElementById('course-target-input')?.value || '').trim();
  const description = (document.getElementById('course-desc-input')?.value || '').trim();
  const level_order = parseInt(document.getElementById('course-order-input')?.value || '0');
  if (!name) { showToast('교과명을 입력하세요'); return; }
  showToast('저장 중...');
  let error;
  if (_courseEditId) {
    ({ error } = await sb.from('courses').update({ name, target, description, level_order }).eq('id', _courseEditId));
  } else {
    ({ error } = await sb.from('courses').insert({ name, target, description, level_order }));
  }
  if (error) { showToast('❌ ' + error.message); return; }
  closeModal('modal-course');
  showToast('✅ 저장되었습니다');
  loadAdminCourses();
  loadDaumCourses();
}

async function deleteCourse(id) {
  if (!confirm('이 교과를 삭제할까요?')) return;
  const { error } = await sb.from('courses').delete().eq('id', id);
  if (error) { showToast('❌ ' + error.message); return; }
  showToast('삭제되었습니다'); loadAdminCourses(); loadDaumCourses();
}

async function loadAdminBlog() {
  const list = document.getElementById('admin-blog-list');
  if (!list) return;
  list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--sub);">불러오는 중...</div>';
  const { data, error } = await sb.from('blog_posts').select('*').order('created_at', { ascending: false });
  if (error) { list.innerHTML = `<div style="color:#dc2626;padding:12px;">${error.message}</div>`; return; }
  if (!data.length) { list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--sub);">작성된 글이 없습니다</div>'; return; }
  list.innerHTML = data.map(p => `
    <div class="nadm-item">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div class="nadm-title">${p.title}</div>
        <span style="font-size:.65rem;background:${p.published?'var(--teal)':'#94a3b8'};color:#fff;padding:2px 7px;border-radius:4px;flex-shrink:0;">${p.published?'공개':'임시저장'}</span>
      </div>
      <div class="nadm-date">${p.category} · ${fmtDate(p.created_at)}</div>
      ${p.excerpt ? `<div style="font-size:.78rem;color:var(--sub);margin-top:3px;">${p.excerpt}</div>` : ''}
      <div class="nadm-actions">
        <button class="btn-sm btn-edit" onclick='editBlogPost(${JSON.stringify(p)})'>수정</button>
        <button class="btn-sm btn-del" onclick="deleteBlogPost('${p.id}')">삭제</button>
        <button class="btn-sm btn-confirm" onclick="togglePublish('${p.id}',${!p.published})">${p.published?'비공개':'공개'}</button>
      </div>
    </div>`).join('');
}

function showBlogForm() {
  _blogEditId = null;
  document.getElementById('blog-modal-title').textContent = '새 글 작성';
  document.getElementById('blog-title-input').value = '';
  document.getElementById('blog-category-input').value = '삶';
  document.getElementById('blog-content-input').value = '';
  document.getElementById('blog-tags-input').value = '';
  document.getElementById('blog-published').checked = false;
  openModal('modal-blog');
  setTimeout(() => document.getElementById('blog-title-input')?.focus(), 300);
}

function editBlogPost(p) {
  _blogEditId = p.id;
  document.getElementById('blog-modal-title').textContent = '글 수정';
  document.getElementById('blog-title-input').value = p.title || '';
  document.getElementById('blog-category-input').value = p.category || '삶';
  document.getElementById('blog-content-input').value = p.content || '';
  document.getElementById('blog-tags-input').value = (p.tags || []).join(', ');
  document.getElementById('blog-published').checked = !!p.published;
  openModal('modal-blog');
}

async function saveBlogPost() {
  const title = (document.getElementById('blog-title-input')?.value || '').trim();
  if (!title) { showToast('제목을 입력하세요'); return; }
  const payload = {
    title,
    category: document.getElementById('blog-category-input')?.value || '삶',
    tags: (document.getElementById('blog-tags-input')?.value || '').split(',').map(t=>t.trim()).filter(Boolean),
    content: (document.getElementById('blog-content-input')?.value || '').trim(),
    published: document.getElementById('blog-published')?.checked || false,
    updated_at: new Date().toISOString()
  };
  const { error } = _blogEditId
    ? await sb.from('blog_posts').update(payload).eq('id', _blogEditId)
    : await sb.from('blog_posts').insert(payload);
  if (error) { showToast('❌ ' + error.message); return; }
  closeModal('modal-blog');
  showToast('✅ 저장되었습니다');
  loadAdminBlog();
}

async function togglePublish(id, pub) {
  await sb.from('blog_posts').update({ published: pub }).eq('id', id);
  showToast(pub ? '✅ 공개 전환' : '임시저장으로 변경');
  loadAdminBlog();
}

async function deleteBlogPost(id) {
  if (!confirm('이 글을 삭제하시겠습니까?')) return;
  await sb.from('blog_posts').delete().eq('id', id);
  showToast('삭제되었습니다'); loadAdminBlog();
}

/* ── 수강신청 목록 ── */
async function loadAdminEnrollments() {
  const list = document.getElementById('admin-enrollment-list');
  if (!list) return;
  list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--sub);">불러오는 중...</div>';
  const { data, error } = await sb.from('enrollments').select('*').order('created_at', { ascending: false });
  if (error) { list.innerHTML = `<div style="color:#dc2626;">${error.message}</div>`; return; }
  if (!data.length) { list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--sub);">신청 내역이 없습니다</div>'; return; }
  const sLabel = {pending:'대기',confirmed:'확정',cancelled:'취소'};
  const sCls   = {pending:'badge-pending',confirmed:'badge-confirmed',cancelled:'badge-cancelled'};
  list.innerHTML = data.map(e => `
    <div class="nadm-item">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div class="nadm-title">${e.student_name}</div>
        <span class="badge-status ${sCls[e.status]||'badge-pending'}">${sLabel[e.status]||e.status}</span>
      </div>
      <div class="nadm-date">📞 ${e.phone} · ${e.school}</div>
      <div class="nadm-date">과목: ${e.subject||'미입력'} · 시간: ${e.preferred_time||'미입력'}</div>
      ${e.memo ? `<div style="font-size:.78rem;color:var(--sub);margin-top:4px;line-height:1.6;">${e.memo}</div>` : ''}
      <div class="nadm-date" style="margin-top:4px;">${fmtDate(e.created_at)} 접수</div>
      <div class="nadm-actions">
        <button class="btn-sm btn-confirm" onclick="updateStatus('enrollments','${e.id}','confirmed',loadAdminEnrollments)">확정</button>
        <button class="btn-sm btn-del" onclick="updateStatus('enrollments','${e.id}','cancelled',loadAdminEnrollments)">취소</button>
      </div>
    </div>`).join('');
}

/* ── 상담신청 목록 ── */
async function loadAdminConsultations() {
  const list = document.getElementById('admin-consult-list');
  if (!list) return;
  list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--sub);">불러오는 중...</div>';
  const { data, error } = await sb.from('consultations').select('*').order('created_at', { ascending: false });
  if (error) { list.innerHTML = `<div style="color:#dc2626;">${error.message}</div>`; return; }
  if (!data.length) { list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--sub);">상담 신청이 없습니다</div>'; return; }
  const sLabel = {pending:'대기',confirmed:'확정',cancelled:'취소'};
  const sCls   = {pending:'badge-pending',confirmed:'badge-confirmed',cancelled:'badge-cancelled'};
  list.innerHTML = data.map(c => `
    <div class="nadm-item">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div class="nadm-title">${c.name} <span style="font-weight:400;font-size:.8rem;">(자녀: ${c.child_name||'미입력'})</span></div>
        <span class="badge-status ${sCls[c.status]||'badge-pending'}">${sLabel[c.status]||c.status}</span>
      </div>
      <div class="nadm-date">📞 ${c.phone} · 유형: ${c.consult_type||'미입력'}</div>
      ${c.memo ? `<div style="font-size:.78rem;color:var(--sub);margin-top:4px;line-height:1.6;">${c.memo}</div>` : ''}
      <div class="nadm-date" style="margin-top:4px;">${fmtDate(c.created_at)} 신청</div>
      <div class="nadm-actions">
        <button class="btn-sm btn-confirm" onclick="updateStatus('consultations','${c.id}','confirmed',loadAdminConsultations)">확정</button>
        <button class="btn-sm btn-del" onclick="updateStatus('consultations','${c.id}','cancelled',loadAdminConsultations)">취소</button>
      </div>
    </div>`).join('');
}

/* ── 인문학교실 신청 목록 ── */
async function loadAdminAcademy() {
  const list = document.getElementById('admin-academy-list');
  if (!list) return;
  list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--sub);">불러오는 중...</div>';
  const { data, error } = await sb.from('academy_applies').select('*').order('created_at', { ascending: false });
  if (error) { list.innerHTML = `<div style="color:#dc2626;">${error.message}</div>`; return; }
  if (!data.length) { list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--sub);">신청 내역이 없습니다</div>'; return; }
  const sLabel = {pending:'대기',confirmed:'확정',cancelled:'취소'};
  const sCls   = {pending:'badge-pending',confirmed:'badge-confirmed',cancelled:'badge-cancelled'};
  list.innerHTML = data.map(a => `
    <div class="nadm-item">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div class="nadm-title">${a.name}</div>
        <span class="badge-status ${sCls[a.status]||'badge-pending'}">${sLabel[a.status]||a.status}</span>
      </div>
      <div class="nadm-date">📞 ${a.phone}${a.email?' · '+a.email:''}</div>
      <div class="nadm-date">${a.school||''}${a.route?' · 경로: '+a.route:''}</div>
      ${a.intro ? `<div style="font-size:.78rem;color:var(--sub);margin-top:4px;line-height:1.6;">${a.intro}</div>` : ''}
      <div class="nadm-date" style="margin-top:4px;">${fmtDate(a.created_at)} 신청</div>
      <div class="nadm-actions">
        <button class="btn-sm btn-confirm" onclick="updateStatus('academy_applies','${a.id}','confirmed',loadAdminAcademy)">확정</button>
        <button class="btn-sm btn-del" onclick="updateStatus('academy_applies','${a.id}','cancelled',loadAdminAcademy)">취소</button>
      </div>
    </div>`).join('');
}

/* ── 문의 목록 ── */
async function loadAdminContacts() {
  const list = document.getElementById('admin-contact-list');
  if (!list) return;
  list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--sub);">불러오는 중...</div>';
  const { data, error } = await sb.from('contacts').select('*').order('created_at', { ascending: false });
  if (error) { list.innerHTML = `<div style="color:#dc2626;">${error.message}</div>`; return; }
  if (!data.length) { list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--sub);">문의가 없습니다</div>'; return; }
  list.innerHTML = data.map(c => `
    <div class="nadm-item">
      <div class="nadm-title">${c.name} <span style="font-weight:400;font-size:.8rem;">(유형: ${c.contact_type||'미입력'})</span></div>
      <div class="nadm-date">📞 ${c.phone}</div>
      ${c.memo ? `<div style="font-size:.78rem;color:var(--sub);margin-top:4px;line-height:1.6;">${c.memo}</div>` : ''}
      <div class="nadm-date" style="margin-top:4px;">${fmtDate(c.created_at)} 문의</div>
    </div>`).join('');
}

/* ── 상태 공통 업데이트 ── */
async function updateStatus(table, id, status, reloadFn) {
  const { error } = await sb.from(table).update({ status }).eq('id', id);
  if (error) { showToast('❌ ' + error.message); return; }
  showToast(status === 'confirmed' ? '✅ 확정 처리' : '취소 처리');
  if (reloadFn) reloadFn();
}

/* ── 앱 시작 시 공지 로드 ── */
document.addEventListener('DOMContentLoaded', () => {
  loadHomeNotices();
  loadHomeBlog();
  loadDaumCourses();
  // 세션 유지 확인 + /admin URL 자동 처리
  sb.auth.getSession().then(({ data }) => {
    if (data.session) {
      isAdmin = true;
      enterAdminMode();
    } else if (window.location.pathname === '/admin') {
      // /admin 경로로 직접 접속 시 로그인 모달 자동 오픈
      setTimeout(() => {
        openModal('modal-admin-login');
        document.getElementById('admin-pw')?.focus();
      }, 300);
    }
  });
});

