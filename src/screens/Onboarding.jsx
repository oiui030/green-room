import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Frog from '../components/Frog.jsx';
import { useStore } from '../lib/store.jsx';

function Bars({ at, total }) {
  return (
    <div className="dots" role="img" aria-label={`${total}단계 중 ${at}단계`}>
      {Array.from({ length: total }, (_, i) => <span key={i} className={i < at ? 'on' : ''} />)}
    </div>
  );
}

export function Intro() {
  return (
    <div className="page intro">
      <main className="page-body pad">
        <div className="intro-head"><h1 className="wordmark">초록방</h1></div>
        <span className="intro-frog"><Frog size={240} ring={11} shape="b1" /></span>
        <div className="intro-copy">
          <span className="tag dark">혼자 사는 집사님께</span>
          <span className="h1">자취방에도<br />초록 한 칸</span>
          <p>물 줄 날은 제가 기억할게요.<br />집사님은 예뻐만 해주세요.</p>
        </div>
        <div className="bottom col">
          <svg className="intro-arrow" aria-hidden="true" width="52" height="52" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 8 C4 34 22 54 50 44 M38 34 L51 44 L40 55" />
          </svg>
          <Link className="btn primary" to="/about">시작하기</Link>
        </div>
      </main>
    </div>
  );
}

const ABOUT = [
  ['book', '내 방에 맞는 식물을 골라줘요', '햇빛과 돌봄 습관만 알려주세요'],
  ['drop', '물 줄 날은 제가 기억해요', '식물마다 주기가 달라도 걱정 없어요'],
  ['sos', '이상하면 응급처치를 알려줘요', '어느 화면에서든 개구리를 불러요'],
  ['list', '돌본 날이 차곡차곡 쌓여요', '기록이 쌓일수록 관리가 쉬워져요'],
];

export function About() {
  return (
    <div className="page">
      <main className="page-body pad">
        <h1 className="h1">초록방이<br />해주는 일</h1>
        <div className="col gap-16">
          {ABOUT.map(([icon, title, line]) => (
            <div key={title} className="about-row">
              <span className="about-blob"><Icon name={icon} size={32} width={2.2} /></span>
              <div className="col gap-2">
                <span className="title-m">{title}</span>
                <span className="note">{line}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="row gap-12">
          <Frog size={64} ring={5} />
          <div className="bubble hand grow">초보여도 괜찮아요. 저도 처음엔 올챙이였어요.</div>
        </div>
        <div className="bottom">
          <Link className="btn primary" to="/onboard">좋아요</Link>
        </div>
      </main>
    </div>
  );
}

const LIGHTS = [['high', '햇빛 맛집이에요', '창가에 해가 한참 머물러요'], ['mid', '반나절쯤 들어요', '오전이나 오후에만 밝아요'], ['low', '거의 안 들어요', '낮에도 불을 켜요']];
const STYLES = [['day', '꼬박꼬박 챙겨요', '식물 보는 게 낙이에요'], ['week', '가끔 깜빡해요', '바쁜 주엔 잊어버려요'], ['oops', '자주 잊어요', '한 달도 그냥 지나가요']];

// One question per screen. `back` is a link on the first step and a button after it.
function Step({ at, back, title, sub, children, bottom }) {
  return (
    <div className="page">
      <main className="page-body pad">
        <div className="ob-top">
          {back}
          <Bars at={at} total={3} />
        </div>
        <div className="ob-head">
          <div className="col gap-8">
            <h1 className="h1">{title}</h1>
            <span className="note-l">{sub}</span>
          </div>
          <Frog size={92} ring={6} />
        </div>
        {children}
        <div className="bottom col gap-8">{bottom}</div>
      </main>
    </div>
  );
}

function Answers({ label, items, value, onPick }) {
  return (
    <div className="col gap-8" role="group" aria-label={label}>
      {items.map(([key, title, note]) => (
        <button key={key} type="button" className={`answer${value === key ? ' on' : ''}`} aria-pressed={value === key} onClick={() => onPick(key)}>
          <span className="grow col gap-2">
            <span className="title-m">{title}</span>
            <span className="note">{note}</span>
          </span>
          {value === key && <Icon name="check" size={22} width={3} color="var(--lime)" />}
        </button>
      ))}
    </div>
  );
}

export function Onboard() {
  const { dispatch } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [light, setLight] = useState('mid');
  const [style, setStyle] = useState('week');

  const finish = (to) => {
    dispatch({ type: 'onboard', profile: { light, style } });
    navigate(to);
  };
  const backButton = (
    <button type="button" className="ob-back" aria-label="이전 질문" onClick={() => setStep(step - 1)}>
      <Icon name="back" size={26} width={2.6} />
    </button>
  );

  if (step === 1) {
    return (
      <Step
        at={1}
        back={<Link className="ob-back" to="/about" aria-label="소개로 돌아가기"><Icon name="back" size={26} width={2.6} /></Link>}
        title={<>방에 햇빛이<br />얼마나 들어요?</>}
        sub="대충 골라도 괜찮아요"
        bottom={<button type="button" className="btn primary" onClick={() => setStep(2)}>다음</button>}
      >
        <Answers label="햇빛" items={LIGHTS} value={light} onPick={setLight} />
      </Step>
    );
  }

  if (step === 2) {
    return (
      <Step
        at={2}
        back={backButton}
        title={<>물 주는 걸<br />자주 깜빡하나요?</>}
        sub="솔직할수록 잘 맞춰드려요"
        bottom={<button type="button" className="btn primary" onClick={() => setStep(3)}>다음</button>}
      >
        <Answers label="돌봄 습관" items={STYLES} value={style} onPick={setStyle} />
      </Step>
    );
  }

  return (
    <Step
      at={3}
      back={backButton}
      title={<>같이 사는<br />식물이 있나요?</>}
      sub="있으면 바로 돌봄 일정을 만들어요"
      bottom={<button type="button" className="btn secondary" onClick={() => finish('/home')}>일단 둘러볼게요</button>}
    >
      <div className="col gap-8">
        <button type="button" className="answer" onClick={() => finish('/discover?mode=mine')}>
          <span className="disc"><Icon name="sprout" size={24} width={2.2} /></span>
          <span className="grow col gap-2">
            <span className="title-m">있어요</span>
            <span className="note">도감에서 골라 등록해요</span>
          </span>
          <Icon name="chev" size={22} width={2.4} color="var(--gray)" />
        </button>
        <button type="button" className="answer" onClick={() => finish('/discover')}>
          <span className="disc"><Icon name="book" size={24} width={2.2} /></span>
          <span className="grow col gap-2">
            <span className="title-m">아직 없어요</span>
            <span className="note">어울리는 친구를 찾아줘요</span>
          </span>
          <Icon name="chev" size={22} width={2.4} color="var(--gray)" />
        </button>
      </div>
    </Step>
  );
}
