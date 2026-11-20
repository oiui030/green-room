import { describe, expect, it } from 'vitest';
import { addDays, diffDays, relativeLabel, weekOf, weekdayLabel } from '../src/lib/dates.js';
import { SPECIES, SPECIES_KEYS, fitFor } from '../src/lib/catalog.js';
import { SYMPTOMS, SYMPTOM_KEYS } from '../src/lib/rescue.js';
import { allTasks, dueTasks, marksFor, nextWater, upcomingTasks, wateringPaused } from '../src/lib/schedule.js';
import { initialState, reducer } from '../src/lib/store.jsx';

const FRI = '2026-11-20'; // a Friday

describe('dates', () => {
  it('adds and subtracts days across month and year ends', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(diffDays('2026-12-01', '2026-11-20')).toBe(11);
  });

  it('builds a Monday to Sunday week around a date', () => {
    const week = weekOf(FRI);
    expect(week).toHaveLength(7);
    expect(week[0]).toBe('2026-11-16');
    expect(week[6]).toBe('2026-11-22');
    expect(week.map(weekdayLabel).join('')).toBe('월화수목금토일');
    expect(weekOf('2026-11-22')[0]).toBe('2026-11-16'); // Sunday stays in the same week
  });

  it('labels dates relative to today', () => {
    expect(relativeLabel(FRI, FRI)).toBe('오늘');
    expect(relativeLabel('2026-11-21', FRI)).toBe('내일');
    expect(relativeLabel('2026-11-19', FRI)).toBe('어제');
    expect(relativeLabel('2026-11-25', FRI)).toBe('수요일');
    expect(relativeLabel('2026-12-05', FRI)).toBe('12월 5일');
  });
});

describe('catalog', () => {
  it('has complete entries and valid similar links', () => {
    for (const key of SPECIES_KEYS) {
      const s = SPECIES[key];
      expect(s.name).toBeTruthy();
      expect(s.waterDays).toBeGreaterThan(0);
      expect(s.light.length).toBeGreaterThan(0);
      expect(s.tips.length).toBeGreaterThanOrEqual(3);
      for (const other of s.similar) expect(SPECIES[other]).toBeTruthy();
    }
  });

  it('scores fit from room light and care style', () => {
    expect(fitFor('cactus', { light: 'low', style: 'week' }).label).toBe('햇빛이 고파요');
    expect(fitFor('stuki', { light: 'low', style: 'oops' }).label).toBe('찰떡궁합');
    expect(fitFor('pothos', { light: 'mid', style: 'oops' }).label).toBe('물을 자주 챙겨야 해요');
    expect(fitFor('pothos', { light: 'high', style: 'week' }).label).toBe('빛이 너무 세요');
    expect(fitFor('monstera', { light: 'mid', style: 'week' }).label).toBe('해볼 만해요');
  });
});

describe('rescue guides', () => {
  it('every symptom has a verdict, steps and supplies', () => {
    for (const key of SYMPTOM_KEYS) {
      const s = SYMPTOMS[key];
      expect(s.label && s.verdict && s.cause).toBeTruthy();
      expect(s.steps.length).toBeGreaterThanOrEqual(4);
      expect(s.supplies.length).toBeGreaterThan(0);
    }
  });
});

function withPlants(today = FRI) {
  let s = reducer(initialState, { type: 'addPlant', species: 'stuki', daysAgo: null, today }); // unknown: due today
  s = reducer(s, { type: 'addPlant', species: 'pothos', daysAgo: 0, today }); // due in 7 days
  s = reducer(s, { type: 'addPlant', species: 'cactus', daysAgo: 30, today }); // 9 days overdue
  return s;
}

