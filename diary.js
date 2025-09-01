// File: diary.js
// Fungsi: Menampilkan makanan yang baru ditambahkan di halaman Diary.

document.addEventListener('DOMContentLoaded', () => {
    const caloriesConsumedElement = document.getElementById('calories-consumed');
    if (!caloriesConsumedElement) return; // Hanya berjalan di halaman diary

    const newFoodJSON = sessionStorage.getItem('newlyAddedFood');
    if (newFoodJSON) {
        const newFood = JSON.parse(newFoodJSON);
        const cardBody = document.getElementById(`${newFood.meal}-card-body`);
        
        if (cardBody) {
            const placeholder = cardBody.querySelector('.text-center');
            if (placeholder) placeholder.remove();

            const foodElement = document.createElement('div');
            foodElement.className = 'flex justify-between items-center text-sm p-2 bg-white/30 rounded-lg';
            foodElement.innerHTML = `
                <div>
                    <p class="font-semibold text-gray-800">${newFood.name}</p>
                    <p class="text-xs text-gray-500">${newFood.serving}</p>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-gray-700">${newFood.calories} kal</p>
                    <p class="text-xs text-gray-500">${newFood.time || ''}</p>
                </div>
            `;
            cardBody.appendChild(foodElement);

            let currentCalories = parseInt(caloriesConsumedElement.textContent, 10);
            currentCalories += newFood.calories;
            caloriesConsumedElement.textContent = currentCalories;
            
            const caloriesProgress = document.getElementById('calories-progress');
            const totalCaloriesGoal = 1836;
            const progressPercentage = (currentCalories / totalCaloriesGoal) * 100;
            caloriesProgress.style.width = `${Math.min(progressPercentage, 100)}%`;

            sessionStorage.removeItem('newlyAddedFood');
        }
    }
});