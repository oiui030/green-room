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

// Filled plant silhouettes, one per species icon. Fine lines inside a shape are drawn in
// `--cut`, which each blob sets to its own background colour so they read as gaps.
const CUT = { fill: 'none', stroke: 'var(--cut, transparent)', strokeLinecap: 'round' };
const FROND = 'M24 46 C21.5 34 22 20 24 6 C26 20 26.5 34 24 46z';
const PLANTS = {
  stuki: (
    <path d="M14 44 C10 30 12 14 16 6 C20 16 20 32 18 44z M24 44 C21 28 22 10 25 2 C29 12 29 30 27 44z M33 44 C31 32 32 18 35 10 C39 20 38 34 36 44z" />
  ),
  cactus: (
    <path d="M19 44 V13 a5 5 0 0 1 10 0 V44z M8 22 a4 4 0 0 1 8 0 v5 h4 v7 h-6 a6 6 0 0 1 -6 -6z M40 18 a4 4 0 0 0 -8 0 v7 h-4 v7 h6 a6 6 0 0 0 6 -6z" />
  ),
  pothos: (
    <>
      <path d="M24 43 C8 33 6 18 14 12 C19 9 23 12 24 16 C25 12 29 9 34 12 C42 18 40 33 24 43z" />
      <path d="M24 40 V20" strokeWidth="2.5" {...CUT} />
    </>
  ),
  monstera: (
    <>
      <path d="M24 4 C38 6 44 18 42 30 C40 40 30 44 24 44 C18 44 8 40 6 30 C4 18 10 6 24 4z" />
      <path d="M24 44 V14 M6 28 h9 M42 28 h-9 M9 16 l8 5 M39 16 l-8 5" strokeWidth="3" {...CUT} />
    </>
  ),
  zz: (
    <>
      <path d="M23 46 h2 V8 h-2z" />
      <ellipse cx="24" cy="6.5" rx="3.6" ry="5.5" />
      {[13, 22, 31, 40].map((y) => (
        <g key={y}>
          <ellipse cx="15.5" cy={y} rx="7.5" ry="3.7" transform={`rotate(24 15.5 ${y})`} />
          <ellipse cx="32.5" cy={y} rx="7.5" ry="3.7" transform={`rotate(-24 32.5 ${y})`} />
        </g>
      ))}
    </>
  ),
  palm: (
    <>
      {[-62, -38, -14, 14, 38, 62].map((deg) => <path key={deg} d={FROND} transform={`rotate(${deg} 24 46)`} />)}
    </>
  ),
  rubber: (
    <>
      <path d="M23 46 h2 V30 h-2z" />
      <ellipse cx="24" cy="18" rx="8.5" ry="15" />
      <ellipse cx="12.5" cy="30" rx="6.5" ry="11.5" transform="rotate(-42 12.5 30)" />
      <ellipse cx="35.5" cy="30" rx="6.5" ry="11.5" transform="rotate(42 35.5 30)" />
      <path d="M24 31 V8" strokeWidth="2" {...CUT} />
    </>
  ),
  ivy: (
    <>
      <path d="M24 45 C22 39 14 41 5 35 C11 31 10 24 5 15 C14 18 19 15 24 3 C29 15 34 18 43 15 C38 24 37 31 43 35 C34 41 26 39 24 45z" />
      <path d="M24 42 V14 M24 30 L12 22 M24 30 L36 22" strokeWidth="2.2" {...CUT} />
    </>
  ),
};

export function PlantIcon({ kind, size = 36, color = 'currentColor', label }) {
  return (
    <svg role="img" aria-label={label} width={size} height={size} viewBox="0 0 48 48" fill={color} style={{ flexShrink: 0 }}>
      {PLANTS[kind]}
    </svg>
  );
}
