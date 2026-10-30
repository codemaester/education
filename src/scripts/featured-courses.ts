const ROTATION_INTERVAL = 8_000;

/** Each carousel owns its state; interaction never moves keyboard focus. */
export function initFeaturedCourses(root: HTMLElement) {
  const slides = [...root.querySelectorAll<HTMLElement>('[data-slide]')];
  if (slides.length < 2) return;

  const controls = root.querySelector<HTMLElement>('[data-carousel-controls]')!;
  const rotation = root.querySelector<HTMLButtonElement>('[data-rotation]')!;
  const rotationLabel = root.querySelector<HTMLElement>('[data-rotation-label]')!;
  const pauseIcon = root.querySelector<HTMLElement>('[data-pause-icon]')!;
  const playIcon = root.querySelector<HTMLElement>('[data-play-icon]')!;
  const counter = root.querySelector<HTMLElement>('[data-counter]')!;
  const announcement = root.querySelector<HTMLElement>('[data-carousel-announcement]')!;
  const choices = [...root.querySelectorAll<HTMLButtonElement>('[data-slide-choice]')];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let enabled = !motion.matches && !root.contains(document.activeElement);
  let hovered = root.matches(':hover');
  let visible = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pointerRotationIntent: boolean | undefined;

  function schedule() {
    clearTimeout(timer);
    timer = undefined;
    rotationLabel.textContent = enabled ? 'Pause' : 'Start';
    pauseIcon.hidden = !enabled;
    playIcon.hidden = enabled;
    if (enabled && !hovered && visible && !document.hidden) {
      timer = setTimeout(() => { show(index + 1, false); schedule(); }, ROTATION_INTERVAL);
    }
  }

  function stop() { enabled = false; schedule(); }

  function show(next: number, manual: boolean) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, position) => {
      const active = position === index;
      slide.toggleAttribute('data-active', active);
      slide.inert = !active;
      if (active) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
    });
    choices.forEach((choice, position) => {
      if (position === index) choice.setAttribute('aria-disabled', 'true');
      else choice.removeAttribute('aria-disabled');
    });
    counter.textContent = `${index + 1} von ${slides.length}`;
    if (manual) announcement.textContent = `${counter.textContent}: ${slides[index].dataset.title}`;
  }

  root.querySelector('[data-previous]')!.addEventListener('click', () => { stop(); show(index - 1, true); });
  root.querySelector('[data-next]')!.addEventListener('click', () => { stop(); show(index + 1, true); });
  choices.forEach((choice, position) => choice.addEventListener('click', () => { stop(); show(position, true); }));
  // Remember pointer intent before focusin changes Pause into Start.
  rotation.addEventListener('pointerdown', () => { pointerRotationIntent = !enabled; });
  rotation.addEventListener('pointercancel', () => { pointerRotationIntent = undefined; });
  rotation.addEventListener('click', event => {
    enabled = event.detail > 0 ? (pointerRotationIntent ?? !enabled) : !enabled;
    pointerRotationIntent = undefined;
    schedule();
  });
  // focusin and touch stop until an explicit Start, even after focus leaves.
  root.addEventListener('focusin', stop);
  root.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') stop(); });
  root.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  root.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => { if (motion.matches) stop(); });
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); });
  observer.observe(root);
  // Clear pending timers when leaving a page, including the back-forward cache.
  window.addEventListener('pagehide', () => { visible = false; schedule(); });
  window.addEventListener('pageshow', () => { observer.unobserve(root); observer.observe(root); });
  controls.hidden = false;
  schedule();
}
