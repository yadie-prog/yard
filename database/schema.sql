CREATE DATABASE IF NOT EXISTS db_bastk;
USE db_bastk;

-- Tabel Operator untuk TTD otomatis
CREATE TABLE IF NOT EXISTS operators (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    signature_img VARCHAR(100) NULL
);

INSERT INTO operators (name, signature_img) VALUES 
('Misto', 'assets/images/misto.png'),
('Alfian', 'assets/images/alfian.png'),
('Efendi', 'assets/images/efendi.png'),
('Derry', 'assets/images/derry.png');

-- Tabel Utama BASTK
CREATE TABLE IF NOT EXISTS bastk_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tanggal_input DATETIME NOT NULL,
    jenis_bastk ENUM('BASTK Unit Masuk', 'BASTK Unit Keluar') NOT NULL,
    operator_name VARCHAR(50) NOT NULL,
    no_polisi VARCHAR(20) NOT NULL,
    nama_perusahaan VARCHAR(100) NOT NULL,
    nama_pic VARCHAR(100) NOT NULL,
    no_telp VARCHAR(20) NOT NULL,
    type_kendaraan VARCHAR(50) NOT NULL,
    signature_pic TEXT NOT NULL, -- Menyimpan data URL base64 dari canvas ttd
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Item Ceklis (Relasi One-to-One dengan bastk_records)
CREATE TABLE IF NOT EXISTS bastk_checklist (
    bastk_id INT PRIMARY KEY,
    stnk TINYINT(1) DEFAULT 0, lembar_pajak TINYINT(1) DEFAULT 0,
    buku_manual TINYINT(1) DEFAULT 0, buku_service TINYINT(1) DEFAULT 0,
    asbak TINYINT(1) DEFAULT 0, kaca_spion_dalam TINYINT(1) DEFAULT 0,
    kaca_spion_luar TINYINT(1) DEFAULT 0, karpet_depan TINYINT(1) DEFAULT 0,
    karpet_tengah TINYINT(1) DEFAULT 0, karpet_belakang TINYINT(1) DEFAULT 0,
    lighter TINYINT(1) DEFAULT 0, loud_speaker TINYINT(1) DEFAULT 0,
    p3k TINYINT(1) DEFAULT 0, sun_visor TINYINT(1) DEFAULT 0,
    radio_tape_cd TINYINT(1) DEFAULT 0, head_rest TINYINT(1) DEFAULT 0,
    antena TINYINT(1) DEFAULT 0, segitiga_pengaman TINYINT(1) DEFAULT 0,
    talang_air TINYINT(1) DEFAULT 0, ban_cadangan TINYINT(1) DEFAULT 0,
    dongkrak TINYINT(1) DEFAULT 0, tool_set TINYINT(1) DEFAULT 0,
    apar TINYINT(1) DEFAULT 0, tirekit_ev TINYINT(1) DEFAULT 0,
    charging_ev TINYINT(1) DEFAULT 0, v2l_ev TINYINT(1) DEFAULT 0,
    FOREIGN KEY (bastk_id) REFERENCES bastk_records(id) ON DELETE CASCADE
);

-- Tabel Foto Dokumentasi
CREATE TABLE IF NOT EXISTS bastk_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bastk_id INT,
    file_path VARCHAR(255) NOT NULL,
    FOREIGN KEY (bastk_id) REFERENCES bastk_records(id) ON DELETE CASCADE
);