document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let currentActiveTab = 'explore';
    let currentActiveFilter = 'all';
    let currentSearchTerm = '';
    let foodDataForPost = null;
    let selectedBeforeImage = null;
let selectedAfterImage = null;
let mealImageDataUrl = null; 

    // --- MASTER DATA ---
    let allPosts = [
        { id: 1, user: { name: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?u=jane' }, time: '2 hours ago', caption: 'Starting the day right with oatmeal, berries, and a sprinkle of chia seeds! 🥣', image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&q=80', category: 'food', audience: 'explore', likes: 18, comments: 3, isBookmarked: false },
        { id: 2, user: { name: 'Mike Anderson', avatar: 'https://i.pravatar.cc/150?u=transform1' }, time: '1 day ago', caption: 'Consistency is key! Down 15kg in 3 months. 💪', beforeImage: 'dummy', afterImage: 'dummy', category: 'progress', audience: 'explore', likes: 128, comments: 15, isBookmarked: true },
        { id: 3, user: { name: 'Chris Evans', avatar: 'https://i.pravatar.cc/150?u=chris' }, time: '4 hours ago', caption: 'Crushed my leg day workout! Feeling stronger every day. 🏋️‍♂️', workout: { name: 'Leg Day', duration: '90 min', calories: '450 kcal' }, category: 'workout', audience: 'explore', likes: 72, comments: 8, isBookmarked: false },
        { id: 4, user: { name: 'Budi Santoso', avatar: 'https://i.pravatar.cc/150?u=budi' }, time: '3 days ago', caption: 'My friend recommended this amazing ramen place!', food: { name: 'Ramen', calories: 550, serving: '1 bowl' }, category: 'food', audience: 'friends', likes: 45, comments: 9, isBookmarked: false },
        { id: 5, user: { name: 'Sarah Johnson', avatar: 'https://i.pravatar.cc/150?u=sarah' }, time: '5 hours ago', caption: 'My 1-month yoga challenge progress. It is not much, but I feel so much more flexible!', beforeImage: 'dummy', afterImage: 'dummy', category: 'progress', audience: 'friends', likes: 62, comments: 11, isBookmarked: true },
        { id: 6, user: { name: 'David Lee', avatar: 'https://i.pravatar.cc/150?u=david' }, time: '8 hours ago', caption: 'Perfectly grilled salmon for dinner tonight. Healthy and delicious!', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80', category: 'food', audience: 'explore', likes: 98, comments: 22, isBookmarked: false },
        { id: 7, user: { name: 'Maria Garcia', avatar: 'https://i.pravatar.cc/150?u=maria' }, time: 'yesterday', caption: 'A beautiful morning for a 5k run. 🏃‍♀️ Cleared my head and ready for the day!', workout: { name: 'Morning Run', duration: '30 min', calories: '250 kcal' }, category: 'workout', audience: 'friends', likes: 33, comments: 5, isBookmarked: false },
    ];
    
    const foodDatabase = [
        { name: 'Chicken Breast', calories: 165, serving: '100 gr', carbs: 0, fat: 3.6, protein: 31 },
        { name: 'Brown Rice', calories: 111, serving: '1 cup', carbs: 23, fat: 0.9, protein: 2.6 },
        { name: 'Broccoli', calories: 55, serving: '1 cup', carbs: 11, fat: 0.6, protein: 3.7 },
        { name: 'Salmon', calories: 208, serving: '100 gr', carbs: 0, fat: 13, protein: 20 }
    ];

    const dummyImages = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=5',
    'https://i.pravatar.cc/150?img=7',
    'https://i.pravatar.cc/150?img=8',
    'https://i.pravatar.cc/150?img=10',
    'https://i.pravatar.cc/150?img=20',
    'https://i.pravatar.cc/150?img=30',
    'https://i.pravatar.cc/150?img=50'
];

    // --- ELEMENTS ---
    const feedContainer = document.getElementById('feed-container');
    const searchBar = document.getElementById('search-bar');
    const tabExplore = document.getElementById('tab-explore');
    const tabFriends = document.getElementById('tab-friends');
    const createPostPrompt = document.getElementById('create-post-prompt');
    const openFilterBtn = document.getElementById('open-filter-btn');
    const filterPanel = document.getElementById('filter-panel');
    const filterOptionsContainer = document.getElementById('filter-options-container');

    // Choice Modal
    const choiceModal = document.getElementById('create-choice-modal');
    const choiceShareFoodBtn = document.getElementById('choice-share-food');
    const choiceShareWorkoutBtn = document.getElementById('choice-share-workout');
    const choiceShareProgressBtn = document.getElementById('choice-share-progress');

    // Share Food Modal
    const shareFoodModal = document.getElementById('share-food-modal');
    const closeFoodModalBtn = document.getElementById('close-food-modal-btn');
    const tabCreateFood = document.getElementById('tab-create-food');
    const tabFindFood = document.getElementById('tab-find-food');
    const contentCreateFood = document.getElementById('content-create-food');
    const contentFindFood = document.getElementById('content-find-food');
    const foodSelectionList = document.getElementById('food-selection-list');
    const shareCustomFoodBtn = document.getElementById('share-custom-food-btn');

    // Create Post Modal
    const createPostModal = document.getElementById('create-post-modal');
    const backToFoodSelectionBtn = document.getElementById('back-to-food-selection-btn');
    const foodToShareContainer = document.getElementById('food-to-share-container');
    const captionInput = document.getElementById('caption-input');
    const audienceSelect = document.getElementById('audience-select');
    const finalShareBtn = document.getElementById('final-share-btn');

    const shareWorkoutModal = document.getElementById('share-workout-modal');
const closeWorkoutModalBtn = document.getElementById('close-workout-modal-btn');
const workoutNameInput = document.getElementById('workout-name-input');
const workoutDurationInput = document.getElementById('workout-duration-input');
const workoutCaloriesInput = document.getElementById('workout-calories-input');
const workoutCaptionInput = document.getElementById('workout-caption-input');
const workoutAudienceSelect = document.getElementById('workout-audience-select');
const finalShareWorkoutBtn = document.getElementById('final-share-workout-btn');

const shareProgressModal = document.getElementById('share-progress-modal');
const closeProgressModalBtn = document.getElementById('close-progress-modal-btn');
const beforeImagePreview = document.getElementById('before-image-preview');
const afterImagePreview = document.getElementById('after-image-preview');
const beforeImageSelectionGrid = document.getElementById('before-image-selection-grid');
const afterImageSelectionGrid = document.getElementById('after-image-selection-grid');
const progressCaptionInput = document.getElementById('progress-caption-input');
const progressAudienceSelect = document.getElementById('progress-audience-select');
const finalShareProgressBtn = document.getElementById('final-share-progress-btn');

const mealImageUploadTrigger = document.getElementById('meal-image-upload-trigger');
const mealImageInput = document.getElementById('meal-image-input');
const mealImagePreview = document.getElementById('meal-image-preview');

    // --- HELPER FUNCTIONS ---
    const showToast = (message) => {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    // --- RENDER FUNCTIONS ---
    const renderFeed = () => {
        if (!feedContainer) return;
        feedContainer.innerHTML = '';
        const audienceFiltered = allPosts.filter(p => currentActiveTab === 'explore' ? p.audience === 'explore' : p.audience === 'friends');
        const searchFiltered = audienceFiltered.filter(p => {
            const term = currentSearchTerm.toLowerCase();
            if (term === '') return true;
            return (p.caption?.toLowerCase().includes(term)) || (p.user.name?.toLowerCase().includes(term));
        });
        const categoryFiltered = searchFiltered.filter(p => (currentActiveFilter === 'all' ? true : p.category === currentActiveFilter));

        if (categoryFiltered.length === 0) {
            feedContainer.innerHTML = `<p class="text-center text-gray-500 py-10">No posts found.</p>`;
        } else {
            categoryFiltered.forEach(post => {
                let postElement;
                switch (post.category) {
                    case 'food': postElement = createFoodPostElement(post); break;
                    case 'progress': postElement = createProgressPostElement(post); break;
                    case 'workout': postElement = createWorkoutPostElement(post); break;
                    default: postElement = createGeneralPostElement(post);
                }
                if (postElement) feedContainer.appendChild(postElement);
            });
        }
    };

    const createActionsHTML = (post) => {
        const bookmarkFill = post.isBookmarked ? 'currentColor' : 'none';
        const bookmarkStroke = post.isBookmarked ? 'none' : 'currentColor';
        return `
            <div class="flex items-center text-gray-500 mt-4">
                <button class="flex items-center space-x-1 hover:text-pink-500 transition-colors like-btn">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"></path></svg>
                    <span>${post.likes}</span>
                </button>
                <button class="flex items-center space-x-1 hover:text-pink-500 transition-colors ml-4 comment-btn">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.158 2.098.286 3.15 0.405a21.23 21.23 0 01-2.672 3.11a.75.75 0 00.058 1.141 22.536 22.536 0 005.102-2.192.53.53 0 00.27-0.215c.012-.02.023-.04.033-.06a21.23 21.23 0 012.894 0c.01.02.021.04.033.06.096.106.18.204.27.215a22.536 22.536 0 005.102 2.192.75.75 0 00.058-1.141 21.23 21.23 0 01-2.672-3.11c1.052-.119 2.082-.247 3.15-.405 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.344 48.344 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"></path></svg>
                    <span>${post.comments}</span>
                </button>
                <button class="ml-auto hover:text-pink-500 transition-colors bookmark-btn" data-post-id="${post.id}">
                    <svg class="w-5 h-5" fill="${bookmarkFill}" stroke="${bookmarkStroke}" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                </button>
            </div>`;
    };

    const createFoodPostElement = (post) => {
        const el = document.createElement('div');
        el.className = 'bg-white rounded-xl p-4 shadow-sm';
        
        let contentHTML = '';
        if (post.image) {
            contentHTML = `<img src="${post.image}" alt="User post image" class="rounded-lg w-full my-3">`;
        } else if (post.food) {
            contentHTML = `
                <div class="p-3 bg-gray-100 rounded-lg my-3 border">
                    <p class="font-bold text-gray-800">${post.food.name}</p>
                    <p class="text-sm text-gray-600">${post.food.calories} kcal, ${post.food.serving}</p>
                    <div class="flex justify-around text-center mt-2 pt-2 border-t">
                        <div><p class="text-xs text-gray-500">Carbs</p><p class="font-semibold">${post.food.carbs || 0}g</p></div>
                        <div><p class="text-xs text-gray-500">Fat</p><p class="font-semibold">${post.food.fat || 0}g</p></div>
                        <div><p class="text-xs text-gray-500">Protein</p><p class="font-semibold">${post.food.protein || 0}g</p></div>
                    </div>
                </div>
            `;
        }

        el.innerHTML = `<div class="flex items-center mb-2"><img src="${post.user.avatar}" class="w-10 h-10 rounded-full mr-3"><div><p class="font-bold">${post.user.name}</p><p class="text-xs text-gray-500">${post.time}</p></div></div><p class="mb-2 break-words">${post.caption}</p>${contentHTML}${createActionsHTML(post)}`;
        return el;
    };
    
    const createWorkoutPostElement = (post) => {
        const el = document.createElement('div');
        el.className = 'bg-white rounded-xl p-4 shadow-sm';
        const workoutHTML = post.workout ? `<div class="p-3 bg-gray-100 rounded-lg my-3 border flex justify-around text-center"><div class="px-2"> <p class="text-xs text-gray-500">Activity</p> <p class="font-bold text-gray-800">${post.workout.name}</p> </div> <div class="px-2"> <p class="text-xs text-gray-500">Duration</p> <p class="font-bold text-gray-800">${post.workout.duration}</p> </div> <div class="px-2"> <p class="text-xs text-gray-500">Calories</p> <p class="font-bold text-gray-800">${post.workout.calories}</p> </div> </div>` : '';
        el.innerHTML = `<div class="flex items-center mb-2"><img src="${post.user.avatar}" class="w-10 h-10 rounded-full mr-3"><div><p class="font-bold">${post.user.name}</p><p class="text-xs text-gray-500">${post.time}</p></div></div><p class="mb-2 break-words">${post.caption}</p>${workoutHTML}${createActionsHTML(post)}`;
        return el;
    };

    const createProgressPostElement = (post) => {
        const el = document.createElement('div');
        el.className = 'bg-white rounded-xl p-4 shadow-sm';
        const beforeImageHTML = post.beforeImage === 'dummy' ? '<div class="dummy-image-placeholder dummy-before">BEFORE</div>' : `<img src="${post.beforeImage}" class="rounded-lg w-full h-full object-cover">`;
        const afterImageHTML = post.afterImage === 'dummy' ? '<div class="dummy-image-placeholder dummy-after">AFTER</div>' : `<img src="${post.afterImage}" class="rounded-lg w-full h-full object-cover">`;
        el.innerHTML = `<div class="flex items-center mb-3"><img src="${post.user.avatar}" class="w-10 h-10 rounded-full mr-3"><div><p class="font-bold">${post.user.name}</p><p class="text-xs text-gray-500">${post.time}</p></div></div><p class="mb-3 break-words">${post.caption}</p><div class="grid grid-cols-2 gap-2 mb-3"><div>${beforeImageHTML}</div><div>${afterImageHTML}</div></div>${createActionsHTML(post)}`;
        return el;
    };
    
    const renderFoodSelectionList = () => {
        foodSelectionList.innerHTML = '';
        foodDatabase.forEach(food => {
            const foodEl = document.createElement('div');
            foodEl.className = 'flex items-center justify-between p-3 rounded-lg bg-white border';
            foodEl.innerHTML = `
                <div>
                    <p class="font-bold text-gray-800">${food.name}</p>
                    <p class="text-sm text-gray-500">${food.calories} kcal, ${food.serving}</p>
                </div>
                <button class="px-4 py-1 text-pink-500 border border-pink-500 rounded-full text-sm font-semibold hover:bg-pink-500 hover:text-white select-food-btn">
                    Select
                </button>
            `;
            foodEl.querySelector('.select-food-btn').addEventListener('click', () => openCreatePostModal(food));
            foodSelectionList.appendChild(foodEl);
        });
    };

    // --- MODAL MANAGEMENT ---
    const openModal = (modal) => { if (modal) { modal.classList.remove('modal-hidden'); modal.classList.add('modal-visible'); }};
    const closeModal = (modal) => { 
        if (modal) {
             modal.classList.add('modal-hidden'); modal.classList.remove('modal-visible');
        } else {
            document.querySelectorAll('.modal-visible').forEach(m => { m.classList.add('modal-hidden'); m.classList.remove('modal-visible'); });
        }
    };
    
    const openCreatePostModal = (foodData) => {
        foodDataForPost = foodData;
        foodToShareContainer.innerHTML = `
            <p class="font-bold text-gray-800">${foodData.name}</p>
            <p class="text-sm text-gray-600">${foodData.calories} Calories, ${foodData.serving}</p>
        `;
        closeModal(shareFoodModal);
        openModal(createPostModal);
    };
  const setActiveTab = (tabName) => {
        currentActiveTab = tabName;
        setActiveTabUI(); // <-- Ini fungsi penting yang tadinya tidak dipanggil
        renderFeed();
    };
    // --- EVENT LISTENERS ---
     tabExplore.addEventListener('click', () => setActiveTab('explore'));
    tabFriends.addEventListener('click', () => setActiveTab('friends'));
    searchBar.addEventListener('input', () => { currentSearchTerm = searchBar.value; renderFeed(); });
    openFilterBtn.addEventListener('click', () => filterPanel.classList.toggle('open'));

    filterOptionsContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (chip) {
            currentActiveFilter = chip.dataset.filter;
            filterOptionsContainer.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('filter-chip-active'));
            chip.classList.add('filter-chip-active');
            renderFeed();
            setTimeout(() => filterPanel.classList.remove('open'), 200);
        }
    });

    createPostPrompt.addEventListener('click', () => openModal(choiceModal));
    
    // --- Choice Modal Logic ---
    choiceShareFoodBtn.addEventListener('click', () => {
        closeModal(choiceModal);
        openModal(shareFoodModal);
        renderFoodSelectionList();
    });
    // ✅ DENGAN KODE INI
