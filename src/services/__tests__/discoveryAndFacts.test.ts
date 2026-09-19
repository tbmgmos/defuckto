import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, DiscoveryContext, activeFilterCount, applyFilters, orderUsers } from '../discoveryService';
import { factService, planFactActions } from '../factService';
import { chatService } from '../chatService';
import { db } from '../localDatabase';
import { DiscoveryFilters, Fact, User } from '../../models';
import { BUYER, SELLER, resetDb, seedFact } from './helpers';

function user(overrides: Partial<User> & { id: string }): User {
  return {
    name: overrides.id,
    age: 25,
    city: 'Берлин',
    gender: 'f',
    lookingFor: 'dating',
    bio: '',
    interests: ['music'],
    photoSeed: overrides.id,
    ...overrides,
  };
}

const viewer = user({ id: 'me', gender: 'm', interests: ['music', 'games', 'sport'], isCurrentUser: true });

function ctx(overrides: Partial<DiscoveryContext> = {}): DiscoveryContext {
  return { viewer, blockedIds: new Set(), topIds: new Set(), hotAuthorIds: new Set(), ...overrides };
}

const ids = (users: User[]) => users.map((u) => u.id);
const withFilters = (patch: Partial<DiscoveryFilters>): DiscoveryFilters => ({ ...DEFAULT_FILTERS, ...patch });

describe('applyFilters', () => {
  const people = [
    user({ id: 'anna', age: 22, city: 'Берлин', verified: true, interests: ['music', 'games'] }),
    user({ id: 'boris', age: 30, city: 'Прага', gender: 'm', lookingFor: 'friendship', interests: ['food'] }),
    user({ id: 'vera', age: 40, city: 'Берлин', interests: ['music', 'games', 'sport'], lookingFor: 'any' }),
  ];

  it('never shows the viewer or blocked people', () => {
    const all = [...people, viewer];
    expect(ids(applyFilters(all, DEFAULT_FILTERS, ctx({ blockedIds: new Set(['boris']) })))).toEqual(['anna', 'vera']);
  });

  it('filters by gender, age and city', () => {
    expect(ids(applyFilters(people, withFilters({ gender: 'm' }), ctx()))).toEqual(['boris']);
    expect(ids(applyFilters(people, withFilters({ minAge: 25, maxAge: 35 }), ctx()))).toEqual(['boris']);
    expect(ids(applyFilters(people, withFilters({ city: 'Берлин' }), ctx()))).toEqual(['anna', 'vera']);
  });

  it('"из совместимых" needs at least two shared interests with the viewer', () => {
    expect(ids(applyFilters(people, withFilters({ onlyCompatible: true }), ctx()))).toEqual(['anna', 'vera']);
    expect(applyFilters(people, withFilters({ onlyCompatible: true }), ctx({ viewer: null }))).toEqual([]);
  });

  it('handles verified, top, hot and friendship-only flags', () => {
    expect(ids(applyFilters(people, withFilters({ onlyVerified: true }), ctx()))).toEqual(['anna']);
    expect(ids(applyFilters(people, withFilters({ onlyTop: true }), ctx({ topIds: new Set(['vera']) })))).toEqual(['vera']);
    expect(ids(applyFilters(people, withFilters({ onlyHot: true }), ctx({ hotAuthorIds: new Set(['anna']) })))).toEqual(['anna']);
    expect(ids(applyFilters(people, withFilters({ onlyFriendship: true }), ctx()))).toEqual(['boris']);
  });

  it('combines filters (all must match)', () => {
    const filters = withFilters({ city: 'Берлин', onlyVerified: true, onlyCompatible: true });
    expect(ids(applyFilters(people, filters, ctx()))).toEqual(['anna']);
  });
});

describe('activeFilterCount', () => {
  it('is zero for the defaults and counts each active filter once', () => {
    expect(activeFilterCount(DEFAULT_FILTERS)).toBe(0);
    expect(activeFilterCount(withFilters({ minAge: 20, maxAge: 30, gender: 'f', onlyTop: true, interests: ['music', 'food'] }))).toBe(5);
  });
});

