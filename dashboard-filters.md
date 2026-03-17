# Dashboard Filters (BU & Seller)

## Goal
Implement granular statistics filtering by Business Unit (BU) and Seller on the dashboard, respecting role-based access rules.

## Tasks
- [ ] Task 1: Create `selectedBUId` and `selectedSellerId` state in `Home.vue` → Verify: State initializes correctly based on user role.
- [ ] Task 2: Build the `DashboardFilters` UI section above the stats grid → Verify: Dropdowns appear for Head/Coord/Admin roles only.
- [ ] Task 3: Implement BU selection logic for Admin/Coord → Verify: Dropdown populates with BUs from `businessList`.
- [ ] Task 4: Implement Seller selection logic for Admin/Coord/Head → Verify: List filters according to selected BU or team context.
- [ ] Task 5: Update `filteredContractsForStats` computed to apply BU and Seller filters → Verify: Stats update immediately when changing filters.
- [ ] Task 6: Add "Minhas Estatísticas" option for leadership roles → Verify: Leads can easily toggle between team and personal views.

## Done When
- [ ] Seller only sees their own month-filtered stats.
- [ ] Head can filter their team's stats by specific sellers or see their own.
- [ ] Coordinator sees BU stats with specific seller filters within that BU.
- [ ] Admin has full cross-BU and cross-seller filtering capability.

## Notes
- Use `businessList` (already fetched) for BU options.
- Use `sellerStore.allSellers` for seller options.
- The Month filter remains the top-level override for all data.
- Coordination/Head filters must strictly follow Rule 6 visibility.
