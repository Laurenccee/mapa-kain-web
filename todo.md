# Performance & Complexity TODO

Findings from a codebase audit, grouped by impact. Check items off as they're fixed.

> **Update (2026-09-12):** High and Medium priority items are done. See inline
> notes for what changed vs. what was intentionally skipped, and "Next Up" at
> the bottom for newly identified follow-ups from an architecture review.

## High Priority

- [x] **Reduce unnecessary `"use client"` boundaries** — re-verified against actual hook usage; only one file was genuinely unnecessary:
  - [app/(auth)/email-verification/page.tsx](app/(auth)/email-verification/page.tsx#L1) — `"use client"` removed, now server-rendered.
  - `feed/page.tsx`, `scanner/page.tsx`, `Header.tsx`, `BottomTabBar.tsx` — left as-is, they genuinely need client hooks (`useAuth`, `usePathname`, camera access).

- [x] **Compress/resize images before upload**:
  - [src/components/shared/AppImagePicker.tsx](src/components/shared/AppImagePicker.tsx) — crop now resizes to a max dimension (512px avatar / 1600px menu) and re-encodes JPEG at quality 0.8, via [src/utils/constants/image.ts](src/utils/constants/image.ts).
  - [src/actions/imageUpload.ts](src/actions/imageUpload.ts) — `uploadStorageFile()` now validates size + MIME type before upload.
  - [src/features/profile/components/ProfileForm.tsx](src/features/profile/components/ProfileForm.tsx) / `MenuForm.tsx` — client-side size pre-check before calling upload.

- [x] **Narrow `revalidatePath` scope**:
  - [menu.ts](src/features/store/actions/menu.ts) / [profile.ts](src/features/profile/actions/profile.ts) now revalidate the specific `/store/[id]` or `/profile/[id]` path instead of `"/", "layout"`.
  - [auth.ts](src/features/auth/actions/auth.ts): sign-in/up/out/reset-password intentionally kept at `"/", "layout"` — `SessionProvider` (which needs refreshing) lives in the root layout, so that's already the minimal correct scope. Removed the pointless revalidate call in `forgetPasswordAction` (it doesn't mutate any cached data).

- [x] **Add pagination/limits to unbounded queries**:
  - `getMenuItemsAction()` — added `.limit(100)` + narrowed `select()`.
  - `getClaimedStores()` — pushed `building_id IS NOT NULL` into SQL instead of an arbitrary `.limit()` (the map needs *all* claimed buildings, so a hard cap would break it).

## Medium Priority

- [x] **Lazy-load heavy, rarely-first-paint components** with `next/dynamic`:
  - Map — lazy in both [MapPageWrapper.tsx](src/features/map/components/MapPageWrapper.tsx) and [StoreRegisterPageClient.tsx](src/features/store/components/store/StoreRegisterPageClient.tsx).
  - QR scanner — lazy in [scanner/page.tsx](app/(protected)/(qr)/scanner/page.tsx).
  - Image cropper — extracted into [ImageCropDialog.tsx](src/components/shared/ImageCropDialog.tsx) and lazy-loaded from `AppImagePicker.tsx`.

