// File: diary.js (Versi Debugging)

document.addEventListener('DOMContentLoaded', function() {
    console.log("Halaman selesai dimuat, diary.js mulai berjalan...");

    // Mencari tombol plus di HTML
    console.log("Mencari elemen dengan id='plus-button'...");
    const plusButton = document.getElementById('plus-button');

    // Mencari menu di HTML
    console.log("Mencari elemen dengan id='plus-menu'...");
    const plusMenu = document.getElementById('plus-menu');

    // Memeriksa apakah tombol ditemukan atau tidak
    if (plusButton) {
        console.log("✅ Tombol Plus DITEMUKAN!");
    } else {
        console.error("❌ Tombol Plus TIDAK Ditemukan! Periksa lagi id='plus-button' di HTML.");
        return; // Hentikan eksekusi jika tombol tidak ada
    }

    // Memeriksa apakah menu ditemukan atau tidak
    if (plusMenu) {
        console.log("✅ Menu DITEMUKAN!");
    } else {
        console.error("❌ Menu TIDAK Ditemukan! Periksa lagi id='plus-menu' di HTML.");
        return; // Hentikan eksekusi jika menu tidak ada
    }

    // Menambahkan event listener HANYA ke tombol plus
    console.log("Menambahkan event listener 'click' ke Tombol Plus...");
    plusButton.addEventListener('click', function(event) {
        // Mencegah klik menyebar ke elemen lain
        event.stopPropagation();
        
        // Pesan ini HANYA akan muncul jika tombol plus yang BENAR-BENAR diklik
        console.log("🎉 Tombol Plus DIKLIK! Menampilkan/menyembunyikan menu.");
        
        plusMenu.classList.toggle('hidden');
    });

    console.log("Setup selesai. Menunggu klik pada tombol plus...");

    // Event listener untuk window tetap sama
    window.addEventListener('click', function() {
        if (!plusMenu.classList.contains('hidden')) {
            plusMenu.classList.add('hidden');
        }
    });
});