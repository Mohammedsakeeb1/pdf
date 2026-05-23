/**
 * PDF Splitter Logic - Cut-Point Version
 * Splits a PDF into exactly TWO parts at a specific page number.
 */

// Configure PDF.js worker for thumbnails
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const browseBtn = document.getElementById('browseBtn');
    const uploadStage = document.getElementById('uploadStage');
    const previewStage = document.getElementById('previewStage');
    const resultStage = document.getElementById('resultStage');
    const pageGrid = document.getElementById('pageGrid');
    const splitBtn = document.getElementById('splitBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    const outputList = document.getElementById('outputList');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const pageCountDisplay = document.getElementById('pageCountDisplay');
    const cutPointInput = document.getElementById('cutPointInput');
    const maxPagesHint = document.getElementById('maxPagesHint');

    // State
    let currentPdfData = null; 
    let pdfjsDoc = null; 
    let originalFileName = '';

    // --- File Handling ---

    browseBtn.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(name => {
        dropZone.addEventListener(name, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    dropZone.addEventListener('dragenter', () => dropZone.classList.add('dragover'));
    dropZone.addEventListener('dragover', () => dropZone.classList.add('dragover'));
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });

    async function handleFile(file) {
        if (file.type !== 'application/pdf') {
            alert('Please upload a valid PDF file.');
            return;
        }

        originalFileName = file.name.replace('.pdf', '');
        showLoading('Reading PDF...');

        try {
            const arrayBuffer = await file.arrayBuffer();
            currentPdfData = new Uint8Array(arrayBuffer); 
            
            pdfjsDoc = await pdfjsLib.getDocument({ data: currentPdfData.slice().buffer }).promise;
            
            fileNameDisplay.textContent = file.name;
            pageCountDisplay.textContent = `${pdfjsDoc.numPages} Pages`;
            maxPagesHint.textContent = `max ${pdfjsDoc.numPages}`;
            cutPointInput.max = pdfjsDoc.numPages;
            
            await renderThumbnails();
            
            uploadStage.classList.add('d-none');
            previewStage.classList.remove('d-none');
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Failed to load PDF.');
        } finally {
            hideLoading();
        }
    }

    async function renderThumbnails() {
        pageGrid.innerHTML = '';
        for (let i = 1; i <= pdfjsDoc.numPages; i++) {
            const page = await pdfjsDoc.getPage(i);
            const viewport = page.getViewport({ scale: 0.3 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;

            const pageCard = document.createElement('div');
            pageCard.className = 'page-card';
            const img = document.createElement('img');
            img.src = canvas.toDataURL();
            img.className = 'page-thumbnail';
            const label = document.createElement('div');
            label.className = 'page-number';
            label.textContent = `Page ${i}`;
            pageCard.appendChild(img);
            pageCard.appendChild(label);
            pageGrid.appendChild(pageCard);
        }
    }

    // --- CUT-POINT SPLIT LOGIC ---

    splitBtn.addEventListener('click', async () => {
        const cutPoint = parseInt(cutPointInput.value);
        const totalPages = pdfjsDoc.numPages;

        if (isNaN(cutPoint) || cutPoint < 1 || cutPoint > totalPages) {
            alert(`Please enter a valid page number between 1 and ${totalPages}.`);
            return;
        }

        showLoading('Splitting PDF at page ' + cutPoint + '...');
        
        try {
            // Step 1: Define the two groups
            // Group 1: 1 to cutPoint (indices 0 to cutPoint-1)
            const group1Indices = [];
            for (let i = 0; i < cutPoint; i++) group1Indices.push(i);

            // Group 2: cutPoint to End (indices cutPoint-1 to totalPages-1)
            // Note: Page 'cutPoint' is index 'cutPoint-1'.
            const group2Indices = [];
            for (let i = cutPoint - 1; i < totalPages; i++) group2Indices.push(i);

            const results = [];

            // --- Generate PDF 1 ---
            updateLoadingStatus('Generating Part 1 (Pages 1-' + cutPoint + ')...');
            const srcDoc1 = await PDFLib.PDFDocument.load(currentPdfData.slice().buffer);
            const pdf1 = await PDFLib.PDFDocument.create();
            const pages1 = await pdf1.copyPages(srcDoc1, group1Indices);
            pages1.forEach(p => pdf1.addPage(p));
            const bytes1 = await pdf1.save();
            results.push({ 
                blob: new Blob([bytes1], { type: 'application/pdf' }), 
                name: `${originalFileName}_part1_1-${cutPoint}.pdf`,
                label: `Part 1 (Pages 1-${cutPoint})`
            });

            // --- Generate PDF 2 ---
            updateLoadingStatus('Generating Part 2 (Pages ' + cutPoint + '-' + totalPages + ')...');
            const srcDoc2 = await PDFLib.PDFDocument.load(currentPdfData.slice().buffer);
            const pdf2 = await PDFLib.PDFDocument.create();
            const pages2 = await pdf2.copyPages(srcDoc2, group2Indices);
            pages2.forEach(p => pdf2.addPage(p));
            const bytes2 = await pdf2.save();
            results.push({ 
                blob: new Blob([bytes2], { type: 'application/pdf' }), 
                name: `${originalFileName}_part2_${cutPoint}-${totalPages}.pdf`,
                label: `Part 2 (Pages ${cutPoint}-${totalPages})`
            });

            renderResults(results);
            previewStage.classList.add('d-none');
            resultStage.classList.remove('d-none');
        } catch (error) {
            console.error('Split Error:', error);
            alert('Error splitting PDF: ' + error.message);
        } finally {
            hideLoading();
        }
    });

    function renderResults(results) {
        outputList.innerHTML = '';
        results.forEach((res) => {
            const item = document.createElement('div');
            item.className = 'output-item shadow-sm';
            const sizeInMB = (res.blob.size / (1024 * 1024)).toFixed(2);
            item.innerHTML = `
                <div class="d-flex align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="text-danger me-3" viewBox="0 0 16 16">
                        <path d="M5.523 10.424c.14-.082.293-.162.459-.238a7.878 7.878 0 0 1-.45.606c-.28.337-.498.516-.635.572a.266.266 0 0 1-.035.012.282.282 0 0 1-.026-.044c-.056-.11-.054-.216.04-.408.108-.217.316-.395.647-.5zM11.512 8.358c.112-.043.223-.083.33-.12.288-.097.446-.14.512-.117.494.14.391.728.107 1.05-.205.23-.497.35-.839.36a1.403 1.403 0 0 1-.102-.007 8.358 8.358 0 0 0-.125-.827c-.015-.07-.023-.14-.03-.213zm-1.377-1.12c.11-.022.234-.038.371-.047a8.24 8.24 0 0 0-.174-.56c-.033-.1-.09-.237-.161-.341-.122-.18-.306-.298-.482-.285-.183.013-.303.14-.35.299-.047.157-.042.348.02.511.063.163.188.342.376.523zM8.62 9.043c.139-.102.273-.21.4-.322l.114-.094c.452-.392.846-.894 1.087-1.336a6.76 6.76 0 0 0-.594.319c-.307.168-.614.332-.911.481l-.082.04c-.391.198-.755.39-1.073.547-.15.074-.303.145-.456.216.14.12.284.246.43.376.341.305.673.666.92 1.015.068.097.133.198.195.303.094-.05.186-.1.277-.152z"/>
                        <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4zm.165 11.668c.09-.18.23-.343.438-.493a15.783 15.783 0 0 1 1.557-1.096 8.586 8.586 0 0 0-1.028-1.566c-.444-.59-.627-1.033-.692-1.456-.065-.42.03-.852.29-1.2.26-.35.638-.503 1.03-.519.39-.015.753.158 1.031.506.258.32.404.762.463 1.25.06.488.01 1.033-.158 1.588.207.394.487.803.81 1.202a15.54 15.54 0 0 1 1.482-1.06c.303-.19.63-.39 1.03-.547.446-.177.94-.271 1.422-.24.48.03.893.188 1.155.487.26.3.384.695.332 1.137-.052.441-.31.939-.78 1.285-.47.345-1.1.531-1.767.511a12.89 12.89 0 0 1-2.436-.453c-.392.592-.86 1.164-1.354 1.658-.014.014-.027.028-.04.041L8.04 14.69c-.301.302-.603.586-.908.835-.278.226-.596.435-.947.517-.35.082-.733.062-1.05-.128-.319-.19-.476-.524-.512-.865-.035-.34.062-.712.214-1.02.153-.307.362-.613.623-.844.27-.238.561-.43.86-.577l.062-.029z"/>
                    </svg>
                    <div>
                        <div class="fw-bold">${res.label}</div>
                        <div class="text-muted small">${res.name} (${sizeInMB} MB)</div>
                    </div>
                </div>
                <button class="btn btn-outline-primary btn-sm rounded-pill px-4 download-btn">Download</button>
            `;
            item.querySelector('.download-btn').addEventListener('click', () => saveAs(res.blob, res.name));
            outputList.appendChild(item);
        });
    }

    // --- Utils ---

    function showLoading(text) {
        loadingText.textContent = text;
        loadingOverlay.style.display = 'flex';
    }

    function updateLoadingStatus(text) {
        loadingText.textContent = text;
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }
});