choiceShareWorkoutBtn.addEventListener('click', () => {
    closeModal(choiceModal);
    openModal(shareWorkoutModal);
});

    // ✅ DENGAN KODE INI
choiceShareProgressBtn.addEventListener('click', () => {
    closeModal(choiceModal);
    populateImageSelectionGrids();
    openModal(shareProgressModal);
});

    // --- Share Food Modal Logic ---
    closeFoodModalBtn.addEventListener('click', () => closeModal(shareFoodModal));
    tabCreateFood.addEventListener('click', () => {
        contentCreateFood.classList.remove('hidden');
        contentFindFood.classList.add('hidden');
        tabCreateFood.classList.add('border-pink-500', 'text-pink-500');
        tabFindFood.classList.remove('border-pink-500', 'text-pink-500');
    });
    tabFindFood.addEventListener('click', () => {
        contentFindFood.classList.remove('hidden');
        contentCreateFood.classList.add('hidden');
        tabFindFood.classList.add('border-pink-500', 'text-pink-500');
        tabCreateFood.classList.remove('border-pink-500', 'text-pink-500');
    });
    
    shareCustomFoodBtn.addEventListener('click', () => {
        const customFood = {
            name: document.getElementById('create-name').value || 'Custom Food',
            serving: document.getElementById('create-serving').value || '1 serving',
            calories: document.getElementById('create-calories').value || 0,
            carbs: document.getElementById('create-carbs').value || 0,
            fat: document.getElementById('create-fat').value || 0,
            protein: document.getElementById('create-protein').value || 0,
        };
        openCreatePostModal(customFood);
    });

    // --- Create Post Modal Logic ---
    backToFoodSelectionBtn.addEventListener('click', () => {
        closeModal(createPostModal);
        openModal(shareFoodModal);
    });

    mealImageUploadTrigger.addEventListener('click', () => {
        mealImageInput.click();
    });

    mealImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                mealImageDataUrl = reader.result;
                mealImagePreview.innerHTML = `
                    <div class="relative group">
                        <img src="${reader.result}" class="w-full rounded-lg object-cover">
                        <div id="remove-meal-image-btn" class="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-bold opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                           Remove
                        </div>
                    </div>
                `;
                mealImagePreview.classList.remove('hidden');
                mealImageUploadTrigger.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    mealImagePreview.addEventListener('click', (event) => {
        if (event.target.id === 'remove-meal-image-btn') {
            mealImageDataUrl = null;
            mealImageInput.value = ''; // Penting untuk me-reset input file
            mealImagePreview.innerHTML = '';
            mealImagePreview.classList.add('hidden');
            mealImageUploadTrigger.classList.remove('hidden');
        }
    });
    finalShareBtn.addEventListener('click', () => {
        if (!foodDataForPost) return;

        const newPost = {
            id: allPosts.length + 1,
            user: { name: 'You', avatar: 'https://i.pravatar.cc/150?u=current_user' },
            time: 'Just now',
            caption: captionInput.value || `Having some ${foodDataForPost.name}!`,
            food: foodDataForPost,
            image: mealImageDataUrl,
            category: 'food',
            audience: audienceSelect.value,
            likes: 0,
            comments: 0,
            isBookmarked: false
        };
        
        allPosts.unshift(newPost);
        
        // Reset and close
        closeModal();
        captionInput.value = '';
        foodDataForPost = null;
        audienceSelect.value = 'friends';

        mealImageDataUrl = null;
        mealImageInput.value = '';
        mealImagePreview.innerHTML = '';
        mealImagePreview.classList.add('hidden');
        mealImageUploadTrigger.classList.remove('hidden');

        // Set the tab to where the post was made and render
        currentActiveTab = newPost.audience;
        setActiveTabUI();
        renderFeed();
        showToast('✅ Post shared successfully!');
    });

    

    // ⬇️ TAMBAHKAN BLOK KODE BARU DI BAWAH INI ⬇️

