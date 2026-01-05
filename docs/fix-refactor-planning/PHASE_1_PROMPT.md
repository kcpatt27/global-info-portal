# Phase 1 Implementation Prompt

**Hi Gee,**

I'm ready to start implementing **Phase 1: Critical Fixes** from the `FIXES_AND_REFACTOR_PLAN.md`. 

### Project Context
- **Project:** Global Information Portal (2D Global Info Portal)
- **Tech Stack:** Vanilla JavaScript (ES Modules), HTML5, CSS3, D3.js
- **Current State:** We have duplicate JS entry files (`js/main.js` vs `js/index.js`) causing inconsistent behavior between dev and build, and mobile CSS is loaded unconditionally which can affect desktop layout
- **Goal:** Fix critical architectural issues by consolidating JS entry points and properly scoping mobile CSS

### Phase 1 Overview
According to the plan, Phase 1 includes:
- **1.1 JavaScript Entry Consolidation:** Consolidate `js/main.js` and `js/index.js` into single entry point (`js/index.js`)
- **1.2 Mobile CSS Scoping:** Fix unconditional mobile CSS loading by scoping all mobile rules to `@media (max-width: 768px)` queries

### What I Need You To Do

1. **Review the Plan:**
   - Read `FIXES_AND_REFACTOR_PLAN.md` and focus on Phase 1 tasks (sections 1.1 and 1.2)
   - Understand the dependencies and prerequisites
   - Identify any potential issues or conflicts with current codebase
   - Read both `js/main.js` and `js/index.js` to understand their differences

2. **Create Implementation Checklist:**
   - Break down Phase 1 tasks into actionable steps
   - Identify which files need to be read/modified:
     - `js/main.js` (to audit and migrate from)
     - `js/index.js` (to consolidate into)
     - `index.html` (to update script reference)
     - `css-styles/mobile.css` (to audit and scope)
     - `css-styles/layout/mobile-layout.css` (to audit and scope)
   - Note any files that need to be created (comparison docs, etc.)
   - Flag any potential risks or complications

3. **Execute Phase 1.1: JavaScript Entry Consolidation**
   - **Task 1.1.1:** Compare `js/main.js` and `js/index.js` line-by-line, document unique functionality
   - **Task 1.1.2:** Migrate any unique features from `main.js` to `index.js` (especially flag display logic, country name formatting, mobile initialization)
   - **Task 1.1.3:** Update `index.html` to load `js/index.js` instead of `js/main.js`
   - **Task 1.1.4:** Add deprecation notice to `js/main.js` (keep file temporarily for reference)
   - **Task 1.1.5:** Test thoroughly - verify all features work, especially flag display and country selection

4. **Execute Phase 1.2: Mobile CSS Scoping**
   - **Task 1.2.1:** Audit `css-styles/mobile.css` and `css-styles/layout/mobile-layout.css` for global rules (not in `@media` queries)
   - **Task 1.2.2:** Wrap all global mobile rules with `@media (max-width: 768px)` queries
   - **Task 1.2.3:** (Optional) Implement conditional CSS loading in `index.html` - only load mobile CSS on mobile devices
   - **Task 1.2.4:** Test on desktop (>768px) and mobile (≤768px) viewports, verify no regressions

5. **Update Memory Bank:**
   - Update `memory-bank/activeContext.md` with Phase 1 progress
   - Update `memory-bank/systemPatterns.md` if architecture changes
   - Update `memory-bank/progress.md` with completed tasks
   - Mark the documented bugs as "fixed" or "in progress"

6. **Provide Summary:**
   - List what was completed
   - Note any deviations from the plan and why
   - Identify any blockers or issues encountered
   - Confirm Phase 1 success criteria are met
   - Suggest readiness for Phase 2

### Important Guidelines
- **Don't break existing functionality** - test after each major change (map interaction, country selection, flag display, panels)
- **Follow the plan's order** - complete 1.1 before 1.2 (though they can be done in parallel if you prefer)
- **Document as you go** - update comments and docs inline
- **Ask if unsure** - if something in the plan is unclear, ask before proceeding
- **Be thorough** - don't skip steps or take shortcuts
- **Test both scenarios** - direct HTML loading AND webpack build (if possible)

### Phase-Specific Notes
- This is CRITICAL priority - these fixes address fundamental architectural issues
- Be very careful when modifying entry points - test thoroughly after each change
- For CSS changes, test on both desktop and mobile viewports (use browser dev tools)
- Keep `js/main.js` temporarily with deprecation notice until verification is complete
- Pay special attention to flag display logic - we know there's a bug with China showing Switzerland's flag, so make sure the flag code mapping is correct
- The mobile CSS issue may already be partially fixed (you mentioned background info text is fixed), but we still need to ensure all mobile rules are properly scoped

### Success Criteria
Phase 1 is complete when:
- [ ] Single JS entry point (`js/index.js`) used consistently in `index.html`
- [ ] All unique functionality from `js/main.js` migrated to `js/index.js`
- [ ] `js/main.js` marked as deprecated with migration comments
- [ ] No duplicate function implementations remain
- [ ] Mobile CSS properly scoped to `@media (max-width: 768px)` queries
- [ ] Desktop layout unaffected by mobile CSS
- [ ] All features work correctly (map, country selection, flags, panels, mobile interactions)
- [ ] No console errors or warnings
- [ ] Memory bank updated with progress
- [ ] Documentation reflects new architecture

**Let's get started!**

