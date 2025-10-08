// File: diary.js (Versi Final - Tanpa AutoLogger)

document.addEventListener('DOMContentLoaded', () => {
    // Pastikan kita berada di halaman yang benar dengan memeriksa keberadaan salah satu elemen
    const dateDisplay = document.querySelector('h2.font-bold');
    if (!dateDisplay) return;

    const prevDayButton = dateDisplay.previousElementSibling;
    const nextDayButton = dateDisplay.nextElementSibling;
    let currentDate = new Date();

    const formatDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const updateDateDisplay = () => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        // Set tanggal hari ini ke format YYYY-MM-DD agar tidak terpengaruh timezone
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

    const caloriesConsumedElement = document.getElementById('calories-consumed');
    const savedGoal = localStorage.getItem('calorieGoal');
    const totalCaloriesGoal = savedGoal ? parseInt(savedGoal, 10) : 1836;
    const caloriesGoalElement = document.getElementById('calories-goal');
    if (caloriesGoalElement) {
        caloriesGoalElement.textContent = `/ ${totalCaloriesGoal}`;
    }

    const updateTotalCalories = () => {
        let total = 0;
        // Gunakan selector yang lebih spesifik untuk menghindari elemen lain
        const foodItems = document.querySelectorAll('#breakfast-card-body .food-item-wrapper, #lunch-card-body .food-item-wrapper, #dinner-card-body .food-item-wrapper, #snack-card-body .food-item-wrapper');
        foodItems.forEach(item => {
            const calories = parseInt(item.dataset.calories, 10);
            if (!isNaN(calories)) {
                total += calories;
            }
        });
        caloriesConsumedElement.textContent = total;
        const caloriesProgress = document.getElementById('calories-progress');
        const progressPercentage = (total / totalCaloriesGoal) * 100;
        caloriesProgress.style.width = `${Math.min(progressPercentage, 100)}%`;
    };

    const createFoodElement = (foodData) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'food-item-wrapper';
        wrapper.dataset.calories = foodData.calories;
        wrapper.dataset.id = foodData.id;

        wrapper.innerHTML = `
            <div class="delete-action">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
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

    const deleteItem = (element, mealType, foodId) => {
        const cardBody = element.parentElement;
        element.style.maxHeight = '0px';
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.remove();
            
            const dateKey = formatDateKey(currentDate);
            let dailyFood = getFoodForDate(dateKey);

            if (dailyFood[mealType]) {
                dailyFood[mealType] = dailyFood[mealType].filter(food => food.id !== foodId);
                saveFoodForDate(dateKey, dailyFood);
            }

            updateTotalCalories();

            if (cardBody.children.length === 0) {
                cardBody.innerHTML = `<div class="text-center text-gray-500 py-6 bg-white/20 rounded-lg"><p class="text-sm">No ${mealType} logged yet.</p></div>`;
            }
        }, 400);
    };

    const updateStreak = () => {
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];

    let streakCount = parseInt(localStorage.getItem('streakCount')) || 0;
    let lastLogDate = localStorage.getItem('lastLogDate');

    if (lastLogDate === todayKey) {
        // Jika sudah log hari ini, jangan lakukan apa-apa
        return; 
    }

    if (lastLogDate === yesterdayKey) {
        // Streak berlanjut
        streakCount++;
    } else {
        // Streak putus, mulai dari 1
        streakCount = 1;
    }

    localStorage.setItem('streakCount', streakCount);
    localStorage.setItem('lastLogDate', todayKey);
    
    // Panggil fungsi untuk menampilkan pop-up jika milestone tercapai
    checkStreakMilestone(streakCount);
};

    const processNewFood = () => {
        const newFoodJSON = sessionStorage.getItem('newlyAddedFood');
        if (newFoodJSON) {
            const newFood = JSON.parse(newFoodJSON);
            newFood.id = `food-${Date.now()}`;
            const dateKey = formatDateKey(currentDate);
            let dailyFood = getFoodForDate(dateKey);
            
            if (dailyFood[newFood.meal]) {
                dailyFood[newFood.meal].push(newFood);
                saveFoodForDate(dateKey, dailyFood);

                updateStreak();
            }
            
            sessionStorage.removeItem('newlyAddedFood');
            // Langsung panggil render ulang untuk tanggal saat ini
            loadAndDisplayFoodForDate(currentDate);
        }
    };

    // ... (di dalam diary.js)

const checkStreakMilestone = (streakCount) => {
    // Tampilkan pop-up jika streak adalah kelipatan 5, atau hari pertama
    if (streakCount === 1 || (streakCount > 0 && streakCount % 5 === 0)) {
        showStreakPopup(streakCount);
    }
}

// Ganti/update fungsi showStreakPopup yang tadi

const showStreakPopup = (streakCount) => {
    const overlay = document.getElementById('streak-overlay');
    const popup = document.getElementById('streak-popup');
    const streakDays = document.getElementById('streak-days');
    const closeBtn = document.getElementById('close-streak-btn');
    const shareBtn = document.getElementById('share-streak-btn');
    const shareableContent = document.getElementById('shareable-content'); // Div yang akan jadi gambar

    if (!popup) return;

    streakDays.textContent = streakCount;
    overlay.classList.remove('hidden');
    popup.classList.remove('hidden');

    confetti({
        particleCount: 150, // Jumlah partikel
        spread: 90,         // Seberapa lebar sebarannya
        origin: { y: 0.9 }  // Mulai dari bagian bawah layar
    });

    const closePopup = () => {
        overlay.classList.add('hidden');
        popup.classList.add('hidden');
    };

    closeBtn.onclick = closePopup;
    overlay.onclick = closePopup;

    shareBtn.onclick = async () => {
        try {
            const canvas = await html2canvas(shareableContent, { 
                backgroundColor: null, // Agar background transparan jika ada
                scale: 2 // Resolusi 2x lebih tinggi agar tidak pecah
            }); 
            
            canvas.toBlob(async (blob) => {
                const file = new File([blob], `streak-${streakCount}.png`, { type: 'image/png' });
                const shareData = {
                    files: [file],
                    title: `I'm on a ${streakCount}-day streak!`,
                    text: `I just hit a ${streakCount}-day food logging streak on FoodTracker! 🔥`,
                };

                // Cek apakah browser mendukung Web Share API untuk file
                if (navigator.canShare && navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                } else {
                    // Fallback jika tidak bisa share: download gambar
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `streak-${streakCount}.png`;
                    link.click();
                    alert("Image downloaded! You can share it manually from your gallery.");
                }
            }, 'image/png');

        } catch (error) {
            console.error('Oops, something went wrong!', error);
            alert('Could not generate image to share.');
        }
    };
};
    
    const loadAndDisplayFoodForDate = (date) => {
        const dateKey = formatDateKey(date);
        const dailyFood = getFoodForDate(dateKey);
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
        
        mealTypes.forEach(meal => {
            const cardBody = document.getElementById(`${meal}-card-body`);
            if (cardBody) {
                cardBody.innerHTML = '';
                const foodList = dailyFood[meal];
                if (foodList && foodList.length > 0) {
                    foodList.forEach(foodData => {
                        const foodElement = createFoodElement(foodData);
                        cardBody.appendChild(foodElement);
                    });
                } else {
                    cardBody.innerHTML = `<div class="text-center text-gray-500 py-6 bg-white/20 rounded-lg"><p class="text-sm">No ${meal} logged yet.</p></div>`;
                }
            }
        });
        
        updateTotalCalories();
        updateDateDisplay();
    };

    prevDayButton.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        loadAndDisplayFoodForDate(currentDate);
    });

    nextDayButton.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 1);
        loadAndDisplayFoodForDate(currentDate);
    });

    // --- Inisialisasi Aplikasi ---
    processNewFood();
    loadAndDisplayFoodForDate(currentDate);
});