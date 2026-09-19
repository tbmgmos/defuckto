# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# DEFUCKTO — project rules

Dating app (Expo / React Native, zustand). Users trade coins for facts, photos
and questions. There is no backend yet: `src/services/localDatabase.ts` is an
in-memory store and services are the seam a real backend will replace.

## Layers (top depends on bottom)

`screens/components` → `stores` (`actions.ts` orchestrates) → `services` → `models`

- Screens read stores and call functions from `stores/actions.ts`. They do not
  mutate stores directly and hold no economy logic.
- All money logic lives in `src/services`. Coins are **spent** only in
  `economyService` (`purchaseFact`, `purchasePhoto`, `askQuestion`,
  `revealTeaser`). Never call `walletService.spendCoins` from anywhere else.
  Coins are **earned** through `walletService.earnCoins` from `economyService`
  (seller share), `questService`, `simulationService`, and the streak/referral
  bonuses in `stores/actions.ts`. Add a new earning path only on purpose.
- Prices, quotas and caps are named constants in the service that owns them
  (`QUESTION_PRICE`, `FREE_QUESTIONS_PER_DAY`, `FREE_SPARKS_PER_DAY`,
  `SELLER_SHARE`). Do not inline numbers in screens.
- UI should depend on `src/models`, not on `src/data/*` mock shapes. Some
  screens still import `data/users`, `data/factCategories`, `data/interests`;
  do not add new ones.

## Product rules (do not regress)

- **No pay-to-talk.** Messaging must never be gated behind a payment. There are
  free questions per day, a direct "Написать" button, and a cap of one message
  until the other side replies. Past the free quota a question becomes a paid
  extra, not a hard wall.
- **Mild price growth.** `computeCurrentPrice` is +5% per unlock, capped at
  +20%. A steeper curve once rewarded vague facts; keep it mild.
- **Honest "mutual interest".** The signal needs a real basis (see
  `interestService`); do not fake it.
- **Free sparks are capped per day**, otherwise sparking everyone is rational
  and the signal means nothing.
- Every fact carries `moderationStatus`. Keep it on new content types.

## UI conventions

- Icons are Ionicons glyphs. No emoji as UI icons (emoji inside user message
  text is fine).
- User-facing copy is Russian. Keep the existing tone.
- Theme values come from `src/theme`, not hardcoded colors or spacing.

## Commands

- Typecheck: `npm run typecheck` (needs `npm ci` first). A hook runs it after
  every edit of a `.ts`/`.tsx` file.
- Tests: `npm test` (vitest, `src/services/__tests__`, pure Node, ~1 s). Run
  after any change to `src/services`. There is no linter yet.
- `it.fails('KNOWN BUG: ...')` marks a bug that is documented but not fixed.
  When you fix one, that test turns red: change `it.fails` to `it`. Do not
  delete these tests and do not "fix" them by weakening the assertion.
- Web dev: `npm run web`. Native: `npm run ios` / `npm run android`.
- Publish (from the Mac mini): web `deploy/preview-server/publish-web.sh`,
  Android APK `deploy/preview-server/publish-build.sh`. CI does not publish.
  Do not push or publish without being asked.

## Secrets

The GitHub repository is private (GitHub Free: no Pages, no branch
protection), but keep the habit: never commit secrets, keystores, password
hashes, tokens or real domains. Local-only files go in `.gitignore`.
