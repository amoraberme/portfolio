console.log("Script loaded");

const html = document.documentElement;
const canvas = document.getElementById("hero-lightpass");
const context = canvas.getContext("2d");
const loader = document.getElementById("loader");

// Configuration
// Using the files found: ezgif-frame-001.jpg to ezgif-frame-118.jpg
const frameCount = 118;
const currentFrame = index => (
    // Construct path: ezgif-frame-XXX.jpg
    // Pad with zeros to length 3
    `ezgif-frame-${index.toString().padStart(3, '0')}.jpg`
);

const images = [];

// Preload images
const preloadImages = () => {
    let loadedCount = 0;

    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        // console.log("Preloading:", img.src); // Debugging

        img.onload = () => {
            loadedCount++;
            const percent = Math.round((loadedCount / frameCount) * 100);
            if (loader) loader.textContent = `Loading Sequence... ${percent}%`;

            if (loadedCount === frameCount) {
                startAnimation();
            }
        };

        img.onerror = () => {
            console.error(`Failed to load image: ${img.src}`);
            // Handle error gracefully - maybe skip or retry, but for now just log
            // Proceed even if some fail, to avoid sticking at loader?
            loadedCount++; // Increment anyway to allow completion
            if (loadedCount === frameCount) startAnimation();
        };

        images.push(img);
    }
};

const img = new Image();
// Set initial image dimensions (will be updated on load)
img.src = currentFrame(1);
img.onload = () => {
    // Initial draw
    updateImage(1);
    // Set canvas dimensions to match window or image aspect ratio
    // Ideally we want full screen canvas
    resizeCanvas();
}

const updateImage = index => {
    // Index is 1-based in naming, 0-based in array
    const img = images[index - 1];
    if (img && img.complete) {
        // Draw image effectively "cover" style
        // Calculate aspect ratios
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
            // Canvas is wider than image: fit width
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        } else {
            // Canvas is taller than image: fit height
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgRatio;
            offsetY = 0;
            offsetX = (canvas.width - drawWidth) / 2;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }
};

const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Re-draw current frame after resize
    const scrollTop = html.scrollTop;
    const maxScrollTop = html.scrollHeight - window.innerHeight;
    const scrollFraction = scrollTop / maxScrollTop;
    const frameIndex = Math.min(
        frameCount - 1,
        Math.ceil(scrollFraction * frameCount)
    );
    // Safety check
    if (frameIndex > 0) updateImage(frameIndex + 1);
    else updateImage(1);
}

window.addEventListener('resize', resizeCanvas);

const startAnimation = () => {
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
    }
    resizeCanvas();

    window.addEventListener('scroll', () => {
        const scrollTop = html.scrollTop;
        const maxScrollTop = html.scrollHeight - window.innerHeight;
        // fraction 0 to 1
        const scrollFraction = scrollTop / maxScrollTop;

        // Map to frame index (1 to frameCount)
        const frameIndex = Math.min(
            frameCount - 1,
            Math.ceil(scrollFraction * frameCount)
        );

        // requestAnimationFrame for smoother performance
        requestAnimationFrame(() => updateImage(frameIndex + 1));
    });
};

preloadImages();
