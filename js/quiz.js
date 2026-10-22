window.Quiz = (() => {
  const seenQuestions = new Set();
  
  function hasQuestions(slug) {
    return window.QUESTION_BANK && window.QUESTION_BANK[slug] && window.QUESTION_BANK[slug].length > 0;
  }
  
  // End-of-lesson questions: those not already placed inline after a section
  const endQuestions = slug => (window.QUESTION_BANK?.[slug] || []).filter(q => !q.section && q.section !== 0);

  function hasEndQuestions(slug) {
    return endQuestions(slug).length > 0;
  }

  function getNextQuestion(slug) {
    const questions = endQuestions(slug);
    const available = questions.filter(q => !seenQuestions.has(q.id));
    if (available.length === 0) {
      questions.forEach(q => seenQuestions.delete(q.id));
      return questions[0];
    }
    return available[0];
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  function renderQuiz(slug) {
    if (!hasQuestions(slug)) return '';
    
    if (!hasEndQuestions(slug)) return '';
    const q = getNextQuestion(slug);
    seenQuestions.add(q.id);
    const allEnd = endQuestions(slug);
    const defaultTitle = q.type === 'numeric'
      ? 'Back-of-the-Envelope Napkin Math'
      : q.type === 'tradeoff'
        ? 'Staff Architecture Trade-Off Matrix'
        : 'Knowledge Check';
    const defaultDiff = q.type === 'numeric'
      ? 'capacity estimation'
      : q.type === 'tradeoff'
        ? 'trade-off decision'
        : 'recall';
    const promptText = q.prompt || q.question || '';
    
    return `
      <div class="exercise-box quiz-card" id="quiz-${q.id}" data-type="${q.type}" data-slug="${slug}">
        <div class="exercise-box__header">
          <div class="exercise-box__title">
            <span>${escapeHtml(q.title || defaultTitle)}</span>
          </div>
          <span class="exercise-box__difficulty">${escapeHtml(q.difficulty || defaultDiff)}</span>
        </div>
        ${q.scenario ? `<div class="exercise-box__scenario"><strong>Scenario:</strong> ${escapeHtml(q.scenario)}</div>` : ''}
        <div class="exercise-box__prompt"><strong>Problem:</strong> ${escapeHtml(promptText)}</div>
        ${q.hint ? `<div class="exercise-box__hint" style="margin-top: 8px; font-size: 0.85rem; color: var(--text-muted);"><strong>Formula / Hint:</strong> ${escapeHtml(q.hint)}</div>` : ''}
        
        <div class="quiz-options exercise-options" id="quiz-options-${q.id}" style="margin-top: 15px;">
          ${renderOptions(q)}
        </div>

        <div class="quiz-actions" style="margin-top: 15px; display: flex; gap: 10px; align-items: center;">
           <button class="btn btn--primary quiz-submit-btn" data-qid="${q.id}">Submit Answer</button>
           <button class="btn btn--secondary quiz-next-btn" data-slug="${slug}" style="${allEnd.length > 1 ? '' : 'display:none;'}">Next Drill (${allEnd.length} available) →</button>
        </div>

        <div class="exercise-feedback quiz-feedback" id="feedback-${q.id}" style="display: none;">
          <div class="feedback-msg"></div>
          <div class="feedback-exp" style="margin-top:6px;"><strong>Explanation:</strong> ${escapeHtml(q.explanation)}</div>
        </div>
      </div>
    `;
  }

  function renderOptions(q) {
    let html = '';
    if (q.type === 'mcq') {
       q.options.forEach((opt, idx) => {
         html += `
           <label class="exercise-option quiz-option-label" style="display: flex; gap: 10px; cursor: pointer;">
             <input type="radio" name="quiz-${q.id}" value="${idx}" />
             <span>${escapeHtml(opt)}</span>
           </label>
         `;
       });
    } else if (q.type === 'multi') {
       q.options.forEach((opt, idx) => {
         html += `
           <label class="exercise-option quiz-option-label" style="display: flex; gap: 10px; cursor: pointer;">
             <input type="checkbox" name="quiz-${q.id}" value="${idx}" />
             <span>${escapeHtml(opt)}</span>
           </label>
         `;
       });
    } else if (q.type === 'ordering') {
       html += `<ul class="quiz-ordering-list" style="list-style: none; padding: 0;">`;
       q.options.forEach((opt, idx) => {
         html += `
           <li class="exercise-option quiz-order-item" data-id="${idx}" style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 5px;">
             <span>${escapeHtml(opt)}</span>
             <div>
               <button class="btn btn--sm quiz-up-btn" data-idx="${idx}">↑</button>
               <button class="btn btn--sm quiz-down-btn" data-idx="${idx}">↓</button>
             </div>
           </li>
         `;
       });
       html += `</ul>`;
    } else if (q.type === 'numeric') {
       html += `
         <div style="display: flex; align-items: center; gap: 10px;">
           <input type="number" step="any" class="quiz-number-input" name="quiz-${q.id}" placeholder="Enter numeric estimate${q.unit ? ' (' + escapeHtml(q.unit) + ')' : ''}" style="padding: 9px 12px; width: 100%; max-width: 320px; box-sizing: border-box; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-family: var(--font-mono);" />
           ${q.unit ? `<span class="badge" style="font-family: var(--font-mono);">${escapeHtml(q.unit)}</span>` : ''}
         </div>
       `;
    } else if (q.type === 'tradeoff') {
       html += `
         <div style="margin-bottom: 12px;">
           <strong style="display:block; margin-bottom: 6px;">1. Select Architecture Decision:</strong>
           ${(q.options || []).map((opt, i) => `
             <label class="exercise-option quiz-option-label" style="display: flex; gap: 10px; cursor: pointer;">
               <input type="radio" name="quiz-tradeoff-opt-${q.id}" value="${i}" />
               <span>${escapeHtml(opt)}</span>
             </label>
           `).join('')}
         </div>
         <div>
           <strong style="display:block; margin-bottom: 6px;">2. Select Primary Engineering Justification:</strong>
           ${(q.reasons || []).map((rsn, j) => `
             <label class="exercise-option quiz-option-label" style="display: flex; gap: 10px; cursor: pointer;">
               <input type="radio" name="quiz-tradeoff-rsn-${q.id}" value="${j}" />
               <span>${escapeHtml(rsn)}</span>
             </label>
           `).join('')}
         </div>
       `;
    }
    return html;
  }
  
  document.addEventListener('click', (e) => {
     if (e.target.closest('.quiz-up-btn')) {
        const btn = e.target.closest('.quiz-up-btn');
        const li = btn.closest('li');
        if (li.previousElementSibling) {
           li.parentNode.insertBefore(li, li.previousElementSibling);
        }
     } else if (e.target.closest('.quiz-down-btn')) {
        const btn = e.target.closest('.quiz-down-btn');
        const li = btn.closest('li');
        if (li.nextElementSibling) {
           li.parentNode.insertBefore(li.nextElementSibling, li);
        }
     } else if (e.target.closest('.quiz-submit-btn')) {
        const btn = e.target.closest('.quiz-submit-btn');
        const card = btn.closest('.quiz-card');
        const qid = btn.dataset.qid;
        const type = card.dataset.type;
        const slug = card.dataset.slug;
        const q = window.QUESTION_BANK[slug].find(x => x.id === qid);
        
        let correct = false;
        if (type === 'mcq') {
           const checked = card.querySelector(`input[name="quiz-${qid}"]:checked`);
           if (checked && parseInt(checked.value) === q.answer) correct = true;
        } else if (type === 'multi') {
           const checked = Array.from(card.querySelectorAll(`input[name="quiz-${qid}"]:checked`)).map(el => parseInt(el.value));
           if (checked.length === q.answer.length && checked.every(v => q.answer.includes(v))) correct = true;
        } else if (type === 'ordering') {
           const currentOrder = Array.from(card.querySelectorAll('.quiz-order-item')).map(el => parseInt(el.dataset.id));
           if (JSON.stringify(currentOrder) === JSON.stringify(q.answer)) correct = true;
        } else if (type === 'numeric') {
           const val = parseFloat(card.querySelector('.quiz-number-input').value);
           if (!Number.isNaN(val)) {
             const tol = typeof q.tolerance === 'number' ? q.tolerance : 0.2;
             if (val === q.answer || Math.abs(val - q.answer) / Math.max(1, Math.abs(q.answer)) <= tol) {
               correct = true;
             }
           }
        } else if (type === 'tradeoff') {
           const opt = card.querySelector(`input[name="quiz-tradeoff-opt-${qid}"]:checked`);
           const rsn = card.querySelector(`input[name="quiz-tradeoff-rsn-${qid}"]:checked`);
           const expectedOpt = q.answer && typeof q.answer === 'object' ? q.answer.option : q.correctOption;
           const expectedRsn = q.answer && typeof q.answer === 'object' ? q.answer.reason : q.correctReason;
           if (opt && rsn && parseInt(opt.value) === expectedOpt && parseInt(rsn.value) === expectedRsn) {
             correct = true;
           }
        }
        
        card.querySelectorAll('input, button:not(.quiz-next-btn):not(.check-slider__next)').forEach(el => el.disabled = true);

        // Show which option was right (and which pick was wrong)
        if (type === 'mcq') {
          card.querySelectorAll(`input[name="quiz-${qid}"]`).forEach(inp => {
            const label = inp.closest('.quiz-option-label');
            if (!label) return;
            if (parseInt(inp.value) === q.answer) label.classList.add('correct');
            else if (inp.checked) label.classList.add('incorrect');
          });
        } else if (type === 'tradeoff') {
          const expectedOpt = q.answer && typeof q.answer === 'object' ? q.answer.option : q.correctOption;
          const expectedRsn = q.answer && typeof q.answer === 'object' ? q.answer.reason : q.correctReason;
          card.querySelectorAll(`input[name="quiz-tradeoff-opt-${qid}"]`).forEach(inp => {
            const label = inp.closest('.quiz-option-label');
            if (!label) return;
            if (parseInt(inp.value) === expectedOpt) label.classList.add('correct');
            else if (inp.checked) label.classList.add('incorrect');
          });
          card.querySelectorAll(`input[name="quiz-tradeoff-rsn-${qid}"]`).forEach(inp => {
            const label = inp.closest('.quiz-option-label');
            if (!label) return;
            if (parseInt(inp.value) === expectedRsn) label.classList.add('correct');
            else if (inp.checked) label.classList.add('incorrect');
          });
        }
        
        const fb = card.querySelector('.exercise-feedback');
        const msg = fb.querySelector('.feedback-msg');
        fb.style.display = 'block';
        fb.classList.add('show');
        const targetLabel = type === 'numeric' ? ` (Reference Estimate: ${q.answer}${q.unit ? ' ' + escapeHtml(q.unit) : ''})` : '';
        if (correct) {
          fb.classList.add('success');
          msg.innerHTML = `<strong>✓ Correct!${targetLabel}</strong>`;
        } else {
          fb.classList.add('error');
          msg.innerHTML = `<strong>✗ Incorrect.${targetLabel}</strong>`;
        }
        
        const nextBtn = card.querySelector('.quiz-next-btn');
        if (nextBtn) nextBtn.style.display = 'inline-block';
        btn.style.display = 'none';
        
        if (window.Progress && window.Progress.recordQuizAttempt) {
           window.Progress.recordQuizAttempt(qid, correct);
        }
        card.dispatchEvent(new CustomEvent('quiz:graded', { bubbles: true, detail: { qid, correct } }));
     } else if (e.target.closest('.quiz-next-btn')) {
        const btn = e.target.closest('.quiz-next-btn');
        const slug = btn.dataset.slug;
        const card = btn.closest('.quiz-card');
        
        const newHtml = renderQuiz(slug);
        const temp = document.createElement('div');
        temp.innerHTML = newHtml;
        card.replaceWith(temp.firstElementChild);
     }
  });

  /**
   * "Check yourself" slider: this unit's section-anchored questions, one at a time.
   * Each slide is a quiz-card, so grading goes through the shared handler above; the slider
   * only reveals Next after an answer, and shows a score at the end.
   */
  function renderCheckSlider(slug) {
    const qs = (window.QUESTION_BANK?.[slug] || []).filter(q => q.section && q.type === 'mcq');
    if (!qs.length) return '';
    const slides = qs.map((q, i) => `
      <div class="quiz-card check-slider__slide" id="quiz-${q.id}" data-type="${q.type}" data-slug="${slug}" data-index="${i}"${i ? ' hidden' : ''}>
        <div class="check-slider__meta">
          <span class="check-slider__title">${escapeHtml(q.title || '')}</span>
          <span class="check-slider__level">${escapeHtml(q.difficulty || '')}</span>
        </div>
        ${q.section ? `<div class="check-slider__section">From: ${escapeHtml(q.section)}</div>` : ''}
        <p class="check-slider__prompt">${escapeHtml(q.prompt)}</p>
        <div class="quiz-options check-slider__options">${renderOptions(q)}</div>
        <div class="check-slider__actions">
          <button class="btn btn--sm btn--primary quiz-submit-btn" data-qid="${q.id}">Check answer</button>
          <button class="btn btn--sm btn--primary check-slider__next" hidden>${i === qs.length - 1 ? 'See score' : 'Next question →'}</button>
        </div>
        <div class="exercise-feedback quiz-feedback check-slider__feedback" id="feedback-${q.id}" style="display: none;">
          <div class="feedback-msg"></div>
          <div class="feedback-exp">${escapeHtml(q.explanation)}</div>
        </div>
      </div>`).join('');
    return `
      <section class="check-slider" data-slug="${slug}" data-total="${qs.length}" aria-label="Check yourself">
        <div class="check-slider__head">
          <span class="check-slider__label">Check yourself</span>
          <span class="check-slider__count">Question <b>1</b> of ${qs.length}</span>
          <span class="check-slider__dots">${qs.map((_, i) => `<span class="check-slider__dot${i ? '' : ' is-current'}"></span>`).join('')}</span>
        </div>
        <div class="check-slider__track">${slides}</div>
        <div class="check-slider__done" hidden>
          <p class="check-slider__score"></p>
          <button class="btn btn--sm btn--outline check-slider__retry">Try again</button>
        </div>
      </section>`;
  }

  // Slider behaviour: reveal Next after grading, advance, score, retry
  document.addEventListener('quiz:graded', e => {
    const slide = e.target.closest('.check-slider__slide');
    if (!slide) return;
    slide.dataset.correct = e.detail.correct ? '1' : '0';
    const slider = slide.closest('.check-slider');
    slider.querySelectorAll('.check-slider__dot')[+slide.dataset.index]?.classList.add(e.detail.correct ? 'is-right' : 'is-wrong');
    const next = slide.querySelector('.check-slider__next');
    next.hidden = false;
    next.focus({ preventScroll: true });
  });

  document.addEventListener('click', e => {
    const next = e.target.closest('.check-slider__next');
    const retry = e.target.closest('.check-slider__retry');
    if (!next && !retry) return;
    const slider = (next || retry).closest('.check-slider');
    const slides = [...slider.querySelectorAll('.check-slider__slide')];
    const dots = [...slider.querySelectorAll('.check-slider__dot')];
    const show = i => {
      slides.forEach((s, j) => { s.hidden = j !== i; });
      dots.forEach((d, j) => d.classList.toggle('is-current', j === i));
      slider.querySelector('.check-slider__count').innerHTML = `Question <b>${i + 1}</b> of ${slides.length}`;
      slider.querySelector('.check-slider__done').hidden = true;
    };
    if (retry) {
      // Re-render fresh (ungraded) slides in place
      const temp = document.createElement('div');
      temp.innerHTML = renderCheckSlider(slider.dataset.slug);
      slider.replaceWith(temp.firstElementChild);
      return;
    }
    const i = +next.closest('.check-slider__slide').dataset.index;
    if (i + 1 < slides.length) { show(i + 1); return; }
    const right = slides.filter(s => s.dataset.correct === '1').length;
    slides.forEach(s => { s.hidden = true; });
    dots.forEach(d => d.classList.remove('is-current'));
    const done = slider.querySelector('.check-slider__done');
    done.querySelector('.check-slider__score').textContent =
      `You got ${right} of ${slides.length} right.` + (right === slides.length ? ' Nice work.' : ' Review the sections these came from and try again.');
    slider.querySelector('.check-slider__count').textContent = 'Done';
    done.hidden = false;
  });

  return {
    hasQuestions,
    hasEndQuestions,
    renderQuiz,
    renderCheckSlider
  };
})();
