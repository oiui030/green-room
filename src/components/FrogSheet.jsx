import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import Frog from './Frog.jsx';
import { useStore } from '../lib/store.jsx';
import { SPECIES, SPECIES_KEYS, fitFor } from '../lib/catalog.js';
import { SYMPTOMS, SYMPTOM_KEYS } from '../lib/rescue.js';
import { dueTasks, nextWater, plantName, taskTitle, wateringPaused } from '../lib/schedule.js';
import { relativeLabel, todayStr } from '../lib/dates.js';
import { matchText, typingDelay } from '../lib/frogtalk.js';
import { interpret, photoEnabled, preparePhoto, sendPhoto } from '../lib/diagnose.js';

// Tests run the talk without the typing pause.
const INSTANT = import.meta.env.MODE === 'test';

// The frog helper, as a chat. The frog asks, you answer by tapping one of its suggestions
// or by typing. Every reply is scripted; typed text is matched on a few plain words.
// `plantId` starts the talk about that plant, `intent="sick"` starts at "something looks wrong".
export default function FrogSheet({ plantId = null, intent = null, onClose }) {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const endRef = useRef(null);
  const fileRef = useRef(null);
  // The plant the talk is about when a photo is sent, so the answer can attach to it.
  const aboutRef = useRef(null);
  const canPhoto = photoEnabled();
  const byId = (id) => state.plants.find((p) => p.id === id);
  const only = () => byId(plantId) || (state.plants.length === 1 ? state.plants[0] : undefined);

  const other = () => ({ label: '다른 걸 물어볼래요', next: () => menu('또 뭘 도와드릴까요?') });

  function menu(line) {
    return {
      text: line,
      options: [
        ...(canPhoto ? [{ label: '사진 찍어 물어보기', next: () => askPhoto(only()) }] : []),
        { label: '식물이 이상해요', next: () => sick(only()) },
        { label: '물 언제 줘요?', next: water },
        { label: '어떤 식물이 좋을까요?', next: recommend },
        { label: '사람 도움 받기', go: '/help' },
      ],
    };
  }

  function noPlants() {
    return {
      text: '아직 등록한 식물이 없어요.\n도감에서 우리 집 식물을 먼저 등록해요.',
      options: [{ label: '도감에서 등록하기', go: '/discover?mode=mine' }, { label: '어떤 식물이 좋을까요?', next: recommend }],
    };
  }

  // `symptom` is set when the user already described it in words and we only needed the plant.
  function sick(plant, symptom) {
    if (state.plants.length === 0) return noPlants();
    if (!plant) {
      return { text: '어느 식물이에요?', options: state.plants.map((p) => ({ label: plantName(p), next: () => sick(p, symptom) })) };
    }
    if (plant.rescue) {
      return {
        text: `${plantName(plant)}, 이미 구조 작전 중이에요.`,
        options: [{ label: '구조 작전 이어가기', go: `/plan/${plant.id}` }, other()],
      };
    }
    if (symptom) return diagnose(plant, symptom);
    return {
      text: `${plantName(plant)}, 어떤 모습이에요?`,
      options: [
        ...(canPhoto ? [{ label: '사진으로 보여줄게요', next: () => askPhoto(plant) }] : []),
        ...SYMPTOM_KEYS.map((key) => ({ label: SYMPTOMS[key].label, next: () => diagnose(plant, key) })),
        { label: '잘 모르겠어요', next: unsure },
      ],
    };
  }

  function diagnose(plant, key) {
    const s = SYMPTOMS[key];
    const lines = [`${s.verdict}.`, `${s.cause}.`, `먼저 할 일은 "${s.steps[0][1]}"예요.`];
    if (s.noWater) lines.push('작전 동안 물 주기는 쉴게요.');
    return {
      text: lines.join('\n'),
      options: [
        { label: '구조 작전 시작', run: () => dispatch({ type: 'startRescue', id: plant.id, symptom: key }), go: `/plan/${plant.id}` },
        { label: '다른 증상이에요', next: () => sick(plant) },
      ],
    };
  }

  // Says where the photo goes before the picker opens. `pickPhoto` must run inside the tap.
  function askPhoto(plant) {
    aboutRef.current = plant ? plant.id : null;
    return {
      text: '잎이 크게 나오게 찍어주세요.\n초록방은 사진을 저장하지 않아요. 진단을 위해 외부 식물 인식 서비스(Pl@ntNet, Kindwise)로 보내요.',
      options: [{ label: '사진 고르기', pickPhoto: true }, other()],
    };
  }

  // What the frog says once the photo has been read.
  function photoReply(result) {
    const seen = interpret(result);
    const text = seen.lines.join('\n');
    const retry = { label: '다시 찍기', pickPhoto: true };
    const about = byId(aboutRef.current);
    const mine = about || (seen.species ? state.plants.find((p) => p.species === seen.species && !p.rescue) : undefined) || only();
    if (seen.kind === 'error') return { text, options: [retry, { label: '증상 고르기', next: () => sick(only()) }, other()] };
    if (seen.kind === 'unclear') return { text, options: [retry, { label: '증상 고르기', next: () => sick(only()) }] };
    const options = [];
    if (seen.symptom && mine && !mine.rescue) {
      options.push({ label: '구조 작전 시작', run: () => dispatch({ type: 'startRescue', id: mine.id, symptom: seen.symptom }), go: `/plan/${mine.id}` });
    } else if (seen.symptom && state.plants.length > 1) {
      options.push({ label: '어느 식물인지 고르기', next: () => sick(undefined, seen.symptom) });
    }
    if (seen.species && !state.plants.some((p) => p.species === seen.species)) {
      options.push({ label: `${SPECIES[seen.species].name} 식구로 등록`, go: `/species/${seen.species}?mode=mine` });
    }
    if (seen.kind === 'issue' && !seen.symptom) options.push({ label: '사람 도움 받기', go: '/help' });
    if (seen.kind !== 'healthy') options.push({ label: '증상 직접 고르기', next: () => sick(mine) });
    options.push(retry, other());
    return { text, options };
  }

  function unsure() {
    return {
      text: '그럴 땐 사람 눈이 정확해요.\n사진을 들고 물어볼 곳을 알려드릴게요.',
      options: [{ label: '사람 도움 받기', go: '/help' }, other()],
    };
  }

  function water() {
    if (state.plants.length === 0) return noPlants();
    const today = todayStr();
    const due = dueTasks(state.plants, today).filter((t) => t.type === 'water');
    const lines = state.plants.slice(0, 6).map((p) => {
      if (wateringPaused(p)) return `${plantName(p)}: 구조 중이라 쉬어요`;
      if (due.some((t) => t.plantId === p.id)) return `${plantName(p)}: 오늘이에요`;
      return `${plantName(p)}: ${relativeLabel(nextWater(p), today)}`;
    });
    const lead = due.length > 0 ? `오늘은 ${taskTitle(due[0], byId(due[0].plantId))}부터 해요.` : '오늘 물 줄 식물은 없어요.';
    return { text: [lead, ...lines].join('\n'), options: [{ label: '돌봄 달력 보기', go: '/care' }, other()] };
  }

  function recommend() {
    const picks = SPECIES_KEYS.map((key) => ({ key, fit: fitFor(key, state.profile) })).sort((a, b) => b.fit.score - a.fit.score).slice(0, 3);
    return {
      text: '집사님 방엔 이 친구들이 잘 맞아요.\n눌러서 자세히 볼 수 있어요.',
      options: [...picks.map(({ key }) => ({ label: SPECIES[key].name, go: `/species/${key}` })), { label: '도감 전부 보기', go: '/discover' }, other()],
    };
  }

  function unread() {
    return { ...menu('아직 글을 읽고 답하진 못해요.\n아래에서 가까운 걸 골라주세요.') };
  }

  const opening = () => (plantId || intent === 'sick' ? sick(only()) : menu('안녕하세요, 집사님.\n뭘 도와드릴까요?'));
  const [msgs, setMsgs] = useState(() => (INSTANT ? [{ from: 'frog', ...opening() }] : []));
  // While `typing`, the frog shows three dots instead of its next line, and nothing can be picked.
  const [typing, setTyping] = useState(!INSTANT);
  const timer = useRef(null);
  const last = msgs[msgs.length - 1];

  const frogSays = (msg) => {
    if (INSTANT) {
      setMsgs((m) => [...m, { from: 'frog', ...msg }]);
      return;
    }
    const reduced = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTyping(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: 'frog', ...msg }]);
    }, typingDelay(msg.text, reduced));
  };

  useEffect(() => {
    if (!INSTANT) frogSays(opening());
    return () => clearTimeout(timer.current);
    // The greeting is said once, when the sheet opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (endRef.current && endRef.current.scrollIntoView) endRef.current.scrollIntoView({ block: 'end' });
  }, [msgs, typing]);

  const onPhoto = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setTyping(true);
    let reply;
    try {
      const photo = await preparePhoto(file);
      setMsgs((m) => [...m, { from: 'me', image: photo.preview, text: '사진을 보냈어요' }]);
      reply = photoReply(await sendPhoto(photo.base64));
    } catch {
      reply = photoReply({ error: 'failed' });
    }
    setTyping(false);
    setMsgs((m) => [...m, { from: 'frog', ...reply }]);
  };

  const pick = (option) => {
    if (option.pickPhoto) {
      if (fileRef.current) fileRef.current.click();
      return;
    }
    if (option.run) option.run();
    if (option.go) {
      onClose();
      navigate(option.go);
      return;
    }
    const next = option.next();
    setMsgs((m) => [...m, { from: 'me', text: option.label }]);
    frogSays(next);
  };

  const send = (e) => {
    e.preventDefault();
    const said = text.trim();
    if (!said || typing) return;
    setText('');
    const found = matchText(said);
    const named = state.plants.find((p) => said.includes(plantName(p))) || only();
    let reply;
    if (!found) reply = unread();
    else if (found.symptom) reply = sick(named, found.symptom);
    else if (found.intent === 'sick') reply = sick(named);
    else if (found.intent === 'water') reply = water();
    else if (found.intent === 'recommend') reply = recommend();
    else reply = unsure();
    setMsgs((m) => [...m, { from: 'me', text: said }]);
    frogSays(reply);
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet chat" role="dialog" aria-modal="true" aria-label="개구리 도우미" onClick={(e) => e.stopPropagation()}>
        <span className="grabber" aria-hidden="true" />
        <div className="row gap-12">
          <Frog size={48} ring={4} tone="lime" />
          <div className="grow col gap-2">
            <span className="sheet-title">개구리</span>
            <span className="note">{typing ? '답을 쓰는 중이에요' : '고르거나 직접 적어주세요'}</span>
          </div>
          <button type="button" className="icon-btn" aria-label="닫기" onClick={onClose}>
            <Icon name="close" size={22} width={2} />
          </button>
        </div>

        <div className="chat-log" role="log" aria-live="polite" aria-label="대화">
          {msgs.map((m, i) => (
            <div key={i} className={`msg ${m.from}${m.image ? ' photo' : ''}`}>
              {m.from === 'frog' && <span className="sr">개구리: </span>}
              {m.from === 'me' && <span className="sr">나: </span>}
              {m.image ? <img className="msg-photo" src={m.image} alt={m.text} /> : m.text}
            </div>
          ))}
          {typing && (
            <div className="msg frog typing" role="status" aria-label="개구리가 답을 쓰는 중">
              <span /><span /><span />
            </div>
          )}
          {!typing && last && last.from === 'frog' && (
            <div className="replies" role="group" aria-label="고를 수 있는 답">
              {last.options.map((o) => (
                <button key={o.label} type="button" className="reply" onClick={() => pick(o)}>{o.label}</button>
              ))}
            </div>
          )}
          <span ref={endRef} />
        </div>

        {canPhoto && <input ref={fileRef} type="file" accept="image/*" hidden aria-hidden="true" tabIndex={-1} onChange={onPhoto} />}
        <form className="chat-input" onSubmit={send}>
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} aria-label="직접 적기" placeholder="직접 적어도 돼요" enterKeyHint="send" autoComplete="off" />
          <button type="submit" className="chat-send" aria-label="보내기" disabled={!text.trim() || typing}>
            <Icon name="send" size={22} width={2.6} />
          </button>
        </form>
      </div>
    </div>
  );
}
