import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { Page } from '../components/Shell.jsx';
import { useStore } from '../lib/store.jsx';
import { todayStr, relativeLabel } from '../lib/dates.js';
import { plantName } from '../lib/schedule.js';

const ICON = { water: 'drop', wipe: 'leaf', add: 'sprout', rescue: 'sos', recover: 'check' };

export default function Log() {
  const { state } = useStore();
  const [filter, setFilter] = useState('all');
  const today = todayStr();
  const logs = state.logs.filter((l) => filter === 'all' || l.plantId === filter);
  const days = [...new Set(logs.map((l) => l.at))];

  return (
    <Page tabs>
      <h1 className="h1 sm">돌봄 기록</h1>
      {state.plants.length === 0 ? (
        <div className="card col gap-8">
          <span className="title-s">아직 기록이 없어요</span>
          <span className="note">식물을 등록하고 돌보면 여기에 쌓여요.</span>
          <Link className="btn primary" to="/discover">도감 보러 가기</Link>
        </div>
      ) : (
        <>
          <div className="chips" role="group" aria-label="식물 고르기">
            <button type="button" className={`chip${filter === 'all' ? ' on' : ''}`} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>전체</button>
            {state.plants.map((p) => (
              <button key={p.id} type="button" className={`chip${filter === p.id ? ' on' : ''}`} aria-pressed={filter === p.id} onClick={() => setFilter(p.id)}>
                {plantName(p)}
              </button>
            ))}
          </div>
          {days.map((day) => (
            <div key={day} className="col gap-8">
              <span className="label soft">{relativeLabel(day, today)}</span>
              {logs.filter((l) => l.at === day).map((l) => (
                <div key={l.id} className="rowcard static">
                  <span className={`disc sm${l.type === 'recover' ? ' lime' : ''}`}><Icon name={ICON[l.type] || 'list'} size={20} width={2.2} /></span>
                  <span className="grow">{l.text}</span>
                </div>
              ))}
            </div>
          ))}
          {logs.length === 0 && <span className="note">이 식물은 아직 기록이 없어요.</span>}
        </>
      )}
    </Page>
  );
}
