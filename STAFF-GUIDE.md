# Panduan Staf: Mengurus Laman Web RecondHub

Semua kandungan stok, showroom, agen dan lead diurus dalam **satu Google Sheet**. Tiada login atau panel admin. Apa sahaja yang anda ubah dalam sheet akan muncul di laman web **dalam masa 5 minit**, atau serta-merta jika anda tekan **RecondHub → 🔄 Refresh website** di menu atas sheet.

> Jangan tukar nama tab (`Stock`, `Showrooms`, `Agents`, `Leads`, `Settings`) atau nama lajur di baris 1. Susunan lajur boleh diubah, tetapi nama mesti sama.

---

## 1. Tambah kereta baharu

Pergi ke tab **Stock** dan isi satu baris baharu:

| Lajur | Contoh | Nota |
| --- | --- | --- |
| `code` | RH121 | Kod unik. Jangan guna semula kod lama. |
| `status` | Available | Available / Reserved / Sold / Hidden |
| `make` | Toyota | |
| `model` | Alphard | Eja sama setiap kali (cth. "Alphard", bukan "alphard sc") |
| `variant` | 2.5 SC | |
| `year_manufactured` | 2021 | Wajib |
| `year_registered` | 2024 | Kosongkan jika belum daftar |
| `body_type` | MPV | Hanya: MPV, SUV, Sedan, Hatchback, Coupe, Pickup |
| `price_rm` | 238000 | Nombor sahaja (RM 238,000 pun boleh) |
| `mileage_km` | 32000 | |
| `grade` | 4.5 | Gred lelongan |
| `engine_cc` | 2494 | |
| `transmission` | Automatic | Automatic / Manual |
| `fuel` | Petrol | Petrol / Hybrid / Diesel / Plug-in Hybrid |
| `colour` | Pearl White | |
| `showroom_id` | SR01 | Mesti sama dengan tab Showrooms. Kosongkan jika kereta AP rakan. |
| `state` | Selangor | Wajib jika tiada showroom |
| `photos` | (pautan gambar) | Lihat bahagian 3 |
| `auction_sheet_url` | (auto) | Auction sheet = laporan pemeriksaan dari Jepun (bukan lelongan). Diisi sendiri dari folder gambar. |
| `highlights` | Pilot seats, Sunroof, JBL | Dipisahkan dengan koma |
| `description` | Teks ringkas | |
| `featured` | TRUE | TRUE = tunjuk di halaman utama |
| `date_added` | (auto) | Diisi sendiri bila anda taip `code` |

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
2. Dalam beberapa saat, lajur **`photo_folder`** akan ada pautan folder, cth. `RH121 - Toyota Alphard 2021`.
3. **Klik pautan itu**, kemudian **drag gambar masuk** ke folder (dari telefon: buka Google Drive app → folder → **+** → Upload).
4. Namakan gambar ikut susunan: **01, 02, 03 …**
   - **Gambar 01 = gambar utama (cover).** Pilih sisi depan yang paling cantik.
   - Susunan disyorkan: depan, sisi, belakang, dalaman depan, kerusi belakang, dashboard, enjin.
5. **Auction sheet** (laporan pemeriksaan kereta dari Jepun, yang ada gred dan mileage; bukan berkaitan lelongan kita): ambil gambar dokumen itu dan namakan fail dengan perkataan **auction** (cth. `auction-sheet.jpg`). Kereta tanpa auction sheet (cth. dari UK)? Abaikan sahaja.
6. Lajur `photos` dan `auction_sheet_url` **diisi sendiri** setiap 10 minit. Nak terus keluar di website? Tekan **RecondHub → 🔄 Refresh website**.

Jangan taip dalam lajur `photos` atau `auction_sheet_url`. Ia akan ditulis semula oleh sistem.

Tips gambar: guna mod landskap (melintang), cahaya siang, latar belakang bersih. Saiz ideal sekurang-kurangnya 1600 piksel lebar.

## 4. Tambah atau nyahaktif agen

Tab **Agents**:

| Lajur | Contoh | Nota |
| --- | --- | --- |
| `agent_id` | A06 | Kod unik. Jangan tukar selepas digunakan. |
| `name` | Nurul Aisyah | |
| `state` | Kedah | Nama negeri, atau `HQ` untuk SA di HQ |
| `showroom_id` | | Pilihan |
| `whatsapp` | 60123456789 | Format 60XXXXXXXXX |
| `photo` | (pautan Drive) | Pilihan, gambar muka segi empat |
| `active` | TRUE | FALSE = berhenti terima lead |

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
| `timestamp` | Masa lead masuk (waktu Malaysia) |
| `type` | Jenis lead (lihat bawah) |
| `car_code` | Kereta yang diminati |
| `name`, `phone`, `state` | Maklumat pelanggan (jika diisi) |
| `showroom_id`, `preferred_date`, `preferred_time` | Untuk tempahan tontonan |
| `details_json` | Maklumat tambahan (cth. kiraan pinjaman, kereta trade-in) |
| `assigned_to` | Agen / showroom / SA yang menerima lead |
| `source_page` | Halaman laman web tempat lead dihantar |
| `utm_source`, `utm_campaign` | Dari mana pelanggan datang (cth. tiktok) |
| `status` | Sentiasa `New` bila masuk |

**Jenis lead (`type`)**:

- `viewing_booking`: tempah tontonan (paling penting, hubungi segera)
- `whatsapp_enquiry`: tekan butang WhatsApp
- `loan`: hantar kiraan pinjaman
- `trade_in`: minta nilai trade-in
- `find_me_a_car`: minta dicarikan kereta
- `private_sourcing`: kereta eksotik, terus kepada owner
- `agent_application`: mohon jadi agen

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
