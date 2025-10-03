document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const newJournalBtn = document.getElementById('new-journal-btn');
    const streakStatEl = document.getElementById('streak-stat');
    const wordsStatEl = document.getElementById('words-stat');
    const journalsYearStatEl = document.getElementById('journals-year-stat');
    const emptyStatePrompt = document.getElementById('empty-state-prompt'); // Elemen baru
    
    // --- Helper to get data from localStorage ---
    const getJournalEntries = () => JSON.parse(localStorage.getItem('journalEntries')) || {};

    // --- Calculation Functions ---
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

    function calculateLongestStreak(entries) {
        const dates = Object.keys(entries).sort();
        if (dates.length < 2) {
            return dates.length;
        }
        let longestStreak = 1;
        let currentStreak = 1;
        for (let i = 1; i < dates.length; i++) {
            const currentDate = new Date(dates[i]);
            const prevDate = new Date(dates[i - 1]);
            const diffDays = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                currentStreak++;
            } else {
                longestStreak = Math.max(longestStreak, currentStreak);
                currentStreak = 1;
            }
        }
        return Math.max(longestStreak, currentStreak);
    }

    // --- Main Logic to Update UI ---
    function updateDashboard() {
        const entries = getJournalEntries();
        const entryCount = Object.keys(entries).length;

        // 1. Selalu hitung dan tampilkan statistik
        streakStatEl.textContent = calculateLongestStreak(entries);
        wordsStatEl.textContent = calculateTotalWords(entries).toLocaleString('en-US');
        journalsYearStatEl.textContent = calculateJournalsThisYear(entries);

        // 2. Atur visibilitas teks ajakan dan teks tombol
        if (entryCount === 0) {
            newJournalBtn.textContent = 'Start Your First Journal';
            emptyStatePrompt.classList.remove('hidden'); // Tampilkan teks ajakan
        } else {
            newJournalBtn.textContent = 'Write a New Journal';
            emptyStatePrompt.classList.add('hidden'); // Sembunyikan teks ajakan
        }
    }

    // Initialize the dashboard
    updateDashboard();
});