window.Quiz = (() => {
  const seenQuestions = new Set();

  function hasQuestions(slug) {
    return Boolean(window.QUESTION_BANK && window.QUESTION_BANK[slug] && window.QUESTION_BANK[slug].length > 0);
  }

  // End-of-lesson questions: those not anchored to a specific section (e.g. Napkin Math numeric & Staff Trade-Off Matrix)
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

  function getTypeMeta(type) {
    if (type === 'numeric') {
      return {
        badge: 'Napkin Math · Capacity',
        shortLabel: 'Napkin Math',
        cls: 'is-numeric',
        defaultTitle: 'Back-of-the-Envelope Napkin Math',
        defaultDiff: 'capacity estimation'
      };
    }
    if (type === 'tradeoff') {
      return {
        badge: 'Staff Trade-Off Matrix',
        shortLabel: 'Trade-Off',
        cls: 'is-tradeoff',
        defaultTitle: 'Staff Architecture Trade-Off Matrix',
        defaultDiff: 'trade-off decision'
      };
    }
    return {
      badge: 'Concept Check',
      shortLabel: 'Concept',
      cls: 'is-mcq',
      defaultTitle: 'Knowledge Check',
      defaultDiff: 'recall'
    };
  }

  function renderOptions(q) {
    let html = '';
    if (q.type === 'mcq') {
      (q.options || []).forEach((opt, idx) => {
        html += `
          <label class="exercise-option quiz-option-label">
            <input type="radio" name="quiz-${q.id}" value="${idx}" />
            <span>${escapeHtml(opt)}</span>
          </label>
        `;
      });
    } else if (q.type === 'multi') {
      (q.options || []).forEach((opt, idx) => {
        html += `
          <label class="exercise-option quiz-option-label">
            <input type="checkbox" name="quiz-${q.id}" value="${idx}" />
            <span>${escapeHtml(opt)}</span>
          </label>
        `;
      });
    } else if (q.type === 'ordering') {
      html += `<ul class="quiz-ordering-list">`;
      (q.options || []).forEach((opt, idx) => {
        html += `
          <li class="exercise-option quiz-order-item" data-id="${idx}">
            <span>${escapeHtml(opt)}</span>
            <div class="quiz-order-item__btns">
              <button type="button" class="btn btn--sm quiz-up-btn" data-idx="${idx}">↑</button>
              <button type="button" class="btn btn--sm quiz-down-btn" data-idx="${idx}">↓</button>
            </div>
          </li>
        `;
      });
      html += `</ul>`;
    } else if (q.type === 'numeric') {
      const tolPct = Math.round((typeof q.tolerance === 'number' ? q.tolerance : 0.2) * 100);
      html += `
        <div class="quiz-napkin-card">
          <div class="quiz-number-wrap">
            <input
              type="number"
              step="any"
              class="quiz-number-input"
              name="quiz-${q.id}"
              aria-label="Numeric estimate${q.unit ? ' in ' + escapeHtml(q.unit) : ''}"
              placeholder="Enter numeric estimate${q.unit ? ' (' + escapeHtml(q.unit) + ')' : ''}..."
            />
            ${q.unit ? `<span class="quiz-unit-badge">${escapeHtml(q.unit)}</span>` : ''}
            <span class="quiz-tolerance-badge" title="Back-of-the-envelope tolerance band">±${tolPct}% accepted</span>
          </div>
          ${q.hint ? `
            <details class="quiz-hint-details">
              <summary class="quiz-hint-summary">Show Napkin Formula / Estimation Hint</summary>
              <div class="quiz-hint-body">${escapeHtml(q.hint)}</div>
            </details>
          ` : ''}
        </div>
      `;
    } else if (q.type === 'tradeoff') {
      html += `
        <div class="quiz-tradeoff-grid">
          <div class="quiz-tradeoff-col">
            <div class="quiz-tradeoff-step">
              <span class="quiz-tradeoff-step__num">Part 1</span>
              <span class="quiz-tradeoff-step__label">Select Architecture Decision</span>
            </div>
            <div class="quiz-tradeoff-list">
              ${(q.options || []).map((opt, i) => `
                <label class="exercise-option quiz-option-label">
                  <input type="radio" name="quiz-tradeoff-opt-${q.id}" value="${i}" />
                  <span>${escapeHtml(opt)}</span>
                </label>
              `).join('')}
            </div>
          </div>
          <div class="quiz-tradeoff-col">
            <div class="quiz-tradeoff-step">
              <span class="quiz-tradeoff-step__num">Part 2</span>
              <span class="quiz-tradeoff-step__label">Select Primary Engineering Justification</span>
            </div>
            <div class="quiz-tradeoff-list">
              ${(q.reasons || []).map((rsn, j) => `
                <label class="exercise-option quiz-option-label">
                  <input type="radio" name="quiz-tradeoff-rsn-${q.id}" value="${j}" />
                  <span>${escapeHtml(rsn)}</span>
                </label>
              `).join('')}
            </div>
          </div>
        </div>
        ${q.hint ? `
          <details class="quiz-hint-details">
            <summary class="quiz-hint-summary">Show Architectural Hint</summary>
            <div class="quiz-hint-body">${escapeHtml(q.hint)}</div>
          </details>
        ` : ''}
      `;
    }
    return html;
  }

  function renderQuiz(slug) {
    if (!hasQuestions(slug) || !hasEndQuestions(slug)) return '';
    const q = getNextQuestion(slug);
    seenQuestions.add(q.id);
    const allEnd = endQuestions(slug);
    const meta = getTypeMeta(q.type);
    const promptText = q.prompt || q.question || '';

    return `
      <div class="check-slider quiz-card" id="quiz-${q.id}" data-type="${q.type}" data-slug="${slug}">
        <div class="check-slider__meta">
          <span class="check-slider__type-badge ${meta.cls}">${escapeHtml(meta.badge)}</span>
          <span class="check-slider__title">${escapeHtml(q.title || meta.defaultTitle)}</span>
          <span class="check-slider__level">${escapeHtml(q.difficulty || meta.defaultDiff)}</span>
        </div>
        ${q.scenario ? `
          <div class="quiz-scenario-box">
            <span class="quiz-scenario-box__label">Scenario</span>
            <p class="quiz-scenario-box__text">${escapeHtml(q.scenario)}</p>
          </div>
        ` : ''}
        <p class="check-slider__prompt">${escapeHtml(promptText)}</p>
        <div class="quiz-options check-slider__options" id="quiz-options-${q.id}">
          ${renderOptions(q)}
        </div>
        <div class="check-slider__actions">
          <button type="button" class="btn btn--sm btn--primary quiz-submit-btn" data-qid="${q.id}">Check answer</button>
          <button type="button" class="btn btn--sm btn--outline quiz-next-btn" data-slug="${slug}" style="${allEnd.length > 1 ? '' : 'display:none;'}">Next Drill (${allEnd.length} available) →</button>
        </div>
        <div class="exercise-feedback quiz-feedback check-slider__feedback" id="feedback-${q.id}" style="display: none;">
          <div class="feedback-msg"></div>
          <div class="feedback-exp">${escapeHtml(q.explanation)}</div>
        </div>
      </div>
    `;
  }

  /**
   * Unified "Check yourself" drawer: includes section Concept Checks (mcq)
   * AND end-of-lesson Back-of-the-Envelope Napkin Math (numeric) & Staff Trade-Off Matrix (tradeoff) drills.
   */
  function renderCheckSlider(slug) {
    const raw = window.QUESTION_BANK?.[slug] || [];
    if (!raw.length) return '';

    // Order: section-anchored concept checks first, followed by numeric (Napkin Math) and tradeoff drills
    const sectionQs = raw.filter(q => q.section || q.section === 0);
    const drillQs = raw.filter(q => !q.section && q.section !== 0);
    const qs = [...sectionQs, ...drillQs];
    if (!qs.length) return '';

    const firstMcqIdx = qs.findIndex(q => q.type === 'mcq');
    const firstNumericIdx = qs.findIndex(q => q.type === 'numeric');
    const firstTradeoffIdx = qs.findIndex(q => q.type === 'tradeoff');
    const hasDrills = firstNumericIdx !== -1 || firstTradeoffIdx !== -1;
    const mcqCount = qs.filter(q => q.type === 'mcq').length;

    const modeTabsHtml = hasDrills ? `
      <div class="check-slider__tabs" role="tablist" aria-label="Question categories">
        ${firstMcqIdx !== -1 ? `<button type="button" class="check-slider__tab is-active" data-jump-index="${firstMcqIdx}" data-tab-type="mcq">Concept (${mcqCount})</button>` : ''}
        ${firstNumericIdx !== -1 ? `<button type="button" class="check-slider__tab" data-jump-index="${firstNumericIdx}" data-tab-type="numeric">Napkin Math</button>` : ''}
        ${firstTradeoffIdx !== -1 ? `<button type="button" class="check-slider__tab" data-jump-index="${firstTradeoffIdx}" data-tab-type="tradeoff">Trade-Off</button>` : ''}
      </div>
    ` : '';

    const slides = qs.map((q, i) => {
      const meta = getTypeMeta(q.type);
      const promptText = q.prompt || q.question || '';
      const submitLabel = q.type === 'numeric'
        ? 'Verify Estimate'
        : q.type === 'tradeoff'
          ? 'Verify Trade-Off'
          : 'Check answer';

      return `
      <div class="quiz-card check-slider__slide" id="quiz-${q.id}" data-type="${q.type}" data-slug="${slug}" data-index="${i}"${i ? ' hidden' : ''}>
        <div class="check-slider__meta">
          <span class="check-slider__type-badge ${meta.cls}">${escapeHtml(meta.badge)}</span>
          <span class="check-slider__title">${escapeHtml(q.title || meta.defaultTitle)}</span>
          <span class="check-slider__level">${escapeHtml(q.difficulty || meta.defaultDiff)}</span>
        </div>
        ${q.section ? `<div class="check-slider__section">Section: ${escapeHtml(q.section)}</div>` : ''}
        ${q.scenario ? `
          <div class="quiz-scenario-box">
            <span class="quiz-scenario-box__label">Scenario</span>
            <p class="quiz-scenario-box__text">${escapeHtml(q.scenario)}</p>
          </div>
        ` : ''}
        <p class="check-slider__prompt">${escapeHtml(promptText)}</p>
        <div class="quiz-options check-slider__options" id="quiz-options-${q.id}">${renderOptions(q)}</div>
        <div class="check-slider__actions">
          ${i > 0 ? `<button type="button" class="btn btn--sm btn--ghost check-slider__prev" data-target-index="${i - 1}">← Prev</button>` : ''}
          <button type="button" class="btn btn--sm btn--primary quiz-submit-btn" data-qid="${q.id}">${submitLabel}</button>
          <button type="button" class="btn btn--sm btn--primary check-slider__next" hidden>${i === qs.length - 1 ? 'See score' : 'Next question →'}</button>
          ${i < qs.length - 1 ? `<button type="button" class="btn btn--sm btn--ghost check-slider__skip" data-target-index="${i + 1}">Skip →</button>` : ''}
        </div>
        <div class="exercise-feedback quiz-feedback check-slider__feedback" id="feedback-${q.id}" style="display: none;">
          <div class="feedback-msg"></div>
          <div class="feedback-exp">${escapeHtml(q.explanation)}</div>
        </div>
      </div>`;
    }).join('');

    const dotsHtml = qs.map((q, i) => {
      const meta = getTypeMeta(q.type);
      return `<button type="button" class="check-slider__dot ${meta.cls}${i ? '' : ' is-current'}" data-slide-index="${i}" title="${escapeHtml((i + 1) + '. ' + meta.shortLabel + ': ' + (q.title || ''))}" aria-label="Go to question ${i + 1}"></button>`;
    }).join('');

    return `
      <section class="check-slider" data-slug="${slug}" data-total="${qs.length}" aria-label="Check yourself">
        <div class="check-slider__head">
          <span class="check-slider__label">Check yourself</span>
          <span class="check-slider__count">Question <b>1</b> of ${qs.length}</span>
          ${modeTabsHtml}
          <span class="check-slider__dots">${dotsHtml}</span>
        </div>
        <div class="check-slider__track">${slides}</div>
        <div class="check-slider__done" hidden>
          <p class="check-slider__score"></p>
          <button type="button" class="btn btn--sm btn--outline check-slider__retry">Try again</button>
        </div>
      </section>`;
  }

  function setActiveSlide(slider, index) {
    const slides = [...slider.querySelectorAll('.check-slider__slide')];
    const dots = [...slider.querySelectorAll('.check-slider__dot')];
    const tabs = [...slider.querySelectorAll('.check-slider__tab')];
    if (index < 0 || index >= slides.length) return;

    slides.forEach((s, j) => { s.hidden = j !== index; });
    dots.forEach((d, j) => d.classList.toggle('is-current', j === index));

    const activeType = slides[index]?.dataset.type || 'mcq';
    tabs.forEach(t => {
      t.classList.toggle('is-active', t.dataset.tabType === activeType);
    });

    const countEl = slider.querySelector('.check-slider__count');
    if (countEl) countEl.innerHTML = `Question <b>${index + 1}</b> of ${slides.length}`;
    const doneEl = slider.querySelector('.check-slider__done');
    if (doneEl) doneEl.hidden = true;
  }

  // Allow pressing Enter inside numeric input to submit
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('quiz-number-input')) {
      e.preventDefault();
      const card = e.target.closest('.quiz-card');
      const submitBtn = card?.querySelector('.quiz-submit-btn');
      if (submitBtn && !submitBtn.disabled && submitBtn.style.display !== 'none') {
        submitBtn.click();
      }
    }
  });

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
      const q = (window.QUESTION_BANK?.[slug] || []).find(x => x.id === qid);
      if (!q) return;

      let correct = false;
      let userNumericVal = NaN;

      if (type === 'mcq') {
        const checked = card.querySelector(`input[name="quiz-${qid}"]:checked`);
        if (checked && parseInt(checked.value, 10) === q.answer) correct = true;
      } else if (type === 'multi') {
        const checked = Array.from(card.querySelectorAll(`input[name="quiz-${qid}"]:checked`)).map(el => parseInt(el.value, 10));
        if (checked.length === q.answer.length && checked.every(v => q.answer.includes(v))) correct = true;
      } else if (type === 'ordering') {
        const currentOrder = Array.from(card.querySelectorAll('.quiz-order-item')).map(el => parseInt(el.dataset.id, 10));
        if (JSON.stringify(currentOrder) === JSON.stringify(q.answer)) correct = true;
      } else if (type === 'numeric') {
        const numInput = card.querySelector('.quiz-number-input');
        userNumericVal = parseFloat(numInput ? numInput.value : '');
        if (!Number.isNaN(userNumericVal)) {
          const tol = typeof q.tolerance === 'number' ? q.tolerance : 0.2;
          if (userNumericVal === q.answer || Math.abs(userNumericVal - q.answer) / Math.max(1, Math.abs(q.answer)) <= tol) {
            correct = true;
          }
        }
        if (numInput) {
          numInput.classList.add(correct ? 'is-correct' : 'is-incorrect');
        }
      } else if (type === 'tradeoff') {
        const opt = card.querySelector(`input[name="quiz-tradeoff-opt-${qid}"]:checked`);
        const rsn = card.querySelector(`input[name="quiz-tradeoff-rsn-${qid}"]:checked`);
        const expectedOpt = q.answer && typeof q.answer === 'object' ? q.answer.option : q.correctOption;
        const expectedRsn = q.answer && typeof q.answer === 'object' ? q.answer.reason : q.correctReason;
        if (opt && rsn && parseInt(opt.value, 10) === expectedOpt && parseInt(rsn.value, 10) === expectedRsn) {
          correct = true;
        }
      }

      card.querySelectorAll('input, .quiz-submit-btn, .quiz-up-btn, .quiz-down-btn').forEach(el => {
        el.disabled = true;
      });
      const skipBtn = card.querySelector('.check-slider__skip');
      if (skipBtn) skipBtn.style.display = 'none';

      // Highlight correct and picked options
      if (type === 'mcq') {
        card.querySelectorAll(`input[name="quiz-${qid}"]`).forEach(inp => {
          const label = inp.closest('.quiz-option-label');
          if (!label) return;
          if (parseInt(inp.value, 10) === q.answer) label.classList.add('correct');
          else if (inp.checked) label.classList.add('incorrect');
        });
      } else if (type === 'tradeoff') {
        const expectedOpt = q.answer && typeof q.answer === 'object' ? q.answer.option : q.correctOption;
        const expectedRsn = q.answer && typeof q.answer === 'object' ? q.answer.reason : q.correctReason;
        card.querySelectorAll(`input[name="quiz-tradeoff-opt-${qid}"]`).forEach(inp => {
          const label = inp.closest('.quiz-option-label');
          if (!label) return;
          if (parseInt(inp.value, 10) === expectedOpt) label.classList.add('correct');
          else if (inp.checked) label.classList.add('incorrect');
        });
        card.querySelectorAll(`input[name="quiz-tradeoff-rsn-${qid}"]`).forEach(inp => {
          const label = inp.closest('.quiz-option-label');
          if (!label) return;
          if (parseInt(inp.value, 10) === expectedRsn) label.classList.add('correct');
          else if (inp.checked) label.classList.add('incorrect');
        });
      }

      const fb = card.querySelector('.exercise-feedback');
      const msg = fb.querySelector('.feedback-msg');
      fb.style.display = 'block';
      fb.classList.add('show');
      const tolPct = Math.round((typeof q.tolerance === 'number' ? q.tolerance : 0.2) * 100);
      const userLabel = (!Number.isNaN(userNumericVal) && type === 'numeric')
        ? `Your Estimate: ${userNumericVal}${q.unit ? ' ' + escapeHtml(q.unit) : ''} · `
        : '';
      const targetLabel = type === 'numeric'
        ? ` (${userLabel}Reference: ${q.answer}${q.unit ? ' ' + escapeHtml(q.unit) : ''}, ±${tolPct}%)`
        : '';
      if (correct) {
        fb.classList.remove('error');
        fb.classList.add('success');
        msg.innerHTML = `<strong>✓ Correct!${targetLabel}</strong>`;
      } else {
        fb.classList.remove('success');
        fb.classList.add('error');
        msg.innerHTML = `<strong>✗ Not quite.${targetLabel}</strong>`;
      }

      const nextBtn = card.querySelector('.quiz-next-btn');
      if (nextBtn) nextBtn.style.display = 'inline-block';
      btn.style.display = 'none';

      if (window.Progress && window.Progress.recordQuizAttempt) {
        window.Progress.recordQuizAttempt(qid, correct);
      }
      if (window.Analytics?.trackQuizCheck) {
        const slideIdx = card.dataset.index ? parseInt(card.dataset.index, 10) : 0;
        let userAns = '';
        if (type === 'numeric' && !Number.isNaN(userNumericVal)) userAns = String(userNumericVal);
        else if (type === 'mcq') {
          const checked = card.querySelector(`input[name="quiz-${qid}"]:checked`);
          userAns = checked ? checked.value : '';
        } else if (type === 'tradeoff') {
          const opt = card.querySelector(`input[name="quiz-tradeoff-opt-${qid}"]:checked`);
          const rsn = card.querySelector(`input[name="quiz-tradeoff-rsn-${qid}"]:checked`);
          userAns = `${opt ? opt.value : '-'}:${rsn ? rsn.value : '-'}`;
        }
        window.Analytics.trackQuizCheck({
          slug,
          questionId: qid,
          questionType: type,
          isCorrect: correct,
          slideIndex: slideIdx,
          userAnswer: userAns
        });
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

  // Slider behaviour: reveal Next after grading, advance, jump by dot/tab, score, retry
  document.addEventListener('quiz:graded', e => {
    const slide = e.target.closest('.check-slider__slide');
    if (!slide) return;
    slide.dataset.correct = e.detail.correct ? '1' : '0';
    const slider = slide.closest('.check-slider');
    const dot = slider.querySelectorAll('.check-slider__dot')[+slide.dataset.index];
    if (dot) {
      dot.classList.remove('is-right', 'is-wrong');
      dot.classList.add(e.detail.correct ? 'is-right' : 'is-wrong');
    }
    const next = slide.querySelector('.check-slider__next');
    if (next) {
      next.hidden = false;
      next.focus({ preventScroll: true });
    }
  });

  document.addEventListener('click', e => {
    const next = e.target.closest('.check-slider__next');
    const prev = e.target.closest('.check-slider__prev');
    const skip = e.target.closest('.check-slider__skip');
    const retry = e.target.closest('.check-slider__retry');
    const dot = e.target.closest('.check-slider__dot[data-slide-index]');
    const tab = e.target.closest('.check-slider__tab[data-jump-index]');

    if (!next && !prev && !skip && !retry && !dot && !tab) return;
    const trigger = next || prev || skip || retry || dot || tab;
    const slider = trigger.closest('.check-slider');
    if (!slider) return;

    const slides = [...slider.querySelectorAll('.check-slider__slide')];
    const dots = [...slider.querySelectorAll('.check-slider__dot')];

    const slug = slider.dataset.slug || '';

    if (retry) {
      if (window.Analytics?.trackQuizSlideNavigate) {
        window.Analytics.trackQuizSlideNavigate({ slug, action: 'retry', slideIndex: 0, questionType: 'mcq' });
      }
      const temp = document.createElement('div');
      temp.innerHTML = renderCheckSlider(slug);
      slider.replaceWith(temp.firstElementChild);
      return;
    }

    if (dot) {
      const idx = parseInt(dot.dataset.slideIndex, 10);
      setActiveSlide(slider, idx);
      if (window.Analytics?.trackQuizSlideNavigate) {
        window.Analytics.trackQuizSlideNavigate({ slug, action: 'dot', slideIndex: idx, questionType: slides[idx]?.dataset.type || 'mcq' });
      }
      return;
    }

    if (tab) {
      const idx = parseInt(tab.dataset.jumpIndex, 10);
      setActiveSlide(slider, idx);
      if (window.Analytics?.trackQuizSlideNavigate) {
        window.Analytics.trackQuizSlideNavigate({ slug, action: 'tab_' + (tab.dataset.tabType || 'mcq'), slideIndex: idx, questionType: slides[idx]?.dataset.type || 'mcq' });
      }
      return;
    }

    if (prev || skip) {
      const targetIdx = parseInt((prev || skip).dataset.targetIndex, 10);
      setActiveSlide(slider, targetIdx);
      if (window.Analytics?.trackQuizSlideNavigate) {
        window.Analytics.trackQuizSlideNavigate({ slug, action: prev ? 'prev' : 'skip', slideIndex: targetIdx, questionType: slides[targetIdx]?.dataset.type || 'mcq' });
      }
      return;
    }

    const i = +next.closest('.check-slider__slide').dataset.index;
    if (i + 1 < slides.length) {
      setActiveSlide(slider, i + 1);
      if (window.Analytics?.trackQuizSlideNavigate) {
        window.Analytics.trackQuizSlideNavigate({ slug, action: 'next', slideIndex: i + 1, questionType: slides[i + 1]?.dataset.type || 'mcq' });
      }
      return;
    }

    const right = slides.filter(s => s.dataset.correct === '1').length;
    if (window.Analytics?.trackQuizComplete) {
      window.Analytics.trackQuizComplete({
        slug,
        score: right,
        totalQuestions: slides.length,
        percentage: slides.length ? Math.round((right / slides.length) * 100) : 0
      });
    }
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
