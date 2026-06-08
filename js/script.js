let currentStep = 1;
let signaturePad;
let signatures = { operator: null, pic: null, acc: null };
let currentSigType = 'operator';
let uploadedImages = [];

const checklistCategories = {
    "Dokumen Utama": ["STNK", "Lembar Pajak", "Buku Manual", "Buku Service", "Kartu Parkir"],
    "Komponen Interior": ["Kunci Kontak", "Kunci Cadangan", "Kaca Spion Dalam", "Karpet depan", "karpet Tengah", "Karpet Belakang", "Lighter", "Loud Speaker", "Penahan Sinar Matahari", "Radio/Tape/CD", "Sandaran Kepala"],
    "Komponen Eksterior": ["Kaca Spion Luar", "Antena", "Talang Air", "Penahan Lumpur", "DOP Roda", "Spoiler"],
    "Sistem Keselamatan & Peralatan": ["P3K", "Segitiga Pengaman", "Ban Cadangan", "Dongkrak", "Tool Set", "Apar"],
    "Fitur Khusus Elektrik (EV CAR)": ["Tirekit (EV CAR)", "Cairan Ban (EV CAR)", "Charging (EV CAR)", "V2L (EV CAR)"]
};

// ==========================================================================
// INITIALIZATION / DOM READY & AUTOMATION LISTENERS
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    generateChecklistForm();
    window.addEventListener("resize", resizeCanvas);

    const inputOp = document.getElementById('login-operator');
    if (inputOp) {
        inputOp.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
    }

    const inputNopol = document.getElementById('input-nopol');
    if (inputNopol) {
        inputNopol.addEventListener('input', function() {
            this.value = this.value.toUpperCase().replace(/\s+/g, '');
        });
    }

    const inputPt = document.getElementById('input-pt');
    if (inputPt) {
        inputPt.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
    }

    const inputPic = document.getElementById('input-pic');
    if (inputPic) {
        inputPic.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
    }
});

function generateChecklistForm() {
    const container = document.getElementById('ceklist-container');
    if (!container) return;
    container.innerHTML = "";

    Object.entries(checklistCategories).forEach(([categoryName, items]) => {
        let categoryHtml = `
            <div class="category-section">
                <h4 class="category-title">${categoryName}</h4>
                <div class="category-grid">
        `;
        
        items.forEach(item => {
            categoryHtml += `
                <div class="ceklist-row">
                    <span class="item-name">${item}</span>
                    <div class="radio-toggle-group">
                        <input type="radio" id="ada-${item}" name="chk-${item}" value="Ada" class="cek-radio" data-item="${item}" checked>
                        <label for="ada-${item}" class="lbl-toggle lbl-ada">Ada</label>
                        
                        <input type="radio" id="tidak-${item}" name="chk-${item}" value="Tidak Ada" class="cek-radio" data-item="${item}">
                        <label for="tidak-${item}" class="lbl-toggle lbl-tidak">Tidak Ada</label>
                    </div>
                </div>
            `;
        });
        
        categoryHtml += `</div></div>`;
        container.innerHTML += categoryHtml;
    });
}

// ==========================================================================
// NAVIGATION SYSTEM STEP-BY-STEP
// ==========================================================================
function toStep(n) {

    if (n === 2 && currentStep === 1) {
        const opName = document.getElementById('login-operator').value.trim();
        if (!opName) {
            alert("Harap masukkan Nama Operator terlebih dahulu!");
            return;
        }
        document.getElementById('display-jenis').value = document.getElementById('login-jenis').value;
        document.getElementById('display-date').value = new Date().toLocaleDateString('id-ID', {
            year: 'numeric', month: '2-digit', day: '2-digit'
        });
    }

    if (n === 4 && currentStep === 3) {
        let allValid = true;
        
        Object.values(checklistCategories).forEach(items => {
            items.forEach(item => {
                const checkedRadio = document.querySelector(`input[name="chk-${item}"]:checked`);
                if (!checkedRadio) {
                    allValid = false;
                }
            });
        });

        if (!allValid) {
            alert("data wajib di isi.");
            return;
        }
    }

    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    document.getElementById(getStepId(n)).classList.add('active');
    currentStep = n;

    if (n === 5) {
        initSignatureFlow('operator');
    }
}

