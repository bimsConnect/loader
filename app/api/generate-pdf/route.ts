import { type NextRequest, NextResponse } from "next/server"
import puppeteer from "puppeteer"
import { getUserFromSession } from "@/lib/auth"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import fs from "fs"
import path from "path"

export async function POST(req: NextRequest) {
  try {
    // Verifikasi autentikasi
    const user = await getUserFromSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ambil data dari request body
    const data = await req.json()
    const { formData, documentNumber } = data

    // Format tanggal
    const formattedDate = format(new Date(formData.date), "dd MMMM yyyy", { locale: id })
    const generatedDate = format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })

    // Coba baca logo sebagai base64
    let logoBase64 = ""
    try {
      // Cari file logo di direktori public
      const publicDir = path.join(process.cwd(), "public")
      const logoPath = path.join(publicDir, "logo.png") // Coba langsung dari root public folder

      if (fs.existsSync(logoPath)) {
        const logoFile = fs.readFileSync(logoPath)
        logoBase64 = `data:image/png;base64,${logoFile.toString("base64")}`
      } else {
        // Coba path alternatif
        const altLogoPath = path.join(publicDir, "images", "company", "logo.png")
        if (fs.existsSync(altLogoPath)) {
          const logoFile = fs.readFileSync(altLogoPath)
          logoBase64 = `data:image/png;base64,${logoFile.toString("base64")}`
        }
      }
    } catch (error) {
      console.error("Error reading logo file:", error)
      // Jika gagal membaca logo, logoBase64 tetap string kosong
    }

    // Buat HTML untuk PDF
    const html = generateHtml(formData, documentNumber, formattedDate, generatedDate, logoBase64, user.name)

    // Luncurkan browser Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    const page = await browser.newPage()

    // Set content HTML
    await page.setContent(html, { waitUntil: "networkidle0" })

    // Atur ukuran halaman ke A4
    await page.setViewport({ width: 1240, height: 1754 })
    await page.addStyleTag({
      content: `
        @page {
          size: A4;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
        }
      `,
    })

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    })

    // Tutup browser
    await browser.close()

    // Kirim PDF sebagai respons
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Loader_Request_${documentNumber || "Document"}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}

