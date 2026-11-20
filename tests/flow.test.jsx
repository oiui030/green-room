import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App.jsx';
import { StoreProvider, STORAGE_KEY, initialState, reducer } from '../src/lib/store.jsx';
import { todayStr } from '../src/lib/dates.js';

function renderApp(path = '/', initial) {
  return render(
    <StoreProvider initial={initial}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </StoreProvider>,
  );
}

function onboarded(build = (s) => s) {
  return build(reducer(initialState, { type: 'onboard', profile: { light: 'mid', style: 'week' } }));
}

describe('first run', () => {
  it('walks intro, about and onboarding, then registers a plant that is due today', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.click(screen.getByRole('link', { name: '시작하기' }));
    await user.click(screen.getByRole('link', { name: '좋아요' }));
    await user.click(screen.getByRole('button', { name: /거의 안 들어요/ }));
    expect(screen.getByRole('button', { name: /거의 안 들어요/ })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: '다음' }));
    expect(screen.getByRole('heading', { name: /자주 깜빡하나요/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '이전 질문' }));
    expect(screen.getByRole('button', { name: /거의 안 들어요/ })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: '다음' }));
    await user.click(screen.getByRole('button', { name: /자주 잊어요/ }));
    await user.click(screen.getByRole('button', { name: '다음' }));
    await user.click(screen.getByRole('button', { name: /있어요.*도감에서 골라 등록해요/ }));

    expect(screen.getByRole('heading', { name: '어떤 식물인가요?' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /스킨답서스/ }));
    await user.click(screen.getByRole('button', { name: '우리 집 식구로 등록' }));
    await user.click(screen.getByRole('button', { name: '일주일 전' }));

    expect(screen.getByText('오늘은 돌보는 날')).toBeInTheDocument();
    expect(screen.getByText('스킨답서스 물 주기')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '줬어요' }));
    expect(screen.getByText('오늘 할 일 없음')).toBeInTheDocument();

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(saved.profile).toMatchObject({ onboarded: true, light: 'low' });
    expect(saved.plants[0].lastWatered).toBe(todayStr());
  });

  it('sends app screens to the intro until onboarding is done', () => {
    renderApp('/home');
    expect(screen.getByRole('link', { name: '시작하기' })).toBeInTheDocument();
  });

  it('restores saved state on the next visit', () => {
    const state = onboarded((s) => reducer(s, { type: 'addPlant', species: 'stuki', daysAgo: 0 }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderApp('/');
    expect(screen.getByText('오늘은 쉬는 날')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /스투키/ })).toBeInTheDocument();
  });
});

describe('care, log and discover', () => {
  it('shows due and upcoming work on the calendar and logs what was done', async () => {
    const user = userEvent.setup();
    const state = onboarded((s) => {
      let n = reducer(s, { type: 'addPlant', species: 'stuki', daysAgo: null });
      n = reducer(n, { type: 'addPlant', species: 'pothos', daysAgo: 3 });
      return n;
    });
    renderApp('/care', state);
    expect(screen.getByText('스투키 물 주기')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /스킨답서스 물 주기/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '줬어요' }));
    expect(screen.getByText('오늘 할 일 없음')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: '기록' }));
    expect(screen.getByText('스투키 물 줌')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '스킨답서스' }));
    expect(screen.queryByText('스투키 물 줌')).not.toBeInTheDocument();
    expect(screen.getByText('스킨답서스 등록')).toBeInTheDocument();
  });

  it('ranks the catalog for the room and filters it', async () => {
    const user = userEvent.setup();
    const state = reducer(initialState, { type: 'onboard', profile: { light: 'low', style: 'oops' } });
    renderApp('/discover', state);
    const cards = screen.getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('/species/'));
    expect(cards).toHaveLength(8);
    expect(within(cards[0]).getByText('찰떡궁합')).toBeInTheDocument();
    expect(within(cards[cards.length - 1]).getByText('햇빛이 고파요')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '물 적게' }));
    const dry = screen.getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('/species/'));
    expect(dry.map((a) => a.getAttribute('href'))).toEqual(['/species/stuki', '/species/cactus', '/species/zz']);
  });
});

