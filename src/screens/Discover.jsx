import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Icon, { PlantIcon } from '../components/Icon.jsx';
import { Page, BackLink } from '../components/Shell.jsx';
import { useStore } from '../lib/store.jsx';
import { SPECIES, SPECIES_KEYS, fitFor } from '../lib/catalog.js';

const FILTERS = [
  ['fit', '내 방 맞춤', () => true],
  ['easy', '초보용', (s) => s.level === '초보용'],
  ['dry', '물 적게', (s) => s.waterDays >= 14],
  ['shade', '그늘도 좋아', (s) => s.light.includes('low')],
];

export default function Discover() {
  const { state } = useStore();
  const [params] = useSearchParams();
  const mine = params.get('mode') === 'mine';
  const [filter, setFilter] = useState('fit');
  const test = FILTERS.find((f) => f[0] === filter)[2];
  const list = SPECIES_KEYS
    .filter((k) => test(SPECIES[k]))
    .map((k) => ({ key: k, s: SPECIES[k], fit: fitFor(k, state.profile) }))
    .sort((a, b) => (filter === 'fit' ? b.fit.score - a.fit.score : 0));

  return (
    <Page tabs>
      <h1 className="h1 sm">{mine ? '어떤 식물인가요?' : '식물 도감'}</h1>
      {mine && <span className="note">키우는 식물을 고르면 돌봄 일정이 만들어져요.</span>}
      <div className="chips" role="group" aria-label="필터">
        {FILTERS.map(([key, label]) => (
          <button key={key} type="button" className={`chip${filter === key ? ' on' : ''}`} aria-pressed={filter === key} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>
      <div className="grid-2">
        {list.map(({ key, s, fit }) => (
          <Link key={key} className="card pcard" to={`/species/${key}${mine ? '?mode=mine' : ''}`}>
            <span className={`badge ${fit.tone}`}>{fit.label}</span>
            <span className="pblob"><PlantIcon kind={s.icon} size={52} label="" /></span>
            <span className="title-s">{s.name}</span>
            <span className="meta">
              <Icon name="drop" size={16} color="var(--gray)" />{s.water}
              <Icon name="sun" size={16} color="var(--gray)" />{s.sun}
            </span>
          </Link>
        ))}
      </div>
    </Page>
  );
}

const AGO = [[0, '오늘'], [3, '사흘 전'], [7, '일주일 전'], [null, '모르겠어요']];

export function Species() {
  const { key } = useParams();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const s = SPECIES[key];
  if (!s) return <Missing />;
  const fit = fitFor(key, state.profile);
  const count = state.plants.filter((p) => p.species === key).length;

  const add = (daysAgo) => {
    dispatch({ type: 'addPlant', species: key, daysAgo });
    navigate('/home');
  };

  return (
    <Page frog={false}>
      <BackLink label="도감" />
      <div className="plant-hero">
        <div className="col gap-8">
          <span className="tag">{fit.label}</span>
          <h1 className="h1">{s.name}</h1>
        </div>
        <span className="pblob"><PlantIcon kind={s.icon} size={72} label={s.name} /></span>
      </div>
      <div className="grid-3">
        <div className="card ctile"><Icon name="drop" size={26} width={2} />{s.water}</div>
        <div className="card ctile"><Icon name="sun" size={26} width={2} />{s.sun}</div>
        <div className="card ctile"><Icon name="sprout" size={26} width={2} />{s.level}</div>
      </div>
      <span className="label">이것만 기억해요</span>
      <ul className="tips">{s.tips.map((t) => <li key={t}>{t}</li>)}</ul>
      <span className="label">비슷한 친구</span>
      <div className="grid-2">
        {s.similar.map((k) => (
          <Link key={k} className="card row gap-12 similar" to={`/species/${k}`}>
            <span className="disc"><PlantIcon kind={SPECIES[k].icon} size={26} label="" /></span>
            <span className="title-s">{SPECIES[k].name}</span>
          </Link>
        ))}
      </div>
      {count > 0 && <span className="note">우리 집에 {count}개 있어요.</span>}

      <div className="bottom">
        {!adding ? (
          <button type="button" className="btn primary" onClick={() => setAdding(true)}>우리 집 식구로 등록</button>
        ) : (
          <div className="card col gap-8">
            <span className="title-s">마지막으로 물 준 게 언제예요?</span>
            <div className="grid-2">
              {AGO.map(([days, label]) => (
                <button key={label} type="button" className="btn white small" onClick={() => add(days)}>{label}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}

export function Missing() {
  return (
    <Page frog={false}>
      <BackLink to="/home" label="내 방" />
      <h1 className="h1">찾는 화면이 없어요</h1>
      <Link className="btn primary" to="/home">내 방으로</Link>
    </Page>
  );
}
