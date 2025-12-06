# Frontend

Frontend architecture for **“Synthetic Image Detection using Gradient Fields.”** The app is built with Next.js to make gradient-domain concepts interactive and visual. Math and numerics stay in the Python backend; the frontend focuses on experience, learning, and exploration.

---

## 1. Frontend goals

1. Visualize images and gradient fields clearly
2. Enable interactive gradient editing
3. Make Poisson reconstruction and its effects tangible
4. Provide simple tools for synthetic-image analysis
5. Present everything in a calm, clear UI that supports learning

Short version: the frontend explains and shows; the backend computes.

---

## 2. Technology and design guidelines

### 2.1 Tech stack

- Framework: Next.js (App Router recommended)
- Styling: Tailwind CSS; shadcn/ui for buttons, sliders, tabs, dialogs
- State: React state and simple contexts; optionally Zustand or Jotai later
- Canvas: HTML Canvas or WebGL for gradient interaction and image display

### 2.2 Visual style

- Clean, minimal, technical but friendly
- Plenty of whitespace and clear typography with a few accent colors
- Short explanatory text, avoid long blocks
- Tooltips and small info bubbles for theory snippets
- Keywords: lab, clarity, control, exploration

---

## 3. Routing and pages (App Router)

```text
app/
  ├─ layout.tsx        # base layout, header, footer, theme
  ├─ page.tsx          # Home
  ├─ lab/
  │   └─ page.tsx      # Gradient Editing Lab
  ├─ analyzer/
  │   └─ page.tsx      # Synthetic Image Analyzer
  └─ about/
      └─ page.tsx      # short conceptual explainer
```

Add `components/` for UI building blocks and `lib/` for API and utilities.

---

## 4. Page content (overview)

### 4.1 Home page `/`

- Hero: title “Gradient Lab”, one-line subtitle like “Edit image gradients and reconstruct images from your changes”, buttons “Go to Lab” and “Go to Analyzer”
- Section “What is a gradient field?” with a small visual (example image plus dx/dy graphic) and a few sentences explaining pixel vs gradient domain
- Section “Modules” with cards for “Gradient Editing Lab” and “Synthetic Analyzer” (description + link)
- Optional short “How it works” timeline (1. load image, 2. view gradients, 3. edit gradients, 4. reconstruct/analyze)

### 4.2 Gradient Editing Lab `/lab`

Main interactive page.

Layout idea:

```text
┌────────────────────────────────────────────┐
│ Header with navigation                     │
├────────────────────────────────────────────┤
│ Controls     │   Views                     │
│ (left)       │   (right)                  │
│              │                             │
│ - Image upload│  - Tabs: Original, dx, dy  │
│ - Tools       │  - Canvas view             │
│ - Brush       │  - Comparison area         │
│ - Actions     │                             │
└────────────────────────────────────────────┘
```

Sections:

1. Header row — title “Gradient Editing Lab”, one-line description, help tooltip/link
2. Image Loader (`ImageLoaderPanel`) — upload button, file name/resolution display, dropdown with sample images (portrait, landscape, synthetic); after upload call `POST /api/images` and store `imageId` + dimensions
3. Gradient views (`GradientViewPanel`) — tabs: Original, dx, dy, |Grad|; render via canvas or `<img>`; short hint below each tab (e.g., dx shows vertical edges)
4. Gradient edit tools (`GradientEditControls`) — tool selection (Edit dx/dy), brush size/strength sliders, modes: Draw, Erase, Sharpen, Smooth; feeds `GradientCanvas`
5. GradientCanvas — interactive drawing on dx or dy with visual feedback; stores edits (per-pixel or patch deltas); optional split mode (left original, right edited)
6. Reconstruction (`ReconstructionPanel`) — “Reconstruct” button sends `imageId` + edits to `POST /api/reconstruct`; show grid with Original, Gradient visualization (e.g., magnitude), Reconstructed; optional “Show difference” overlay
7. Micro-explanations — small info icons near key UI elements (dx, dy tabs; Reconstruct button) with concise theory notes

### 4.3 Synthetic Analyzer `/analyzer`

Purpose: compare real vs synthetic images based on gradient structure.

Layout idea:

```text
┌────────────────────────────────────────────┐
│ Header                                    │
├────────────────────────────────────────────┤
│ Upload / selection                        │
├────────────────────────────────────────────┤
│ Comparison area:                          │
│  Real vs AI (optional)                    │
│  Gradients, magnitude, heatmaps           │
└────────────────────────────────────────────┘
```

