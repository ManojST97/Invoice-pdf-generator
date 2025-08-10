import { useState } from "react";
import { ExcelUploader } from "./components/ExcelUploader";
import { InvoiceTemplate } from "./components/InvoiceTemplate";
// eslint-disable-next-line
import html2pdf from "html2pdf.js";
import ReactDOMServer from "react-dom/server";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { CopyableField } from "./common/CopyableField";
import { COMPANY_INFO } from "./common/companyInfos";

const getCompanyPrefix = (key) => {
  switch (key) {
    case "JETPACK PAMNETWORK": return "JP";
    case "TECH DYNAMO": return "TD";
    case "AUXFORD NETWORK": return "AF";
    case "LITMAKTOS SOLUTION": return "LM";
    case "SPARKLEAF": return "SL";
    default: return "XX";
  }
};

function App() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cancelRequested, setCancelRequested] = useState(false);
  const [showFormat, setShowFormat] = useState(false);
  const [invoiceStartNumbers, setInvoiceStartNumbers] = useState({
    "JETPACK PAMNETWORK": 1,
    "TECH DYNAMO": 1,
    "AUXFORD NETWORK": 1,
    "LITMAKTOS SOLUTION": 1,
    "SPARKLEAF": 1,
  });
  const BATCH_SIZE = 500;


  const getCompanyInfo = (payerName = "") => {
    const prefix = payerName.split(" ").slice(0, 2).join(" ").toUpperCase();
    return (
      COMPANY_INFO[prefix] || {
        name: "UNKNOWN COMPANY",
        address: "Unknown Address",
        gst: "N/A",
        color: "blue",
        logo: "tdLogo.png"
      }
    );
  };

  const handleExcelData = (rows) => {
    const companyCounters = { ...invoiceStartNumbers };

    const mapped = rows.map((row) => {
      const company = getCompanyInfo(row["Payee Name"] || "");
      const companyKey = Object.keys(COMPANY_INFO).find((key) =>
        company.name.includes(COMPANY_INFO[key].name)
      );
      const prefix = getCompanyPrefix(companyKey);
      const count = companyCounters[companyKey] || 1;
      const invoiceNo = `${prefix}${count}`;

      companyCounters[companyKey] = count + 1;

      return {
        vpa: row["Payer VPA"],
        transactionDate: row["txn_org_time"],
        rrn: row["RRN"] || `AUTO_RRN_${count}`,
        invoiceNo,
        amount: `₹${row["Txn Amt"]}`,
        payerName: row["Payee Name"] || "Unknown Payer",
        company,
      };
    });

    setInvoices(mapped);
  };

  const downloadAllInvoices = async () => {
  setLoading(true);
  setCancelRequested(false);
  setProgress(0);

  const total = invoices.length;
  const batches = Math.ceil(total / BATCH_SIZE);

  for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
    if (cancelRequested) break;

    const zip = new JSZip();
    const start = batchIndex * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, total);
    const currentBatch = invoices.slice(start, end);

    for (let i = 0; i < currentBatch.length; i++) {
      if (cancelRequested) break;

      const invoice = currentBatch[i];
      const folderName = (invoice.payerName || "Unknown")
        .split(" ")
        .slice(0, 2)
        .join(" ")
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .toUpperCase();
      const fileName = `${invoice.invoiceNo || `invoice_${start + i + 1}`}.pdf`;
      console.log(invoice,'checkinginsin')

      const html = ReactDOMServer.renderToStaticMarkup(
        <InvoiceTemplate data={invoice} />
      );

      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;
      document.body.appendChild(wrapper);

      const pdfBlob = await html2pdf()
        .set({
          margin: 0,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        })
        .from(wrapper)
        .outputPdf("blob");

      document.body.removeChild(wrapper);
      zip.folder(folderName).file(fileName, pdfBlob);

      const progressValue = Math.round(((start + i + 1) / total) * 100);
      setProgress(progressValue);
    }

    // ✅ Save the batch
    if (!cancelRequested) {
      const batchBlob = await zip.generateAsync({ type: "blob" });
      saveAs(batchBlob, `Invoices-Batch-${batchIndex + 1}.zip`);
    }

    await new Promise((res) => setTimeout(res, 100)); // Optional pause
  }

  setLoading(false);
  setProgress(0);
  setCancelRequested(false);
};



  // const cancelDownloading = () => {
  //   if (window.confirm("Are you sure you want to cancel and reload?")) {
  //     window.location.reload();
  //   }
  // };

  return (
    <div className="App" style={{ padding: 40 }}>
      <h1 className="text-xl font-bold mb-4">Invoice Generator</h1>

      <button onClick={() => setShowFormat(!showFormat)} style={{
        background: "red",
        color: "white",
        padding: "5px",
        borderRadius: "5px",
        border: "1px solid black",
        marginTop: "10px" }}>
        {showFormat ? "Hide Format" : "Show Needed Format"}
      </button>

      {showFormat && !loading && (
  <div
    style={{
      backgroundColor: "#f8f9fa",
      padding: "16px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      marginBottom: "20px",
      fontFamily: "monospace",
      fontSize: "14px",
    }}
  >
    <strong style={{ textDecoration: "underline" }}>xlsx/xls FORMAT ONLY</strong> <br />
    <br />
    <strong>Required Excel Headers:</strong>
    <ul style={{ marginTop: "10px", paddingLeft: "0", listStyle: "none" }}>
      <CopyableField label="VPA" value="Payer VPA" />
      <CopyableField label="Transaction Date" value="txn_org_time" />
      <CopyableField label="RRN / UTR" value="RRN" />
      <CopyableField label="Amount" value="Txn Amt" />
      <CopyableField label="Payer Name" value="Payee Name" />
    </ul>

    <a
      href="/dummy-format.xlsx"
      download
      style={{
        display: "inline-block",
        marginTop: "12px",
        backgroundColor: "#007bff",
        color: "#fff",
        padding: "6px 12px",
        borderRadius: "4px",
        textDecoration: "none",
      }}
    >
      Download Sample Format
    </a>
  </div>
)}


      <div style={{ margin: "20px 0", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}>
        <strong>Set Starting Invoice Numbers:</strong>
        {Object.keys(COMPANY_INFO).map((key) => (
          <div key={key} style={{ marginTop: "10px" }}>
            <label>
              {COMPANY_INFO[key].name} ({getCompanyPrefix(key)}):
              <input
                type="number"
                min={0}
                value={invoiceStartNumbers[key]}
                onChange={(e) =>
                  setInvoiceStartNumbers((prev) => ({
                    ...prev,
                    [key]: parseInt(e.target.value) || "",
                  }))
                }
                style={{ marginLeft: "10px", padding: "5px", width: "100px" }}
              />
            </label>
          </div>
        ))}
      </div>

      <ExcelUploader onDataParsed={handleExcelData} />

      {invoices.length > 0 && (
        <>
          {!loading && (
            <>
              <h2 className="mt-4 mb-2">Live Invoice Preview</h2>
              <InvoiceTemplate data={invoices[0]} />
            </>
          )}

          {loading && (
            <div style={{ marginTop: 20 }}>
              <div style={{ width: "100%", backgroundColor: "#ddd", height: "10px", borderRadius: "5px", marginTop: "5px" }}>
                <div style={{ width: `${progress}%`, height: "100%", backgroundColor: "#28a745", borderRadius: "5px", transition: "width 0.3s" }}></div>
              </div>
              <div style={{ fontWeight: "bold" }}>Generating ZIP... {progress}%</div>
            </div>
          )}

          <button
            onClick={downloadAllInvoices}
            disabled={loading}
            style={{
              marginTop: "20px",
              background: loading ? "#aaa" : "#28a745",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Generating..." : "Download All Invoices as ZIP"}
          </button>
        </>
      )}
    </div>
  );
}

export default App;