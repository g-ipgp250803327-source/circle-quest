/**
 * Circle Quest - Main Application JavaScript
 * Designed for Malaysian Year 6 KSSR Mathematics (6.2.1 & 6.2.2)
 *
 * Covers:
 *  - 6.2.1: Recognize centre, radius, diameter, and circumference of a circle.
 *  - 6.2.2: Relationship between radius and diameter (Diameter = 2 × Radius).
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global App State
  const gameState = {
    stars: 0,
    soundMuted: false,
    dragSelectedTag: null, // For tap-to-select fallback on touch/mobile
    quizCurrentIndex: 0,
    quizStreak: 0,
    quizScore: 0,
    currentRealObject: 'clock',
    dragCorrectCount: 0
  };

  /* ==========================================================================
     1. Sound Synthesizer (Web Audio API - No External Files Required)
     ========================================================================== */
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  function playSound(type) {
    if (gameState.soundMuted || !audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'correct') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'star') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  }

  // Toggle sound
  const soundBtn = document.getElementById('sound-btn');
  soundBtn.addEventListener('click', () => {
    gameState.soundMuted = !gameState.soundMuted;
    soundBtn.textContent = gameState.soundMuted ? '🔇' : '🔊';
  });

  // Add stars helper
  function addStars(amount) {
    gameState.stars += amount;
    const starCountEl = document.getElementById('star-count');
    starCountEl.textContent = gameState.stars;
    playSound('star');
  }

  /* ==========================================================================
     2. Navigation (Main Views and Subtabs)
     ========================================================================== */
  // View Switcher
  function switchView(viewId) {
    playSound('click');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.classList.add('active-view');
      window.scrollTo(0, 0);
    }
  }

  // Brand click returns home
  document.getElementById('brand-logo').addEventListener('click', () => switchView('home-view'));

  // Start mission buttons on Home Card
  document.querySelectorAll('.start-mission-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target.getAttribute('data-target');
      switchView(target);
    });
  });

  // Back to Menu buttons
  document.querySelectorAll('.back-home-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView('home-view'));
  });

  // Subtab switcher inside Mission 1
  document.querySelectorAll('.sub-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      playSound('click');
      document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));

      e.target.classList.add('active');
      const targetSub = e.target.getAttribute('data-subtab');
      const subContent = document.getElementById(targetSub);
      if (subContent) {
        subContent.classList.add('active');
      }
    });
  });

  /* ==========================================================================
     3. Mission 1: Feature 1 - Tap to Highlight Parts
     ========================================================================== */
  const highlightData = {
    centre: {
      title: '📍 Centre (Middle Point)',
      text: 'The <strong>centre</strong> is the exact middle point of a circle. Every point on the outer boundary is at the exact same distance from the centre!',
      activate: () => {
        setHighlightState({ centre: true, radius: false, diameter: false, circumference: false });
      }
    },
    radius: {
      title: '📏 Radius (Half Distance)',
      text: 'The <strong>radius</strong> is a straight line from the <strong>centre</strong> to any point on the outer edge. It is exactly half of the diameter!',
      activate: () => {
        setHighlightState({ centre: true, radius: true, diameter: false, circumference: false });
      }
    },
    diameter: {
      title: '↔️ Diameter (Full Distance Across)',
      text: 'The <strong>diameter</strong> is a straight line passing through the <strong>centre</strong> from one side of the circle to the other. It is twice as long as the radius (<strong>Diameter = 2 × Radius</strong>)!',
      activate: () => {
        setHighlightState({ centre: true, radius: false, diameter: true, circumference: false });
      }
    },
    circumference: {
      title: '⭕ Circumference (Outer Perimeter)',
      text: 'The <strong>circumference</strong> is the total distance around the outside edge of the circle.',
      activate: () => {
        setHighlightState({ centre: false, radius: false, diameter: false, circumference: true });
      }
    }
  };

  function setHighlightState({ centre, radius, diameter, circumference }) {
    const bgCircle = document.getElementById('tap-circle-bg');
    const radiusLine = document.getElementById('tap-radius-line');
    const diameterLine = document.getElementById('tap-diameter-line');
    const centrePoint = document.getElementById('tap-centre-point');
    const centreText = document.getElementById('tap-centre-text');
    const radiusText = document.getElementById('tap-radius-text');
    const diameterText = document.getElementById('tap-diameter-text');

    // Circumference highlight
    if (circumference) {
      bgCircle.classList.add('hl-active');
    } else {
      bgCircle.classList.remove('hl-active');
    }

    // Radius line
    if (radius) {
      radiusLine.classList.remove('hl-inactive');
      radiusText.style.opacity = '1';
    } else {
      radiusLine.classList.add('hl-inactive');
      radiusText.style.opacity = '0.2';
    }

    // Diameter line
    if (diameter) {
      diameterLine.classList.remove('hl-inactive');
      diameterText.style.opacity = '1';
    } else {
      diameterLine.classList.add('hl-inactive');
      diameterText.style.opacity = '0.2';
    }

    // Centre point
    if (centre) {
      centrePoint.classList.add('hl-active');
      centrePoint.classList.remove('hl-inactive');
      centreText.style.opacity = '1';
    } else {
      centrePoint.classList.remove('hl-active');
      centrePoint.classList.add('hl-inactive');
      centreText.style.opacity = '0.2';
    }
  }

  document.querySelectorAll('.hl-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      playSound('click');
      document.querySelectorAll('.hl-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      const part = e.target.getAttribute('data-part');
      const info = highlightData[part];
      if (info) {
        info.activate();
        const explainBox = document.getElementById('tap-explanation');
        explainBox.innerHTML = `<h4>${info.title}</h4><p>${info.text}</p>`;
      }
    });
  });

  // Default initial state
  if (highlightData.centre) {
    highlightData.centre.activate();
  }

  /* ==========================================================================
     4. Mission 1: Feature 2 - Radius Slider & Live Calculation
     ========================================================================== */
  const radiusRange = document.getElementById('radius-range');
  const sliderRadiusVal = document.getElementById('slider-radius-val');
  const sliderCalcText = document.getElementById('slider-calc-text');
  const sliderReverseCalc = document.getElementById('slider-reverse-calc');

  const sliderCircleBg = document.getElementById('slider-circle-bg');
  const sliderRadiusLine = document.getElementById('slider-radius-line');
  const sliderDiameterLine = document.getElementById('slider-diameter-line');
  const sliderSvgRadiusLabel = document.getElementById('slider-svg-radius-label');
  const sliderSvgDiameterLabel = document.getElementById('slider-svg-diameter-label');

  function updateRadiusSlider() {
    const r = parseFloat(radiusRange.value);
    const d = r * 2;

    sliderRadiusVal.textContent = r;
    sliderCalcText.innerHTML = `Diameter = 2 × ${r} cm = <strong>${d} cm</strong>`;
    sliderReverseCalc.innerHTML = `Radius = ${d} cm ÷ 2 = <strong>${r} cm</strong>`;

    // Map radius (1 to 10 cm) to SVG circle radius (20 to 110 px)
    const svgRadius = 20 + (r - 1) * 10;
    const cx = 160;
    const cy = 160;

    sliderCircleBg.setAttribute('r', svgRadius);

    // Update lines
    sliderRadiusLine.setAttribute('x1', cx);
    sliderRadiusLine.setAttribute('y1', cy);
    sliderRadiusLine.setAttribute('x2', cx + svgRadius);
    sliderRadiusLine.setAttribute('y2', cy);

    sliderDiameterLine.setAttribute('x1', cx - svgRadius);
    sliderDiameterLine.setAttribute('y1', cy);
    sliderDiameterLine.setAttribute('x2', cx + svgRadius);
    sliderDiameterLine.setAttribute('y2', cy);

    // Update labels in SVG
    sliderSvgRadiusLabel.setAttribute('x', cx + svgRadius / 2);
    sliderSvgRadiusLabel.setAttribute('y', cy - 10);
    sliderSvgRadiusLabel.textContent = `r = ${r} cm`;

    sliderSvgDiameterLabel.setAttribute('x', cx);
    sliderSvgDiameterLabel.setAttribute('y', cy + 25);
    sliderSvgDiameterLabel.textContent = `d = ${d} cm`;
  }

  radiusRange.addEventListener('input', updateRadiusSlider);
  updateRadiusSlider(); // Initial draw

  /* ==========================================================================
     5. Mission 1: Feature 3 - Redesigned Drag & Drop Activity Logic
     ========================================================================== */
  const draggableItems = document.querySelectorAll('.draggable-item');
  const dropBoxes = document.querySelectorAll('.drop-target-box');
  const dragHintBanner = document.getElementById('drag-hint-banner');
  const resetDragBtn = document.getElementById('reset-drag-btn');

  // Hints dictionary for incorrect drops
  const partHints = {
    radius: 'Hint: The radius is a line going from the centre dot to the outer edge of the circle.',
    diameter: 'Hint: The diameter is a straight line going all the way across the circle through the centre.',
    centre: 'Hint: The centre is the exact middle dot of the circle.'
  };

  const labelDisplayNames = {
    centre: '📍 Centre',
    radius: '📏 Radius',
    diameter: '↔️ Diameter'
  };

  // Drag start/end handlers for HTML5 drag and drop
  draggableItems.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', item.getAttribute('data-type'));
      e.dataTransfer.setData('source-id', item.id);
      item.classList.add('dragging');
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
    });

    // Touch / Tap fallback selection for mobile/tablets
    item.addEventListener('click', () => {
      if (item.classList.contains('used')) return;
      playSound('click');
      draggableItems.forEach(i => i.classList.remove('selected'));

      if (gameState.dragSelectedTag === item) {
        gameState.dragSelectedTag = null;
      } else {
        item.classList.add('selected');
        gameState.dragSelectedTag = item;
      }
    });
  });

  dropBoxes.forEach(box => {
    box.addEventListener('dragover', (e) => {
      e.preventDefault();
      box.classList.add('hover');
    });

    box.addEventListener('dragleave', () => {
      box.classList.remove('hover');
    });

    box.addEventListener('drop', (e) => {
      e.preventDefault();
      box.classList.remove('hover');
      const droppedType = e.dataTransfer.getData('text/plain');
      const sourceId = e.dataTransfer.getData('source-id');
      const sourceElement = document.getElementById(sourceId) || document.querySelector(`.draggable-item[data-type="${droppedType}"]`);

      handleLabelDrop(box, droppedType, sourceElement);
    });

    // Click handler for tap-to-select fallback
    box.addEventListener('click', () => {
      if (box.classList.contains('correct')) return; // Already filled correctly

      if (gameState.dragSelectedTag) {
        const droppedType = gameState.dragSelectedTag.getAttribute('data-type');
        const sourceElement = gameState.dragSelectedTag;

        handleLabelDrop(box, droppedType, sourceElement);

        sourceElement.classList.remove('selected');
        gameState.dragSelectedTag = null;
      }
    });
  });

  function handleLabelDrop(box, droppedType, sourceElement) {
    const targetType = box.getAttribute('data-target');

    if (droppedType === targetType) {
      // Correct drop!
      playSound('correct');
      box.classList.add('correct');
      box.innerHTML = `<span>✓ ${labelDisplayNames[droppedType]}</span>`;

      if (sourceElement) {
        sourceElement.classList.add('used');
      }

      gameState.dragCorrectCount++;

      dragHintBanner.hidden = false;
      dragHintBanner.className = 'hint-banner success';
      dragHintBanner.textContent = `Great job! You identified the ${droppedType.charAt(0).toUpperCase() + droppedType.slice(1)} correctly! 🎉`;

      // Check if all 3 parts are completed
      if (gameState.dragCorrectCount === 3) {
        addStars(3);
        dragHintBanner.textContent = '🎉 Well done! You labeled all parts of the circle correctly! (+3 Stars)';
        resetDragBtn.hidden = false;
      }
    } else {
      // Incorrect drop!
      playSound('wrong');

      if (sourceElement) {
        sourceElement.classList.add('shake');
        setTimeout(() => sourceElement.classList.remove('shake'), 400);
      }

      dragHintBanner.hidden = false;
      dragHintBanner.className = 'hint-banner info';
      dragHintBanner.textContent = partHints[droppedType] || 'Not quite! Try matching the label to a different part.';
    }
  }

  // Reset / Play Again activity handler
  resetDragBtn.addEventListener('click', () => {
    playSound('click');
    gameState.dragCorrectCount = 0;
    gameState.dragSelectedTag = null;

    dropBoxes.forEach(box => {
      box.classList.remove('correct', 'hover');
      box.innerHTML = `<span class="box-placeholder">Drop Here</span>`;
    });

    draggableItems.forEach(item => {
      item.classList.remove('used', 'selected', 'shake');
    });

    dragHintBanner.hidden = true;
    resetDragBtn.hidden = true;
  });

  /* ==========================================================================
     6. Mission 2: Quiz Arena Logic
     ========================================================================== */
  const quizQuestions = [
    {
      question: 'What is the exact middle point of a circle called?',
      options: ['Circumference', 'Centre', 'Radius', 'Diameter'],
      answer: 1,
      explanation: 'The <strong>centre</strong> is the middle point of a circle.'
    },
    {
      question: 'If the radius of a circle is 6 cm, what is its diameter?',
      options: ['3 cm', '6 cm', '12 cm', '18 cm'],
      answer: 2,
      explanation: 'Diameter = 2 × Radius = 2 × 6 cm = <strong>12 cm</strong>.'
    },
    {
      question: 'The diameter of a circle is 20 cm. What is its radius?',
      options: ['10 cm', '20 cm', '40 cm', '5 cm'],
      answer: 0,
      explanation: 'Radius = Diameter ÷ 2 = 20 cm ÷ 2 = <strong>10 cm</strong>.'
    },
    {
      question: 'A straight line passing through the centre from one side of a circle to the other is the...',
      options: ['Radius', 'Diameter', 'Circumference', 'Corner'],
      answer: 1,
      explanation: 'The <strong>diameter</strong> passes through the centre from edge to edge.'
    },
    {
      question: 'A bicycle wheel has a radius of 15 cm. What is the length of its diameter?',
      options: ['7.5 cm', '15 cm', '30 cm', '60 cm'],
      answer: 2,
      explanation: 'Diameter = 2 × Radius = 2 × 15 cm = <strong>30 cm</strong>.'
    }
  ];

  function renderQuizQuestion() {
    const q = quizQuestions[gameState.quizCurrentIndex];
    document.getElementById('quiz-progress').textContent = `Question ${gameState.quizCurrentIndex + 1} of ${quizQuestions.length}`;
    document.getElementById('quiz-streak').textContent = `Streak: 🔥 ${gameState.quizStreak}`;
    document.getElementById('quiz-question-text').textContent = q.question;

    const optionsGrid = document.getElementById('quiz-options');
    optionsGrid.innerHTML = '';

    q.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'opt-btn';
      btn.textContent = `${String.fromCharCode(65 + index)}. ${optText}`;
      btn.addEventListener('click', () => handleQuizAnswer(index, btn));
      optionsGrid.appendChild(btn);
    });

    document.getElementById('quiz-explanation-box').hidden = true;
  }

  function handleQuizAnswer(selectedIndex, btnElement) {
    const q = quizQuestions[gameState.quizCurrentIndex];
    const allOptBtns = document.querySelectorAll('.opt-btn');
    allOptBtns.forEach(b => b.disabled = true);

    const explainBox = document.getElementById('quiz-explanation-box');
    const explainTitle = document.getElementById('quiz-explain-title');
    const explainBody = document.getElementById('quiz-explain-body');

    if (selectedIndex === q.answer) {
      playSound('correct');
      btnElement.classList.add('correct-opt');
      gameState.quizScore++;
      gameState.quizStreak++;
      addStars(1);
      explainTitle.textContent = '🎉 Correct!';
      explainTitle.style.color = '#15803D';
    } else {
      playSound('wrong');
      btnElement.classList.add('wrong-opt');
      allOptBtns[q.answer].classList.add('correct-opt');
      gameState.quizStreak = 0;
      explainTitle.textContent = '❌ Incorrect';
      explainTitle.style.color = '#B91C1C';
    }

    explainBody.innerHTML = q.explanation;
    explainBox.hidden = false;
  }

  document.getElementById('quiz-next-btn').addEventListener('click', () => {
    playSound('click');
    gameState.quizCurrentIndex++;
    if (gameState.quizCurrentIndex < quizQuestions.length) {
      renderQuizQuestion();
    } else {
      showQuizResults();
    }
  });

  function showQuizResults() {
    document.getElementById('quiz-active-card').hidden = true;
    const resultCard = document.getElementById('quiz-result-card');
    resultCard.hidden = false;

    document.getElementById('quiz-result-score').textContent = `You scored ${gameState.quizScore} out of ${quizQuestions.length}!`;
    const starsContainer = document.getElementById('quiz-stars-earned');
    starsContainer.textContent = '⭐'.repeat(gameState.quizScore) || '🪙 Keep practicing!';
  }

  document.getElementById('restart-quiz-btn').addEventListener('click', () => {
    playSound('click');
    gameState.quizCurrentIndex = 0;
    gameState.quizScore = 0;
    gameState.quizStreak = 0;
    document.getElementById('quiz-result-card').hidden = true;
    document.getElementById('quiz-active-card').hidden = false;
    renderQuizQuestion();
  });

  renderQuizQuestion();

  /* ==========================================================================
     7. Mission 3: Real-Life Mission Showcase
     ========================================================================== */
  const realObjects = {
    clock: {
      title: '⏰ Classroom Wall Clock',
      desc: 'A standard round wall clock in Malaysian schools. Its hands rotate around the centre point!',
      radius: 12,
      diameter: 24,
      challengeText: 'If the radius of this clock is 12 cm, what is its diameter in cm?',
      correctAns: 24,
      drawSVG: (svg) => {
        svg.innerHTML = `
          <circle cx="140" cy="140" r="110" fill="#FFFFFF" stroke="#334155" stroke-width="10"/>
          <circle cx="140" cy="140" r="100" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
          <circle cx="140" cy="140" r="8" fill="#F59E0B"/>
          <!-- Clock Hands -->
          <line x1="140" y1="140" x2="140" y2="70" stroke="#1E293B" stroke-width="6" stroke-linecap="round"/>
          <line x1="140" y1="140" x2="190" y2="140" stroke="#3B82F6" stroke-width="5" stroke-linecap="round"/>
          <!-- Radius line indicator -->
          <line x1="140" y1="140" x2="240" y2="140" stroke="#EC4899" stroke-width="3" stroke-dasharray="4"/>
          <text x="190" y="130" font-family="Fredoka" font-size="14" fill="#DB2777" font-weight="bold">r = 12 cm</text>
        `;
      }
    },
    bicycle: {
      title: '🚲 Bicycle Wheel',
      desc: 'The spokes connect the central hub (centre) to the outer rim (circumference). Every spoke is a radius!',
      radius: 30,
      diameter: 60,
      challengeText: 'If the diameter of this wheel is 60 cm, what is its radius in cm?',
      correctAns: 30,
      drawSVG: (svg) => {
        svg.innerHTML = `
          <circle cx="140" cy="140" r="110" fill="none" stroke="#1E293B" stroke-width="12"/>
          <circle cx="140" cy="140" r="18" fill="#64748B"/>
          <circle cx="140" cy="140" r="8" fill="#F59E0B"/>
          <!-- Spokes -->
          ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => {
            const rad = angle * Math.PI / 180;
            const x2 = 140 + 110 * Math.cos(rad);
            const y2 = 140 + 110 * Math.sin(rad);
            return `<line x1="140" y1="140" x2="${x2}" y2="${y2}" stroke="#94A3B8" stroke-width="2"/>`;
          }).join('')}
          <text x="140" y="270" font-family="Fredoka" font-size="14" fill="#2563EB" text-anchor="middle" font-weight="bold">d = 60 cm</text>
        `;
      }
    },
    coin: {
      title: '🪙 50-Sen Coin',
      desc: 'A 50-sen coin is circular. Knowing its diameter helps vending machines identify coins!',
      radius: 1.1,
      diameter: 2.2,
      challengeText: 'If the radius of a 50-sen coin is 1.1 cm, what is its diameter in cm?',
      correctAns: 2.2,
      drawSVG: (svg) => {
        svg.innerHTML = `
          <circle cx="140" cy="140" r="100" fill="#FBBF24" stroke="#D97706" stroke-width="8"/>
          <circle cx="140" cy="140" r="88" fill="none" stroke="#F59E0B" stroke-width="3" stroke-dasharray="6,4"/>
          <text x="140" y="130" font-family="Fredoka" font-size="28" fill="#92400E" text-anchor="middle" font-weight="bold">50</text>
          <text x="140" y="160" font-family="Fredoka" font-size="18" fill="#92400E" text-anchor="middle" font-weight="bold">SEN</text>
          <circle cx="140" cy="140" r="6" fill="#78350F"/>
        `;
      }
    },
    roti: {
      title: '🫓 Fresh Roti Canai',
      desc: 'When the chef spins the dough, it stretches outwards from the centre into a circular shape!',
      radius: 14,
      diameter: 28,
      challengeText: 'If a roti canai has a diameter of 28 cm, what is its radius in cm?',
      correctAns: 14,
      drawSVG: (svg) => {
        svg.innerHTML = `
          <circle cx="140" cy="140" r="105" fill="#FEF08A" stroke="#EAB308" stroke-width="6"/>
          <!-- Flaky roti texture spots -->
          <circle cx="110" cy="110" r="20" fill="#CA8A04" opacity="0.3"/>
          <circle cx="170" cy="150" r="25" fill="#CA8A04" opacity="0.35"/>
          <circle cx="130" cy="180" r="18" fill="#CA8A04" opacity="0.25"/>
          <circle cx="140" cy="140" r="6" fill="#B45309"/>
        `;
      }
    }
  };

  function renderRealObject(key) {
    const obj = realObjects[key];
    if (!obj) return;

    document.getElementById('object-title').textContent = obj.title;
    document.getElementById('object-description').textContent = obj.desc;
    document.getElementById('object-radius-val').textContent = `${obj.radius} cm`;
    document.getElementById('object-diameter-val').textContent = `${obj.diameter} cm`;
    document.getElementById('object-challenge-text').textContent = obj.challengeText;

    const svg = document.getElementById('real-object-svg');
    obj.drawSVG(svg);

    document.getElementById('challenge-input').value = '';
    document.getElementById('challenge-feedback').textContent = '';
  }

  document.querySelectorAll('.obj-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      playSound('click');
      document.querySelectorAll('.obj-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      const key = e.target.getAttribute('data-obj');
      gameState.currentRealObject = key;
      renderRealObject(key);
    });
  });

  document.getElementById('challenge-check-btn').addEventListener('click', () => {
    const inputVal = parseFloat(document.getElementById('challenge-input').value);
    const obj = realObjects[gameState.currentRealObject];
    const feedbackEl = document.getElementById('challenge-feedback');

    if (isNaN(inputVal)) {
      playSound('wrong');
      feedbackEl.style.color = '#B91C1C';
      feedbackEl.textContent = 'Please type a number!';
    } else if (Math.abs(inputVal - obj.correctAns) < 0.01) {
      playSound('correct');
      addStars(2);
      feedbackEl.style.color = '#15803D';
      feedbackEl.textContent = `🎉 Correct! The answer is ${obj.correctAns} cm. (+2 Stars)`;
    } else {
      playSound('wrong');
      feedbackEl.style.color = '#B91C1C';
      feedbackEl.textContent = `Not quite. Remember: Diameter = 2 × Radius, Radius = Diameter ÷ 2. Try again!`;
    }
  });

  renderRealObject('clock');
});
