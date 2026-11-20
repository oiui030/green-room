import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { Page } from '../components/Shell.jsx';
import TaskCard from '../components/TaskCard.jsx';
import { useStore } from '../lib/store.jsx';
import { todayStr, weekOf, weekdayLabel, relativeLabel } from '../lib/dates.js';
import { dueTasks, upcomingTasks, marksFor, taskTitle, plantName, wateringPaused } from '../lib/schedule.js';

const ICON = { water: 'drop', wipe: 'leaf' };
const MARK_LABEL = { water: '물 주기', wipe: '잎 닦기' };

export default function Care() {
  const { state } = useStore();
  const today = todayStr();
  const due = dueTasks(state.plants, today);
  const upcoming = upcomingTasks(state.plants, today);
  const marks = marksFor(state.plants, weekOf(today), today);
  const paused = state.plants.filter(wateringPaused);
  const find = (id) => state.plants.find((p) => p.id === id);

  return (
    <Page tabs>
      <h1 className="h1 sm">돌봄 달력</h1>
      <img className="banner" src="./img/frog.webp" alt="풀숲 사이의 개구리" />

      <div className="week">
        {marks.map((m) => (
          <div key={m.date} className={`day${m.date === today ? ' on' : ''}`} aria-current={m.date === today ? 'date' : undefined}>
            <span>{weekdayLabel(m.date)}</span>
            {m.kinds.length > 0
              ? <span className="dot has" role="img" aria-label={m.kinds.map((k) => MARK_LABEL[k]).join(', ')} />
              : <span className="dot" aria-hidden="true" />}
          </div>
        ))}
      </div>

      {state.plants.length === 0 && (
        <div className="card col gap-8">
          <span className="title-s">돌볼 식물이 없어요</span>
          <span className="note">식물을 등록하면 물 줄 날을 챙겨줘요.</span>
          <Link className="btn primary" to="/discover">도감 보러 가기</Link>
        </div>
      )}

      {due.map((t) => (
        <TaskCard key={t.plantId + t.type} task={t} plant={find(t.plantId)} eyebrow="오늘" />
      ))}
      {state.plants.length > 0 && due.length === 0 && (
        <div className="card row gap-12">
          <span className="disc"><Icon name="check" size={26} width={2.4} color="var(--green)" /></span>
          <span className="hand title-task">오늘 할 일 없음</span>
        </div>
      )}

      {(upcoming.length > 0 || paused.length > 0) && <span className="label">곧 할 일</span>}
      <div className="col gap-8">
        {upcoming.map((t) => (
          <Link key={t.plantId + t.type} className="rowcard" to={`/plant/${t.plantId}`}>
            <Icon name={ICON[t.type]} size={24} />
            <span className="grow">{taskTitle(t, find(t.plantId))}</span>
            <span className="note">{relativeLabel(t.due, today)}</span>
          </Link>
        ))}
        {paused.map((p) => (
          <Link key={p.id} className="rowcard" to={`/plan/${p.id}`}>
            <Icon name="sos" size={24} />
            <span className="grow">{plantName(p)} 물 금지</span>
            <span className="note">구조 중</span>
          </Link>
        ))}
      </div>
    </Page>
  );
}
