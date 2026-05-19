document.addEventListener("DOMContentLoaded", function() {
    // 1. Ambil & Proteksi Data Gate Awal dari Session Storage
    const jenis = sessionStorage.getItem('gate_jenis_bastk');
    const operator = sessionStorage.getItem('gate_operator_nama');

    if (!jenis || !operator) {
        window.location.href = 'index.html';
        return;
    }

    // Set Tampilan Atas Form
    document.getElementById('viewJenis').value = jenis;
    document.getElementById('viewOperator').value = operator;
    
    // Set Waktu Otomatis Hari Ini (WIB Lokasi)
    const skrg = new Date();
    const formattedDate = skrg.getFullYear() + '-' + String(skrg.getMonth()+1).padStart(2, '0') + '-' + String(skrg.getDate()).padStart(2, '0') + ' ' + String(skrg.getHours()).padStart(2, '0') + ':' + String(skrg.getMinutes()).padStart(2, '0');
    document.getElementById('formTanggal').value = formattedDate;

    // 2. Render Pilihan Mobil Hyundai
    const cars = ["Hyundai Palisade", "Hyundai Palisade Hybrid", "Hyundai Santafe Diesel", "Hyundai Santafe Bensin", "Hyundai Kona EV", "Hyundai All New Kona", "Hyundai Ioniq EV", "Hyundai Ioniq 5 Signature", "Hyundai Ioniq 5 Prime", "Hyundai Ioniq 6", "Hyundai Ioniq 9", "Hyundai Stargazer X Captain Seat", "Hyundai Stargazer X Seven Seat", "Hyundai Stargazer Captain Seat", "Hyundai Stargazer Seven Seat", "Hyundai Creta Prime", "Hyundai Creta Style", "Hyundai Creta Trend", "Genesis G80", "Genesis GV70", "Genesis"];
    const selectTipe = document.getElementById('formTipe');
    cars.forEach(car => {
        let opt = document.createElement('option');
        opt.value = car;
        opt.innerText = car;
        selectTipe.appendChild(opt);
    });

    // 3. Render Item Ceklist Dinamis
    const items = ["STNK", "Lembar Pajak", "Buku Manual", "Buku Service", "Asbak", "Kaca Spion Dalam", "Kaca Spion Luar", "Karpet depan", "karpet Tengah", "Karpet Belakang", "Lighter", "Loud Speaker", "P3K", "Sun Visor", "Radio / Tape/ CD", "Head Rest", "Antena", "Segitiga Pengaman", "Talang Air", "Ban Cadangan", "Dongkrak", "Tool Set", "Apar", "Tirekit (EV CAR)", "Charging (EV CAR)", "V2L (EV CAR)"];
    const ceklisContainer = document.getElementById('ceklisContainer');
    
    items.forEach((item, index) => {
        const itemId = `item_${index}`;
        const html = `
            <div class="col-md-4 col-6">
                <div class="card p-2 bg-white border d-flex flex-row justify-content-between align-items-center" style="border-radius:10px;">
                    <span class="small fw-semibold text-wrap" style="max-width:60%; font-size:13px;">${item}</span>
                    <div class="btn-group btn-group-sm" role="group">
                        <input type="radio" class="btn-check" name="${itemId}" id="ada_${index}" value="1" checked>
                        <label class="btn btn-outline-success px-2" for="ada_${index}">Ada</label>
                        <input type="radio" class="btn-check" name="${itemId}" id="tidak_${index}" value="0">
                        <label class="btn btn-outline-danger px-2" for="tidak_${index}">Tidak</label>
                    </div>
                </div>
            </div>`;
        ceklisContainer.insertAdjacentHTML('beforeend', html);
    });

    // 4. Sinkronisasi Live Label Nama PIC
    document.getElementById('formPic').addEventListener('input', function() {
        document.getElementById('labelPic').innerText = this.value || '-';
    });

    // 5. Inisialisasi Signature Pad (Responsif Touchscreen HP)
    const canvas = document.getElementById('sigPad');
    const signaturePad = new SignaturePad(canvas);
    
    document.getElementById('clearSig').addEventListener('click', () => signaturePad.clear());

    // Fix Canvas Scaling di Android/iOS
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear();
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // 6. PROSES SUBMIT & GENERATE PREVIEW CETAK (LOCAL ENGINE)
    document.getElementById('bastkForm').addEventListener('submit', function(e) {
        e.preventDefault();

        if (signaturePad.isEmpty()) {
            alert("Harap isi Tanda Tangan PIC terlebih dahulu!");
            return;
        }

        // Ambil Nilai Form Input
        const nopol = document.getElementById('formNoPol').value;
        const perusahaan = document.getElementById('formPerusahaan').value;
        const pic = document.getElementById('formPic').value;
        const tipe = document.getElementById('formTipe').value;
        const telp = document.getElementById('formTelp').value;

        // Pemetaan ke Dokumen Cetak Page 1
        document.getElementById('printJenis').innerText = jenis.toUpperCase();
        document.getElementById('printTanggal').innerText = `Tanggal: ${formattedDate}`;
        document.getElementById('pNoPol').innerText = nopol.toUpperCase();
        document.getElementById('pPerusahaan').innerText = perusahaan;
        document.getElementById('pPic').innerText = pic;
        document.getElementById('pTipe').innerText = tipe;
        document.getElementById('pTelp').innerText = telp;
        document.getElementById('pOperator').innerText = operator;
        document.getElementById('pOpNama').innerText = operator;
        document.getElementById('pPicNama').innerText = pic;

        // Proses Pemetaan Ceklist Kelengkapan ke Cetak
        const printCeklistResult = document.getElementById('printCeklistResult');
        printCeklistResult.innerHTML = '';
        items.forEach((item, index) => {
            const isAda = document.getElementById(`ada_${index}`).checked;
            const statusText = isAda ? '✔ ADA' : '✘ TIDAK';
            const statusClass = isAda ? 'text-success' : 'text-danger fw-bold';
            
            const itemHtml = `
                <div class="col-4 border-bottom py-1 d-flex justify-content-between">
                    <span>${item}</span>
                    <span class="${statusClass}" style="margin-right:15px;">${statusText}</span>
                </div>`;
            printCeklistResult.insertAdjacentHTML('beforeend', itemHtml);
        });

        // Set TTD Operator Otomatis jika file PNG-nya tersedia di root/assets
        const pTtdOperatorBox = document.getElementById('pTtdOperatorBox');
        const listOpFiks = ['misto', 'alfian', 'efendi', 'derry'];
        const currentOpLower = operator.toLowerCase();

        if (listOpFiks.includes(currentOpLower)) {
            pTtdOperatorBox.innerHTML = `<img src="${currentOpLower}.png" style="max-height: 55px;" onerror="this.style.display='none'; this.parentElement.innerText='( _______________ )'">`;
        } else {
            pTtdOperatorBox.innerHTML = `<span class="text-muted">( _________________ )</span>`;
        }

        // Set TTD PIC Hasil Gambar Canvas
        document.getElementById('pTtdPicImg').src = signaturePad.toDataURL();

        // 7. MEMPROSES FILE GAMBAR LOKAL (FileReader API)
        const files = document.getElementById('formFoto').files;
        const photoPagesContainer = document.getElementById('printPhotoPages');
        photoPagesContainer.innerHTML = ''; // Reset lampiran foto terdahulu
        
        let loadedImages = [];
        let filesProcessed = 0;

        for (let i = 0; i < files.length; i++) {
            const reader = new FileReader();
            reader.onload = function(event) {
                loadedImages.push(event.target.result);
                filesProcessed++;

                if (filesProcessed === files.length) {
                    // Jika semua foto selesai dimuat ke memori browser, susun maksimal 8 per-page
                    const chunkSize = 8;
                    for (let j = 0; j < loadedImages.length; j += chunkSize) {
                        const chunk = loadedImages.slice(j, j + chunkSize);
                        let pageHtml = `
                            <div class="print-page">
                                <h6 class="fw-bold text-hyundai border-bottom pb-2 mb-3">Lampiran Foto Dokumentasi Unit (Halaman ${Math.floor(j/chunkSize) + 1})</h6>
                                <div class="photo-grid">`;
                        
                        chunk.forEach(src => {
                            pageHtml += `<img src="${src}" alt="Unit Foto">`;
                        });

                        pageHtml += `</div></div>`;
                        photoPagesContainer.insertAdjacentHTML('beforeend', pageHtml);
                    }
                    
                    // Trigger Penamaan File PDF & Jendela Cetak Browser
                    const cleanDate = formattedDate.split(' ')[0];
                    document.title = nopol.replace(/\s+/g, '_').toUpperCase() + "_" + cleanDate;
                    window.print();
                }
            };
            reader.readAsDataURL(files[i]);
        }
    });
});