const PATHS = {
  drop: 'M12 3 C9 8 6 11 6 15 a6 6 0 0 0 12 0 C18 11 15 8 12 3z',
  sprout: 'M12 21 v-8 M12 14 C7 14 5 11 5 7 c4 0 7 2 7 7z M12 12 c0 -4 3 -6 7 -6 c0 4 -3 6 -7 6z',
  camera: 'M3 8 h4 l2 -3 h6 l2 3 h4 v11 H3z M12 17 a3.5 3.5 0 1 0 0 -7 a3.5 3.5 0 0 0 0 7z',
  calendar: 'M4 6 h16 v14 H4z M4 10 h16 M8 3 v5 M16 3 v5',
  book: 'M3 6 q5 -2 9 1 q4 -3 9 -1 v12 q-5 -2 -9 1 q-4 -3 -9 -1z M12 7 v12',
  room: 'M4 4 h16 v16 H4z M12 4 v16 M4 12 h16',
  sos: 'M5 3 h14 a2 2 0 0 1 2 2 v14 a2 2 0 0 1 -2 2 H5 a2 2 0 0 1 -2 -2 V5 a2 2 0 0 1 2 -2z M12 7 v10 M7 12 h10',
  bell: 'M6 17 q2 -2 2 -7 a4 4 0 0 1 8 0 q0 5 2 7z M10 20 a2 2 0 0 0 4 0',
  leaf: 'M5 19 C4 10 10 4 20 4 C20 14 14 20 5 19z M5 19 L15 9',
  sun: 'M12 8 a4 4 0 1 0 0 8 a4 4 0 0 0 0 -8z M12 2 v2 M12 20 v2 M2 12 h2 M20 12 h2 M5 5 l1.5 1.5 M17.5 17.5 L19 19 M5 19 l1.5 -1.5 M17.5 6.5 L19 5',
  wind: 'M3 9 h11 a3 3 0 1 0 -3 -3 M3 14 h15 a3 3 0 1 1 -3 3 M3 19 h7',
  chev: 'M9 6l6 6-6 6',
  back: 'M15 6l-6 6 6 6',
  check: 'M5 12l5 5 9-10',
  list: 'M5 6 h14 M5 12 h14 M5 18 h9',
  chat: 'M4 5 h16 v11 H9 l-5 4z',
  close: 'M6 6 l12 12 M18 6 L6 18',
  plus: 'M12 5 v14 M5 12 h14',
  send: 'M5 12 h13 M12 6 l6 6 -6 6',
  trash: 'M5 7 h14 M9 7 V4 h6 v3 M7 7 l1 13 h8 l1 -13',
};

export default function Icon({ name, size = 24, color = 'currentColor', width = 1.8 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={PATHS[name]} />
    </svg>
  );
}

const POT = <path d="M17 52 h26 l-3 20 h-20z" />;
const PLANTS = {
  stuki: (
    <>
      <path d="M30 52 C24 40 24 22 30 8 C36 22 36 40 30 52z" />
      <path d="M30 52 C20 46 14 36 14 24 C22 26 28 36 30 52z" />
      <path d="M30 52 C40 46 46 36 46 24 C38 26 32 36 30 52z" />
    </>
  ),
  cactus: (
    <>
      <path d="M24 52 V18 a6 6 0 0 1 12 0 V52" />
      <path d="M24 42 h-5 a5 5 0 0 1 -5 -5 v-6" />
      <path d="M36 36 h5 a5 5 0 0 0 5 -5 v-5" />
    </>
  ),
  pothos: (
    <>
      <path d="M30 52 V28" />
      <path d="M30 52 C30 42 24 38 16 40" />
      <path d="M30 52 C30 40 36 34 44 36" />
      <ellipse cx="30" cy="22" rx="6" ry="7" />
      <ellipse cx="12" cy="38" rx="6" ry="5" />
      <ellipse cx="48" cy="34" rx="6" ry="5" />
    </>
  ),
  monstera: (
    <>
      <path d="M30 52 V34" />
      <path d="M30 34 C16 34 10 22 15 10 C24 5 36 5 45 10 C50 22 44 34 30 34z" />
      <path d="M30 34 V12 M30 26 L21 19 M30 26 L39 19" />
    </>
  ),
  zz: (
    <>
      <path d="M26 52 C24 38 20 24 16 12" />
      <path d="M34 52 C36 38 40 24 44 12" />
      <path d="M22 40 l-8 -2 M20 30 l-8 -2 M18 20 l-7 -2 M38 40 l8 -2 M40 30 l8 -2 M42 20 l7 -2" />
    </>
  ),
  palm: (
    <>
      <path d="M30 52 V26" />
      <path d="M30 26 C22 20 14 20 8 26 M30 26 C38 20 46 20 52 26 M30 26 C26 16 20 10 12 10 M30 26 C34 16 40 10 48 10 M30 26 V8" />
    </>
  ),
  rubber: (
    <>
      <path d="M30 52 V14" />
      <ellipse cx="20" cy="38" rx="9" ry="5" transform="rotate(-25 20 38)" />
      <ellipse cx="40" cy="30" rx="9" ry="5" transform="rotate(25 40 30)" />
      <ellipse cx="22" cy="20" rx="8" ry="5" transform="rotate(-25 22 20)" />
    </>
  ),
  ivy: (
    <>
      <path d="M30 52 C30 40 18 40 14 50 C12 58 12 64 14 70" />
      <path d="M30 52 C30 38 44 38 46 48 C48 56 48 62 46 68" />
      <path d="M30 52 V34" />
      <path d="M30 34 l-5 -6 5 -8 5 8z M14 50 l-5 -3 1 -6 6 2z M46 48 l5 -3 -1 -6 -6 2z" />
    </>
  ),
};

export function PlantIcon({ kind, size = 36, color = 'currentColor', label }) {
  return (
    <svg role="img" aria-label={label} width={size} height={Math.round((size * 80) / 60)} viewBox="0 0 60 80" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {PLANTS[kind]}
      {POT}
    </svg>
  );
}
