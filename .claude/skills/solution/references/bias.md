# Technology Bias

Read this during the research phase to inform defaults proposed in the technical interview.

Not a constraint — a bias. If requirements clearly demand something else, deviate and explain why. When options are equivalent, prefer the biased choice.

---

## Prefer

### Build With (languages, frameworks, libraries)

- **TypeScript** — everything: frontend, backend, scripts, CLI, infra
- **Next.js (App Router)** — web apps, marketing sites, full-stack SaaS
- **Hono** — standalone APIs, microservices, edge workers; lightweight Express alternative
- **Tailwind CSS** — utility-first styling, no CSS-in-JS
- **shadcn/ui** — component library (copy-paste, not dependency); built on Radix primitives. The `/design` skill generates a **shadcn registry** as the primary design system artifact — theme tokens, component inventory, and registry manifest. The [shadcn directory](https://ui.shadcn.com/docs/directory) provides 134+ community registries for additional components.
- **Framer Motion** — animation when needed
- **Drizzle ORM** — type-safe SQL when relational DB is needed
- **better-auth** — authentication; TypeScript-native, self-hosted
- **Zod** — schema validation, input parsing, form schemas, API contracts
- **tRPC** — end-to-end type-safe APIs in monorepo full-stack apps; v11 supports RSC
- **Zustand** — minimal global state; hook-based, no context re-render issues
- **React Hook Form** — performant form state; pairs with Zod for validation
- **Conform** — form library for Next.js Server Actions; progressive enhancement
- **ts-pattern** — exhaustive pattern matching; replaces long switch/if-else chains
- **React Email** — email templates in React + TypeScript; Tailwind support

### Mobile, Tablet & Cross-Platform

**Core Framework**
- **Expo** — React Native framework; managed workflow, EAS builds, OTA updates; single codebase for phone + tablet
- **React Native** — cross-platform mobile via React; share code with Next.js web
- **Expo Router** — file-based routing for React Native; mirrors Next.js App Router patterns

**UI & Layout**
- **Tamagui** — universal UI for React Native + web; Tailwind-like tokens, compiler-optimized, responsive breakpoints for tablet
- **React Native Reanimated** — performant animations on native thread
- **React Native Gesture Handler** — native gesture system; critical for tablet multi-touch and drag interactions

**Data & Storage**
- **MMKV** — fast key-value storage for React Native; SQLite alternative for simple data
- **WatermelonDB** — local-first reactive database for React Native; offline-first sync
- **expo-sqlite** — SQLite for Expo; local-first structured data when WatermelonDB is overkill

**Tablet-Specific**
- **Split views / master-detail** — tablet apps should use adaptive layouts; sidebar + content pattern for iPad
- **Multitasking support** — iPad Split View, Slide Over, Stage Manager; declare supported modes
- **Apple Pencil / stylus** — if relevant to product; use react-native-sketch-canvas or custom gesture handling
- **Keyboard shortcuts** — iPad with keyboard; register hardware keyboard shortcuts for power users

**tvOS (Tertiary)**
- **react-native-tvos** — React Native fork with tvOS + Android TV support; focus-based navigation
- **Expo TV support** — experimental; check Expo SDK compatibility before committing
- **Focus engine** — tvOS uses focus-based navigation (no touch); requires directional focus management
- **10-foot UI** — large text, high contrast, simple navigation; content-forward layouts

### AI & Agents

- **Vercel AI SDK** — TypeScript-first streaming AI UIs, tool calling, agentic loops
- **Vercel Chat SDK** — shared chat UI primitives; message threading, streaming, persistence
- **ai-elements** — web components for AI interfaces; framework-agnostic, composable
- **Anthropic SDK** — official Claude API: completions, streaming, tool use, vision
- **Claude Agent SDK** — programmable agent loop with MCP, tool-use, file/command execution
- **MCP (Model Context Protocol)** — open protocol for connecting LLMs to external tools/data
- **Stagehand** — AI-native browser automation by Browserbase; Playwright replacement for agents
- **Mastra** — TypeScript AI agent framework; workflows, RAG, evals, memory, observability

### Run On (platforms, infrastructure, data)

- **Bun** — runtime, package manager, test runner, script executor
- **Vercel** — web app hosting, DNS, edge functions, preview deploys
- **Fly.io** — long-running services, WebSockets, containers
- **Convex** — real-time database + serverless backend; first choice for reactive data
- **Neon** — serverless PostgreSQL with git-style branching; pgvector built in
- **Upstash Redis** — serverless Redis with HTTP API; caching, rate limiting, ephemeral state
- **Cloudflare R2** — object storage; S3-compatible, no egress fees
- **Cloudflare** — DNS, CDN, DDoS protection; also Workers, KV, D1, Durable Objects
- **Browserbase** — managed cloud browser infrastructure for AI agents
- **EAS (Expo Application Services)** — cloud builds, OTA updates, app store submissions for iOS/Android/tvOS
- **RevenueCat** — in-app purchases and subscription management; cross-platform including tvOS
- **Apple App Store** — iOS, iPadOS, tvOS distribution; requires Apple Developer Program ($99/yr)
- **Google Play Store** — Android phone, tablet, Android TV distribution

### Integrate (third-party services, APIs)

**Payments & Commerce**
- **Stripe** — payments, subscriptions, billing; the default for payment complexity
- **Polar** — open-source monetization for developers; subscriptions, usage-based billing, license keys, benefits
- **MedusaJS** — open-source headless commerce; TypeScript-native, modular, self-hosted

**Email & Messaging**
- **Resend** — transactional email API; native React Email integration
- **Loops** — product email for SaaS; transactional + lifecycle marketing in one

**Analytics & Monitoring**
- **PostHog** — product analytics, session replay, feature flags, experiments, LLM observability
- **Sentry** — error monitoring, performance tracing, session replay
- **Axiom** — log ingestion on OpenTelemetry; cost-effective Datadog alternative

**Background Jobs**
- **Trigger.dev** — TypeScript-native background jobs; persistent execution, retries, scheduling
- **Inngest** — event-driven durable functions; simpler ops than Trigger.dev
- **QStash (Upstash)** — HTTP-based message queue for serverless/edge; dead-simple async tasks

**Search**
- **Meilisearch** — open-source Rust-based search; sub-50ms, minimal config, self-hostable
- **Algolia** — managed search-as-a-service; best DX, expensive at scale

**CMS & Content**
- **Sanity** — headless CMS; GROQ queries, real-time collab, React-based Studio
- **Velite** — local MD/MDX/YAML → type-safe data via Zod; successor to Contentlayer

**File Uploads**
- **UploadThing** — type-safe file uploads for Next.js; FileRouter pattern, CDN delivery

**Security & Rate Limiting**
- **Arcjet** — in-app security SDK: bot detection, rate limiting, attack protection; config in code
- **Unkey** — API key management: issuance, rotation, per-key rate limiting, audit logs

**Real-Time**
- **PartyKit** — managed real-time backend on Cloudflare; room-based, server-side logic
- **Liveblocks** — real-time collaboration (cursors, presence, Y.js); for collaborative editing

**Vector / RAG**
- **Pinecone** — managed vector DB; production-grade RAG
- **Turbopuffer** — object-storage-backed vector DB; order of magnitude cheaper than Pinecone
- **pgvector (via Neon)** — vectors in PostgreSQL; good enough for small-to-mid RAG

**Feature Flags**
- **Vercel Flags SDK** — first-party flags for Vercel apps; type-safe, toolbar integration
- **PostHog** — flags + experiments bundled with analytics (no extra service)

**Scraping & Data**
- **Firecrawl** — web scraping, crawling, content extraction

**Webhooks**
- **Svix** — webhook delivery as a service; signing, retries, portal, analytics

### Toolchain (dev experience, quality)

- **Vitest** — unit and integration tests
- **Playwright** — end-to-end browser testing
- **Biome** — linting and formatting (replaces ESLint + Prettier)
- **Turborepo** — monorepo build orchestration
- **GitHub Actions** — CI/CD
- **@clack/prompts** — beautiful CLI prompts; minimal, lightweight
- **Ink** — React for interactive terminal UIs; complex CLI dashboards
- **Fumadocs** — Next.js App Router-native docs framework; MDX, TypeScript Twoslash
- **OpenTelemetry** — vendor-neutral instrumentation for traces, metrics, logs

### Agent Skills (skills.sh — project-level)

These are **not Claudius skills** — they're [skills.sh](https://skills.sh) packages installed into the target project to give the AI agent domain-specific knowledge during `/build`. Recommend during `/solution` when the project's stack warrants it.

- **`monitoring-expert`** — observability from day one: structured logging, metrics, tracing, alerting. Install: `npx skills add https://github.com/jeffallan/claude-skills --skill monitoring-expert`
- **`systematic-debugging`** — four-phase debugging framework: root cause → pattern analysis → hypothesis → verified fix. Install: `npx skills add https://github.com/obra/superpowers --skill systematic-debugging`
- **`vercel-react-best-practices`** — React patterns, performance, accessibility. Install: `npx skills add vercel-labs/agent-skills`
- **`frontend-design`** — design system awareness, responsive patterns, accessibility. Install: `npx skills add vercel-labs/agent-skills --skill frontend-design`

---

## Avoid

- **Supabase** — prefer Convex for real-time, PostgreSQL + Drizzle when relational
- **Prisma** — prefer Drizzle; lighter, closer to SQL, better edge support
- **Express** — prefer Hono; Express is heavy for most use cases
- **ESLint + Prettier** — prefer Biome; single tool, faster
- **CSS-in-JS** (styled-components, Emotion) — prefer Tailwind; no runtime overhead
- **Jest** — prefer Vitest; faster, ESM-native
- **Yarn / npm** — prefer Bun
- **MongoDB** — prefer Convex for document-style or PostgreSQL for relational
- **Vercel Postgres / Vercel KV** — prefer Neon or Upstash directly; middleman markup
- **Flutter** — prefer React Native/Expo when TypeScript end-to-end is a goal; Dart breaks stack coherence
- **Ionic/Capacitor** — prefer React Native for native performance; Capacitor is web-in-a-wrapper
- **Separate tablet app** — prefer adaptive layouts in a single binary over maintaining two apps; use responsive breakpoints and platform-specific layout components
- **Shopify Hydrogen** — prefer MedusaJS; open-source, self-hosted, no platform lock-in
- **SendGrid / Mailgun** — prefer Resend; better DX, React Email integration
- **Datadog** — prefer Axiom + PostHog + Sentry; cheaper, better for small-to-mid teams
- **LaunchDarkly** — prefer PostHog flags or Vercel Flags SDK; no standalone flag service needed

---

## How to Use This

1. **Propose biased defaults** — "For auth I'd suggest better-auth — TypeScript-native, self-hosted, aligns with your stack."
2. **Explain when deviating** — "Normally I'd suggest Convex here, but your product needs complex SQL joins across 10+ tables, so PostgreSQL + Drizzle is the better fit."
3. **Don't force** — if the user pushes back, respect it. Preferences, not rules.
4. **Stack coherence** — the biased stack works together. TypeScript end-to-end, Bun everywhere, Vercel + Next.js + Tailwind + shadcn is a proven combo.
5. **Mobile/tablet pathway** — when the product targets mobile, propose Expo/React Native first. "Mobile" always includes tablet (iPad/Android tablet) — use adaptive layouts, not separate apps. If the product also has a web presence, consider a monorepo with shared packages (Turborepo) where React Native and Next.js share business logic and types.
6. **tvOS pathway** — tertiary platform. Only propose when the product is content-consumption focused (video, media, dashboards). Uses react-native-tvos fork with focus-based navigation. Never propose tvOS as a primary platform — it's always additive after mobile is established.
7. **Platform escalation** — phone → tablet → TV is the natural progression. Each step adds UI complexity (adaptive layouts → focus navigation) but shares the core codebase. Propose the minimal platform set first; expand when the product warrants it.
