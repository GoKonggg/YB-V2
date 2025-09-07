// File: main-coach.js (Versi yang Benar)

document.addEventListener('DOMContentLoaded', () => {

    // --- FUNGSI 1: LOGIKA UNTUK POP-UP MENU DENGAN ANIMASI ---
    const plusButton = document.getElementById('plus-button');
    const plusMenu = document.getElementById('plus-menu-coach');
    const plusMenuOverlay = document.getElementById('plus-menu-overlay');

    if (plusButton && plusMenu && plusMenuOverlay) {
        
        const toggleMenu = (event) => {
            if (event) event.stopPropagation();
            
            // Toggle state untuk animasi fade-in/scale-up
            plusMenu.classList.toggle('opacity-0');
            plusMenu.classList.toggle('opacity-100');
            plusMenu.classList.toggle('scale-95');
            plusMenu.classList.toggle('scale-100');
            plusMenu.classList.toggle('pointer-events-none');
            
            // Overlay tetap menggunakan hidden karena tidak perlu dianimasikan
            plusMenuOverlay.classList.toggle('hidden');

            // Animasi rotasi untuk ikon di dalam tombol plus
            const plusIcon = plusButton.querySelector('svg');
            if (plusIcon) {
                plusIcon.classList.toggle('rotate-45');
            }
        };

        plusButton.addEventListener('click', toggleMenu);
        plusMenuOverlay.addEventListener('click', toggleMenu);
    }

    // --- FUNGSI 2: LOGIKA NAVIGASI AKTIF ---
    // ... (sisa kode navigasi tidak perlu diubah) ...
    const navContainer = document.querySelector('nav.glass-card');
    if (navContainer) {
        const currentPagePath = window.location.pathname;
        const navLinks = navContainer.querySelectorAll('a');

        navLinks.forEach(link => {
            if (link.href) {
                const linkPath = new URL(link.href).pathname;
                link.classList.remove('nav-active');
                const isDashboard = linkPath.endsWith('coach-dashboard.html') && (currentPagePath === '/' || currentPagePath.endsWith('/index.html'));
                if (linkPath === currentPagePath || isDashboard) {
                    link.classList.add('nav-active'); 
                }
            }
        });
    }
});