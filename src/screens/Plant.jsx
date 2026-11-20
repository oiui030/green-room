import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon, { PlantIcon } from '../components/Icon.jsx';
import { Page, BackLink } from '../components/Shell.jsx';
import FrogSheet from '../components/FrogSheet.jsx';
import { Missing } from './Discover.jsx';
import { useStore } from '../lib/store.jsx';
import { SPECIES } from '../lib/catalog.js';
import { todayStr, relativeLabel, diffDays } from '../lib/dates.js';
import { nextWater, nextWipe, plantName, wateringPaused } from '../lib/schedule.js';

export default function Plant() {
  const { id } = useParams();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const plant = state.plants.find((p) => p.id === id);
  if (!plant) return <Missing />;
  const s = SPECIES[plant.species];
  const today = todayStr();
  const water = nextWater(plant);
  const wipe = nextWipe(plant);
  const days = diffDays(today, plant.addedAt);

  const remove = () => {
    dispatch({ type: 'removePlant', id: plant.id });
    navigate('/home');
  };

  return (
    <Page frog={false}>
      <BackLink to="/home" label="내 방" />
      <div className="plant-hero">
        <div className="col gap-4">
          <span className="hero-note">함께한 지 {days + 1}일</span>
          <h1 className="h1">{plantName(plant)}</h1>
        </div>
        <span className="pblob"><PlantIcon kind={s.icon} size={72} label={s.name} /></span>
      </div>

      <div className="grid-3">
        <div className="card ctile"><Icon name="drop" size={26} width={2} />{s.water}</div>
        <div className="card ctile"><Icon name="sun" size={26} width={2} />{s.sun}</div>
        <div className="card ctile"><Icon name="sprout" size={26} width={2} />{s.level}</div>
      </div>

      {plant.rescue ? (
        <Link className="rowcard" to={`/plan/${plant.id}`}>
          <Icon name="sos" size={24} />
          <span className="grow">구조 작전 진행 중</span>
          <span className="note">{relativeLabel(plant.rescue.startedAt, today)} 시작</span>
        </Link>
      ) : null}
      <div className="rowcard static">
        <Icon name="drop" size={24} />
        <span className="grow">다음 물</span>
        <span className="note">{wateringPaused(plant) ? '구조 중이라 쉬어요' : water <= today ? '오늘' : relativeLabel(water, today)}</span>
      </div>
      {wipe && (
        <div className="rowcard static">
          <Icon name="leaf" size={24} />
          <span className="grow">다음 잎 닦기</span>
          <span className="note">{wipe <= today ? '오늘' : relativeLabel(wipe, today)}</span>
        </div>
      )}

      <span className="label">이것만 기억해요</span>
      <ul className="tips">{s.tips.map((t) => <li key={t}>{t}</li>)}</ul>

      {confirm ? (
        <div className="card col gap-8">
          <span className="title-s">{plantName(plant)}와 헤어질까요?</span>
          <span className="note">기록도 함께 지워져요. 되돌릴 수 없어요.</span>
          <div className="grid-2">
            <button type="button" className="btn white small" onClick={() => setConfirm(false)}>아니요</button>
            <button type="button" className="btn dark small" onClick={remove}>헤어질게요</button>
          </div>
        </div>
      ) : (
        <button type="button" className="textlink" onClick={() => setConfirm(true)}>
          <Icon name="trash" size={18} />이 식물과 헤어지기
        </button>
      )}

      <div className="bottom row gap-8 pair">
        {!wateringPaused(plant) && (
          <button type="button" className="btn secondary grow" onClick={() => dispatch({ type: 'water', id: plant.id })}>지금 물 줬어요</button>
        )}
        {plant.rescue ? (
          <Link className="btn primary grow" to={`/plan/${plant.id}`}>구조 작전 이어가기</Link>
        ) : (
          <button type="button" className="btn primary grow" onClick={() => setSheet(true)}>
어딘가 이상해요
          </button>
        )}
      </div>
      {sheet && <FrogSheet plantId={plant.id} onClose={() => setSheet(false)} />}
    </Page>
  );
}
