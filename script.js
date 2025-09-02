document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const dropMessage = document.getElementById('drop-message');
    const fileInput = document.getElementById('file-input');
    const chooseImageBtn = document.getElementById('choose-image-btn');
    const originalImagePlaceholder = document.getElementById('original-image-data');
    const canvas = document.getElementById('canvas');
    const controls = document.getElementById('controls');
    const resetBtn = document.getElementById('reset-btn');
    const downloadBtn = document.getElementById('download-btn');
    const shadowSlider = document.getElementById('shadow-slider');
    const highlightSlider = document.getElementById('highlight-slider');

    const ctx = canvas.getContext('2d');
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

    let originalImageData = null;

    function applyDuotone(imageElement, shadowDominance, highlightDominance) {
        if (!imageElement || !imageElement.src) return;

        canvas.width = imageElement.naturalWidth;
        canvas.height = imageElement.naturalHeight;

        ctx.drawImage(imageElement, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const baseShadowColor = [55, 167, 126];
        const baseHighlightColor = [232, 114, 159];

        const shadowFactor = shadowDominance / 100;
        const highlightFactor = highlightDominance / 100;

        for (let i = 0; i < data.length; i += 4) {
            const red = data[i];
            const green = data[i + 1];
            const blue = data[i + 2];
            const alpha = data[i + 3];

            const luma = 0.299 * red + 0.587 * green + 0.114 * blue;

            const currentShadowR = baseShadowColor[0] * shadowFactor + red * (1 - shadowFactor);
            const currentShadowG = baseShadowColor[1] * shadowFactor + green * (1 - shadowFactor);
            const currentShadowB = baseShadowColor[2] * shadowFactor + blue * (1 - shadowFactor);

            const currentHighlightR = baseHighlightColor[0] * highlightFactor + red * (1 - highlightFactor);
            const currentHighlightG = baseHighlightColor[1] * highlightFactor + green * (1 - highlightFactor);
            const currentHighlightB = baseHighlightColor[2] * highlightFactor + blue * (1 - highlightFactor);

            const finalR = currentShadowR + (currentHighlightR - currentShadowR) * (luma / 255);
            const finalG = currentShadowG + (currentHighlightG - currentShadowG) * (luma / 255);
            const finalB = currentShadowB + (currentHighlightB - currentShadowB) * (luma / 255);

            data[i] = Math.min(255, Math.max(0, finalR));
            data[i + 1] = Math.min(255, Math.max(0, finalG));
            data[i + 2] = Math.min(255, Math.max(0, finalB));
            data[i + 3] = alpha;
        }

        ctx.putImageData(imageData, 0, 0);

        dropMessage.classList.add('hidden');
        canvas.classList.remove('hidden');
        controls.classList.remove('hidden');
    }

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
            originalImageData = e.target.result;
            originalImagePlaceholder.src = originalImageData;
            originalImagePlaceholder.onload = () => {
                applyDuotone(originalImagePlaceholder, shadowSlider.value, highlightSlider.value);
            };
        };
        reader.readAsDataURL(file);
    }

    function resetUI() {
        originalImageData = null;
        originalImagePlaceholder.src = "";
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        canvas.classList.add('hidden');
        dropMessage.classList.remove('hidden');
        controls.classList.add('hidden');

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

    resetBtn.addEventListener('click', resetUI);

    downloadBtn.addEventListener('click', () => {
        if (originalImageData) {
            const imageURL = canvas.toDataURL('image/jpeg', 0.9);
            const link = document.createElement('a');
            link.href = imageURL;
            link.download = 'duotone_image.jpeg';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });

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