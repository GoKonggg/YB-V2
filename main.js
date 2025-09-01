// File: main.js

document.addEventListener('DOMContentLoaded', () => {
    
    // =================================================================
    // LOGIKA UMUM (NAVBAR & MENU)
    // =================================================================
    const plusButton = document.getElementById('plus-button');
    const plusMenu = document.getElementById('plus-menu');

    if (plusButton && plusMenu) {
        plusButton.addEventListener('click', (event) => {
            event.stopPropagation();
            plusMenu.classList.toggle('hidden');
        });

        window.addEventListener('click', () => {
            if (!plusMenu.classList.contains('hidden')) {
                plusMenu.classList.add('hidden');
            }
        });
    }

    // =================================================================
    // LOGIKA KHUSUS UNTUK HALAMAN add-food.html
    // =================================================================
    const foodListContainer = document.getElementById('food-list');
    if (foodListContainer) {
        
        const urlParams = new URLSearchParams(window.location.search);
        const mealType = urlParams.get('meal') || 'breakfast';

        const activeTab = document.getElementById(`tab-${mealType}`);
        if (activeTab) {
            activeTab.classList.add('bg-pink-500', 'text-white', 'shadow');
            activeTab.classList.remove('text-gray-500');
        }

        const foods = [
            { name: 'Chicken Breast', calories: 165, serving: '100 gr', carbs: 0, fat: 3.6, protein: 31 },
            { name: 'Brown Rice', calories: 111, serving: '1 cup', carbs: 23, fat: 0.9, protein: 2.6 },
            { name: 'Broccoli', calories: 55, serving: '1 cup', carbs: 11, fat: 0.6, protein: 3.7 },
            { name: 'Salmon', calories: 208, serving: '100 gr', carbs: 0, fat: 13, protein: 20 },
            { name: 'Avocado', calories: 160, serving: '1/2 fruit', carbs: 9, fat: 15, protein: 2 },
            { name: 'Egg', calories: 78, serving: '1 large', carbs: 0.6, fat: 5, protein: 6 },
            { name: 'Oatmeal, cooked', calories: 158, serving: '1 cup', carbs: 27.3, fat: 2.6, protein: 5.3 }
        ];

        let foodListHTML = '<div class="space-y-3">';
        foods.forEach(food => {
            const urlEncodedName = encodeURIComponent(food.name);
            const urlEncodedServing = encodeURIComponent(food.serving);
            
            foodListHTML += `
                <div class="food-item flex items-center justify-between p-3 rounded-lg bg-white/50">
                    <div>
                        <p class="font-bold text-gray-800">${food.name}</p>
                        <p class="text-sm text-gray-500">${food.calories} kal, ${food.serving}</p>
                    </div>
                    <a href="add-food-details.html?meal=${mealType}&name=${urlEncodedName}&calories=${food.calories}&serving=${urlEncodedServing}&carbs=${food.carbs}&fat=${food.fat}&protein=${food.protein}" class="add-food-btn p-2 text-pink-500 rounded-full hover:bg-pink-100">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </a>
                </div>
            `;
        });
        foodListHTML += '</div>';
        foodListContainer.innerHTML = foodListHTML;
    }

    // =================================================================
    // LOGIKA KHUSUS UNTUK HALAMAN add-food-details.html
    // =================================================================
    const saveFoodBtn = document.getElementById('save-food-btn');
    if(saveFoodBtn) {
        const urlParams = new URLSearchParams(window.location.search);
        
        const meal = urlParams.get('meal');
        const name = decodeURIComponent(urlParams.get('name'));
        const calories = parseInt(urlParams.get('calories'));
        const serving = decodeURIComponent(urlParams.get('serving'));
        const carbs = parseFloat(urlParams.get('carbs'));
        const fat = parseFloat(urlParams.get('fat'));
        const protein = parseFloat(urlParams.get('protein'));

        document.getElementById('food-name').textContent = name;
        document.getElementById('food-serving').textContent = serving;
        document.getElementById('meal-type').textContent = meal;
        document.getElementById('food-calories').textContent = calories;
        document.getElementById('food-carbs').textContent = carbs + ' g';
        document.getElementById('food-fat').textContent = fat + ' g';
        document.getElementById('food-protein').textContent = protein + ' g';
        document.getElementById('back-link').href = `add-food.html?meal=${meal}`;
        
        // --- MODIFIKASI DIMULAI DI SINI ---
        const timeDisplay = document.getElementById('food-time');
        const now = new Date();
        
        // Logika untuk format 12 jam AM/PM
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Jam '0' harus menjadi '12'
        const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
        
        // Tampilkan waktu yang sudah diformat
        timeDisplay.textContent = formattedTime;
        // --- MODIFIKASI SELESAI ---

        // Update Lingkaran Kalori
        const caloriesFromCarbs = carbs * 4;
        const caloriesFromFat = fat * 9;
        const caloriesFromProtein = protein * 4;
        const totalMacroCalories = caloriesFromCarbs + caloriesFromFat + caloriesFromProtein || 1;

        const carbsPercent = (caloriesFromCarbs / totalMacroCalories) * 100;
        const fatPercent = (caloriesFromFat / totalMacroCalories) * 100;
        const proteinPercent = (caloriesFromProtein / totalMacroCalories) * 100;

        const carbsArc = document.querySelector('#carbs-arc circle');
        const fatArc = document.querySelector('#fat-arc circle');
        const proteinArc = document.querySelector('#protein-arc circle');

        let accumulatedPercent = 0;
        
        carbsArc.style.strokeDasharray = `${carbsPercent} 100`;
        accumulatedPercent += carbsPercent;

        fatArc.style.strokeDasharray = `${fatPercent} 100`;
        fatArc.style.strokeDashoffset = -accumulatedPercent;
        accumulatedPercent += fatPercent;
        
        proteinArc.style.strokeDasharray = `${proteinPercent} 100`;
        proteinArc.style.strokeDashoffset = -accumulatedPercent;

        saveFoodBtn.addEventListener('click', () => {
            const foodData = { name, calories, serving, meal, time: formattedTime }; // Simpan waktu yang sudah diformat
            sessionStorage.setItem('newlyAddedFood', JSON.stringify(foodData));
            window.location.href = 'diary.html';
        });
    }

    // =================================================================
    // LOGIKA KHUSUS UNTUK HALAMAN diary.html
    // =================================================================
    const caloriesConsumedElement = document.getElementById('calories-consumed');
    if (caloriesConsumedElement) {

        const newFoodJSON = sessionStorage.getItem('newlyAddedFood');

        if (newFoodJSON) {
            const newFood = JSON.parse(newFoodJSON);
            const cardBody = document.getElementById(`${newFood.meal}-card-body`);
            
            if (cardBody) {
                const placeholder = cardBody.querySelector('.text-center');
                if (placeholder) {
                    placeholder.remove();
                }

                const foodElement = document.createElement('div');
                foodElement.className = 'flex justify-between items-center text-sm p-2 bg-white/30 rounded-lg';
                foodElement.innerHTML = `
                    <div>
                        <p class="font-semibold text-gray-800">${newFood.name}</p>
                        <p class="text-xs text-gray-500">${newFood.serving}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold text-gray-700">${newFood.calories} kal</p>
                        <p class="text-xs text-gray-500">${newFood.time}</p>
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
    }
});