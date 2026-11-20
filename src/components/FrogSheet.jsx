import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon, { PlantIcon } from './Icon.jsx';
import Frog from './Frog.jsx';
import { useStore } from '../lib/store.jsx';
import { SPECIES } from '../lib/catalog.js';
import { SYMPTOMS, SYMPTOM_KEYS } from '../lib/rescue.js';
import { plantName } from '../lib/schedule.js';

// The frog helper. Opens over any screen: pick a plant, pick what looks wrong, get a plan.
export default function FrogSheet({ plantId, onClose }) {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [picked, setPicked] = useState(plantId || (state.plants.length === 1 ? state.plants[0].id : null));
  const plant = state.plants.find((p) => p.id === picked);
  const ongoing = state.plants.filter((p) => p.rescue);

  const start = (symptom) => {
    dispatch({ type: 'startRescue', id: plant.id, symptom });
    onClose();
    navigate(`/plan/${plant.id}`);
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="개구리 도우미" onClick={(e) => e.stopPropagation()}>
        <span className="grabber" aria-hidden="true" />
        <div className="row gap-12">
          <Frog size={64} ring={5} tone="lime" />
          <div className="grow col gap-2">
            <span className="hand sheet-title">어디가 이상해요?</span>
            <span className="note">어느 화면에서든 불러요</span>
          </div>
          <button type="button" className="icon-btn" aria-label="닫기" onClick={onClose}>
            <Icon name="close" size={22} width={2} />
          </button>
        </div>

        {state.plants.length === 0 && (
          <div className="card col gap-8">
            <span className="title-s">아직 등록한 식물이 없어요</span>
            <span className="note">도감에서 우리 집 식물을 먼저 등록해요.</span>
            <Link className="btn primary" to="/discover" onClick={onClose}>도감에서 등록하기</Link>
          </div>
        )}

        {state.plants.length > 1 && (
          <div className="col gap-8">
            <span className="label soft">어느 식물인가요?</span>
            <div className="chips">
              {state.plants.map((p) => (
                <button key={p.id} type="button" className={`chip${picked === p.id ? ' on' : ''}`} aria-pressed={picked === p.id} onClick={() => setPicked(p.id)}>
                  {plantName(p)}
                </button>
              ))}
            </div>
          </div>
        )}

        {plant && !plant.rescue && (
          <div className="col gap-8">
            <span className="label soft">{plantName(plant)}, 어떤 모습이에요?</span>
            {SYMPTOM_KEYS.map((key) => (
              <button key={key} type="button" className="rowcard" onClick={() => start(key)}>
                <span className="grow">{SYMPTOMS[key].label}</span>
                <Icon name="chev" size={20} width={2} color="var(--gray)" />
              </button>
            ))}
          </div>
        )}

        {plant && plant.rescue && (
          <Link className="btn primary" to={`/plan/${plant.id}`} onClick={onClose}>
            {plantName(plant)} 구조 작전 이어가기
          </Link>
        )}

        {!plant && ongoing.map((p) => (
          <Link key={p.id} className="rowcard" to={`/plan/${p.id}`} onClick={onClose}>
            <PlantIcon kind={SPECIES[p.species].icon} size={26} label="" />
            <span className="grow">{plantName(p)} 구조 작전 이어가기</span>
            <Icon name="chev" size={20} width={2} color="var(--gray)" />
          </Link>
        ))}

        <Link className="textlink center ink" to="/help" onClick={onClose}>사람 도움 받기</Link>
      </div>
    </div>
  );
}
