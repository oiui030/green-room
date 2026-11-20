import Icon from './Icon.jsx';
import { useStore } from '../lib/store.jsx';
import { SPECIES } from '../lib/catalog.js';
import { taskTitle } from '../lib/schedule.js';

const DONE_LABEL = { water: '줬어요', wipe: '닦았어요' };
const ICON = { water: 'drop', wipe: 'leaf' };

function note(task, plant) {
  if (task.overdue > 0) return `${task.overdue}일 지났어요. 흙부터 만져봐요`;
  if (task.type === 'water') return SPECIES[plant.species].tips[0];
  return '젖은 천으로 살살 닦아줘요';
}

// The one thing to do now, with the single gradient button on the screen.
export default function TaskCard({ task, plant, eyebrow }) {
  const { dispatch } = useStore();
  return (
    <div className="card row gap-12 task">
      <span className="disc"><Icon name={ICON[task.type]} size={26} width={2} color="var(--green)" /></span>
      <div className="grow col gap-2">
        {eyebrow && <span className="note">{eyebrow}</span>}
        <span className="hand title-task">{taskTitle(task, plant)}</span>
        <span className="note">{note(task, plant)}</span>
      </div>
      <button type="button" className="btn primary small" onClick={() => dispatch({ type: task.type, id: plant.id })}>
        {DONE_LABEL[task.type]}
      </button>
    </div>
  );
}
