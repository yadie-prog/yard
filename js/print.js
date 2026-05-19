/**
 * File: js/print.js
 * Project: ITC Yard Monitoring System
 */

// Jadikan fungsi global agar bisa diakses langsung oleh tombol manual di HTML
window.jalankanProsesUnduh = function() {
    const element = document.getElementById("printable_area") || document.body;
    const nopol = sessionStorage.getItem("bastk_nopol") || "BASTK";
    const rawDate = sessionStorage.getItem("bastk_raw_date") || "DOKUMEN";
    
    const opsiPDF = {
        margin:       0,
        filename:     `${nopol}_${rawDate}.pdf`,
        image:        { type: 'jpeg', quality: 0.95 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opsiPDF).from(element).save().catch(err => {
        console.error("Gagal convert html2pdf, mencoba native print:", err);
        window.print();
    });
};

document.addEventListener("DOMContentLoaded", function () {
    const jenis = sessionStorage.getItem("bastk_jenis");
    const operator = sessionStorage.getItem("bastk_operator");
    const nopol = sessionStorage.getItem("bastk_nopol");
    const pt = sessionStorage.getItem("bastk_pt");
    const pic = sessionStorage.getItem("bastk_pic");
    const telp = sessionStorage.getItem("bastk_telp");
    const tipe = sessionStorage.getItem("bastk_tipe");
    const ttdPic = sessionStorage.getItem("bastk_ttd_pic");
    const checklistData = JSON.parse(sessionStorage.getItem("bastk_checklist_data") || "{}");
    const photos = JSON.parse(sessionStorage.getItem("bastk_uploaded_photos") || "[]");

    if (!nopol) { 
        alert("Data tidak lengkap! Kembali ke halaman utama."); 
        window.location.href = "index.html"; 
        return; 
    }

    // ISI IDENTITAS UTAMA
    document.getElementById("p1_jenis").innerText = jenis.toUpperCase();
    document.getElementById("p1_tanggal").innerText = new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit'}) + " WIB";
    document.getElementById("p1_nopol").innerText = nopol;
    document.getElementById("p1_pt").innerText = pt;
    document.getElementById("p1_tipe").innerText = tipe;
    document.getElementById("p1_pic").innerText = pic;
    document.getElementById("p1_telp").innerText = telp;
    document.getElementById("p1_nama_operator").innerText = `( ${operator} )`;
    document.getElementById("p1_title_ttd_pic").innerText = `MENGETAHUI : ${pic.toUpperCase()}`;
    document.getElementById("p1_nama_pic_bawah").innerText = `( ${pic} )`;
    
    if (ttdPic) document.getElementById("p1_img_ttd_pic").src = ttdPic;

    // LOGIKA AUTO TTD OPERATOR
    const ttdOperatorBox = document.getElementById("p1_ttd_operator_box");
    const fixedOperators = ["Misto", "Alfian", "Efendi", "Derry"];
    if (fixedOperators.includes(operator)) {
        ttdOperatorBox.innerHTML = `<img src="images/${operator.toLowerCase()}.png" alt="TTD Operator" onerror="this.parentElement.innerHTML='<div style=\'height:60px;\'></div>'">`;
    } else {
        ttdOperatorBox.innerHTML = `<div style="height:60px;"></div>`;
    }

    // RENDER TABEL CHECKLIST 2 KOLOM
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

    const tbody = document.getElementById("p1_checklist_tbody");
    const keys = Object.keys(checklistItems);
    tbody.innerHTML = "";
    
    for (let i = 0; i < keys.length; i += 2) {
        const k1 = keys[i];
        const k2 = keys[i + 1];
        let rowHtml = `<tr>
            <td>${checklistItems[k1]}</td>
            <td style="text-align:center; font-weight:bold;">${checklistData[k1] || 'TIDAK'}</td>`;
        if (k2) {
            rowHtml += `<td>${checklistItems[k2]}</td>
                       <td style="text-align:center; font-weight:bold;">${checklistData[k2] || 'TIDAK'}</td>`;
        } else {
            rowHtml += `<td>-</td><td>-</td>`;
        }
        rowHtml += `</tr>`;
        tbody.innerHTML += rowHtml;
    }

    // RENDER HALAMAN FOTO DOKUMENTASI (MAX 8 FOTO PER HALAMAN)
    const fotoContainer = document.getElementById("lampiran_foto_container");
    fotoContainer.innerHTML = "";
    const maxPhotosPerPage = 8;
    
    for (let i = 0; i < photos.length; i += maxPhotosPerPage) {
        const pagePhotos = photos.slice(i, i + maxPhotosPerPage);
        const pageIndex = Math.floor(i / maxPhotosPerPage) + 1;

        let pageHtml = `
            <div class="a4-page" style="margin: 20px auto 0 auto; page-break-before: always;">
                <div class="header-print" style="margin-bottom: 10mm;">
                    <div>
                        <h1 style="font-size: 14pt; font-weight: bold; color: #002c5f;">LAMPIRAN FOTO DOKUMENTASI UNIT</h1>
                        <p style="font-size: 9pt; color: #555;">No Plat Kendaraan: ${nopol} | Halaman Lampiran: ${pageIndex}</p>
                    </div>
                </div>
                <div class="photo-grid">`;

        pagePhotos.forEach(srcImg => {
            pageHtml += `
                <div class="photo-item">
                    <img src="${srcImg}" alt="Dokumentasi Unit">
                </div>`;
        });

        pageHtml += `</div></div>`;
        fotoContainer.innerHTML += pageHtml;
    }

    // PICU UNDUH OTOMATIS SETELAH ELEMEN VISUAL SIAP (DELAY 1 DETIK)
    setTimeout(function () {
        window.jalankanProsesUnduh();
    }, 1000);
});
