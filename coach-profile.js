document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const coachAvatar = document.getElementById('coach-avatar');
    const coachName = document.getElementById('coach-name');
    const coachSpecialty = document.getElementById('coach-specialty');
    const coachRating = document.getElementById('coach-rating');
    const coachBio = document.getElementById('coach-bio');
    const coachStats = document.getElementById('coach-stats');
    const certificationsList = document.getElementById('certifications-list');
    const testimonialsList = document.getElementById('testimonials-list');
    const programsCarousel = document.getElementById('programs-carousel');
    const consultationOptions = document.getElementById('consultation-options');
    const programsByCoachSection = document.getElementById('programs-by-coach-section');
    const bookButton = document.querySelector('.absolute.bottom-0 button');

    // Selector untuk modal booking
    const bookingModalOverlay = document.getElementById('booking-modal-overlay');
    const bookingConfirmationView = document.getElementById('booking-confirmation-view');
    const bookingSuccessView = document.getElementById('booking-success-view');
    const bookingSummary = document.getElementById('booking-summary');
    const cancelBookingBtn = document.getElementById('cancel-booking-btn');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    const bookingDoneBtn = document.getElementById('booking-done-btn');

    // Tambahkan ini di bagian ELEMENT SELECTORS
    const backLink = document.getElementById('back-link');
    // State untuk menyimpan pilihan dan data coach
    let selectedOffering = null;
    let currentCoach = null; 

    // --- RENDER FUNCTIONS ---
    function renderStats(stats) {
        if (!stats || !coachStats) return;
        coachStats.innerHTML = `
            <div>
                <p class="font-bold text-xl text-gray-800">${stats.experience}</p>
                <p class="text-xs text-gray-500">Years Exp.</p>
            </div>
            <div>
                <p class="font-bold text-xl text-gray-800">${stats.clients}</p>
                <p class="text-xs text-gray-500">Happy Clients</p>
            </div>
            <div>
                <p class="font-bold text-xl text-gray-800">${stats.certifications}</p>
                <p class="text-xs text-gray-500">Certifications</p>
            </div>
        `;
    }

    function renderCertifications(certifications) {
        if (!certifications || !certificationsList) return;
        certificationsList.innerHTML = '';
        certifications.forEach(cert => {
            const listItem = document.createElement('li');
            listItem.className = 'flex items-center bg-white/60 p-3 rounded-lg shadow-sm';
            listItem.innerHTML = `
                <svg class="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                <span class="text-gray-700">${cert}</span>
            `;
            certificationsList.appendChild(listItem);
        });
    }

    function renderTestimonials(testimonials) {
        if (!testimonials || !testimonialsList) return;
        testimonialsList.innerHTML = '';
        testimonials.forEach(testimonial => {
            const testimonialCard = document.createElement('div');
            testimonialCard.className = 'bg-white p-4 rounded-xl shadow-lg shadow-slate-200/50 border border-black/5';
            testimonialCard.innerHTML = `
                <p class="text-gray-600 italic">"${testimonial.quote}"</p>
                <p class="text-right font-semibold text-sm text-gray-800 mt-2">- ${testimonial.name}</p>
                <div class="mt-4 grid grid-cols-2 gap-2 text-center">
                    <img src="${testimonial.beforeImageUrl}" alt="Before photo" class="bg-gray-200 rounded-lg h-24 w-full object-cover">
                    <img src="${testimonial.afterImageUrl}" alt="After photo" class="bg-gray-200 rounded-lg h-24 w-full object-cover">
                </div>
            `;
            testimonialsList.appendChild(testimonialCard);
        });
    }

    function renderPrograms(programIds) {
        if (!programIds || programIds.length === 0) {
            if (programsByCoachSection) programsByCoachSection.style.display = 'none';
            return;
        }
        programsCarousel.innerHTML = '';
        programIds.forEach(id => {
            const program = programsData.find(p => p.id === id);
            if (program) {
                const programCard = document.createElement('a');
                programCard.href = `marketplace.html`;
                programCard.className = 'flex-shrink-0 w-52 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow';
                programCard.innerHTML = `<img src="${program.image}" alt="${program.title}" class="h-24 w-full object-cover"><div class="p-3"><p class="font-semibold text-sm truncate">${program.title}</p><p class="text-fuchsia-600 font-bold text-sm mt-1">$${program.price}</p></div>`;
                programsCarousel.appendChild(programCard);
            }
        });
    }

    function renderOfferings(offerings) {
        consultationOptions.innerHTML = '';
        offerings.forEach(offer => {
            const isPopular = offer.isPopular || false;
            const optionCard = document.createElement('div');
            optionCard.className = `offering-card bg-white p-4 rounded-xl border-2 border-transparent cursor-pointer transition-all relative`;
            optionCard.dataset.offerTitle = offer.title;
            let popularBadge = isPopular ? `<span class="absolute top-0 -translate-y-1/2 bg-primary-gradient text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>` : '';
            let priceDuration = offer.duration ? `<span class="text-sm font-medium text-gray-500">/ ${offer.duration}</span>` : '';
            optionCard.innerHTML = `${popularBadge}<p class="font-bold text-gray-800 pointer-events-none">${offer.title}</p><p class="text-sm text-gray-500 mt-1 pointer-events-none">${offer.description}</p><p class="text-right font-bold text-xl text-gray-900 mt-2 pointer-events-none">$${offer.price} ${priceDuration}</p>`;
            consultationOptions.appendChild(optionCard);
        });
    }

    function handleSelection(selectedCard) {
        if (!selectedCard || !currentCoach) return;

        const offerTitle = selectedCard.dataset.offerTitle;
        selectedOffering = currentCoach.offerings.find(o => o.title === offerTitle);

        document.querySelectorAll('.offering-card').forEach(card => {
            card.classList.remove('ring-2', 'ring-fuchsia-500', 'ring-offset-2');
        });
        
        selectedCard.classList.add('ring-2', 'ring-fuchsia-500', 'ring-offset-2');

        if (selectedOffering) {
            bookButton.textContent = `Book: ${selectedOffering.title} - $${selectedOffering.price}`;
        }
    }

    // --- FUNGSI UNTUK BOOKING ---
    function openBookingModal() {
        if (!selectedOffering || !currentCoach) {
            alert('Please select a consultation option first.');
            return;
        }

        bookingSummary.innerHTML = `
            <div class="flex justify-between"><span class="text-gray-500">Coach:</span><span class="font-semibold text-gray-800">${currentCoach.name}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Service:</span><span class="font-semibold text-gray-800">${selectedOffering.title}</span></div>
            <div class="flex justify-between pt-2 border-t border-gray-200"><span class="font-bold text-gray-500">Total:</span><span class="font-bold text-fuchsia-600">$${selectedOffering.price}</span></div>
        `;

        bookingConfirmationView.classList.remove('hidden');
        bookingSuccessView.classList.add('hidden');
        bookingModalOverlay.classList.remove('hidden');
    }

    function closeBookingModal() {
        bookingModalOverlay.classList.add('hidden');
    }

    function handlePaymentConfirmation() {
    confirmPaymentBtn.textContent = 'Processing...';
    confirmPaymentBtn.disabled = true;

    // [DIUBAH] Simpan data booking dengan status yang benar
    const newBooking = {
        bookingId: `booking_${Date.now()}`,
        coachId: currentCoach.id,
        offeringTitle: selectedOffering.title,
        status: 'pending_approval', // Status awal adalah pending
        scheduledTime: null // Jadwal masih kosong
    };
    localStorage.setItem('userBooking', JSON.stringify(newBooking));

    setTimeout(() => {
        bookingConfirmationView.classList.add('hidden');
        bookingSuccessView.classList.remove('hidden');
        
        confirmPaymentBtn.textContent = 'Confirm & Pay';
        confirmPaymentBtn.disabled = false;
    }, 1500);
}

    // --- MAIN LOGIC ---
    const urlParams = new URLSearchParams(window.location.search);
    const coachId = urlParams.get('id');

    const fromPage = urlParams.get('from');
