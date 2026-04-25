function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["No","Nama Pembeli","Tanggal Pembelian","Alamat / Kelas","Barang Dibeli","Total Pembelian"]);
      var header = sheet.getRange(1, 1, 1, 6);
      header.setBackground("#3d1f08");
      header.setFontColor("#e8c090");
      header.setFontWeight("bold");
      header.setFontSize(11);
      header.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    var data   = JSON.parse(e.postData.contents);
    var no     = sheet.getLastRow();
    var nama   = data.nama    || "-";
    var tgl    = data.tanggal || new Date().toLocaleString("id-ID");
    var alamat = data.alamat  || "-";
    var barang = data.barang  || "-";
    var total  = "Rp " + Number(data.total || 0).toLocaleString("id-ID");

    sheet.appendRow([no, nama, tgl, alamat, barang, total]);
    sheet.autoResizeColumns(1, 6);

    var row = sheet.getLastRow();
    if (row % 2 === 0) {
      sheet.getRange(row, 1, 1, 6).setBackground("#fdf6ec");
    }

    // ✅ CORS header agar browser bisa baca response
    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "Akar Si Doel API aktif!" }))
    .setMimeType(ContentService.MimeType.JSON);
}