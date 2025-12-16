# Event Loop Visualizer

An interactive, animated web application for learning how the JavaScript event loop works. Watch tasks flow through the call stack, queues, and rendering pipeline with step-by-step explanations.

## 🎯 Project Status

**Planning Phase Complete** ✅

This project has a comprehensive implementation plan ready to execute. See `.context/` directory for detailed specifications.

## 📋 What This Will Be

An educational tool that visualizes:
- **Call Stack** execution
- **Macrotask Queue** (setTimeout, fetch, events)
- **Microtask Queue** (Promise.then, async/await)
- **Web APIs** (timers, network, DOM)
- **Rendering Pipeline** (requestAnimationFrame, paint)

### Key Features (Planned)

- ✨ **Step-by-step playback** - Watch the event loop advance one tick at a time
- 🎬 **Smooth animations** - Tasks move between queues with beautiful transitions
- 🎓 **8+ Preset scenarios** - Learn core concepts (promises vs timers, microtask draining, etc.)
- 🔧 **Scenario builder** - Create custom scenarios to test your understanding
- ⏱️ **Timeline scrubbing** - Jump to any point in the simulation
- ♿ **Fully accessible** - Keyboard navigation, screen reader support, reduced motion
- 📱 **Responsive design** - Works on desktop, tablet, and mobile

## 🏗️ Architecture

- **Core**: Pure TypeScript simulation engine (deterministic, no UI dependencies)
- **State**: React Context + useReducer with time-travel history
- **UI**: React 18 with Framer Motion animations
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library + Playwright

## 📚 Implementation Plan

This project has **29 sessions** organized into **8 phases**:

1. **Phase 1**: Core Simulator (5 sessions) - Pure TypeScript event loop engine
2. **Phase 2**: State Management (3 sessions) - React state with history
3. **Phase 3**: UI Scaffolding (4 sessions) - Layout and components
4. **Phase 4**: Animation System (4 sessions) - Coordinated animations
5. **Phase 5**: Controls & Timeline (3 sessions) - Playback controls
6. **Phase 6**: Scenarios (4 sessions) - Presets and builder
7. **Phase 7**: Accessibility (3 sessions) - Keyboard, ARIA, responsive
8. **Phase 8**: Polish (3 sessions) - Explanations, inspector, dev mode

### Getting Started with Implementation

1. **Read the plan**: `.context/README.md`
2. **Understand architecture**: `.context/architecture/overview.md`
3. **Start coding**: `.context/phases/phase-01-core-simulator/session-1.1-types.md`

### Quick Links

- 📖 [Implementation Guide](.context/IMPLEMENTATION_GUIDE.md) - How to begin
- 🏛️ [Architecture Overview](.context/architecture/overview.md) - System design
- 📊 [Dependency Graph](.context/architecture/dependency-graph.md) - Critical path
- 📋 [Event Loop Rules](.context/reference/event-loop-rules.md) - Simulation spec
- 🎓 [Preset Scenarios](.context/reference/preset-scenarios.md) - Learning outcomes
- 🧪 [Testing Strategy](.context/testing-strategy.md) - How to test

## 🎓 Learning Objectives

Users will learn:
- ✅ Why `setTimeout(fn, 0)` doesn't execute immediately
- ✅ How microtasks (Promise.then) execute before macrotasks (setTimeout)
- ✅ How `async/await` works under the hood (microtask continuations)
- ✅ When rendering happens relative to task execution
- ✅ How requestAnimationFrame fits into the event loop
- ✅ What causes "microtask starvation" and UI freezes

## 🛠️ Tech Stack

- **Language**: TypeScript 5.x
- **Framework**: React 18+ with hooks
- **Build Tool**: Vite
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS
- **State**: React Context + useReducer + Immer
- **Testing**: Vitest, React Testing Library, Playwright
- **Components**: Radix UI (accessible primitives)

See [tech-stack.md](.context/tech-stack.md) for detailed rationale.

## 📅 Timeline Estimates

- **MVP** (12 sessions): 24-48 hours
- **Full v1.0** (29 sessions): 95-122 hours
- **Part-time (20hr/week)**: 6-8 weeks
- **Full-time (40hr/week)**: 3-4 weeks

## 🤝 Contributing

This project is in the planning phase. Implementation will follow the detailed specifications in `.context/`.

### Development Workflow

1. Choose a session from `.context/phases/`
2. Implement according to specifications
3. Write tests as specified
4. Verify success criteria
5. Commit and move to next session

### Prerequisites

- Node.js 18+
- Understanding of JavaScript event loop
- React and TypeScript experience
- Familiarity with testing

## 📝 Project Principles

- **Determinism**: Same input → same output, always
- **Testability**: Every feature has tests
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: 60fps animations, < 200KB bundle
- **Clarity**: Simple, understandable code over clever code

## 📄 License

[License TBD - suggest MIT or Apache 2.0 for educational projects]

## 🙏 Acknowledgments

Inspired by:
- [Loupe](http://latentflip.com/loupe/) by Philip Roberts
- [Jake Archibald's event loop talk](https://www.youtube.com/watch?v=cCOL7MC4Pl0)
- [MDN Event Loop docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)

---

## 🚀 Next Steps

**Ready to build?** Start here: [Implementation Guide](.context/IMPLEMENTATION_GUIDE.md)

**Questions?** Check the [Glossary](.context/reference/glossary.md)

**Curious about the model?** Read [Event Loop Rules](.context/reference/event-loop-rules.md)
