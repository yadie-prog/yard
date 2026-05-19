<?php
require_once '../config/database.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $jenis_bastk = $_POST['jenis_bastk'];
    $operator_name = $_POST['operator_name'];
    $tanggal_input = $_POST['tanggal_input'];
    $no_polisi = strtoupper($_POST['no_polisi']);
    $nama_perusahaan = $_POST['nama_perusahaan'];
    $nama_pic = $_POST['nama_pic'];
    $no_telp = $_POST['no_telp'];
    $type_kendaraan = $_POST['type_kendaraan'];
    $signature_data = $_POST['signature_data'];

    // Gunakan DB Transaction agar konsistensi data terjaga di 3 tabel berbeda
    $conn->begin_transaction();

    try {
        // 1. Insert ke tabel bastk_records
        $stmt = $conn->prepare("INSERT INTO bastk_records (tanggal_input, jenis_bastk, operator_name, no_polisi, nama_perusahaan, nama_pic, no_telp, type_kendaraan, signature_pic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssssssss", $tanggal_input, $jenis_bastk, $operator_name, $no_polisi, $nama_perusahaan, $nama_pic, $no_telp, $type_kendaraan, $signature_data);
        $stmt->execute();
        $bastk_id = $conn->insert_id;

        // 2. Pemetaan & Insert data Checklist Komponen
        $chk = $_POST['chk'];
        $cols = array_keys($chk);
        $vals = array_values($chk);
        
        $sql_chk = "INSERT INTO bastk_checklist (bastk_id, " . implode(", ", $cols) . ") VALUES (" . $bastk_id . ", " . implode(", ", $vals) . ")";
        $conn->query($sql_chk);

        // 3. Pemrosesan Upload Lampiran File Gambar multi-upload
        if (!empty($_FILES['photos']['name'][0])) {
            $target_dir = "../uploads/";
            if (!file_exists($target_dir)) {
                mkdir($target_dir, 0777, true);
            }

            foreach ($_FILES['photos']['name'] as $i => $name) {
                if ($_FILES['photos']['error'][$i] === 0) {
                    $ext = pathinfo($name, PATHINFO_EXTENSION);
                    $new_filename = "IMG_" . uniqid() . "." . $ext;
                    $target_file = $target_dir . $new_filename;

                    if (move_uploaded_file($_FILES['photos']['tmp_name'][$i], $target_file)) {
                        $db_path = "uploads/" . $new_filename;
                        $stmt_img = $conn->prepare("INSERT INTO bastk_photos (bastk_id, file_path) VALUES (?, ?)");
                        $stmt_img->bind_param("is", $bastk_id, $db_path);
                        $stmt_img->execute();
                    }
                }
            }
        }

        // Jika semua operasi sukses, simpan perubahan permanen
        $conn->commit();
        
        // Alihkan halaman langsung menuju preview A4
        header("Location: ../views/cetak.php?id=" . $bastk_id);
        exit();

    } catch (Exception $e) {
        $conn->rollback();
        echo "Gagal memproses data BASTK: " . $e->getMessage();
    }
}
?>