document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let currentActiveTab = 'explore';
    let currentActiveFilter = 'all';
    let currentSearchTerm = '';

    // --- MASTER DATA (DIPERBARUI DENGAN KATEGORI BARU) ---
    let allPosts = [
        { id: 1, user: { name: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?u=jane' }, time: '2 hours ago', caption: 'Starting the day right with oatmeal, berries, and a sprinkle of chia seeds! 🥣', image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&q=80', category: 'food', audience: 'explore', likes: 18, comments: 3, isBookmarked: false },
        { id: 2, user: { name: 'Mike Anderson', avatar: 'https://i.pravatar.cc/150?u=transform1' }, time: '1 day ago', caption: 'Consistency is key! Down 15kg in 3 months. 💪', beforeImage: 'dummy', afterImage: 'dummy', category: 'progress', audience: 'explore', likes: 128, comments: 15, isBookmarked: true },
        { id: 3, user: { name: 'Chris Evans', avatar: 'https://i.pravatar.cc/150?u=chris' }, time: '4 hours ago', caption: 'Crushed my leg day workout! Feeling stronger every day. 🏋️‍♂️', workout: { name: 'Leg Day', duration: '90 min', calories: '450 kcal' }, category: 'workout', audience: 'explore', likes: 72, comments: 8, isBookmarked: false },
        { id: 4, user: { name: 'Budi Santoso', avatar: 'https://i.pravatar.cc/150?u=budi' }, time: '3 days ago', caption: 'My friend recommended this amazing ramen place!', image: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=500&q=80', category: 'food', audience: 'friends', likes: 45, comments: 9, isBookmarked: false },
        { id: 5, user: { name: 'Sarah Johnson', avatar: 'https://i.pravatar.cc/150?u=sarah' }, time: '5 hours ago', caption: 'My 1-month yoga challenge progress. It is not much, but I feel so much more flexible!', beforeImage: 'dummy', afterImage: 'dummy', category: 'progress', audience: 'friends', likes: 62, comments: 11, isBookmarked: true },
        { id: 6, user: { name: 'David Lee', avatar: 'https://i.pravatar.cc/150?u=david' }, time: '8 hours ago', caption: 'Perfectly grilled salmon for dinner tonight. Healthy and delicious!', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80', category: 'food', audience: 'explore', likes: 98, comments: 22, isBookmarked: false },
        { id: 7, user: { name: 'Maria Garcia', avatar: 'https://i.pravatar.cc/150?u=maria' }, time: 'yesterday', caption: 'A beautiful morning for a 5k run. 🏃‍♀️ Cleared my head and ready for the day!', workout: { name: 'Morning Run', duration: '30 min', calories: '250 kcal' }, category: 'workout', audience: 'friends', likes: 33, comments: 5, isBookmarked: false },
        { id: 8, user: { name: 'Siti Aisyah', avatar: 'https://i.pravatar.cc/150?u=siti' }, time: 'yesterday', caption: 'Trying out a new recipe for chicken curry. So fragrant! 🍛', image: 'https://images.unsplash.com/photo-1586952518485-221f622e2787?w=500&q=80', category: 'food', audience: 'friends', likes: 81, comments: 14, isBookmarked: false },
        { id: 9, user: { name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=alex' }, time: '2 days ago', caption: 'Back and biceps day. Hit a new personal record on pull-ups!', workout: { name: 'Upper Body', duration: '60 min', calories: '350 kcal' }, category: 'workout', audience: 'explore', likes: 112, comments: 19, isBookmarked: true },
        { id: 10, user: { name: 'Emily Carter', avatar: 'https://i.pravatar.cc/150?u=emily' }, time: '3 days ago', caption: 'Post-partum progress. It\'s a marathon, not a sprint. Feeling proud!', beforeImage: 'dummy', afterImage: 'dummy', category: 'progress', audience: 'explore', likes: 230, comments: 45, isBookmarked: false }
    ];

    // --- ELEMEN UTAMA & INTERAKTIF ---
    const tabExplore = document.getElementById('tab-explore');
    const tabFriends = document.getElementById('tab-friends');
    const searchBar = document.getElementById('search-bar');
    const feedContainer = document.getElementById('feed-container');
    const createPostPrompt = document.getElementById('create-post-prompt');
    const postPlaceholderText = document.getElementById('post-placeholder-text');
    const openFilterBtn = document.getElementById('open-filter-btn');
    const filterPanel = document.getElementById('filter-panel');
    const filterOptionsContainer = document.getElementById('filter-options-container');
    const choiceModal = document.getElementById('create-choice-modal');
    const choiceShareFoodBtn = document.getElementById('choice-share-food');
    const choiceShareWorkoutBtn = document.getElementById('choice-share-workout');
    const choiceShareProgressBtn = document.getElementById('choice-share-progress');

    // --- FUNGSI BANTUAN ---
    const showToast = (message) => {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    // --- FUNGSI PUSAT UNTUK MENGATUR TAB ---
    const setActiveTab = (tabName) => {
        currentActiveTab = tabName;
        if (tabName === 'explore') {
            tabExplore.classList.add('border-pink-500', 'text-pink-500');
            tabExplore.classList.remove('text-gray-400', 'border-transparent');
            tabFriends.classList.remove('border-pink-500', 'text-pink-500');
            tabFriends.classList.add('text-gray-400', 'border-transparent');
            if (postPlaceholderText) postPlaceholderText.textContent = 'Share with the community...';
        } else {
            tabFriends.classList.add('border-pink-500', 'text-pink-500');
            tabFriends.classList.remove('text-gray-400', 'border-transparent');
            tabExplore.classList.remove('border-pink-500', 'text-pink-500');
            tabExplore.classList.add('text-gray-400', 'border-transparent');
            if (postPlaceholderText) postPlaceholderText.textContent = 'Share with your friends...';
        }
        renderFeed();
    };

    // --- MESIN RENDER UTAMA ---
    const renderFeed = () => {
        feedContainer.innerHTML = '';
        const audienceFiltered = allPosts.filter(p => (currentActiveTab === 'explore' ? p.audience === 'explore' : p.audience === 'friends'));
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

    // --- FUNGSI PEMBUATAN ELEMEN POST ---
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
            </div>
        `;
    };

    const createFoodPostElement = (post) => {
        const el = document.createElement('div');
        el.className = 'glass-card rounded-xl p-4';
        const imageHTML = post.image ? `<img src="${post.image}" alt="User post image" class="rounded-lg w-full my-3">` : '';
        el.innerHTML = `<div class="flex items-center mb-2"><img src="${post.user.avatar}" class="w-10 h-10 rounded-full mr-3"><div><p class="font-bold">${post.user.name}</p><p class="text-xs text-gray-500">${post.time}</p></div></div><p class="mb-2 break-words">${post.caption}</p>${imageHTML}${createActionsHTML(post)}`;
        return el;
    };
    
    const createWorkoutPostElement = (post) => {
        const el = document.createElement('div');
        el.className = 'glass-card rounded-xl p-4';
        const workoutHTML = post.workout ? `<div class="p-3 bg-white/50 rounded-lg my-3 border flex justify-around text-center"><div class="px-2"> <p class="text-xs text-gray-500">Activity</p> <p class="font-bold text-gray-800">${post.workout.name}</p> </div> <div class="px-2"> <p class="text-xs text-gray-500">Duration</p> <p class="font-bold text-gray-800">${post.workout.duration}</p> </div> <div class="px-2"> <p class="text-xs text-gray-500">Calories</p> <p class="font-bold text-gray-800">${post.workout.calories}</p> </div> </div>` : '';
        el.innerHTML = `<div class="flex items-center mb-2"><img src="${post.user.avatar}" class="w-10 h-10 rounded-full mr-3"><div><p class="font-bold">${post.user.name}</p><p class="text-xs text-gray-500">${post.time}</p></div></div><p class="mb-2 break-words">${post.caption}</p>${workoutHTML}${createActionsHTML(post)}`;
        return el;
    };

    const createProgressPostElement = (post) => {
        const el = document.createElement('div');
        el.className = 'glass-card rounded-xl p-4';
        const beforeImageHTML = post.beforeImage === 'dummy' ? '<div class="dummy-image-placeholder dummy-before">BEFORE</div>' : `<img src="${post.beforeImage}" class="rounded-lg w-full h-full object-cover">`;
        const afterImageHTML = post.afterImage === 'dummy' ? '<div class="dummy-image-placeholder dummy-after">AFTER</div>' : `<img src="${post.afterImage}" class="rounded-lg w-full h-full object-cover">`;
        el.innerHTML = `<div class="flex items-center mb-3"><img src="${post.user.avatar}" class="w-10 h-10 rounded-full mr-3"><div><p class="font-bold">${post.user.name}</p><p class="text-xs text-gray-500">${post.time}</p></div></div><p class="mb-3 break-words">${post.caption}</p><div class="grid grid-cols-2 gap-2 mb-3"><div>${beforeImageHTML}<p class="text-center text-xs font-semibold text-gray-500 mt-1">BEFORE</p></div><div>${afterImageHTML}<p class="text-center text-xs font-semibold text-gray-500 mt-1">AFTER</p></div></div>${createActionsHTML(post)}`;
        return el;
    };

    const createGeneralPostElement = (post) => {
        const el = document.createElement('div');
        el.className = 'glass-card rounded-xl p-4';
        el.innerHTML = `<div class="flex items-center mb-2"><img src="${post.user.avatar}" class="w-10 h-10 rounded-full mr-3"><div><p class="font-bold">${post.user.name}</p><p class="text-xs text-gray-500">${post.time}</p></div></div><p class="mb-2 break-words">${post.caption}</p>${createActionsHTML(post)}`;
        return el;
    }

    // --- FUNGSI MODAL ---
    const openModal = (modal) => { if(modal) { modal.classList.remove('modal-hidden'); modal.classList.add('modal-visible'); } };
    const closeModal = () => { document.querySelectorAll('.modal-visible').forEach(m => { m.classList.add('modal-hidden'); m.classList.remove('modal-visible'); }); };
    
    // --- EVENT LISTENERS ---
    tabExplore.addEventListener('click', () => setActiveTab('explore'));
    tabFriends.addEventListener('click', () => setActiveTab('friends'));
    searchBar.addEventListener('input', () => { currentSearchTerm = searchBar.value; renderFeed(); });
    
    openFilterBtn.addEventListener('click', () => {
        filterPanel.classList.toggle('open');
    });

    filterOptionsContainer.addEventListener('click', (event) => {
        const clickedChip = event.target.closest('.filter-chip');
        if (!clickedChip) return;
        
        filterOptionsContainer.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('filter-chip-active');
        });
        clickedChip.classList.add('filter-chip-active');
        
        currentActiveFilter = clickedChip.dataset.filter;
        renderFeed();
        
        setTimeout(() => {
            filterPanel.classList.remove('open');
        }, 200);
    });

    createPostPrompt.addEventListener('click', () => openModal(choiceModal));
    
    choiceShareFoodBtn.addEventListener('click', () => { closeModal(); showToast('💡 Fitur "Share Food" perlu dibuatkan modalnya.'); });
    choiceShareWorkoutBtn.addEventListener('click', () => { closeModal(); showToast('💡 Fitur "Share Workout" perlu dibuatkan modalnya.'); });
    choiceShareProgressBtn.addEventListener('click', () => { closeModal(); showToast('💡 Fitur "Share Progress" perlu dibuatkan modalnya.'); });

    document.querySelectorAll('.modal-overlay').forEach(el => el.addEventListener('click', closeModal));

    feedContainer.addEventListener('click', (event) => {
        const bookmarkBtn = event.target.closest('.bookmark-btn');
        const commentBtn = event.target.closest('.comment-btn');
        const likeBtn = event.target.closest('.like-btn');

        if (bookmarkBtn) {
            const postId = parseInt(bookmarkBtn.dataset.postId, 10);
            const post = allPosts.find(p => p.id === postId);
            if (post) {
                post.isBookmarked = !post.isBookmarked;
                const svg = bookmarkBtn.querySelector('svg');
                if (post.isBookmarked) {
                    svg.setAttribute('fill', 'currentColor');
                    svg.setAttribute('stroke', 'none');
                    showToast('✅ Post bookmarked!');
                } else {
                    svg.setAttribute('fill', 'none');
                    svg.setAttribute('stroke', 'currentColor');
                    showToast(' Bookmark removed.');
                }
            }
        }

        if (commentBtn) {
            showToast('💬 Comment feature is coming soon!');
        }

        if (likeBtn) {
            likeBtn.classList.toggle('text-pink-500');
        }
    });
    
    // --- INISIALISASI ---
    renderFeed();
});