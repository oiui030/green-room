import { Link } from 'react-router-dom';
import Icon, { PlantIcon } from '../components/Icon.jsx';
import { Page } from '../components/Shell.jsx';
import TaskCard from '../components/TaskCard.jsx';
import { useStore } from '../lib/store.jsx';
import { SPECIES } from '../lib/catalog.js';
import { todayStr, relativeLabel } from '../lib/dates.js';
import { dueTasks, nextWater, plantName, wateringPaused } from '../lib/schedule.js';

function plantState(plant, today) {
  if (plant.rescue) return '구조 중';
  if (wateringPaused(plant)) return '물 쉬는 중';
  const due = nextWater(plant);
  if (due <= today) return '오늘 물';
  return `${relativeLabel(due, today)} 물`;
}

export default function Home() {
  const { state } = useStore();
  const today = todayStr();
  const due = dueTasks(state.plants, today);
  const first = due[0];
  const dueIds = new Set(due.filter((t) => t.type === 'water').map((t) => t.plantId));
  const headline = state.plants.length === 0 ? '첫 식구를 기다려요' : first ? '오늘은 돌보는 날' : '오늘은 쉬는 날';

  return (
    <Page tabs hint={state.plants.length ? '이상하면 저를 눌러요' : null}>
      <div className="row between">
        <h1 className="h1 sm">초록방</h1>
        <Link className="icon-btn" to="/care" aria-label="돌봄 달력">
          <Icon name="bell" size={24} />
        </Link>
      </div>

      <div className="hero">
        <img src="./img/frog.webp" alt="비 오는 풀숲 사이로 고개를 내민 개구리" />
        <span className="hero-pill hand">{headline}</span>
      </div>

      {first && <TaskCard task={first} plant={state.plants.find((p) => p.id === first.plantId)} />}
      {due.length > 1 && (
        <Link className="rowcard" to="/care">
          <Icon name="calendar" size={24} />
          <span className="grow">오늘 할 일 {due.length - 1}개 더</span>
          <Icon name="chev" size={20} width={2} color="var(--gray)" />
        </Link>
      )}
      {state.plants.length > 0 && !first && (
        <div className="card row gap-12">
          <span className="disc"><Icon name="check" size={26} width={2.4} color="var(--green)" /></span>
          <div className="col gap-2">
            <span className="hand title-task">오늘 할 일 없음</span>
            <span className="note">구경만 하고 가도 돼요</span>
          </div>
        </div>
      )}

      {state.plants.length === 0 ? (
        <div className="card col gap-8">
          <span className="title-s">아직 식구가 없어요</span>
          <span className="note">내 방에 맞는 식물을 찾거나, 이미 키우는 식물을 등록해요.</span>
          <Link className="btn primary" to="/discover">도감 보러 가기</Link>
        </div>
      ) : (
        <div className="tiles">
          {state.plants.map((p) => {
            const on = dueIds.has(p.id);
            return (
              <Link key={p.id} className={`tile${on ? ' on' : ''}`} to={`/plant/${p.id}`}>
                <PlantIcon kind={SPECIES[p.species].icon} size={36} label="" />
                <span className="tile-name">{plantName(p)}</span>
                <span className="tile-state">{plantState(p, today)}</span>
              </Link>
            );
          })}
          <Link className="tile" to="/discover" aria-label="새 식구 들이기">
            <span className="disc sm"><Icon name="plus" size={22} width={2} color="var(--green)" /></span>
            <span className="tile-name">새 식구</span>
          </Link>
        </div>
      )}
    </Page>
  );
}