// --- Share Workout Modal Logic ---
closeWorkoutModalBtn.addEventListener('click', () => closeModal(shareWorkoutModal));

finalShareWorkoutBtn.addEventListener('click', () => {
    const activityName = workoutNameInput.value;
    if (!activityName) {
        showToast('⚠️ Please enter an activity name.');
        return;
    }

    const newPost = {
        id: allPosts.length + 1,
        user: { name: 'You', avatar: 'https://i.pravatar.cc/150?u=current_user' },
        time: 'Just now',
        caption: workoutCaptionInput.value || `Just finished a ${activityName} session!`,
        workout: {
            name: activityName,
            duration: workoutDurationInput.value || 'N/A',
            calories: `${workoutCaloriesInput.value || 0} kcal`
        },
        category: 'workout',
        audience: workoutAudienceSelect.value,
        likes: 0,
        comments: 0,
        isBookmarked: false
    };

    allPosts.unshift(newPost);

    // Reset and close
    closeModal(shareWorkoutModal);
    workoutNameInput.value = '';
    workoutDurationInput.value = '';
    workoutCaloriesInput.value = '';
    workoutCaptionInput.value = '';
    workoutAudienceSelect.value = 'friends';

    // Set tab and render
    setActiveTab(newPost.audience);
    showToast('✅ Workout shared successfully!');
});

