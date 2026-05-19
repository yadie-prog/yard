<?php
require_once '../config/database.php';
$id = $_GET['id'];

// Ambil data utama & relasi operator tanda tangan otomatis
$query = "SELECT r.*, o.signature_img FROM bastk_records r 
          LEFT JOIN operators o ON r.operator_name = o.name 
          WHERE r.id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $id);
$stmt->execute();
$data = $stmt->get_result()->fetch_assoc();

if (!$data) { die("Data Transaksi Kelayakan BASTK Tidak Ditemukan."); }

// Ambil data kelengkapan checklist kendaraan
$chk_query = "SELECT * FROM bastk_checklist WHERE bastk_id = ?";
$stmt_c = $conn->prepare($chk_query);
$stmt_c->bind_param("i", $id);
$stmt_c->execute();
$checklist = $stmt_c->get_result()->fetch_assoc();

// Ambil kumpulan dokumentasi foto terlampir
$photo_query = "SELECT * FROM bastk_photos WHERE bastk_id = ?";
$stmt_p = $conn->prepare($photo_query);
$stmt_p->bind_param("i", $id);
$stmt_p->execute();
$photos_res = $stmt_p->get_result();
$photos = [];
while($p = $photos_res->fetch_assoc()) { $photos[] = $p['file_path']; }
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title><?php echo $data['no_polisi'] . "_" . date('Ymd', strtotime($data['tanggal_input'])); ?></title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body style="background: #525659; padding: 20px 0;">

    <!-- Bar Kontrol Floating Aksi Form -->
    <div class="no-print" style="max-width: 210mm; margin: 0 auto 15px auto; background: white; padding: 15px; border-radius: 6px; display: flex; justify-content: space-between;">
        <a href="login.html" style="padding: 10px 20px; background: #6b7280; color: white; text-decoration: none; border-radius: 4px; font-weight: 600;">Kembali ke Form Utama</a>
        <button onclick="window.print()" style="padding: 10px 25px; background: #002c5f; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Cetak Dokumen BASTK</button>
    </div>

    <!-- ================= PAGE 1: DOKUMEN UTAMA BASTK ================= -->
    <div class="a4-page" style="margin: 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.5);">
        <div class="header-print">
            <div>
                <h1 style="font-size: 18pt; font-weight: bold; color: #002c5f;"><?php echo strtoupper($data['jenis_bastk']); ?></h1>
                <p style="font-size: 10pt; color: #555;">Sistem Manajemen Logistik Kendaraan Hyundai Solusi Mobilitas</p>
            </div>
            <!-- Memanggil Logo dari folder aset lokal -->
            <img src="../assets/images/hyundai.png" alt="Hyundai Logo" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Hyundai_Motor_Company_logo.svg/2560px-Hyundai_Motor_Company_logo.svg.png'">
        </div>

        <table class="print-table">
            <tr>
                <th width="30%">Tanggal Cetak / Input</th><td><?php echo date('d-m-Y H:i', strtotime($data['tanggal_input'])); ?> WIB</td>
                <th width="25%">No. Polisi Unit</th><td><strong><?php echo $data['no_polisi']; ?></strong></td>
            </tr>
            <tr>
                <th>Nama Perusahaan</th><td><?php echo $data['nama_perusahaan']; ?></td>
                <th>Tipe Unit Kendaraan</th><td><?php echo $data['type_kendaraan']; ?></td>
            </tr>
            <tr>
                <th>Nama PIC Berwenang</th><td><?php echo $data['nama_pic']; ?></td>
                <th>No. Handphone PIC</th><td><?php echo $data['no_telp']; ?></td>
            </tr>
        </table>

        <h3 style="font-size: 12pt; margin: 15px 0 8px 0; border-bottom: 1px solid #000; padding-bottom:3px;">DAFTAR PENGECEKAN KELENGKAPAN KOMPONEN (CHECKLIST)</h3>
        
        <!-- Render tabel checklist menjadi 2 kolom simetris agar hemat tempat di kertas A4 -->
        <table class="print-table" style="font-size: 9.5pt;">
            <thead>
                <tr>
                    <th width="35%">Nama Komponen</th><th width="15%">Kondisi</th>
                    <th width="35%">Nama Komponen</th><th width="15%">Kondisi</th>
                </tr>
            </thead>
            <tbody>
                <?php 
                $keys = array_keys($checklist);
                // Buang elemen primary key database internal dari list view
                unset($keys[0]); $keys = array_values($keys); 
                
                $items_label = [
                    "stnk" => "STNK", "lembar_pajak" => "Lembar Pajak", "buku_manual" => "Buku Manual", "buku_service" => "Buku Service",
                    "asbak" => "Asbak", "kaca_spion_dalam" => "Kaca Spion Dalam", "kaca_spion_luar" => "Kaca Spion Luar", 
                    "karpet_depan" => "Karpet Depan", "karpet_tengah" => "Karpet Tengah", "karpet_belakang" => "Karpet Belakang",
                    "lighter" => "Lighter", "loud_speaker" => "Loud Speaker", "p3k" => "P3K", "sun_visor" => "Sun Visor",
                    "radio_tape_cd" => "Radio / Tape / CD", "head_rest" => "Head Rest", "antena" => "Antena", 
                    "segitiga_pengaman" => "Segitiga Pengaman", "talang_air" => "Talang Air", "ban_cadangan" => "Ban Cadangan",
                    "dongkrak" => "Dongkrak", "tool_set" => "Tool Set", "apar" => "APAR", "tirekit_ev" => "Tirekit (EV CAR)",
                    "charging_ev" => "Charging (EV CAR)", "v2l_ev" => "V2L (EV CAR)"
                ];

                for($i = 0; $i < count($keys); $i += 2): 
                ?>
                <tr>
                    <td><?php echo $items_label[$keys[$i]]; ?></td>
                    <td style="text-align:center; font-weight:bold;"><?php echo $checklist[$keys[$i]] ? 'ADA' : 'TIDAK'; ?></td>
                    <td><?php echo isset($keys[$i+1]) ? $items_label[$keys[$i+1]] : '-'; ?></td>
                    <td style="text-align:center; font-weight:bold;"><?php echo isset($keys[$i+1]) ? ($checklist[$keys[$i+1]] ? 'ADA' : 'TIDAK') : '-'; ?></td>
                </tr>
                <?php endfor; ?>
            </tbody>
        </table>

        <!-- Area Pengesahan Tanda Tangan Dokumen -->
        <div class="ttd-container">
            <div class="ttd-box">
                <div>OPERATOR SYSTEM</div>
                <div>
                    <?php if(!empty($data['signature_img']) && file_exists("../".$data['signature_img'])): ?>
                        <img src="../<?php echo $data['signature_img']; ?>" alt="Signature Operator">
                    <?php else: ?>
                        <div style="height:60px;"></div> <!-- Kosong jika input manual -->
                    <?php endif; ?>
                </div>
                <div style="border-top: 1px solid #000; padding-top: 5px;">( <?php echo $data['operator_name']; ?> )</div>
            </div>

            <div class="ttd-box">
                <div>MENGETAHUI : PIC KENDARAAN</div>
                <div>
                    <img src="<?php echo $data['signature_pic']; ?>" alt="Signature PIC">
                </div>
                <div style="border-top: 1px solid #000; padding-top: 5px;">( <?php echo $data['nama_pic']; ?> )</div>
            </div>

            <div class="ttd-box">
                <div>MANAGEMENT (ACC)</div>
                <div style="height:60px;"></div>
                <div style="border-top: 1px solid #000; padding-top: 5px;">( ____________________ )</div>
            </div>
        </div>
    </div>

    <!-- ================= PAGE 2 & SETERUSNYA: LAMPIRAN FOTO GRID 4x2 ================= -->
    <?php 
    $chunks = array_chunk($photos, 8); // Pecah array foto maksimal isi 8 gambar per halaman
    foreach($chunks as $page_index => $page_photos):
    ?>
    <div class="a4-page" style="margin: 20px auto 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.5);">
        <div class="header-print" style="margin-bottom: 10mm;">
            <div>
                <h1 style="font-size: 14pt; font-weight: bold; color: #002c5f;">LAMPIRAN FOTO DOKUMENTASI UNIT</h1>
                <p style="font-size: 9pt; color: #555;">No Plat Kendaraan: <?php echo $data['no_polisi']; ?> | Halaman Lampiran: <?php echo ($page_index + 1); ?></p>
            </div>
        </div>
        
        <div class="photo-grid">
            <?php foreach($page_photos as $p_path): ?>
                <div class="photo-item">
                    <img src="../<?php echo $p_path; ?>" alt="Dokumentasi Serah Terima">
                </div>
            <?php endforeach; ?>
        </div>
    </div>
    <?php endforeach; ?>

</body>
</html>