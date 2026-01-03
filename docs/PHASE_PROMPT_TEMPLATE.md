# Phase [N] Implementation Prompt Template

## Context
This is a prompt template for implementing phases of the comprehensive fixes and refactor plan for the Global Information Portal project. Replace `[N]` with the phase number (1, 2, 3, or 4) and customize the phase-specific sections as needed.

---

## Prompt for Phase [N]

**Hi Gee,**

I'm ready to start implementing **Phase [N]: [Phase Name]** from the `FIXES_AND_REFACTOR_PLAN.md`. 

### Project Context
- **Project:** Global Information Portal (2D Global Info Portal)
- **Tech Stack:** Vanilla JavaScript (ES Modules), HTML5, CSS3, D3.js
- **Current State:** [Brief description of current state - e.g., "We have duplicate JS entry files and mobile CSS loading issues"]
- **Goal:** [Brief description of what this phase accomplishes]

### Phase [N] Overview
According to the plan, Phase [N] includes:
- **[Task Group 1]:** [Brief description]
- **[Task Group 2]:** [Brief description]
- **[Task Group 3]:** [Brief description]

### What I Need You To Do

1. **Review the Plan:**
   - Read `FIXES_AND_REFACTOR_PLAN.md` and focus on Phase [N] tasks
   - Understand the dependencies and prerequisites
   - Identify any potential issues or conflicts with current codebase

2. **Create Implementation Checklist:**
   - Break down Phase [N] tasks into actionable steps
   - Identify which files need to be read/modified
   - Note any files that need to be created
   - Flag any potential risks or complications

3. **Execute Phase [N] Tasks:**
   - Work through each task systematically
   - Follow the plan's specifications
   - Test as you go (where applicable)
   - Update documentation as you make changes

4. **Update Memory Bank:**
   - Update `memory-bank/activeContext.md` with progress
   - Update `memory-bank/systemPatterns.md` if architecture changes
   - Update `memory-bank/progress.md` with completed tasks

5. **Provide Summary:**
   - List what was completed
   - Note any deviations from the plan and why
   - Identify any blockers or issues encountered
   - Suggest next steps

### Important Guidelines
- **Don't break existing functionality** - test after each major change
- **Follow the plan's order** - respect dependencies between tasks
- **Document as you go** - update comments and docs inline
- **Ask if unsure** - if something in the plan is unclear, ask before proceeding
- **Be thorough** - don't skip steps or take shortcuts

### Phase-Specific Notes
[Add any phase-specific instructions, constraints, or considerations here]

### Success Criteria
Phase [N] is complete when:
- [ ] All tasks in Phase [N] are completed
- [ ] All tests pass (if applicable)
- [ ] Documentation is updated
- [ ] Memory bank reflects new state
- [ ] No regressions introduced

**Let's get started!**

---

## Phase-Specific Customizations

### For Phase 1: Critical Fixes

**Phase 1 Overview:**
According to the plan, Phase 1 includes:
- **1.1 JavaScript Entry Consolidation:** Consolidate `js/main.js` and `js/index.js` into single entry point
- **1.2 Mobile CSS Scoping:** Fix unconditional mobile CSS loading by scoping rules to media queries

**Phase-Specific Notes:**
- This is CRITICAL - these fixes address fundamental architectural issues
- Be very careful when modifying entry points - test thoroughly
- For CSS changes, test on both desktop and mobile viewports
- Keep `js/main.js` temporarily with deprecation notice until verification complete

**Success Criteria:**
- [ ] Single JS entry point (`js/index.js`) used consistently
- [ ] No duplicate function implementations
- [ ] Mobile CSS properly scoped, doesn't affect desktop
- [ ] All features work correctly in both dev and build scenarios
- [ ] No console errors or warnings

---

### For Phase 2: Cleanup & Consolidation

**Phase 2 Overview:**
According to the plan, Phase 2 includes:
- **2.1 Remove Dead Code & Duplicates:** Clean up deprecated files and duplicate implementations
- **2.2 Update Documentation:** Update memory bank and project docs

**Phase-Specific Notes:**
- This phase depends on Phase 1 being complete
- Be conservative when deleting files - verify they're truly unused
- Update all references before deleting anything
- Keep git history for reference if needed

**Success Criteria:**
- [ ] Dead code removed
- [ ] Documentation updated
- [ ] Codebase is cleaner and more maintainable
- [ ] No broken references or imports

---

### For Phase 3: JavaScript Refactoring

**Phase 3 Overview:**
According to the plan, Phase 3 includes:
- **3.1 Module Structure Refactoring:** Standardize modules, consolidate panels, reorganize utilities
- **3.2 Code Quality Improvements:** Refactor large functions, standardize error handling, add JSDoc
- **3.3 Performance Optimizations:** Lazy loading, DOM optimization, memoization
- **3.4 Modernization:** ES modules, state management, event handling, modern JS features
- **3.5 Testing and Documentation:** Unit tests, enhanced docs, API documentation

**Phase-Specific Notes:**
- This is a large phase - work incrementally, one task group at a time
- Maintain backward compatibility where possible
- Test thoroughly after each major refactoring step
- Some tasks can be done in parallel (e.g., documentation while refactoring)
- Follow the migration strategy from `js-refactor-implementation.md`

**Success Criteria:**
- [ ] Consistent module structure
- [ ] No duplicate panel implementations
- [ ] Improved code quality (smaller functions, better error handling)
- [ ] Performance optimizations implemented
- [ ] Modern JavaScript features used throughout
- [ ] Comprehensive test coverage (if implementing 3.5.1)

---

### For Phase 4: Verification & Finalization

**Phase 4 Overview:**
According to the plan, Phase 4 includes:
- **4.1 Comprehensive Testing:** Integration, performance, and accessibility testing
- **4.2 Documentation Finalization:** Update all docs, create changelog

**Phase-Specific Notes:**
- This phase validates all previous work
- Be thorough with testing - catch issues before they reach production
- Document any issues found and how they were resolved
- Create comprehensive changelog for all changes

**Success Criteria:**
- [ ] All tests pass
- [ ] Performance metrics meet targets
- [ ] Accessibility standards met
- [ ] Documentation complete and accurate
- [ ] Changelog created

---

## Usage Instructions

1. **Copy the base prompt template** (first section)
2. **Replace `[N]` with the phase number** (1, 2, 3, or 4)
3. **Fill in the phase-specific sections** using the examples above
4. **Customize as needed** for your specific situation
5. **Send to Gee** to begin implementation

## Quick Reference

- **Phase 1:** Critical fixes (JS entry, mobile CSS) - START HERE
- **Phase 2:** Cleanup (dead code, docs) - After Phase 1
- **Phase 3:** Refactoring (modules, quality, performance, modernization) - After Phase 2
- **Phase 4:** Verification (testing, final docs) - After Phase 3

