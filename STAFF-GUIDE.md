# Panduan Staf: Mengurus Laman Web RecondHub

Semua kandungan stok, showroom, agen dan lead diurus dalam **satu Google Sheet**. Tiada login atau panel admin. Apa sahaja yang anda ubah dalam sheet akan muncul di laman web **dalam masa 5 minit**, atau serta-merta jika anda tekan **RecondHub → 🔄 Refresh website** di menu atas sheet.

> Jangan tukar nama tab (`Stock`, `Showrooms`, `Agents`, `Leads`, `Settings`) atau nama lajur di baris 1. Susunan lajur boleh diubah, tetapi nama mesti sama.

---

## 1. Tambah kereta baharu

Pergi ke tab **Stock** dan isi satu baris baharu:

| Lajur | Contoh | Nota |
| --- | --- | --- |
| **Kod Kereta** | RH121 | Kod unik. Jangan guna semula kod lama. |
| **Status** | Available | Available / Reserved / Sold / Hidden |
| **Jenama** | Toyota | |
| **Model** | Alphard | Eja sama setiap kali (cth. "Alphard", bukan "alphard sc") |
| **Varian** | 2.5 SC | |
| **Tahun Dibuat** | 2021 | Wajib |
| **Tahun Daftar** | 2024 | Kosongkan jika belum daftar |
| **Jenis Badan** | MPV | Hanya: MPV, SUV, Sedan, Hatchback, Coupe, Pickup |
| **Harga (RM)** | 238000 | Nombor sahaja (RM 238,000 pun boleh) |
| **Mileage (km)** | 32000 | |
| **Gred Auction** | 4.5 | Gred dari auction sheet (laporan pemeriksaan Jepun) |
| **Enjin (cc)** | 2494 | |
| **Gear** | Automatic | Automatic / Manual |
| **Minyak** | Petrol | Petrol / Hybrid / Diesel / Plug-in Hybrid / Electric |
| **Warna** | Pearl White | |
| **Tempat Duduk** | 7 | Bilangan tempat duduk |
| **Pacuan** | 2WD | 2WD / 4WD / AWD |
| **Lajur hijau** (Sunroof, Moonroof / Panoramic, Pintu Elektrik, Bonet Elektrik, Pilot Seat, Kerusi Kulit, Kamera 360, Skrin Belakang, Head-Up Display, Audio Premium, Apple CarPlay / Android Auto, Adaptive Cruise) | TRUE | Pilih TRUE kalau kereta ada ciri itu. Kosongkan kalau tiada. Pelanggan boleh tapis ikut ciri ini. |
| **Kelebihan Lain** | Modellista bodykit, Digital mirror | Ciri lain yang tiada dalam lajur hijau, dipisah koma |
| **Penerangan** | Teks ringkas | |
| **Showroom** | SR01 | Pilih dari senarai. Kosongkan jika kereta AP rakan. |
| **Negeri** | Selangor | Wajib jika tiada showroom |
| **Tonjol di Laman Utama** | TRUE | TRUE = papar di halaman utama |
| **Folder Gambar** | (auto) | Pautan folder gambar, dibuat sendiri. Lihat bahagian 3. |
| **Gambar (auto)** / **Auction Sheet (auto)** | (auto) | Jangan isi. Diisi sendiri dari folder gambar. |
| **Tarikh Masuk** / **Tarikh Jual** | (auto) | Diisi sendiri |

Kemudian tekan **RecondHub → 🔄 Refresh website**.

**Jika kereta tidak muncul**: baris itu mungkin ada kesilapan (cth. `body_type` salah eja, harga kosong, negeri tidak dikenali). Baris yang salah akan dilangkau, bukan merosakkan laman web. Semak semula lajur wajib: `code`, `status`, `make`, `model`, `year_manufactured`, `body_type`, `price_rm`, dan sama ada `showroom_id` atau `state`.