describe('schedule', () => {
  it('works out due, overdue and upcoming tasks', () => {
    const s = withPlants();
    const due = dueTasks(s.plants, FRI);
    expect(due.map((t) => `${t.plantId}:${t.type}:${t.overdue}`)).toEqual(['p3:water:9', 'p1:water:0']);
    const up = upcomingTasks(s.plants, FRI);
    expect(up.map((t) => `${t.plantId}:${t.type}:${t.due}`)).toEqual(['p2:water:2026-11-27']);
    expect(upcomingTasks(s.plants, FRI, 40).some((t) => t.type === 'wipe' && t.plantId === 'p2')).toBe(true);
  });

  it('marks the week, showing overdue work on today', () => {
    const s = withPlants();
    const marks = marksFor(s.plants, weekOf(FRI), FRI);
    expect(marks.find((m) => m.date === FRI).kinds).toEqual(['water']);
    expect(marks.filter((m) => m.kinds.length).length).toBe(1);
  });

  it('watering moves the next date forward and writes a log', () => {
    let s = withPlants();
    s = reducer(s, { type: 'water', id: 'p1', today: FRI });
    expect(nextWater(s.plants[0])).toBe('2026-12-11');
    expect(dueTasks(s.plants, FRI).map((t) => t.plantId)).toEqual(['p3']);
    expect(s.logs[0]).toMatchObject({ plantId: 'p1', type: 'water', at: FRI, text: '스투키 물 줌' });
  });

  it('pauses watering during a no-water rescue and restarts the clock after', () => {
    let s = withPlants();
    s = reducer(s, { type: 'startRescue', id: 'p3', symptom: 'mushy', today: FRI });
    expect(wateringPaused(s.plants[2])).toBe(true);
    expect(allTasks(s.plants).some((t) => t.plantId === 'p3')).toBe(false);
    expect(reducer(s, { type: 'water', id: 'p3', today: FRI })).toBe(s); // watering is refused while paused
    s = reducer(s, { type: 'toggleStep', id: 'p3', step: 0 });
    s = reducer(s, { type: 'toggleStep', id: 'p3', step: 2 });
    s = reducer(s, { type: 'toggleStep', id: 'p3', step: 0 });
    expect(s.plants[2].rescue.done).toEqual([2]);
    s = reducer(s, { type: 'endRescue', id: 'p3', today: '2026-11-30' });
    expect(s.plants[2].rescue).toBeNull();
    expect(nextWater(s.plants[2])).toBe('2026-12-21');
    expect(s.logs.map((l) => l.type).slice(0, 2)).toEqual(['recover', 'rescue']);
  });

  it('a rescue that allows watering keeps the schedule', () => {
    let s = withPlants();
    s = reducer(s, { type: 'startRescue', id: 'p2', symptom: 'leggy', today: FRI });
    expect(wateringPaused(s.plants[1])).toBe(false);
    expect(nextWater(s.plants[1])).toBe('2026-11-27');
  });
});

describe('store', () => {
  it('ignores unknown species, plants and symptoms', () => {
    const s = withPlants();
    expect(reducer(s, { type: 'addPlant', species: 'nope' })).toBe(s);
    expect(reducer(s, { type: 'water', id: 'zzz' })).toBe(s);
    expect(reducer(s, { type: 'startRescue', id: 'p1', symptom: 'nope' })).toBe(s);
    expect(reducer(s, { type: 'endRescue', id: 'p1' })).toBe(s);
  });

  it('removing a plant removes its logs and keeps ids unique afterwards', () => {
    let s = withPlants();
    s = reducer(s, { type: 'removePlant', id: 'p2' });
    expect(s.plants.map((p) => p.id)).toEqual(['p1', 'p3']);
    expect(s.logs.some((l) => l.plantId === 'p2')).toBe(false);
    s = reducer(s, { type: 'addPlant', species: 'ivy', daysAgo: 0, today: FRI });
    expect(s.plants.map((p) => p.id)).toEqual(['p1', 'p3', 'p4']);
    expect(new Set(s.logs.map((l) => l.id)).size).toBe(s.logs.length);
  });
});

describe('frog talk', () => {
  it('reads symptoms and intents from plain words, symptoms first', async () => {
    const { matchText } = await import('../src/lib/frogtalk.js');
    expect(matchText('잎이 노랗고 이상해요')).toEqual({ symptom: 'yellow' });
    expect(matchText('요즘 시들시들해')).toEqual({ symptom: 'droopy' });
    expect(matchText('물 언제 줘야 해')).toEqual({ intent: 'water' });
    expect(matchText('초보한테 추천해줘')).toEqual({ intent: 'recommend' });
    expect(matchText('오늘 날씨 좋네')).toBeNull();
    expect(matchText('   ')).toBeNull();
  });

  it('types for a short, bounded time that grows with the reply', async () => {
    const { typingDelay } = await import('../src/lib/frogtalk.js');
    expect(typingDelay('네')).toBeGreaterThanOrEqual(500);
    expect(typingDelay('가'.repeat(20))).toBeGreaterThan(typingDelay('가'));
    expect(typingDelay('가'.repeat(500))).toBe(1200);
    expect(typingDelay('가'.repeat(500), true)).toBe(250);
  });
});
