document.addEventListener('DOMContentLoaded', () => {

    // --- MOCK DATA ---
    // In a real app, this would come from the previous page (e.g., via sessionStorage)
    const mockFoodData = {
        name: 'Chicken Breast',
        calories: 165,
        serving: '100 gr',
        protein: 31,
        fat: 3.6,
        carbs: 0
    };
    sessionStorage.setItem('selectedFood', JSON.stringify(mockFoodData));
    // --- END MOCK DATA ---


    // --- ELEMENT SELECTORS ---
    const foodNameEl = document.getElementById('food-name');
    const mealTypeEl = document.getElementById('meal-type');
    const foodTimeEl = document.getElementById('food-time');
    const foodServingEl = document.getElementById('food-serving');
    const servingsInput = document.querySelector('input[type="number"]');
    const foodCaloriesEl = document.getElementById('food-calories');
    const foodCarbsEl = document.getElementById('food-carbs');
    const foodFatEl = document.getElementById('food-fat');
    const foodProteinEl = document.getElementById('food-protein');
    const saveButton = document.getElementById('save-food-btn');

    const proteinArc = document.querySelector('#protein-arc circle');
    const fatArc = document.querySelector('#fat-arc circle');
    const carbsArc = document.querySelector('#carbs-arc circle');

    let baseFoodData = {};

    // --- INITIALIZATION ---
    function initializePage() {
        // 1. Get data passed from the previous page
        const selectedFoodJSON = sessionStorage.getItem('selectedFood');
        if (!selectedFoodJSON) {
            console.error("No food data found in session storage.");
            // Redirect or show an error
            return;
        }
        baseFoodData = JSON.parse(selectedFoodJSON);

        // 2. Get meal type from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const meal = urlParams.get('meal') || 'breakfast'; // Default to breakfast

        // 3. Set initial values on the page
        foodNameEl.textContent = baseFoodData.name;
        mealTypeEl.textContent = meal;
        foodServingEl.textContent = baseFoodData.serving;

        // Set current time
        const now = new Date();
        foodTimeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // 4. Perform initial calculation
        updateCalculations();

        // 5. Add event listeners
        servingsInput.addEventListener('input', updateCalculations);
        saveButton.addEventListener('click', saveFoodEntry);
    }

    // --- CORE LOGIC ---
    function updateCalculations() {
        const servings = parseFloat(servingsInput.value) || 0;

        const totalCalories = Math.round(baseFoodData.calories * servings);
        const totalCarbs = (baseFoodData.carbs * servings).toFixed(1);
        const totalFat = (baseFoodData.fat * servings).toFixed(1);
        const totalProtein = (baseFoodData.protein * servings).toFixed(1);

        // Update UI text
        foodCaloriesEl.textContent = totalCalories;
        foodCarbsEl.textContent = `${totalCarbs} g`;
        foodFatEl.textContent = `${totalFat} g`;
        foodProteinEl.textContent = `${totalProtein} g`;

        // Update the visual chart
        updateMacroChart(totalProtein, totalFat, totalCarbs);
    }

    function updateMacroChart(protein, fat, carbs) {
        protein = parseFloat(protein);
        fat = parseFloat(fat);
        carbs = parseFloat(carbs);

        const totalMacros = protein + fat + carbs;
        if (totalMacros === 0) {
            setArc(proteinArc, 0);
            setArc(fatArc, 0);
            setArc(carbsArc, 0);
            return;
        }

        const proteinPercent = (protein / totalMacros) * 100;
        const fatPercent = (fat / totalMacros) * 100;
        const carbsPercent = (carbs / totalMacros) * 100;

        const fatOffset = proteinPercent;
        const carbsOffset = proteinPercent + fatPercent;

        setArc(proteinArc, proteinPercent);
        setArc(fatArc, fatPercent, fatOffset);
        setArc(carbsArc, carbsPercent, carbsOffset);
    }

    function setArc(arcElement, percentage, offset = 0) {
        const circumference = 100; // Since stroke-dasharray is based on a 100-unit path
        arcElement.style.strokeDasharray = `${percentage} ${circumference}`;
        arcElement.style.strokeDashoffset = `-${offset}`;
    }

    function saveFoodEntry() {
        const finalServings = parseFloat(servingsInput.value) || 0;
        
        const newlyAddedFood = {
            name: baseFoodData.name,
            meal: mealTypeEl.textContent.toLowerCase(),
            time: foodTimeEl.textContent,
            serving: `${finalServings} x ${baseFoodData.serving}`,
            calories: Math.round(baseFoodData.calories * finalServings)
        };
        
        // Save to sessionStorage for the diary page to pick up
        sessionStorage.setItem('newlyAddedFood', JSON.stringify(newlyAddedFood));
        
        // Redirect to the diary page
        window.location.href = 'diary.html';
    }

    // --- RUN INITIALIZATION ---
    initializePage();
});
