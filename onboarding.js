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
    goal_weight: null,
};

const totalOnboardingScreens = 6;

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
        nextScreenNumber = 5;
    } else if (currentScreenIndex === 5) {
        nextScreenNumber = 6;
    } else if (currentScreenIndex === 6) {
        window.location.href = 'diary.html';
        return;
    }

    if (nextScreenNumber === 6) {
        showResult();
    }

    showScreen(nextScreenNumber);
}

function prevScreen() {
    if (currentScreenIndex <= 1) return;
    let prevScreenNumber = currentScreenIndex - 1;
    if (currentScreenIndex === 6 && userData.goal === 'maintain_weight') {
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
    if (screenNumber >= 1 && screenNumber < 7) {
        progressContainer.classList.remove('hidden');
    } else {
        progressContainer.classList.add('hidden');
    }
    
    currentScreenIndex = screenNumber;
    updateProgressBar();
}

function updateProgressBar() {
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
    if (screenNumber === 5) {
        const goalWeight = document.getElementById('goal_weight').value;
        if (!goalWeight) {
            alert('Please enter your goal weight.');
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
    if (screenNumber === 5) {
        userData.goal_weight = parseFloat(document.getElementById('goal_weight').value);
    }
}

function generatePaceScreen() {
    const screen4 = document.getElementById('screen-4');
    const goal = userData.goal;
    const weight = userData.current_weight;
    let content = '';
    if (goal === 'fat_loss') {
        const pace1 = (weight * 0.005).toFixed(2);
        const pace2 = (weight * 0.0075).toFixed(2);
        const pace3 = (weight * 0.01).toFixed(2);
        content = `
            <div class="relative flex items-center justify-center mb-2 h-8">
                <button onclick="prevScreen()" class="absolute left-0 text-gray-500 hover:text-dark p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <h1 class="text-2xl font-bold">Set Your Pace</h1>
            </div>
            <p class="text-center text-gray-500 mb-8">For healthy and sustainable results, we recommend losing 0.5% - 1% of your body weight per week.</p>
            <div class="space-y-3">
                <div onclick="selectOption('pace', ${pace1}, this)" class="option-card border-2 border-gray-200 p-4 rounded-xl cursor-pointer">
                    <h3 class="font-semibold">Relaxed: ~${pace1} kg / week</h3>
                </div>
                <div onclick="selectOption('pace', ${pace2}, this)" class="option-card border-2 border-gray-200 p-4 rounded-xl cursor-pointer">
                    <h3 class="font-semibold">Recommended: ~${pace2} kg / week</h3>
                </div>
                <div onclick="selectOption('pace', ${pace3}, this)" class="option-card border-2 border-gray-200 p-4 rounded-xl cursor-pointer">
                    <h3 class="font-semibold">Ambitious: ~${pace3} kg / week</h3>
                </div>
            </div>
            <button onclick="nextScreen()" id="btn-screen-4" class="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg mt-8 hover:opacity-90 transition-opacity disabled:opacity-50" disabled>Continue</button>
        `;
    } else if (goal === 'muscle_gain') {
        content = `
            <div class="relative flex items-center justify-center mb-2 h-8">
                <button onclick="prevScreen()" class="absolute left-0 text-gray-500 hover:text-dark p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <h1 class="text-2xl font-bold">Set Your Pace</h1>
            </div>
            <p class="text-center text-gray-500 mb-8">To build muscle effectively while minimizing fat gain, a slight calorie surplus is best.</p>
            <div class="space-y-3">
                <div onclick="selectOption('pace', 0.2, this)" class="option-card border-2 border-gray-200 p-4 rounded-xl cursor-pointer">
                    <h3 class="font-semibold">Lean Gain: +0.2 kg / week</h3>
                </div>
                <div onclick="selectOption('pace', 0.4, this)" class="option-card border-2 border-gray-200 p-4 rounded-xl cursor-pointer">
                    <h3 class="font-semibold">Steady Gain: +0.4 kg / week</h3>
                </div>
            </div>
            <button onclick="nextScreen()" id="btn-screen-4" class="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg mt-8 hover:opacity-90 transition-opacity disabled:opacity-50" disabled>Continue</button>
        `;
    }
    screen4.innerHTML = content;
}

function calculateETA() {
    const { goal, current_weight, goal_weight, pace } = userData;
    if (goal === 'maintain_weight' || !goal_weight || !pace || pace <= 0) return null;
    const weightDifference = Math.abs(current_weight - goal_weight);
    if (weightDifference <= 0) return null;
    const weeks = weightDifference / pace;
    const days = Math.ceil(weeks * 7);
    const etaDate = new Date();
    etaDate.setDate(etaDate.getDate() + days);
    return etaDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function animateCountUp(el, to) {
    if (!el) return;
    const finalValue = Math.round(to);
    if (isNaN(finalValue)) return;
    let from = 0;
    const duration = 1000;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    const increment = finalValue / totalFrames;
    let currentFrame = 0;
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
    if (finalValue === 0) {
        el.textContent = 0;
        clearInterval(timer);
    }
}

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
        const finalCalories = calculateCalories();
        localStorage.setItem('calorieGoal', Math.round(finalCalories));
        
        const calorieEl = document.getElementById('calorie-result');
        animateCountUp(calorieEl, finalCalories);
        
        const etaContainer = document.getElementById('eta-container');
        const etaResult = document.getElementById('eta-result');
        const eta = calculateETA();
        if (eta && etaResult && etaContainer) {
            etaResult.textContent = eta;
            etaContainer.classList.remove('hidden');
        } else if (etaContainer) {
            etaContainer.classList.add('hidden');
        }

        calculatingDiv.style.display = 'none';
        resultContentDiv.style.display = 'block';
        resultContentDiv.querySelectorAll('.opacity-0').forEach(el => {
            el.classList.add('fade-in-up');
        });
    }, 2000);
}

function calculateCalories() {
    const { gender, dob, height, current_weight, activity, goal, pace } = userData;
    if (!gender || !dob || !height || !current_weight || !activity) return 0;
    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    
    let bmr = 0;
    if (gender === 'male') {
        bmr = (10 * current_weight) + (6.25 * height) - (5 * age) + 5;
    } else { // female
        bmr = (10 * current_weight) + (6.25 * height) - (5 * age) - 161;
    }

    const activityMultipliers = {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderately_active: 1.55,
        very_active: 1.725,
        extra_active: 1.9,
    };
    
    let tdee = bmr * activityMultipliers[activity];

    if (goal === 'fat_loss' && pace) {
        // [DIUBAH] Mengganti 7700 menjadi 7000
        const weeklyDeficit = pace * 7000;
        tdee -= (weeklyDeficit / 7);
    } else if (goal === 'muscle_gain' && pace) {
        const weeklySurplus = pace * 3500;
        tdee += (weeklySurplus / 7);
    }

    return tdee;
}

function restart(event) {
    if(event) event.preventDefault();
    Object.keys(userData).forEach(k => userData[k] = null);
    document.querySelectorAll('.option-card').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('form').forEach(form => form.reset());
    document.getElementById('eta-container').classList.add('hidden');
    showScreen(0);
}

function populateDateDropdowns() {
    const daySelect = document.getElementById('dob-day');
    const monthSelect = document.getElementById('dob-month');
    const yearSelect = document.getElementById('dob-year');
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month.substring(0,3);
        monthSelect.appendChild(option);
    });
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 100;
    for (let i = currentYear - 18; i >= startYear; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
}

showScreen(0);
populateDateDropdowns();

