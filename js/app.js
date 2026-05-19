// Data Kendaraan
const vehicles = [
    "Hyundai Palisade", "Hyundai Palisade Hybrid", "Hyundai Santafe Diesel", "Hyundai Santafe Bensin", 
    "Hyundai Kona EV", "Hyundai All New Kona", "Hyundai Ioniq EV", "Hyundai Ioniq 5 Signature", 
    "Hyundai Ioniq 5 Prime", "Hyundai Ioniq 6", "Hyundai Ioniq 9", "Hyundai Stargazer X Captain Seat", 
    "Hyundai Stargazer X Seven Seat", "Hyundai Stargazer Captain Seat", "Hyundai Stargazer Seven Seat", 
    "Hyundai Creta Prime", "Hyundai Creta Style", "Hyundai Creta Trend", "Genesis G80", "Genesis GV70", "Genesis"
];

// Data Checklist Items
const checklistItems = {
    "stnk": "STNK", "lembar_pajak": "Lembar Pajak", "buku_manual": "Buku Manual", "buku_service": "Buku Service",
    "asbak": "Asbak", "kaca_spion_dalam": "Kaca Spion Dalam", "kaca_spion_luar": "Kaca Spion Luar", 
    "karpet_depan": "Karpet Depan", "karpet_tengah": "Karpet Tengah", "karpet_belakang": "Karpet Belakang",
    "lighter": "Lighter", "loud_speaker": "Loud Speaker", "p3k": "P3K", "sun_visor" : "Sun Visor",
    "radio_tape_cd": "Radio / Tape / CD", "head_rest": "Head Rest", "antena": "Antena", 
    "segitiga_pengaman": "Segitiga Pengaman", "talang_air": "Talang Air", "ban_cadangan": "Ban Cadangan",
    "dongkrak": "Dongkrak", "tool_set": "Tool Set", "apar": "APAR", "tirekit_ev": "Tirekit (EV CAR)",
    "charging_ev": "Charging (EV CAR)", "v2l_ev": "V2L (EV CAR)"
};

