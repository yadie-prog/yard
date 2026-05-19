/**
 * File: js/app.js
 * Project: ITC Yard Monitoring System
 * Description: Front-end logic untuk Form input BASTK, Multi-photo handling, 
 *              dan Signature Canvas dengan perbaikan anti-reset saat scroll di HP.
 */

document.addEventListener("DOMContentLoaded", function () {
    // ==========================================
    // 1. INBOUND DATA & DATE HANDLER
    // ==========================================
    const tanggalInput = document.getElementById("bastk_tanggal");
    if (tanggalInput) {
        const sekarang = new Date();
        const tahun = sekarang.getFullYear();
        const bulan = String(sekarang.getMonth() + 1).padStart(2, '0');
        const tanggal = String(sekarang.getDate()).padStart(2, '0');
        const jam = String(sekarang.getHours()).padStart(2, '0');
        const menit = String(sekarang.getMinutes()).padStart(2, '0');
        
        // Format default untuk input datetime-local: YYYY-MM-DDTHH:mm
        tanggalInput.value = `${tahun}-${bulan}-${tanggal}T${jam}:${menit}`;
    }

    // ==========================================
    // 2. SETUP CANVAS SIGNATURE (ANTI-RESET SAAT SCROLL HP)
    // ==========================================
    const canvas = document.getElementById("sig-canvas");
    let ctx = null;
    let drawing = false;
    let isCanvasInitialized = false; // Flag pengunci ukuran internal canvas

    if (canvas) {
        ctx = canvas.getContext("2d");

        function initCanvas() {
            // JIKA sudah dikunci ukurannya, jangan jalankan kode di bawah agar gambar tidak terhapus
            if (isCanvasInitialized) return;

            // Ambil dimensi riil elemen canvas dari CSS/Layout browser
            const rect = canvas.getBoundingClientRect();
            
            // Set ukuran internal drawing buffer sesuai ukuran display koordinat
            canvas.width = rect.width;
            canvas.height = rect.height;
            
            // Konfigurasi kuas tanda tangan
            ctx.lineWidth = 3; 
            ctx.lineCap = "round"; 
            ctx.strokeStyle = "#002c5f"; // Warna Biru Korporat Hyundai

            isCanvasInitialized = true; // Kunci ukuran canvas
        }

        // Inisialisasi awal saat halaman dimuat
        initCanvas();

        // Antisipasi jika pengguna mengubah orientasi layar (Landscape <-> Portrait)
        window.addEventListener("orientationchange", function() {
            isCanvasInitialized = false; // Buka kunci sementara
            setTimeout(initCanvas, 200); // Beri jeda render ulang
        });

        // --- Event Mouse (PC / Desktop) ---
        canvas.addEventListener("mousedown", (e) => { 
            drawing = true; 
            ctx.beginPath(); 
            ctx.moveTo(e.offsetX, e.offsetY); 
        });
        canvas.addEventListener("mousemove", (e) => { 
            if (drawing) { 
                ctx.lineTo(e.offsetX, e.offsetY); 
                ctx.stroke(); 
            } 
        });
        canvas.addEventListener("mouseup", () => drawing = false);
        canvas.addEventListener("mouseleave", () => drawing = false);
        
        // --- Event Sentuhan (Mobile / Touchscreen) ---
        // e.preventDefault() digunakan agar layar tidak ikut ter-scroll saat membuat garis ttd
        canvas.addEventListener("touchstart", (e) => { 
            drawing = true; 
            const touch = e.touches[0]; 
            const rectBox = canvas.getBoundingClientRect(); 
            ctx.beginPath(); 
            ctx.moveTo(touch.clientX - rectBox.left, touch.clientY - rectBox.top); 
            e.preventDefault(); 
        }, { passive: false });

        canvas.addEventListener("touchmove", (e) => { 
            if (!drawing) return; 
            const touch = e.touches[0]; 
            const rectBox = canvas.getBoundingClientRect(); 
            ctx.lineTo(touch.clientX - rectBox.left, touch.clientY - rectBox.top); 
            ctx.stroke(); 
            e.preventDefault(); 
        }, { passive: false });

        canvas.addEventListener("touchend", () => drawing = false);

        // Tombol Reset Tanda Tangan
        const clearBtn = document.getElementById("clear-sig");
        if (clearBtn) {
            clearBtn.addEventListener("click", (e) => { 
                e.preventDefault(); 
                ctx.clearRect(0, 0, canvas.width, canvas.height); 
            });
        }
    }

    // ==========================================
    // 3. MULTI-PHOTO UPLOAD & BASE64 COMPRESSION
    // ==========================================
    const photoInput = document.getElementById("bastk_photos");
    const previewContainer = document.getElementById("photo-preview-container");
    let uploadedPhotosBase64 = [];

    if (photoInput && previewContainer) {
        photoInput.addEventListener("change", function (e) {
            const files = e.target.files;
            if (!files.length) return;

            // Batasi total foto maksimal 8 unit untuk efisiensi ruang cetak PDF
            if (uploadedPhotosBase64.length + files.length > 8) {
                alert("Maksimal lampiran adalah 8 foto dokumentasi!");
                return;
            }

            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function (event) {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = function () {
                        // Kompresi gambar menggunakan Canvas untuk menghemat kapasitas Session Storage (Limit 5MB)
                        const canvasComp = document.createElement("canvas");
                        const maxW = 800; // Standar resolusi dokumen lampiran
                        const scale = maxW / img.width;
                        
                        if (img.width > maxW) {
                            canvasComp.width = maxW;
                            canvasComp.height = img.height * scale;
                        } else {
                            canvasComp.width = img.width;
                            canvasComp.height = img.height;
                        }

                        const ctxComp = canvasComp.getContext("2d");
                        ctxComp.drawImage(img, 0, 0, canvasComp.width, canvasComp.height);
                        
                        // Output format JPEG dengan kualitas 70% (Sangat ringan)
                        const compressedBase64 = canvasComp.toDataURL("image/jpeg", 0.7);
                        uploadedPhotosBase64.push(compressedBase64);

                        // Render item preview di form
                        renderPhotoPreviews();
                    };
                };
                reader.readAsDataURL(file);
            });
        });
    }

    function renderPhotoPreviews() {
        if (!previewContainer) return;
        previewContainer.innerHTML = "";

        uploadedPhotosBase64.forEach((base64Src, index) => {
            const wrapper = document.createElement("div");
            wrapper.className = "photo-preview-item";
            wrapper.style.position = "relative";
            wrapper.style.display = "inline-block";
            wrapper.style.margin = "5px";

            wrapper.innerHTML = `
                <img src="${base64Src}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid #ccc;">
                <button type="button" class="btn-delete-photo" data-index="${index}" style="position: absolute; top: -5px; right: -5px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
            `;
            previewContainer.appendChild(wrapper);
        });

        // Event listener hapus foto individual
        document.querySelectorAll(".btn-delete-photo").forEach(btn => {
            btn.addEventListener("click", function () {
                const idx = parseInt(this.getAttribute("data-index"));
                uploadedPhotosBase64.splice(idx, 1);
                renderPhotoPreviews();
            });
        });
    }

    // ==========================================
    // 4. SUBMIT FORM & REDIRECT KE HALAMAN CETAK
    // ==========================================
    const bastkForm = document.getElementById("bastk-form");
    if (bastkForm) {
        bastkForm.addEventListener("submit", function (e) {
            e.preventDefault();

            // Validasi Tanda Tangan: Cek apakah canvas kosong/belum digambar
            if (canvas) {
                const blankCanvas = document.createElement("canvas");
                blankCanvas.width = canvas.width;
                blankCanvas.height = canvas.height;
                if (canvas.toDataURL() === blankCanvas.toDataURL()) {
                    alert("Peringatan: Kolom Tanda Tangan PIC/Penerima Masih Kosong!");
                    return;
                }
            }

            // Kumpulkan Data Identitas Utama
            const jenis = document.getElementById("bastk_jenis").value;
            const operator = document.getElementById("bastk_operator").value;
            const nopol = document.getElementById("bastk_nopol").value.trim().toUpperCase();
            const pt = document.getElementById("bastk_pt").value.trim();
            const pic = document.getElementById("bastk_pic").value.trim();
            const telp = document.getElementById("bastk_telp").value.trim();
            const tipe = document.getElementById("bastk_tipe").value;
            const tglMentah = document.getElementById("bastk_tanggal").value;

            // Kumpulkan Data Checklist Item Kendaraan
            const checklistObj = {};
            document.querySelectorAll(".checklist-input").forEach(input => {
                if (input.type === "checkbox") {
                    checklistObj[input.name] = input.checked ? "ADA" : "TIDAK";
                } else if (input.type === "radio" && input.checked) {
                    checklistObj[input.name] = input.value; // Jika menggunakan format radio ADA/TIDAK
                }
            });

            // Ekstrak Tanda Tangan ke format DataURL Image
            const signatureDataUrl = canvas.toDataURL("image/png");

            // Format tanggal kustom untuk judul dokumen file PDF [NoPlat_Tgl]
            let formattedDate = "DOKUMEN";
            if (tglMentah) {
                const d = new Date(tglMentah);
                formattedDate = `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}${d.getFullYear()}`;
            }

            // Simpan seluruh state data ke dalam Session Storage browser
            try {
                sessionStorage.setItem("bastk_jenis", jenis);
                sessionStorage.setItem("bastk_operator", operator);
                sessionStorage.setItem("bastk_nopol", nopol);
                sessionStorage.setItem("bastk_pt", pt);
                sessionStorage.setItem("bastk_pic", pic);
                sessionStorage.setItem("bastk_telp", telp);
                sessionStorage.setItem("bastk_tipe", tipe);
                sessionStorage.setItem("bastk_raw_date", formattedDate);
                sessionStorage.setItem("bastk_ttd_pic", signatureDataUrl);
                sessionStorage.setItem("bastk_checklist_data", JSON.stringify(checklistObj));
                sessionStorage.setItem("bastk_uploaded_photos", JSON.stringify(uploadedPhotosBase64));

                // Arahkan browser operator ke halaman preview template cetak A4
                window.location.href = "cetak.html";

            } catch (error) {
                console.error(error);
                alert("Gagal menyimpan data karena memori browser penuh. Mohon kurangi jumlah foto atau kecilkan resolusi kamera HP!");
            }
        });
    }
});
