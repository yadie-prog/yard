<?php
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: login.html");
    exit();
}

$jenis_bastk = $_POST['jenis_bastk'];
$operator = ($_POST['operator_select'] === 'MANUAL') ? $_POST['operator_manual'] : $_POST['operator_select'];
$tanggal_now = date("Y-m-d H:i:s");
$tanggal_display = date("d F Y");

$vehicles = [
    "Hyundai Palisade", "Hyundai Palisade Hybrid", "Hyundai Santafe Diesel", "Hyundai Santafe Bensin", 
    "Hyundai Kona EV", "Hyundai All New Kona", "Hyundai Ioniq EV", "Hyundai Ioniq 5 Signature", 
    "Hyundai Ioniq 5 Prime", "Hyundai Ioniq 6", "Hyundai Ioniq 9", "Hyundai Stargazer X Captain Seat", 
    "Hyundai Stargazer X Seven Seat", "Hyundai Stargazer Captain Seat", "Hyundai Stargazer Seven Seat", 
    "Hyundai Creta Prime", "Hyundai Creta Style", "Hyundai Creta Trend", "Genesis G80", "Genesis GV70", "Genesis"
];

$items = [
    "stnk" => "STNK", "lembar_pajak" => "Lembar Pajak", "buku_manual" => "Buku Manual", "buku_service" => "Buku Service",
    "asbak" => "Asbak", "kaca_spion_dalam" => "Kaca Spion Dalam", "kaca_spion_luar" => "Kaca Spion Luar", 
    "karpet_depan" => "Karpet Depan", "karpet_tengah" => "Karpet Tengah", "karpet_belakang" => "Karpet Belakang",
    "lighter" => "Lighter", "loud_speaker" => "Loud Speaker", "p3k" => "P3K", "sun_visor" => "Sun Visor",
    "radio_tape_cd" => "Radio / Tape / CD", "head_rest" => "Head Rest", "antena" => "Antena", 
    "segitiga_pengaman" => "Segitiga Pengaman", "talang_air" => "Talang Air", "ban_cadangan" => "Ban Cadangan",
    "dongkrak" => "Dongkrak", "tool_set" => "Tool Set", "apar" => "APAR", "tirekit_ev" => "Tirekit (EV CAR)",
    "charging_ev" => "Charging (EV CAR)", "v2l_ev" => "V2L (EV CAR)"
];
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Input Checklist BASTK</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
    <div class="app-container">
        <form action="../process/save_bastk.php" method="POST" id="bastkForm" enctype="multipart/form-data">
            
            <!-- Hidden Data Kontrol Sesi -->
            <input type="hidden" name="jenis_bastk" value="<?php echo $jenis_bastk; ?>">
            <input type="hidden" name="operator_name" value="<?php echo $operator; ?>">
            <input type="hidden" name="tanggal_input" value="<?php echo $tanggal_now; ?>">
            <input type="hidden" name="signature_data" id="signature_data">

            <!-- Card 1: Data Identitas Monitoring -->
            <div class="card">
                <div class="card-title">IDENTITAS KENDARAAN & SERAH TERIMA</div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>Tanggal Transaksi</label>
                        <input type="text" value="<?php echo $tanggal_display; ?>" disabled>
                    </div>
                    <div class="form-group">
                        <label>Jenis Distribusi</label>
                        <input type="text" value="<?php echo $jenis_bastk; ?>" disabled>
                    </div>
                    <div class="form-group">
                        <label>Nomor Polisi / Plat</label>
                        <input type="text" name="no_polisi" placeholder="Contoh: B 1234 ABC" required>
                    </div>
                    <div class="form-group">
                        <label>Nama Perusahaan</label>
                        <input type="text" name="nama_perusahaan" required>
                    </div>
                    <div class="form-group">
                        <label>Nama PIC Penerima/Penyerah</label>
                        <input type="text" name="nama_pic" id="nama_pic" required>
                    </div>
                    <div class="form-group">
                        <label>Nomor Telepon PIC</label>
                        <input type="tel" name="no_telp" required>
                    </div>
                    <div class="form-group">
                        <label>Tipe Armada Hyundai</label>
                        <select name="type_kendaraan" required>
                            <option value="" disabled selected>-- Pilih Tipe Mobil --</option>
                            <?php foreach($vehicles as $v): ?>
                                <option value="<?php echo $v; ?>"><?php echo $v; ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Card 2: Lembar Checklist Komponen -->
            <div class="card">
                <div class="card-title">KELENGKAPAN KENDARAAN (CHECKLIST)</div>
                <div class="grid-checklist">
                    <?php foreach($items as $key => $label): ?>
                        <div class="checklist-item">
                            <span><?php echo $label; ?></span>
                            <div class="radio-toggle">
                                <input type="radio" id="<?php echo $key; ?>_ada" name="chk[<?php echo $key; ?>]" value="1" required>
                                <label for="<?php echo $key; ?>_ada" class="lbl-ada">Ada</label>
                                
                                <input type="radio" id="<?php echo $key; ?>_tidak" name="chk[<?php echo $key; ?>]" value="0">
                                <label for="<?php echo $key; ?>_tidak" class="lbl-tidak">Tidak</label>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Card 3: Upload Foto Media -->
            <div class="card">
                <div class="card-title">DOKUMENTASI FOTO (GALERI / KAMERA)</div>
                <div class="form-group">
                    <label>Pilih Gambar Unit Lampiran (Bisa pilih lebih dari 1 foto sekaligus)</label>
                    <input type="file" name="photos[]" accept="image/*" multiple required>
                </div>
            </div>

            <!-- Card 4: Digital Signature PIC -->
            <div class="card">
                <div class="card-title" id="sig-title">OTORISASI (MENGETAHUI: PIC KENDARAAN)</div>
                <p style="font-size: 0.85rem; color:#6b7280; margin-bottom: 10px;">Gunakan layar sentuh atau mouse untuk membubuhkan tanda tangan langsung di bawah:</p>
                <div class="signature-area">
                    <canvas id="sig-canvas"></canvas>
                    <button style="margin-top:8px; padding: 6px 12px; background:#e5e7eb; border:none; border-radius:4px; cursor:pointer;" id="clear-sig">Reset Tanda Tangan</button>
                </div>
            </div>

            <!-- Aksi Navigasi Form -->
            <div class="action-buttons">
                <a href="login.html" class="btn-secondary">Kembali ke Halaman Utama</a>
                <button type="submit" class="btn-primary">Proses & Simpan Data BASTK</button>
            </div>
        </form>
    </div>
    <script src="../assets/js/app.js"></script>
    <script>
        // Update dinamis title tanda tangan mengikuti input nama PIC
        document.getElementById('nama_pic').addEventListener('input', function() {
            document.getElementById('sig-title').innerText = "OTORISASI (MENGETAHUI : " + this.value.toUpperCase() + ")";
        });
    </script>
</body>
</html>