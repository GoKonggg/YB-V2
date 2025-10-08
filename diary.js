// File: diary.js (Patched & Robust)

document.addEventListener('DOMContentLoaded', () => {
  // Pastikan ini halaman Diary
  const dateDisplay = document.querySelector('h2.font-bold');
  if (!dateDisplay) return;

  // === Elemen umum ===
  const prevDayButton = dateDisplay.previousElementSibling;
  const nextDayButton = dateDisplay.nextElementSibling;

  const caloriesConsumedElement = document.getElementById('calories-consumed');
  const caloriesGoalElement = document.getElementById('calories-goal');
  const caloriesProgress = document.getElementById('calories-progress');

  // Modal Streak
  const streakOverlay = document.getElementById('streak-overlay');
  const streakPopupWrapper = document.getElementById('streak-popup');
  const streakCard = document.getElementById('streak-card'); // target capture
  const streakDaysEl = document.getElementById('streak-days');
  const closeStreakBtn = document.getElementById('close-streak-btn');
  const shareStreakBtn = document.getElementById('share-streak-btn');

  // Preview Sheet
  const previewOverlay = document.getElementById('share-preview-overlay');
  const previewContainer = document.getElementById('image-preview-container');
  const spinner = document.getElementById('loading-spinner');
  const shareActions = document.getElementById('share-actions');
  const closePreviewBtn = document.getElementById('close-preview-btn');

  let currentDate = new Date();

  // ====== Helpers tanggal & storage ======
  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const updateDateDisplay = () => {
    const today = new Date();
    const yesterday = new Date();
    const tomorrow = new Date();

    yesterday.setDate(today.getDate() - 1);
    tomorrow.setDate(today.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    if (currentDate.getTime() === today.getTime()) {
      dateDisplay.textContent = 'Today';
    } else if (formatDateKey(currentDate) === formatDateKey(yesterday)) {
      dateDisplay.textContent = 'Yesterday';
    } else if (formatDateKey(currentDate) === formatDateKey(tomorrow)) {
      dateDisplay.textContent = 'Tomorrow';
    } else {
      dateDisplay.textContent = currentDate.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
    }
  };

  const getFoodForDate = (dateKey) => {
    const allFoodData = JSON.parse(localStorage.getItem('allFoodData')) || {};
    return allFoodData[dateKey] || { breakfast: [], lunch: [], dinner: [], snack: [] };
  };

  const saveFoodForDate = (dateKey, dailyFood) => {
    const allFoodData = JSON.parse(localStorage.getItem('allFoodData')) || {};
    allFoodData[dateKey] = dailyFood;
    localStorage.setItem('allFoodData', JSON.stringify(allFoodData));
  };

  // ====== Progress kalori ======
  const savedGoal = localStorage.getItem('calorieGoal');
  const totalCaloriesGoal = savedGoal ? parseInt(savedGoal, 10) : 1836;
  if (caloriesGoalElement) caloriesGoalElement.textContent = `/ ${totalCaloriesGoal}`;

  const updateTotalCalories = () => {
    let total = 0;
    const items = document.querySelectorAll(
      '#breakfast-card-body .food-item-wrapper, ' +
      '#lunch-card-body .food-item-wrapper, ' +
      '#dinner-card-body .food-item-wrapper, ' +
      '#snack-card-body .food-item-wrapper'
    );
    items.forEach(el => {
      const c = parseInt(el.dataset.calories, 10);
      if (!isNaN(c)) total += c;
    });
    caloriesConsumedElement.textContent = total;
    const pct = (total / totalCaloriesGoal) * 100;
    caloriesProgress.style.width = `${Math.min(pct, 100)}%`;
  };

  // ====== Elemen makanan (render + swipe delete) ======
  const addSwipeToDelete = (element) => {
    let startX = 0, currentX = 0, isSwiping = false;
    const deleteThreshold = -100;
    const content = element.querySelector('.food-item-content');
    const deleteAction = element.querySelector('.delete-action');

    element.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isSwiping = true;
      content.style.transition = 'none';
      deleteAction.style.transition = 'none';
    });

    element.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      currentX = e.touches[0].clientX;
      let diff = currentX - startX;
      if (diff < 0) {
        content.style.transform = `translateX(${diff}px)`;
        deleteAction.style.opacity = Math.min(Math.abs(diff) / Math.abs(deleteThreshold), 1);
      }
    });

    element.addEventListener('touchend', () => {
      if (!isSwiping) return;
      isSwiping = false;
      content.style.transition = 'transform 0.3s ease-out';
      deleteAction.style.transition = 'opacity 0.3s ease-out';
      const diff = currentX - startX;
      if (diff < deleteThreshold) {
        const mealType = element.parentElement.id.split('-')[0];
        const foodId = element.dataset.id;
        deleteItem(element, mealType, foodId);
      } else {
        content.style.transform = 'translateX(0)';
        deleteAction.style.opacity = '0';
      }
    });
  };

  const createFoodElement = (foodData) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'food-item-wrapper';
    wrapper.dataset.calories = foodData.calories;
    wrapper.dataset.id = foodData.id;

    wrapper.innerHTML = `
      <div class="delete-action">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </div>
      <div class="food-item-content flex justify-between items-center text-sm p-2">
        <div>
          <p class="font-semibold text-gray-800">${foodData.name}</p>
          <p class="text-xs text-gray-500">${foodData.serving}</p>
        </div>
        <div class="text-right">
          <p class="font-semibold text-gray-700">${foodData.calories} kcal</p>
          <p class="text-xs text-gray-500">${foodData.time || ''}</p>
        </div>
      </div>
    `;
    addSwipeToDelete(wrapper);
    return wrapper;
  };

  const deleteItem = (element, mealType, foodId) => {
    const cardBody = element.parentElement;
    element.style.maxHeight = '0px';
    element.style.opacity = '0';

    setTimeout(() => {
      element.remove();
      const dateKey = formatDateKey(currentDate);
      let dailyFood = getFoodForDate(dateKey);
      if (dailyFood[mealType]) {
        dailyFood[mealType] = dailyFood[mealType].filter(f => f.id !== foodId);
        saveFoodForDate(dateKey, dailyFood);
      }
      updateTotalCalories();
      if (cardBody.children.length === 0) {
        cardBody.innerHTML = `<div class="text-center text-gray-500 py-6 bg-white/20 rounded-lg"><p class="text-sm">No ${mealType} logged yet.</p></div>`;
      }
    }, 400);
  };

  // ====== Streak ======
  const updateStreak = () => {
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];

    let streakCount = parseInt(localStorage.getItem('streakCount')) || 0;
    let lastLogDate = localStorage.getItem('lastLogDate');

    if (lastLogDate === todayKey) return;

    if (lastLogDate === yesterdayKey) streakCount++;
    else streakCount = 1;

    localStorage.setItem('streakCount', streakCount);
    localStorage.setItem('lastLogDate', todayKey);
    checkStreakMilestone(streakCount);
  };

  const checkStreakMilestone = (streakCount) => {
    if (streakCount === 1 || (streakCount > 0 && streakCount % 5 === 0)) {
      showStreakPopup(streakCount);
    }
  };

  // === Modal helpers ===
  const openStreakModal = () => {
    // pastikan overlay & popup ada di body (z-index stabil)
    document.body.appendChild(streakOverlay);
    document.body.appendChild(streakPopupWrapper);
    streakOverlay.classList.remove('hidden');
    streakPopupWrapper.classList.remove('hidden');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  };
  const closeStreakModal = () => {
    streakOverlay.classList.add('hidden');
    streakPopupWrapper.classList.add('hidden');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  };

  // === Confetti di dalam area #app-container (selalu muncul) ===
  // === Confetti di dalam area #app-container (dengan "bleed" kiri/kanan) ===
