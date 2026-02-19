// --- Configuration ---
// List your portfolio image filenames here.
// Ensure these files exist in the 'portfolio' folder.
const portfolioImages = [
    '1.svg',
    '2.svg',
    '3.svg'
];


// --- View Switching Logic ---
const btnResume = document.getElementById('btn-resume');
const btnPortfolio = document.getElementById('btn-portfolio');
const viewResume = document.getElementById('resume-view');
const viewPortfolio = document.getElementById('portfolio-view');

function switchView(viewName) {
    if (viewName === 'resume') {
        viewResume.classList.add('active-view');
        viewPortfolio.classList.remove('active-view');
        btnResume.classList.add('active');
        btnPortfolio.classList.remove('active');
    } else {
        viewPortfolio.classList.add('active-view');
        viewResume.classList.remove('active-view');
        btnPortfolio.classList.add('active');
        btnResume.classList.remove('active');
    }
}

btnResume.addEventListener('click', () => switchView('resume'));
btnPortfolio.addEventListener('click', () => switchView('portfolio'));


// --- Dynamic Resume Loading ---
async function loadResume() {
    try {
        const response = await fetch('resume.md');
        if (!response.ok) throw new Error('Failed to load resume.md');
        const markdown = await response.text();
        // Convert Markdown to HTML using marked.js
        const html = marked.parse(markdown);
        document.getElementById('resume-content').innerHTML = html;
    } catch (err) {
        console.error(err);
        const isFileProtocol = window.location.protocol === 'file:';
        let msg = '<p style="color:red; text-align:center; padding-top: 50px;">Error loading resume.</p>';

        if (isFileProtocol) {
            msg += '<p style="text-align:center; color:#666;"><b>Note:</b> Browsers block loading files locally due to CORS security.</p>';
            msg += '<p style="text-align:center; color:#666;">Please run a local server (e.g. <code>python -m http.server</code>) or upload to GitHub Pages.</p>';
        }

        document.getElementById('resume-content').innerHTML = msg;
    }
}
loadResume();


// --- Dynamic Portfolio Generation ---
const flipbookContainer = document.getElementById('flipbook');
let flipbookPages = []; // Will store page elements
let currentPageIndex = 0;

function createPortfolio() {
    flipbookContainer.innerHTML = ''; // Clear existing

    // Create Cover Page (Static or dynamic?)
    // Let's make the FIRST image the cover, or add a title page?
    // User asked "portfolio changes dynamically based on the image file".
    // Let's treat each image as a page.

    portfolioImages.forEach((imageSrc, index) => {
        const page = document.createElement('div');
        page.className = 'page';
        page.dataset.page = index + 1;

        // Z-Index: stack from top to bottom
        page.style.zIndex = portfolioImages.length - index;

        // Front Content
        const front = document.createElement('div');
        front.className = 'page-front';

        // Image element
        const img = document.createElement('img');
        img.src = `portfolio/${imageSrc}`;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover'; // Ensure it covers the page
        img.style.borderRadius = '2px';

        // Hint on first page
        if (index === 0) {
            const hint = document.createElement('div');
            hint.className = 'instruction-hint';
            hint.innerText = 'Click edge to flip →';
            hint.style.position = 'absolute';
            hint.style.bottom = '20px';
            hint.style.right = '20px';
            hint.style.background = 'rgba(255,255,255,0.8)';
            hint.style.zIndex = '10';
            front.appendChild(hint);
        }

        front.appendChild(img);

        // Back Content (Empty for now, acts as spine/back of paper)
        const back = document.createElement('div');
        back.className = 'page-back';

        page.appendChild(front);
        page.appendChild(back);

        flipbookContainer.appendChild(page);
    });

    // Update pages NodeList
    flipbookPages = document.querySelectorAll('.page');
}

createPortfolio();


// --- Flipbook Logic ---

function updateBookPosition() {
    const flipbook = document.getElementById('flipbook'); // Re-select in case
    if (currentPageIndex > 0) {
        flipbook.classList.add('book-open');
    } else {
        flipbook.classList.remove('book-open');
    }
}

function flipNext() {
    if (currentPageIndex < flipbookPages.length - 1) { // Leave last page visible
        flipbookPages[currentPageIndex].classList.add('flipped');
        currentPageIndex++;
        updateBookPosition();
    }
}

function flipPrev() {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        flipbookPages[currentPageIndex].classList.remove('flipped');
        updateBookPosition();
    }
}

// Global click listener for the flipbook container
const flipbookElement = document.getElementById('flipbook');

flipbookElement.addEventListener('click', (e) => {
    // Get click position relative to the flipbook element
    const rect = flipbookElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    // Determine click zone (Left 20% vs Right 20%)
    if (x > width * 0.8) {
        flipNext();
    }
    // Logic for "Previous Page" (Left side of open book)
    // When book is open (shifted), the left page is effectively to the left of this container visually?
    // Actually, x < width * 0.2 handles the left area of the CURRENT visible stack quite well.
    // If the user clicks the "Back" page (which is rotated -180deg), it's physically to the left.
    // However, since we removed pointer-events: none, clicks bubble up.
    // A click on the "Back" page (transformed) might have negative X relative to the container if the container shifted?
    // Or if the container is the parent, coordinates are relative to parent's top-left.
    // Let's just trust x < width * 0.2 covers "Left" general direction.
    else if (x < width * 0.2) {
        flipPrev();
    }
});

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    // Only listen if portfolio view is active
    if (!viewPortfolio.classList.contains('active-view')) return;

    if (e.key === 'ArrowRight') {
        flipNext();
    } else if (e.key === 'ArrowLeft') {
        flipPrev();
    }
});
