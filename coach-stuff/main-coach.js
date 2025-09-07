// File: main-coach.js
// Fungsi: Mengelola semua interaksi navigasi, menu pop-up dengan animasi,
// dan penanda link aktif secara efisien.

document.addEventListener('DOMContentLoaded', () => {

    // --- FUNGSI 1: LOGIKA UNTUK POP-UP MENU DENGAN ANIMASI ---
    const plusButton = document.getElementById('plus-button');
    const plusMenu = document.getElementById('plus-menu-coach');
    const plusMenuOverlay = document.getElementById('plus-menu-overlay');

    if (plusButton && plusMenu && plusMenuOverlay) {
        // Atur state awal untuk animasi (tidak terlihat)
        plusMenu.classList.add('opacity-0', 'transform', 'scale-95', 'pointer-events-none');
        
        const toggleMenu = (event) => {
            if (event) event.stopPropagation();
            
            // Toggle state untuk animasi fade-in/scale-up
            plusMenu.classList.toggle('opacity-0');
            plusMenu.classList.toggle('opacity-100');
            plusMenu.classList.toggle('scale-95');
            plusMenu.classList.toggle('scale-100');
            plusMenu.classList.toggle('pointer-events-none'); // Mencegah klik saat tidak terlihat
            
            // Toggle overlay
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

    // --- FUNGSI 2: LOGIKA NAVIGASI AKTIF YANG LEBIH CERDAS ---
    const navContainer = document.querySelector('nav');
    if (navContainer) {
        const currentPagePath = window.location.pathname;
        const navLinks = navContainer.querySelectorAll('a');

        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;

            // Hapus kelas aktif dari semua link terlebih dahulu untuk reset
            link.classList.remove('nav-active');
            
            // Logika untuk mendeteksi halaman utama (misal: '/' atau '/index.html')
            const isDashboard = linkPath.endsWith('coach-dashboard.html') && (currentPagePath === '/' || currentPagePath.endsWith('/index.html'));
            
            // Cek jika link cocok dengan halaman saat ini
            if (linkPath === currentPagePath || isDashboard) {
                // Tambahkan satu kelas 'nav-active' saja
                link.classList.add('nav-active'); 
            }
        });
    }
});