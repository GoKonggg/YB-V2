document.addEventListener('DOMContentLoaded', () => {
    // --- All Element References ---
    const newJournalBtn = document.getElementById('new-journal-btn');
    const greetingHeaderEl = document.getElementById('greeting-header');
    const streakStatEl = document.getElementById('streak-stat');
    const wordsStatEl = document.getElementById('words-stat');
    const journalsYearStatEl = document.getElementById('journals-year-stat');
    const emptyStatePrompt = document.getElementById('empty-state-prompt');
    const recentEntriesSectionEl = document.getElementById('recent-entries-section');
    const recentEntriesListEl = document.getElementById('recent-entries-list');

    // --- Main Event Listener ---
    // This runs EVERY time the page is shown, including on initial load and when using the back button.
    // This is the key to solving the caching issue.
    window.addEventListener('pageshow', function(event) {
        updateDashboard();
    });

    // --- Main Function to Update the UI ---
    function updateDashboard() {
        setGreeting(); // Set the greeting every time
        const entries = getJournalEntries();
        const entryCount = Object.keys(entries).length;

        // Animate the main stats
        animateCountUp(streakStatEl, calculateCurrentStreak(entries));
        animateCountUp(wordsStatEl, calculateTotalWords(entries));
        animateCountUp(journalsYearStatEl, calculateJournalsThisYear(entries));
        
        // Show or hide recent entries
        displayRecentEntries(entries);

        // Adjust the main button and empty state visibility
        if (entryCount === 0) {
            newJournalBtn.textContent = 'Start Your First Journal';
            emptyStatePrompt.classList.remove('hidden');
        } else {
            newJournalBtn.textContent = 'Write a New Journal';
            emptyStatePrompt.classList.add('hidden');
        }
    }

    // --- Helper and Calculation Functions ---

    function getJournalEntries() {
        return JSON.parse(localStorage.getItem('journalEntries')) || {};
    }

    function setGreeting() {
        if (!greetingHeaderEl) return;
        const currentHour = new Date().getHours();
        let greetingText = '';

        if (currentHour >= 4 && currentHour < 12) {
            greetingText = 'Good Morning!';
        } else if (currentHour >= 12 && currentHour < 18) {
            greetingText = 'Good Afternoon!';
        } else {
            greetingText = 'Good Evening!';
        }
        greetingHeaderEl.textContent = greetingText;
    }

    function calculateCurrentStreak(entries) {
        const dates = Object.keys(entries).sort((a, b) => new Date(b) - new Date(a));
        if (dates.length === 0) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastEntryDate = new Date(dates[0]);
        lastEntryDate.setHours(0, 0, 0, 0);

        const diffFromToday = Math.round((today - lastEntryDate) / (1000 * 60 * 60 * 24));
        if (diffFromToday > 1) return 0;

        let currentStreak = 1;
        for (let i = 0; i < dates.length - 1; i++) {
            const currentDate = new Date(dates[i]);
            currentDate.setHours(0, 0, 0, 0);
            const prevDate = new Date(dates[i + 1]);
            prevDate.setHours(0, 0, 0, 0);
            const diffDays = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
        return currentStreak;
    }

    function calculateTotalWords(entries) {
        let totalWords = 0;
        const tempDiv = document.createElement('div');
        for (const key in entries) {
            const entry = entries[key];
            if (entry.title) {
                totalWords += entry.title.split(/\s+/).filter(Boolean).length;
            }
            if (entry.body) {
                tempDiv.innerHTML = entry.body;
                const bodyText = tempDiv.textContent || tempDiv.innerText || "";
                totalWords += bodyText.split(/\s+/).filter(Boolean).length;
            }
        }
        return totalWords;
    }

    function calculateJournalsThisYear(entries) {
        const currentYear = new Date().getFullYear().toString();
        return Object.keys(entries).filter(dateKey => dateKey.startsWith(currentYear)).length;
    }

    function displayRecentEntries(entries) {
        const entryCount = Object.keys(entries).length;
        if (entryCount === 0) {
            recentEntriesSectionEl.classList.add('hidden');
            return;
        }

        recentEntriesSectionEl.classList.remove('hidden');
        recentEntriesListEl.innerHTML = '';

        const sortedDates = Object.keys(entries).sort((a, b) => new Date(b) - new Date(a));
        const recentDates = sortedDates.slice(0, 2);

        recentDates.forEach(dateKey => {
            const entry = entries[dateKey];
            const entryDate = new Date(dateKey);
            const formattedDate = entryDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric'
            });
            const entryHTML = `
                <a href="journal.html?date=${dateKey}" class="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-pink-300 transition-all duration-200">
                    <p class="font-semibold text-gray-800 truncate">${entry.title || 'No Title'}</p>
                    <p class="text-sm text-gray-500 mt-1">${formattedDate}</p>
                </a>`;
            recentEntriesListEl.innerHTML += entryHTML;
        });
    }

    function animateCountUp(element, target) {
        const duration = 1200;
        const endValue = parseInt(target, 10);
        if (isNaN(endValue)) {
            element.textContent = target;
            return;
        }

        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const currentValue = Math.floor(progress * endValue);
            element.textContent = currentValue.toLocaleString('en-US');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});