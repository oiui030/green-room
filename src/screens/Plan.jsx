import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Frog from '../components/Frog.jsx';
import { Page, BackLink } from '../components/Shell.jsx';
import { Missing } from './Discover.jsx';
import { useStore } from '../lib/store.jsx';
import { SYMPTOMS } from '../lib/rescue.js';
import { plantName } from '../lib/schedule.js';

export default function Plan() {
  const { id } = useParams();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const plant = state.plants.find((p) => p.id === id);
  if (!plant) return <Missing />;

  if (!plant.rescue) {
    return (
      <Page plantId={plant.id}>
        <BackLink to={`/plant/${plant.id}`} label={plantName(plant)} />
        <h1 className="h1">진행 중인 구조 작전이 없어요</h1>
        <span className="note">이상한 곳이 보이면 오른쪽 아래 개구리를 눌러요.</span>
      </Page>
    );
  }

  const symptom = SYMPTOMS[plant.rescue.symptom];
  const done = plant.rescue.done;
  const all = done.length === symptom.steps.length;

  const finish = () => {
    dispatch({ type: 'endRescue', id: plant.id });
    navigate(`/plant/${plant.id}`);
  };

  return (
    <Page frog={false} className="dark" deco={<span className="blob-deco" aria-hidden="true" />}>
      <BackLink to={`/plant/${plant.id}`} label={plantName(plant)} />
      <div className="row between gap-12">
        <div className="col gap-8 start">
          <span className="tag">{plantName(plant)} 구조 작전</span>
          <h1 className="h1">{symptom.verdict}</h1>
          <span className="note">{symptom.cause}</span>
        </div>
        <Frog size={104} ring={7} tone="lime" />
      </div>
      <div className="row gap-12">
        <div className="bar grow" role="progressbar" aria-valuemin={0} aria-valuemax={symptom.steps.length} aria-valuenow={done.length}>
          <span style={{ width: `${(done.length / symptom.steps.length) * 100}%` }} />
        </div>
        <span className="note">{symptom.steps.length}개 중 {done.length}개</span>
      </div>
      <div className="col gap-8">
        {symptom.steps.map(([when, title], i) => {
          const on = done.includes(i);
          return (
            <button key={title} type="button" className={`step${on ? ' on' : ''}`} aria-pressed={on} onClick={() => dispatch({ type: 'toggleStep', id: plant.id, step: i })}>
              <span className="step-dot"><Icon name="check" size={16} width={3} /></span>
              <span className="col gap-2">
                <span className="note">{when}</span>
                <span className="step-title">{title}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="card col gap-4">
        <span className="title-s">준비물</span>
        <span className="note">{symptom.supplies.join(', ')}</span>
      </div>
      <span className="note">고른 증상을 기준으로 한 응급처치 안내예요. 사진 진단이 아니에요.</span>
      <div className="bottom col gap-8">
        {all ? (
          <button type="button" className="btn primary" onClick={finish}>다 나았어요, 작전 끝</button>
        ) : (
          <Link className="btn secondary" to="/help">혼자 하긴 좀 무서워요</Link>
        )}
        {!all && <button type="button" className="textlink center" onClick={finish}>작전 그만두기</button>}
      </div>
    </Page>
  );
}
