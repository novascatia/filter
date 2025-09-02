document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const dropMessage = document.getElementById('drop-message');
    const fileInput = document.getElementById('file-input');
    const chooseImageBtn = document.getElementById('choose-image-btn');
    const originalImagePlaceholder = document.getElementById('original-image-data'); // img tag untuk menyimpan gambar asli
    const canvas = document.getElementById('canvas');
    const controls = document.getElementById('controls');
    const resetBtn = document.getElementById('reset-btn');
    const shadowSlider = document.getElementById('shadow-slider');
    const highlightSlider = document.getElementById('highlight-slider');

    const ctx = canvas.getContext('2d');
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

    let originalImageData = null; // Menyimpan data URL gambar asli yang diunggah

    // Fungsi untuk mengaplikasikan filter duotone
    // Menerima nilai persentase untuk dominasi shadow dan highlight
    function applyDuotone(imageElement, shadowDominance, highlightDominance) {
        if (!imageElement || !imageElement.src) return; // Pastikan ada gambar

        // Atur ukuran canvas agar sama dengan gambar
        canvas.width = imageElement.naturalWidth;
        canvas.height = imageElement.naturalHeight;

        // Gambar ulang gambar asli ke canvas
        ctx.drawImage(imageElement, 0, 0);

        // Ambil data piksel dari canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Definisikan warna dasar untuk bayangan dan sorotan
        // Warna ini akan dicampur berdasarkan dominasi slider
        const baseShadowColor = [55, 167, 126]; // Hijau
        const baseHighlightColor = [232, 114, 159]; // Pink

        // Hitung faktor dominasi dari slider (0.0 - 1.0)
        const shadowFactor = shadowDominance / 100;
        const highlightFactor = highlightDominance / 100;

        for (let i = 0; i < data.length; i += 4) {
            const red = data[i];
            const green = data[i + 1];
            const blue = data[i + 2];
            const alpha = data[i + 3]; // Alpha channel

            // Hitung nilai grayscale (luminositas)
            // Menggunakan rumus yang lebih akurat untuk luminositas
            const luma = 0.299 * red + 0.587 * green + 0.114 * blue; // 0-255

            // Interpolasi warna untuk shadow dan highlight berdasarkan luma
            // Semakin gelap (luma rendah), semakin condong ke shadowColor
            // Semakin terang (luma tinggi), semakin condong ke highlightColor

            // Warna shadow yang disesuaikan
            const currentShadowR = baseShadowColor[0] * shadowFactor + red * (1 - shadowFactor);
            const currentShadowG = baseShadowColor[1] * shadowFactor + green * (1 - shadowFactor);
            const currentShadowB = baseShadowColor[2] * shadowFactor + blue * (1 - shadowFactor);

            // Warna highlight yang disesuaikan
            const currentHighlightR = baseHighlightColor[0] * highlightFactor + red * (1 - highlightFactor);
            const currentHighlightG = baseHighlightColor[1] * highlightFactor + green * (1 - highlightFactor);
            const currentHighlightB = baseHighlightColor[2] * highlightFactor + blue * (1 - highlightFactor);

            // Interpolasi akhir antara shadow yang disesuaikan dan highlight yang disesuaikan
            const finalR = currentShadowR + (currentHighlightR - currentShadowR) * (luma / 255);
            const finalG = currentShadowG + (currentHighlightG - currentShadowG) * (luma / 255);
            const finalB = currentShadowB + (currentHighlightB - currentShadowB) * (luma / 255);

            data[i] = Math.min(255, Math.max(0, finalR));     // Red
            data[i + 1] = Math.min(255, Math.max(0, finalG)); // Green
            data[i + 2] = Math.min(255, Math.max(0, finalB)); // Blue
            data[i + 3] = alpha; // Pertahankan alpha
        }

        ctx.putImageData(imageData, 0, 0);

        // Tampilkan canvas dan sembunyikan pesan drop
        dropMessage.classList.add('hidden');
        canvas.classList.remove('hidden');
        controls.classList.remove('hidden');
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
            originalImageData = e.target.result; // Simpan data URL asli
            originalImagePlaceholder.src = originalImageData; // Set src untuk elemen img
            originalImagePlaceholder.onload = () => {
                // Terapkan filter pertama kali dengan nilai slider default
                applyDuotone(originalImagePlaceholder, shadowSlider.value, highlightSlider.value);
            };
        };
        reader.readAsDataURL(file);
    }

    // Fungsi untuk mereset UI
    function resetUI() {
        originalImageData = null;
        originalImagePlaceholder.src = "";
        
        // Hapus isi canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Sembunyikan canvas dan tampilkan pesan drop
        canvas.classList.add('hidden');
        dropMessage.classList.remove('hidden');
        controls.classList.add('hidden');

        // Reset slider ke nilai default
        shadowSlider.value = 50;
        highlightSlider.value = 50;
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

    // Event listener untuk tombol reset
    resetBtn.addEventListener('click', resetUI);

    // Event listeners untuk slider
    shadowSlider.addEventListener('input', () => {
        if (originalImageData) {
            applyDuotone(originalImagePlaceholder, shadowSlider.value, highlightSlider.value);
        }
    });

    highlightSlider.addEventListener('input', () => {
        if (originalImageData) {
            applyDuotone(originalImagePlaceholder, shadowSlider.value, highlightSlider.value);
        }
    });
});