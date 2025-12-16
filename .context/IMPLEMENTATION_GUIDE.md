# Implementation Guide

## Quick Start

Welcome! This guide will help you navigate the implementation plans and start building the Event Loop Visualizer.

## What You Have

A complete, phase-based implementation plan with **29 sessions** across **8 phases**. Each session is a self-contained unit of work with specifications, success criteria, and test requirements.

## Current Status

### ✅ Completed Planning
- [x] Architecture designed
- [x] Tech stack selected
- [x] All 29 sessions planned
- [x] Event loop rules documented
- [x] Preset scenarios specified
- [x] Dependencies mapped

### 📝 Ready to Implement
All sessions from 1.1 to 8.3 are ready to begin.

## How to Use This Plan

### For AI Coding Agents

If you're an AI agent implementing this project:

1. **Start Here:** Read `.context/README.md` for overview
2. **Understand Architecture:** Review `.context/architecture/overview.md`
3. **Check Dependencies:** Consult `.context/architecture/dependency-graph.md`
4. **Begin Phase 1:** Open `.context/phases/phase-01-core-simulator/README.md`
5. **First Session:** Implement `.context/phases/phase-01-core-simulator/session-1.1-types.md`
6. **Follow Success Criteria:** Check off items as you complete them
7. **Write Tests:** Implement test specifications from each session
8. **Move to Next:** Proceed to session 1.2, then 1.3, etc.

### For Human Developers

1. **Familiarize:** Read architecture and tech stack docs
2. **Setup Project:** Initialize Vite + React + TypeScript
3. **Install Dependencies:** See `tech-stack.md` for package list
4. **Follow Sessions:** Implement one session at a time
5. **Test Continuously:** Write tests as you go
6. **Commit Often:** Commit after each session completes

### For Teams

- **Assign Phases:** Different developers can own different phases
- **Coordinate:** Use dependency graph to avoid blocking each other
- **Review Together:** Code review at phase boundaries
- **Test Integration:** Run integration tests between phases

## Session File Structure

Every session file has:

1. **Overview** - What you're building
2. **Prerequisites** - What must exist first
3. **Goals** - Checkboxes to mark completion
4. **Files to Create/Modify** - Exact paths
5. **Type Definitions** - Interfaces with examples
6. **Implementation Specifications** - What functions do
7. **Success Criteria** - How to verify done
8. **Test Specifications** - What to test
9. **Integration Points** - How it connects
10. **References** - Related docs

## First Steps (Detailed)

### Step 1: Project Initialization

```bash
# Create project
npm create vite@latest event-loop-visualizer -- --template react-ts

# Navigate
cd event-loop-visualizer

# Install dependencies (see tech-stack.md for complete list)
npm install react react-dom framer-motion immer
npm install -D typescript vite @vitejs/plugin-react vitest @testing-library/react tailwindcss

# Initialize Tailwind
npx tailwindcss init -p
```

### Step 2: Configure TypeScript

Edit `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/core/*": ["./src/core/*"],
      "@/state/*": ["./src/state/*"],
      "@/components/*": ["./src/components/*"],
      "@/animations/*": ["./src/animations/*"]
    }
  }
}
```

### Step 3: Create Directory Structure

```bash
mkdir -p src/core/{types,simulator,scenarios,utils}
mkdir -p src/state/{reducers,actions,hooks}
mkdir -p src/components/{layout,visualization,controls,panels,timeline,common}
mkdir -p src/animations/hooks
mkdir -p tests/{unit,integration,e2e}
```

### Step 4: Begin Session 1.1

Open `phases/phase-01-core-simulator/session-1.1-types.md` and start implementing the type definitions.

## Progress Tracking

### Mark Sessions Complete

As you finish sessions, update the session summary:

Edit `.context/phases/session-summary.md`:

```markdown
## Phase 1: Core Simulator (5 sessions)

- [x] Session 1.1: Type Definitions ✅ Dec 15, 2024
- [x] Session 1.2: Queue and Stack ✅ Dec 16, 2024
- [ ] Session 1.3: Enqueue Rules
- [ ] Session 1.4: Tick Logic
- [ ] Session 1.5: Render Logic
```

### Track Tests

Keep a separate `TEST_STATUS.md` in the project root:

```markdown
# Test Coverage

## Unit Tests
- [x] Types compile correctly
- [x] Queue FIFO ordering
- [x] Stack LIFO ordering
- [ ] Enqueue rules
...

## Current Coverage: 67%
```

