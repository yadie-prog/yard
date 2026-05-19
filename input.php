<?php
session_start();
if (!isset($_SESSION['gate_jenis_bastk']) || !isset($_SESSION['gate_operator_nama'])) {
    header('Location: index.php');
    exit();
}

$jenis_bastk = $_SESSION['gate_jenis_bastk'];
$operator = $_SESSION['gate_operator_nama'];
date_default_timezone_set('Asia/Jakarta');
$tanggal_now = date('Y-m-d H:i');

$cars = ["Hyundai Palisade", "Hyundai Palisade Hybrid", "Hyundai Santafe Diesel", "Hyundai Santafe Bensin", "Hyundai Kona EV", "Hyundai All New Kona", "Hyundai Ioniq EV", "Hyundai Ioniq 5 Signature", "Hyundai Ioniq 5 Prime", "Hyundai Ioniq 6", "Hyundai Ioniq 9", "Hyundai Stargazer X Captain Seat", "Hyundai Stargazer X Seven Seat", "Hyundai Stargazer Captain Seat", "Hyundai Stargazer Seven Seat", "Hyundai Creta Prime", "Hyundai Creta Style", "Hyundai Creta Trend", "Genesis G80", "Genesis GV70", "Genesis"];

$items = ["STNK", "Lembar Pajak", "Buku Manual", "Buku Service", "Asbak", "Kaca Spion Dalam", "Kaca Spion Luar", "Karpet depan", "karpet Tengah", "Karpet Belakang", "Lighter", "Loud Speaker", "P3K", "Sun Visor", "Radio / Tape/ CD", "Head Rest", "Antena", "Segitiga Pengaman", "Talang Air", "Ban Cadangan", "Dongkrak", "Tool Set", "Apar", "Tirekit (EV CAR)", "Charging (EV CAR)", "V2L (EV CAR)"];
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Input Form BASTK</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="py-4">
    <div class="container px-3">
        <div class="card card-premium p-3 p-md-4 mb-4">
            <form action="cetak.php" method="POST" id="bastkForm">
                
                <div class="row mb-3 g-2">
                    <div class="col-6">
                        <label class="text-muted small">Jenis BASTK</label>
                        <input type="text" name="jenis_bastk" class="form-control bg-light" value="<?= $jenis_bastk ?>" readonly>
                    </div>
                    <div class="col-6">
                        <label class="text-muted small">Operator Tugas</label>
                        <input type="text" name="operator_nama" class="form-control bg-light" value="<?= $operator ?>" readonly>
                    </div>
                </div>

                <h5 class="text-hyundai border-bottom pb-2 mb-3 fw-bold">Data Kendaraan & Client</h5>
                <div class="row g-3 mb-4">
                    <div class="col-md-4">
                        <label class="form-label">Tanggal Input</label>
                        <input type="text" name="tanggal_input" class="form-control bg-light" value="<?= $tanggal_now ?>" readonly>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Nomor Polisi</label>
                        <input type="text" name="no_polisi" class="form-control" placeholder="Contoh: B 1234 XYZ" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Type Kendaraan</label>
                        <select name="type_kendaraan" class="form-select" required>
                            <?php foreach($cars as $car): ?>
                                <option value="<?= $car ?>"><?= $car ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Nama Perusahaan</label>
                        <input type="text" name="nama_perusahaan" class="form-control" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Nama PIC</label>
                        <input type="text" name="nama_pic" id="formPic" class="form-control" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Nomor Telepon</label>
                        <input type="tel" name="no_telp" class="form-control" required>
                    </div>
                </div>

                <h5 class="text-hyundai border-bottom pb-2 mb-3 fw-bold">Kelengkapan Unit (Ceklist)</h5>
                <div class="row mb-4 g-2">
                    <?php foreach($items as $index => $item): ?>
                        <div class="col-md-4 col-6">
                            <div class="card p-2 bg-white border d-flex flex-row justify-content-between align-items-center" style="border-radius:10px;">
                                <span class="small fw-semibold text-wrap" style="max-width:60%; font-size:13px;"><?= $item ?></span>
                                <div class="btn-group btn-group-sm" role="group">
                                    <input type="radio" class="btn-check" name="ceklis[<?= $item ?>]" id="ada_<?= $index ?>" value="ADA" checked>
                                    <label class="btn btn-outline-success px-2" for="ada_<?= $index ?>">Ada</label>
                                    <input type="radio" class="btn-check" name="ceklis[<?= $item ?>]" id="tidak_<?= $index ?>" value="TIDAK">
                                    <label class="btn btn-outline-danger px-2" for="tidak_<?= $index ?>">Tidak</label>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>

                <h5 class="text-hyundai border-bottom pb-2 mb-3 fw-bold">Dokumentasi & Validasi</h5>
                <div class="row g-3 align-items-end mb-4">
                    <div class="col-md-6">
                        <label class="form-label">Upload Foto Kendaraan dari Galeri</label>
                        <input type="file" id="inputFoto" class="form-control" multiple accept="image/*" required>
                        <div id="hiddenPhotosContainer"></div>
                        <div class="form-text">Mendukung pemilihan banyak gambar sekaligus.</div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Tanda Tangan Digital (Mengetahui: <span id="labelPic" class="fw-bold">-</span>)</label>
                        <div>
                            <canvas id="sigPad" class="signature-component w-100" height="150"></canvas>
                            <input type="hidden" name="ttd_pic_base64" id="ttdBase64">
                            <button type="button" class="btn btn-sm btn-secondary mt-1" id="clearSig">Reset TTD</button>
                        </div>
                    </div>
                </div>

                <hr>
                <div class="d-flex justify-content-between">
                    <button type="button" onclick="location.href='index.php'" class="btn btn-light px-3 py-2">Kembali</button>
                    <button type="submit" class="btn bg-hyundai text-white px-4 py-2">Cetak BASTK</button>
                </div>
            </form>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js"></script>
    <script src="assets/js/app.js"></script>
</body>
</html>