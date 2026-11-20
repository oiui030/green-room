// Photo diagnosis. The photo goes to our Supabase function, which holds the Pl@ntNet and
// Kindwise keys and returns one small answer (see supabase/functions/diagnose/index.ts).
import { SYMPTOMS } from './rescue.js';
import { SPECIES } from './catalog.js';

// A Supabase anon key is made to ship in client code; it only lets a caller reach the function.
const URL = 'https://gnzewqzybtemkaxrruyd.supabase.co/functions/v1/diagnose';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduemV3cXp5YnRlbWtheHJydXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUxNjU1NzMsImV4cCI6MjExMDc0MTU3M30.VGRmtdWIvpngAthqXctYE4w2kdmmxKourjOnhiTPLNA';
const HEADERS = { Authorization: `Bearer ${ANON}`, apikey: ANON };

// Off in tests, and in the preview build whose host blocks calls to other servers.
export function photoEnabled() {
  return import.meta.env.MODE !== 'test' && import.meta.env.VITE_ROUTER !== 'memory';
}

// Shrinks a picked photo to at most 1280px on the long side and returns
// { base64, preview }: the JPEG to send and a small data URL to show in the chat.
export async function preparePhoto(file) {
  const bitmap = await createImageBitmap(file);
  const draw = (max, quality) => {
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  };
  const full = draw(1280, 0.85);
  return { base64: full.slice(full.indexOf(',') + 1), preview: draw(480, 0.8) };
}

// Sends the photo. Resolves to the function's answer, or { error } with a short code.
export async function sendPhoto(base64) {
  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { ...HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, mime: 'image/jpeg' }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error || 'failed' };
    return data;
  } catch {
    return { error: 'network' };
  }
}

// Scientific names to the eight plants in our catalog.
function catalogKey(species) {
  if (!species || !species.found) return null;
  const name = (species.scientific || '').toLowerCase();
  const genus = (species.genus || name.split(' ')[0] || '').toLowerCase();
  if (genus === 'sansevieria' || name === 'dracaena angolensis' || name === 'dracaena trifasciata') return 'stuki';
  if (genus === 'epipremnum') return 'pothos';
  if (genus === 'monstera') return 'monstera';
  if ((species.family || '').toLowerCase() === 'cactaceae') return 'cactus';
  if (genus === 'zamioculcas') return 'zz';
  if (genus === 'chamaedorea') return 'palm';
  if (name === 'ficus elastica') return 'rubber';
  if (genus === 'hedera') return 'ivy';
  return null;
}

// Health classes (English names from Kindwise) to the five rescue plans we have.
const ISSUE_WORDS = {
  mushy: ['water excess', 'overwater', 'uneven watering', 'rot'],
  droopy: ['water deficiency', 'underwater', 'drought', 'wilt'],
  leggy: ['light deficiency', 'lack of light', 'insufficient light', 'etiolation'],
  yellow: ['nutrient', 'chlorosis', 'nitrogen', 'senescence'],
  brown: ['light excess', 'sunburn', 'scorch', 'low humidity', 'dry air', 'salt'],
};
function symptomKey(issue) {
  const name = (issue.name || '').toLowerCase();
  return Object.keys(ISSUE_WORDS).find((key) => ISSUE_WORDS[key].some((w) => name.includes(w))) || null;
}

const percent = (n) => `${Math.round(n * 100)}%`;

// Turns the function's answer into what the frog says and what it knows:
// { kind: 'error' | 'unclear' | 'healthy' | 'issue' | 'species', lines, species, symptom }.
// `species` is a catalog key or null; `symptom` is a rescue plan key or null.
export function interpret(result) {
  if (!result || result.error) {
    const lines = {
      not_configured: ['사진 진단은 아직 준비 중이에요.', '대신 증상을 골라주세요.'],
      rate_limited: ['사진을 너무 빨리 보냈어요.', '잠깐 쉬었다가 다시 해봐요.'],
      too_large: ['사진이 너무 커요.', '조금 멀리서 다시 찍어볼래요?'],
    }[result && result.error] || ['지금은 사진을 읽지 못했어요.', '잠시 뒤에 다시 해볼래요?'];
    return { kind: 'error', lines, species: null, symptom: null };
  }
  const { species, health } = result;
  const key = catalogKey(species);
  const sure = species && species.found && species.score >= 0.2;
  const seen = Boolean(sure) || Boolean(health && health.isPlant && health.healthy !== null);
  if (!seen || (health && health.isPlant === false && !sure)) {
    return { kind: 'unclear', lines: ['식물이 잘 안 보여요.', '잎이 크게 나오게 다시 찍어볼래요?'], species: null, symptom: null };
  }

  const lines = [];
  if (sure) {
    const name = key ? SPECIES[key].name : species.common || species.scientific;
    lines.push(`제 눈엔 ${name} 같아요 (${percent(species.score)}).`);
  } else if (species) {
    lines.push('어떤 식물인지는 잘 모르겠어요.');
  }

  const top = health && health.issues && health.issues.find((i) => i.probability >= 0.25);
  let symptom = null;
  let kind = 'species';
  if (health && health.healthy !== null) {
    if (health.healthy || !top) {
      kind = 'healthy';
      lines.push('사진으로는 건강해 보여요.');
    } else {
      kind = 'issue';
      symptom = symptomKey(top);
      lines.push(`의심되는 문제: ${top.localName || top.name} (${percent(top.probability)})`);
      if (symptom) lines.push(`${SYMPTOMS[symptom].verdict}. ${SYMPTOMS[symptom].cause}.`);
      else lines.push('이건 제가 가진 구조 작전 밖이에요. 사람 눈이 필요해요.');
    }
  } else if (result.failed && result.failed.health) {
    lines.push('건강 상태는 지금 읽지 못했어요.');
  } else if (!health) {
    lines.push('건강 진단은 아직 준비 중이라, 증상은 직접 골라주세요.');
  }
  lines.push('사진 한 장으로 본 추정이에요.');
  return { kind, lines, species: key && sure ? key : null, symptom };
}
