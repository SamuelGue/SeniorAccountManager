(() => {
  const opening = document.getElementById('opening');
  const lab = document.querySelector('.lab-shell');
  const cakeScreen = document.getElementById('cake-screen');
  const brainScreen = document.getElementById('brain-screen');
  const cakeStage = document.getElementById('cake-stage');
  const knife = document.getElementById('cake-knife');
  const reveal = document.getElementById('cake-reveal');
  const instruction = document.getElementById('cake-instruction');
  const cakeHint = document.querySelector('.cake-hint');
  const skip = document.getElementById('opening-skip');
  const edition = document.querySelector('.opening-edition b');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!opening || !lab || !cakeScreen || !brainScreen || !cakeStage || !knife) return;

  opening.hidden = false;
  document.body.classList.add('has-opening');
  lab.inert = true;
  lab.setAttribute('aria-hidden', 'true');

  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let dragged = false;
  let cut = false;
  let suppressClick = false;

  function showBrain() {
    cakeScreen.hidden = true;
    brainScreen.hidden = false;
    brainScreen.classList.add('is-revealing');
    opening.classList.add('is-brain');
    if (skip) skip.childNodes[0].textContent = 'SKIP INTRO ';
    if (edition) edition.textContent = '02 / 02';
    const heading = document.getElementById('brain-copy-title');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }

  function scatterCrumbs() {
    const colors = ['#f2d775', '#ed907e', '#d9c9e9', '#b8d7c9'];
    for (let index = 0; index < 22; index += 1) {
      const crumb = document.createElement('i');
      const angle = (Math.PI * 2 * index) / 22 + Math.random() * .35;
      const distance = 25 + Math.random() * 115;
      crumb.className = 'cake-crumb';
      crumb.setAttribute('aria-hidden', 'true');
      crumb.style.left = `${50 + (Math.random() * 8 - 4)}%`;
      crumb.style.top = `${52 + (Math.random() * 8 - 4)}%`;
      crumb.style.setProperty('--crumb-x', `${Math.cos(angle) * distance}px`);
      crumb.style.setProperty('--crumb-y', `${Math.sin(angle) * distance}px`);
      crumb.style.setProperty('--crumb-turn', `${Math.random() * 240 - 120}deg`);
      crumb.style.setProperty('--crumb-size', `${4 + Math.random() * 6}px`);
      crumb.style.setProperty('--crumb-color', colors[index % colors.length]);
      cakeStage.append(crumb);
      window.setTimeout(() => crumb.remove(), 900);
    }
  }

  function cutCake() {
    if (cut) return;
    cut = true;
    cakeStage.classList.add('is-cut');
    if (reveal) {
      reveal.hidden = false;
      reveal.setAttribute('aria-live', 'polite');
    }
    if (instruction) instruction.hidden = true;
    if (cakeHint) cakeHint.hidden = true;
    if (!reducedMotion) scatterCrumbs();
    knife.disabled = true;
  }

  knife.addEventListener('pointerdown', (event) => {
    if (cut || (event.button !== undefined && event.button !== 0)) return;
    const bounds = cakeStage.getBoundingClientRect();
    pointerId = event.pointerId;
    startX = event.clientX - bounds.left;
    startY = event.clientY - bounds.top;
    dragged = false;
    knife.classList.add('is-dragging');
    knife.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  knife.addEventListener('pointermove', (event) => {
    if (pointerId !== event.pointerId || cut) return;
    const bounds = cakeStage.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const distance = Math.hypot(x - startX, y - startY);
    if (distance > 12) dragged = true;
    knife.style.left = `${x}px`;
    knife.style.top = `${y}px`;
    knife.style.transform = 'translate(-50%, -50%) rotate(-4deg)';
    const inCutBand = Math.abs(y - bounds.height * .54) < bounds.height * .25;
    if (dragged && startX < bounds.width * .32 && x > bounds.width * .68 && inCutBand) cutCake();
  });

  knife.addEventListener('pointerup', (event) => {
    if (pointerId !== event.pointerId) return;
    pointerId = null;
    knife.classList.remove('is-dragging');
    if (dragged) {
      suppressClick = true;
      window.setTimeout(() => { suppressClick = false; }, 0);
    } else if (!cut) {
      knife.style.removeProperty('left');
      knife.style.removeProperty('top');
      knife.style.removeProperty('transform');
    }
  });

  knife.addEventListener('pointercancel', () => {
    pointerId = null;
    knife.classList.remove('is-dragging');
  });

  knife.addEventListener('click', (event) => {
    if (suppressClick && event.detail !== 0) {
      event.preventDefault();
      return;
    }
    cutCake();
  });

  const skipToNext = () => {
    if (brainScreen.hidden) showBrain();
    else enterLab(false);
  };

  if (skip) skip.addEventListener('click', skipToNext);
  document.getElementById('open-brain')?.addEventListener('click', showBrain);
  document.getElementById('open-account')?.addEventListener('click', () => enterLab(true));

  function animateIdeasIntoNavigation() {
    if (reducedMotion) return;
    const flights = [
      ['.token-creators', '[data-testid="nav-creator"]'],
      ['.token-story', '[data-testid="nav-story"]'],
      ['.token-test', '[data-testid="nav-experiments"]'],
      ['.calculator', '[data-testid="nav-simulator"]'],
      ['.token-why', '[data-testid="nav-diagnosis"]'],
    ];
    const isMobile = window.matchMedia('(max-width: 760px)').matches;
    const mobileTarget = document.querySelector('[data-testid="navigation-open-button"]');

    flights.forEach(([sourceSelector, targetSelector], index) => {
      const source = document.querySelector(sourceSelector);
      const target = isMobile ? mobileTarget : document.querySelector(targetSelector);
      if (!source || !target) return;
      const from = source.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const thought = document.createElement('span');
      thought.className = 'flight-thought';
      thought.textContent = source.textContent.trim();
      thought.style.left = `${from.left}px`;
      thought.style.top = `${from.top}px`;
      document.body.append(thought);
      thought.animate([
        { left: `${from.left}px`, top: `${from.top}px`, opacity: 1, transform: 'scale(1)' },
        { left: `${to.left + to.width / 2}px`, top: `${to.top + to.height / 2}px`, opacity: 0, transform: 'scale(.35)' },
      ], {
        duration: 780,
        delay: index * 80,
        easing: 'cubic-bezier(.2,.75,.25,1)',
        fill: 'forwards',
      }).finished.finally(() => thought.remove());
    });
  }

  function enterLab(withIdeas) {
    if (opening.classList.contains('is-entering')) return;
    if (withIdeas) animateIdeasIntoNavigation();
    opening.classList.add('is-entering');
    window.setTimeout(() => {
      opening.hidden = true;
      document.body.classList.remove('has-opening');
      lab.inert = false;
      lab.removeAttribute('aria-hidden');
      window.scrollTo(0, 0);
      document.querySelector('[data-testid="nav-account"]')?.focus({ preventScroll: true });
    }, reducedMotion ? 0 : 920);
  }
})();

(() => {
  const form = document.getElementById('experiment-result-form');
  if (!form) return;

  const fields = Array.from(form.querySelectorAll('input[name]'));
  const status = document.getElementById('experiment-result-status');
  const storageKey = 'tano-growth-lab-experiment-results';

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    fields.forEach((field) => {
      if (Object.hasOwn(saved, field.name)) field.value = saved[field.name];
    });
  } catch {
    if (status) status.textContent = 'Results can be entered, but this browser blocks local storage.';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const results = Object.fromEntries(fields.map((field) => [field.name, field.value]));
    try {
      localStorage.setItem(storageKey, JSON.stringify(results));
      if (status) status.textContent = 'Saved on this device.';
    } catch {
      if (status) status.textContent = 'Could not save results in this browser.';
    }
  });
})();