describe('frog helper', () => {
  it('opens from any tab screen, starts a rescue plan and tracks the steps', async () => {
    const user = userEvent.setup();
    const state = onboarded((s) => reducer(s, { type: 'addPlant', species: 'cactus', daysAgo: 0 }));
    renderApp('/log', state);
    await user.click(screen.getByRole('button', { name: '개구리에게 도움 요청' }));
    const sheet = screen.getByRole('dialog', { name: '개구리 도우미' });
    await user.click(within(sheet).getByRole('button', { name: '식물이 이상해요' }));
    expect(within(sheet).getByText('선인장, 어떤 모습이에요?')).toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: /밑동이 무르고/ }));
    expect(within(sheet).getByText(/물배가 빵빵해요/)).toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: '구조 작전 시작' }));

    expect(screen.getByRole('heading', { name: '물배가 빵빵해요' })).toBeInTheDocument();
    expect(screen.getByText('6개 중 0개')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /물뿌리개 내려놓기/ }));
    expect(screen.getByText('6개 중 1개')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /물뿌리개 내려놓기/ })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('link', { name: '선인장' }));
    expect(screen.getByText('구조 중이라 쉬어요')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '지금 물 줬어요' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '구조 작전 이어가기' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /구조 작전 진행 중/ }));
    await user.click(screen.getByRole('button', { name: '작전 그만두기' }));
    expect(screen.queryByText('구조 작전 진행 중')).not.toBeInTheDocument();
  });

  it('asks which plant when there are several, and points to the catalog when there are none', async () => {
    const user = userEvent.setup();
    renderApp('/home', onboarded());
    await user.click(screen.getByRole('button', { name: '개구리에게 도움 요청' }));
    await user.click(screen.getByRole('button', { name: '식물이 이상해요' }));
    expect(screen.getByRole('button', { name: '도감에서 등록하기' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '닫기' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('removes a plant only after confirming', async () => {
    const user = userEvent.setup();
    const state = onboarded((s) => reducer(s, { type: 'addPlant', species: 'ivy', daysAgo: 0 }));
    renderApp('/plant/p1', state);
    await user.click(screen.getByRole('button', { name: /이 식물과 헤어지기/ }));
    await user.click(screen.getByRole('button', { name: '아니요' }));
    expect(screen.getByRole('heading', { name: '아이비' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /이 식물과 헤어지기/ }));
    await user.click(screen.getByRole('button', { name: '헤어질게요' }));
    expect(screen.getByText('아직 식구가 없어요')).toBeInTheDocument();
  });
});

describe('improvements from the walkthrough', () => {
  it('lets a mistaken tap on the done button be undone', async () => {
    const user = userEvent.setup();
    renderApp('/home', onboarded((s) => reducer(s, { type: 'addPlant', species: 'pothos', daysAgo: 7 })));
    await user.click(screen.getByRole('button', { name: '줬어요' }));
    expect(screen.getByText('오늘 할 일 없음')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('스킨답서스 물 줬어요');
    await user.click(screen.getByRole('button', { name: '되돌리기' }));
    expect(screen.getByText('스킨답서스 물 주기')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows an unfinished rescue plan on the home screen instead of a rest day', async () => {
    const user = userEvent.setup();
    const state = onboarded((s) => reducer(reducer(s, { type: 'addPlant', species: 'ivy', daysAgo: 0 }), { type: 'startRescue', id: 'p1', symptom: 'yellow' }));
    renderApp('/home', state);
    expect(screen.getByText('구조 작전 중')).toBeInTheDocument();
    expect(screen.queryByText('오늘은 쉬는 날')).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: '이어가기' }));
    expect(screen.getByRole('heading', { name: '뿌리가 답답해요' })).toBeInTheDocument();
  });

  it('suggests plants for the room on an empty home and lets the room be changed from the catalog', async () => {
    const user = userEvent.setup();
    renderApp('/home', reducer(initialState, { type: 'onboard', profile: { light: 'low', style: 'oops' } }));
    expect(screen.getByText('내 방에 맞는 친구')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /스투키.*찰떡궁합/ })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: '전부 보기' }));
    expect(screen.getByText('햇빛 적은 방, 자주 잊는 집사 기준이에요')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: '바꾸기' }));
    expect(screen.getByRole('button', { name: /거의 안 들어요/ })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: /햇빛 맛집이에요/ }));
    await user.click(screen.getByRole('button', { name: '다음' }));
    await user.click(screen.getByRole('button', { name: '이 기준으로 다시 고르기' }));
    expect(screen.getByText('햇빛 잘 드는 방, 자주 잊는 집사 기준이에요')).toBeInTheDocument();
  });
});

describe('frog chat', () => {
  const two = () => onboarded((s) => reducer(reducer(s, { type: 'addPlant', species: 'stuki', daysAgo: 0 }), { type: 'addPlant', species: 'pothos', daysAgo: 7 }));

  it('asks which plant when there are several, then offers a rescue plan to confirm', async () => {
    const user = userEvent.setup();
    renderApp('/home', two());
    await user.click(screen.getByRole('button', { name: /어딘가 이상해요/ }));
    const sheet = screen.getByRole('dialog', { name: '개구리 도우미' });
    expect(within(sheet).getByText('어느 식물이에요?')).toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: '스투키' }));
    await user.click(within(sheet).getByRole('button', { name: /잎이 노랗게/ }));
    await user.click(within(sheet).getByRole('button', { name: '다른 증상이에요' }));
    await user.click(within(sheet).getByRole('button', { name: /키만 삐죽/ }));
    await user.click(within(sheet).getByRole('button', { name: '구조 작전 시작' }));
    expect(screen.getByRole('heading', { name: '햇빛이 고파요' })).toBeInTheDocument();
  });

  it('reads a typed symptom and plant name, and says so when it cannot read a message', async () => {
    const user = userEvent.setup();
    renderApp('/log', two());
    await user.click(screen.getByRole('button', { name: '개구리에게 도움 요청' }));
    const sheet = screen.getByRole('dialog', { name: '개구리 도우미' });
    await user.type(within(sheet).getByRole('textbox', { name: '직접 적기' }), '오늘 날씨 좋네{Enter}');
    expect(within(sheet).getByText(/아직 글을 읽고 답하진 못해요/)).toBeInTheDocument();
    await user.type(within(sheet).getByRole('textbox', { name: '직접 적기' }), '스킨답서스 잎이 노랗게 됐어{Enter}');
    expect(within(sheet).getByText(/뿌리가 답답해요/)).toBeInTheDocument();
    expect(within(sheet).getByRole('button', { name: '구조 작전 시작' })).toBeInTheDocument();
  });

  it('answers when to water from the schedule', async () => {
    const user = userEvent.setup();
    renderApp('/log', two());
    await user.click(screen.getByRole('button', { name: '개구리에게 도움 요청' }));
    await user.click(screen.getByRole('button', { name: '물 언제 줘요?' }));
    expect(screen.getByText(/스킨답서스: 오늘이에요/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '돌봄 달력 보기' }));
    expect(screen.getByRole('heading', { name: '돌봄 달력' })).toBeInTheDocument();
  });
});
