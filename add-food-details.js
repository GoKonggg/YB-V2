document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // 1. SETUP & ELEMENT SELECTORS
    // ===================================================================
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

    // State Management
    let baseFoodData = {};
    let selectedUnit = {};
    let context = 'diary';
    let routineId = '';
    let mealType = 'breakfast';

    // ===================================================================
    // 2. INISIALISASI HALAMAN (LOGIKA UTAMA YANG BARU)
    // ===================================================================
    async function initializePage() {
        const urlParams = new URLSearchParams(window.location.search);
        
        context = urlParams.get('context') || 'diary';
        routineId = urlParams.get('routineId') || '';
        mealType = urlParams.get('meal') || 'breakfast';
        const foodId = urlParams.get('foodId');
        const customFoodName = decodeURIComponent(urlParams.get('name') || '');

        foodNameEl.textContent = 'Loading...';
        
        if (foodId) {
            // ALUR 1: Ambil data dari API jika ada foodId
            try {
                const response = await fetch(`https://yb-backend-omega.vercel.app/api/makanan/detail/${foodId}`);
                if (!response.ok) throw new Error('Failed to fetch food details');
                const apiData = await response.json();
                baseFoodData = transformFatSecretData(apiData);
                selectedUnit = baseFoodData.servingUnits.find(u => u.name === 'gram') || baseFoodData.servingUnits[0];
            } catch (error) {
                console.error("Error fetching food details:", error);
                alert("Could not load food details from the server.");
                foodNameEl.textContent = 'Error loading data';
                return;
            }
        } else if (customFoodName) {
            // ALUR 2: Fallback untuk custom food dari "My Food"
            const servingText = decodeURIComponent(urlParams.get('serving') || '1 serving');
            baseFoodData = {
                name: customFoodName,
                calories: parseFloat(urlParams.get('calories') || 0),
                protein: parseFloat(urlParams.get('protein') || 0),
                fat: parseFloat(urlParams.get('fat') || 0),
                carbs: parseFloat(urlParams.get('carbs') || 0),
                baseServingInGrams: 1,
                servingUnits: [{ "name": servingText, "gramWeight": 1 }]
            };
            selectedUnit = baseFoodData.servingUnits[0];
        } else {
            alert("No food specified.");
            foodNameEl.textContent = 'No food specified';
            return;
        }
        
        updateUIAfterDataLoad();
    }
    
    // ===================================================================
    // 3. FUNGSI-FUNGSI PEMBANTU
    // ===================================================================
    
    function transformFatSecretData(apiData) {
        const servings = Array.isArray(apiData.servings.serving) ? apiData.servings.serving : [apiData.servings.serving];
        const baseServing = servings.find(s => s.metric_serving_unit === 'g' && parseFloat(s.metric_serving_amount) === 100);
        const nutritionBase = baseServing || servings[0];
        const servingUnits = servings.map(s => ({ name: s.serving_description, gramWeight: parseFloat(s.metric_serving_amount) }));
        if (!servingUnits.some(u => u.name === 'gram')) {
            servingUnits.unshift({ name: 'gram', gramWeight: 1 });
        }
        return {
            id: apiData.food_id,
            name: apiData.food_name,
            calories: parseFloat(nutritionBase.calories),
            protein: parseFloat(nutritionBase.protein),
            fat: parseFloat(nutritionBase.fat),
            carbs: parseFloat(nutritionBase.carbohydrate),
            baseServingInGrams: parseFloat(nutritionBase.metric_serving_amount) || 1,
            servingUnits: servingUnits
        };
    }

    function updateUIAfterDataLoad() {
        backLink.href = `add-food.html?context=${context}&routineId=${routineId}&meal=${mealType}`;
        foodNameEl.textContent = baseFoodData.name;
        mealTypeText.textContent = mealType;
        foodTimeText.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        unitSelectorText.textContent = selectedUnit.name;
        createUnitSelectionModal();
        setupEventListeners();
        updateCalculations();
    }

    function setupEventListeners() {
        servingsAmountInput.addEventListener('input', updateCalculations);
        unitSelectorBtn.addEventListener('click', openUnitModal);
        saveButton.addEventListener('click', saveFoodEntry);
    }

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
                servingsAmountInput.value = 1;
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

    function updateCalculations() {
        const servings = parseFloat(servingsAmountInput.value) || 0;
        const getNutrientTotal = (nutrient) => {
            if (!baseFoodData.baseServingInGrams) return 0;
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
    
    function saveFoodEntry() {
        const finalServings = parseFloat(servingsAmountInput.value) || 0;
        if (finalServings <= 0) {
            alert("Please enter a valid number of servings.");
            return;
        }
        const getNutrientTotal = (nutrient) => {
            if (!baseFoodData.baseServingInGrams) return 0;
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

    // ===================================================================
    // 4. JALANKAN INISIALISASI
    // ===================================================================
    initializePage();
});