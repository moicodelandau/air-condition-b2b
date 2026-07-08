/* Kho Map Tracking – theo dõi tồn kho điều hòa theo bản đồ.
 * Dữ liệu lưu ở localStorage; nút "Dữ liệu mẫu" khôi phục seed ban đầu. */
(function () {
  'use strict';

  var STORAGE_KEY = 'ac-warehouse-map-v1';

  // ---------- Dữ liệu mẫu ----------
  var SEED = {
    warehouses: [
      { id: 'hcm', name: 'Kho TP.HCM', addr: 'KCN Tân Bình, Q. Tân Phú, TP.HCM', lat: 10.8006, lng: 106.6283 },
      { id: 'hn',  name: 'Kho Hà Nội', addr: 'KCN Sài Đồng, Long Biên, Hà Nội', lat: 21.0410, lng: 105.9070 },
      { id: 'dn',  name: 'Kho Đà Nẵng', addr: 'KCN Hòa Khánh, Liên Chiểu, Đà Nẵng', lat: 16.0850, lng: 108.1500 },
      { id: 'ct',  name: 'Kho Cần Thơ', addr: 'KCN Trà Nóc, Bình Thủy, Cần Thơ', lat: 10.0894, lng: 105.7060 }
    ],
    products: [
      { sku: 'DK-FTKA25', name: 'Daikin FTKA25UAVMV 1.0HP Inverter' },
      { sku: 'DK-FTKA35', name: 'Daikin FTKA35UAVMV 1.5HP Inverter' },
      { sku: 'PN-XU9ZKH', name: 'Panasonic CU/CS-XU9ZKH-8 1.0HP Inverter' },
      { sku: 'PN-XU12ZKH', name: 'Panasonic CU/CS-XU12ZKH-8 1.5HP Inverter' },
      { sku: 'LG-V10WIN', name: 'LG V10WIN 1.0HP Inverter' },
      { sku: 'LG-V13WIN', name: 'LG V13WIN 1.5HP Inverter' },
      { sku: 'CS-24TL3', name: 'Casper LC-24TL32 2.5HP (tủ đứng)' },
      { sku: 'MD-AFA10', name: 'Midea MSAFA-10CRDN8 1.0HP Inverter' }
    ],
    // inventory[whId][sku] = { qty, min }
    inventory: {
      hcm: {
        'DK-FTKA25': { qty: 42, min: 15 }, 'DK-FTKA35': { qty: 35, min: 15 },
        'PN-XU9ZKH': { qty: 12, min: 15 }, 'PN-XU12ZKH': { qty: 28, min: 10 },
        'LG-V10WIN': { qty: 50, min: 20 }, 'CS-24TL3': { qty: 6, min: 5 }
      },
      hn: {
        'DK-FTKA25': { qty: 30, min: 15 }, 'PN-XU9ZKH': { qty: 22, min: 10 },
        'LG-V13WIN': { qty: 8, min: 12 }, 'MD-AFA10': { qty: 40, min: 15 }
      },
      dn: {
        'DK-FTKA35': { qty: 14, min: 10 }, 'PN-XU12ZKH': { qty: 5, min: 8 },
        'LG-V10WIN': { qty: 18, min: 10 }
      },
      ct: {
        'DK-FTKA25': { qty: 9, min: 10 }, 'MD-AFA10': { qty: 16, min: 8 },
        'CS-24TL3': { qty: 3, min: 4 }
      }
    },
    movements: []
  };

  // ---------- State ----------
  var state = load();
  var selectedWh = null;
  var map = null;
  var markers = {}; // whId -> L.marker

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* dữ liệu hỏng -> dùng seed */ }
    return JSON.parse(JSON.stringify(SEED));
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* bỏ qua khi hết quota */ }
  }

  // ---------- Helpers ----------
  function $(id) { return document.getElementById(id); }

  function productName(sku) {
    var p = state.products.filter(function (x) { return x.sku === sku; })[0];
    return p ? p.name : sku;
  }

  function whName(id) {
    var w = state.warehouses.filter(function (x) { return x.id === id; })[0];
    return w ? w.name : id;
  }

  function whTotals(whId) {
    var inv = state.inventory[whId] || {};
    var total = 0, low = 0, crit = 0;
    Object.keys(inv).forEach(function (sku) {
      var it = inv[sku];
      total += it.qty;
      if (it.qty === 0) crit++;
      else if (it.qty < it.min) low++;
    });
    return { total: total, low: low, crit: crit };
  }

  function whStatus(whId) {
    var t = whTotals(whId);
    if (t.crit > 0) return 'crit';
    if (t.low > 0) return 'low';
    return 'ok';
  }

  function fmtTime(ts) {
    var d = new Date(ts);
    return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) +
      ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }

  // ---------- Bản đồ ----------
  function initMap() {
    if (typeof L === 'undefined') {
      $('mapFallback').classList.remove('hidden');
      return;
    }
    map = L.map('map').setView([16.2, 106.5], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    state.warehouses.forEach(function (w) { addMarker(w); });
  }

  function markerIcon(whId) {
    var t = whTotals(whId);
    var status = whStatus(whId);
    var cls = 'wh-marker' + (status === 'ok' ? '' : ' ' + status);
    return L.divIcon({
      className: '',
      html: '<div class="' + cls + '">🏭 ' + t.total + '</div>',
      iconSize: null,
      iconAnchor: [30, 13]
    });
  }

  function addMarker(w) {
    var m = L.marker([w.lat, w.lng], { icon: markerIcon(w.id) }).addTo(map);
    m.on('click', function () { selectWarehouse(w.id); });
    markers[w.id] = m;
  }

  function refreshMarkers() {
    if (!map) return;
    state.warehouses.forEach(function (w) {
      if (markers[w.id]) markers[w.id].setIcon(markerIcon(w.id));
    });
  }

  // ---------- Render ----------
  function renderStats() {
    var totalUnits = 0, lowCount = 0;
    var skus = {};
    state.warehouses.forEach(function (w) {
      var inv = state.inventory[w.id] || {};
      Object.keys(inv).forEach(function (sku) {
        skus[sku] = true;
        totalUnits += inv[sku].qty;
        if (inv[sku].qty < inv[sku].min) lowCount++;
      });
    });
    $('statWh').textContent = state.warehouses.length;
    $('statUnits').textContent = totalUnits;
    $('statSku').textContent = Object.keys(skus).length;
    $('statLow').textContent = lowCount;
  }

  function renderWhList() {
    var ul = $('whList');
    ul.innerHTML = '';
    state.warehouses.forEach(function (w) {
      var t = whTotals(w.id);
      var li = document.createElement('li');
      li.className = 'wh-item' + (selectedWh === w.id ? ' active' : '');
      li.innerHTML =
        '<div class="wh-name"><span class="dot ' + whStatus(w.id) + '"></span>' + w.name + '</div>' +
        '<div class="wh-meta">' + t.total + ' máy tồn' +
        (t.low + t.crit > 0 ? ' · <b style="color:var(--red)">' + (t.low + t.crit) + ' mã sắp hết/hết</b>' : '') +
        '</div>';
      li.addEventListener('click', function () { selectWarehouse(w.id); });
      ul.appendChild(li);
    });
  }

  function renderHistory() {
    var ul = $('historyList');
    ul.innerHTML = '';
    var items = state.movements.slice(-12).reverse();
    if (!items.length) {
      ul.innerHTML = '<li>Chưa có giao dịch nào.</li>';
      return;
    }
    items.forEach(function (mv) {
      var li = document.createElement('li');
      var label, desc;
      if (mv.type === 'in') {
        label = '<span class="h-in">NHẬP</span>';
        desc = '+' + mv.qty + ' <b>' + productName(mv.sku) + '</b> vào ' + whName(mv.wh);
      } else if (mv.type === 'out') {
        label = '<span class="h-out">XUẤT</span>';
        desc = '−' + mv.qty + ' <b>' + productName(mv.sku) + '</b> từ ' + whName(mv.wh);
      } else {
        label = '<span class="h-transfer">CHUYỂN</span>';
        desc = mv.qty + ' <b>' + productName(mv.sku) + '</b>: ' + whName(mv.wh) + ' → ' + whName(mv.whTo);
      }
      li.innerHTML = fmtTime(mv.time) + ' ' + label + ' ' + desc + (mv.note ? ' <i>(' + mv.note + ')</i>' : '');
      ul.appendChild(li);
    });
  }

  function renderDetail() {
    var panel = $('detailPanel');
    if (!selectedWh) { panel.classList.add('hidden'); return; }
    var w = state.warehouses.filter(function (x) { return x.id === selectedWh; })[0];
    panel.classList.remove('hidden');
    $('detailName').textContent = w.name;
    $('detailAddr').textContent = w.addr;

    var tbody = $('invBody');
    tbody.innerHTML = '';
    var inv = state.inventory[selectedWh] || {};
    var skus = Object.keys(inv).sort(function (a, b) { return productName(a).localeCompare(productName(b)); });
    if (!skus.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="color:var(--muted)">Kho trống — bấm "Nhập kho" để thêm hàng.</td></tr>';
      return;
    }
    skus.forEach(function (sku) {
      var it = inv[sku];
      var qtyCls = it.qty === 0 ? 'crit' : (it.qty < it.min ? 'low' : '');
      var badge = it.qty === 0 ? '<span class="badge crit">HẾT</span>'
        : (it.qty < it.min ? '<span class="badge low">SẮP HẾT</span>' : '');
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><div class="p-name">' + productName(sku) + badge + '</div><div class="p-sku">' + sku + '</div></td>' +
        '<td><span class="qty ' + qtyCls + '">' + it.qty + '</span></td>' +
        '<td>' + it.min + '</td>' +
        '<td><button class="btn ghost small" data-edit-min="' + sku + '" title="Sửa mức tối thiểu">✎</button></td>';
      tbody.appendChild(tr);
    });
  }

  function renderAll() {
    renderStats();
    renderWhList();
    renderHistory();
    renderDetail();
    refreshMarkers();
  }

  function selectWarehouse(id) {
    selectedWh = id;
    var w = state.warehouses.filter(function (x) { return x.id === id; })[0];
    if (map && w) map.flyTo([w.lat, w.lng], 11, { duration: .6 });
    renderAll();
  }

  // ---------- Tìm kiếm ----------
  function renderSearch(q) {
    var box = $('searchResults');
    q = q.trim().toLowerCase();
    if (!q) { box.classList.add('hidden'); box.innerHTML = ''; return; }
    box.classList.remove('hidden');
    var hits = [];
    state.products.forEach(function (p) {
      if (p.name.toLowerCase().indexOf(q) === -1 && p.sku.toLowerCase().indexOf(q) === -1) return;
      state.warehouses.forEach(function (w) {
        var it = (state.inventory[w.id] || {})[p.sku];
        if (it) hits.push({ wh: w.id, sku: p.sku, qty: it.qty });
      });
    });
    if (!hits.length) {
      box.innerHTML = '<div class="sr-empty">Không tìm thấy tồn kho phù hợp.</div>';
      return;
    }
    box.innerHTML = '';
    hits.slice(0, 12).forEach(function (h) {
      var div = document.createElement('div');
      div.className = 'sr-item';
      div.innerHTML = '<b>' + productName(h.sku) + '</b><br>' + whName(h.wh) + ' — còn <b>' + h.qty + '</b> máy';
      div.addEventListener('click', function () { selectWarehouse(h.wh); });
      box.appendChild(div);
    });
  }

  // ---------- Thao tác kho (modal) ----------
  var currentOp = null;

  function openModal(op) {
    if (!selectedWh) return;
    currentOp = op;
    var titles = { 'in': 'Nhập kho — ', 'out': 'Xuất kho — ', 'transfer': 'Chuyển kho — ' };
    $('modalTitle').textContent = titles[op] + whName(selectedWh);

    var skuSel = $('opSku');
    skuSel.innerHTML = '';
    var list;
    if (op === 'in') {
      list = state.products; // nhập: chọn bất kỳ sản phẩm nào
    } else {
      var inv = state.inventory[selectedWh] || {};
      list = state.products.filter(function (p) { return inv[p.sku] && inv[p.sku].qty > 0; });
    }
    list.forEach(function (p) {
      var opt = document.createElement('option');
      opt.value = p.sku;
      var it = (state.inventory[selectedWh] || {})[p.sku];
      opt.textContent = p.name + (it ? ' (tồn: ' + it.qty + ')' : '');
      skuSel.appendChild(opt);
    });

    var toWrap = $('opToWrap');
    if (op === 'transfer') {
      toWrap.classList.remove('hidden');
      var toSel = $('opTo');
      toSel.innerHTML = '';
      state.warehouses.forEach(function (w) {
        if (w.id === selectedWh) return;
        var opt = document.createElement('option');
        opt.value = w.id;
        opt.textContent = w.name;
        toSel.appendChild(opt);
      });
    } else {
      toWrap.classList.add('hidden');
    }

    $('opQty').value = 1;
    $('opNote').value = '';
    $('modal').classList.remove('hidden');
  }

  function closeModal() { $('modal').classList.add('hidden'); currentOp = null; }

  function applyOp(e) {
    e.preventDefault();
    var sku = $('opSku').value;
    var qty = parseInt($('opQty').value, 10);
    var note = $('opNote').value.trim();
    if (!sku || !qty || qty < 1) return;

    var inv = state.inventory[selectedWh] = state.inventory[selectedWh] || {};

    if (currentOp === 'in') {
      if (!inv[sku]) inv[sku] = { qty: 0, min: 5 };
      inv[sku].qty += qty;
    } else {
      if (!inv[sku] || inv[sku].qty < qty) {
        alert('Không đủ tồn kho: ' + productName(sku) + ' chỉ còn ' + (inv[sku] ? inv[sku].qty : 0) + ' máy.');
        return;
      }
      inv[sku].qty -= qty;
      if (currentOp === 'transfer') {
        var toId = $('opTo').value;
        if (!toId) return;
        var invTo = state.inventory[toId] = state.inventory[toId] || {};
        if (!invTo[sku]) invTo[sku] = { qty: 0, min: inv[sku].min };
        invTo[sku].qty += qty;
      }
    }

    state.movements.push({
      time: Date.now(),
      type: currentOp,
      wh: selectedWh,
      whTo: currentOp === 'transfer' ? $('opTo').value : undefined,
      sku: sku,
      qty: qty,
      note: note || undefined
    });

    save();
    closeModal();
    renderAll();
  }

  function editMin(sku) {
    var it = (state.inventory[selectedWh] || {})[sku];
    if (!it) return;
    var v = prompt('Mức tồn tối thiểu cho "' + productName(sku) + '":', it.min);
    if (v === null) return;
    var n = parseInt(v, 10);
    if (isNaN(n) || n < 0) return;
    it.min = n;
    save();
    renderAll();
  }

  // ---------- Sự kiện ----------
  $('searchInput').addEventListener('input', function () { renderSearch(this.value); });
  $('btnCloseDetail').addEventListener('click', function () { selectedWh = null; renderAll(); });
  $('btnCancel').addEventListener('click', closeModal);
  $('modal').addEventListener('click', function (e) { if (e.target === this) closeModal(); });
  $('opForm').addEventListener('submit', applyOp);

  document.querySelectorAll('.detail-actions .btn').forEach(function (b) {
    b.addEventListener('click', function () { openModal(b.getAttribute('data-op')); });
  });

  $('invBody').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-edit-min]');
    if (btn) editMin(btn.getAttribute('data-edit-min'));
  });

  $('btnReset').addEventListener('click', function () {
    if (!confirm('Xoá toàn bộ dữ liệu đã nhập và quay về dữ liệu mẫu?')) return;
    state = JSON.parse(JSON.stringify(SEED));
    selectedWh = null;
    save();
    renderAll();
  });

  // ---------- Khởi động ----------
  initMap();
  renderAll();
})();
