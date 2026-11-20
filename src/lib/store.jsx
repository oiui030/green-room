import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { SPECIES } from './catalog.js';
import { SYMPTOMS } from './rescue.js';
import { addDays, todayStr } from './dates.js';

export const STORAGE_KEY = 'green-room/v1';

export const initialState = {
  profile: { onboarded: false, light: 'mid', style: 'week' },
  plants: [],
  logs: [],
  seq: 1,
};

function log(state, today, plantId, type, text) {
  return [{ id: `l${state.seq}`, at: today, plantId, type, text }, ...state.logs];
}

function mapPlant(state, id, fn) {
  return state.plants.map((p) => (p.id === id ? fn(p) : p));
}

export function reducer(state, action) {
  const today = action.today || todayStr();
  switch (action.type) {
    case 'onboard':
      return { ...state, profile: { ...state.profile, ...action.profile, onboarded: true } };

    case 'addPlant': {
      const species = SPECIES[action.species];
      if (!species) return state;
      const id = `p${state.seq}`;
      // daysAgo: how long ago it was last watered. Unknown means "treat it as due today".
      const daysAgo = action.daysAgo == null ? species.waterDays : action.daysAgo;
      const plant = {
        id, species: action.species, nickname: '', addedAt: today,
        lastWatered: addDays(today, -daysAgo), lastWiped: today, rescue: null,
      };
      return { ...state, plants: [...state.plants, plant], logs: log(state, today, id, 'add', `${species.name} 등록`), seq: state.seq + 1 };
    }

    case 'removePlant':
      return { ...state, plants: state.plants.filter((p) => p.id !== action.id), logs: state.logs.filter((l) => l.plantId !== action.id) };

    case 'water': {
      const plant = state.plants.find((p) => p.id === action.id);
      // No watering while a rescue plan says to keep the plant dry.
      if (!plant || (plant.rescue && SYMPTOMS[plant.rescue.symptom].noWater)) return state;
      return {
        ...state,
        plants: mapPlant(state, action.id, (p) => ({ ...p, lastWatered: today })),
        logs: log(state, today, action.id, 'water', `${SPECIES[plant.species].name} 물 줌`),
        seq: state.seq + 1,
      };
    }

    case 'wipe': {
      const plant = state.plants.find((p) => p.id === action.id);
      if (!plant) return state;
      return {
        ...state,
        plants: mapPlant(state, action.id, (p) => ({ ...p, lastWiped: today })),
        logs: log(state, today, action.id, 'wipe', `${SPECIES[plant.species].name} 잎 닦음`),
        seq: state.seq + 1,
      };
    }

    case 'startRescue': {
      const plant = state.plants.find((p) => p.id === action.id);
      const symptom = SYMPTOMS[action.symptom];
      if (!plant || !symptom) return state;
      return {
        ...state,
        plants: mapPlant(state, action.id, (p) => ({ ...p, rescue: { symptom: action.symptom, startedAt: today, done: [] } })),
        logs: log(state, today, action.id, 'rescue', `${SPECIES[plant.species].name} 구조 작전 시작, ${symptom.cause.split(',')[0]}`),
        seq: state.seq + 1,
      };
    }

    case 'toggleStep':
      return {
        ...state,
        plants: mapPlant(state, action.id, (p) => {
          if (!p.rescue) return p;
          const done = p.rescue.done.includes(action.step) ? p.rescue.done.filter((s) => s !== action.step) : [...p.rescue.done, action.step];
          return { ...p, rescue: { ...p.rescue, done } };
        }),
      };

    case 'endRescue': {
      const plant = state.plants.find((p) => p.id === action.id);
      if (!plant || !plant.rescue) return state;
      // Coming out of a no-water plan, restart the watering clock from today.
      const resume = SYMPTOMS[plant.rescue.symptom].noWater ? { lastWatered: today } : {};
      return {
        ...state,
        plants: mapPlant(state, action.id, (p) => ({ ...p, ...resume, rescue: null })),
        logs: log(state, today, action.id, 'recover', `${SPECIES[plant.species].name} 구조 작전 끝`),
        seq: state.seq + 1,
      };
    }

    case 'restore':
      return action.state;

    case 'reset':
      return initialState;

    default:
      return state;
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const saved = JSON.parse(raw);
    return { ...initialState, ...saved, profile: { ...initialState.profile, ...saved.profile } };
  } catch {
    return initialState;
  }
}

const Ctx = createContext(null);

export function StoreProvider({ children, initial }) {
  const [state, dispatch] = useReducer(reducer, initial, (init) => init || loadState());
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable (private mode, quota). The app still works for this visit.
    }
  }, [state]);
  // `act` is dispatch for things a thumb can do by accident: it remembers the state
  // from just before, and shows a short message with a way back.
  const [toast, setToast] = useState(null);
  const act = useCallback((action, message) => {
    setToast({ message, prev: state, at: Date.now() });
    dispatch(action);
  }, [state]);
  const undo = useCallback(() => {
    if (toast) dispatch({ type: 'restore', state: toast.prev });
    setToast(null);
  }, [toast]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);
  const value = useMemo(() => ({ state, dispatch, act, undo, toast }), [state, act, undo, toast]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
