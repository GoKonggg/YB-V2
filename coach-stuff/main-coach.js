// File: main-coach.js
// Fungsi: Mengelola semua interaksi navigasi bawah untuk Coach, 
// termasuk menu pop-up dan penanda link aktif.

document.addEventListener('DOMContentLoaded', () => {
    // --- FUNGSI 1: LOGIKA UNTUK POP-UP MENU ---
    const plusButton = document.getElementById('plus-button');
    const plusMenu = document.getElementById('plus-menu-coach');
    const plusMenuOverlay = document.getElementById('plus-menu-overlay');

    // Cek dulu apakah semua elemen ada sebelum menambahkan event listener
    if (plusButton && plusMenu && plusMenuOverlay) {
        const toggleMenu = (event) => {
            if (event) event.stopPropagation();
            
            // Toggle visibility menu dan overlay
            plusMenu.classList.toggle('hidden');
            plusMenuOverlay.classList.toggle('hidden');

            // Kita tidak menambahkan animasi rotasi karena icon-nya berbeda (bukan '+')
            // Jika kamu ingin menambahkan icon '+' yang berputar, logika itu bisa ditambahkan di sini.
        };

        plusButton.addEventListener('click', toggleMenu);
        plusMenuOverlay.addEventListener('click', toggleMenu);
    }

    // --- FUNGSI 2: LOGIKA UNTUK NAVIGASI AKTIF ---
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        // Menggunakan new URL() untuk mendapatkan pathname dengan bersih
        const linkPath = new URL(link.href).pathname;
        const linkTextSpan = link.querySelector('span');

        if (linkPath === currentPage) {
            // Jika link cocok dengan halaman saat ini -> jadikan aktif
            link.classList.remove('text-gray-600');
            link.classList.add('text-pink-500');
            if (linkTextSpan) {
                linkTextSpan.classList.add('font-bold');
                linkTextSpan.classList.remove('font-medium');
            }
        } else {
            // Jika tidak cocok -> pastikan tidak aktif
            link.classList.add('text-gray-600');
            link.classList.remove('text-pink-500');
            if (linkTextSpan) {
                linkTextSpan.classList.remove('font-bold');
                linkTextSpan.classList.add('font-medium');
            }
        }
    });
});