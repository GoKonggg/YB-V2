document.addEventListener('DOMContentLoaded', () => {
        
        const plusButton = document.getElementById('plus-button');
        const plusIcon = plusButton.querySelector('svg');
        const emblemMenu = document.getElementById('emblem-menu');
        const menuOverlay = document.getElementById('menu-overlay');

        if (plusButton && emblemMenu && menuOverlay) {
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
    });