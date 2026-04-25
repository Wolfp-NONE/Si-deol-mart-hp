// ===== KONFIGURASI GOOGLE SHEETS =====
// Ganti dengan URL Apps Script kamu setelah deploy
const SHEETS_URL = "https://script.google.com/macros/s/AKfycbzIDr70j9pvBASNRq48tqltEMokZnhz1RoWCRVGXO8uzSl6DtGzeuv1fxledL5Hs4bW/exec";

// ===== DATA PRODUK =====
const produk = [
  {
    id: 1,
    nama: "Kue Akar Kelapa Kayu Manis",
    harga: 6000,
    deskripsi: "Renyah, gurih, aroma kayu manis yang khas. Cocok untuk camilan keluarga!",
    gambar: "Gambar/akar.jpg",
    tag: "Best Seller"
  },
  {
    id: 2,
    nama: "Kue Akar Kelapa Coklat Roll",
    harga: 6500,
    deskripsi: "Dicelup coklat premium yang Istimewa!",
    gambar: "Gambar/coklat.jpeg",
    tag: "New"
  }
];

let keranjang = [];


// ======================
// PAGE ENTER ANIMATION
// ======================
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-enter");
  setTimeout(() => document.body.classList.remove("page-enter"), 600);
});


// ======================
// NAVIGATE WITH FADE+BLUR
// ======================
function navigateTo(url) {
  document.body.classList.add("page-exit");
  setTimeout(() => { window.location.href = url; }, 480);
}

function navigateToTeam() { navigateTo("team.html"); }
function navigateToInfo()  { navigateTo("info.html"); }


// ======================
// TOGGLE CART
// ======================
function toggleCart(){
  const panel = document.getElementById("cartPanel");
  const overlay = document.getElementById("overlay");
  panel.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.classList.toggle("cart-open");
}


// ======================
// FORMAT RUPIAH
// ======================
function formatRupiah(angka){
  return "Rp " + angka.toLocaleString("id-ID");
}


// ======================
// TOAST
// ======================
function showToast(pesan, tipe=""){
  const old = document.querySelector(".toast");
  if(old) old.remove();

  const toast = document.createElement("div");
  toast.className = "toast " + tipe;
  toast.innerText = pesan;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}


// ======================
// TAMPIL PRODUK
// ======================
function tampilProduk(){
  let html = "";

  produk.forEach(p => {
    const tagClass = p.tag === "New" ? "product-tag new-tag" : "product-tag";
    html += `
      <div class="product-card">
        <div class="product-img-wrap">
          <img src="${p.gambar}" alt="${p.nama}" class="product-img" loading="lazy"
               onerror="this.style.background='#f5e9d4';this.style.minHeight='210px'">
          <div class="${tagClass}">${p.tag}</div>
        </div>
        <div class="product-info">
          <h4>${p.nama}</h4>
          <p class="product-desc">${p.deskripsi}</p>
          <div class="product-footer">
            <div class="product-price">
              <span>harga / pcs</span>
              ${formatRupiah(p.harga)}
            </div>
            <button class="btn-tambah" onclick="tambah(${p.id})">Tambah</button>
          </div>
        </div>
      </div>
    `;
  });

  document.getElementById("produk").innerHTML = html;
}


// ======================
// TAMBAH KE KERANJANG
// ======================
function tambah(id){
  const produkItem = produk.find(p => p.id === id);
  const item = keranjang.find(i => i.id === id);

  if(item){
    item.qty++;
  } else {
    keranjang.push({...produkItem, qty: 1});
  }

  showToast("✓ " + produkItem.nama + " ditambahkan", "tambah");
  tampilKeranjang();
}


// ======================
// HAPUS ITEM
// ======================
function hapus(id){
  const el = document.getElementById("item-" + id);
  const produkItem = keranjang.find(i => i.id === id);

  if(el){
    el.classList.add("remove-animation");
    showToast("🗑 " + produkItem.nama + " dihapus", "hapus");
    setTimeout(() => {
      keranjang = keranjang.filter(item => item.id !== id);
      tampilKeranjang();
    }, 300);
  }
}


// ======================
// QTY + / -
// ======================
function tambahQty(id){
  const item = keranjang.find(i => i.id === id);
  if(item) { item.qty++; tampilKeranjang(); }
}

function kurangQty(id){
  const item = keranjang.find(i => i.id === id);
  if(!item) return;
  item.qty--;
  if(item.qty <= 0) hapus(id);
  else tampilKeranjang();
}


