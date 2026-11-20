import { SPECIES } from './catalog.js';
import { SYMPTOMS } from './rescue.js';
import { addDays, diffDays } from './dates.js';

const TASK_TEXT = { water: '물 주기', wipe: '잎 닦기' };

export function taskTitle(task, plant) {
  return `${plantName(plant)} ${TASK_TEXT[task.type]}`;
}

export function plantName(plant) {
  return plant.nickname || SPECIES[plant.species].name;
}

// Watering is paused while a plant is in a rescue plan that says to stop watering.
export function wateringPaused(plant) {
  return Boolean(plant.rescue && SYMPTOMS[plant.rescue.symptom]?.noWater);
}

export function nextWater(plant) {
  if (wateringPaused(plant)) return null;
  return addDays(plant.lastWatered, SPECIES[plant.species].waterDays);
}

export function nextWipe(plant) {
  const every = SPECIES[plant.species].wipeDays;
  if (!every) return null;
  return addDays(plant.lastWiped, every);
}

// Every upcoming task with its due date, soonest first.
export function allTasks(plants) {
  const out = [];
  for (const plant of plants) {
    const w = nextWater(plant);
    if (w) out.push({ plantId: plant.id, type: 'water', due: w });
    const p = nextWipe(plant);
    if (p) out.push({ plantId: plant.id, type: 'wipe', due: p });
  }
  return out.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.type === 'water' ? -1 : 1));
}

// Due today or overdue.
export function dueTasks(plants, today) {
  return allTasks(plants)
    .filter((t) => t.due <= today)
    .map((t) => ({ ...t, overdue: diffDays(today, t.due) }));
}

// Coming up after today, within `days`.
export function upcomingTasks(plants, today, days = 14) {
  const limit = addDays(today, days);
  return allTasks(plants).filter((t) => t.due > today && t.due <= limit);
}

// For each date, the kinds of task that fall on it. Overdue work shows on today.
export function marksFor(plants, dates, today) {
  const tasks = allTasks(plants);
  return dates.map((date) => {
    const kinds = new Set();
    for (const t of tasks) {
      const shown = t.due < today ? today : t.due;
      if (shown === date) kinds.add(t.type);
    }
    return { date, kinds: [...kinds] };
  });
}
