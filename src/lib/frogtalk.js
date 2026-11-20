// What the frog can make of a typed message. There is no language model behind it:
// it looks for a few plain words and otherwise says it could not read the message.
const SYMPTOM_WORDS = {
  mushy: ['무르', '무른', '물렁', '물컹', '썩', '과습', '냄새'],
  droopy: ['처지', '처졌', '처져', '시들', '쭈글', '힘이 없', '축 '],
  leggy: ['웃자', '삐죽', '가늘', '길쭉', '키만'],
  yellow: ['노랗', '노란', '노래', '누렇', '누런'],
  brown: ['갈색', '말라', '마르', '바삭', '탔', '타들'],
};
const INTENT_WORDS = {
  help: ['사람', '병원', '클리닉', '전문가', '상담'],
  recommend: ['추천', '뭐 키', '뭘 키', '어떤 식물', '초보', '사고 싶', '살까'],
  water: ['물 언제', '물주', '물 주', '언제 줘', '며칠', '주기'],
  sick: ['이상', '아파', '아픈', '죽', '벌레', '병'],
};

// Returns { symptom } or { intent } or null. Symptoms win, so "잎이 노랗고 이상해요" reads as yellow leaves.
export function matchText(text) {
  const t = text.trim();
  if (!t) return null;
  for (const [symptom, words] of Object.entries(SYMPTOM_WORDS)) {
    if (words.some((w) => t.includes(w))) return { symptom };
  }
  for (const [intent, words] of Object.entries(INTENT_WORDS)) {
    if (words.some((w) => t.includes(w))) return { intent };
  }
  return null;
}
