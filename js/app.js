/**
 * File: js/app.js
 * Project: ITC Yard Monitoring System
 * Penyempurnaan: Perbaikan inisialisasi form & canvas anti-stuck
 */

document.addEventListener("DOMContentLoaded", function () {
    
    // 1. SET WAKTU OTOMATIS
    const tanggalInput = document.getElementById("bastk_tanggal");
    if (tanggalInput) {
        const sekarang = new Date();
        const tahun = sekarang.getFullYear();
        const bulan = String(sekarang.getMonth() + 1).padStart(2, '0');
        const tanggal = String(sekarang.getDate()).padStart(2, '0');
        const jam = String(sekarang.getHours()).padStart(2, '0');
        const menit = String(sekarang.getMinutes()).padStart(2, '0');
        tanggalInput.value = `${tahun}-${bulan}-${tanggal}T${jam}:${menit}`;
    }

    // 2. SETUP CANVAS SIGNATURE (PENCEGAHAN EROR AWAL HALAMAN)
    const canvas = document.getElementById("sig-canvas");
    let ctx = null;
    let drawing = false;
    let isCanvasInitialized = false;

    function initCanvas() {
        if (!canvas) return;
        try {
            ctx = canvas.getContext("2d");
            const rect = canvas.getBoundingClientRect();
            
            // Berikan ukuran default jika bounding rect terbaca 0 saat loading
            canvas.width = rect.width || 300;
            canvas.height = rect.height || 150;
            
            ctx.lineWidth = 3; 
            ctx.lineCap = "round"; 
            ctx.strokeStyle = "#002c5f";
            isCanvasInitialized = true;
        } catch (err) {
            console.error("Gagal menginisialisasi canvas tanda tangan:", err);
        }
    }

    // Eksekusi inisialisasi canvas setelah jendela browser benar-benar siap
    if (canvas) {
        if (document.readyState === "complete") {
            initCanvas();
        } else {
            window.addEventListener("load", initCanvas);
        }

        window.addEventListener("orientationchange", function() {
            isCanvasInitialized = false;
            setTimeout(initCanvas, 300);
        });

        // Event Mouse
        canvas.addEventListener("mousedown", (e) => { 
            if (!isCanvasInitialized) initCanvas();
            drawing = true; 
            ctx.beginPath(); 
            ctx.moveTo(e.offsetX, e.offsetY); 
        });
        canvas.addEventListener("mousemove", (e) => { 
            if (drawing) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); } 
        });
        canvas.addEventListener("mouseup", () => drawing = false);
        canvas.addEventListener("mouseleave", () => drawing = false);
        
        // Event Sentuhan HP (Mencegah Layar Ikut Bergeser / Scroll)
        canvas.addEventListener("touchstart", (e) => { 
            if (!isCanvasInitialized) initCanvas();
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

        const clearBtn = document.getElementById("clear-sig");
        if (clearBtn) {
            clearBtn.addEventListener("click", (e) => { 
                e.preventDefault(); 
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); 
            });
        }
    }

    // 3. MULTI-PHOTO UPLOAD & RESIZE OTOMATIS
    const photoInput = document.getElementById("bastk_photos");
    const previewContainer = document.getElementById("photo-preview-container");
    let uploadedPhotosBase64 = [];

    if (photoInput && previewContainer) {
        photoInput.addEventListener("change", function (e) {
            const files = e.target.files;
            if (!files.length) return;

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
                        const canvasComp = document.createElement("canvas");
                        const maxW = 800; 
                        const scale = maxW / img.width;
                        
                        canvasComp.width = img.width > maxW ? maxW : img.width;
                        canvasComp.height = img.width > maxW ? img.height * scale : img.height;

                        const ctxComp = canvasComp.getContext("2d");
                        ctxComp.drawImage(img, 0, 0, canvasComp.width, canvasComp.height);
                        
                        const compressedBase64 = canvasComp.toDataURL("image/jpeg", 0.7);
                        uploadedPhotosBase64.push(compressedBase64);
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
                <button type="button" class="btn-delete-photo" data-index="${index}" style="position: absolute; top: -5px; right: -5px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer;">✕</button>
            `;
            previewContainer.appendChild(wrapper);
        });

        document.querySelectorAll(".btn-delete-photo").forEach(btn => {
            btn.addEventListener("click", function () {
                const idx = parseInt(this.getAttribute("data-index"));
                uploadedPhotosBase64.splice(idx, 1);
                renderPhotoPreviews();
            });
        });
    }

    // 4. SUBMIT FORM & OPER DATA
    const bastkForm = document.getElementById("bastk-form");
    if (bastkForm) {
        bastkForm.addEventListener("submit", function (e) {
            e.preventDefault();

            if (canvas && isCanvasInitialized) {
                const blankCanvas = document.createElement("canvas");
                blankCanvas.width = canvas.width;
                blankCanvas.height = canvas.height;
                if (canvas.toDataURL() === blankCanvas.toDataURL()) {
                    alert("Peringatan: Kolom Tanda Tangan Penerima Masih Kosong!");
                    return;
                }
            }

            const tglMentah = document.getElementById("bastk_tanggal").value;
            let formattedDate = "DOKUMEN";
            if (tglMentah) {
                const d = new Date(tglMentah);
                formattedDate = `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}${d.getFullYear()}`;
            }

            const checklistObj = {};
            document.querySelectorAll(".checklist-input").forEach(input => {
                if (input.type === "checkbox") {
                    checklistObj[input.name] = input.checked ? "ADA" : "TIDAK";
                }
            });

            try {
                sessionStorage.setItem("bastk_jenis", document.getElementById("bastk_jenis").value);
                sessionStorage.setItem("bastk_operator", document.getElementById("bastk_operator").value);
                sessionStorage.setItem("bastk_nopol", document.getElementById("bastk_nopol").value.trim().toUpperCase());
                sessionStorage.setItem("bastk_pt", document.getElementById("bastk_pt").value.trim());
                sessionStorage.setItem("bastk_pic", document.getElementById("bastk_pic").value.trim());
                sessionStorage.setItem("bastk_telp", document.getElementById("bastk_telp").value.trim());
                sessionStorage.setItem("bastk_tipe", document.getElementById("bastk_tipe").value);
                sessionStorage.setItem("bastk_raw_date", formattedDate);
                sessionStorage.setItem("bastk_ttd_pic", canvas ? canvas.toDataURL("image/png") : "");
                sessionStorage.setItem("bastk_checklist_data", JSON.stringify(checklistObj));
                sessionStorage.setItem("bastk_uploaded_photos", JSON.stringify(uploadedPhotosBase64));

                window.location.href = "cetak.html";
            } catch (error) {
                alert("Memori browser penuh. Mohon kurangi jumlah foto lampiran Anda!");
            }
        });
    }
});
