// File: profile.js
// Di dalam event DOMContentLoaded

document.addEventListener('DOMContentLoaded', () => {
    

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (event) => {
            event.preventDefault(); // Mencegah link default
            
            // Konfirmasi sebelum logout
            if (confirm('Are you sure you want to log out?')) {
                // Hapus data pengguna dari penyimpanan
                localStorage.clear(); 
                
                // Arahkan kembali ke halaman login atau halaman awal
                window.location.href = 'index.html';
            }
        });
    }

    // Anda perlu menambahkan ID pada tombol logout di HTML:
    // <a id="logout-button" href="#" class="flex items-center ...">
});