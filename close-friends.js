// File: close-friends.js
// This script handles the interactive elements on the Manage Close Friends page.

document.addEventListener('DOMContentLoaded', () => {

    const toggleFriendStatus = (button) => {
        // Toggle between Add and Remove styles
        button.classList.toggle('add-friend-btn');
        button.classList.toggle('remove-friend-btn');

        // Change styles and icon based on the new status
        if (button.classList.contains('remove-friend-btn')) {
            // It's now a "Remove" button
            button.classList.remove('border-pink-500', 'text-pink-500', 'hover:bg-pink-50');
            button.classList.add('bg-pink-500', 'text-white', 'hover:bg-pink-600');
            button.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
        } else {
            // It's now an "Add" button
            button.classList.remove('bg-pink-500', 'text-white', 'hover:bg-pink-600');
            button.classList.add('border-pink-500', 'text-pink-500', 'hover:bg-pink-50');
            button.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>`;
        }
    };

    // Add event listeners to all friend buttons
    const friendButtons = document.querySelectorAll('.add-friend-btn, .remove-friend-btn');
    friendButtons.forEach(button => {
        button.addEventListener('click', () => {
            toggleFriendStatus(button);
        });
    });

    // NOTE: Plus button logic for the main nav could be added here if needed.

});
