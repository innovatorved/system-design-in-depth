window.SRS = (() => {
  // Grade levels
  const AGAIN = 0;  // Complete failure, reset interval
  const HARD = 1;   // Correct but difficult, shorter interval
  const GOOD = 2;   // Correct with effort, normal interval
  const EASY = 3;   // Effortless, longer interval
  
  function grade(cardId, gradeLevel) {
    let srs = window.Progress.getSrsState(cardId) || {
      ease: 2.5,
      intervalDays: 0,
      dueAt: new Date().toISOString(),
      reps: 0,
      lapses: 0
    };
    
    if (gradeLevel === AGAIN) {
      srs.intervalDays = 1;
      srs.ease = Math.max(1.3, srs.ease - 0.2);
      srs.lapses += 1;
      srs.reps = 0;
    } else if (gradeLevel === HARD) {
      srs.intervalDays = srs.intervalDays === 0 ? 1 : srs.intervalDays * 1.2;
      srs.ease = Math.max(1.3, srs.ease - 0.15);
      srs.reps += 1;
    } else if (gradeLevel === GOOD) {
      srs.intervalDays = srs.intervalDays === 0 ? 1 : srs.intervalDays === 1 ? 6 : srs.intervalDays * srs.ease;
      srs.reps += 1;
    } else if (gradeLevel === EASY) {
      srs.intervalDays = srs.intervalDays === 0 ? 4 : srs.intervalDays === 1 ? 6 : srs.intervalDays * srs.ease * 1.3;
      srs.ease += 0.15;
      srs.reps += 1;
    }
    
    // Calculate new dueAt
    const due = new Date();
    due.setDate(due.getDate() + Math.round(srs.intervalDays));
    srs.dueAt = due.toISOString();
    
    window.Progress.updateSrs(cardId, srs);
  }
  
  function getAllCards() {
    const all = [];
    if (!window.FLASHCARDS) return all;
    for (const unit in window.FLASHCARDS) {
      all.push(...window.FLASHCARDS[unit]);
    }
    return all;
  }

  function getDueCards() {
    const all = getAllCards();
    const now = new Date().toISOString();
    
    const due = all.filter(card => {
      const state = window.Progress.getSrsState(card.id);
      if (!state) return true; // unseen
      return state.dueAt <= now;
    });
    
    // Sort: unseen first, then by dueAt ascending
    due.sort((a, b) => {
      const stateA = window.Progress.getSrsState(a.id);
      const stateB = window.Progress.getSrsState(b.id);
      
      if (!stateA && !stateB) return 0;
      if (!stateA) return -1;
      if (!stateB) return 1;
      
      return stateA.dueAt.localeCompare(stateB.dueAt);
    });
    
    return due;
  }
  
  function getDueCount() {
    return getDueCards().length;
  }
  
  function getCardById(cardId) {
    return getAllCards().find(c => c.id === cardId);
  }
  
  function renderReviewSession() {
    const dueCards = getDueCards();
    if (dueCards.length === 0) {
      return `
        <div class="srs-session srs-complete">
          <h2>Session complete! 🎉 You reviewed all due cards</h2>
          <p><a href="#/" class="btn">Back to Home</a></p>
        </div>
      `;
    }
    
    const card = dueCards[0];
    const totalDueAtStart = parseInt(sessionStorage.getItem('srsTotalDue') || dueCards.length, 10);
    if (!sessionStorage.getItem('srsTotalDue')) {
      sessionStorage.setItem('srsTotalDue', totalDueAtStart);
    }
    
    const reviewedCount = totalDueAtStart - dueCards.length;
    
    return `
      <div class="srs-session">
        <div class="srs-header">
          <span>Card ${reviewedCount + 1} of ${totalDueAtStart} due</span>
          <a href="#/" class="btn btn-small" onclick="sessionStorage.removeItem('srsTotalDue')">Exit</a>
        </div>
        
        <div class="srs-card">
          <div class="srs-front">
            <h3>Question</h3>
            <p>${card.front}</p>
          </div>
          
          <div class="srs-back" id="srs-back-content" style="display: none;">
            <hr>
            <h3>Answer</h3>
            <p>${card.back}</p>
          </div>
          
          <div class="srs-actions" id="srs-show-actions">
            <button class="btn btn-primary btn-large" onclick="document.getElementById('srs-back-content').style.display='block'; document.getElementById('srs-show-actions').style.display='none'; document.getElementById('srs-grade-actions').style.display='flex';">Show Answer</button>
          </div>
          
          <div class="srs-actions srs-grade-actions" id="srs-grade-actions" style="display: none; gap: 10px; margin-top: 20px;">
            <button class="btn" style="background: #ef4444; color: white;" onclick="window.SRS.grade('${card.id}', window.SRS.AGAIN); window.app.render();">Again</button>
            <button class="btn" style="background: #f97316; color: white;" onclick="window.SRS.grade('${card.id}', window.SRS.HARD); window.app.render();">Hard</button>
            <button class="btn" style="background: #22c55e; color: white;" onclick="window.SRS.grade('${card.id}', window.SRS.GOOD); window.app.render();">Good</button>
            <button class="btn" style="background: #3b82f6; color: white;" onclick="window.SRS.grade('${card.id}', window.SRS.EASY); window.app.render();">Easy</button>
          </div>
        </div>
      </div>
    `;
  }
  
  return { grade, getDueCards, getDueCount, getAllCards, getCardById, renderReviewSession, AGAIN, HARD, GOOD, EASY };
})();