// ======================
// TAMPIL KERANJANG
// ======================
function tampilKeranjang(){
  let html = "";
  let total = 0;
  let jumlah = 0;

  if(keranjang.length === 0){
    html = `<div class="empty-cart"><div>🛒</div><p>Keranjang masih kosong.<br>Yuk pilih produk dulu!</p></div>`;
  }

  keranjang.forEach(item => {
    total += item.harga * item.qty;
    jumlah += item.qty;

    html += `
      <div class="cart-item" id="item-${item.id}">
        <div class="cart-item-name">${item.nama}</div>
        <div class="cart-item-price">${formatRupiah(item.harga)} × ${item.qty} = <b>${formatRupiah(item.harga * item.qty)}</b></div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="kurangQty(${item.id})">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="tambahQty(${item.id})">+</button>
          <button class="hapus-btn" onclick="hapus(${item.id})">Hapus</button>
        </div>
      </div>
    `;
  });

  document.getElementById("keranjang").innerHTML = html;

  const totalEl = document.getElementById("total");
  totalEl.innerText = keranjang.length > 0 ? formatRupiah(total) : "Rp 0";
  totalEl.classList.remove("total-anim");
  void totalEl.offsetWidth;
  totalEl.classList.add("total-anim");

  document.getElementById("jumlah").innerText = jumlah;
}

// ======================
// SIMPAN KE GOOGLE SHEETS
// ======================
async function simpanKeSheets(data) {
  try {
    const response = await fetch(SHEETS_URL, {
      method: "POST",
      // Hapus mode: "no-cors" — pakai default (cors)
      headers: { "Content-Type": "text/plain" }, // ← pakai text/plain agar GAS menerima
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.status === "ok") {
      console.log("✅ Data berhasil disimpan ke Google Sheets");
    } else {
      console.warn("⚠️ Sheets error:", result.message);
    }
  } catch(e) {
    console.warn("❌ Gagal simpan ke sheets:", e);
  }
}


// ======================
// CHECKOUT WHATSAPP + SHEETS
// ======================
function checkout(){
  const nama   = document.getElementById("namaKelas").value.trim();
  const kelas  = document.getElementById("kelasTujuan") ? document.getElementById("kelasTujuan").value.trim() : "";
  const alamat = document.getElementById("alamat").value.trim();
  const tujuan = kelas || alamat;

  if(!nama || !tujuan){
    showToast("⚠️ Isi nama dan kelas/alamat dulu!", "hapus");
    return;
  }

  if(keranjang.length === 0){
    showToast("⚠️ Keranjang masih kosong!", "hapus");
    return;
  }

  const total = keranjang.reduce((sum, item) => sum + (item.harga * item.qty), 0);
  const now   = new Date();
  const tanggal = now.toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  // Kirim ke Google Sheets
  const dataSheets = {
    nama,
    tanggal,
    alamat: tujuan,
    barang: keranjang.map(i => `${i.nama} (${i.qty} pcs)`).join(", "),
    total
  };
  simpanKeSheets(dataSheets);

  // Susun pesan WhatsApp
  let pesan = "🗒️ *PESANAN AKAR SI DOEL*\n";
  pesan += `🗓️ ${tanggal}\n\n`;

  keranjang.forEach((item, i) => {
    pesan += `${i+1}. ${item.nama}\n   Qty: ${item.qty} pcs\n   Subtotal: ${formatRupiah(item.harga * item.qty)}\n\n`;
  });

  pesan += `━━━━━━━━━━━━━\n`;
  pesan += `💵 TOTAL: ${formatRupiah(total)}\n\n`;
  pesan += `😝 Nama: ${nama}\n`;
  pesan += `🎯 Kelas/Alamat: ${tujuan}\n\n`;
  pesan += `Terima kasih sudah memesan! 🙏`;

  const url = "https://wa.me/6285810182924?text=" + encodeURIComponent(pesan);
  window.open(url, "_blank");

  keranjang = [];
  tampilKeranjang();
  document.getElementById("namaKelas").value = "";
  if(document.getElementById("kelasTujuan")) document.getElementById("kelasTujuan").value = "";
  document.getElementById("alamat").value = "";

  showToast("✓ Pesanan berhasil dikirim!", "tambah");
}


// INIT
tampilProduk();
tampilKeranjang();
