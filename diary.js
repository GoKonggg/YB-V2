// File: diary.js
// Fungsi: Menampilkan dan mengelola makanan yang ditambahkan, dengan fitur swipe-to-delete langsung.

document.addEventListener('DOMContentLoaded', () => {
    const caloriesConsumedElement = document.getElementById('calories-consumed');
    if (!caloriesConsumedElement) return;

    // [DIUBAH] Ambil target kalori dari localStorage, atau gunakan nilai default
    const savedGoal = localStorage.getItem('calorieGoal');
    const totalCaloriesGoal = savedGoal ? parseInt(savedGoal, 10) : 1836;

    // [BARU] Perbarui tampilan target kalori di UI
    const caloriesGoalElement = document.getElementById('calories-goal');
    if (caloriesGoalElement) {
        caloriesGoalElement.textContent = `/ ${totalCaloriesGoal}`;
    }

    const updateTotalCalories = () => {
        let total = 0;
        document.querySelectorAll('.food-item-wrapper').forEach(item => {
            total += parseInt(item.dataset.calories, 10);
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
                    <p class="font-semibold text-gray-700">${foodData.calories} kal</p>
                    <p class="text-xs text-gray-500">${foodData.time || ''}</p>
                </div>
            </div>
        `;
        addSwipeToDelete(wrapper);
        return wrapper;
    };
    
    // Logika Swipe-to-Delete Langsung
    const addSwipeToDelete = (element) => {
        let startX = 0;
        let currentX = 0;
        let isSwiping = false;
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
                deleteItem(element);
            } else {
                content.style.transform = 'translateX(0)';
                deleteAction.style.opacity = '0';
            }
        });
    };

    // Fungsi untuk menghapus item dengan animasi
    const deleteItem = (element) => {
        const cardBody = element.parentElement;
        
        element.style.maxHeight = '0px';
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.remove();
            updateTotalCalories();

            if (cardBody.children.length === 0) {
                 const mealType = cardBody.id.split('-')[0];
                 cardBody.innerHTML = `<div class="text-center text-gray-500 py-6 bg-white/20 rounded-lg"><p class="text-sm">No ${mealType} logged yet.</p></div>`;
            }
        }, 400);
    };

    const processNewFood = () => {
        const newFoodJSON = sessionStorage.getItem('newlyAddedFood');
        if (newFoodJSON) {
            const newFood = JSON.parse(newFoodJSON);
            const cardBody = document.getElementById(`${newFood.meal}-card-body`);
            
            if (cardBody) {
                const placeholder = cardBody.querySelector('.text-center');
                if (placeholder) placeholder.remove();

                const foodElement = createFoodElement(newFood);
                cardBody.appendChild(foodElement);
                
                updateTotalCalories();
                sessionStorage.removeItem('newlyAddedFood');
            }
        }
    };

    processNewFood();
    updateTotalCalories();
});

