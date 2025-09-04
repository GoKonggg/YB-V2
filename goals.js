// File: goals.js (Revised with New UI Logic)
document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS (with new elements) ---
    const calorieGoalInput = document.getElementById('calorie-goal-input');
    if (!calorieGoalInput) return; // Exit if main element isn't found

    const tabProgress = document.getElementById('tab-progress');
    const tabEdit = document.getElementById('tab-edit');
    const progressContent = document.getElementById('progress-content');
    const editContent = document.getElementById('edit-content');
    const saveButtonWrapper = document.getElementById('save-button-wrapper');

    // New selectors for calorie stepper
    const decrementBtn = document.getElementById('decrement-calories');
    const incrementBtn = document.getElementById('increment-calories');

    // New selector for donut chart
    const calorieCircle = document.getElementById('calories-circle');
    const circumference = calorieCircle.r.baseVal.value * 2 * Math.PI;
    calorieCircle.style.strokeDasharray = circumference;

    const sliders = { carbs: document.getElementById('carbs-slider'), protein: document.getElementById('protein-slider'), fat: document.getElementById('fat-slider') };
    const percentDisplays = { carbs: document.getElementById('carbs-percent'), protein: document.getElementById('protein-percent'), fat: document.getElementById('fat-percent') };
    const editGramDisplays = { carbs: document.getElementById('edit-carbs-grams'), protein: document.getElementById('edit-protein-grams'), fat: document.getElementById('edit-fat-grams') };
    const saveButton = document.getElementById('save-goals-btn');
    
    const progressDisplays = {
        calories: { consumed: document.getElementById('calories-consumed'), goal: document.getElementById('calories-goal-display') },
        carbs: { consumed: document.getElementById('carbs-consumed'), goal: document.getElementById('carbs-goal'), bar: document.getElementById('carbs-progress') },
        protein: { consumed: document.getElementById('protein-consumed'), goal: document.getElementById('protein-goal'), bar: document.getElementById('protein-progress') },
        fat: { consumed: document.getElementById('fat-consumed'), goal: document.getElementById('fat-goal'), bar: document.getElementById('fat-progress') }
    };

    // --- TAB SWITCHING LOGIC (No changes needed here) ---
    const switchTab = (tab) => {
        if (tab === 'progress') {
            progressContent.classList.remove('hidden');
            editContent.classList.add('hidden');
            saveButtonWrapper.classList.add('hidden');
            tabProgress.classList.add('border-pink-500', 'text-pink-500');
            tabEdit.classList.remove('border-pink-500', 'text-pink-500');
            renderProgressView();
        } else { // 'edit'
            progressContent.classList.add('hidden');
            editContent.classList.remove('hidden');
            saveButtonWrapper.classList.remove('hidden');
            tabProgress.classList.remove('border-pink-500', 'text-pink-500');
            tabEdit.classList.add('border-pink-500', 'text-pink-500');
        }
    };

    // --- DATA CALCULATION (No changes needed here) ---
    const getTodaysConsumed = () => {
        const today = new Date().toISOString().split('T')[0];
        const allFoodData = JSON.parse(localStorage.getItem('allFoodData')) || {};
        const todaysFood = allFoodData[today] || { breakfast: [], lunch: [], dinner: [], snack: [] };
        const totals = { calories: 0, carbs: 0, protein: 0, fat: 0 };
        for (const meal in todaysFood) {
            todaysFood[meal].forEach(food => {
                totals.calories += food.calories || 0;
                totals.carbs += food.macros ? food.macros.carbs : (food.carbs || 0);
                totals.protein += food.macros ? food.macros.protein : (food.protein || 0);
                totals.fat += food.macros ? food.macros.fat : (food.fat || 0);
            });
        }
        return totals;
    };
    
    // --- RENDER PROGRESS VIEW (UPDATED FOR DONUT CHART) ---
    const renderProgressView = () => {
        const consumed = getTodaysConsumed();
        const calorieGoal = parseInt(localStorage.getItem('calorieGoal')) || 1836;
        const macroGoalsPercent = JSON.parse(localStorage.getItem('macroGoals')) || { carbs: 40, protein: 30, fat: 30 };

        const macroGoalsGrams = {
            carbs: Math.round((calorieGoal * macroGoalsPercent.carbs / 100) / 4),
            protein: Math.round((calorieGoal * macroGoalsPercent.protein / 100) / 4),
            fat: Math.round((calorieGoal * macroGoalsPercent.fat / 100) / 9)
        };

        // Update calorie text
        progressDisplays.calories.consumed.textContent = Math.round(consumed.calories);
        progressDisplays.calories.goal.textContent = calorieGoal;
        
        // Update donut chart
        const calorieProgress = calorieGoal > 0 ? Math.min((consumed.calories / calorieGoal), 1) : 0;
        const offset = circumference - calorieProgress * circumference;
        calorieCircle.style.strokeDashoffset = offset;

        // Update macro bars (no change)
        for (const macro of ['carbs', 'protein', 'fat']) {
            const goalInGrams = macroGoalsGrams[macro];
            progressDisplays[macro].consumed.textContent = Math.round(consumed[macro]);
            progressDisplays[macro].goal.textContent = goalInGrams;
            if(progressDisplays[macro].bar) {
                progressDisplays[macro].bar.style.width = goalInGrams > 0 ? `${Math.min((consumed[macro] / goalInGrams) * 100, 100)}%` : '0%';
            }
        }
    };

    // --- EDIT TAB LOGIC (No changes needed here) ---
    const updateEditUI = () => {
        const totalCalories = parseInt(calorieGoalInput.value) || 0;
        const percentages = { carbs: parseInt(sliders.carbs.value), protein: parseInt(sliders.protein.value), fat: parseInt(sliders.fat.value) };
        
        Object.keys(percentages).forEach(key => {
            percentDisplays[key].textContent = percentages[key];
        });
        
        editGramDisplays.carbs.textContent = `${Math.round((totalCalories * percentages.carbs / 100) / 4)}g`;
        editGramDisplays.protein.textContent = `${Math.round((totalCalories * percentages.protein / 100) / 4)}g`;
        editGramDisplays.fat.textContent = `${Math.round((totalCalories * percentages.fat / 100) / 9)}g`;
    };

    const handleSliderInput = (changedSliderKey) => {
        let total = Object.values(sliders).reduce((sum, s) => sum + parseInt(s.value), 0);
        if (total === 100) {
            updateEditUI();
            return;
        }

        const diff = 100 - total;
        const otherSliders = Object.keys(sliders)
            .filter(k => k !== changedSliderKey)
            .map(k => sliders[k]);

        // A simpler balancing logic
        let adjusted = false;
        for (const slider of otherSliders) {
            let currentVal = parseInt(slider.value);
            if (currentVal - diff >= 0 && currentVal - diff <= 100) {
                slider.value = currentVal - diff;
                adjusted = true;
                break;
            }
        }
        if (!adjusted && otherSliders.length > 0) {
           let s1 = otherSliders[0];
           let s1_val = parseInt(s1.value);
           s1.value = s1_val - diff;
        }

        updateEditUI();
    };
    
    const loadGoalsForEdit = () => {
        const savedGoal = localStorage.getItem('calorieGoal') || 1836;
        const savedMacros = JSON.parse(localStorage.getItem('macroGoals')) || { carbs: 40, protein: 30, fat: 30 };
        calorieGoalInput.value = savedGoal;
        sliders.carbs.value = savedMacros.carbs;
        sliders.protein.value = savedMacros.protein;
        sliders.fat.value = savedMacros.fat;
        updateEditUI();
    };
    
    const saveGoals = () => {
        localStorage.setItem('calorieGoal', calorieGoalInput.value);
        const macroGoals = {
            carbs: parseInt(sliders.carbs.value),
            protein: parseInt(sliders.protein.value),
            fat: parseInt(sliders.fat.value)
        };
        localStorage.setItem('macroGoals', JSON.stringify(macroGoals));
        alert('Your goals have been saved!');
        switchTab('progress');
    };

    // --- EVENT LISTENERS (with new listeners) ---
    tabProgress.addEventListener('click', () => switchTab('progress'));
    tabEdit.addEventListener('click', () => switchTab('edit'));
    calorieGoalInput.addEventListener('input', updateEditUI);
    saveButton.addEventListener('click', saveGoals);
    
    // New listeners for calorie stepper
    decrementBtn.addEventListener('click', () => {
        calorieGoalInput.value = parseInt(calorieGoalInput.value) - 10;
        updateEditUI();
    });
    incrementBtn.addEventListener('click', () => {
        calorieGoalInput.value = parseInt(calorieGoalInput.value) + 10;
        updateEditUI();
    });
    
    // Simplified slider logic handler
    sliders.carbs.addEventListener('input', () => handleSliderInput('carbs'));
    sliders.protein.addEventListener('input', () => handleSliderInput('protein'));
    sliders.fat.addEventListener('input', () => handleSliderInput('fat'));

    // --- INITIALIZE ---
    loadGoalsForEdit(); 
    switchTab('progress');
});