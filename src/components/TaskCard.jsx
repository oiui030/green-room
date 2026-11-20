import Icon from './Icon.jsx';
import { useStore } from '../lib/store.jsx';
import { SPECIES } from '../lib/catalog.js';
import { taskTitle } from '../lib/schedule.js';

export const DONE_LABEL = { water: '줬어요', wipe: '닦았어요' };
export const doneMessage = (type, plant) => `${SPECIES[plant.species].name} ${type === 'water' ? '물 줬어요' : '잎 닦았어요'}`;
const ICON = { water: 'drop', wipe: 'leaf' };

export function taskNote(task, plant) {
  if (task.overdue > 0) return `${task.overdue}일 지났어요. 흙부터 만져봐요`;
  if (task.type === 'water') return SPECIES[plant.species].tips[0];
  return '젖은 천으로 살살 닦아줘요';
}

// One thing to do today. Its button is the dark green and lime main action.
export default function TaskCard({ task, plant }) {
  const { act } = useStore();
  return (
    <div className="card row gap-12 task">
      <span className="disc lime"><Icon name={ICON[task.type]} size={24} width={2.2} /></span>
      <div className="grow col gap-2">
                <span className="hand title-task">{taskTitle(task, plant)}</span>
        <span className="note">{taskNote(task, plant)}</span>
      </div>
      <button type="button" className="btn primary small" onClick={() => act({ type: task.type, id: plant.id }, doneMessage(task.type, plant))}>
        {DONE_LABEL[task.type]}
      </button>
    </div>
  );
}
