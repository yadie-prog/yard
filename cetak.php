<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit();
}

$d = $_POST;
$op_clean = strtolower($d['operator_nama']);
$list_op_fiks = ['misto', 'alfian', 'efendi', 'derry'];

$ttd_operator_img = in_array($op_clean, $list_op_fiks) ? "assets/images/" . $op_clean . ".png" : "";
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title><?= str_replace(' ', '_', strtoupper($d['no_polisi'])) . "_" . date('Y-m-d', strtotime($d['tanggal_input'])) ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

    <div class="container no-print my-4 d-flex justify-content-between p-3 bg-white rounded shadow-sm">
        <button onclick="window.history.back();" class="btn btn-warning fw-semibold">← Kembali ke Form Isian</button>
        <button onclick="window.print()" class="btn btn-success fw-semibold">Cetak BASTK (Simpan PDF)</button>
    </div>

    <div class="print-page bg-white mx-auto border mb-4">
        <!-- Header Dokumen -->
        <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
            <img src="Hyundai_logo.png" alt="Hyundai Logo" style="height: 35px; object-fit: contain;" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Hyundai_Motor_Company_logo.svg/2560px-Hyundai_Motor_Company_logo.svg.png'">
            <div class="text-end">
                <h5 class="fw-bold text-hyundai m-0"><?= strtoupper($d['jenis_bastk']) ?></h5>
                <small class="text-muted">Tanggal: <?= $d['tanggal_input'] ?></small>
            </div>
        </div>

        <div class="row mb-3 small">
            <div class="col-6">
                <table class="table table-sm table-borderless m-0">
                    <tr><td width="35%">No. Polisi</td><td>: <strong><?= strtoupper($d['no_polisi']) ?></strong></td></tr>
                    <tr><td>Perusahaan</td><td>: <?= htmlspecialchars($d['nama_perusahaan']) ?></td></tr>
                    <tr><td>Nama PIC</td><td>: <?= htmlspecialchars($d['nama_pic']) ?></td></tr>
                </table>
            </div>
            <div class="col-6">
                <table class="table table-sm table-borderless m-0">
                    <tr><td width="35%">Tipe Unit</td><td>: <?= $d['type_kendaraan'] ?></td></tr>
                    <tr><td>No. Telp</td><td>: <?= htmlspecialchars($d['no_telp']) ?></td></tr>
                    <tr><td>Operator</td><td>: <?= htmlspecialchars($d['operator_nama']) ?></td></tr>
                </table>
            </div>
        </div>

        <h6 class="fw-bold text-hyundai border-bottom pb-1 small" style="letter-spacing: 0.5px;">Hasil Ceklist Kelengkapan</h6>
        <div class="row g-1 mb-4" style="font-size: 11px;">
            <?php foreach ($d['ceklis'] as $item => $status): 
                $color = ($status === 'ADA') ? 'text-success' : 'text-danger fw-bold';
            ?>
                <div class="col-4 border-bottom py-1 d-flex justify-content-between">
                    <span><?= $item ?></span>
                    <span class="<?= $color ?>" style="margin-right:15px;"><?= $status === 'ADA' ? '✔ ADA' : '✘ TIDAK' ?></span>
                </div>
            <?php endforeach; ?>
        </div>

        <div class="position-absolute" style="bottom: 25mm; left: 15mm; right: 15mm;">
            <div class="row text-center small">
                <div class="col-4">
                    <p class="mb-4 text-muted">Petugas / Operator</p>
                    <div style="height: 55px;" class="d-flex align-items-center justify-content-center">
                        <?php if (!empty($ttd_operator_img) && file_exists($ttd_operator_img)): ?>
                            <img src="<?= $ttd_operator_img ?>" style="max-height: 55px;">
                        <?php else: ?>
                            <span class="text-muted">( _________________ )</span>
                        <?php endif; ?>
                    </div>
                    <p class="fw-bold mt-2 border-top pt-1 m-0"><?= htmlspecialchars($d['operator_nama']) ?></p>
                </div>
                <div class="col-4">
                    <p class="mb-4 text-muted">Mengetahui : PIC</p>
                    <div style="height: 55px;" class="d-flex align-items-center justify-content-center">
                        <img src="<?= $d['ttd_pic_base64'] ?>" style="max-height: 55px;">
                    </div>
                    <p class="fw-bold mt-2 border-top pt-1 m-0"><?= htmlspecialchars($d['nama_pic']) ?></p>
                </div>
                <div class="col-4">
                    <p class="mb-4 text-muted">Disetujui Oleh</p>
                    <div style="height: 55px;"></div>
                    <p class="fw-bold mt-2 border-top pt-1 m-0">ACC</p>
                </div>
            </div>
        </div>
    </div>

    <?php if (!empty($d['foto_base64'])): ?>
        <?php 
        $chunks = array_chunk($d['foto_base64'], 8); 
        $total_foto = count($d['foto_base64']);
        $foto_counter = 1;

        foreach ($chunks as $page_index => $photo_set):
        ?>
        <div class="print-page bg-white mx-auto border mb-4">
            <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <span class="fw-bold text-hyundai small" style="letter-spacing: 0.5px;">
                    LAMPIRAN DOKUMENTASI FISIK UNIT – <?= strtoupper($d['no_polisi']) ?>
                </span>
                <span class="text-muted small" style="font-size: 11px;">
                    Halaman Foto: <?= $page_index + 1 ?> dari <?= count($chunks) ?>
                </span>
            </div>

            <div class="photo-grid-4x2">
                <?php foreach ($photo_set as $base64_src): ?>
                    <div class="photo-card-frame">
                        <div class="photo-badge">FOTO <?= $foto_counter++ ?> / <?= $total_foto ?></div>
                        <img src="<?= $base64_src ?>" alt="Dokumentasi Unit BASTK">
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endforeach; ?>
    <?php endif; ?>

    <script>
        window.print();
    </script>
</body>
</html>