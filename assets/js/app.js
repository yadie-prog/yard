/**
 * BASTK Pure HTML Application Engine & Printing System
 */
document.addEventListener("DOMContentLoaded", function() {
    let signaturePad;
    let uploadedPhotos = [];

    // --- SCREEN NAVIGATION LOGIC ---
    const gateForm = document.getElementById('gateForm');
    if (gateForm) {
        gateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const operatorSelect = document.getElementById('operatorSelect').value;
            const operatorManual = document.getElementById('operatorManual').value;
            
            // Simpan parameter global sementara di DOM elemen
            document.getElementById('renderJenisBastk').innerText = document.getElementById('gateJenisBastk').value.toUpperCase();
            document.getElementById('renderOperator').innerText = (operatorSelect === 'Manual') ? operatorManual : operatorSelect;
            
            // Pindah Screen
            document.getElementById('screenGate').classList.add('d-none');
            document.getElementById('screenInput').classList.remove('d-none');
            
            // Set Tanggal Otomatis saat masuk form
            const now = new Date();
            const timeString = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
            document.getElementById('inputTanggal').value = timeString;
            document.getElementById('renderTanggal').innerText = timeString;
            
            // Inisialisasi Ulang TTD Canvas agar dimensinya terbaca pas saat screen terbuka
            initSignaturePad();
        });

        // Toggle Manual Input Operator
        document.getElementById('operatorSelect').addEventListener('change', function() {
            const manualInput = document.getElementById('operatorManual');
            if(this.value === 'Manual') {
                manualInput.classList.remove('d-none');
                manualInput.setAttribute('required', 'required');
            } else {
                manualInput.classList.add('d-none');
                manualInput.removeAttribute('required');
            }
        });
    }

    // Sinkronisasi Nama PIC Real-time
    const formPic = document.getElementById('formPic');
    if (formPic) {
        formPic.addEventListener('input', function() {
            document.getElementById('labelPic').innerText = this.value || '-';
        });
    }

    // --- SIGNATURE PAD MODULE ---
    const canvas = document.getElementById('sigPad');
    function initSignaturePad() {
        if (!canvas) return;
        signaturePad = new SignaturePad(canvas);
        
        function resizeCanvas() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            const oldData = signaturePad.toData();
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
            signaturePad.fromData(oldData);
        }
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
    }

    const clearSigBtn = document.getElementById('clearSig');
    if (clearSigBtn) {
        clearSigBtn.addEventListener('click', () => signaturePad.clear());
    }

    // --- GALLERY MULTIPLE FILE CONVERTER ---
    const inputFoto = document.getElementById('inputFoto');
    if (inputFoto) {
        inputFoto.addEventListener('change', function() {
            uploadedPhotos = []; // Reset database array foto lama
            const files = this.files;

            for (let i = 0; i < files.length; i++) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    uploadedPhotos.push(event.target.result);
                };
                reader.readAsDataURL(files[i]);
            }
        });
    }

    // --- SUBMIT COMPILATION & PRINT RENDER ---
    const bastkForm = document.getElementById('bastkForm');
    if (bastkForm) {
        bastkForm.preventDefault;
        bastkForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (signaturePad.isEmpty()) {
                alert("Peringatan: Tanda Tangan PIC wajib diisi terlebih dahulu!");
                return;
            }
            if (uploadedPhotos.length === 0) {
                alert("Peringatan: Mohon lampirkan minimal 1 foto dokumentasi!");
                return;
            }

            // 1. Ekstrak Data Teknis Input Form ke Lembar Cetak
            const nopol = document.getElementById('inputNopol').value.toUpperCase();
            document.title = nopol + "_" + document.getElementById('inputTanggal').value.split(' ')[0];
            
            document.getElementById('renderNopol').innerText = nopol;
            document.getElementById('renderNopolHeader').innerText = nopol;
            document.getElementById('renderPerusahaan').innerText = document.getElementById('inputPerusahaan').value;
            document.getElementById('renderPic').innerText = document.getElementById('inputPic').value;
            document.getElementById('renderPicFooter').innerText = document.getElementById('inputPic').value;
            document.getElementById('renderTipe').innerText = document.getElementById('inputTipe').value;
            document.getElementById('renderTelp').innerText = document.getElementById('inputTelp').value;
            document.getElementById('renderOperatorFooter').innerText = document.getElementById('renderOperator').innerText;

            // Integrasi File Gambar TTD Otomatis / Manual Operator
            const opNameClean = document.getElementById('renderOperator').innerText.toLowerCase().trim();
            const validOperators = ['misto', 'alfian', 'efendi', 'derry'];
            const opTtdImg = document.getElementById('renderOperatorTtd');
            
            if (validOperators.includes(opNameClean)) {
                opTtdImg.src = "assets/images/" + opNameClean + ".png";
                opTtdImg.classList.remove('d-none');
            } else {
                opTtdImg.classList.add('d-none');
            }

            // Impor Gambar Hasil TTD PIC Base64
            document.getElementById('renderPicTtd').src = signaturePad.toDataURL();

            // 2. Ekstrak Status Matriks Ceklist
            const matrixContainer = document.getElementById('printMatrixContainer');
            matrixContainer.innerHTML = ''; // Clear template lama
            
            const checkedItems = document.querySelectorAll('.btn-check:checked');
            checkedItems.forEach(item => {
                const itemName = item.getAttribute('data-item');
                const itemStatus = item.value;
                const statusColor = (itemStatus === 'ADA') ? 'text-success' : 'text-danger fw-bold';
                const statusIcon = (itemStatus === 'ADA') ? '✔ ADA' : '✘ TIDAK';

                const div = document.createElement('div');
                div.className = 'col-4 border-bottom py-1 d-flex justify-content-between';
                div.innerHTML = `<span>${itemName}</span><span class="${statusColor}" style="margin-right:15px;">${statusIcon}</span>`;
                matrixContainer.appendChild(div);
            });

            // 3. GENERATE GRID IMAGES 4x2 DYNAMIC PAGE SEPARATION
            const photoPagesWrapper = document.getElementById('photoPagesWrapper');
            photoPagesWrapper.innerHTML = ''; // Reset container cetak gambar lama

            // Pecah array foto ke dalam kelompok berkapasitas maksimal 8 foto per halaman
            const chunks = [];
            for (let i = 0; i < uploadedPhotos.length; i += 8) {
                chunks.push(uploadedPhotos.slice(i, i + 8));
            }

            let photoCounter = 1;
            chunks.forEach((photoSet, pageIndex) => {
                const pageDiv = document.createElement('div');
                pageDiv.className = 'print-page bg-white mx-auto border mb-4';
                
                // Set Susunan Elemen Struktur Header Lampiran Foto
                let pageHeader = `
                    <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                        <span class="fw-bold text-hyundai small" style="letter-spacing: 0.5px;">
                            LAMPIRAN DOKUMENTASI FISIK UNIT – ${nopol}
                        </span>
                        <span class="text-muted small" style="font-size: 11px;">
                            Halaman Foto: ${pageIndex + 1} dari ${chunks.length}
                        </span>
                    </div>
                    <div class="photo-grid-4x2">
                `;

                // Loop Memasukkan Foto ke dalam Frame Grid 4x2
                photoSet.forEach(base64Src => {
                    pageHeader += `
                        <div class="photo-card-frame">
                            <div class="photo-badge">FOTO ${photoCounter++} / ${uploadedPhotos.length}</div>
                            <img src="${base64Src}" alt="Dokumentasi Unit BASTK">
                        </div>
                    `;
                });

                pageHeader += `</div>`; // Close grid container tag
                pageDiv.innerHTML = pageHeader;
                photoPagesWrapper.appendChild(pageDiv);
            });

            // Switch Screen Utama ke Tampilan Cetak Preview
            document.getElementById('screenInput').classList.add('d-none');
            document.getElementById('screenPrintPreview').classList.remove('d-none');

            // Trigger print window sistem operasi
            window.print();
        });
    }

    // Tombol Navigasi Kembali dari Layar Preview
    const backToInputBtn = document.getElementById('backToInput');
    if (backToInputBtn) {
        backToInputBtn.addEventListener('click', function() {
            document.getElementById('screenPrintPreview').classList.add('d-none');
            document.getElementById('screenInput').classList.remove('d-none');
        });
    }
});
