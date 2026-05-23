/**
 * PDF Merger Logic
 * Combines multiple PDF files into one using pdf-lib.
 */

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const browseBtn = document.getElementById('browseBtn');
    const fileListContainer = document.getElementById('fileList');
    const actionContainer = document.getElementById('actionContainer');
    const mergeBtn = document.getElementById('mergeBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');

    let selectedFiles = [];

    // --- Event Listeners ---

    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        fileInput.value = ''; 
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    dropZone.addEventListener('dragenter', () => dropZone.classList.add('dragover'));
    dropZone.addEventListener('dragover', () => dropZone.classList.add('dragover'));
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    // --- Core Functions ---

    function handleFiles(files) {
        const newFiles = [...files].filter(file => {
            if (file.type !== 'application/pdf') {
                alert(`${file.name} is not a PDF file.`);
                return false;
            }
            return true;
        });

        selectedFiles = [...selectedFiles, ...newFiles];
        updateUI();
    }

    function removeFile(index) {
        selectedFiles.splice(index, 1);
        updateUI();
    }

    function updateUI() {
        renderFileList();
        if (selectedFiles.length >= 2) {
            actionContainer.classList.remove('d-none');
        } else {
            actionContainer.classList.add('d-none');
        }
    }

    function renderFileList() {
        fileListContainer.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
            fileItem.innerHTML = `
                <div class="file-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="text-danger" viewBox="0 0 16 16">
                        <path d="M5.523 10.424c.14-.082.293-.162.459-.238a7.878 7.878 0 0 1-.45.606c-.28.337-.498.516-.635.572a.266.266 0 0 1-.035.012.282.282 0 0 1-.026-.044c-.056-.11-.054-.216.04-.408.108-.217.316-.395.647-.5zM11.512 8.358c.112-.043.223-.083.33-.12.288-.097.446-.14.512-.117.494.14.391.728.107 1.05-.205.23-.497.35-.839.36a1.403 1.403 0 0 1-.102-.007 8.358 8.358 0 0 0-.125-.827c-.015-.07-.023-.14-.03-.213zm-1.377-1.12c.11-.022.234-.038.371-.047a8.24 8.24 0 0 0-.174-.56c-.033-.1-.09-.237-.161-.341-.122-.18-.306-.298-.482-.285-.183.013-.303.14-.35.299-.047.157-.042.348.02.511.063.163.188.342.376.523zM8.62 9.043c.139-.102.273-.21.4-.322l.114-.094c.452-.392.846-.894 1.087-1.336a6.76 6.76 0 0 0-.594.319c-.307.168-.614.332-.911.481l-.082.04c-.391.198-.755.39-1.073.547-.15.074-.303.145-.456.216.14.12.284.246.43.376.341.305.673.666.92 1.015.068.097.133.198.195.303.094-.05.186-.1.277-.152z"/>
                        <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4zm.165 11.668c.09-.18.23-.343.438-.493a15.783 15.783 0 0 1 1.557-1.096 8.586 8.586 0 0 0-1.028-1.566c-.444-.59-.627-1.033-.692-1.456-.065-.42.03-.852.29-1.2.26-.35.638-.503 1.03-.519.39-.015.753.158 1.031.506.258.32.404.762.463 1.25.06.488.01 1.033-.158 1.588.207.394.487.803.81 1.202a15.54 15.54 0 0 1 1.482-1.06c.303-.19.63-.39 1.03-.547.446-.177.94-.271 1.422-.24.48.03.893.188 1.155.487.26.3.384.695.332 1.137-.052.441-.31.939-.78 1.285-.47.345-1.1.531-1.767.511a12.89 12.89 0 0 1-2.436-.453c-.392.592-.86 1.164-1.354 1.658-.014.014-.027.028-.04.041L8.04 14.69c-.301.302-.603.586-.908.835-.278.226-.596.435-.947.517-.35.082-.733.062-1.05-.128-.319-.19-.476-.524-.512-.865-.035-.34.062-.712.214-1.02.153-.307.362-.613.623-.844.27-.238.561-.43.86-.577l.062-.029z"/>
                    </svg>
                    <div>
                        <div class="file-name" title="${file.name}">${file.name}</div>
                        <div class="file-size">${sizeInMB} MB</div>
                    </div>
                </div>
                <button class="btn-remove" data-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            `;
            fileItem.querySelector('.btn-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                removeFile(index);
            });
            fileListContainer.appendChild(fileItem);
        });
    }

    // --- Merge PDF Logic ---

    mergeBtn.addEventListener('click', async () => {
        if (selectedFiles.length < 2) return;

        showLoading('Merging PDF files...');
        
        try {
            const mergedPdf = await PDFLib.PDFDocument.create();
            
            for (const file of selectedFiles) {
                loadingText.textContent = `Processing ${file.name}...`;
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }
            
            loadingText.textContent = 'Saving merged PDF...';
            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            
            saveAs(blob, 'merged_document.pdf');
            
            alert('PDF merged successfully!');
        } catch (error) {
            console.error('Merge Error:', error);
            alert('An error occurred while merging PDFs. Ensure they are not password protected.');
        } finally {
            hideLoading();
        }
    });

    function showLoading(text) {
        loadingText.textContent = text;
        loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }
});
