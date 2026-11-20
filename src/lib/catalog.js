// Plant catalog. Intervals are starting defaults: always check the soil first.
// light: which room light levels the plant tolerates. waterDays / wipeDays: care interval in days.

export const SPECIES = {
  stuki: {
    name: '스투키', icon: 'stuki', waterDays: 21, wipeDays: 0, light: ['low', 'mid', 'high'],
    water: '가끔', sun: '어둑해도', level: '초보용',
    tips: ['흙 속까지 마르면 듬뿍 줘요', '겨울엔 한 달에 한 번이면 돼요', '물이 고이면 뿌리가 썩어요'],
    similar: ['zz', 'cactus'],
  },
  pothos: {
    name: '스킨답서스', icon: 'pothos', waterDays: 7, wipeDays: 30, light: ['low', 'mid'],
    water: '주 1회', sun: '은은하게', level: '초보용',
    tips: ['겉흙이 마르면 줘요', '잎이 처지면 목마르다는 신호예요', '직사광선은 잎이 타요'],
    similar: ['monstera', 'ivy'],
  },
  monstera: {
    name: '몬스테라', icon: 'monstera', waterDays: 7, wipeDays: 30, light: ['mid', 'high'],
    water: '주 1회', sun: '은은하게', level: '해볼 만해요',
    tips: ['겉흙이 마르면 줘요', '밝은 그늘에서 잎이 갈라져요', '넓은 잎은 가끔 닦아줘요'],
    similar: ['pothos', 'rubber'],
  },
  cactus: {
    name: '선인장', icon: 'cactus', waterDays: 21, wipeDays: 0, light: ['high'],
    water: '가끔', sun: '쨍쨍하게', level: '빛이 중요해요',
    tips: ['흙이 완전히 마른 뒤에 줘요', '창가 맨 앞자리가 좋아요', '겨울엔 물을 거의 안 줘요'],
    similar: ['stuki', 'zz'],
  },
  zz: {
    name: '금전수', icon: 'zz', waterDays: 21, wipeDays: 30, light: ['low', 'mid', 'high'],
    water: '가끔', sun: '어둑해도', level: '초보용',
    tips: ['흙 속까지 마르면 줘요', '물을 자주 주면 오히려 탈 나요', '잎에 윤이 나게 가끔 닦아요'],
    similar: ['stuki', 'rubber'],
  },
  palm: {
    name: '테이블야자', icon: 'palm', waterDays: 7, wipeDays: 0, light: ['low', 'mid'],
    water: '주 1회', sun: '은은하게', level: '초보용',
    tips: ['겉흙이 마르면 줘요', '잎 끝이 마르면 공기가 건조한 거예요', '직사광선은 피해요'],
    similar: ['pothos', 'ivy'],
  },
  rubber: {
    name: '고무나무', icon: 'rubber', waterDays: 10, wipeDays: 30, light: ['mid', 'high'],
    water: '열흘에 한 번', sun: '은은하게', level: '해볼 만해요',
    tips: ['겉흙이 마르면 줘요', '자리를 자주 옮기면 잎을 떨궈요', '넓은 잎은 가끔 닦아줘요'],
    similar: ['monstera', 'zz'],
  },
  ivy: {
    name: '아이비', icon: 'ivy', waterDays: 7, wipeDays: 0, light: ['mid'],
    water: '주 1회', sun: '은은하게', level: '해볼 만해요',
    tips: ['겉흙이 마르면 줘요', '바람이 잘 통해야 해요', '너무 건조하면 벌레가 생겨요'],
    similar: ['pothos', 'palm'],
  },
};

export const SPECIES_KEYS = Object.keys(SPECIES);

// How well a species suits the room and the owner. Returns { score, label, tone }.
export function fitFor(key, profile) {
  const s = SPECIES[key];
  const lightOk = s.light.includes(profile.light);
  const forgetful = profile.style === 'oops';
  const thirsty = s.waterDays <= 7;
  if (!lightOk) {
    const needsMore = profile.light === 'low' || (profile.light === 'mid' && !s.light.includes('mid'));
    return { score: 0, label: needsMore ? '햇빛이 고파요' : '빛이 너무 세요', tone: 'warn' };
  }
  if (forgetful && thirsty) return { score: 1, label: '물을 자주 챙겨야 해요', tone: 'plain' };
  if (s.level === '초보용' || !thirsty) return { score: 3, label: '찰떡궁합', tone: 'good' };
  return { score: 2, label: '해볼 만해요', tone: 'plain' };
}