## 2. Tanda kereta sebagai Reserved atau Sold

- **Reserved**: tukar `status` kepada `Reserved`. Kereta masih dipaparkan dengan lencana "Reserved" dan pelanggan masih boleh WhatsApp.
- **Sold**: tukar `status` kepada `Sold`. Lajur `sold_date` akan diisi tarikh hari ini secara automatik.
  - 7 hari pertama: kereta masih tersenarai dengan lencana "Sold".
  - Sehingga 30 hari: halaman kereta menunjukkan "Sold" dan cadangan kereta lain.
  - Selepas 30 hari: halaman dialihkan ke halaman model (cth. semua Alphard).
- **Hidden**: kereta tidak dipaparkan langsung (cth. gambar belum siap, harga belum muktamad).
- Jika jualan batal, tukar semula ke `Available`. `sold_date` akan dikosongkan.

**Jangan padam baris kereta yang sudah dijual.** Tanda sebagai Sold supaya pautan lama di TikTok/WhatsApp masih berfungsi.

## 3. Tambah gambar

Anda **tak perlu buat folder atau salin pautan**. Semuanya automatik.

1. Taip **kod kereta** dalam tab Stock (cth. `RH121`), dan isi make, model dan tahun.
2. Dalam beberapa saat, lajur **Folder Gambar** akan ada pautan folder, cth. `RH121 - Toyota Alphard 2021`.
3. **Klik pautan itu**, kemudian **drag gambar masuk** ke folder (dari telefon: buka Google Drive app → folder → **+** → Upload).
4. Namakan gambar ikut susunan: **01, 02, 03 …**
   - **Gambar 01 = gambar utama (cover).** Pilih sisi depan yang paling cantik.
   - Susunan disyorkan: depan, sisi, belakang, dalaman depan, kerusi belakang, dashboard, enjin.
5. **Auction sheet** (laporan pemeriksaan kereta dari Jepun, yang ada gred dan mileage; bukan berkaitan lelongan kita): ambil gambar dokumen itu dan namakan fail dengan perkataan **auction** (cth. `auction-sheet.jpg`). Kereta tanpa auction sheet (cth. dari UK)? Abaikan sahaja.
6. Lajur **Gambar (auto)** dan **Auction Sheet (auto)** **diisi sendiri** setiap 10 minit. Nak terus keluar di website? Tekan **RecondHub → 🔄 Refresh website**.

Jangan taip dalam lajur **Gambar (auto)** atau **Auction Sheet (auto)**. Ia akan ditulis semula oleh sistem.

Tips gambar: guna mod landskap (melintang), cahaya siang, latar belakang bersih. Saiz ideal sekurang-kurangnya 1600 piksel lebar.

## 4. Tambah atau nyahaktif agen

Tab **Agents**:

| Lajur | Contoh | Nota |
| --- | --- | --- |
| **Kod Agen** | A06 | Kod unik. Jangan tukar selepas digunakan. |
| **Nama** | Nurul Aisyah | |
| **Negeri** | Kedah | Nama negeri, atau `HQ` untuk SA di HQ |
| **Showroom** | | Pilihan |
| **WhatsApp** | 60123456789 | Format 60XXXXXXXXX |
| **Gambar** | (pautan Drive) | Pilihan, gambar muka segi empat |
| **Aktif** | TRUE | FALSE = berhenti terima pelanggan |

- Lead dari negeri agen akan dihantar kepada agen itu secara bergilir (jika ada lebih dari seorang).
- Negeri tanpa agen: lead dihantar kepada SA di HQ (`state` = `HQ`) secara bergilir.
- Agen berhenti? Tukar `active` kepada **FALSE**. Jangan padam baris.

**Pautan peribadi agen**: setiap agen ada halaman `/agent/<id>` (cth. `recondhub.my/agent/a06`) yang menunjukkan pautan peribadi mereka, contohnya `recondhub.my/agent/a06?ref=A06`. Sesiapa yang buka pautan ini akan dihantar kepada agen tersebut selama 30 hari. Tambah `?ref=A06` di hujung mana-mana pautan kereta juga boleh.