function generateHtml(
  formData: any,
  documentNumber: string,
  formattedDate: string,
  generatedDate: string,
  logoBase64: string,
  userName: string,
) {
  // Fungsi helper untuk menampilkan foto
  const renderPhoto = (label: string, image: string | null | undefined) => {
    return `
      <div class="photo-item">
        <div class="photo-label">${label}</div>
        <div class="photo-image">
          ${
            image
              ? `<img src="${image}" alt="${label}" />`
              : `<div class="empty-photo"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cccccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>`
          }
        </div>
      </div>
    `
  }

  // Logo fallback jika base64 kosong
  const logoFallback = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  `

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Loader Request ${documentNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: #333;
          background-color: white;
        }
        
        .page {
          width: 210mm;
          height: 297mm;
          padding: 0;
          position: relative;
          page-break-after: always;
        }
        
        .page:last-child {
          page-break-after: auto;
        }
        
        .header {
          background: #2563eb;
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
        }
        
        .logo {
          background-color: white;
          padding: 8px;
          border-radius: 8px;
          margin-right: 16px;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .logo img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .company-name {
          font-size: 24px;
          font-weight: bold;
        }
        
        .company-subtitle {
          font-size: 12px;
          opacity: 0.8;
        }
        
        .document-number {
          background-color: rgba(0, 0, 0, 0.2);
          padding: 8px 16px;
          border-radius: 8px;
          text-align: right;
        }
        
        .document-number-label {
          font-size: 10px;
          opacity: 0.8;
        }
        
        .document-number-value {
          font-size: 18px;
          font-weight: bold;
        }
        
        .title-section {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          padding: 16px;
          text-align: center;
        }
        
        .title {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
        }
        
        .subtitle {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }
        
        .content {
          padding: 24px;
        }
        
        .info-card {
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        
        .info-item {
          display: flex;
          margin-bottom: 12px;
        }
        
        .info-label {
          width: 33%;
          color: #6b7280;
          font-weight: 500;
        }
        
        .info-value {
          width: 67%;
          font-weight: 600;
        }
        
        .section-title {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          margin-top: 32px;
          background-color: #f0f9ff;
          padding: 8px 12px;
          border-radius: 6px;
          border-left: 4px solid #2563eb;
        }
        
        .section-icon {
          width: 24px;
          height: 24px;
          background-color: #e0f2fe;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
        }
        
        .section-heading {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .photos-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .photo-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .photo-label {
          background-color: #f9fafb;
          padding: 8px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 10px;
          font-weight: 500;
          color: #4b5563;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-height: 30px;
          display: flex;
          align-items: center;
        }
        
        .photo-image {
          width: 100%;
          height: 150px; /* Ukuran card gambar diperbesar */
          background-color: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .photo-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .empty-photo {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f9fafb;
          color: #d1d5db;
        }
        
        .signature-section {
          margin-top: 48px;
          display: flex;
          justify-content: flex-end;
        }
        
        .signature-box {
          width: 33%;
          text-align: center;
        }
        
        .signature-line {
          height: 100px;
          border-bottom: 2px dashed #9ca3af;
          margin-bottom: 16px;
        }
        
        .signature-name {
          font-size: 14px;
          font-weight: 600;
        }
        
        .signature-title {
          font-size: 12px;
          color: #6b7280;
        }
        
        .footer {
          background-color: #f9fafb;
          border-top: 1px solid #e5e7eb;
          padding: 16px;
          text-align: center;
          font-size: 10px;
          color: #6b7280;
          position: absolute;
          bottom: 0;
          width: 100%;
        }
        
        /* Perbaikan tampilan Transaction & Product Documentation */
        .transaction-section {
          margin-bottom: 24px;
        }
        
        .transaction-photos {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }
        
        .product-section {
          margin-bottom: 24px;
        }
        
        .product-photos {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        
        /* Explicit page break */
        .page-break {
          page-break-before: always;
          height: 0;
        }
      </style>
    </head>
    <body>
      <!-- Halaman 1: Vehicle Documentation -->
      <div class="page">
        <!-- Header -->
        <div class="header">
          <div class="logo-container">
            <div class="logo">
              ${logoBase64 ? `<img src="${logoBase64}" alt="Company Logo" />` : logoFallback}
            </div>
            <div>
              <div class="company-name">PT. DUNIA KIMIA JAYA</div>
              <div class="company-subtitle">Warehouse Management System</div>
            </div>
          </div>
          <div class="document-number">
            <div class="document-number-label">Document No.</div>
            <div class="document-number-value">${documentNumber}</div>
          </div>
        </div>
        
        <!-- Title -->
        <div class="title-section">
          <div class="title">Report Documentation Warehouse ${formData.transactionType} Activity</div>
          <div class="subtitle">Generated on ${generatedDate}</div>
        </div>
        
        <!-- Content -->
        <div class="content">
          <!-- Main Info -->
          <div class="info-card">
            <div class="info-grid">
              <div>
                <div class="info-item">
                  <div class="info-label">Customer Name</div>
                  <div class="info-value">: ${formData.customerName}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Receipt Date</div>
                  <div class="info-value">: ${formattedDate}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">No Document</div>
                  <div class="info-value">: ${documentNumber}</div>
                </div>
              </div>
              <div>
                <div class="info-item">
                  <div class="info-label">Transaction</div>
                  <div class="info-value">: ${formData.transactionType}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Vehicle No</div>
                  <div class="info-value">: ${formData.vehicleNumber}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Container No</div>
                  <div class="info-value">: ${formData.containerNumber || "-"}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Vehicle Documentation -->
          <div class="section-title">
            <div class="section-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
            <div class="section-heading">Vehicle Documentation</div>
          </div>
          
          <!-- Photos Section 1 -->
          <div class="photos-grid">
            ${renderPhoto("Foto Tampak Depan", formData.requiredPhotos.frontView?.preview)}
            ${renderPhoto("Foto Depan Sisi Kiri", formData.requiredPhotos.frontLeftSide?.preview)}
            ${renderPhoto("Foto Depan Sisi Kanan", formData.requiredPhotos.frontRightSide?.preview)}
            ${renderPhoto("Foto Segel", formData.requiredPhotos.seal?.preview)}
          </div>
          
          <!-- Photos Section 2 -->
          <div class="photos-grid">
            ${renderPhoto("Foto Tampak Belakang Sebelum Dibuka", formData.requiredPhotos.backBeforeOpen?.preview)}
            ${renderPhoto("Foto Samping Kanan", formData.requiredPhotos.rightSide?.preview)}
            ${renderPhoto("Foto Samping Kiri", formData.requiredPhotos.leftSide?.preview)}
            ${renderPhoto(
              `Foto Sebelum ${formData.transactionType === "Inbound" ? "Bongkar" : "Muat"}`,
              formData.transactionType === "Inbound"
                ? formData.photos.beforeUnloading?.preview
                : formData.photos.beforeLoading?.preview,
            )}
          </div>
        </div>
      </div>
      
      <!-- Halaman 2: Transaction & Product Documentation -->
      <div class="page">
        <!-- Content -->
        <div class="content" style="padding-top: 40px;">
          <!-- Transaction & Product Documentation -->
          <div class="section-title">
            <div class="section-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div class="section-heading">Transaction & Product Documentation</div>
          </div>
          
          <!-- Transaction Photos -->
          <div class="photos-grid">
            ${renderPhoto(
              `Foto Setelah ${formData.transactionType === "Inbound" ? "Bongkar" : "Muat"}`,
              formData.transactionType === "Inbound"
                ? formData.photos.afterUnloading?.preview
                : formData.photos.afterLoading?.preview,
            )}
            ${renderPhoto("Product 1", formData.photos.products[0]?.preview)}
            ${renderPhoto("Product 2", formData.photos.products[1]?.preview)}
            ${renderPhoto("Product 3", formData.photos.products[2]?.preview)}
          </div>
          
          <!-- Product Photos -->
          <div class="photos-grid">
            ${renderPhoto("Product 4", formData.photos.products[3]?.preview)}
            ${renderPhoto("Product 5", formData.photos.products[4]?.preview)}
            ${renderPhoto("Product 6", formData.photos.products[5]?.preview)}
            ${renderPhoto("Product 7", formData.photos.products[6]?.preview)}
          </div>
          
          <!-- Signature -->
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-name">${userName || formData.checkerName}</div>
              <div class="signature-title">Checker</div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>PT. DUNIA KIMIA JAYA - Warehouse Management System</p>
          <p>Document generated on ${generatedDate}</p>
        </div>
      </div>
    </body>
    </html>
  `
}
