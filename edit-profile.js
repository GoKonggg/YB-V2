// File: edit-profile.js
// Handles interactive elements on the Edit Profile page.

document.addEventListener('DOMContentLoaded', () => {
    // --- LOGIKA GANTI FOTO PROFIL ---

    // Pilih elemen yang diperlukan. Untuk stabilitas yang lebih baik, disarankan
    // untuk menambahkan ID pada HTML Anda, contoh: <button id="change-photo-btn"> dan <img id="profile-photo">.
    const changePhotoButton = document.querySelector('button.font-semibold.text-pink-500');
    const profileImage = document.querySelector('img[alt="User Avatar"]');

    if (changePhotoButton && profileImage) {
        // Buat elemen input file yang tersembunyi untuk menangani pemilihan file
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*'; // Hanya menerima file gambar
        fileInput.style.display = 'none';

        // Saat tombol "Change Photo" diklik, picu input file yang tersembunyi
        changePhotoButton.addEventListener('click', () => {
            fileInput.click();
        });

        // Saat sebuah file dipilih, baca file tersebut dan perbarui gambar
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();

                // Fungsi ini berjalan setelah file selesai dibaca
                reader.onload = (e) => {
                    // Perbarui 'src' dari gambar profil untuk menampilkan pratinjau
                    profileImage.src = e.target.result;
                };

                // Baca file sebagai Data URL, yang bisa digunakan sebagai sumber gambar
                reader.readAsDataURL(file);
            }
        });

        // Tambahkan input file yang tersembunyi ke dalam body dokumen
        document.body.appendChild(fileInput);
    }

    console.log("Edit Profile page loaded and change photo functionality is active.");
});