function generateChecklistForm() {
    const container = document.getElementById('ceklist-container');
    if (!container) return;
    container.innerHTML = "";

    Object.entries(checklistCategories).forEach(([categoryName, items]) => {
        let categoryHtml = `
            <div class="category-section">
                <h4 class="category-title">${categoryName}</h4>
                <div class="category-grid">
        `;
        
        items.forEach(item => {
            categoryHtml += `
                <div class="ceklist-row">
                    <span class="item-name">${item}</span>
                    <div class="radio-toggle-group">
                        <input type="radio" id="ada-${item}" name="chk-${item}" value="Ada" class="cek-radio" data-item="${item}">
                        <label for="ada-${item}" class="lbl-toggle lbl-ada">Ada</label>
                        
                        <input type="radio" id="tidak-${item}" name="chk-${item}" value="Tidak Ada" class="cek-radio" data-item="${item}">
                        <label for="tidak-${item}" class="lbl-toggle lbl-tidak">Tidak Ada</label>
                    </div>
                </div>
            `;
        });
        
        categoryHtml += `</div></div>`;
        container.innerHTML += categoryHtml;
    });
}

function getStepId(n) {
    const steps = {1: 'step-login', 2: 'step-data-unit', 3: 'step-ceklist', 4: 'step-upload', 5: 'step-signature', 6: 'step-finish'};
    return steps[n];
}