## Common Questions

### Q: Can I skip sessions?

**A:** No. Sessions have dependencies. Follow the dependency graph.

### Q: Can I change the implementation approach?

**A:** Yes! Session files are specifications, not step-by-step instructions. Implement however you want, as long as success criteria are met.

### Q: What if I find a better way?

**A:** Great! Document the change and update the session file to reflect what was actually built.

### Q: Can I work on multiple sessions in parallel?

**A:** Only if they have no dependencies. Check the dependency graph first.

### Q: How long should each session take?

**A:** 2-4 hours of focused work. Some complex sessions (1.4, 4.1) may take longer.

### Q: Do I need to write all the tests?

**A:** Yes. Tests are critical for a deterministic system. Don't skip them.

## Tips for Success

### 1. Read First, Code Second
Don't jump into coding. Read the entire session file, understand what you're building, then start.

### 2. Test as You Go
Write tests alongside implementation. Don't leave testing for later.

### 3. Reference the Rules
Keep `reference/event-loop-rules.md` open while coding the simulator.

### 4. Use the Glossary
Confused by a term? Check `reference/glossary.md`.

### 5. Commit After Each Session
Session boundaries are natural commit points.

### 6. Review Your Work
After each phase, review the code. Does it match the architecture?

## Troubleshooting

### TypeScript Errors

- Ensure tsconfig.json has strict mode enabled
- Check that paths are configured correctly
- Make sure all types are imported from correct locations

### Tests Failing

- Re-read test specifications
- Verify you implemented the exact behavior described
- Check edge cases (empty queues, etc.)

### Dependency Issues

- Make sure prerequisite sessions are complete
- Check if you're importing from non-existent files
- Review dependency graph

### Animations Not Working

- Ensure state is changing (check with React DevTools)
- Verify Framer Motion is installed
- Check that layoutId props are unique

## Getting Help

### Documentation
- Architecture: `.context/architecture/`
- Reference: `.context/reference/`
- Tech Stack: `.context/tech-stack.md`

### External Resources
- React docs: https://react.dev
- TypeScript docs: https://www.typescriptlang.org/docs
- Framer Motion: https://www.framer.com/motion
- Tailwind CSS: https://tailwindcss.com/docs

## Milestones

### Milestone 1: Core Simulator Complete (Phase 1)
You have a working simulator that can process scenarios. Test it in a Node script before moving to UI.

### Milestone 2: State Management Complete (Phase 2)
You have React state management wrapping the simulator. Can step through scenarios via dispatch.

### Milestone 3: UI Scaffold Complete (Phase 3)
You can see the simulator state visualized. No animations yet, but structure is there.

### Milestone 4: Animations Complete (Phase 4)
Tasks move between regions. The visualization is alive!

### Milestone 5: Controls Complete (Phase 5)
You can play, pause, step, scrub. Full interactivity.

### Milestone 6: Scenarios Complete (Phase 6)
All 8 presets work. Can build custom scenarios.

### Milestone 7: Accessible (Phase 7)
Works with keyboard, screen readers, mobile.

### Milestone 8: Polished (Phase 8)
Production-ready with explanations, inspector, dev mode.

## Success Metrics

You'll know the project is complete when:

- [ ] All 8 presets load and run correctly
- [ ] Logs match expected output for each preset
- [ ] Can step forward/back through any scenario
- [ ] Timeline scrubbing works
- [ ] Animations are smooth
- [ ] Keyboard navigation works
- [ ] Responsive on mobile
- [ ] Test coverage > 85%
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Passes all acceptance criteria from requirements

## Next Steps After Completion

Once all 29 sessions are complete:

1. **Deploy:** Host on Vercel/Netlify
2. **Document:** Write user-facing docs
3. **Share:** Share with educators and learners
4. **Iterate:** Gather feedback, add more presets
5. **Extend:** Consider adding Node.js event loop variant

## Estimated Timeline

- **Full-time (40 hrs/week):** 3-4 weeks
- **Part-time (20 hrs/week):** 6-8 weeks
- **Side project (10 hrs/week):** 12-16 weeks

## Good Luck!

You have everything you need to build an amazing educational tool. Take it one session at a time, write good tests, and have fun! 🚀

---

**Start here:** `.context/phases/phase-01-core-simulator/session-1.1-types.md`
