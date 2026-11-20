import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const answer = vi.hoisted(() => ({ value: null }));
vi.mock('../src/lib/diagnose.js', async (actual) => ({
  ...(await actual()),
  photoEnabled: () => true,
  preparePhoto: async () => ({ base64: 'abc', preview: 'data:image/jpeg;base64,abc' }),
  sendPhoto: async () => answer.value,
}));

const { default: App } = await import('../src/App.jsx');
const { StoreProvider, initialState, reducer } = await import('../src/lib/store.jsx');

function open(build = (s) => s) {
  const state = build(reducer(initialState, { type: 'onboard', profile: { light: 'mid', style: 'week' } }));
  const view = render(
    <StoreProvider initial={state}>
      <MemoryRouter initialEntries={['/log']}>
        <App />
      </MemoryRouter>
    </StoreProvider>,
  );
  return view;
}

async function sendPhotoFromChat(user, view) {
  await user.click(screen.getByRole('button', { name: '개구리에게 도움 요청' }));
  const sheet = screen.getByRole('dialog', { name: '개구리 도우미' });
  await user.click(within(sheet).getByRole('button', { name: '사진 찍어 물어보기' }));
  expect(within(sheet).getByText(/초록방은 사진을 저장하지 않아요/)).toBeInTheDocument();
  expect(within(sheet).getByRole('button', { name: '사진 고르기' })).toBeInTheDocument();
  const input = view.container.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [new File(['x'], 'plant.jpg', { type: 'image/jpeg' })] } });
  await within(sheet).findByRole('img', { name: '사진을 보냈어요' });
  return sheet;
}

describe('photo diagnosis in the frog chat', () => {
  it('reads a photo of a registered plant and starts its rescue plan on confirmation', async () => {
    const user = userEvent.setup();
    answer.value = {
      species: { found: true, score: 0.8, scientific: 'Dracaena angolensis', genus: 'Dracaena', family: 'Asparagaceae', common: '' },
      health: { isPlant: true, healthy: false, healthyProbability: 0.2, issues: [{ name: 'water excess or uneven watering', localName: '과습', probability: 0.6 }] },
      failed: { species: false, health: false },
    };
    const view = open((s) => reducer(reducer(s, { type: 'addPlant', species: 'pothos', daysAgo: 0 }), { type: 'addPlant', species: 'stuki', daysAgo: 0 }));
    const sheet = await sendPhotoFromChat(user, view);
    expect(await within(sheet).findByText(/제 눈엔 스투키 같아요/)).toBeInTheDocument();
    expect(within(sheet).getByText(/사진 한 장으로 본 추정이에요/)).toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: '구조 작전 시작' }));
    expect(screen.getByRole('heading', { name: '물배가 빵빵해요' })).toBeInTheDocument();
    expect(screen.getByText('스투키 구조 작전')).toBeInTheDocument();
  });

  it('offers to register a recognised plant that is not in the room yet', async () => {
    const user = userEvent.setup();
    answer.value = {
      species: { found: true, score: 0.7, scientific: 'Monstera deliciosa', genus: 'Monstera', family: 'Araceae', common: '몬스테라' },
      health: { isPlant: true, healthy: true, healthyProbability: 0.9, issues: [] },
      failed: { species: false, health: false },
    };
    const view = open();
    const sheet = await sendPhotoFromChat(user, view);
    expect(await within(sheet).findByText(/사진으로는 건강해 보여요/)).toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: '몬스테라 식구로 등록' }));
    expect(screen.getByRole('heading', { name: '몬스테라' })).toBeInTheDocument();
  });

  it('says so and falls back to picking a symptom when diagnosis is not switched on', async () => {
    const user = userEvent.setup();
    answer.value = { error: 'not_configured' };
    const view = open((s) => reducer(s, { type: 'addPlant', species: 'ivy', daysAgo: 0 }));
    const sheet = await sendPhotoFromChat(user, view);
    expect(await within(sheet).findByText(/사진 진단은 아직 준비 중이에요/)).toBeInTheDocument();
    expect(within(sheet).queryByRole('button', { name: '구조 작전 시작' })).not.toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: '증상 고르기' }));
    expect(within(sheet).getByText('아이비, 어떤 모습이에요?')).toBeInTheDocument();
  });
});
