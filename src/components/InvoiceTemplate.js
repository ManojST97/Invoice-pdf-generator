
export const InvoiceTemplate = ({ data }) => {

  return (
    <div
      id="invoice"
      style={{
        width: "595px",
        margin: "40px auto",
        padding: "30px",
        border: "1px solid #ccc",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#fff",
        color: "#000",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: data?.company?.color,
          color: "black",
          textAlign: "center",
          padding: "20px",
          marginBottom: "20px",
        }}
      >

        <img
          src={data?.company?.logo}
          alt="Company Logo"
          style={{ width: "200px", marginBottom: "10px" }}
        />
        <h2 style={{ margin: 0 }}>{data?.company?.name}</h2>
        <p style={{ margin: 0, fontSize: "13px" }}>
          {data?.company?.address} <br />
          GST: {data?.company?.gst}
        </p>
      </div>

      {/* Invoice Details */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <div><strong>INVOICE No.:</strong> {data.invoiceNo}</div>
        <div><strong>RRN No.:</strong> {data.rrn}</div>
      </div>

      {/* Bill To & Dates - vertical layout */}
      <div style={{ marginBottom: "30px", lineHeight: "1.6" }}>
        <div><strong>Bill to:</strong> {data.vpa}</div>
        <div><strong>Transaction Date & Time:</strong> {data.transactionDate}</div>
        <div><strong>Wallet loaded Date & Time:</strong> {data.transactionDate}</div>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th style={thStyle}>Sl No.</th>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Quantity</th>
            <th style={thStyle}>Unit Price</th>
            <th style={thStyle}>Gross Amount</th>
            <th style={thStyle}>Tax Amount</th>
            <th style={thStyle}>Net Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}>1</td>
            <td style={tdStyle}>Wallet loading</td>
            <td style={tdStyle}>1</td>
            <td style={tdStyle}>{data.amount}</td>
            <td style={tdStyle}>{data.amount}</td>
            <td style={tdStyle}>-</td>
            <td style={tdStyle}>{data.amount}</td>
          </tr>
        </tbody>
      </table>

      {/* Total */}
      <div style={{ textAlign: "right", fontWeight: "bold", fontSize: "16px" }}>
        Total: {data.amount}
      </div>

      {/* Terms */}
      <div style={{ marginTop: "40px", fontSize: "12px", color: "#555" }}>
        <strong>Terms:</strong>
        <ol>
          <li>User has paid appropriate fees to TDPL through Payment Gate.</li>
          <li>Invoices are raised against the UPI ID used for the transaction.</li>
          <li>This is a computer-generated invoice and does not require a signature.</li>
        </ol>
      </div>
    </div>
  );
};

const thStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  backgroundColor: "#f0f0f0",
  fontWeight: "bold",
  textAlign: "left",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
};
