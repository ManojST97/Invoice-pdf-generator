// src/components/ExcelUploader.js
import * as XLSX from "xlsx";

export const ExcelUploader = ({ onDataParsed }) => {
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return; // Don't proceed if no file is selected

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    onDataParsed(rows); // send rows to parent
  };

  const handleBeforeClick = (e) => {
    const proceed = window.confirm("Have you set the Invoice number for all companies?");
    if (!proceed) {
      e.preventDefault();
    }
  };

  return (
    <div className="my-4">
      <label className="block font-bold" style={{ marginRight: "10px" }}>
        Upload Data Sheet
      </label>
      <input
        type="file"
        accept=".xlsx, .xls"
        onClick={handleBeforeClick}
        onChange={handleFile}
      />
    </div>
  );
};
