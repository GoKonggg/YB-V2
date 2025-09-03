// File: goals.js (Revised with Tabs and Corrected Slider Logic)
document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const calorieGoalInput = document.getElementById('calorie-goal-input');
    if (!calorieGoalInput) return;

    const tabProgress = document.getElementById('tab-progress');
    const tabEdit = document.getElementById('tab-edit');
    const progressContent = document.getElementById('progress-content');
    const editContent = document.getElementById('edit-content');
    const saveButtonWrapper = document.getElementById('save-button-wrapper');

    const sliders = { carbs: document.getElementById('carbs-slider'), protein: document.getElementById('protein-slider'), fat: document.getElementById('fat-slider') };
    const percentDisplays = { carbs: document.getElementById('carbs-percent'), protein: document.getElementById('protein-percent'), fat: document.getElementById('fat-percent') };
    const editGramDisplays = { carbs: document.getElementById('edit-carbs-grams'), protein: document.getElementById('edit-protein-grams'), fat: document.getElementById('edit-fat-grams') };
    const saveButton = document.getElementById('save-goals-btn');
    
    const progressDisplays = {
        calories: { consumed: document.getElementById('calories-consumed'), goal: document.getElementById('calories-goal-display'), bar: document.getElementById('calories-progress') },
        carbs: { consumed: document.getElementById('carbs-consumed'), goal: document.getElementById('carbs-goal'), bar: document.getElementById('carbs-progress') },
        protein: { consumed: document.getElementById('protein-consumed'), goal: document.getElementById('protein-goal'), bar: document.getElementById('protein-progress') },
        fat: { consumed: document.getElementById('fat-consumed'), goal: document.getElementById('fat-goal'), bar: document.getElementById('fat-progress') }
    };

    // --- TAB SWITCHING LOGIC ---
    const switchTab = (tab) => {
        if (tab === 'progress') {
            progressContent.classList.remove('hidden');
            editContent.classList.add('hidden');
            saveButtonWrapper.classList.add('hidden');
            tabProgress.classList.add('border-pink-500', 'text-pink-500');
            tabEdit.classList.remove('border-pink-500', 'text-pink-500');
            tabEdit.classList.add('border-transparent', 'text-gray-500');
            renderProgressView();
        } else { // 'edit'
            progressContent.classList.add('hidden');
            editContent.classList.remove('hidden');
            saveButtonWrapper.classList.remove('hidden');
            tabProgress.classList.remove('border-pink-500', 'text-pink-500');
            tabProgress.classList.add('border-transparent', 'text-gray-500');
            tabEdit.classList.add('border-pink-500', 'text-pink-500');
        }
    };

    // --- DATA CALCULATION ---
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
    
    // --- RENDER PROGRESS VIEW ---
    const renderProgressView = () => {
        const consumed = getTodaysConsumed();
        const calorieGoal = parseInt(localStorage.getItem('calorieGoal')) || 1836;
        const macroGoalsPercent = JSON.parse(localStorage.getItem('macroGoals')) || { carbs: 40, protein: 30, fat: 30 };

        const macroGoalsGrams = {
            carbs: Math.round((calorieGoal * macroGoalsPercent.carbs / 100) / 4),
            protein: Math.round((calorieGoal * macroGoalsPercent.protein / 100) / 4),
            fat: Math.round((calorieGoal * macroGoalsPercent.fat / 100) / 9)
        };

        progressDisplays.calories.consumed.textContent = consumed.calories;
        progressDisplays.calories.goal.textContent = calorieGoal;
        progressDisplays.calories.bar.style.width = calorieGoal > 0 ? `${Math.min((consumed.calories / calorieGoal) * 100, 100)}%` : '0%';

        for (const macro of ['carbs', 'protein', 'fat']) {
            const goalInGrams = macroGoalsGrams[macro];
            progressDisplays[macro].consumed.textContent = consumed[macro];
            progressDisplays[macro].goal.textContent = goalInGrams;
            progressDisplays[macro].bar.style.width = goalInGrams > 0 ? `${Math.min((consumed[macro] / goalInGrams) * 100, 100)}%` : '0%';
        }
    };

    // --- EDIT TAB LOGIC ---
    const updateEditUI = () => {
        const totalCalories = parseInt(calorieGoalInput.value) || 0;
        const percentages = { carbs: parseInt(sliders.carbs.value), protein: parseInt(sliders.protein.value), fat: parseInt(sliders.fat.value) };
        
        percentDisplays.carbs.textContent = percentages.carbs;
        percentDisplays.protein.textContent = percentages.protein;
        percentDisplays.fat.textContent = percentages.fat;
        
        editGramDisplays.carbs.textContent = `${Math.round((totalCalories * percentages.carbs / 100) / 4)}g`;
        editGramDisplays.protein.textContent = `${Math.round((totalCalories * percentages.protein / 100) / 4)}g`;
        editGramDisplays.fat.textContent = `${Math.round((totalCalories * percentages.fat / 100) / 9)}g`;
    };

    const handleSliderInput = (changedSliderKey) => {
        const changedSlider = sliders[changedSliderKey];
        const otherSliderKeys = Object.keys(sliders).filter(k => k !== changedSliderKey);
        
        const oldValue = parseInt(changedSlider.dataset.oldValue || changedSlider.value);
        const newValue = parseInt(changedSlider.value);
        const diff = oldValue - newValue;

        const otherSliders = otherSliderKeys.map(key => sliders[key]);
        otherSliders.sort((a, b) => (diff > 0 ? b.value - a.value : a.value - b.value));

        let remainingDiff = diff;
        
        for (const slider of otherSliders) {
            if (remainingDiff === 0) break;
            const currentVal = parseInt(slider.value);
            const adjustment = Math.round(remainingDiff / (otherSliders.filter(s => s !== slider).length + 1));
            
            let newVal = currentVal + adjustment;
            
            if (newVal < 0) {
                remainingDiff -= (0 - currentVal);
                slider.value = 0;
            } else if (newVal > 100) {
                remainingDiff -= (100 - currentVal);
                slider.value = 100;
            } else {
                slider.value = newVal;
                remainingDiff -= adjustment;
            }
        }

        let currentTotal = Object.values(sliders).reduce((sum, s) => sum + parseInt(s.value), 0);
        const finalDiff = 100 - currentTotal;
        
        if (finalDiff !== 0) {
            const sliderToAdjust = otherSliders.find(s => parseInt(s.value) + finalDiff >= 0 && parseInt(s.value) + finalDiff <= 100) || changedSlider;
            if (parseInt(sliderToAdjust.value) + finalDiff >=0 && parseInt(sliderToAdjust.value) + finalDiff <= 100) {
                 sliderToAdjust.value = parseInt(sliderToAdjust.value) + finalDiff;
            }
        }

        Object.values(sliders).forEach(s => s.dataset.oldValue = s.value);
        updateEditUI();
    };
    
    const loadGoalsForEdit = () => {
        const savedGoal = localStorage.getItem('calorieGoal') || 1836;
        const savedMacros = JSON.parse(localStorage.getItem('macroGoals')) || { carbs: 40, protein: 30, fat: 30 };
        calorieGoalInput.value = savedGoal;
        sliders.carbs.value = savedMacros.carbs;
        sliders.protein.value = savedMacros.protein;
        sliders.fat.value = savedMacros.fat;
        
        Object.values(sliders).forEach(s => s.dataset.oldValue = s.value);
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

    // --- EVENT LISTENERS ---
    tabProgress.addEventListener('click', () => switchTab('progress'));
    tabEdit.addEventListener('click', () => switchTab('edit'));
    calorieGoalInput.addEventListener('input', updateEditUI);
    
    Object.values(sliders).forEach(slider => {
        slider.addEventListener('mousedown', () => slider.dataset.oldValue = slider.value);
        slider.addEventListener('touchstart', () => slider.dataset.oldValue = slider.value);
    });

    sliders.carbs.addEventListener('input', () => handleSliderInput('carbs'));
    sliders.protein.addEventListener('input', () => handleSliderInput('protein'));
    sliders.fat.addEventListener('input', () => handleSliderInput('fat'));
    saveButton.addEventListener('click', saveGoals);

    // --- INITIALIZE ---
    loadGoalsForEdit(); 
    switchTab('progress');
});