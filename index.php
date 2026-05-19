<?php
session_start();
// Memproses Penguncian Gerbang Awal Aplikasi BASTK
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $_SESSION['gate_jenis_bastk'] = $_POST['jenis_bastk'];
    $_SESSION['gate_operator_nama'] = ($_POST['operator_select'] === 'Manual') ? $_POST['operator_manual'] : $_POST['operator_select'];
    header('Location: input.php');
    exit();
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gate Control BASTK</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="d-flex align-items-center min-vh-100">
    <div class="container px-4">
        <div class="row justify-content-center">
            <div class="col-md-5 col-lg-4">
                <div class="card card-premium p-4">
                    <div class="text-center mb-4">
                        <h4 class="fw-bold text-hyundai">BASTK SYSTEM</h4>
                        <p class="text-muted small">Silakan tentukan parameter awal tugas</p>
                    </div>
                    <form action="" method="POST" id="gateForm">
                        <div class="mb-3">
                            <label class="form-label fw-semibold">Jenis BASTK</label>
                            <select name="jenis_bastk" class="form-select" required>
                                <option value="" selected disabled>-- Pilih Jenis --</option>
                                <option value="BASTK Unit Masuk">BASTK Unit Masuk</option>
                                <option value="BASTK Unit Keluar">BASTK Unit Keluar</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="form-label fw-semibold">Nama Operator</label>
                            <select name="operator_select" id="operatorSelect" class="form-select mb-2" required>
                                <option value="" selected disabled>-- Pilih Operator --</option>
                                <option value="Misto">Misto</option>
                                <option value="Alfian">Alfian</option>
                                <option value="Efendi">Efendi</option>
                                <option value="Derry">Derry</option>
                                <option value="Manual">Nama Lain (Isi Manual)</option>
                            </select>
                            <input type="text" name="operator_manual" id="operatorManual" class="form-control d-none" placeholder="Masukkan nama operator manual...">
                        </div>
                        <button type="submit" class="btn bg-hyundai text-white w-100 py-3 rounded-3 fw-semibold">Masuk Halaman Input</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('operatorSelect').addEventListener('change', function() {
            const manualInput = document.getElementById('operatorManual');
            if(this.value === 'Manual') {
                manualInput.classList.remove('d-none');
                manualInput.setAttribute('required', 'required');
            } else {
                manualInput.classList.add('d-none');
                manualInput.removeAttribute('required');
            }
        });
    </script>
</body>
</html>