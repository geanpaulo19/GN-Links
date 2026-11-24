(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const canMove = () => finePointer.matches && !reduceMotion.matches;

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ----------------------------------------------------------------------
     Copy email
     ---------------------------------------------------------------------- */
  const copyButton = document.querySelector('.copy');
  const status = document.getElementById('copy-status');

  const fallbackCopy = (text) => {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.top = '-1000px';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand('copy');
    helper.remove();
    if (!copied) throw new Error('Copy command failed');
  };

  if (copyButton) {
    const email = copyButton.dataset.email;
    const label = copyButton.querySelector('.copy__label');
    let resetTimer;

    copyButton.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
        } else {
          fallbackCopy(email);
        }

        window.clearTimeout(resetTimer);
        copyButton.classList.add('is-copied');
        if (label) label.textContent = 'Copied';
        if (status) status.textContent = 'Email address copied to clipboard.';

        resetTimer = window.setTimeout(() => {
          copyButton.classList.remove('is-copied');
          if (label) label.textContent = 'Copy';
          if (status) status.textContent = '';
        }, 2400);
      } catch (error) {
        if (status) status.textContent = `Could not copy automatically. The address is ${email}.`;
      }
    });
  }

  /* ----------------------------------------------------------------------
     Pointer warmth on the link panel, fine pointers only
     ---------------------------------------------------------------------- */
  const panel = document.querySelector('.panel');
  let panelFrame = 0;
  let panelX = 0;
  let panelY = 0;

  if (panel) {
    panel.addEventListener('pointerenter', () => {
      if (canMove()) panel.classList.add('is-live');
    });

    panel.addEventListener('pointermove', (event) => {
      if (!canMove()) return;

      const rect = panel.getBoundingClientRect();
      panelX = event.clientX - rect.left;
      panelY = event.clientY - rect.top;

      if (!panelFrame) {
        panelFrame = window.requestAnimationFrame(() => {
          panel.style.setProperty('--mx', `${panelX}px`);
          panel.style.setProperty('--my', `${panelY}px`);
          panelFrame = 0;
        });
      }
    }, { passive: true });

    panel.addEventListener('pointerleave', () => {
      panel.classList.remove('is-live');
    });
  }

  /* ----------------------------------------------------------------------
     Portrait parallax, a few pixels at most
     ---------------------------------------------------------------------- */
  const visual = document.querySelector('.visual');
  const portrait = document.querySelector('.portrait');
  let portraitFrame = 0;
  let shiftX = 0;
  let shiftY = 0;

  if (visual && portrait) {
    visual.addEventListener('pointermove', (event) => {
      if (!canMove()) return;

      const rect = visual.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      const relY = (event.clientY - rect.top) / rect.height - 0.5;

      shiftX = relX * -7;
      shiftY = relY * -5;

      if (!portraitFrame) {
        portraitFrame = window.requestAnimationFrame(() => {
          portrait.style.transform = `translate3d(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px, 0)`;
          portraitFrame = 0;
        });
      }
    }, { passive: true });

    visual.addEventListener('pointerleave', () => {
      cancelAnimationFrame(portraitFrame);
      portraitFrame = 0;
      portrait.style.transform = '';
    });
  }
})();
