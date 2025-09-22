// State Management
let currentScreenIndex = 0;
const userData = {
    goal: null,
    gender: null,
    dob: null,
    height: null,
    current_weight: null,
    activity: null,
    pace: null, 
};

// --- Calculation Helper Functions ---

function getAge(dob) {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function calculateBMR(data) {
    const { gender, dob, height, current_weight } = data;
    if (!gender || !dob || !height || !current_weight) return 0;
    const age = getAge(dob);
    if (gender === 'male') {
        return (10 * current_weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        return (10 * current_weight) + (6.25 * height) - (5 * age) - 161;
    }
}

function calculateTDEE(bmr, activity) {
    const activityMultipliers = {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderately_active: 1.55,
        very_active: 1.725,
        extra_active: 1.9,
    };
    return bmr * (activityMultipliers[activity] || 1);
}


// --- Core Navigation & UI Functions ---

function selectOption(key, value, element) {
    userData[key] = value;
    const parent = element.parentElement;
    const options = parent.querySelectorAll('.option-card');
    options.forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    const nextButton = document.getElementById(`btn-screen-${currentScreenIndex}`);
    if (nextButton) {
        nextButton.disabled = false;
    }
}

function nextScreen() {
    if (!validateScreen(currentScreenIndex)) return;
    saveScreenData(currentScreenIndex);

    const goal = userData.goal;
    let nextScreenNumber = currentScreenIndex + 1;

    if (currentScreenIndex === 3) {
        if (goal === 'maintain_weight') {
            nextScreenNumber = 6;
        } else {
            generatePaceScreen();
            nextScreenNumber = 4;
        }
    } else if (currentScreenIndex === 4) {
        nextScreenNumber = 6;
    }

    if (nextScreenNumber === 6) {
        showResult();
    }

    showScreen(nextScreenNumber);
}

function prevScreen() {
    if (currentScreenIndex <= 1) return;
    let prevScreenNumber = currentScreenIndex - 1;
    if (currentScreenIndex === 6) {
         prevScreenNumber = userData.goal === 'maintain_weight' ? 3 : 4;
    } else if (currentScreenIndex === 4) {
        prevScreenNumber = 3;
    }
    showScreen(prevScreenNumber);
}

function showScreen(screenNumber) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
        screen.classList.remove('visible');
    });
    const targetScreen = document.getElementById(`screen-${screenNumber}`);
    if(targetScreen) {
        targetScreen.classList.remove('hidden');
        targetScreen.classList.add('visible');
    }
    const progressContainer = document.getElementById('progress-container');
    if (screenNumber >= 1 && screenNumber < 6) {
        progressContainer.classList.remove('hidden');
    } else {
        progressContainer.classList.add('hidden');
    }
    currentScreenIndex = screenNumber;
    updateProgressBar();
}

