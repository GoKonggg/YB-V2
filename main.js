// File: main.js
// Fungsi: Mengontrol menu pop-up dari tombol plus besar di navbar dan
// mengingat halaman asal saat tombol plus ditekan.

document.addEventListener('DOMContentLoaded', () => {
    
    // =================================================================
    // LOGIKA UMUM (NAVBAR & MENU)
    // =================================================================
    const plusButton = document.getElementById('plus-button');
    const plusMenu = document.getElementById('plus-menu');

    if (plusButton && plusMenu) {
        plusButton.addEventListener('click', (event) => {
            // Simpan halaman saat ini sebelum membuka menu
            // Ini akan digunakan oleh halaman lain untuk link "kembali" yang cerdas
            sessionStorage.setItem('flowOrigin', window.location.pathname); 

            event.stopPropagation();
            plusMenu.classList.toggle('hidden');
        });

        window.addEventListener('click', () => {
            if (!plusMenu.classList.contains('hidden')) {
                plusMenu.classList.add('hidden');
            }
        });
    }
});