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

// --- PDF Resume Rendering ---
const pdfUrl = 'resume.pdf';

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const canvas = document.getElementById('pdf-render');

async function renderPDF() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1); // Fetch first page

        // Render at a higher scale for better resolution on high-DPI screens
        const scale = window.devicePixelRatio > 1 ? window.devicePixelRatio * 1.5 : 2;
        const viewport = page.getViewport({ scale: scale });

        // Set dimensions to match page
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        await page.render(renderContext).promise;
    } catch (err) {
        console.error('Error rendering PDF:', err);
    }
}

renderPDF();


const flipbookContainer = document.getElementById('flipbook');
let flipbookPages = []; // Will store page elements
let currentPageIndex = 0;

function createPortfolio() {
    flipbookContainer.innerHTML = ''; // Clear existing

    const numPages = Math.ceil(portfolioImages.length / 2);

    for (let i = 0; i < numPages; i++) {
        const page = document.createElement('div');
        page.className = 'page';
        page.dataset.page = i + 1;
        // Z-Index: stack from top to bottom
        page.style.zIndex = numPages - i;

        // Front Content
        const front = document.createElement('div');
        front.className = 'page-front';

        const frontIndex = i * 2;
        if (frontIndex < portfolioImages.length) {
            const imgFront = document.createElement('img');
            imgFront.src = `portfolio/${portfolioImages[frontIndex]}`;
            imgFront.style.width = '100%';
            imgFront.style.height = '100%';
            imgFront.style.objectFit = 'cover';
            imgFront.style.borderRadius = '2px';
            front.appendChild(imgFront);

            // Hint on first page
            if (frontIndex === 0) {
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
        }

        // Back Content
        const back = document.createElement('div');
        back.className = 'page-back';

        const backIndex = i * 2 + 1;
        if (backIndex < portfolioImages.length) {
            const imgBack = document.createElement('img');
            imgBack.src = `portfolio/${portfolioImages[backIndex]}`;
            imgBack.style.width = '100%';
            imgBack.style.height = '100%';
            imgBack.style.objectFit = 'cover';
            imgBack.style.borderRadius = '2px';
            back.appendChild(imgBack);
        }

        page.appendChild(front);
        page.appendChild(back);
        flipbookContainer.appendChild(page);
    }

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
