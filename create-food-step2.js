// File: create-food-step2.js (Step 2)

document.addEventListener('DOMContentLoaded', () => {
    const createFoodForm = document.getElementById('create-food-form-step2');

    // Pastikan kita ada di halaman yang benar
    if (!createFoodForm) {
        return;
    }

    // Ambil data dari langkah 1 di sessionStorage
    const foodDataPart1JSON = sessionStorage.getItem('newCustomFoodData');

    // PENTING: Jika pengguna mendarat di sini tanpa melewati langkah 1,
    // kembalikan mereka ke awal untuk mencegah error.
    if (!foodDataPart1JSON) {
        alert("Please complete step 1 first!");
        window.location.href = 'create-food.html';
        return;
    }

    const foodDataPart1 = JSON.parse(foodDataPart1JSON);

    createFoodForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // 1. Ambil data mikronutrien dari form saat ini
        const micronutrients = {
            sugar: parseInt(document.getElementById('sugar').value, 10) || 0,
            fiber: parseInt(document.getElementById('fiber').value, 10) || 0,
            sodium: parseInt(document.getElementById('sodium').value, 10) || 0,
            potassium: parseInt(document.getElementById('potassium').value, 10) || 0,
            vitA: parseInt(document.getElementById('vit-a').value, 10) || 0,
            vitC: parseInt(document.getElementById('vit-c').value, 10) || 0,
            vitD: parseInt(document.getElementById('vit-d').value, 10) || 0,
            vitE: parseInt(document.getElementById('vit-e').value, 10) || 0,
            calcium: parseInt(document.getElementById('calcium').value, 10) || 0,
            iron: parseInt(document.getElementById('iron').value, 10) || 0,
            magnesium: parseInt(document.getElementById('magnesium').value, 10) || 0,
            zinc: parseInt(document.getElementById('zinc').value, 10) || 0
        };

        // 2. Gabungkan data dari langkah 1 dan langkah 2
        const completeFoodData = {
            ...foodDataPart1, // Salin semua properti dari objek langkah 1
            micronutrients: micronutrients // Tambahkan properti baru berisi mikronutrien
        };
        
        // 3. Simpan data lengkap ke localStorage (penyimpanan permanen)
        const myFoodList = JSON.parse(localStorage.getItem('myFoodList')) || [];
        myFoodList.push(completeFoodData);
        localStorage.setItem('myFoodList', JSON.stringify(myFoodList));

        // 4. Hapus data sementara dari sessionStorage setelah berhasil disimpan
        sessionStorage.removeItem('newCustomFoodData');

        // 5. Beri notifikasi dan arahkan kembali ke halaman daftar makanan
        alert(`${completeFoodData.name} has been successfully saved!`);
        window.location.href = 'add-food.html';
    });
});