if (backLink) { // Pastikan elemen backLink ada
    if (fromPage === 'editor') {
        backLink.href = 'coach-profile-editor.html';
    } else {
        // Defaultnya adalah kembali ke marketplace
        backLink.href = 'marketplace.html';
    }
}
    const coach = coachesData.find(c => c.id === coachId);
    currentCoach = coach; 

    if (coach) {
        coachAvatar.src = coach.avatarUrl;
        coachAvatar.alt = `Coach ${coach.name}`;
        coachName.textContent = coach.name;
        coachSpecialty.textContent = coach.specialty;
        coachRating.textContent = coach.rating;
        coachBio.textContent = coach.bio;

        renderStats(coach.stats);
        renderCertifications(coach.certifications);
        renderTestimonials(coach.testimonials);
        renderPrograms(coach.sellsPrograms);
        renderOfferings(coach.offerings);

        const popularOffering = coach.offerings.find(o => o.isPopular);
        if (popularOffering) {
            const popularCard = document.querySelector(`[data-offer-title="${popularOffering.title}"]`);
            if (popularCard) {
                handleSelection(popularCard);
            }
        }
    } else {
        document.querySelector('#app-container').innerHTML = '<div class="p-8 text-center"><h2 class="text-2xl font-bold">Coach Not Found</h2><a href="marketplace.html" class="text-pink-500 mt-4 inline-block">Back to Marketplace</a></div>';
    }
    
    // --- EVENT LISTENERS ---
    consultationOptions.addEventListener('click', (e) => {
        const selectedCard = e.target.closest('.offering-card');
        handleSelection(selectedCard);
    });

    bookButton.addEventListener('click', openBookingModal);
    cancelBookingBtn.addEventListener('click', closeBookingModal);
    // Di coach-profile.js
bookingDoneBtn.addEventListener('click', () => {
    closeBookingModal();
    // Arahkan ke halaman baru sambil membawa ID coach
    window.location.href = `my-coach.html?coachId=${currentCoach.id}`;
});
    confirmPaymentBtn.addEventListener('click', handlePaymentConfirmation);
});