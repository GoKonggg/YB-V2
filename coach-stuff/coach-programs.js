document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENT SELECTORS (LENGKAP) ---
    const programsContainer = document.getElementById('programs-container');
    const filterTabs = document.getElementById('filter-tabs');
    const totalProgramsEl = document.getElementById('total-programs');
    const plusButton = document.getElementById('plus-button');
    const plusMenu = document.getElementById('plus-menu-coach');
    const plusOverlay = document.getElementById('plus-menu-overlay');
    
    // Video Library Selectors
    const viewLibraryBtn = document.getElementById('view-library-btn');
    const videoLibraryModal = document.getElementById('video-library-modal');
    const closeLibraryModalBtn = document.getElementById('close-library-modal-btn');
    const videoGrid = document.getElementById('video-grid');
    const searchVideoInput = document.getElementById('search-video-input');
    
    // Add Video Modal Selectors
    const addVideoBtnModal = document.getElementById('add-video-btn-modal');
    const addVideoModal = document.getElementById('add-video-modal');
    const cancelAddVideoBtn = document.getElementById('cancel-add-video-btn');
    const addVideoForm = document.getElementById('add-video-form');
    
    // Video Player Modal Selectors
    const videoPlayerModal = document.getElementById('video-player-modal');
    const closePlayerBtn = document.getElementById('close-player-btn');
    const youtubePlayerEmbed = document.getElementById('youtube-player-embed');

    const PROGRAM_STORAGE_KEY = 'fitcoach_saved_programs';

    // --- UTILITY FUNCTIONS ---
    const toggleModal = (modalElement, show) => {
        if (show) {
            modalElement.classList.remove('hidden');
            setTimeout(() => {
                modalElement.classList.remove('opacity-0');
                modalElement.querySelector('.modal-box').classList.remove('scale-95');
            }, 10);
        } else {
            modalElement.classList.add('opacity-0');
            modalElement.querySelector('.modal-box').classList.add('scale-95');
            setTimeout(() => modalElement.classList.add('hidden'), 300);
        }
    };

    const extractYouTubeID = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // --- LOGIC FOR NAV MENU (+) ---
    const togglePlusMenu = () => {
        const isHidden = plusOverlay.classList.contains('hidden');
        if (isHidden) {
            plusOverlay.classList.remove('hidden');
            plusMenu.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
        } else {
            plusOverlay.classList.add('hidden');
            plusMenu.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
        }
    };

    // --- LOGIC FOR DYNAMIC PROGRAM LIST ---
    const createProgramCardHTML = (program) => {
        const isDraft = program.status === 'Draft';

        const imageHtml = program.image
            ? `<img src="${program.image}" class="h-32 w-full object-cover">`
            : `<div class="h-32 w-full bg-gray-200 flex items-center justify-center"><svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>`;
        
        const statusBadgeHtml = isDraft
            ? `<span class="status-badge status-draft">Draft</span>`
            : `<span class="status-badge status-published">Published</span>`;

        const cardFooterHtml = isDraft
            ? `<p class="text-sm text-gray-400 mb-3 border-b pb-3">No performance data yet.</p>
               <div class="flex justify-between items-center">
                   <a href="coach-program-builder.html?id=${program.id}" class="text-sm font-semibold text-pink-600 hover:text-pink-800">Continue Editing</a>
               </div>`
            : `<div class="flex items-center space-x-4 text-xs text-gray-500 font-medium border-b pb-3 mb-3">
                   <span>0 Clients</span><span>$0 Revenue</span>
               </div>
               <div class="flex justify-between items-center">
                   <div class="flex items-center"><svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg><p class="ml-1 text-sm font-bold text-gray-700">No reviews</p></div>
               </div>`;
        
        const actionMenuHtml = isDraft
            ? `<a href="coach-program-builder.html?id=${program.id}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit Program</a>
               <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50" data-action="delete" data-id="${program.id}">Delete</a>`
            : `<a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit Program</a>
               <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Unpublish</a>
               <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50" data-action="delete" data-id="${program.id}">Delete</a>`;

        return `
            <div class="program-card bg-white rounded-xl shadow-lg overflow-hidden" data-id="${program.id}" data-status="${program.status}">
                ${imageHtml}
                <div class="p-4 relative">
                    <div class="flex justify-between items-start">
                        <h3 class="text-lg font-bold text-gray-900 mb-1">${program.title || 'Untitled Program'}</h3>
                        ${statusBadgeHtml}
                    </div>
                    ${cardFooterHtml}
                    <div class="absolute top-2 right-2">
                        <button class="action-menu-button p-2 text-gray-500 rounded-full hover:bg-gray-200/50">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                        </button>
                        <div class="action-menu hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                            ${actionMenuHtml}
                        </div>
                    </div>
                </div>
            </div>`;
    };

    const renderPrograms = (programs) => {
        programsContainer.innerHTML = '';
        if (!programs || programs.length === 0) {
            programsContainer.innerHTML = `<p class="text-center text-gray-500 py-8">No programs found. Click the '+' button to create one!</p>`;
            if (totalProgramsEl) totalProgramsEl.textContent = 0;
            return;
        }
        programs.forEach(program => {
            const cardHTML = createProgramCardHTML(program);
            programsContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
        if (totalProgramsEl) {
           totalProgramsEl.textContent = programs.length;
        }
    };
    
    const filterAndRenderPrograms = () => {
        const savedPrograms = JSON.parse(localStorage.getItem(PROGRAM_STORAGE_KEY)) || [];
        const activeFilterEl = filterTabs.querySelector('.filter-tab-active');
        if (!activeFilterEl) return;
        
        const activeFilter = activeFilterEl.dataset.filter;
        const filtered = savedPrograms.filter(program => activeFilter === 'all' || program.status === activeFilter);
        renderPrograms(filtered);
    };

    // --- LOGIC FOR VIDEO LIBRARY ---
    const createVideoCardHTML = (video) => {
        return `<div class="video-card bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer group" data-video-url="${video.videoUrl}">
                    <div class="relative"><img src="${video.thumbnailUrl}" alt="${video.name}" class="w-full h-24 object-cover"><div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100"><svg class="w-10 h-10 text-white/80" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.118v3.764a1 1 0 001.555.832l3.197-1.882a1 1 0 000-1.664l-3.197-1.882z" clip-rule="evenodd"></path></svg></div></div>
                    <div class="p-2"><h3 class="font-semibold text-xs text-gray-800 truncate">${video.name}</h3><p class="text-xs text-gray-500">${video.muscleGroup}</p></div>
                </div>`;
    };
    
    const renderVideoLibrary = (videoList) => {
        videoGrid.innerHTML = '';
        if (!videoList || videoList.length === 0) {
            videoGrid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">No videos found.</p>';
            return;
        }
        videoList.forEach(video => {
            const cardHTML = createVideoCardHTML(video);
            videoGrid.insertAdjacentHTML('beforeend', cardHTML);
        });
    };
    
    const handleVideoFilterChange = () => {
        const searchTerm = searchVideoInput.value.toLowerCase();
        if (typeof exerciseLibraryData === 'undefined') return;
        const filteredVideos = exerciseLibraryData.filter(video => video.name.toLowerCase().includes(searchTerm));
        renderVideoLibrary(filteredVideos);
    };

    const handleVideoFormSubmit = (event) => {
        event.preventDefault();
        const exerciseName = document.getElementById('exercise-name').value.trim();
        const youtubeUrl = document.getElementById('youtube-url').value.trim();
        const muscleGroup = document.getElementById('muscle-group').value;
        const equipment = document.getElementById('equipment').value;

        if (!exerciseName || !youtubeUrl) { 
            alert('Please fill out both Exercise Name and YouTube URL.'); 
            return; 
        }
        const videoID = extractYouTubeID(youtubeUrl);
        if (!videoID) { 
            alert('Invalid YouTube URL.'); 
            return; 
        }

        const newVideo = { 
            id: 'exl' + new Date().getTime(), 
            name: exerciseName, 
            muscleGroup, 
            equipment, 
            videoUrl: youtubeUrl, 
            thumbnailUrl: `https://i.ytimg.com/vi/${videoID}/hqdefault.jpg` 
        };
        
        if (typeof exerciseLibraryData === 'undefined') {
            window.exerciseLibraryData = [];
        }
        exerciseLibraryData.unshift(newVideo);
        
        handleVideoFilterChange();
        toggleModal(addVideoModal, false);
        addVideoForm.reset();
    };

    // --- EVENT LISTENERS ---
    plusButton.addEventListener('click', (e) => { e.stopPropagation(); togglePlusMenu(); });
    plusOverlay.addEventListener('click', togglePlusMenu);

    filterTabs.addEventListener('click', (e) => {
        if (e.target.matches('.filter-tab')) {
            filterTabs.querySelector('.filter-tab-active').classList.remove('filter-tab-active');
            e.target.classList.add('filter-tab-active');
            filterAndRenderPrograms();
        }
    });

    programsContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.action-menu-button');
        const actionLink = e.target.closest('a[data-action]');

        if (button) {
            e.stopPropagation();
            document.querySelectorAll('.action-menu').forEach(m => {
                if (m !== button.nextElementSibling) m.classList.add('hidden');
            });
            button.nextElementSibling.classList.toggle('hidden');
        }

        if (actionLink) {
            e.preventDefault();
            const action = actionLink.dataset.action;
            const programId = actionLink.dataset.id;
            
            if (action === 'delete') {
                if (confirm('Are you sure you want to delete this program?')) {
                    let savedPrograms = JSON.parse(localStorage.getItem(PROGRAM_STORAGE_KEY)) || [];
                    savedPrograms = savedPrograms.filter(p => p.id !== programId);
                    localStorage.setItem(PROGRAM_STORAGE_KEY, JSON.stringify(savedPrograms));
                    filterAndRenderPrograms();
                }
            }
        }
    });
    
    window.addEventListener('click', () => {
        document.querySelectorAll('.action-menu').forEach(m => m.classList.add('hidden'));
    });

    // Video Library Event Listeners
    viewLibraryBtn.addEventListener('click', () => {
        renderVideoLibrary(typeof exerciseLibraryData !== 'undefined' ? exerciseLibraryData : []);
        toggleModal(videoLibraryModal, true);
    });
    
    closeLibraryModalBtn.addEventListener('click', () => toggleModal(videoLibraryModal, false));
    addVideoBtnModal.addEventListener('click', () => toggleModal(addVideoModal, true));
    cancelAddVideoBtn.addEventListener('click', () => toggleModal(addVideoModal, false));
    addVideoForm.addEventListener('submit', handleVideoFormSubmit);
    searchVideoInput.addEventListener('input', handleVideoFilterChange);

    videoGrid.addEventListener('click', (event) => {
        const card = event.target.closest('.video-card');
        if (!card) return;
        const videoUrl = card.dataset.videoUrl;
        const videoID = extractYouTubeID(videoUrl);
        if (videoID) {
            youtubePlayerEmbed.src = `https://www.youtube.com/embed/${videoID}?autoplay=1&modestbranding=1&rel=0`;
            toggleModal(videoPlayerModal, true);
        }
    });

    closePlayerBtn.addEventListener('click', () => {
        toggleModal(videoPlayerModal, false);
        youtubePlayerEmbed.src = '';
    });

    // --- INITIALIZATION ---
    filterAndRenderPrograms();
});