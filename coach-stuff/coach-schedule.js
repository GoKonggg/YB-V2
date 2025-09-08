document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    // Tampilan Utama
    const monthYearDisplay = document.getElementById('month-year-display');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const todayBtn = document.getElementById('today-btn');
    const agendaViewContainer = document.getElementById('schedule-agenda-view');
    const miniCalendarDays = document.getElementById('mini-calendar-days');
    const plusButton = document.getElementById('plus-button');

    // Modal & Form Elements
    const addScheduleModal = document.getElementById('add-schedule-modal');
    const addScheduleCard = document.getElementById('add-schedule-card');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const scheduleForm = document.getElementById('add-schedule-form');
    const clientSelect = document.getElementById('client-select');

    // --- STATE MANAGEMENT ---
    let displayDate = new Date();
    let selectedDate = new Date();

    // =======================================================
    // MODAL LOGIC
    // =======================================================

    const openAddScheduleModal = () => {
        scheduleForm.reset(); // Selalu reset form saat dibuka
        addScheduleModal.classList.remove('hidden');
        setTimeout(() => {
            addScheduleCard.classList.remove('opacity-0', 'scale-95');
        }, 10);
    };

    const closeAddScheduleModal = () => {
        addScheduleCard.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            addScheduleModal.classList.add('hidden');
        }, 200);
    };

    const populateClientDropdown = () => {
        if (!clientSelect) return;
        clientSelect.innerHTML = '<option value="">Select an option...</option>';
        
        const personalOption = document.createElement('option');
        personalOption.value = 'personal';
        personalOption.textContent = '-- Personal Event --';
        clientSelect.appendChild(personalOption);

        const separator = document.createElement('option');
        separator.disabled = true;
        separator.textContent = '──────────';
        clientSelect.appendChild(separator);
        
        coachClients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            clientSelect.appendChild(option);
        });
    };

    // =======================================================
    // RENDER FUNCTIONS (Kalender & Agenda)
    // =======================================================

    const renderMiniCalendar = () => {
        miniCalendarDays.innerHTML = '';
        const daysInMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0).getDate();
        
        for (let i = 1; i <= daysInMonth; i++) {
            const day = new Date(displayDate.getFullYear(), displayDate.getMonth(), i);
            const dateKey = day.toISOString().split('T')[0];
            const dayWrapper = document.createElement('div');
            dayWrapper.className = 'day-wrapper flex-shrink-0 text-center w-12 h-16 p-1 rounded-lg cursor-pointer hover:bg-gray-200/50 transition-colors';
            dayWrapper.dataset.date = day.toISOString();

            if (day.toDateString() === selectedDate.toDateString()) {
                dayWrapper.classList.add('selected');
            }

            const isToday = day.toDateString() === new Date().toDateString();
            const hasEvents = scheduleData.some(event => event.date === dateKey);

            dayWrapper.innerHTML = `
                <span class="text-xs font-semibold text-gray-500">${day.toLocaleString('en-US', { weekday: 'short' }).toUpperCase()}</span>
                <p class="font-bold text-lg mt-1 ${isToday ? 'today-dot w-7 h-7 mx-auto flex items-center justify-center rounded-full' : ''}">${i}</p>
                <div class="h-2 flex justify-center items-center mt-1">
                    ${hasEvents ? '<div class="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>' : ''}
                </div>`;
            miniCalendarDays.appendChild(dayWrapper);
        }
    };

    const renderAgendaView = () => {
        agendaViewContainer.innerHTML = ''; 
        monthYearDisplay.textContent = displayDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        const firstDayOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
        const lastDayOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0);

        const eventsThisMonth = scheduleData.filter(event => {
            const eventDate = new Date(event.date + 'T00:00:00');
            return eventDate >= firstDayOfMonth && eventDate <= lastDayOfMonth;
        }).sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
        
        const groupedEvents = eventsThisMonth.reduce((acc, event) => {
            (acc[event.date] = acc[event.date] || []).push(event);
            return acc;
        }, {});

        if (Object.keys(groupedEvents).length === 0) {
            agendaViewContainer.innerHTML = `<p class="text-center text-gray-500 mt-16">No events scheduled for this month.</p>`;
            return;
        }

        for (const dateKey in groupedEvents) {
            const date = new Date(dateKey + 'T00:00:00');
            const dayEvents = groupedEvents[dateKey];
            const dayGroupEl = document.createElement('div');
            dayGroupEl.id = `date-group-${dateKey}`;
            const isToday = (date.toDateString() === new Date().toDateString());
            
            dayGroupEl.innerHTML = `
                <h3 class="date-header text-lg flex items-center space-x-3 ${isToday ? 'today' : ''}">
                    <span class="day-number text-2xl font-bold">${date.getDate()}</span>
                    <span class="day-name font-semibold">${date.toLocaleString('en-US', { weekday: 'long' })}</span>
                </h3>`;
            
            const eventsContainer = document.createElement('div');
            eventsContainer.className = 'space-y-3 mt-3 pl-4 border-l-2 border-gray-200 ml-4';
            
            dayEvents.forEach(event => {
                const client = coachClients.find(c => c.id === event.clientId);
                const eventCard = document.createElement('div');
                eventCard.className = 'event-card -ml-6';
                
                let cardDetailsHTML = '';
                if (client) {
                    cardDetailsHTML = `
                        <div class="event-timeline" style="background-color: #fbcfe8;"></div>
                        <div class="event-details" style="background-color: #fdf2f8; border-left-color: #f472b6;">
                            <p class="font-bold text-gray-900">${event.title}</p>
                            <p class="text-sm text-gray-600">with ${client.name}</p>
                        </div>`;
                } else {
                    cardDetailsHTML = `
                        <div class="event-timeline" style="background-color: #e5e7eb;"></div>
                        <div class="event-details" style="background-color: #f9fafb; border-left-color: #9ca3af;">
                            <p class="font-bold text-gray-900">${event.title}</p>
                            <p class="text-sm text-gray-500">Personal Event</p>
                        </div>`;
                }
                
                eventCard.innerHTML = `<div class="event-time">${event.time}</div>${cardDetailsHTML}`;
                eventsContainer.appendChild(eventCard);
            });
            
            dayGroupEl.appendChild(eventsContainer);
            agendaViewContainer.appendChild(dayGroupEl);
        }
    };
    
    const updateAllViews = () => {
        renderMiniCalendar();
        renderAgendaView();
    };

    // =======================================================
    // EVENT LISTENERS
    // =======================================================
    
    prevMonthBtn.addEventListener('click', () => {
        displayDate.setMonth(displayDate.getMonth() - 1);
        updateAllViews();
    });

    nextMonthBtn.addEventListener('click', () => {
        displayDate.setMonth(displayDate.getMonth() + 1);
        updateAllViews();
    });

    todayBtn.addEventListener('click', () => {
        displayDate = new Date();
        selectedDate = new Date();
        updateAllViews();
        const todayKey = selectedDate.toISOString().split('T')[0];
        const todayGroup = document.getElementById(`date-group-${todayKey}`);
        if (todayGroup) {
            agendaViewContainer.scrollTo({ top: todayGroup.offsetTop, behavior: 'smooth' });
        }
    });
    
    miniCalendarDays.addEventListener('click', (e) => {
        const dayEl = e.target.closest('.day-wrapper');
        if (dayEl) {
            selectedDate = new Date(dayEl.dataset.date);
            renderMiniCalendar();
            const dateKey = selectedDate.toISOString().split('T')[0];
            const targetGroup = document.getElementById(`date-group-${dateKey}`);
            if (targetGroup) {
                agendaViewContainer.scrollTo({ top: targetGroup.offsetTop, behavior: 'smooth' });
            }
        }
    });

    if (plusButton) plusButton.addEventListener('click', openAddScheduleModal);
    closeModalBtn.addEventListener('click', closeAddScheduleModal);
    addScheduleModal.addEventListener('click', (e) => {
        if (e.target === addScheduleModal) closeAddScheduleModal();
    });

    scheduleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedValue = clientSelect.value;
        const newEvent = {
            date: document.getElementById('event-date').value,
            time: document.getElementById('event-time').value,
            title: document.getElementById('event-title').value,
            clientId: selectedValue !== 'personal' && selectedValue !== '' ? selectedValue : null,
        };
        scheduleData.push(newEvent);
        displayDate = new Date(newEvent.date + 'T00:00:00');
        selectedDate = new Date(newEvent.date + 'T00:00:00');
        updateAllViews();
        closeAddScheduleModal();
    });

    // --- INITIALIZATION ---
    populateClientDropdown();
    updateAllViews();
});