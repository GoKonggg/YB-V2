document.addEventListener('DOMContentLoaded', () => {

    // --- (NEW) SIMPLE FOOD DATABASE ---
    // We define nutritional info per 100 grams as a base
    const foodDatabase = {
        "Chicken Breast": {
            calories: 165,
            protein: 31,
            fat: 3.6,
            carbs: 0,
            baseServingInGrams: 100,
            servingUnits: [
                { "name": "gram", "gramWeight": 1 },
                { "name": "oz", "gramWeight": 28.35 },
                { "name": "serving (100g)", "gramWeight": 100 },
                { "name": "portion (172g)", "gramWeight": 172 } // Average weight of one breast
            ]
        },
        "Brown Rice": {
            calories: 123, // cooked
            protein: 2.6,
            fat: 0.9,
            carbs: 25.6,
            baseServingInGrams: 100,
            servingUnits: [
                { "name": "gram", "gramWeight": 1 },
                { "name": "cup (cooked)", "gramWeight": 195 },
                { "name": "oz (cooked)", "gramWeight": 28.35 }
            ]
        },
        "Broccoli": {
            calories: 34,
            protein: 2.8,
            fat: 0.4,
            carbs: 7,
            baseServingInGrams: 100,
            servingUnits: [
                { "name": "gram", "gramWeight": 1 },
                { "name": "cup (chopped)", "gramWeight": 91 },
                { "name": "oz", "gramWeight": 28.35 }
            ]
        },
        "Salmon": {
            calories: 208,
            protein: 20,
            fat: 13,
            carbs: 0,
            baseServingInGrams: 100,
            servingUnits: [
                { "name": "gram", "gramWeight": 1 },
                { "name": "oz", "gramWeight": 28.35 },
                { "name": "fillet (170g)", "gramWeight": 170 }
            ]
        }
    };

    // --- ELEMENT SELECTORS (Same as before) ---
    const appContainer = document.getElementById('app-container');
    const foodNameEl = document.getElementById('food-name');
    const mealTypeText = document.getElementById('meal-type-text');
    const foodTimeText = document.getElementById('food-time-text');
    const servingsAmountInput = document.getElementById('servings-amount-input');
    const unitSelectorBtn = document.getElementById('unit-selector-btn');
    const unitSelectorText = document.getElementById('unit-selector-text');
    const saveButton = document.getElementById('save-food-btn');
    const backLink = document.getElementById('back-link');
    const foodCaloriesEl = document.getElementById('food-calories');
    const foodCarbsEl = document.getElementById('food-carbs');
    const foodFatEl = document.getElementById('food-fat');
    const foodProteinEl = document.getElementById('food-protein');
    const proteinArc = document.querySelector('#protein-arc circle');
    const fatArc = document.querySelector('#fat-arc circle');
    const carbsArc = document.querySelector('#carbs-arc circle');

    // --- STATE MANAGEMENT (Same as before) ---
    let baseFoodData = {};
    let context = 'diary';
    let routineId = '';
    let mealType = 'breakfast';
    let selectedUnit = {};

    // --- INITIALIZATION ---
    function initializePage() {
        const urlParams = new URLSearchParams(window.location.search);
        
        context = urlParams.get('context') || 'diary';
        routineId = urlParams.get('routineId') || '';
        mealType = urlParams.get('meal') || 'breakfast';

        const foodName = decodeURIComponent(urlParams.get('name') || 'No Name');
        const foodFromDB = foodDatabase[foodName];

        if (foodFromDB) {
            // If the food is found in our database, use its detailed data
            baseFoodData = foodFromDB;
            // The default unit is now 'gram' or the first logical unit
            selectedUnit = baseFoodData.servingUnits.find(u => u.name === 'gram') || baseFoodData.servingUnits[0];
        } else {
            // Fallback for custom foods (from "My Food")
            const servingText = decodeURIComponent(urlParams.get('serving') || '1 serving');
            baseFoodData = {
                name: foodName,
                calories: parseFloat(urlParams.get('calories') || 0),
                protein: parseFloat(urlParams.get('protein') || 0),
                fat: parseFloat(urlParams.get('fat') || 0),
                carbs: parseFloat(urlParams.get('carbs') || 0),
                baseServingInGrams: 1, // Set to 1 to make the calculation universal
                servingUnits: [{ "name": servingText, "gramWeight": 1 }]
            };
            selectedUnit = baseFoodData.servingUnits[0];
        }
        
        // Update UI
        backLink.href = `add-food.html?context=${context}&routineId=${routineId}&meal=${mealType}`;
        foodNameEl.textContent = foodName; // Use foodName from URL for consistency
        mealTypeText.textContent = mealType;
        foodTimeText.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        unitSelectorText.textContent = selectedUnit.name;
        
        createUnitSelectionModal();
        setupEventListeners();
        updateCalculations();
    }

    // --- EVENT LISTENERS (Same as before) ---
    function setupEventListeners() {
        servingsAmountInput.addEventListener('input', updateCalculations);
        unitSelectorBtn.addEventListener('click', openUnitModal);
        saveButton.addEventListener('click', saveFoodEntry);
    }

    // --- MODAL LOGIC (Same as before, now gets more data) ---
    function createUnitSelectionModal() {
        const backdrop = document.createElement('div');
        backdrop.id = 'unit-modal-backdrop';
        backdrop.className = 'absolute inset-0 bg-black bg-opacity-40 z-20 hidden rounded-2xl';
        const modal = document.createElement('div');
        modal.id = 'unit-modal';
        modal.className = 'absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 z-30 hidden transform translate-y-full transition-transform duration-300';
        modal.innerHTML = `<h3 class="text-lg font-bold text-center text-gray-800 mb-4">Select a Unit</h3><ul id="unit-list" class="divide-y divide-gray-200 max-h-60 overflow-y-auto"></ul>`;
        appContainer.appendChild(backdrop);
        appContainer.appendChild(modal);
        backdrop.addEventListener('click', closeUnitModal);
    }

    function openUnitModal() {
        const modal = document.getElementById('unit-modal');
        const backdrop = document.getElementById('unit-modal-backdrop');
        const unitList = document.getElementById('unit-list');
        unitSelectorBtn.classList.add('active');
        unitList.innerHTML = '';
        baseFoodData.servingUnits.forEach(unit => {
            const li = document.createElement('li');
            li.className = 'py-3 text-center text-gray-700 font-medium cursor-pointer hover:bg-gray-100';
            li.textContent = unit.name;
            li.addEventListener('click', () => {
                selectedUnit = unit;
                unitSelectorText.textContent = unit.name;
                servingsAmountInput.value = 1; // Reset serving amount to 1
                updateCalculations();
                closeUnitModal();
            });
            unitList.appendChild(li);
        });
        backdrop.classList.remove('hidden');
        modal.classList.remove('hidden');
        setTimeout(() => { modal.classList.remove('translate-y-full'); }, 10);
    }

    function closeUnitModal() {
        const modal = document.getElementById('unit-modal');
        const backdrop = document.getElementById('unit-modal-backdrop');
        unitSelectorBtn.classList.remove('active');
        modal.classList.add('translate-y-full');
        setTimeout(() => {
            modal.classList.add('hidden');
            backdrop.classList.add('hidden');
        }, 300);
    }

    // --- CORE LOGIC (Reverted to the universal calculation logic) ---
    function updateCalculations() {
        const servings = parseFloat(servingsAmountInput.value) || 0;
        const getNutrientTotal = (nutrient) => {
            if (baseFoodData.baseServingInGrams === 0) return 0;
            // Universal formula: (nutrient per base) / base size * selected unit size * number of servings
            return (nutrient / baseFoodData.baseServingInGrams) * selectedUnit.gramWeight * servings;
        };
        const totalCalories = Math.round(getNutrientTotal(baseFoodData.calories));
        const totalCarbs = getNutrientTotal(baseFoodData.carbs).toFixed(1);
        const totalFat = getNutrientTotal(baseFoodData.fat).toFixed(1);
        const totalProtein = getNutrientTotal(baseFoodData.protein).toFixed(1);

        foodCaloriesEl.textContent = totalCalories;
        foodCarbsEl.textContent = `${totalCarbs} g`;
        foodFatEl.textContent = `${totalFat} g`;
        foodProteinEl.textContent = `${totalProtein} g`;
        updateMacroChart(totalProtein, totalFat, totalCarbs);
    }
    
    // --- MAIN ACTION (SAVE) (Using the same universal calculation) ---
    function saveFoodEntry() {
        const finalServings = parseFloat(servingsAmountInput.value) || 0;
        if (finalServings <= 0) {
            alert("Please enter a valid number of servings.");
            return;
        }
        const getNutrientTotal = (nutrient) => {
            if (baseFoodData.baseServingInGrams === 0) return 0;
            return (nutrient / baseFoodData.baseServingInGrams) * selectedUnit.gramWeight * finalServings;
        };
        const finalFoodData = {
            id: `food-${Date.now()}`,
            name: baseFoodData.name,
            calories: Math.round(getNutrientTotal(baseFoodData.calories)),
            serving: `${finalServings} x ${selectedUnit.name}`,
            protein: parseFloat(getNutrientTotal(baseFoodData.protein).toFixed(1)),
            fat: parseFloat(getNutrientTotal(baseFoodData.fat).toFixed(1)),
            carbs: parseFloat(getNutrientTotal(baseFoodData.carbs).toFixed(1))
        };
        
        if (context === 'routine') {
            sessionStorage.setItem('newRoutineFood', JSON.stringify(finalFoodData));
            window.location.href = `edit-routine.html?id=${routineId}`;
        } else {
            finalFoodData.meal = mealType;
            finalFoodData.time = foodTimeText.textContent;
            sessionStorage.setItem('newlyAddedFood', JSON.stringify(finalFoodData));
            window.location.href = 'diary.html';
        }
    }

    // --- CHART LOGIC (UNCHANGED) ---
    function updateMacroChart(protein, fat, carbs) {
        protein = parseFloat(protein); fat = parseFloat(fat); carbs = parseFloat(carbs);
        const totalMacros = protein + fat + carbs;
        if (totalMacros === 0) {
            setArc(proteinArc, 0); setArc(fatArc, 0); setArc(carbsArc, 0);
            return;
        }
        const proteinPercent = (protein / totalMacros) * 100;
        const fatPercent = (fat / totalMacros) * 100;
        setArc(proteinArc, proteinPercent);
        setArc(fatArc, fatPercent, proteinPercent);
        setArc(carbsArc, 100 - proteinPercent - fatPercent, proteinPercent + fatPercent);
    }

    function setArc(arcElement, percentage, offset = 0) {
        const circumference = 100;
        percentage = Math.max(0, Math.min(percentage, 100));
        arcElement.style.strokeDasharray = `${percentage} ${circumference}`;
        arcElement.style.strokeDashoffset = `-${offset}`;
    }

    // --- RUN INITIALIZATION ---
    initializePage();
});