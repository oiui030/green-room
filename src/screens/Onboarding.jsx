import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Frog from '../components/Frog.jsx';
import { useStore } from '../lib/store.jsx';

function Dots({ at }) {
  return (
    <div className="dots" aria-hidden="true">
      {[0, 1, 2].map((i) => <span key={i} className={i <= at ? 'on' : ''} />)}
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
        <div className="row topbar"><Dots at={0} /></div>
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

const LIGHTS = [['high', '쨍쨍해요', '해가 직접 들어요'], ['mid', '은은해요', '밝지만 직접은 안 들어요'], ['low', '어둑해요', '낮에도 불을 켜요']];
const STYLES = [['day', '매일 봐요', 'drop'], ['week', '주말에만', 'calendar'], ['oops', '자주 깜빡', 'bell']];

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

  if (step === 1) {
    return (
      <div className="page">
        <main className="page-body pad">
          <div className="row topbar"><Dots at={1} /></div>
          <h1 className="h1">내 방은<br />어떤 곳인가요?</h1>
          <div className="col gap-8">
            <span className="label soft">햇빛</span>
            <div className="grid-3" role="group" aria-label="햇빛">
              {LIGHTS.map(([key, label]) => (
                <button key={key} type="button" className={`option${light === key ? ' on' : ''}`} aria-pressed={light === key} onClick={() => setLight(key)}>
                  <Icon name="sun" size={32} />
                  {label}
                </button>
              ))}
            </div>
            <span className="note">{LIGHTS.find((l) => l[0] === light)[2]}</span>
          </div>
          <div className="col gap-8">
            <span className="label soft">나는 어떤 집사</span>
            <div className="grid-3" role="group" aria-label="나는 어떤 집사">
              {STYLES.map(([key, label, icon]) => (
                <button key={key} type="button" className={`option${style === key ? ' on' : ''}`} aria-pressed={style === key} onClick={() => setStyle(key)}>
                  <Icon name={icon} size={32} />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="bottom">
            <button type="button" className="btn primary" onClick={() => setStep(2)}>다음</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <main className="page-body pad">
        <div className="row topbar"><Dots at={2} /></div>
        <h1 className="h1">같이 사는<br />식물이 있나요?</h1>
        <button type="button" className="choice" onClick={() => finish('/discover?mode=mine')}>
          <span className="disc lg"><Icon name="sprout" size={32} width={2} /></span>
          <span className="grow col gap-4">
            <span className="title-m">있어요</span>
            <span className="note">도감에서 골라 등록해요</span>
          </span>
          <Icon name="chev" size={22} width={2} color="var(--gray)" />
        </button>
        <button type="button" className="choice" onClick={() => finish('/discover')}>
          <span className="disc lg"><Icon name="book" size={32} width={2} /></span>
          <span className="grow col gap-4">
            <span className="title-m">아직 없어요</span>
            <span className="note">어울리는 친구를 찾아줘요</span>
          </span>
          <Icon name="chev" size={22} width={2} color="var(--gray)" />
        </button>
        <div className="bottom">
          <button type="button" className="btn secondary" onClick={() => finish('/home')}>일단 둘러볼게요</button>
        </div>
      </main>
    </div>
  );
}
