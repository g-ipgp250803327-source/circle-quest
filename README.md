# Circle Quest 🟡🚀

**Circle Quest** is an interactive, static web application (HTML, CSS, vanilla JavaScript) designed for Malaysian **Year 6 primary school pupils (Primary 6 / Year 6)** learning **KSSR Mathematics Standard 6.2 (Circles)**.

It provides a colourful, game-style learning environment that runs smoothly in any modern web browser without build tools or external server dependencies.

---

## 🎯 Educational Standards Covered (KSSR Mathematics Year 6)

1. **Learning Standard 6.2.1**: Recognize **centre**, **radius**, **diameter**, and **circumference** of a circle.
2. **Learning Standard 6.2.2**: Describe the relationship between **radius** and **diameter** ($$\text{Diameter} = 2 \times \text{Radius}$$ or $$\text{Radius} = \text{Diameter} \div 2$$).

---

## 🎮 Game Features & Missions

### 1. Home Menu
- **Bright, Mobile-Friendly UI**: Playful typography (Fredoka & Nunito fonts), bright game colors, large tap-friendly buttons, and responsive card layouts.
- **Star Counter & Sound Effects**: Top bar displays accumulated stars with audio feedback using the Web Audio API.

### 2. Mission 1: Explore Lab
- **Feature 1 (Tap to Highlight)**: Tap interactive buttons (**Centre**, **Radius**, **Diameter**, **Circumference**) to highlight specific geometric parts on an SVG circle diagram accompanied by simple English explanations.
- **Feature 2 (Radius Slider)**: Move the live radius slider ($1\text{ cm}$ to $10\text{ cm}$) to watch the SVG circle dynamically resize while live formula boxes calculate $$\text{Diameter} = 2 \times \text{Radius}$$ and $$\text{Radius} = \text{Diameter} \div 2$$ in real-time.
- **Feature 3 (Drag & Drop Activity)**: Place label tags (**Centre**, **Radius**, **Diameter**) onto matching SVG drop targets using mouse drag or touch selection. Includes instant answer checking and reset functionality.

### 3. Mission 2: Quiz Arena
- Multiple-choice quiz testing circle concepts and calculations.
- Instant answer feedback, explanation boxes, streak counter, score summary, and star rewards upon completion.

### 4. Mission 3: Real-Life Mission
- Interactive showcase highlighting real-world circular objects from Malaysian daily life:
  - ⏰ Classroom Wall Clock
  - 🚲 Bicycle Wheel
  - 🪙 50-Sen Coin
  - 🫓 Roti Canai
- Includes interactive math calculation challenges for each object.

---

## 🚀 How to Run Locally

Because **Circle Quest** is built using vanilla HTML, CSS, and JS with zero build steps, you can run it using any simple static file server:

### Option 1: Python HTTP Server
```bash
python3 -m http.server 8000
```
Then open your web browser and navigate to:
`http://localhost:8000`

### Option 2: Directly in Browser
You can also open `index.html` directly in any web browser by double-clicking the file or opening `file:///path/to/circle-quest/index.html`.

---

## 📁 File Architecture

```text
circle-quest/
├── index.html     # SPA layout, header, hero banner, and views for all 3 missions
├── styles.css     # Responsive game design styling, animations, SVG classes, and theme variables
├── app.js         # Navigation, Web Audio synth, SVG manipulations, drag-and-drop, quiz & real-life logic
└── README.md      # Documentation and usage instructions
```

---

## 🛠️ Tech Stack
- **HTML5**: Semantic tags, SVG diagrams, and accessible labels.
- **CSS3**: Flexbox, CSS Grid, Custom Variables, Animations.
- **Vanilla JavaScript (ES6+)**: No external libraries or build tools. Web Audio API for sound synthesis.