## 5. Showroom

Tab **Showrooms**: isi `showroom_id` (cth. SR04), nama, negeri, alamat, pautan Google Maps, WhatsApp showroom dan waktu operasi.

Tulis `opening_hours` seperti contoh ini supaya slot tempahan dijana dengan betul:

- `Mon-Sat 10:00-19:00; Sun 11:00-17:00`
- `Daily 10:00-19:00`
- `Mon-Fri 9:30-18:00, Sat 10:00-16:00, Sun Closed`

## 6. Baca dan urus lead

Tab **Leads** diisi oleh laman web setiap kali pelanggan menghantar borang atau menekan butang WhatsApp.

| Lajur | Maksud |
| --- | --- |
| **Masa** | Masa pelanggan hubungi (waktu Malaysia) |
| **Jenis** | Tempah Tontonan, Tanya WhatsApp, Kira Pinjaman, Trade-in, Cari Kereta, Private Sourcing, Mohon Jadi Agen |
| **Kod Kereta** | Kereta yang diminati |
| **Nama**, **Telefon**, **Negeri** | Maklumat pelanggan (jika diisi) |
| **Showroom**, **Tarikh Pilihan**, **Masa Pilihan** | Untuk tempahan tontonan |
| **Maklumat Tambahan** | Cth. kiraan pinjaman, kereta trade-in, dan siapa yang terima lead |
| **Diserah Kepada** | Agen / showroom / SA yang menerima pelanggan |
| **Halaman** | Halaman website tempat pelanggan tekan |
| **Sumber Iklan**, **Kempen Iklan** | Dari mana pelanggan datang (cth. tiktok) |
| **Status** | Sentiasa `New` bila masuk |

**Lajur Jenis**:

- **Tempah Tontonan**: pelanggan tempah untuk tengok kereta (paling penting, hubungi segera)
- **Tanya WhatsApp**: pelanggan tekan butang WhatsApp
- **Kira Pinjaman**: pelanggan hantar kiraan pinjaman
- **Trade-in**: pelanggan minta nilai kereta lama
- **Cari Kereta**: pelanggan minta dicarikan kereta
- **Private Sourcing**: kereta eksotik, terus kepada owner
- **Mohon Jadi Agen**: permohonan jadi agen

**Langkah kerja**:

1. Pelanggan juga akan WhatsApp anda terus. Balas secepat mungkin.
2. Selepas menghubungi pelanggan, **tukar `status`**, contohnya: `Contacted`, `Booked`, `Test drive`, `Loan submitted`, `Sold`, `Lost`.
3. Lead yang masih `New` selepas **15 minit** akan diwarnakan merah dan HQ akan menerima emel amaran. Tukar status untuk menghentikannya.

Tips: guna **Data → Create a filter** untuk lihat lead anda sahaja (tapis `assigned_to`) atau lead hari ini sahaja.

**Jangan kongsi sheet Leads dengan orang luar.** Ia mengandungi data peribadi pelanggan (PDPA).

## 7. Tetapan (tab Settings)

- `hq_whatsapp`: nombor WhatsApp HQ
- `owner_whatsapp`: nombor owner untuk Private Sourcing
- `default_interest_rate`: kadar faedah lalai kalkulator (cth. 3.0)
- `max_tenure_years`: tempoh maksimum (9)
- `min_downpayment_pct`: deposit minimum (10)

Tukar kadar faedah di sini bila kadar bank berubah. Semua "dari RM X/bulan" di laman web akan dikemas kini.

---

**Masalah?** Tekan **RecondHub → 🔄 Refresh website** dahulu. Jika masih tidak betul selepas 5 minit, hubungi pentadbir laman web dengan kod kereta atau nombor baris.
