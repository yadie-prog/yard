// ==========================================================================
// STATE MANAGEMENT & DATA STORAGE
// ==========================================================================
let currentStep = 1;
let signaturePad;
let signatures = { operator: null, pic: null, acc: null };
let currentSigType = 'operator'; // operator -> pic -> acc
let uploadedImages = [];

// Pengelompokan Data Ceklist Berdasarkan Kompartemen Mobil
const checklistCategories = {
    "Dokumen Utama": ["STNK", "Lembar Pajak", "Buku Manual", "Buku Service", "Kartu Parkir"],
    "Komponen Interior": ["Kunci Kontak", "Kunci Cadangan",  "Kaca Spion Dalam", "Karpet depan", "karpet Tengah", "Karpet Belakang", "Lighter", "Loud Speaker", "Penahan Sinar Matahari", "Radio/Tape/CD", "Sandaran Kepala"],
    "Komponen Eksterior": ["Kaca Spion Luar", "Antena", "Talang Air", "Penahan Lumpur", "DOP Roda", "Spoiler"],
    "Sistem Keselamatan & Peralatan": ["P3K", "Segitiga Pengaman", "Ban Cadangan", "Dongkrak", "Tool Set", "Apar"],
    "Fitur Khusus Elektrik (EV CAR)": ["Tirekit (EV CAR)", "Cairan Ban (EV CAR)", "Charging (EV CAR)", "V2L (EV CAR)"]
};

// ==========================================================================
// INITIALIZATION / DOM READY
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    generateChecklistForm();
    window.addEventListener("resize", resizeCanvas);
});

// Render Komponen Struktur Ceklist Berbasis Radio Button Group
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
    // Validasi Login Step 1 Ke Step 2
    if (n === 2 && currentStep === 1) {
        const opName = document.getElementById('login-operator').value.trim();
        if (!opName) {
            alert("Harap masukkan Nama Operator terlebih dahulu!");
            return;
        }
        // Kunci Informasi Utama & Set Tanggal Otomatis
        document.getElementById('display-jenis').value = document.getElementById('login-jenis').value;
        document.getElementById('display-date').value = new Date().toLocaleDateString('id-ID', {
            year: 'numeric', month: '2-digit', day: '2-digit'
        });
    }

    // Sembunyikan Semua Card, Tampilkan Target Card
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    document.getElementById(getStepId(n)).classList.add('active');
    currentStep = n;

    // Trigger Alur Tanda Tangan Berurutan di Step 5
    if (n === 5) {
        initSignatureFlow('operator');
    }
}

function getStepId(n) {
    const steps = {1: 'step-login', 2: 'step-data-unit', 3: 'step-ceklist', 4: 'step-upload', 5: 'step-signature', 6: 'step-finish'};
    return steps[n];
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
    
    const titleConfig = { operator: "Tanda Tangan Operator", pic: "Tanda Tangan PIC/Customer", acc: "Tanda Tangan ACC" };
    const nameConfig = { 
        operator: document.getElementById('login-operator').value, 
        pic: document.getElementById('input-pic').value || "Customer", 
        acc: "Management (Boleh Kosong)" 
    };
    
    document.getElementById('sig-title').innerText = titleConfig[type];
    document.getElementById('sig-name-display').innerText = nameConfig[type];
    
    setTimeout(resizeCanvas, 50); // Beri jeda waktu render dom canvas agar ukuran presisi
}

function resizeCanvas() {
    const canvas = document.getElementById('signature-pad');
    if (!canvas || currentStep !== 5) return;
    
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    if(signaturePad) signaturePad.clear(); // Bersihkan dari distorsi stretching
}

function clearSignature() {
    if (signaturePad) signaturePad.clear();
}