Content:

1. Intro — one paragraph on how gradient patterns can reveal synthetic artifacts
2. Input (`AnalyzerInputPanel`) — upload two images (slots A/B) or pick demo images (real example, AI example); after selection, call `POST /api/images` for each and store two imageIds
3. Analyzer views (`AnalyzerComparisonPanel`) — columns or tabs:

```text
Column A                      Column B
Original A                    Original B
dx A                          dx B
dy A                          dy B
Heatmap A                     Heatmap B
```

Data sources: `GET /api/gradients?imageId=` and `POST /api/analyze`.

4. Scores (`AnalyzerScores`) — show backend scores (e.g., edgeConsistency, smoothnessScore, textureWeirdness) with short interpretations; compare A vs B visually (side-by-side bars)

### 4.4 About page `/about`

Brief background:

- Why gradient domain (short idea, no formulas)
- How it works technically (Python backend + Poisson reconstruction)
- “What to try” suggestions (e.g., set dx to zero, strengthen edges locally, etc.)
- Optional links to further reading

---

## 5. Component architecture

```text
components/
  ├─ layout/
  │   ├─ AppHeader.tsx
  │   ├─ AppFooter.tsx
  │   └─ PageLayout.tsx
  │
  ├─ lab/
  │   ├─ ImageLoaderPanel.tsx
  │   ├─ GradientViewPanel.tsx
  │   ├─ GradientEditControls.tsx
  │   ├─ GradientCanvas.tsx
  │   └─ ReconstructionPanel.tsx
  │
  ├─ analyzer/
  │   ├─ AnalyzerInputPanel.tsx
  │   ├─ AnalyzerComparisonPanel.tsx
  │   └─ AnalyzerScores.tsx
  │
  ├─ ui/
  │   ├─ Button.tsx        # shadcn wrappers
  │   ├─ Slider.tsx
  │   ├─ Tabs.tsx
  │   ├─ Card.tsx
  │   └─ Tooltip.tsx
  │
  └─ common/
      ├─ ImageWithSkeleton.tsx
      ├─ SectionHeadline.tsx
      └─ InfoTooltip.tsx
```

Layout components keep the shell consistent; lab/analyzer components encapsulate their own screens and logic.

---

## 6. State management

Suggested pattern:

- `LabContext`
  - current `imageId`
  - image metadata (width, height)
  - loaded gradient URLs
  - current edit mode and tool settings
- `AnalyzerContext`
  - `imageIdA`, `imageIdB`
  - gradient and analysis data per image

Place contexts in `app/lab/providers.tsx` and `app/analyzer/providers.tsx` and wire them at page or layout level.

---

## 7. API integration

`lib/api/` hosts a small client that wraps backend routes.

```text
lib/api/
  ├─ client.ts
  └─ types.ts
```

Example signatures:

- `uploadImage(file: File): Promise<UploadImageResponse>`
- `getGradients(imageId: string): Promise<GradientsResponse>`
- `reconstructImage(payload: ReconstructionRequest): Promise<ReconstructionResponse>`
- `analyzeImage(imageId: string): Promise<AnalysisResponse>`

Keeps UI code clean and unaware of backend details.

---

## 8. Interaction flows

### 8.1 Lab flow

1. User uploads an image
2. Backend returns `imageId` and dimensions
3. Frontend fetches gradients via `getGradients`
4. User edits gradients in `GradientCanvas`
5. User clicks “Reconstruct”
6. Frontend sends edits + `imageId` to `reconstructImage`
7. Backend returns `reconstructedUrl`
8. `ReconstructionPanel` shows the comparison

### 8.2 Analyzer flow

1. User uploads one or two images or picks samples
2. Frontend fetches gradients via `getGradients`
3. Frontend fetches analysis via `analyzeImage`
4. `AnalyzerComparisonPanel` shows original, gradients, and heatmaps
5. `AnalyzerScores` shows numbers with short interpretations

---

## 9. Didactics as a design principle

The screens are a learning lab, not a production UI. Prefer:

- Few but well-explained controls
- A small “What can I try?” box on each page
- Visual side-by-side comparisons instead of long text
- Consistent use of tooltips and short explanations instead of big theory blocks
