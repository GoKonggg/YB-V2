document.addEventListener('DOMContentLoaded', () => {

    const plusButton = document.getElementById('plus-button');
    if (plusButton) {
        const plusIcon = plusButton.querySelector('svg');
        const emblemMenu = document.getElementById('emblem-menu');
        const menuOverlay = document.getElementById('menu-overlay');

        if (emblemMenu && menuOverlay) {
            plusButton.addEventListener('click', (event) => {
                event.stopPropagation();
                const isHidden = emblemMenu.classList.toggle('hidden');
                menuOverlay.classList.toggle('hidden');
                if (!isHidden) {
                    plusIcon.style.transform = 'rotate(45deg)';
                } else {
                    plusIcon.style.transform = 'rotate(0deg)';
                }
            });

            menuOverlay.addEventListener('click', () => {
                emblemMenu.classList.add('hidden');
                menuOverlay.classList.add('hidden');
                plusIcon.style.transform = 'rotate(0deg)';
            });
        }
    }

    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        const linkTextSpan = link.querySelector('span');

        if (linkPath === currentPage) {
            link.classList.remove('text-gray-600');
            link.classList.add('text-pink-500');
            if (linkTextSpan) {
                linkTextSpan.classList.add('font-bold');
            }
        } else {
            link.classList.add('text-gray-600');
            link.classList.remove('text-pink-500');
            if (linkTextSpan) {
                linkTextSpan.classList.remove('font-bold');
            }
        }
    });

});
