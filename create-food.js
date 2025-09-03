// File: create-food.js (Step 1)

document.addEventListener('DOMContentLoaded', () => {
    const createFoodForm = document.getElementById('create-food-form-step1');

    // Pastikan kita ada di halaman yang benar
    if (!createFoodForm) {
        return;
    }

    createFoodForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // 1. Ambil semua nilai dari input
        const foodName = document.getElementById('food-name').value.trim();
        const brandName = document.getElementById('brand-name').value.trim();
        const servingAmount = document.getElementById('serving-amount').value;
        const servingUnit = document.getElementById('serving-unit').value.trim();
        const calories = parseInt(document.getElementById('calories').value, 10);
        
        const carbs = parseInt(document.getElementById('carbs').value, 10) || 0;
        const protein = parseInt(document.getElementById('protein').value, 10) || 0;
        const fat = parseInt(document.getElementById('fat').value, 10) || 0;

        // 2. Validasi sederhana
        if (!foodName || !servingAmount || !servingUnit || !calories) {
            alert('Please fill all required fields before proceeding.');
            return;
        }

        // 3. Buat objek untuk data dari langkah pertama
        const foodDataPart1 = {
            id: `myfood-${Date.now()}`,
            name: foodName,
            brand: brandName,
            serving: `${servingAmount} ${servingUnit}`,
            calories: calories,
            macros: {
                carbs: carbs,
                protein: protein,
                fat: fat
            }
        };

        // 4. Simpan sementara ke sessionStorage
        // sessionStorage adalah penyimpanan yang akan hilang saat browser ditutup
        sessionStorage.setItem('newCustomFoodData', JSON.stringify(foodDataPart1));

        // 5. Arahkan ke halaman langkah kedua
        window.location.href = 'create-food-step2.html';
    });
});