function updateProgressBar() {
    const totalOnboardingScreens = 5;
    let step = currentScreenIndex;
    if (step < 1) {
        document.getElementById('progress-bar').style.width = `0%`;
        return;
    }
    if (step > totalOnboardingScreens) {
        step = totalOnboardingScreens;
    }
    const progress = (step / totalOnboardingScreens) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

function validateScreen(screenNumber) {
    if (screenNumber === 2) {
        const day = document.getElementById('dob-day').value;
        const month = document.getElementById('dob-month').value;
        const year = document.getElementById('dob-year').value;
        const height = document.getElementById('height').value;
        const weight = document.getElementById('current_weight').value;
        if (!userData.gender || !day || !month || !year || !height || !weight) {
            alert('Please fill in all your details.');
            return false;
        }
    }
    if (screenNumber === 4) {
        if (userData.pace === null || userData.pace <= 0) {
            alert('Please select a pace or enter a valid custom goal.');
            return false;
        }
    }
    return true;
}

function saveScreenData(screenNumber) {
    if (screenNumber === 2) {
        const day = document.getElementById('dob-day').value.padStart(2, '0');
        const month = document.getElementById('dob-month').value.padStart(2, '0');
        const year = document.getElementById('dob-year').value;
        userData.dob = `${year}-${month}-${day}`;
        userData.height = parseFloat(document.getElementById('height').value);
        userData.current_weight = parseFloat(document.getElementById('current_weight').value);
    }
}


// --- Pace Screen Generation & Logic (Screen 4) ---

// [DIUBAH] Fungsi ini dirombak untuk menampilkan BMR dan feedback real-time
function generatePaceScreen() {
    const screen4 = document.getElementById('screen-4');
    const { goal, activity } = userData;
    
    const bmr = calculateBMR(userData);
    const tdee = calculateTDEE(bmr, activity);

    let presets, title, description, unit;
    if (goal === 'fat_loss') {
        title = "Set Your Weekly Goal";
        description = "Select a sustainable pace for fat loss.";
        presets = [0.25, 0.5, 0.75];
        unit = "kg/week";
    } else {
        title = "Set Your Weekly Goal";
        description = "Select a pace for lean muscle gain.";
        presets = [0.2, 0.4, 0.6];
        unit = "kg/week";
    }

    const presetButtons = presets.map(p => 
        `<div onclick="selectPacePreset(${p}, this)" class="option-card text-center glass-card p-4 rounded-xl cursor-pointer">
            <h3 class="font-semibold">${p} ${unit}</h3>
        </div>`
    ).join('');

    const content = `
        <div class="relative flex items-center justify-center mb-2 h-8">
            <button onclick="prevScreen()" class="absolute left-0 text-gray-500 hover:text-gray-900 p-1 rounded-full hover:bg-white/50 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <h1 class="text-2xl font-bold">${title}</h1>
        </div>
        <p class="text-center text-gray-500 mb-4">${description}</p>
        
        <div class="glass-card p-4 rounded-xl mb-6 grid grid-cols-2 gap-4 text-center">
            <div>
                <p class="text-sm text-gray-600">Maintenance Calories</p>
                <p class="font-bold text-lg text-pink-500">${Math.round(tdee)} kcal</p>
            </div>
            <div>
                <p class="text-sm text-gray-600">Base Calories (BMR)</p>
                <p class="font-bold text-lg text-blue-500">${Math.round(bmr)} kcal</p>
            </div>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-6">
            ${presetButtons}
        </div>
        
        <div>
            <label for="custom-pace" class="font-semibold text-gray-800">Or set a custom goal (${unit}):</label>
            <input type="number" id="custom-pace" step="0.05" oninput="handleCustomPaceInput(this.value)" placeholder="e.g., 0.3" class="form-input-custom w-full p-3 rounded-lg mt-2">
        </div>
        
        <div id="calorie-target-feedback" class="hidden mt-4 p-3 bg-indigo-50 text-indigo-800 text-md rounded-lg text-center font-semibold">
        </div>
        
        <div id="bmr-warning" class="hidden mt-2 p-3 bg-red-100/50 text-red-700 text-sm rounded-lg text-center">
            <b>Warning:</b> This goal is too aggressive. Your calorie intake would be below your base metabolic rate (BMR), which is not recommended.
        </div>

        <a href="learn-more.html" onclick="goToLearnMore(event)" class="text-center block text-pink-500 text-sm mt-4 hover:underline">Learn more about TDEE & BMR</a>
        
        <button onclick="nextScreen()" id="btn-screen-4" class="w-full bg-primary-gradient text-white font-bold py-3 px-4 rounded-lg mt-8 hover:opacity-90 transition-opacity disabled:opacity-50" disabled>Continue</button>
    `;
    screen4.innerHTML = content;
}

function selectPacePreset(pace, element) {
    document.querySelectorAll('#screen-4 .option-card').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById('custom-pace').value = '';
    userData.pace = pace;
    updatePaceUIAndWarning();
}

function handleCustomPaceInput(value) {
    document.querySelectorAll('#screen-4 .option-card').forEach(opt => opt.classList.remove('selected'));
    const pace = parseFloat(value);
    userData.pace = pace > 0 ? pace : null;
    updatePaceUIAndWarning();
}

// [DIUBAH] Fungsi ini sekarang juga menghitung dan menampilkan feedback kalori
function updatePaceUIAndWarning() {
    const continueBtn = document.getElementById('btn-screen-4');
    const feedbackDiv = document.getElementById('calorie-target-feedback');
    const warningDiv = document.getElementById('bmr-warning');
    
    if (!userData.pace) {
        continueBtn.disabled = true;
        feedbackDiv.classList.add('hidden');
        warningDiv.classList.add('hidden');
        return;
    }
    
    continueBtn.disabled = false;
    
    const bmr = calculateBMR(userData);
    const tdee = calculateTDEE(bmr, userData.activity);
    let finalCalories = 0;

    if (userData.goal === 'fat_loss') {
        finalCalories = tdee - (userData.pace * 7000 / 7);
        if (finalCalories < bmr) {
            warningDiv.classList.remove('hidden');
        } else {
            warningDiv.classList.add('hidden');
        }
    } else { // muscle_gain
        finalCalories = tdee + (userData.pace * 3500 / 7);
        warningDiv.classList.add('hidden'); // No BMR warning for muscle gain
    }

    // [BARU] Update dan tampilkan feedback
    feedbackDiv.innerHTML = `Your Daily Calories will be ~<b>${Math.round(finalCalories)} kcal</b> / day`;
    feedbackDiv.classList.remove('hidden');
}

// --- Result Screen Logic (Screen 6) ---

function showResult() {
    const calculatingDiv = document.getElementById('calculating');
    const resultContentDiv = document.getElementById('result-content');
    calculatingDiv.style.display = 'flex';
    resultContentDiv.style.display = 'none';
    resultContentDiv.querySelectorAll('.fade-in-up').forEach(el => {
        el.classList.remove('fade-in-up');
        el.style.opacity = '0';
    });

    setTimeout(() => {
        const finalCalories = calculateFinalCalories();
        localStorage.setItem('calorieGoal', Math.round(finalCalories));
        const calorieEl = document.getElementById('calorie-result');
        animateCountUp(calorieEl, finalCalories);
        
        const actionsContainer = document.getElementById('result-actions');
        actionsContainer.innerHTML = `
            <button onclick="window.location.href='diary.html'" class="w-full bg-primary-gradient text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:opacity-90 transition-opacity">Start My Journey</button>
            <button onclick="window.location.href='marketplace.html?tab=coaches'" class="w-full glass-card text-pink-500 font-bold py-3 px-4 rounded-xl hover:bg-white/50 transition-colors">Consult a Coach</button>
        `;

        calculatingDiv.style.display = 'none';
        resultContentDiv.style.display = 'block';
        resultContentDiv.querySelectorAll('.opacity-0').forEach(el => {
            el.classList.add('fade-in-up');
        });
    }, 2000);
}

function calculateFinalCalories() {
    const { activity, goal, pace } = userData;
    const bmr = calculateBMR(userData);
    const tdee = calculateTDEE(bmr, activity);
    
    if (goal === 'fat_loss' && pace) {
        return tdee - (pace * 7000 / 7);
    } else if (goal === 'muscle_gain' && pace) {
        return tdee + (pace * 3500 / 7);
    }
    
    return tdee;
}

function animateCountUp(el, to) {
    const finalValue = Math.round(to);
    if (!el || isNaN(finalValue)) return;
    
    let from = 0;
    const duration = 1000;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    let currentFrame = 0;
    
    if (finalValue === 0) { el.textContent = 0; return; }
    const increment = finalValue / totalFrames;

    const timer = setInterval(() => {
        currentFrame++;
        from += increment;
        if (currentFrame >= totalFrames) {
            el.textContent = finalValue;
            clearInterval(timer);
        } else {
            el.textContent = Math.round(from);
        }
    }, frameDuration);
}

// --- Utility & State Functions ---

function goToLearnMore(event) {
    event.preventDefault();
    const currentState = {
        userData: userData,
        currentScreenIndex: currentScreenIndex
    };
    sessionStorage.setItem('onboardingState', JSON.stringify(currentState));
    window.location.href = 'learn-more.html';
}

function restart(event) {
    if(event) event.preventDefault();
    Object.keys(userData).forEach(k => userData[k] = null);
    sessionStorage.removeItem('onboardingState');
    document.querySelectorAll('.option-card').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('form').forEach(form => form.reset());
    showScreen(0);
}

function populateDateDropdowns() {
    const daySelect = document.getElementById('dob-day');
    const monthSelect = document.getElementById('dob-month');
    const yearSelect = document.getElementById('dob-year');
    daySelect.innerHTML = '<option value="">Day</option>';
    monthSelect.innerHTML = '<option value="">Month</option>';
    yearSelect.innerHTML = '<option value="">Year</option>';
    for (let i = 1; i <= 31; i++) { daySelect.add(new Option(i, i)); }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    months.forEach((month, index) => { monthSelect.add(new Option(month, index + 1)); });
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 13; i >= currentYear - 100; i--) { yearSelect.add(new Option(i, i)); }
}

// --- Initializer ---
function initializeOnboarding() {
    const savedStateJSON = sessionStorage.getItem('onboardingState');
    if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        Object.assign(userData, savedState.userData);
        const screenToRestore = savedState.currentScreenIndex;
        sessionStorage.removeItem('onboardingState'); 
        populateDateDropdowns();
        if (screenToRestore === 4) {
            generatePaceScreen(); 
        }
        showScreen(screenToRestore);
    } else {
        populateDateDropdowns();
        showScreen(0);
    }
}

initializeOnboarding();