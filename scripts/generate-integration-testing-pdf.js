'use strict';

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

// ─── Edge executable paths (Windows 11) ──────────────────────────────────────
const EDGE_PATHS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

function findEdge() {
  for (const p of EDGE_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Microsoft Edge tidak ditemukan. Pastikan Edge terinstall di Windows 11.');
}

// ─── Data 16 test cases ───────────────────────────────────────────────────────
const KELAS = [
  {
    id: 'KL-01',
    title: 'KL-01 — Pengujian Endpoint Infrastruktur',
    subtitle: 'Endpoint: GET /health &nbsp;|&nbsp; GET /api/ &nbsp;|&nbsp; Strategi: supertest HTTP langsung ke app',
    tests: [
      { no:1, id:'IT-01', butir:'I-HEALTH: GET /health mengembalikan status sistem',                input:'GET /health (tanpa body)',                                 expected:'HTTP 200; body.status="ok"; body.timestamp terdefinisi', actual:'HTTP 200; status="ok"; timestamp ada (ISO string)' },
      { no:2, id:'IT-02', butir:'I-1: GET /api/ mengembalikan root response sukses',                input:'GET /api/ (tanpa body)',                                   expected:'HTTP 200; success=true; message terdefinisi',            actual:'HTTP 200; success=true; message ada' },
    ],
  },
  {
    id: 'KL-02',
    title: 'KL-02 — Pengujian GET /api/parameters',
    subtitle: 'Endpoint: GET /api/parameters &nbsp;|&nbsp; Mock: prisma.seedParameters.findMany',
    tests: [
      { no:1, id:'IT-03', butir:'I-2: DB return 3 row → 200 dengan data array length 3',           input:'GET /api/parameters; mock findMany resolve 3 rows (G0, G2, G3)',  expected:'HTTP 200; success=true; data.length=3; data[0].generationName ada', actual:'HTTP 200; success=true; data.length=3; generationName ada' },
      { no:2, id:'IT-04', butir:'I-3: DB throw error → 500 dengan success:false',                   input:'GET /api/parameters; mock findMany reject Error("DB connection failed")', expected:'HTTP 500; success=false',                              actual:'HTTP 500; success=false' },
    ],
  },
  {
    id: 'KL-03',
    title: 'KL-03 — Pengujian POST /api/calculator',
    subtitle: 'Endpoint: POST /api/calculator &nbsp;|&nbsp; Mock: prisma.seedParameters.findFirst &nbsp;|&nbsp; Fixture: panjang=10m, lebar=5m, guludan=80cm, parit=20cm, jarak=25cm',
    tests: [
      { no:1, id:'IT-05', butir:'I-4: valid G2 → 200, unit="kg", rangeKg tidak null',              input:'POST /api/calculator; G2; mock findFirst resolve DB_ROWS.G2',     expected:'HTTP 200; success=true; kebutuhanBibit.unit="kg"; rangeKg≠null; ringkasanLahan ada; kebutuhanTanam ada', actual:'HTTP 200; success=true; unit="kg"; rangeKg ada; ringkasanLahan ada' },
      { no:2, id:'IT-06', butir:'I-5: valid G0 → 200, unit="biji", rangeKg===null',                input:'POST /api/calculator; G0; mock findFirst resolve DB_ROWS.G0',     expected:'HTTP 200; success=true; kebutuhanBibit.unit="biji"; rangeKg=null',  actual:'HTTP 200; success=true; unit="biji"; rangeKg=null' },
      { no:3, id:'IT-07', butir:'I-6: valid G3 → 200, unit="kg"',                                  input:'POST /api/calculator; G3; mock findFirst resolve DB_ROWS.G3',     expected:'HTTP 200; success=true; kebutuhanBibit.unit="kg"',              actual:'HTTP 200; success=true; unit="kg"' },
      { no:4, id:'IT-08', butir:'I-7: panjangLahan tidak ada → 422, errors array ada',             input:'POST /api/calculator; G2; tanpa field panjangLahan',               expected:'HTTP 422; body.errors array terdefinisi',                       actual:'HTTP 422; errors array ada' },
      { no:5, id:'IT-09', butir:'I-8: generasiBibit "G4" tidak valid → 422',                       input:'POST /api/calculator; generasiBibit="G4"; field lain valid',      expected:'HTTP 422; body.errors terdefinisi',                             actual:'HTTP 422; errors ada' },
      { no:6, id:'IT-10', butir:'I-9: panjangLahan = -5 → 422',                                    input:'POST /api/calculator; G2; panjangLahan=-5',                        expected:'HTTP 422',                                                      actual:'HTTP 422' },
      { no:7, id:'IT-11', butir:'I-10: tanpa lebarGuludan → Joi default 80, 200 success',          input:'POST /api/calculator; G2; tanpa lebarGuludan',                     expected:'HTTP 200; success=true (default lebarGuludan=80 diterapkan)',   actual:'HTTP 200; success=true' },
      { no:8, id:'IT-12', butir:'I-11: DB throw error → 500 dengan success:false',                 input:'POST /api/calculator; G2 valid; mock findFirst reject Error("DB timeout")', expected:'HTTP 500; success=false',                              actual:'HTTP 500; success=false' },
    ],
  },
  {
    id: 'KL-04',
    title: 'KL-04 — Pengujian POST /api/calculator/reverse',
    subtitle: 'Endpoint: POST /api/calculator/reverse &nbsp;|&nbsp; Mock: prisma.seedParameters.findFirst &nbsp;|&nbsp; Fixture: jumlahBibit=100, jarak=25cm, guludan=80cm, parit=20cm',
    tests: [
      { no:1, id:'IT-13', butir:'I-12: valid G2 → 200, ringkasan.estimasiLuasM2 ada',             input:'POST /api/calculator/reverse; G2; jumlahBibit=100; mock findFirst resolve DB_ROWS.G2', expected:'HTTP 200; success=true; ringkasan.estimasiLuasM2 ada; estimasiPopulasi.totalTanaman ada', actual:'HTTP 200; success=true; estimasiLuasM2 ada; totalTanaman="1.500"' },
      { no:2, id:'IT-14', butir:'I-13: valid G0 → 200, estimasiPopulasi.totalTanaman ada',        input:'POST /api/calculator/reverse; G0; jumlahBibit=500; mock findFirst resolve DB_ROWS.G0', expected:'HTTP 200; success=true; estimasiPopulasi.totalTanaman ada; ringkasan.estimasiLuasM2 ada', actual:'HTTP 200; success=true; totalTanaman ada; estimasiLuasM2 ada' },
      { no:3, id:'IT-15', butir:'I-14: jumlahBibit = 0 → 422 (harus > 0)',                        input:'POST /api/calculator/reverse; G2; jumlahBibit=0',                  expected:'HTTP 422; body.errors terdefinisi',                             actual:'HTTP 422; errors ada' },
      { no:4, id:'IT-16', butir:'I-15: DB throw error → 500 dengan success:false',                input:'POST /api/calculator/reverse; G2 valid; mock findFirst reject Error("DB unavailable")', expected:'HTTP 500; success=false',                            actual:'HTTP 500; success=false' },
    ],
  },
];

// ─── HTML builder ─────────────────────────────────────────────────────────────
function buildTableRows(tests) {
  return tests.map(t => `
    <tr>
      <td class="center">${t.no}</td>
      <td class="center mono">${t.id}</td>
      <td>${t.butir}</td>
      <td>${t.input}</td>
      <td>${t.expected}</td>
      <td>${t.actual}</td>
      <td class="center status-lulus">✓ LULUS</td>
    </tr>`).join('');
}

function buildKelasSection(kelas, idx) {
  const breakClass = idx === 0 ? '' : 'page-break';
  return `
  <div class="${breakClass}">
    <div class="section-header">${kelas.title}</div>
    <p class="subtitle">${kelas.subtitle}</p>
    <table>
      <thead>
        <tr>
          <th style="width:3%">No</th>
          <th style="width:6%">ID Uji</th>
          <th style="width:24%">Butir Uji</th>
          <th style="width:20%">Kondisi Input</th>
          <th style="width:22%">Keluaran yang Diharapkan</th>
          <th style="width:19%">Keluaran Sistem</th>
          <th style="width:6%">Status</th>
        </tr>
      </thead>
      <tbody>
        ${buildTableRows(kelas.tests)}
      </tbody>
    </table>
  </div>`;
}

function buildHTML() {
  const totalTests = KELAS.reduce((s, k) => s + k.tests.length, 0);

  const scopeRows = KELAS.map(k => {
    const komponen = {
      'KL-01': 'index.js, calculator.routes.js',
      'KL-02': 'calculator.routes.js, calculator.repository.js',
      'KL-03': 'calculator.routes.js, calculator.validator.js, calculator.service.js',
      'KL-04': 'calculator.routes.js, calculator.validator.js, calculator.service.js',
    }[k.id] || '';
    return `
    <tr>
      <td class="center">${k.id}</td>
      <td>${k.title.replace(/KL-\d+ — /, '')}</td>
      <td>${komponen}</td>
      <td class="center">${k.tests.length}</td>
    </tr>`;
  }).join('');

  const summaryRows = KELAS.map(k => `
    <tr>
      <td>${k.id}</td>
      <td>${k.title.replace(/KL-\d+ — /, '')}</td>
      <td class="center">${k.tests.length}</td>
      <td class="center">${k.tests.length}</td>
      <td class="center">0</td>
    </tr>`).join('');

  const kelasSections = KELAS.map((k, i) => buildKelasSection(k, i)).join('\n');

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 10.5pt;
    color: #000;
    background: #fff;
  }

  /* ── Cover ── */
  .cover {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 40px 20px;
    page-break-after: always;
    min-height: 260mm;
  }
  .cover-logo {
    width: 80px; height: 80px;
    border: 4px solid #1a3a5c;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 28pt; font-weight: bold; color: #1a3a5c;
    margin-bottom: 20px;
  }
  .cover h1 {
    font-size: 16pt; font-weight: bold; text-align: center;
    color: #1a3a5c; text-transform: uppercase;
    letter-spacing: 1px; margin-bottom: 6px;
  }
  .cover h2 {
    font-size: 12pt; font-weight: normal; text-align: center;
    color: #333; margin-bottom: 4px;
  }
  .cover h3 {
    font-size: 11pt; font-weight: normal; text-align: center;
    color: #555; margin-bottom: 30px;
  }
  .divider {
    width: 100%; border: none; border-top: 2px solid #1a3a5c;
    margin: 16px 0;
  }
  .meta-table {
    width: 100%; border-collapse: collapse; margin-top: 20px;
  }
  .meta-table td {
    padding: 6px 10px;
    border: 1px solid #aaa;
    font-size: 10.5pt;
  }
  .meta-table td:first-child {
    background: #eef2f7; font-weight: bold; width: 35%;
  }
  .stat-box {
    display: flex; gap: 20px; margin-top: 20px; justify-content: center;
  }
  .stat-item {
    border: 2px solid #1a3a5c; border-radius: 8px;
    padding: 12px 24px; text-align: center; min-width: 100px;
  }
  .stat-item .num { font-size: 24pt; font-weight: bold; color: #1a3a5c; }
  .stat-item .lbl { font-size: 9pt; color: #555; margin-top: 2px; }
  .stat-item.pass .num { color: #276749; }
  .stat-item.fail .num { color: #c53030; }

  /* ── Sections ── */
  .section-title {
    font-size: 13pt; font-weight: bold; color: #1a3a5c;
    border-bottom: 2px solid #1a3a5c;
    padding-bottom: 4px; margin: 24px 0 12px;
    text-transform: uppercase;
  }
  .section-header {
    font-size: 11.5pt; font-weight: bold;
    background: #1a3a5c; color: #fff;
    padding: 7px 10px; margin-bottom: 6px;
  }
  .subtitle {
    font-size: 9.5pt; color: #555; margin-bottom: 8px;
    padding-left: 2px;
  }

  /* ── Tables ── */
  table {
    width: 100%; border-collapse: collapse;
    font-size: 9pt; margin-bottom: 16px;
  }
  thead tr { background: #2c5282; color: #fff; }
  th {
    padding: 6px 5px; text-align: center;
    border: 1px solid #1a3a5c; font-weight: bold;
    font-size: 9pt;
  }
  td {
    padding: 5px 5px; border: 1px solid #ccc;
    vertical-align: top; line-height: 1.35;
  }
  tr:nth-child(even) td { background: #f7f9fc; }
  .center { text-align: center; }
  .mono { font-family: Consolas, monospace; font-size: 8.5pt; }
  .status-lulus { color: #276749; font-weight: bold; font-size: 9pt; }
  .status-gagal { color: #c53030; font-weight: bold; }

  /* ── Summary tables ── */
  .summary-table td:first-child { background: #eef2f7; font-weight: bold; }
  .total-row td { background: #2c5282 !important; color: #fff; font-weight: bold; }

  /* ── Page break ── */
  .page-break { page-break-before: always; padding-top: 4px; }

  /* ── Print ── */
  @media print {
    @page { size: A4; margin: 15mm; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }

  p { margin-bottom: 8px; line-height: 1.6; }
</style>
</head>
<body>

<!-- ═══════════════════ COVER ═══════════════════ -->
<div class="cover">
  <div class="cover-logo">B</div>
  <h1>Dokumen Pengujian Integrasi</h1>
  <h1>Integration Testing</h1>
  <hr class="divider">
  <h2>Sistem Kalkulator Kebutuhan Bibit Kentang</h2>
  <h3>bibitku-api (kentangpas)</h3>
  <hr class="divider">

  <table class="meta-table">
    <tr><td>Nama Proyek</td><td>bibitku-api (kentangpas)</td></tr>
    <tr><td>Tanggal Pengujian</td><td>2 Juni 2026</td></tr>
    <tr><td>Metode Pengujian</td><td>Grey Box Testing</td></tr>
    <tr><td>Framework / Tools</td><td>Jest 30.4.2 + Supertest 7.2.2 (mock prisma client)</td></tr>
    <tr><td>Tester</td><td>Dani Adrian</td></tr>
    <tr><td>File Uji</td><td>tests/integration/calculator.routes.test.js</td></tr>
    <tr><td>Total Test Case</td><td>${totalTests} test</td></tr>
    <tr><td>Lulus (PASS)</td><td>${totalTests} test</td></tr>
    <tr><td>Gagal (FAIL)</td><td>0 test</td></tr>
  </table>

  <div class="stat-box">
    <div class="stat-item">
      <div class="num">${totalTests}</div>
      <div class="lbl">Total Test</div>
    </div>
    <div class="stat-item pass">
      <div class="num">${totalTests}</div>
      <div class="lbl">LULUS</div>
    </div>
    <div class="stat-item fail">
      <div class="num">0</div>
      <div class="lbl">GAGAL</div>
    </div>
    <div class="stat-item">
      <div class="num">100%</div>
      <div class="lbl">Keberhasilan</div>
    </div>
  </div>
</div>

<!-- ═══════════════════ BAGIAN 1: DESKRIPSI ═══════════════════ -->
<div class="section-title">1. Deskripsi Sistem</div>
<p>
  Sistem <strong>bibitku-api</strong> adalah REST API berbasis Node.js + Express yang menyediakan
  dua layanan kalkulasi utama untuk petani kentang:
</p>
<ul style="margin: 6px 0 10px 20px; line-height: 1.7;">
  <li><strong>Kalkulator Maju</strong>: Menghitung kebutuhan bibit dari data lahan (panjang, lebar, jarak tanam, lebar guludan, lebar parit).</li>
  <li><strong>Kalkulator Mundur (Reverse)</strong>: Mengestimasi luas lahan yang bisa ditanami berdasarkan jumlah bibit yang tersedia.</li>
</ul>
<p>
  Sistem mendukung tiga generasi bibit: <strong>G0</strong> (satuan biji), <strong>G2</strong> (satuan kg, 15 biji/kg),
  dan <strong>G3</strong> (satuan kg, 12–18 biji/kg). Pengujian integrasi menguji interaksi antar
  komponen (routing, middleware, controller, service, repository) secara end-to-end melalui HTTP
  dengan Prisma client digantikan mock — memastikan alur data berjalan benar tanpa memerlukan
  database nyata.
</p>

<!-- ═══════════════════ BAGIAN 2: RUANG LINGKUP ═══════════════════ -->
<div class="section-title">2. Ruang Lingkup Pengujian</div>
<p>Endpoint yang diuji:</p>
<table>
  <thead>
    <tr>
      <th style="width:20%">Endpoint</th>
      <th style="width:50%">Fungsi</th>
      <th style="width:15%">Metode HTTP</th>
    </tr>
  </thead>
  <tbody>
    <tr><td class="mono">GET /health</td><td>Health check status sistem</td><td class="center">GET</td></tr>
    <tr><td class="mono">GET /api/</td><td>Root endpoint — konfirmasi API aktif</td><td class="center">GET</td></tr>
    <tr><td class="mono">GET /api/parameters</td><td>Mengambil daftar parameter benih dari database</td><td class="center">GET</td></tr>
    <tr><td class="mono">POST /api/calculator</td><td>Menghitung kebutuhan bibit dari data lahan</td><td class="center">POST</td></tr>
    <tr><td class="mono">POST /api/calculator/reverse</td><td>Mengestimasi luas lahan dari jumlah bibit</td><td class="center">POST</td></tr>
  </tbody>
</table>

<p>Kelas pengujian:</p>
<table>
  <thead>
    <tr>
      <th style="width:8%">ID Kelas</th>
      <th style="width:28%">Kelas Uji</th>
      <th style="width:44%">Komponen yang Diuji</th>
      <th style="width:10%">Jumlah Test</th>
    </tr>
  </thead>
  <tbody>
    ${scopeRows}
    <tr class="total-row">
      <td colspan="3" class="center">TOTAL</td>
      <td class="center">${totalTests}</td>
    </tr>
  </tbody>
</table>

<!-- ═══════════════════ BAGIAN 3: HASIL PENGUJIAN ═══════════════════ -->
<div class="section-title">3. Tabel Hasil Pengujian</div>

${kelasSections}

<!-- ═══════════════════ BAGIAN 4: RINGKASAN ═══════════════════ -->
<div class="page-break">
<div class="section-title">4. Ringkasan Hasil Pengujian</div>
<table class="summary-table">
  <thead>
    <tr>
      <th style="width:8%">ID Kelas</th>
      <th style="width:35%">Kelas Uji</th>
      <th style="width:15%">Total Test</th>
      <th style="width:15%">Lulus</th>
      <th style="width:15%">Gagal</th>
    </tr>
  </thead>
  <tbody>
    ${summaryRows}
    <tr class="total-row">
      <td colspan="2" class="center">TOTAL</td>
      <td class="center">${totalTests}</td>
      <td class="center">${totalTests}</td>
      <td class="center">0</td>
    </tr>
  </tbody>
</table>
<p><strong>Persentase Keberhasilan: 100%</strong></p>

<!-- ═══════════════════ BAGIAN 5: COVERAGE ═══════════════════ -->
<div class="section-title">5. Coverage Pengujian Integrasi</div>
<table>
  <thead>
    <tr>
      <th style="width:35%">Komponen</th>
      <th>Statements</th>
      <th>Branches</th>
      <th>Functions</th>
      <th>Lines</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>calculator.routes.js</td><td class="center">100%</td><td class="center">100%</td><td class="center">100%</td><td class="center">100%</td></tr>
    <tr><td>calculator.validator.js</td><td class="center">100%</td><td class="center">100%</td><td class="center">100%</td><td class="center">100%</td></tr>
    <tr><td>calculator.service.js</td><td class="center">~95%</td><td class="center">~73%</td><td class="center">100%</td><td class="center">~96%</td></tr>
    <tr><td>calculator.helpers.js</td><td class="center">~86%</td><td class="center">~69%</td><td class="center">100%</td><td class="center">~94%</td></tr>
    <tr><td>calculator.repository.js</td><td class="center">100%</td><td class="center">50%</td><td class="center">100%</td><td class="center">100%</td></tr>
    <tr><td>calculator.controller.js</td><td class="center">~73%</td><td class="center">50%</td><td class="center">75%</td><td class="center">~73%</td></tr>
    <tr><td>calculateSeedNeeds.dto.js</td><td class="center">100%</td><td class="center">100%</td><td class="center">100%</td><td class="center">100%</td></tr>
    <tr><td>calculateReverseSeeds.dto.js</td><td class="center">100%</td><td class="center">100%</td><td class="center">100%</td><td class="center">100%</td></tr>
  </tbody>
</table>
<p style="font-size:8.5pt; color:#555;">
  * Controller coverage tidak 100% karena supertest melewati Express error handler sehingga beberapa
  baris log pada controller tidak tercapai. Branch 50% pada repository disebabkan satu kondisi yang
  hanya tercapai dengan koneksi database nyata.
</p>

<!-- ═══════════════════ BAGIAN 6: KESIMPULAN ═══════════════════ -->
<div class="section-title">6. Kesimpulan</div>
<p>Seluruh <strong>${totalTests} skenario pengujian integrasi</strong> dinyatakan <strong>LULUS</strong>. Hasil pengujian membuktikan:</p>
<ol style="margin: 8px 0 0 22px; line-height: 1.9;">
  <li>Endpoint infrastruktur (<code>GET /health</code> dan <code>GET /api/</code>) merespons dengan HTTP 200 dan payload yang sesuai spesifikasi.</li>
  <li>Endpoint <code>GET /api/parameters</code> meneruskan data dari repository ke response dengan benar, dan menangani error database dengan HTTP 500.</li>
  <li>Endpoint <code>POST /api/calculator</code> menghitung kebutuhan bibit untuk G0, G2, G3 dengan unit yang tepat (biji/kg) dan rangeKg yang konsisten.</li>
  <li>Middleware validator berfungsi pada level HTTP — menolak input tidak valid (generasi G4, nilai negatif, field wajib kosong) dengan HTTP 422 sebelum menyentuh service.</li>
  <li>Default <code>lebarGuludan=80</code> diterapkan secara otomatis oleh middleware Joi ketika field tidak disertakan.</li>
  <li>Endpoint <code>POST /api/calculator/reverse</code> menghasilkan estimasi luas lahan untuk G0 dan G2, menolak <code>jumlahBibit=0</code> dengan HTTP 422.</li>
  <li>Seluruh endpoint menangani kegagalan database (mock reject) dengan HTTP 500 dan <code>success=false</code> tanpa crash.</li>
</ol>
</div>

</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const outputDir = path.join(__dirname, '..', 'docs');
  const outputPath = path.join(outputDir, 'INTEGRATION_TESTING.pdf');

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const edgePath = findEdge();
  console.log(`Edge ditemukan: ${edgePath}`);

  const html = buildHTML();

  console.log('Meluncurkan browser...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    console.log('Menghasilkan PDF...');
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
    });

    console.log(`\n✓ PDF berhasil dibuat: ${outputPath}`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
