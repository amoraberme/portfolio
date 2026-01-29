document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hero-sequence');
    const context = canvas.getContext('2d');
    const container = document.querySelector('.scroll-track');
    // sticky-hero is the viewport height reference
    const stickyContainer = document.querySelector('.sticky-hero');

    // Configuration
    const frameCount = 118;
    // URL Encoded path for "me zip"
    const imgFolder = 'images/me%20zip/';
    const imgPrefix = 'ezgif-frame-';
    const imgExt = '.jpg';

    // State
    const images = [];
    const imageObjects = {}; // Cache loaded images
    let loadedCount = 0;
    let currentFrame = 0;

    // Set canvas dimensions to match viewport
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Re-render current frame on resize to maintain cover/position
        if (loadedCount > 0) {
            renderFrame(currentFrame || 1);
        }
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Preload Images
    function preloadImages() {
        console.log('Starting sequence preload from:', imgFolder);
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            // Format number to 3 digits (001, 002... 118)
            const index = i.toString().padStart(3, '0');
            const src = `${imgFolder}${imgPrefix}${index}${imgExt}`;

            img.src = src;
            img.onload = () => {
                imageObjects[i] = img;
                loadedCount++;
                if (loadedCount === 1) {
                    console.log('First frame loaded');
                    // Draw first frame immediately once loaded
                    renderFrame(1);
                }
                if (loadedCount === frameCount) {
                    console.log('All frames loaded');
                }
            };
            img.onerror = (e) => {
                console.error('Failed to load frame:', src, e);
            };
            images.push(src);
        }
    }

    // Render Logic
    function renderFrame(index) {
        // Clamp index
        index = Math.max(1, Math.min(index, frameCount));

        const img = imageObjects[index];
        if (!img) return;

        context.clearRect(0, 0, canvas.width, canvas.height);

        // Object-fit: cover logic
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;

        let customWidth, customHeight;
        let offsetX, offsetY;

        if (canvasRatio > imgRatio) {
            // Canvas is wider than image -> fit width
            customWidth = canvas.width;
            customHeight = canvas.width / imgRatio;
        } else {
            // Canvas is taller than image -> fit height
            customHeight = canvas.height;
            customWidth = canvas.height * imgRatio;
        }

        // Positioning
        // User requested: "off center leaning towards right"
        const alignX = 0.7; // 70% towards right
        const alignY = 0.5; // Center Y

        offsetX = (canvas.width - customWidth) * alignX;
        offsetY = (canvas.height - customHeight) * alignY;

        context.drawImage(img, offsetX, offsetY, customWidth, customHeight);
    }

    // Scroll Logic
    function handleScroll() {
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Calculate progress
        const totalDist = container.offsetHeight - viewportHeight;
        let scrollY = -rect.top;

        let progress = scrollY / totalDist;
        progress = Math.max(0, Math.min(progress, 1));

        // Map progress to frame index
        const rawIndex = progress * (frameCount - 1) + 1;
        const index = Math.round(rawIndex);

        if (index !== currentFrame) {
            currentFrame = index;
            requestAnimationFrame(() => renderFrame(index));
        }
    }

    // Init
    preloadImages();
    window.addEventListener('scroll', handleScroll, { passive: true });
});
