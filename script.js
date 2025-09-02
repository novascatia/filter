document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const chooseImageBtn = document.getElementById('choose-image-btn');
    const previewImage = document.getElementById('preview-image');
    const canvas = document.getElementById('canvas');
    const controls = document.getElementById('controls');
    const ctx = canvas.getContext('2d');

    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

    // Fungsi untuk mengaplikasikan filter duotone
    function applyDuotone(image) {
        // Tentukan ukuran canvas agar sama dengan gambar
        canvas.width = image.width;
        canvas.height = image.height;

        // Gambar ulang gambar asli ke canvas
        ctx.drawImage(image, 0, 0);

        // Ambil data piksel dari canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Definisikan warna untuk bayangan dan sorotan
        const shadowColor = [55, 167, 126]; // Hijau
        const highlightColor = [232, 114, 159]; // Pink

        // Iterasi setiap piksel dan ubah warnanya
        for (let i = 0; i < data.length; i += 4) {
            // Hitung nilai grayscale (rata-rata dari R, G, B)
            const red = data[i];
            const green = data[i + 1];
            const blue = data[i + 2];
            const grayscale = (red + green + blue) / 3;

            // Terapkan duotone berdasarkan nilai grayscale
            // Interpolasi linear antara shadow dan highlight
            const r = shadowColor[0] + (highlightColor[0] - shadowColor[0]) * (grayscale / 255);
            const g = shadowColor[1] + (highlightColor[1] - shadowColor[1]) * (grayscale / 255);
            const b = shadowColor[2] + (highlightColor[2] - shadowColor[2]) * (grayscale / 255);

            data[i] = r;     // Red
            data[i + 1] = g; // Green
            data[i + 2] = b; // Blue
        }

        // Tulis kembali data piksel yang sudah diubah ke canvas
        ctx.putImageData(imageData, 0, 0);

        // Tampilkan canvas dan sembunyikan elemen lain
        canvas.hidden = false;
        dropArea.querySelector('.drop-message').hidden = true;
        controls.hidden = false;
    }

    // Fungsi untuk menangani file yang diunggah
    function handleFiles(files) {
        if (files.length === 0) return;
        const file = files[0];

        if (file.size > MAX_FILE_SIZE) {
            alert('Ukuran file melebihi 25MB. Silakan pilih file yang lebih kecil.');
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('Tolong unggah file gambar yang valid.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                applyDuotone(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Event listeners
    chooseImageBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('hover');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('hover');
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('hover');
        handleFiles(e.dataTransfer.files);
    });
});