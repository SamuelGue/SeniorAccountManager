(() => {
  const room = document.getElementById('client-room');
  if (!room) return;

  const screens = Array.from(room.querySelectorAll('[data-room-screen]'));
  const screenOrder = screens.map((screen) => screen.dataset.roomScreen);
  const progress = document.getElementById('client-room-progress');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const history = [];
  let currentScreen = 'opening';

  const aReplies = {
    top: 'ANUSHKA: Yeah, I could see that. Before I pick a direction though, can I have a look at who is actually driving customers?',
    audiences: 'ANUSHKA: Could be. I would want to see whether those new audiences bring in the right customers first.',
    content: 'ANUSHKA: Yeah, that might be worth a look. I want to see which posts are already bringing people in.',
  };

  const cReplies = {
    performance: 'ANUSHKA: I might be completely wrong. I just want to look at the numbers before I call it a creative problem.',
    content: 'ANUSHKA: I keep noticing that some of the stories feel much more specific than others. But yeah, I would still want to check the numbers before I decide that is actually the problem.',
  };

  const journeyDetails = {
    creator: 'Who are they? What do they already talk about?',
    audience: 'Why do people actually follow them?',
    problem: 'What is someone trying to sort out with their skin?',
    story: 'What is the creator showing, not just saying?',
    detail: 'What makes someone think, “Oh my god, I do that too?”',
    action: 'Does that eventually help someone start a consultation?',
  };

  function showScreen(name, remember = true) {
    const nextScreen = screens.find((screen) => screen.dataset.roomScreen === name);
    if (!nextScreen || name === currentScreen) return;

    if (remember) history.push(currentScreen);
    screens.forEach((screen) => {
      screen.hidden = screen !== nextScreen;
    });
    currentScreen = name;
    const step = screenOrder.indexOf(name) + 1;
    if (progress) progress.textContent = `${String(step).padStart(2, '0')} / ${screenOrder.length}`;

    room.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
    window.requestAnimationFrame(() => {
      nextScreen.querySelector('h3[tabindex="-1"]')?.focus({ preventScroll: true });
    });
  }

  room.querySelectorAll('[data-room-path]').forEach((button) => {
    button.addEventListener('click', () => {
      room.querySelectorAll('[data-room-path]').forEach((choice) => {
        choice.setAttribute('aria-pressed', String(choice === button));
      });
      room.querySelectorAll('[data-room-branch]').forEach((branch) => {
        branch.hidden = branch.dataset.roomBranch !== button.dataset.roomPath;
      });
    });
  });

  room.querySelectorAll('[data-room-a-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      const reply = document.getElementById('room-a-reply');
      const next = document.getElementById('room-a-next');
      if (reply) {
        reply.textContent = aReplies[button.dataset.roomAAnswer];
        reply.hidden = false;
      }
      if (next) next.hidden = false;
      room.querySelectorAll('[data-room-a-answer]').forEach((choice) => {
        choice.setAttribute('aria-pressed', String(choice === button));
      });
    });
  });

  room.querySelectorAll('[data-room-c-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      const reply = document.getElementById('room-c-reply');
      const next = document.getElementById('room-c-next');
      if (reply) {
        reply.textContent = cReplies[button.dataset.roomCAnswer];
        reply.hidden = false;
      }
      if (next) next.hidden = false;
      room.querySelectorAll('[data-room-c-answer]').forEach((choice) => {
        choice.setAttribute('aria-pressed', String(choice === button));
      });
    });
  });

  room.querySelectorAll('[data-room-go]').forEach((button) => {
    button.addEventListener('click', () => showScreen(button.dataset.roomGo));
  });

  room.querySelectorAll('[data-room-back]').forEach((button) => {
    button.addEventListener('click', () => {
      const previous = history.pop();
      if (previous) showScreen(previous, false);
    });
  });

  room.querySelectorAll('[data-room-journey]').forEach((button) => {
    button.addEventListener('click', () => {
      room.querySelectorAll('[data-room-journey]').forEach((step) => {
        const selected = step === button;
        step.classList.toggle('is-selected', selected);
        step.setAttribute('aria-pressed', String(selected));
      });
      const detail = document.getElementById('room-journey-detail');
      if (detail) detail.textContent = journeyDetails[button.dataset.roomJourney];
    });
  });
})();