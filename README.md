# ACM TikTok — Frontend

Frontend React + Vite untuk backend `be-acm-tiktok`. Semua kontrol dan data di UI
mengikuti kontrak yang benar-benar tersedia di backend.

## Menjalankan

```bash
cd fe-acm-tiktok
npm install
npm run dev
```

Buka `http://localhost:5173`.

Dev server mem-proxy `/api` ke `http://localhost:8000`, jadi jalankan backend dulu:

```bash
cd ../be-acm-tiktok
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Build produksi

```bash
npm run build
npm run preview
```

Jika frontend di-serve terpisah dari backend, set base URL backend sebelum build:

```bash
VITE_API_BASE_URL=http://localhost:8000 npm run build
```

Atau salin `.env.example` menjadi `.env` lalu sesuaikan nilainya.

## Kontrak backend yang dipakai

| Method | Endpoint   | Body / Response |
| ------ | ---------- | --------------- |
| `GET`  | `/status`  | `{ "status": "ok" }` |
| `POST` | `/comment` | Body: `{ "url": string, "accounts": string[], "mood": string, "context": string, "per_account_comment": boolean, "custom_prompt": string }` → `{ "success": boolean, "message": string }` |

Contoh body:

```json
{
  "url": "https://www.tiktok.com/@user/video/123456",
  "accounts": ["akun1", "akun2"],
  "mood": "positive",
  "context": "Video dance viral dengan lagu pop",
  "per_account_comment": true,
  "custom_prompt": "Komentar singkat, lucu, pakai 1 emoji, jangan pakai hashtag"
}
```

`context`, `per_account_comment`, dan `custom_prompt` diteruskan ke
`run_auto_comment()` di `tiktok_comment.py`. `context` kosong akan diganti backend
dengan `"Video TikTok di URL: <url>"`. `custom_prompt` ditambahkan ke prompt AI
sebagai arahan tambahan yang wajib diikuti.

Catatan penting: backend memproses komentar di background, sehingga respons
`POST /comment` hanya menandakan perintah diterima. Hasil per akun harus dilihat
di log Docker/terminal backend.

## Form pengaturan AI

- **Mood komentar** — `positive` atau `negative`, sesuai `list_moods()`.
- **Mode komentar** — `Unik per akun` (`per_account_comment: true`) atau
  `Sama untuk semua` (`per_account_comment: false`).
- **Arahan komentar (prompt)** — arahan manual opsional (maks. 500 karakter di UI)
  yang dikirim sebagai `custom_prompt` dan ditambahkan ke prompt AI.
- **Konteks video** — deskripsi opsional (maks. 500 karakter di UI) yang dipakai
  AI sebagai `context`. Kosongkan untuk memakai URL video sebagai konteks.

## Data yang disamakan dengan backend

- **Akun** (`ACCOUNT_PORT_MAP` & `DISPLAY_NAMES` di `tiktok_comment.py`):
  - `akun1` — Fatur Ikhsanudin — port 9222
  - `akun2` — Ridetes7 — port 9223
  - `akun3` — Ridonajrul — port 9224
  - `akun4` — Usertestpkl — port 9225
  - `akun5` — Gptridho — port 9226
- **Mood** (`list_moods()` di `gemini_comment.py`): `positive`, `negative`.
- **Histori**: backend tidak menyediakan endpoint histori, jadi riwayat di UI
  disimpan lokal di `localStorage` browser.

## Struktur

```
fe-acm-tiktok/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── styles.css
│   ├── components/     # ResultCard, HistoryPanel, InfoCard, StatusPill, Icons
│   ├── data/           # daftar akun & mood (mengikuti backend)
│   └── lib/            # API client & formatter
├── public/favicon.svg
├── vite.config.js
└── .env.example
```
