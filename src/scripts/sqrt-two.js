// Imported learning interactions; see documentation/MATHE_IMPORT.md.

    (() => {
      'use strict';
      // Näherungen werden als Strings gespeichert, damit Dezimalkomma und Ergebnisse exakt lesbar bleiben.
      const approximations = [
        {x:'1,4', square:'1,96', difference:'0,04', width:100},
        {x:'1,41', square:'1,9881', difference:'0,0119', width:30},
        {x:'1,414', square:'1,999396', difference:'0,000604', width:5},
        {x:'1,4142', square:'1,99996164', difference:'0,00003836', width:1.6}
      ];
      const approxButtons = [...document.querySelectorAll('[data-approx]')];
      const approxEquation = document.getElementById('approx-equation');
      const approxDiff = document.getElementById('approx-diff');
      const approxBar = document.getElementById('approx-bar');
      approxButtons.forEach(button => button.addEventListener('click', () => {
        const index = Number(button.dataset.approx);
        const item = approximations[index];
        if (!item) return;
        approxButtons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
        approxEquation.textContent = item.x + '² = ' + item.square;
        approxDiff.textContent = item.difference;
        approxBar.style.width = item.width + '%';
      }));
      // Geradheit: kleine Fläche mit n × n Quadraten zeichnen.
      const numberButtons = [...document.querySelectorAll('[data-number]')];
      const parityEquation = document.getElementById('parity-equation');
      const parityTag = document.getElementById('parity-tag');
      const parityText = document.getElementById('parity-text');
      const squareGrid = document.getElementById('square-grid');
      function updateParity(n) {
        if (!Number.isInteger(n) || n < 2 || n > 7) return;
        const even = n % 2 === 0;
        numberButtons.forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.number) === n)));
        parityEquation.textContent = `${n} × ${n} = ${n * n}`;
        parityTag.textContent = `${even ? 'gerade → gerade' : 'ungerade → ungerade'}`;
        parityTag.classList.toggle('odd', !even);
        parityText.textContent = `${n} ist ${even ? 'gerade' : 'ungerade'}. Auch ${n}² = ${n*n} ist ${even ? 'gerade' : 'ungerade'}. ${!even ? 'Das letzte orange Kästchen bleibt übrig, wenn man alle Kästchen paarweise zählt.' : 'Alle Kästchen lassen sich paarweise zählen.'}`;
        squareGrid.style.setProperty('--n', String(n));
        squareGrid.replaceChildren();
        const fragment = document.createDocumentFragment();
        for (let i=0; i<n*n; i++) {
          const cell = document.createElement('span');
          cell.className = 'square-cell' + (!even && i === n*n-1 ? ' leftover' : '');
          fragment.appendChild(cell);
        }
        squareGrid.appendChild(fragment);
      }
      numberButtons.forEach(b => b.addEventListener('click', () => updateParity(Number(b.dataset.number))));
      updateParity(5);
      // Navigator: der Beweis bleibt vollständig lesbar, nur der aktuelle Schritt wird hervorgehoben.
      const steps = [...document.querySelectorAll('.proof-step')];
      const navButtons = [...document.querySelectorAll('[data-go]')];
      const prev = document.getElementById('prev-step');
      const next = document.getElementById('next-step');
      let currentStep = 1;
      function setStep(n, scroll=true) {
        currentStep = Math.min(7,Math.max(1,n));
        steps.forEach(step => step.classList.toggle('is-current',Number(step.dataset.step) === currentStep));
        navButtons.forEach(b => {
          if (Number(b.dataset.go) === currentStep) b.setAttribute('aria-current','step');
          else b.removeAttribute('aria-current');
        });
        prev.disabled = currentStep === 1;
        next.disabled = currentStep === 7;
        if (scroll) document.getElementById(`schritt-${currentStep}`).scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'});
      }
      navButtons.forEach(b => b.addEventListener('click', () => setStep(Number(b.dataset.go))));
      prev.addEventListener('click', () => setStep(currentStep-1));
      next.addEventListener('click', () => setStep(currentStep+1));
      // Selbstkontrolle: bei unbeantworteten Fragen keine falsche Antwort behaupten.
      const quiz = document.getElementById('quiz-form');
      const quizResult = document.getElementById('quiz-result');
      const answerInfo = [
        {ok:'Richtig! 6 und 8 lassen sich beide durch 2 teilen: 6/8 = 3/4.', no:'Nicht ganz. 6 und 8 sind gerade; man kann den Bruch durch 2 kürzen.'},
        {ok:'Genau! Ein gerades Quadrat kann nur von einer geraden ganzen Zahl stammen.', no:'Noch einmal überlegen: Das Quadrat einer ungeraden Zahl ist immer ungerade.'},
        {ok:'Genau! Ein gekürzter Bruch könnte nicht gleichzeitig oben und unten gerade sein.', no:'Das ist nicht der Grund. Der Widerspruch entsteht, weil Zähler und Nenner beide gerade wären.'}
      ];
      quiz.addEventListener('submit', event => {
        event.preventDefault();
        const questions = [...quiz.querySelectorAll('.question')];
        let score = 0, missing = 0;
        questions.forEach((question,i) => {
          const chosen = question.querySelector('input:checked');
          const feedback = question.querySelector('.answer-feedback');
          if (!chosen) {
            missing++;
            feedback.textContent = 'Bitte wähle hier noch eine Antwort.';
            feedback.dataset.result = 'wrong';
          } else {
            const correct = chosen.value === question.dataset.correct;
            if (correct) score++;
            feedback.textContent = correct ? '✓ ' + answerInfo[i].ok : '↻ ' + answerInfo[i].no;
            feedback.dataset.result = correct ? 'correct' : 'wrong';
          }
        });
        quizResult.textContent = missing ? `${score} von 3 richtig · ${missing} Frage${missing === 1 ? '' : 'n'} noch offen.` : score === 3 ? '3 von 3 richtig – du hast es verstanden! 🎉' : `${score} von 3 richtig – schau dir die Erklärungen an.`;
      });
      quiz.addEventListener('change', e => {
        const question = e.target.closest('.question');
        if (!question) return;
        const feedback = question.querySelector('.answer-feedback');
        feedback.textContent = '';
        delete feedback.dataset.result;
        quizResult.textContent = '';
      });
      document.getElementById('quiz-reset').addEventListener('click', () => {
        quiz.reset();
        quiz.querySelectorAll('.answer-feedback').forEach(feedback => {feedback.textContent=''; delete feedback.dataset.result;});
        quizResult.textContent='';
      });
      document.getElementById('print-button').addEventListener('click', () => window.print());
      document.querySelectorAll('.sqrt2-page [data-requires-js]').forEach(control => { control.disabled = false; });
      setStep(1, false);
    })();