- [x] **Simplify/split large multi-effect components** — extracted into hooks:
  - `QRScanner.tsx` → [useQrScanner.ts](src/features/qr/hooks/useQrScanner.ts)
  - `MapDisplay.tsx` → [useMapInitialization.ts](src/features/map/hooks/useMapInitialization.ts)
  - `MenuForm.tsx` → [useMenuPreviewSync.ts](src/features/store/hooks/useMenuPreviewSync.ts) (kept as an effect, not `useMemo` — it manages an object-URL lifecycle + calls an external callback, a legitimate effect per React's own guidance, not a pure derivation)
  - `AppImagePicker.tsx` — cropping UI split into its own component rather than a hook, since that's what enabled the dynamic import.

- [x] **Memoize event handlers and derived lists**:
  - `MapDisplay.tsx` handlers wrapped in `useCallback`.
  - `MenuCard` wrapped in `React.memo`.
  - `ProfileStats` stats array now `useMemo`'d (not a hoisted constant — it depends on `profile?.created_at`).

- [x] **Extract duplicated mutation/error-handling patterns** — partially done:
  - Unique-constraint (`23505`) handling unified into [postgresError.ts](src/lib/utils/postgresError.ts), used by both `profile.ts` and `store.ts`.
  - Full `prepare/execute` merge between `menu.ts` and `profile.ts` intentionally **not** done — the two flows differ enough (auth error shape, revalidation target) that forcing a shared generic adds risk for a maintainability-only win with no speed/data benefit.

## Low Priority / Cleanup

- [ ] Remove unused exports flagged by TS/ESLint — **intentionally skipped**: verified via reference search that these truly have zero usages, but they're shadcn-managed UI-kit files, bundlers already tree-shake unused exports (no real bundle-size win), and deleting risks fighting future `shadcn add` regenerations:
  - [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx#L138-L142) — `SheetTrigger`, `SheetClose`, `SheetFooter`
  - [src/components/ui/avatar.tsx](src/components/ui/avatar.tsx#L107-L108) — `AvatarGroup`, `AvatarGroupCount`
  - [src/components/ui/dialog.tsx](src/components/ui/dialog.tsx#L157-L163) — `DialogClose`, `DialogOverlay`, `DialogPortal`
  - [src/components/ui/field.tsx](src/components/ui/field.tsx#L230-L235) — `FieldGroup`, `FieldLegend`, `FieldSeparator`, `FieldSet`, `FieldContent`, `FieldTitle`
  - [src/components/ui/input-group.tsx](src/components/ui/input-group.tsx#L147) — `InputGroupText`
- [x] Raw `<img>` in the crop dialog — kept intentionally (documented with a lint-disable comment); it's the live crop-preview surface for `react-image-crop`, which needs a real DOM `<img>` ref, not `next/image`.
- [ ] Shared form wrapper for `useForm` + `useTransition` + image picker + submit pattern (`MenuForm`, `ProfileForm`, `RegisterStoreForm`) — not done, still a good maintainability win, low urgency.

## Next Up (from 2026-09-12 architecture review)

- [x] Type `AuthState.profile`/`store` (was `any`) — added `AuthProfile`/`AuthStore` interfaces in [auth/types/index.ts](src/features/auth/types/index.ts) matching the exact columns selected by `SessionProvider`/`AuthProvider`. This also surfaced and fixed a real bug: `AuthProvider`'s client-side `stores` refetch was missing `.single()` (present in `SessionProvider`'s SSR fetch), so `store` briefly became an array instead of an object after sign-in, and `hasStore` could be `true` even with zero stores (`!![]` is `true` in JS).
- [ ] No automated tests exist anywhere in the repo — highest-risk gap for an app handling auth/loyalty data. Start with Vitest + RTL on server actions and the newly-extracted hooks.
- [ ] `react-hooks/set-state-in-effect` lint errors in `ThemeToggle`, `MenuCard`, `useMapInitialization`, `useQrScanner` — mostly benign (hydration-safe `mounted` flags) but worth a pass to convert to derived state where possible.
- [ ] Remaining `any` usage: action `dbOperation` params/`catch` blocks in `menu.ts`/`profile.ts`, `MenuItemsAction`/`MenuBaseFormProps` in `types/menu.ts`, `InputFieldProps.control`/`AppImagePickerProps` generics, `AuthFormProps.action` data param.
- [ ] No rate limiting on `signInAction`/`signUpAction`/resend-email server actions — relies entirely on Supabase's own throttling.
- [ ] `uploadStorageFile()` trusts client-supplied `file.type` for MIME validation — a magic-byte check would be more robust (low priority; Storage + `next/image` render it safely either way).

## Notes
- No `React.memo` usage exists anywhere in the codebase yet — apply selectively to list-item components (`MenuCard`, marker components) rather than everywhere.
- Good patterns already in place worth keeping/reusing: `Promise.all()` in [SessionProvider.tsx](src/features/auth/provider/SessionProvider.tsx#L18-L23) and [AuthProvider.tsx](src/features/auth/provider/AuthProvider.tsx#L45-L52); `useMemo`/`useCallback` usage in [useMapLayers.ts](src/features/map/hooks/useMapLayers.ts#L31-L127); Zustand caching in [useMenuStore.ts](src/features/store/storage/useMenuStore.ts#L21-L45).
