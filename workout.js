// File: workout.js
// Fungsi: Mengirim data dari form Share Workout ke community feed.

document.addEventListener('DOMContentLoaded', () => {
    const postWorkoutBtn = document.getElementById('post-workout-btn');
    if (!postWorkoutBtn) return; // Hanya berjalan di halaman share-workout

    // BLOK KODE YANG MENYEBABKAN MASALAH DIHAPUS DARI SINI

    postWorkoutBtn.addEventListener('click', () => {
        const newPost = {
            postType: 'workout',
            user: { name: 'You', avatar: 'https://i.pravatar.cc/150?u=me' },
            time: 'Just now',
            caption: document.getElementById('caption').value,
            workout: {
                type: document.getElementById('workout-type').value,
                duration: document.getElementById('workout-duration').value,
                calories: document.getElementById('workout-calories').value
            },
            likes: 0,
            comments: 0
        };
        sessionStorage.setItem('newPost', JSON.stringify(newPost));
        // Gunakan replace() untuk menghindari loop di riwayat browser
        window.location.replace('community.html?tab=friends');
    });
});