describe('orderUsers', () => {
  it('"для тебя" puts the most compatible first', () => {
    const list = [user({ id: 'low', interests: ['food'] }), user({ id: 'high', interests: ['music', 'games'] })];
    expect(ids(orderUsers(list, 'foryou', viewer))).toEqual(['high', 'low']);
  });

  it('does not mutate the input', () => {
    const list = [user({ id: 'a' }), user({ id: 'b' })];
    const copy = [...list];
    orderUsers(list, 'near', viewer);
    expect(list).toEqual(copy);
  });
});

describe('planFactActions', () => {
  const fact = (overrides: Partial<Fact>): Fact => ({
    id: 'f',
    authorId: SELLER,
    text: 't',
    type: 'text',
    category: 'life',
    price: 20,
    unlockCount: 0,
    createdAt: '',
    moderationStatus: 'approved',
    ...overrides,
  });
  const none: ReadonlySet<string> = new Set();

  it('offers the free fact, the cheapest locked one and a hot one separately', () => {
    const facts = [
      fact({ id: 'free', price: 0 }),
      fact({ id: 'pricey', price: 30 }),
      fact({ id: 'cheap', price: 10 }),
      fact({ id: 'hot', price: 40, hot: true }),
    ];
    const actions = planFactActions(facts, new Set(['free']), []);
    expect(actions.free?.id).toBe('free');
    expect(actions.paid?.id).toBe('cheap');
    expect(actions.hot?.id).toBe('hot');
    expect(actions.opened).toEqual([]);
  });

  it('skips what is already on screen and hides buttons with nothing behind them', () => {
    const facts = [fact({ id: 'free', price: 0 }), fact({ id: 'paid', price: 10 })];
    const actions = planFactActions(facts, new Set(['free']), ['free', 'paid']);
    expect(actions).toEqual({ free: null, paid: null, hot: null, opened: [] });
  });

  it('lists bought-but-not-shown facts as "открытые", not as paid', () => {
    const facts = [fact({ id: 'bought', price: 25 })];
    const actions = planFactActions(facts, new Set(['bought']), []);
    expect(actions.paid).toBeNull();
    expect(actions.opened.map((f) => f.id)).toEqual(['bought']);
  });

  it('only offers hot facts that are approved, preferring ones already unlocked', () => {
    const facts = [
      fact({ id: 'pending', price: 30, hot: true, moderationStatus: 'pending' }),
      fact({ id: 'rejected', price: 30, hot: true, moderationStatus: 'rejected' }),
      fact({ id: 'locked', price: 30, hot: true }),
      fact({ id: 'owned', price: 30, hot: true }),
    ];
    expect(planFactActions(facts, none, []).hot?.id).toBe('locked');
    expect(planFactActions(facts, new Set(['owned']), []).hot?.id).toBe('owned');
  });

  it('never mixes hot facts into the regular free/paid buttons', () => {
    const actions = planFactActions([fact({ id: 'hot', price: 5, hot: true })], none, []);
    expect(actions.free).toBeNull();
    expect(actions.paid).toBeNull();
  });
});

describe('hot facts', () => {
  beforeEach(() => {
    resetDb();
  });

  it('are created pending, so other people only see them after review', async () => {
    const created = await factService.createFact({ authorId: SELLER, text: 'горячо', category: 'life', price: 25, hot: true });
    expect(created.hot).toBe(true);
    expect(created.moderationStatus).toBe('pending');
    expect(planFactActions([created], new Set(), []).hot).toBeNull();
  });

  it('cannot be free', async () => {
    await expect(
      factService.createFact({ authorId: SELLER, text: 'горячо', category: 'life', price: 0, hot: true }),
    ).rejects.toThrow('Горячий факт не может быть бесплатным');
  });

  it('leave ordinary facts approved', async () => {
    const created = await factService.createFact({ authorId: SELLER, text: 'обычный', category: 'life', price: 10 });
    expect(created.moderationStatus).toBe('approved');
    expect(created.hot).toBeUndefined();
  });
});

describe('no pay-to-talk', () => {
  beforeEach(() => {
    resetDb();
  });

  it('lets you open a conversation and write without having bought or opened anything', async () => {
    seedFact({ authorId: SELLER, price: 100 });
    const conversation = await chatService.openConversation(BUYER, SELLER);
    await chatService.sendMessage(conversation.id, BUYER, 'Привет');
    expect(conversation.messages).toHaveLength(1);
    expect(db.purchases).toHaveLength(0);
    expect(db.transactions).toHaveLength(0);
  });
});