function launchConfettiInApp() {
  const app = document.getElementById('app-container');
  if (!app) return;

  // Pastikan script confetti sudah siap (kadang load CDN telat)
  function whenConfettiReady(cb, tries = 0) {
    if (window.confetti && typeof window.confetti.create === 'function') return cb();
    if (tries > 60) return; // stop setelah ~3s
    setTimeout(() => whenConfettiReady(cb, tries + 1), 50);
  }

  whenConfettiReady(() => {
    const rect = app.getBoundingClientRect();

    // Tambah "bleed" supaya keluar kiri-kanan dari app container
    const BLEED = 48; // px
    const top = rect.top - BLEED;
    const left = rect.left - BLEED;
    const width = rect.width + BLEED * 2;
    const height = rect.height + BLEED * 2;

    const cvs = document.createElement('canvas');
    cvs.id = 'confetti-app-canvas';
    Object.assign(cvs.style, {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      height: `${height}px`,
      zIndex: '100002',       // di atas popup & overlay preview
      pointerEvents: 'none',
      borderRadius: getComputedStyle(app).borderRadius
    });

    // High-DPI
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    cvs.width  = Math.floor(width  * dpr);
    cvs.height = Math.floor(height * dpr);
    const ctx = cvs.getContext('2d');
    ctx.scale(dpr, dpr);

    document.body.appendChild(cvs);

    const fire = confetti.create(cvs, { resize: false, useWorker: true });

    // Sedikit delay setelah attach supaya pasti render
    setTimeout(() => {
      // Dua semburan biar lebih “full”
      fire({ particleCount: 120, startVelocity: 40, spread: 70, origin: { x: 0.3, y: 0.9 } });
      fire({ particleCount: 120, startVelocity: 40, spread: 70, origin: { x: 0.7, y: 0.9 } });
    }, 0);

    // Bersihkan
    setTimeout(() => cvs.remove(), 2000);
  });
}


  // === Preview helpers ===
  const openPreviewSheet = () => {
    previewContainer.innerHTML = '';
    spinner.style.display = 'block';
    shareActions.classList.add('hidden');
    previewOverlay.classList.remove('hidden');
  };
  const closePreviewSheet = () => {
    previewOverlay.classList.add('hidden');
  };

  // ====== SHARE: bind sekali (robust walau popup dipindah) ======
  let shareBound = false;
  function bindShareOnce() {
    if (shareBound || !shareStreakBtn) return;
    shareBound = true;

    shareStreakBtn.addEventListener('click', async () => {
      openPreviewSheet();
      try {
        const canvas = await html2canvas(streakCard, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
          allowTaint: false,
          windowWidth: streakCard.scrollWidth,
          windowHeight: streakCard.scrollHeight
        });

        // tampilkan preview (fit via CSS)
        const dataURL = canvas.toDataURL('image/png');
        const img = new Image();
        img.src = dataURL;
        img.alt = 'streak-preview';
        previewContainer.innerHTML = '';
        previewContainer.appendChild(img);
        spinner.style.display = 'none';
        shareActions.classList.remove('hidden');

        const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        const file = new File([blob], `streak-${streakDaysEl.textContent}.png`, { type: 'image/png' });

        // satu handler untuk semua opsi share
        document.querySelectorAll('.share-option-btn').forEach(btn => {
          btn.onclick = async () => {
            const shareData = {
              files: [file],
              title: `I'm on a ${streakDaysEl.textContent}-day streak!`,
              text: `I just hit a ${streakDaysEl.textContent}-day food logging streak on FoodTracker! 🔥`,
            };
            if (navigator.canShare && navigator.canShare(shareData)) {
              await navigator.share(shareData);
            } else {
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = file.name;
              document.body.appendChild(a);
              a.click();
              a.remove();
              setTimeout(() => URL.revokeObjectURL(a.href), 1500);
              alert('Image downloaded! You can share it manually from your gallery.');
            }
          };
        });

      } catch (err) {
        // kalau ada masalah render
        spinner.style.display = 'none';
        previewContainer.innerHTML =
          '<p class="text-sm text-white/80 py-8">Could not generate image.</p>';
      }
    });
  }
  bindShareOnce();

  // ====== Tampilkan popup streak ======
  const showStreakPopup = (streakCount) => {
    if (!streakPopupWrapper) return;

    streakDaysEl.textContent = streakCount;
    openStreakModal();

    // kasih sedikit delay supaya layout settle, baru tembak confetti
    setTimeout(launchConfettiInApp, 50);

    const closePopup = () => closeStreakModal();
    closeStreakBtn.onclick = closePopup;
    streakOverlay.onclick = closePopup;
  };

  // Close preview interactions
  closePreviewBtn.onclick = closePreviewSheet;
  previewOverlay.addEventListener('click', (e) => {
    if (e.target === previewOverlay) closePreviewSheet();
  });
  document.addEventListener('keydown', (ev) => {
    if (!previewOverlay.classList.contains('hidden') && ev.key === 'Escape') {
      closePreviewSheet();
    }
  });

  // ====== Render by date ======
  const loadAndDisplayFoodForDate = (date) => {
    const dateKey = formatDateKey(date);
    const dailyFood = getFoodForDate(dateKey);
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

    mealTypes.forEach(meal => {
      const cardBody = document.getElementById(`${meal}-card-body`);
      if (!cardBody) return;

      cardBody.innerHTML = '';
      const list = dailyFood[meal];
      if (list && list.length > 0) {
        list.forEach(food => {
          const el = createFoodElement(food);
          cardBody.appendChild(el);
        });
      } else {
        cardBody.innerHTML = `<div class="text-center text-gray-500 py-6 bg-white/20 rounded-lg"><p class="text-sm">No ${meal} logged yet.</p></div>`;
      }
    });

    updateTotalCalories();
    updateDateDisplay();
  };

  // ====== Navigasi hari ======
  if (prevDayButton) prevDayButton.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    loadAndDisplayFoodForDate(currentDate);
  });
  if (nextDayButton) nextDayButton.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    loadAndDisplayFoodForDate(currentDate);
  });

  // ====== Ambil item baru dari add-food.html ======
  const processNewFood = () => {
    const newFoodJSON = sessionStorage.getItem('newlyAddedFood');
    if (!newFoodJSON) return;

    const newFood = JSON.parse(newFoodJSON);
    newFood.id = `food-${Date.now()}`;
    const dateKey = formatDateKey(currentDate);

    let dailyFood = getFoodForDate(dateKey);
    if (dailyFood[newFood.meal]) {
      dailyFood[newFood.meal].push(newFood);
      saveFoodForDate(dateKey, dailyFood);
      updateStreak();           // ← ini yang memicu popup + confetti
    }

    sessionStorage.removeItem('newlyAddedFood');
    loadAndDisplayFoodForDate(currentDate);
  };

  // ====== Init ======
  processNewFood();
  loadAndDisplayFoodForDate(currentDate);
});
