# Performance & Complexity TODO

Findings from a codebase audit, grouped by impact. Check items off as they're fixed.

## High Priority

- [ ] **Reduce unnecessary `"use client"` boundaries** — move the directive down to the smallest interactive leaf so more of the tree can render on the server:
  - [app/(public)/feed/page.tsx](app/(public)/feed/page.tsx#L1) — only uses `useAuth()`, pass auth state from a server parent instead.
  - [app/(auth)/email-verification/page.tsx](app/(auth)/email-verification/page.tsx#L1) — just renders a child component.
  - [app/(protected)/(qr)/scanner/page.tsx](app/(protected)/(qr)/scanner/page.tsx#L1) — only wraps `QRScanner`.
  - [src/components/layouts/Header.tsx](src/components/layouts/Header.tsx#L1) — extract path-based routing logic to server, keep only the interactive bits client-side.
  - [src/components/layouts/BottomTabBar.tsx](src/components/layouts/BottomTabBar.tsx#L1) — same idea, isolate the "active tab" state.

- [ ] **Compress/resize images before upload**:
  - [src/components/shared/AppImagePicker.tsx](src/components/shared/AppImagePicker.tsx#L46-L80) — `getCroppedFile()` crops but never compresses; add quality/size limiting (e.g. canvas re-encode to WebP/JPEG with a max dimension).
  - [src/actions/imageUpload.ts](src/actions/imageUpload.ts#L37-L60) — `uploadStorageFile()` has no file size/type/dimension validation before hitting storage.
  - [src/features/profile/components/ProfileForm.tsx](src/features/profile/components/ProfileForm.tsx#L55-L65) — passes the cropped file straight to `uploadAvatar()`; validate size after cropping.

- [ ] **Narrow `revalidatePath` scope** — currently invalidates the entire app on every mutation, causing unnecessary re-renders/refetches app-wide:
  - [src/features/auth/actions/auth.ts](src/features/auth/actions/auth.ts#L59-L107)
  - [src/features/store/actions/menu.ts](src/features/store/actions/menu.ts#L83)
  - [src/features/profile/actions/profile.ts](src/features/profile/actions/profile.ts#L90)
  - Replace `revalidatePath("/", "layout")` with the specific route(s) actually affected.

- [ ] **Add pagination/limits to unbounded queries**:
  - [src/features/store/actions/menu.ts](src/features/store/actions/menu.ts#L110-L140) — `getMenuItemsAction()` fetches all menu items for a store.
  - [src/features/store/utils/claimedBuildings.ts](src/features/store/utils/claimedBuildings.ts#L10-L40) — `getClaimedStores()` fetches all stores with no limit.

## Medium Priority

- [ ] **Lazy-load heavy, rarely-first-paint components** with `next/dynamic` (no dynamic imports currently exist):
  - Map (`maplibre-gl` + `@vis.gl/react-maplibre`, ~500KB) — [src/features/map/components/MapDisplay.tsx](src/features/map/components/MapDisplay.tsx)
  - QR scanner (`html5-qrcode`) — [src/features/qr/components/QRScanner.tsx](src/features/qr/components/QRScanner.tsx)
  - Image cropper (`react-image-crop`) — [src/components/shared/AppImagePicker.tsx](src/components/shared/AppImagePicker.tsx)

- [ ] **Simplify/split large multi-effect components**:
  - [src/features/qr/components/QRScanner.tsx](src/features/qr/components/QRScanner.tsx) — 3 `useEffect`s + multiple refs (`qrEngineRef`, `isStartingRef`, `scanLockRef`) managing scanner lifecycle; extract into a `useQrScanner` hook.
  - [src/features/store/components/menu/MenuForm.tsx](src/features/store/components/menu/MenuForm.tsx#L56-L98) — preview-sync effect depends on 8 values including `watchedValues`; derive with `useMemo` instead of an effect where possible.
  - [src/features/map/components/MapDisplay.tsx](src/features/map/components/MapDisplay.tsx#L58-L82) — geolocation + cached-location effects can race; consolidate into one effect/hook with clear state transitions.
  - [src/components/shared/AppImagePicker.tsx](src/components/shared/AppImagePicker.tsx) — separate cropping logic from upload/form-integration logic into its own hook.

- [ ] **Memoize event handlers and derived lists** to cut re-renders:
  - [src/features/map/components/MapDisplay.tsx](src/features/map/components/MapDisplay.tsx#L116-L129) — wrap `handleMapLoad`, `handleTiltToggle`, `handleLocateToggle` in `useCallback`.
  - [src/features/store/components/menu/MenuSheet.tsx](src/features/store/components/menu/MenuSheet.tsx#L28) — memoize the `menuItems` map and consider `React.memo` on `MenuCard`.
  - [src/features/profile/components/ProfileStats.tsx](src/features/profile/components/ProfileStats.tsx#L32) — hoist static `stats` array out of the component (or `useMemo`) to avoid re-creating it every render.

- [ ] **Extract duplicated mutation/error-handling patterns** into a shared helper:
  - `prepareProfileMutation`/`executeProfileMutation` in [src/features/profile/actions/profile.ts](src/features/profile/actions/profile.ts#L55-L92) vs `prepareMenuMutation`/`executeMenuMutation` in [src/features/store/actions/menu.ts](src/features/store/actions/menu.ts#L21-L73).
  - Duplicate/unique-constraint (`23505`) handling in [profile.ts](src/features/profile/actions/profile.ts#L79) and [store.ts](src/features/store/actions/store.ts#L41-L44).

## Low Priority / Cleanup

- [ ] Remove unused exports flagged by TS/ESLint (dead code adds to bundle & maintenance overhead):
  - [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx#L138-L142) — `SheetTrigger`, `SheetClose`, `SheetFooter`
  - [src/components/ui/avatar.tsx](src/components/ui/avatar.tsx#L107-L108) — `AvatarGroup`, `AvatarGroupCount`
  - [src/components/ui/dialog.tsx](src/components/ui/dialog.tsx#L157-L163) — `DialogClose`, `DialogOverlay`, `DialogPortal`
  - [src/components/ui/field.tsx](src/components/ui/field.tsx#L230-L235) — `FieldGroup`, `FieldLegend`, `FieldSeparator`, `FieldSet`, `FieldContent`, `FieldTitle`
  - [src/components/ui/input-group.tsx](src/components/ui/input-group.tsx#L147) — `InputGroupText`
- [ ] Replace the raw `<img>` in [src/components/shared/AppImagePicker.tsx](src/components/shared/AppImagePicker.tsx#L172) with `next/image` where feasible (live crop preview may still need a plain `<img>`, document why if kept).
- [ ] Consider a shared form wrapper for the repeated `useForm` + `useTransition` + image picker + submit-button pattern used in `MenuForm`, `ProfileForm`, and `RegisterStoreForm`.

## Notes
- No `React.memo` usage exists anywhere in the codebase yet — apply selectively to list-item components (`MenuCard`, marker components) rather than everywhere.
- Good patterns already in place worth keeping/reusing: `Promise.all()` in [SessionProvider.tsx](src/features/auth/provider/SessionProvider.tsx#L18-L23) and [AuthProvider.tsx](src/features/auth/provider/AuthProvider.tsx#L45-L52); `useMemo`/`useCallback` usage in [useMapLayers.ts](src/features/map/hooks/useMapLayers.ts#L31-L127); Zustand caching in [useMenuStore.ts](src/features/store/storage/useMenuStore.ts#L21-L45).
