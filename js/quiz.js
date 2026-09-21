window.Quiz = (() => {
  const seenQuestions = new Set();
  
  function hasQuestions(slug) {
    return window.QUESTION_BANK && window.QUESTION_BANK[slug] && window.QUESTION_BANK[slug].length > 0;
  }
  
  function getNextQuestion(slug) {
    const questions = window.QUESTION_BANK[slug];
    const available = questions.filter(q => !seenQuestions.has(q.id));
    if (available.length === 0) {
      questions.forEach(q => seenQuestions.delete(q.id));
      return questions[Math.floor(Math.random() * questions.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
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
    
    const q = getNextQuestion(slug);
    seenQuestions.add(q.id);
    
    return `
      <div class="exercise-box quiz-card" id="quiz-${q.id}" data-type="${q.type}" data-slug="${slug}">
        <div class="exercise-box__header">
          <div class="exercise-box__title">
            <span>Quiz: ${escapeHtml(q.title || 'Knowledge Check')}</span>
          </div>
          <span class="exercise-box__difficulty">${escapeHtml(q.difficulty || 'recall')}</span>
        </div>
        ${q.scenario ? `<div class="exercise-box__scenario"><strong>Scenario:</strong> ${escapeHtml(q.scenario)}</div>` : ''}
        <div class="exercise-box__prompt"><strong>Problem:</strong> ${escapeHtml(q.prompt)}</div>
        
        <div class="quiz-options exercise-options" id="quiz-options-${q.id}" style="margin-top: 15px;">
          ${renderOptions(q)}
        </div>

        <div class="quiz-actions" style="margin-top: 15px; display: flex; gap: 10px;">
           <button class="btn btn--primary quiz-submit-btn" data-qid="${q.id}">Submit</button>
           <button class="btn btn--secondary quiz-next-btn" data-slug="${slug}" style="display:none;">Try Another</button>
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
         <input type="number" class="quiz-number-input" name="quiz-${q.id}" placeholder="Enter a number" style="padding: 8px; width: 100%; box-sizing: border-box;" />
       `;
    } else if (q.type === 'tradeoff') {
       html += `
         <div style="margin-bottom: 10px;">
           <strong>Select Option:</strong>
           ${q.options.map((opt, i) => `
             <label class="exercise-option quiz-option-label" style="display: flex; gap: 10px; cursor: pointer;">
               <input type="radio" name="quiz-tradeoff-opt-${q.id}" value="${i}" />
               <span>${escapeHtml(opt)}</span>
             </label>
           `).join('')}
         </div>
         <div>
           <strong>Select Reason:</strong>
           ${q.reasons.map((rsn, j) => `
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
           if (val === q.answer) correct = true;
        } else if (type === 'tradeoff') {
           const opt = card.querySelector(`input[name="quiz-tradeoff-opt-${qid}"]:checked`);
           const rsn = card.querySelector(`input[name="quiz-tradeoff-rsn-${qid}"]:checked`);
           if (opt && rsn && parseInt(opt.value) === q.answer.option && parseInt(rsn.value) === q.answer.reason) {
             correct = true;
           }
        }
        
        card.querySelectorAll('input, button:not(.quiz-next-btn)').forEach(el => el.disabled = true);
        
        const fb = card.querySelector('.exercise-feedback');
        const msg = fb.querySelector('.feedback-msg');
        fb.style.display = 'block';
        fb.classList.add('show');
        if (correct) {
          fb.classList.add('success');
          msg.innerHTML = '<strong>✓ Correct!</strong>';
        } else {
          fb.classList.add('error');
          msg.innerHTML = '<strong>✗ Incorrect.</strong>';
        }
        
        card.querySelector('.quiz-next-btn').style.display = 'inline-block';
        btn.style.display = 'none';
        
        if (window.Progress && window.Progress.recordQuizAttempt) {
           window.Progress.recordQuizAttempt(qid, correct);
        }
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

  return {
    hasQuestions,
    renderQuiz
  };
})();