// ==========================================================================
// DYNAMIC MODAL SYSTEM (POPUP CUSTOM)
// ==========================================================================
function showModal(message) {
    const oldModal = document.getElementById('custom-alert-modal');
    if (oldModal) oldModal.remove();

    const modalHtml = `
        <div id="custom-alert-modal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <span class="modal-icon">⚠️</span>
                    <h3>Peringatan</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button onclick="closeModal()" class="btn-modal-close">Mengerti</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    setTimeout(() => {
        document.getElementById('custom-alert-modal').classList.add('show');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('custom-alert-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}
// ==========================================================================
// PHOTO UPLOAD & PREVIEW LOGIC
// ==========================================================================
function previewImages() {
    const files = document.getElementById('input-photos').files;
    const previewContainer = document.getElementById('image-preview-grid');
    previewContainer.innerHTML = "";
    uploadedImages = [];

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImages.push(e.target.result);
            previewContainer.innerHTML += `<img src="${e.target.result}" class="preview-img">`;
        };
        reader.readAsDataURL(file);
    });
}

// ==========================================================================
// SIGNATURE PAD HANDLING (RESPONSIVE)
// ==========================================================================
function initSignatureFlow(type) {
    currentSigType = type;
    const canvas = document.getElementById('signature-pad');
    
    if (!signaturePad) {
        signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgba(255, 255, 255, 0)',
            penColor: '#002c5f'
        });
    } else {
        signaturePad.clear();
    }
    
    const titleConfig = { operator: "Tanda Tangan Operator", pic: "Tanda Tangan PIC / Driver", acc: "Tanda Tangan Customer" };
    const nameConfig = { 
        operator: document.getElementById('login-operator').value.toUpperCase(), 
        pic: (document.getElementById('input-pic').value || "PIC / DRIVER").toUpperCase(), 
        acc: "CUSTOMER (DISETUJUI)" 
    };
    
    document.getElementById('sig-title').innerText = titleConfig[type];
    document.getElementById('sig-name-display').innerText = nameConfig[type];
    
    setTimeout(resizeCanvas, 50); 
}

function resizeCanvas() {
    const canvas = document.getElementById('signature-pad');
    if (!canvas || currentStep !== 5) return;
    
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    if(signaturePad) signaturePad.clear();
}

function clearSignature() {
    if (signaturePad) signaturePad.clear();
}

function saveSignatureStep() {
    if (signaturePad.isEmpty() && currentSigType === 'operator') {
        alert("Tanda tangan wajib diisi sebelum melanjutkan!");
        return;
    }
    
    signatures[currentSigType] = signaturePad.isEmpty() ? null : signaturePad.toDataURL();
    
    if (currentSigType === 'operator') {
        initSignatureFlow('pic');
    } else if (currentSigType === 'pic') {
        initSignatureFlow('acc');
    } else {
        toStep(6);
    }
}

// ==========================================================================
// JSPDF ADVANCED REPORT GENERATION Engine (ELEGANT A4 FORMAT)
// ==========================================================================
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const nopol = (document.getElementById('input-nopol').value || "UNIT").toUpperCase().replace(/\s+/g, '');
    const tglInput = document.getElementById('display-date').value;
    const jenisBASTK = document.getElementById('display-jenis').value.toUpperCase();
    const perusahaan = (document.getElementById('input-pt').value || "-").toUpperCase();
    const namaPic = (document.getElementById('input-pic').value || "-").toUpperCase();
    const noTelp = document.getElementById('input-telp').value || "-";
    const tipeMobil = document.getElementById('input-tipe').value;
    const operator = (document.getElementById('login-operator').value || "OPERATOR").toUpperCase();
    const kerusakan = document.getElementById('input-kerusakan').value || "Kondisi unit baik dan mulus.";

    // --- HALAMAN 1: BERITA ACARA UTAMA ---
    
    const logoImg = document.querySelector('.logo');
    if (logoImg && logoImg.complete) {
        try { doc.addImage(logoImg, 'PNG', 15, 12, 45, 10); } catch(e){}
    }
    
    doc.setDrawColor(0, 44, 95);
    doc.setLineWidth(0.5);
    doc.line(15, 26, 195, 26);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 44, 95);
    doc.text(jenisBASTK, 195, 19, { align: 'right' });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("HYUNDAI SOLUSI MOBILITAS | DIGITAL", 195, 24, { align: 'right' });

    doc.setFillColor(245, 247, 249);
    doc.rect(15, 32, 180, 34, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(0, 44, 95);
    doc.text("DATA IDENTITAS UNIT & INSPEKSI", 20, 38);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    // Grid Kiri
    doc.text(`Tanggal Input     : ${tglInput}`, 20, 45);
    doc.text(`No. Polisi            : ${nopol}`, 20, 51);
    doc.text(`Tipe Kendaraan : ${tipeMobil}`, 20, 57);
    // Grid Kanan
    doc.text(`Nama Operator  : ${operator}`, 115, 45);
    doc.text(`Nama PIC          : ${namaPic}`, 115, 51);
    doc.text(`No. Telepon       : ${noTelp}`, 115, 57);
    doc.text(`Perusahaan       : ${perusahaan}`, 115, 63);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 44, 95);
    doc.text("HASIL CEKLIST KELENGKAPAN UNIT", 15, 75);
    doc.line(15, 77, 195, 77);

    let startY = 82;
    let col1X = 15;
    let col2X = 108;
    let rowH = 5.5;
    
    const allChecklists = document.querySelectorAll('.cek-radio:checked');
    const totalItems = allChecklists.length;
    const maxRowsPerCol = Math.ceil(totalItems / 2); 
    
    allChecklists.forEach((radio, index) => {
        let isColumn2 = index >= maxRowsPerCol;
        let currentX = isColumn2 ? col2X : col1X;
        let localRowIndex = isColumn2 ? (index - maxRowsPerCol) : index;
        let currentY = startY + (localRowIndex * rowH);
        
        if (localRowIndex % 2 === 0) {
            doc.setFillColor(248, 249, 250);
            doc.rect(currentX, currentY - 4.2, 87, rowH, 'F');
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        doc.text(radio.dataset.item, currentX + 2, currentY);
        
        if (radio.value === "Ada") {
            doc.setTextColor(46, 125, 50); // Hijau
            doc.setFont("helvetica", "bold");
        } else {
            doc.setTextColor(198, 40, 40); // Merah
            doc.setFont("helvetica", "bold");
        }
        doc.text(`[ ${radio.value} ]`, currentX + 68, currentY);
    });

    // Box Detail Kerusakan
    let checklistEndY = startY + (maxRowsPerCol * rowH);
    let boxY = checklistEndY + 6; 
    let boxHeight = 35;
    
    doc.setFillColor(255, 248, 248);
    doc.rect(15, boxY, 180, boxHeight, 'F');
    doc.setDrawColor(240, 210, 210);
    doc.rect(15, boxY, 180, boxHeight, 'S');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(180, 40, 40);
    doc.text("CATATAN KHUSUS DETAIL KERUSAKAN / GORES BODY / CRASH:", 20, boxY + 5.5);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);
    let splitTxt = doc.splitTextToSize(kerusakan, 170);
    doc.text(splitTxt, 20, boxY + 12, { align: 'left' });

    let ttdBlockY = 232;
    doc.setDrawColor(210, 215, 220);
    doc.line(15, ttdBlockY, 195, ttdBlockY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(0, 44, 95);
    
    doc.text("OPERATOR", 15, ttdBlockY + 6);
    doc.text("MENGETAHUI (PIC / DRIVER)", 80, ttdBlockY + 6);
    doc.text("DISETUJUI (CUSTOMER)", 148, ttdBlockY + 6);

    if (signatures.operator) doc.addImage(signatures.operator, 'PNG', 15, ttdBlockY + 9, 38, 18);
    if (signatures.pic)      doc.addImage(signatures.pic, 'PNG', 80, ttdBlockY + 9, 38, 18);
    if (signatures.acc)      doc.addImage(signatures.acc, 'PNG', 148, ttdBlockY + 9, 38, 18);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(`( ${operator} )`, 15, ttdBlockY + 34);
    doc.text(`( ${namaPic} )`, 80, ttdBlockY + 34);
    doc.text("( _____________________ )", 148, ttdBlockY + 34);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(6.5);
    doc.setTextColor(160, 160, 160);
    doc.text("Dokumen digital BASTK ini sah dicetak oleh sistem dan telah di cek operator. Halaman 1 dari 2", 15, 288);

    // --- HALAMAN 2 & BERIKUTNYA: DOKUMENTASI FOTO ---
    if (uploadedImages.length > 0) {
        doc.addPage();
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(0, 44, 95);
        doc.text("LAMPIRAN FOTO FOTO DOKUMENTASI FISIK KENDARAAN", 15, 16);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.text(`Nomor Polisi Unit: ${nopol}   |   Waktu: ${tglInput}`, 15, 21);
        doc.line(15, 23, 195, 23);

        // Grid Matriks 2x4
        let frameW = 86;
        let frameH = 56;
        let startGridX = 15;
        let startGridY = 28;
        let spacingX = 8;
        let spacingY = 6;

        uploadedImages.forEach((imageSrc, index) => {
            if (index > 0 && index % 8 === 0) {
                doc.addPage();
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(0, 44, 95);
                doc.text("LAMPIRAN FOTO FOTO DOKUMENTASI FISIK KENDARAAN", 15, 16);
                doc.line(15, 23, 195, 23);
                startGridY = 28;
            }

            let pageIndex = index % 8;
            let colIndex = pageIndex % 2;
            let rowIndex = Math.floor(pageIndex / 2);

            let currentImgX = startGridX + (colIndex * (frameW + spacingX));
            let currentImgY = startGridY + (rowIndex * (frameH + spacingY));

            doc.setDrawColor(215, 220, 225);
            doc.rect(currentImgX, currentImgY, frameW, frameH, 'S');
            
            doc.addImage(imageSrc, 'JPEG', currentImgX + 1, currentImgY + 1, frameW - 2, frameH - 2);
            
            doc.setFillColor(0, 44, 95);
            doc.rect(currentImgX + 1, currentImgY + frameH - 5.5, 14, 4.5, 'F');
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.setTextColor(255, 255, 255);
            doc.text(`FOTO ${index + 1}`, currentImgX + 2.5, currentImgY + frameH - 2.2);
        });
    }

    const rawDate = document.getElementById('display-date').value;
    const cleanDate = rawDate.replace(/\//g, '-');
    doc.save(`${nopol}_${cleanDate}.pdf`);
}
