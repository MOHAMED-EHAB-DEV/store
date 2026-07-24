# Design System Guidelines — Mohammed Ehab Templates (MHD Store)

## 1. Design Philosophy
Modern, dark-mode-first aesthetic with dynamic gradients, sleek glassmorphism, micro-animations, and responsive layouts. Engineered for developer tools and high-converting SaaS product showcases.

---

## 2. Color Palette & Tokens

### Core Theme Colors
| Token | CSS Variable / Hex | Usage |
| :--- | :--- | :--- |
| **Background** | `--background: #0d0f19` | Deep space background |
| **Card Surface** | `--card: #15161b` | Cards & surface containers |
| **Primary** | `--primary: #0d0f19` | Core structural surface |
| **Secondary Text** | `--secondary: #8c86a7` | Subtitles & secondary information |
| **Muted Text** | `--muted-foreground: #a0a0ab` | Labels & secondary content |
| **Border / Input** | `--border: #24262c` | Subtle UI dividers and inputs |
| **Accent (Gold)** | `--accent: #f6e96a` | Highlights & featured elements |

### Accent Gradients & Glassmorphism
- **Primary Gradient:** `from-green-400 via-teal-400 to-cyan-400`
- **Secondary Gradient:** `from-blue-500 to-cyan-500`
- **Glassmorphism Overlay:** `hsl(210 40% 98% / 0.1)` with border `hsl(210 40% 98% / 0.2)`
- **Scrollbar Gradient:** `linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)`

---

## 3. Typography

- **Primary Body Font:** `Roboto` (sans-serif)
- **Display / Heading Font:** `Parastoo` (`var(--font-paras)`)

### Type Scale
- **Headings (H1/H2):** `3xl` to `7xl` (`1.875rem` to `4.5rem`), bold, gradient text fill.
- **Body:** `base` (`1rem`) and `lg` (`1.125rem`), `leading-relaxed`.
- **Small Text / Captions:** `xs` (`0.75rem`) to `sm` (`0.875rem`).

---

## 4. Component Patterns

### Cards & Containers
- Dark glass container (`glass-strong` or `bg-[#15161b]`).
- Rounded borders (`rounded-2xl` or `rounded-3xl`).
- Hover effects: Subtle scale, border glow transition, and soft elevation (`shadow-[0_0_30px_rgba(255,215,0,0.6)]`).

### Badges & Pill Tags
- Linear gradient backgrounds (`from-green-500 to-teal-500`).
- Integrated icons with text for feature high-lighting.

---

## 5. Animations & Motion

- **GSAP:** ScrollTrigger for stagger entries (`y: 40`, `opacity: 0`, `duration: 1.5s`).
- **Keyframe Animations:**
  - `float`: Continuous vertical hover float.
  - `shine`: Interactive element sheen effect.
  - `twinkle`: Star/particle illumination.
  - `shimmer`: Loading skeleton shimmer.
  - `left/right-infinite-scroll`: Infinite marquee carousels.

---

## 6. Layout & Responsiveness Guidelines

- **Container:** `max-w-7xl mx-auto px-4`.
- **RTL Logical Styling:** Use `text-start`, `text-end`, `ms-*`, `pe-*` for full directional compatibility.
