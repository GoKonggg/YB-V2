// File: add-food-details.js (Versi Final & Bersih)

document.addEventListener('DOMContentLoaded', () => {

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
    const backLink = document.getElementById('back-link');

    const proteinArc = document.querySelector('#protein-arc circle');
    const fatArc = document.querySelector('#fat-arc circle');
    const carbsArc = document.querySelector('#carbs-arc circle');

    // --- STATE MANAGEMENT ---
    let baseFoodData = {};
    let context = 'diary'; // Default context
    let routineId = '';
    let mealType = 'breakfast';

    // --- INITIALIZATION ---
    function initializePage() {
        // 1. Ambil semua data dari URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        context = urlParams.get('context') || 'diary';
        routineId = urlParams.get('routineId');
        mealType = urlParams.get('meal') || 'breakfast';

        // 2. Isi data dasar makanan dari URL
        baseFoodData = {
            name: urlParams.get('name') || 'Unknown Food',
            calories: parseFloat(urlParams.get('calories')) || 0,
            serving: urlParams.get('serving') || '1 serving',
            protein: parseFloat(urlParams.get('protein')) || 0,
            fat: parseFloat(urlParams.get('fat')) || 0,
            carbs: parseFloat(urlParams.get('carbs')) || 0
        };
        
        // 3. Atur link "Back" agar kembali ke halaman yang benar dengan konteks yang sama
        backLink.href = `add-food.html?context=${context}&routineId=${routineId}&meal=${mealType}`;

        // 4. Isi elemen-elemen di halaman dengan data awal
        foodNameEl.textContent = baseFoodData.name;
        mealTypeEl.textContent = mealType.charAt(0).toUpperCase() + mealType.slice(1);
        foodServingEl.textContent = baseFoodData.serving;
        foodTimeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // 5. Lakukan kalkulasi awal untuk 1 porsi
        updateCalculations();

        // 6. Tambahkan event listeners
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

        const fatOffset = proteinPercent;
        const carbsOffset = proteinPercent + fatPercent;

        setArc(proteinArc, proteinPercent);
        setArc(fatArc, fatPercent, fatOffset);
        setArc(carbsArc, 100 - proteinPercent - fatPercent, carbsOffset); // Gunakan sisa persentase untuk memastikan 100%
    }

    function setArc(arcElement, percentage, offset = 0) {
        const circumference = 100;
        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;
        arcElement.style.strokeDasharray = `${percentage} ${circumference}`;
        // CSS transform rotate(-90deg) sudah menangani titik awal, jadi offset tidak perlu diubah
        arcElement.style.strokeDashoffset = `-${offset}`;
    }
    
    // --- MAIN ACTION (SAVE) ---
    function saveFoodEntry() {
        const finalServings = parseFloat(servingsInput.value) || 0;
        if (finalServings <= 0) {
            alert("Please enter a valid number of servings.");
            return;
        }

        // Siapkan data makanan final
        const finalFoodData = {
            id: `food-${Date.now()}`,
            name: baseFoodData.name,
            calories: Math.round(baseFoodData.calories * finalServings),
            serving: `${finalServings} x ${baseFoodData.serving}`,
            protein: parseFloat((baseFoodData.protein * finalServings).toFixed(1)),
            fat: parseFloat((baseFoodData.fat * finalServings).toFixed(1)),
            carbs: parseFloat((baseFoodData.carbs * finalServings).toFixed(1))
        };
        
        // --- LOGIKA UTAMA BERDASARKAN KONTEKS ---
        if (context === 'routine') {
            // Jika konteksnya adalah rutinitas, kirim data kembali ke halaman editor
            sessionStorage.setItem('newRoutineFood', JSON.stringify(finalFoodData));
            window.location.href = `edit-routine.html?id=${routineId}`;
        } else {
            // Jika tidak (konteks 'diary'), kirim data ke diary seperti biasa
            finalFoodData.meal = mealType;
            finalFoodData.time = foodTimeEl.textContent;
            sessionStorage.setItem('newlyAddedFood', JSON.stringify(finalFoodData));
            window.location.href = 'diary.html';
        }
    }

    // --- RUN INITIALIZATION ---
    initializePage();
});