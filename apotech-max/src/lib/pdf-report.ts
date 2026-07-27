/**
 * PDF / Print Report Generator for ANSI/ASQ Z1.4 QA Sampling Records.
 * Renders a formal corporate A4 QA Inspection Document with company logo,
 * lot data, ATB sampling points, defect counts, Ac/Re thresholds, verdict, and signature blocks.
 */

import type { HistoryEntry } from '@/components/ansi/HistoryTab'

export function printPdfReport(entry: HistoryEntry) {
  const p1 = Math.floor(entry.sampleSize / 3)
  const p2 = Math.floor(entry.sampleSize / 3)
  const p3 = entry.sampleSize - p1 - p2

  const docNo = `QA-REC/Z14/${(entry.id || 'NEW').substring(0, 8).toUpperCase()}`
  const createdDate = entry.createdAt
    ? new Date(entry.createdAt).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })

  const isAccept = entry.decision === 'accept'
  const isReject = entry.decision === 'reject'
  const isPending = !entry.decision || (entry.decision !== 'accept' && entry.decision !== 'reject')

  const defectCounts = entry.defectCounts || { critical: 0, major: 0, minor: 0 }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Laporan Sampling QA ANSI/ASQ Z1.4 - ${entry.batchNumber || 'Record'}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 15mm 15mm 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11px;
          line-height: 1.4;
          color: #1f2937;
          background: #ffffff;
          margin: 0;
          padding: 0;
        }

        /* ── Header Kop Surat ── */
        .kop-table {
          width: 100%;
          border-collapse: collapse;
          border-bottom: 3px double #1e3a8a;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .kop-logo {
          width: 140px;
          vertical-align: middle;
        }
        .kop-logo img {
          max-width: 130px;
          height: auto;
          display: block;
        }
        .kop-title {
          text-align: center;
          vertical-align: middle;
          padding: 0 10px;
        }
        .kop-title h1 {
          font-size: 15px;
          font-weight: 800;
          color: #1e3a8a;
          margin: 0 0 2px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .kop-title h2 {
          font-size: 11px;
          font-weight: 700;
          color: #374151;
          margin: 0 0 2px 0;
          text-transform: uppercase;
        }
        .kop-title p {
          font-size: 9px;
          color: #6b7280;
          margin: 0;
        }
        .kop-docinfo {
          width: 170px;
          vertical-align: middle;
          font-size: 9.5px;
          border: 1px solid #d1d5db;
          padding: 6px;
          background: #f9fafb;
          border-radius: 4px;
        }
        .kop-docinfo table {
          width: 100%;
          border-collapse: collapse;
        }
        .kop-docinfo td {
          padding: 1.5px 0;
        }

        /* ── Section Header ── */
        .sec-header {
          font-size: 11px;
          font-weight: 700;
          color: #1e3a8a;
          background: #eff6ff;
          border-left: 4px solid #1d4ed8;
          padding: 4px 8px;
          margin: 12px 0 6px 0;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        /* ── Data Grid Table ── */
        .grid-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
        }
        .grid-table th, .grid-table td {
          border: 1px solid #cbd5e1;
          padding: 5px 8px;
          font-size: 10.5px;
        }
        .grid-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #334155;
          text-align: left;
          width: 20%;
        }
        .grid-table td {
          color: #0f172a;
        }

        /* ── ATB Box ── */
        .atb-container {
          display: flex;
          gap: 10px;
          margin-bottom: 8px;
        }
        .atb-card {
          flex: 1;
          border: 1px solid #93c5fd;
          background: #f0f9ff;
          border-radius: 4px;
          padding: 6px;
          text-align: center;
        }
        .atb-card .title {
          font-size: 9px;
          font-weight: 700;
          color: #0369a1;
          text-transform: uppercase;
        }
        .atb-card .num {
          font-size: 16px;
          font-weight: 800;
          color: #0284c7;
          margin: 2px 0;
        }

        /* ── Table Defect ── */
        .defect-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
        }
        .defect-table th, .defect-table td {
          border: 1px solid #cbd5e1;
          padding: 6px 8px;
          text-align: center;
          font-size: 10.5px;
        }
        .defect-table th {
          background: #1e293b;
          color: #ffffff;
          font-weight: 600;
          font-size: 10px;
          text-transform: uppercase;
        }
        .defect-table tr:nth-child(even) {
          background: #f8fafc;
        }
        .status-pass {
          color: #166534;
          font-weight: 700;
          background: #dcfce7;
          padding: 2px 6px;
          border-radius: 3px;
        }
        .status-fail {
          color: #991b1b;
          font-weight: 700;
          background: #fee2e2;
          padding: 2px 6px;
          border-radius: 3px;
        }

        /* ── Verdict Card ── */
        .verdict-box {
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px 14px;
          margin-bottom: 14px;
        }
        .verdict-accept {
          border-color: #16a34a;
          background: #f0fdf4;
        }
        .verdict-reject {
          border-color: #dc2626;
          background: #fef2f2;
        }
        .verdict-pending {
          border-color: #64748b;
          background: #f8fafc;
        }
        .verdict-title {
          font-size: 14px;
          font-weight: 800;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .verdict-accept .verdict-title { color: #15803d; }
        .verdict-reject .verdict-title { color: #b91c1c; }
        .verdict-pending .verdict-title { color: #334155; }
        .verdict-reason {
          font-size: 10.5px;
          color: #374151;
        }

        /* ── Signatures Section ── */
        .sig-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .sig-table td {
          width: 33.33%;
          text-align: center;
          vertical-align: top;
          padding: 0 10px;
        }
        .sig-box {
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          padding: 8px;
          height: 110px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #ffffff;
        }
        .sig-role {
          font-size: 9.5px;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
        }
        .sig-space {
          height: 45px;
        }
        .sig-name {
          font-size: 10px;
          font-weight: 700;
          color: #0f172a;
          border-top: 1px dashed #cbd5e1;
          padding-top: 3px;
        }

        /* ── Footer ── */
        .footer-note {
          margin-top: 15px;
          font-size: 8.5px;
          color: #94a3b8;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 6px;
        }

        @media print {
          body { width: 100%; }
        }
      </style>
    </head>
    <body>

      <!-- KOP SURAT PERUSAHAAN -->
      <table class="kop-table">
        <tr>
          <td class="kop-logo">
            <img src="/brand/logo-dankos.webp" alt="Logo Dankos Farma" onerror="this.style.display='none'">
          </td>
          <td class="kop-title">
            <h1>PT DANKOS FARMA</h1>
            <h2>QUALITY ASSURANCE & QUALITY CONTROL DIVISION</h2>
            <p>Jl. Rawa Gatel III No. 5, Kawasan Industri Pulogadung, Jakarta Timur</p>
          </td>
          <td class="kop-docinfo">
            <table>
              <tr>
                <td><strong>No. Dok:</strong></td>
                <td>${docNo}</td>
              </tr>
              <tr>
                <td><strong>Tgl Audit:</strong></td>
                <td>${createdDate}</td>
              </tr>
              <tr>
                <td><strong>Standar:</strong></td>
                <td>ANSI/ASQ Z1.4</td>
              </tr>
              <tr>
                <td><strong>Revisi:</strong></td>
                <td>01 (Terendah)</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- TITLE -->
      <div style="text-align: center; margin-bottom: 10px;">
        <h3 style="margin: 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; text-decoration: underline;">
          LEMBAR RECORD SAMPLING PLAN & EVALUASI MUTU INSTEK
        </h3>
      </div>

      <!-- SECTION 1: DATA IDENTITAS BATCH -->
      <div class="sec-header">I. Data Identitas Sediaan & Batch Produk</div>
      <table class="grid-table">
        <tr>
          <th>Nama Produk</th>
          <td colspan="3"><strong>${entry.productName || 'Ranitidine Injeksi 25mg/2ml'}</strong></td>
        </tr>
        <tr>
          <th>Nomor Batch</th>
          <td><strong>${entry.batchNumber || '-'}</strong></td>
          <th>Ukuran Lot (N)</th>
          <td><strong>${entry.lotSize.toLocaleString('id-ID')} unit</strong></td>
        </tr>
        <tr>
          <th>Level Inspeksi</th>
          <td>${entry.inspectionTypeLabel || entry.inspectionLevel} (${entry.inspectionCodeLabel || entry.inspectionCode})</td>
          <th>Kode Huruf Sampel</th>
          <td><strong style="color: #1d4ed8; font-size: 12px;">${entry.letterCode}</strong></td>
        </tr>
        <tr>
          <th>Total Sampel (n)</th>
          <td><strong style="color: #1d4ed8; font-size: 12px;">${entry.sampleSize} unit</strong></td>
          <th>Metode Sampling</th>
          <td>Random Sampling (Acak Proorsional)</td>
        </tr>
      </table>

      <!-- SECTION 2: TITIK SAMPLING ATB -->
      <div class="sec-header">II. Pembagian Titik Sampling ATB (Awal - Tengah - Akhir)</div>
      <div class="atb-container">
        <div class="atb-card">
          <div class="title">Titik 1 — Awal Sampling (A)</div>
          <div class="num">${p1} unit</div>
          <div style="font-size: 8.5px; color: #64748b;">Pengambilan 0% - 33% produksi</div>
        </div>
        <div class="atb-card">
          <div class="title">Titik 2 — Tengah Sampling (T)</div>
          <div class="num">${p2} unit</div>
          <div style="font-size: 8.5px; color: #64748b;">Pengambilan 34% - 66% produksi</div>
        </div>
        <div class="atb-card">
          <div class="title">Titik 3 — Akhir Sampling (B)</div>
          <div class="num">${p3} unit</div>
          <div style="font-size: 8.5px; color: #64748b;">Pengambilan 67% - 100% produksi</div>
        </div>
      </div>

      <!-- SECTION 3: REKAPITULASI EVALUASI CACAT -->
      <div class="sec-header">III. Rekapitulasi Temuan Cacat & Kriteria Penerimaan</div>
      <table class="defect-table">
        <thead>
          <tr>
            <th style="text-align: left; padding-left: 10px;">Kategori Cacat</th>
            <th>AQL</th>
            <th>Batas Ac (Accept)</th>
            <th>Batas Re (Reject)</th>
            <th>Jumlah Temuan (d)</th>
            <th>Status Parameter</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: left; padding-left: 10px; font-weight: 600; color: #991b1b;">
              🔴 Cacat Kritis (Critical)
            </td>
            <td>0%</td>
            <td>${entry.critical?.ac ?? 0}</td>
            <td>${entry.critical?.re ?? 1}</td>
            <td><strong>${defectCounts.critical}</strong></td>
            <td>
              ${defectCounts.critical >= (entry.critical?.re ?? 1)
                ? '<span class="status-fail">FAIL (REJECT)</span>'
                : '<span class="status-pass">PASS</span>'}
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding-left: 10px; font-weight: 600; color: #d97706;">
              🟠 Cacat Mayor (Major)
            </td>
            <td>2.5%</td>
            <td>${entry.major?.ac ?? 0}</td>
            <td>${entry.major?.re ?? 1}</td>
            <td><strong>${defectCounts.major}</strong></td>
            <td>
              ${defectCounts.major >= (entry.major?.re ?? 1)
                ? '<span class="status-fail">FAIL (REJECT)</span>'
                : '<span class="status-pass">PASS</span>'}
            </td>
          </tr>
          <tr>
            <td style="text-align: left; padding-left: 10px; font-weight: 600; color: #2563eb;">
              🟢 Cacat Minor (Minor)
            </td>
            <td>4.0%</td>
            <td>${entry.minor?.ac ?? 0}</td>
            <td>${entry.minor?.re ?? 1}</td>
            <td><strong>${defectCounts.minor}</strong></td>
            <td>
              ${defectCounts.minor >= (entry.minor?.re ?? 1)
                ? '<span class="status-fail">FAIL (REJECT)</span>'
                : '<span class="status-pass">PASS</span>'}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- SECTION 4: VONIS HASIL EVALUASI -->
      <div class="sec-header">IV. Vonis Keputusan Quality Assurance</div>
      <div class="verdict-box ${isAccept ? 'verdict-accept' : isReject ? 'verdict-reject' : 'verdict-pending'}">
        <div class="verdict-title">
          ${isAccept
            ? '🟢 STATUS: ACCEPTED (DITERIMA / LULUS UJI MUTU)'
            : isReject
            ? '🔴 STATUS: REJECTED (DITOLAK / TIDAK MEMENUHI SYARAT)'
            : '⚪ STATUS: BELUM DIEVALUASI (MENUNGGU PEMERIKSAAN FISIK)'}
        </div>
        <div class="verdict-reason">
          <strong>Catatan Evaluator:</strong> ${entry.decisionReason || (isAccept ? 'Seluruh temuan cacat berada di dalam batas toleransi Ac/Re standar ANSI/ASQ Z1.4.' : isReject ? 'Temuan cacat melebihi batas Re yang diizinkan.' : 'Silakan lakukan verifikasi fisik dan simpan hasil evaluasi.')}
        </div>
      </div>

      <!-- SECTION 5: LEMBAR PENGESAHAN TANDA TANGAN -->
      <div class="sec-header">V. Lembar Pengesahan & Otentikasi</div>
      <table class="sig-table">
        <tr>
          <td>
            <div class="sig-box">
              <div class="sig-role">Diinspeksi Oleh (QA Inspector)</div>
              <div class="sig-space"></div>
              <div class="sig-name">( ........................................... )<br><span style="font-size: 8px; font-weight: normal; color: #64748b;">Tgl: ____/____/2026</span></div>
            </div>
          </td>
          <td>
            <div class="sig-box">
              <div class="sig-role">Diverifikasi Oleh (QA Officer)</div>
              <div class="sig-space"></div>
              <div class="sig-name">( ........................................... )<br><span style="font-size: 8px; font-weight: normal; color: #64748b;">Tgl: ____/____/2026</span></div>
            </div>
          </td>
          <td>
            <div class="sig-box">
              <div class="sig-role">Disetujui Oleh (QA Manager)</div>
              <div class="sig-space"></div>
              <div class="sig-name">( ........................................... )<br><span style="font-size: 8px; font-weight: normal; color: #64748b;">Cap Stempel QA & Tgl</span></div>
            </div>
          </td>
        </tr>
      </table>

      <!-- FOOTER -->
      <div class="footer-note">
        Dokumen ini dihasilkan secara otomatis oleh Sistem APCAL (ANSI/ASQ Z1.4 Pharma Calculator) PT Dankos Farma.<br>
        Salinan resmi tersimpan di Database Quality Management System. Dilarang menggandakan tanpa izin QA Manager.
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank', 'width=900,height=1000')
  if (printWindow) {
    printWindow.document.open()
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }
}
