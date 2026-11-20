import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon, { PlantIcon } from '../components/Icon.jsx';
import { Page } from '../components/Shell.jsx';
import Frog from '../components/Frog.jsx';
import FrogSheet from '../components/FrogSheet.jsx';
import { DONE_LABEL, doneMessage, taskNote } from '../components/TaskCard.jsx';
import { useStore } from '../lib/store.jsx';
import { SPECIES, SPECIES_KEYS, fitFor } from '../lib/catalog.js';
import { SYMPTOMS } from '../lib/rescue.js';
import { todayStr, relativeLabel } from '../lib/dates.js';
import { dueTasks, nextWater, plantName, taskTitle, wateringPaused } from '../lib/schedule.js';

function plantState(plant, today) {
  if (plant.rescue) return '구조 중';
  if (wateringPaused(plant)) return '물 쉬는 중';
  const due = nextWater(plant);
  if (due <= today) return '오늘 물';
  return `${relativeLabel(due, today)} 물`;
}

export default function Home() {
  const { state, act } = useStore();
  const [sheet, setSheet] = useState(false);
  const today = todayStr();
  const due = dueTasks(state.plants, today);
  const first = due[0];
  const dueIds = new Set(due.filter((t) => t.type === 'water').map((t) => t.plantId));
  // With nothing due, an unfinished rescue plan is what today is about.
  const rescued = !first && state.plants.find((p) => p.rescue && p.rescue.done.length < SYMPTOMS[p.rescue.symptom].steps.length);
  const headline = state.plants.length === 0 ? '첫 식구를 기다려요' : first ? '오늘은 돌보는 날' : rescued ? '구조 작전 중' : '오늘은 쉬는 날';
  const picks = state.plants.length === 0
    ? SPECIES_KEYS.map((k) => ({ key: k, fit: fitFor(k, state.profile) })).sort((a, b) => b.fit.score - a.fit.score).slice(0, 3)
    : [];

  const plant = first && state.plants.find((p) => p.id === first.plantId);
  const title = state.plants.length === 0 ? '아직 식구가 없어요' : first ? taskTitle(first, plant) : rescued ? `${plantName(rescued)} 구조 작전` : '오늘 할 일 없음';
  const note = state.plants.length === 0 ? '도감에서 첫 식물을 골라봐요' : first ? taskNote(first, plant)
    : rescued ? `${SYMPTOMS[rescued.rescue.symptom].steps.length}개 중 ${rescued.rescue.done.length}개 했어요`
    : '구경만 하고 가도 돼요';

  return (
    <Page tabs>
      <div className="row between">
        <h1 className="h1 sm">초록방</h1>
        <Link className="icon-btn" to="/care" aria-label="돌봄 달력">
          <Icon name="bell" size={24} width={2.2} />
        </Link>
      </div>

      <div className="hero">
        <span className="hero-frog"><Frog size={170} ring={9} /></span>
        <div className="hero-text">
          <span className="tag dark">{headline}</span>
          <span className="h1">{title}</span>
          <span className="hero-note">{note}</span>
        </div>
        {first && (
          <button type="button" className="btn primary" onClick={() => act({ type: first.type, id: plant.id }, doneMessage(first.type, plant))}>
            {DONE_LABEL[first.type]}
          </button>
        )}
        {rescued && <Link className="btn primary" to={`/plan/${rescued.id}`}>이어가기</Link>}
        {state.plants.length === 0 && <Link className="btn primary" to="/discover">도감 보러 가기</Link>}
      </div>

      {picks.length > 0 && (
        <>
          <div className="section-head">
            <span className="label">내 방에 맞는 친구</span>
            <Link className="textlink ink" to="/discover">전부 보기</Link>
          </div>
          <div className="tiles">
            {picks.map(({ key, fit }) => (
              <Link key={key} className="tile" to={`/species/${key}`}>
                <span className="tile-blob"><PlantIcon kind={SPECIES[key].icon} size={54} label="" /></span>
                <span className="tile-name">{SPECIES[key].name}</span>
                <span className="tile-state">{fit.label}</span>
              </Link>
            ))}
          </div>
          <Link className="rowcard" to="/discover?mode=mine">
            <span className="disc sm"><Icon name="sprout" size={20} width={2.2} /></span>
            <span className="grow col gap-2"><span>이미 키우는 식물이 있어요</span><span className="note">등록하면 물 줄 날을 챙겨줘요</span></span>
            <Icon name="chev" size={20} width={2.4} color="var(--gray)" />
          </Link>
        </>
      )}

      {due.length > 1 && (
        <Link className="rowcard" to="/care">
          <span className="disc sm"><Icon name="calendar" size={20} width={2.2} /></span>
          <span className="grow">오늘 할 일 {due.length - 1}개 더</span>
          <Icon name="chev" size={20} width={2.4} color="var(--gray)" />
        </Link>
      )}

      {state.plants.length > 0 && (
        <>
          <div className="section-head">
            <span className="label">내 식물 {state.plants.length}</span>
            <Link className="textlink ink" to="/discover">식구 늘리기</Link>
          </div>
          <div className="tiles">
            {state.plants.map((p) => {
              const on = dueIds.has(p.id);
              return (
                <Link key={p.id} className={`tile${on ? ' on' : ''}`} to={`/plant/${p.id}`}>
                  <span className="tile-blob"><PlantIcon kind={SPECIES[p.species].icon} size={54} label="" /></span>
                  <span className="tile-name">{plantName(p)}</span>
                  <span className="tile-state">{plantState(p, today)}</span>
                </Link>
              );
            })}
          </div>
          <button type="button" className="ask" onClick={() => setSheet(true)}>
            <span className="grow col gap-2">
              <span className="ask-title">어딘가 이상해요?</span>
              <span className="ask-note">개구리가 바로 봐줄게요</span>
            </span>
            <Icon name="send" size={22} width={2.6} color="var(--lime)" />
          </button>
        </>
      )}
      {sheet && <FrogSheet intent="sick" onClose={() => setSheet(false)} />}
    </Page>
  );
}