// ⬇️ TAMBAHKAN SEMUA KODE DI BAWAH INI ⬇️

    // --- Share Progress Modal Logic ---
    const populateImageSelectionGrids = () => {
        beforeImageSelectionGrid.innerHTML = '';
        afterImageSelectionGrid.innerHTML = '';

        dummyImages.forEach(imgSrc => {
            // Create image for BEFORE grid
            const beforeImg = document.createElement('img');
            beforeImg.src = imgSrc;
            beforeImg.className = 'w-12 h-12 object-cover rounded-md cursor-pointer border-2 border-transparent hover:border-pink-500';
            beforeImg.addEventListener('click', () => {
                selectedBeforeImage = imgSrc.replace('/150', '/400');  // Use larger version for post
                beforeImagePreview.innerHTML = `<img src="${imgSrc}" class="w-full h-full object-cover rounded-lg">`;
                // Highlight selection
                const allBeforeImages = beforeImageSelectionGrid.querySelectorAll('img');
                allBeforeImages.forEach(img => img.classList.remove('border-pink-500'));
                beforeImg.classList.add('border-pink-500');
            });
            beforeImageSelectionGrid.appendChild(beforeImg);

            // Create image for AFTER grid
            const afterImg = document.createElement('img');
            afterImg.src = imgSrc;
            afterImg.className = 'w-12 h-12 object-cover rounded-md cursor-pointer border-2 border-transparent hover:border-pink-500';
            afterImg.addEventListener('click', () => {
                selectedAfterImage = imgSrc.replace('/150', '/400'); // Use larger version for post
                afterImagePreview.innerHTML = `<img src="${imgSrc}" class="w-full h-full object-cover rounded-lg">`;
                // Highlight selection
                const allAfterImages = afterImageSelectionGrid.querySelectorAll('img');
                allAfterImages.forEach(img => img.classList.remove('border-pink-500'));
                afterImg.classList.add('border-pink-500');
            });
            afterImageSelectionGrid.appendChild(afterImg);
        });
    };

    closeProgressModalBtn.addEventListener('click', () => closeModal(shareProgressModal));

    finalShareProgressBtn.addEventListener('click', () => {
        if (!selectedBeforeImage || !selectedAfterImage) {
            showToast('⚠️ Please select both a Before and an After photo.');
            return;
        }

        const newPost = {
            id: allPosts.length + 1,
            user: { name: 'You', avatar: 'https://i.pravatar.cc/150?u=current_user' },
            time: 'Just now',
            caption: progressCaptionInput.value || 'Sharing my progress!',
            beforeImage: selectedBeforeImage,
            afterImage: selectedAfterImage,
            category: 'progress',
            audience: progressAudienceSelect.value,
            likes: 0,
            comments: 0,
            isBookmarked: false
        };

        allPosts.unshift(newPost);

        // Reset and close
        closeModal(shareProgressModal);
        progressCaptionInput.value = '';
        selectedBeforeImage = null;
        selectedAfterImage = null;
        beforeImagePreview.innerHTML = 'Select below';
        afterImagePreview.innerHTML = 'Select below';
        progressAudienceSelect.value = 'friends';

        // Set tab and render
        setActiveTab(newPost.audience);
        showToast('✅ Progress shared successfully!');
    });


    document.querySelectorAll('.modal-overlay').forEach(el => el.addEventListener('click', () => closeModal()));

    feedContainer.addEventListener('click', (e) => {
        if (e.target.closest('.bookmark-btn')) {
            // bookmark logic here...
        }
    });

    const setActiveTabUI = () => {
        if (currentActiveTab === 'explore') {
            tabExplore.classList.add('border-pink-500', 'text-pink-500');
            tabExplore.classList.remove('text-gray-400', 'border-transparent');
            tabFriends.classList.remove('border-pink-500', 'text-pink-500');
            tabFriends.classList.add('text-gray-400', 'border-transparent');
        } else {
            tabFriends.classList.add('border-pink-500', 'text-pink-500');
            tabFriends.classList.remove('text-gray-400', 'border-transparent');
            tabExplore.classList.remove('border-pink-500', 'text-pink-500');
            tabExplore.classList.add('text-gray-400', 'border-transparent');
        }
    }
    
    // --- INITIALIZATION ---
    renderFeed();
});
