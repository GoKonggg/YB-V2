// File: custom-post.js
// Fungsi: Mengirim data dari form Create Custom Post ke community feed.

document.addEventListener('DOMContentLoaded', () => {
    const postCustomBtn = document.getElementById('post-custom-btn');
    if (!postCustomBtn) return; // Hanya berjalan di halaman create-custom-post

    // BLOK KODE YANG MENYEBABKAN MASALAH DIHAPUS DARI SINI

    postCustomBtn.addEventListener('click', () => {
        const newPost = {
            postType: 'custom',
            user: { name: 'You', avatar: 'https://i.pravatar.cc/150?u=me' },
            time: 'Just now',
            caption: document.getElementById('caption').value,
            likes: 0,
            comments: 0
        };
        sessionStorage.setItem('newPost', JSON.stringify(newPost));
        // Gunakan replace() untuk menghindari loop di riwayat browser
        window.location.replace('community.html?tab=friends');
    });
});