document.addEventListener("DOMContentLoaded", function () {
    // === CODE FOR INDEX.HTML (LOGIN) ===
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        const operatorSelect = document.getElementById("operatorSelect");
        const manualGroup = document.getElementById("manualOperatorGroup");
        
        operatorSelect.addEventListener("change", function () {
            if (this.value === "MANUAL") {
                manualGroup.classList.remove("hidden");
                document.getElementById("operatorManual").setAttribute("required", "required");
            } else {
                manualGroup.classList.add("hidden");
                document.getElementById("operatorManual").removeAttribute("required");
            }
        });

        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const jenis = document.getElementById("jenis_bastk").value;
            let op = operatorSelect.value;
            if (op === "MANUAL") op = document.getElementById("operatorManual").value;

            // Simpan ke Session Storage lokal browser
            sessionStorage.setItem("bastk_jenis", jenis);
            sessionStorage.setItem("bastk_operator", op);
            window.location.href = "input.html";
        });
    }

    // === CODE FOR INPUT.HTML ===
    const bastkForm = document.getElementById("bastkForm");
    if (bastkForm) {
        // Ambil data dari sesi login
        const jenis = sessionStorage.getItem("bastk_jenis");
        const operator = sessionStorage.getItem("bastk_operator");
        if (!jenis || !operator) { window.location.href = "index.html"; return; }

        document.getElementById("display_jenis").value = jenis;
        const now = new Date();
        document.getElementById("display_tanggal").value = now.toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});

        // Render Dropdown Tipe Mobil
        const selectMobil = document.getElementById("type_kendaraan");
        selectMobil.innerHTML = `<option value="" disabled selected>-- Pilih Tipe Mobil --</option>`;
        vehicles.forEach(v => { selectMobil.innerHTML += `<option value="${v}">${v}</option>`; });

        // Render Item Checklist secara otomatis
        const chkContainer = document.getElementById("checklist-container");
        Object.entries(checklistItems).forEach(([key, val]) => {
            chkContainer.innerHTML += `
                <div class="checklist-item">
                    <span>${val}</span>
                    <div class="radio-toggle">
                        <input type="radio" id="${key}_ada" name="chk_${key}" value="ADA" required>
                        <label for="${key}_ada" class="lbl-ada">Ada</label>
                        <input type="radio" id="${key}_tidak" name="chk_${key}" value="TIDAK">
                        <label for="${key}_tidak" class="lbl-tidak">Tidak</label>
                    </div>
                </div>`;
        });

        // Event listener ganti Nama PIC
        document.getElementById('nama_pic').addEventListener('input', function() {
            document.getElementById('sig-title').innerText = "OTORISASI (MENGETAHUI : " + this.value.toUpperCase() + ")";
        });

        // Setup Canvas Signature
        const canvas = document.getElementById("sig-canvas");
        const ctx = canvas.getContext("2d");
        let drawing = false;

        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#002c5f";
        }
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        canvas.addEventListener("mousedown", (e) => { drawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
        canvas.addEventListener("mousemove", (e) => { if (drawing) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); } });
        canvas.addEventListener("mouseup", () => drawing = false);
        
        canvas.addEventListener("touchstart", (e) => { drawing = true; const t = e.touches[0]; const r = canvas.getBoundingClientRect(); ctx.beginPath(); ctx.moveTo(t.clientX - r.left, t.clientY - r.top); e.preventDefault(); });
        canvas.addEventListener("touchmove", (e) => { if (!drawing) return; const t = e.touches[0]; const r = canvas.getBoundingClientRect(); ctx.lineTo(t.clientX - r.left, t.clientY - r.top); ctx.stroke(); e.preventDefault(); });
        canvas.addEventListener("touchend", () => drawing = false);

        document.getElementById("clear-sig").addEventListener("click", (e) => { e.preventDefault(); ctx.clearRect(0,0,canvas.width,canvas.height); });

        // Process Submit Data
        bastkForm.addEventListener("submit", function (e) {
            e.preventDefault();
            
            // Simpan Semua Informasi Form ke Session
            sessionStorage.setItem("bastk_nopol", document.getElementById("no_polisi").value.toUpperCase());
            sessionStorage.setItem("bastk_pt", document.getElementById("nama_perusahaan").value);
            sessionStorage.setItem("bastk_pic", document.getElementById("nama_pic").value);
            sessionStorage.setItem("bastk_telp", document.getElementById("no_telp").value);
            sessionStorage.setItem("bastk_tipe", selectMobil.value);
            sessionStorage.setItem("bastk_ttd_pic", canvas.toDataURL());
            sessionStorage.setItem("bastk_raw_date", now.toISOString().slice(0,10).replace(/-/g,""));

            // Ambil Status Checklist
            let checklistResult = {};
            Object.keys(checklistItems).forEach(key => {
                const checkedVal = document.querySelector(`input[name="chk_${key}"]:checked`).value;
                checklistResult[key] = checkedVal;
            });
            sessionStorage.setItem("bastk_checklist_data", JSON.stringify(checklistResult));

            // Simpan Kumpulan File Gambar ke Session berupa format Base64 Array
            const files = document.getElementById("photos_input").files;
            let loadedImages = [];
            let processedCount = 0;

            if(files.length === 0) { alert("Mohon unggah minimal 1 foto dokumentasi!"); return; }

            for (let i = 0; i < files.length; i++) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    loadedImages.push(event.target.result);
                    processedCount++;
                    if (processedCount === files.length) {
                        sessionStorage.setItem("bastk_uploaded_photos", JSON.stringify(loadedImages));
                        window.location.href = "cetak.html";
                    }
                };
                reader.readAsDataURL(files[i]);
            }
        });
    }
});