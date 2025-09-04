// File: my-coach.js (Versi Final yang Disederhanakan)

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const coachAvatarEl = document.getElementById('coach-avatar');
    const coachNameEl = document.getElementById('coach-name');
    const offeringTitleEl = document.getElementById('offering-title');
    const statusPendingView = document.getElementById('status-pending');
    const statusActiveView = document.getElementById('status-active');
    const statusConfirmedView = document.getElementById('status-confirmed');
    const confirmedTimeDisplay = document.getElementById('confirmed-time-display');
    const demoApproveBtn = document.getElementById('demo-approve-btn');

    // --- FUNGSI UTAMA UNTUK RENDER ---
    function renderDashboard() {
        const bookingData = JSON.parse(localStorage.getItem('userBooking'));
        const urlParams = new URLSearchParams(window.location.search);
        // Ambil coachId dari URL sebagai prioritas, atau dari data booking jika ada
        const coachId = urlParams.get('coachId') || bookingData?.coachId;

        if (!bookingData || !coachId) {
            document.getElementById('app-container').innerHTML = '<p class="text-center p-8">No active booking found.</p>';
            return;
        }

        const coach = coachesData.find(c => c.id === coachId);
        if (!coach) {
             document.getElementById('app-container').innerHTML = '<p class="text-center p-8">Coach data not found.</p>';
            return;
        }

        // Isi info coach di bagian atas
        coachAvatarEl.src = coach.avatarUrl;
        coachNameEl.textContent = coach.name;
        offeringTitleEl.textContent = bookingData.offeringTitle;

        // Sembunyikan semua kartu status terlebih dahulu
        statusPendingView.classList.add('hidden');
        statusActiveView.classList.add('hidden');
        statusConfirmedView.classList.add('hidden');
        demoApproveBtn.classList.add('hidden'); // Sembunyikan tombol demo secara default

        // Tampilkan kartu status yang sesuai berdasarkan data
        switch (bookingData.status) {
            case 'pending_approval':
                statusPendingView.classList.remove('hidden');
                demoApproveBtn.classList.remove('hidden'); // Tampilkan tombol demo hanya saat pending
                break;
            case 'active':
                statusActiveView.classList.remove('hidden');
                // Pastikan link chat memiliki ID coach yang benar
                document.getElementById('active-chat-link').href = `coach-chat.html?coachId=${coach.id}`;
                break;
            case 'confirmed':
                statusConfirmedView.classList.remove('hidden');
                confirmedTimeDisplay.textContent = bookingData.scheduledTime;
                // Pastikan link chat memiliki ID coach yang benar
                document.getElementById('confirmed-chat-link').href = `coach-chat.html?coachId=${coach.id}`;
                break;
            default:
                // Jika status tidak dikenali, anggap saja masih pending
                statusPendingView.classList.remove('hidden');
        }
    }

    // --- EVENT LISTENERS ---
    // Hanya event listener untuk tombol demo yang ada di halaman ini
    if (demoApproveBtn) {
        demoApproveBtn.addEventListener('click', () => {
            const bookingData = JSON.parse(localStorage.getItem('userBooking'));
            if (bookingData) {
                // Ubah status menjadi 'active'
                bookingData.status = 'active';
                localStorage.setItem('userBooking', JSON.stringify(bookingData));
                alert('Coach has approved your request! Your consultation is now active.');
                renderDashboard(); // Render ulang halaman untuk menampilkan status baru
            }
        });
    }

    // --- INITIALIZATION ---
    // Panggil fungsi render saat halaman pertama kali dimuat
    renderDashboard();
});