function saveSignatureStep() {
    // Validasi: Operator dan PIC wajib tanda tangan, ACC opsional
    if (signaturePad.isEmpty() && currentSigType !== 'acc') {
        alert("Tanda tangan wajib diisi sebelum melanjutkan!");
        return;
    }
    
    // Simpan data URL jika canvas terisi
    signatures[currentSigType] = signaturePad.isEmpty() ? null : signaturePad.toDataURL();
    
    // Pindah otomatis ke penandatangan berikutnya
    if (currentSigType === 'operator') {
        initSignatureFlow('pic');
    } else if (currentSigType === 'pic') {
        initSignatureFlow('acc');
    } else {
        toStep(6); // Selesai menuju halaman download
    }
}

// ==========================================================================
// JSPDF ADVANCED REPORT GENERATION Engine (ELEGANT A4 FORMAT)
// ==========================================================================
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Ambil Value Input
    const nopol = (document.getElementById('input-nopol').value || "UNIT").toUpperCase();
    const tglInput = document.getElementById('display-date').value;
    const jenisBASTK = document.getElementById('display-jenis').value.toUpperCase();
    const perusahaan = document.getElementById('input-pt').value || "-";
    const namaPic = document.getElementById('input-pic').value || "-";
    const noTelp = document.getElementById('input-telp').value || "-";
    const tipeMobil = document.getElementById('input-tipe').value;
    const operator = document.getElementById('login-operator').value;
    const kerusakan = document.getElementById('input-kerusakan').value || "Kondisi unit baik dan mulus.";

    // --- HALAMAN 1: BERITA ACARA UTAMA ---
    
    // Header Dekoratif & Judul Utama
    const logoImg = document.querySelector('.logo');
    if (logoImg && logoImg.complete) {
        try { doc.addImage(logoImg, 'PNG', 15, 12, 45, 10); } catch(e){}
    }
    
    doc.setDrawColor(0, 44, 95); // Hyundai Blue Line
    doc.setLineWidth(0.5);
    doc.line(15, 26, 195, 26);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 44, 95);
    doc.text(jenisBASTK, 195, 19, { align: 'right' });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("HYUNDAI SOLUSI MOBILITAS | CORE SYSTEM DIGITAL", 195, 24, { align: 'right' });

    // Panel Informasi Unit Kendaraan (Gray Container Card)
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
    doc.text(`Tanggal Input   : ${tglInput}`, 20, 45);
    doc.text(`No. Polisi          : ${nopol}`, 20, 51);
    doc.text(`Tipe Kendaraan : ${tipeMobil}`, 20, 57);
    // Grid Kanan
    doc.text(`Nama Operator : ${operator}`, 115, 45);
    doc.text(`Nama PIC          : ${namaPic}`, 115, 51);
    doc.text(`No. Telepon      : ${noTelp}`, 115, 57);
    doc.text(`Perusahaan       : ${perusahaan}`, 115, 63);

    // Tabel Ceklist Kelengkapan (Disusun Simetris 2 Kolom Sejajar)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 44, 95);
    doc.text("HASIL CEKLIST KELENGKAPAN UNIT", 15, 75);
    doc.line(15, 77, 195, 77);

    let startY = 82;
    let col1X = 15;
    let col2X = 108;
    let rowH = 6.0;
    
    const allChecklists = document.querySelectorAll('.cek-radio:checked');
    
    allChecklists.forEach((radio, index) => {
        let currentX = (index < 13) ? col1X : col2X;
        let currentY = startY + ((index % 13) * rowH);
        
        // Striping Belang Abu Soft
        if (Math.floor(index % 13) % 2 === 0) {
            doc.setFillColor(248, 249, 250);
            doc.rect(currentX, currentY - 4.2, 87, rowH, 'F');
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        doc.text(radio.dataset.item, currentX + 2, currentY);
        
        // Atur warna indikator status kelengkapan
        if (radio.value === "Ada") {
            doc.setTextColor(46, 125, 50); // Hijau
            doc.setFont("helvetica", "bold");
        } else {
            doc.setTextColor(198, 40, 40); // Merah
            doc.setFont("helvetica", "bold");
        }
        doc.text(`[ ${radio.value} ]`, currentX + 68, currentY);
    });

    // Box Detail Kerusakan / Catatan Fisik BASTK
	let boxY = 160;
    let boxHeight = 35;
    
    doc.setFillColor(255, 248, 248);
    doc.rect(15, boxY, 180, boxHeight, 'F');
    doc.setDrawColor(240, 210, 210);
    doc.rect(15, boxY, 180, boxHeight, 'S');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(180, 40, 40);
    doc.text("CATATAN KHUSUS DETAIL KERUSAKAN / GORES BODY / CRASH:", 20, boxY + 6);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);
    let splitTxt = doc.splitTextToSize(kerusakan, 170);
    doc.text(splitTxt, 20, boxY + 13);

    // Pembatas Area Otorisasi / Lembar Pengesahan TTD
    let ttdBlockY = 232;
    doc.setDrawColor(210, 215, 220);
    doc.line(15, ttdBlockY, 195, ttdBlockY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(0, 44, 95);
    
    doc.text("OPERATOR", 15, ttdBlockY + 6);
    doc.text("MENGETAHUI (PIC / DRIVER)", 80, ttdBlockY + 6);
    doc.text("DISETUJUI (CUSTUMER)", 148, ttdBlockY + 6);

    // Menyisipkan Grafis Tanda Tangan Digital Ke Dokumen
    if (signatures.operator) doc.addImage(signatures.operator, 'PNG', 15, ttdBlockY + 9, 38, 18);
    if (signatures.pic)      doc.addImage(signatures.pic, 'PNG', 80, ttdBlockY + 9, 38, 18);
    if (signatures.acc)      doc.addImage(signatures.acc, 'PNG', 148, ttdBlockY + 9, 38, 18);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(`( ${operator} )`, 15, ttdBlockY + 34);
    doc.text(`( ${namaPic} )`, 80, ttdBlockY + 34);
    doc.text("( _____________________ )", 148, ttdBlockY + 34);

    // Penanda Halaman Berita Acara Utama
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.text("Dokumen digital BASTK ini sah dicetak oleh sistem. Halaman 1 dari 1", 15, 288);

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

        // Konfigurasi Grid Matriks Foto Maksimal 8 Item per Halaman (Layout 2x4)
        let frameW = 86;
        let frameH = 56;
        let startGridX = 15;
        let startGridY = 28;
        let spacingX = 8;
        let spacingY = 6;

        uploadedImages.forEach((imageSrc, index) => {
            // Jika masuk ke kelipatan gambar ke-9, buat halaman lampiran baru
            if (index > 0 && index % 8 === 0) {
                doc.addPage();
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(0, 44, 95);
                doc.text("LAMPIRAN FOTO FOTO DOKUMENTASI FISIK KENDARAAN", 15, 16);
                doc.line(15, 23, 195, 23);
                startGridY = 28; // Reset koordinat Y ke atas
            }

            let pageIndex = index % 8;
            let colIndex = pageIndex % 2;
            let rowIndex = Math.floor(pageIndex / 2);

            let currentImgX = startGridX + (colIndex * (frameW + spacingX));
            let currentImgY = startGridY + (rowIndex * (frameH + spacingY));

            // Gambar Border Tipis Bingkai Foto
            doc.setDrawColor(215, 220, 225);
            doc.rect(currentImgX, currentImgY, frameW, frameH, 'S');
            
            // Masukkan Komponen File Gambar
            doc.addImage(imageSrc, 'JPEG', currentImgX + 1, currentImgY + 1, frameW - 2, frameH - 2);
            
            // Tagging Badge Identitas Foto
            doc.setFillColor(0, 44, 95);
            doc.rect(currentImgX + 1, currentImgY + frameH - 5.5, 14, 4.5, 'F');
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.setTextColor(255, 255, 255);
            doc.text(`FOTO ${index + 1}`, currentImgX + 2.5, currentImgY + frameH - 2.2);
        });
    }

    // Trigger Perintah Simpan File Sesuai Format Penamaan Berkas
    const sanitizedNopol = nopol.replace(/[^a-zA-Z0-9]/g, "_");
    const sanitizedDate = tglInput.replace(/\//g, "-");
    doc.save(`${sanitizedNopol}_${sanitizedDate}.pdf`);
}
