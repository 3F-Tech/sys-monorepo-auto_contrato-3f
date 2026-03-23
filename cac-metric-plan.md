# CAC Implementation Plan

## Goal
Implement CAC metric visible in performance section, manageable by Admin per BU/Month.

## Tasks
- [ ] Database: Add `bu_cac` table to `schema.prisma` → Verify: `npx prisma db push` succeeds.
- [ ] API: Implement `cacController` with historical fallback (inherit last month) → Verify: GET returns previous value if current is null.
- [ ] Frontend Store: Create `cacStore` → Verify: Data fetches correctly.
- [ ] Admin UI: `SetCacModal` + Card interaction → Verify: Admin can save values.
- [ ] Logic: Regional aggregation (BU sum for 3F) → Verify: Totals are correct.

## Done When
- Admin sets CAC for BUs.
- Dashboard shows BU-specific or 3F-summed CAC.
- UI is premium and interactive for Admins.
