/* Sơ Đồ Kho Điều Hòa – gợi ý & mapping sơ đồ hàng hóa trong kho.
 *
 * Kho thật: dài 50m (Bắc->Nam) x ngang 40m (Tây->Đông).
 * - Cửa chính hướng BẮC (4m rộng, 4m cao); văn phòng kho ở góc phải cửa (nhìn ra) = góc Đông-Bắc.
 * - 2 cửa phụ: NAM và TÂY. Trần cao nhất 5m (giữa kho), 4m tại tường.
 * - Hàng đặt sàn theo LÔ, xếp chồng; số lớp chồng tính theo loại máy + trần tại vị trí lô.
 * - Tồn kho thật nạp từ js/data.js (sinh bởi tools/xlsx_to_data.py từ file báo cáo Excel).
 * Đơn vị: mét. Trục x: 0 = tường Tây -> 40 = Đông. Trục y: 0 = tường Bắc -> 50 = Nam. */
(function () {
  'use strict';

  var STORAGE_KEY = 'ac-warehouse-real-v1';

  // ---------- Cấu hình kho ----------
  var CFG = {
    width: 40,   // ngang (m, trục x, Tây->Đông)
    depth: 50,   // dài (m, trục y, Bắc->Nam)
    hWall: 4.0,  // trần tại tường Bắc/Nam (bằng chiều cao cửa chính)
    hMax: 5.0    // trần cao nhất – giữa kho
  };
  var CLEARANCE = 0.3; // hở an toàn dưới trần khi chồng hàng

  // Thông số xếp chồng theo cỡ máy: S treo tường, M dàn nóng/âm trần/multi, L tủ đứng/giấu trần, X máy lớn/VRV
  var SIZE = {
    S: { label: 'Nhỏ (treo tường, hàng nhẹ)', perM2: 1.6, layerH: 0.32, maxLayers: 8 },
    M: { label: 'Vừa (dàn nóng, âm trần, multi)', perM2: 0.9, layerH: 0.7, maxLayers: 3 },
    L: { label: 'Lớn (tủ đứng, giấu trần)', perM2: 0.5, layerH: 1.0, maxLayers: 2 },
    X: { label: 'Siêu lớn (VRV/VRF, máy ≥5HP)', perM2: 0.3, layerH: 1.8, maxLayers: 1 }
  };

  var DOORS = [
    { id: 'bac', name: 'CỬA CHÍNH (Bắc) 4×4m', side: 'N', x: 24, w: 4, color: '#1668dc' },
    { id: 'nam', name: 'Cửa Nam', side: 'S', x: 24, w: 3, color: '#16a34a' },
    { id: 'tay', name: 'Cửa Tây', side: 'W', y: 22.5, w: 3, color: '#d97706' }
  ];
  var OFFICE = { x: 31, y: 0, w: 9, d: 7 };
  var ANCHORS = {
    north: { x: 26, y: 0 },
    west: { x: 0, y: 24 },
    south: { x: 25.5, y: 50 },
    office: { x: 35.5, y: 3.5 }
  };

  // Khu chức năng (vẽ nền, không chứa lô)
  var ZONES = [
    { lines: ['Tập kết', 'nhập / xuất'], x: 21, y: 0.5, w: 9.5, d: 7, fill: '#dcfce7', stroke: '#16a34a' },
    { lines: ['Tập kết cửa Nam'], x: 16, y: 45.5, w: 19, d: 4, fill: '#dcfce7', stroke: '#16a34a' },
    { lines: ['Lối đi chính 4m', '(xe nâng)'], x: 23, y: 7.5, w: 4, d: 42, fill: '#eef2f7', stroke: '#9aa8bd', vertical: true },
    { lines: ['Lối đi ngang 4m (xe nâng)'], x: 0, y: 21.5, w: 40, d: 4, fill: '#eef2f7', stroke: '#9aa8bd' }
  ];

  // ---------- Lô hàng mặc định (25 lô, hai bên lối đi) ----------
  function defaultBlocks() {
    var rowsY = [8, 14.5, 26.5, 33, 39.5];           // 5 hàng lô, sâu 4m
    var leftX = [[0.5, 6], [8, 6], [15.5, 6.5]];     // phía Tây lối đi chính
    var rightX = [[28, 5.5], [34.5, 5]];             // phía Đông
    var blocks = [], n = 1;
    rowsY.forEach(function (y) {
      leftX.concat(rightX).forEach(function (xw) {
        blocks.push({ id: 'b' + n, label: 'L' + n, x: xw[0], y: y, w: xw[1], d: 4, groupIds: [] });
        n++;
      });
    });
    return blocks;
  }

  // ---------- Nạp tồn kho ----------
  // Dòng dữ liệu: [hãng, mã, tên, tồn, xuất, cat, size]. Nguồn: js/data.js (mặc định),
  // file Excel/CSV nạp trong app, hoặc Google Sheet — tất cả lưu vào state.items.
  function rawToItems(raw) {
    return raw.map(function (r) {
      return { brand: r[0], sku: r[1], name: r[2], qty: r[3], out: r[4], cat: r[5], size: r[6] };
    });
  }
  var ITEMS = [];   // gán trong applyRawItems / khởi động
  var GROUPS = [];

  var CAT_LABEL = {
    treo: 'Treo tường', amtran: 'Âm trần', aptran: 'Áp trần', tudung: 'Tủ đứng',
    giautran: 'Giấu trần', multi: 'Multi', dannong: 'Dàn nóng', vrv: 'VRV/VRF',
    phukien: 'Phụ kiện', linhtinh: 'Hàng linh tinh', khac: 'Khác'
  };

  var PALETTE = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2',
    '#7f7f7f', '#bcbd22', '#17becf', '#3b82f6', '#f59e0b', '#10b981', '#ef4444',
    '#8b5cf6', '#f97316', '#14b8a6', '#a855f7', '#65a30d', '#0ea5e9', '#e11d48'
  ];

  // ---------- Gom nhóm hàng để xếp lô ----------
  // Máy lớn/VRV + hàng cỡ L -> 1 nhóm sát cửa Tây (xe nâng). Dàn nóng cỡ M -> gần đó.
  // Phụ kiện + linh tinh -> gần văn phòng (dễ quản lý, tránh thất thoát).
  // Treo tường: mỗi hãng >= 30 máy là 1 nhóm, ưu tiên bán chạy gần CỬA CHÍNH Bắc.
  function buildGroups() {
    var groups = [];
    function grp(id, label, short, anchor, color, filter) {
      var items = ITEMS.filter(filter);
      if (!items.length) return null;
      var g = {
        id: id, label: label, short: short, anchor: anchor, color: color, items: items,
        qty: items.reduce(function (a, m) { return a + m.qty; }, 0),
        out: items.reduce(function (a, m) { return a + m.out; }, 0)
      };
      groups.push(g);
      return g;
    }

    var taken = {};
    function untaken(m) { return !taken[m.sku + '|' + m.name]; }
    function mark(g) { if (g) g.items.forEach(function (m) { taken[m.sku + '|' + m.name] = true; }); }

    mark(grp('g_maylon', 'MÁY LỚN & VRV/VRF & tủ đứng', 'MÁY LỚN', 'west', '#b91c1c',
      function (m) { return untaken(m) && (m.size === 'X' || m.size === 'L'); }));
    mark(grp('g_dannong', 'Dàn nóng / Multi / Âm trần (cỡ vừa)', 'DÀN NÓNG', 'west', '#c2660a',
      function (m) { return untaken(m) && m.size === 'M'; }));
    mark(grp('g_phukien', 'Phụ kiện, mặt nạ, remote', 'PHỤ KIỆN', 'office', '#0e7490',
      function (m) { return untaken(m) && m.cat === 'phukien'; }));
    mark(grp('g_linhtinh', 'Hàng linh tinh (nón BH, gia dụng…)', 'LINH TINH', 'office', '#a16207',
      function (m) { return untaken(m) && m.cat === 'linhtinh'; }));

    // treo tường + còn lại cỡ S: chia theo hãng
    var perBrand = {};
    ITEMS.forEach(function (m) {
      if (!untaken(m)) return;
      perBrand[m.brand] = (perBrand[m.brand] || 0) + m.qty;
    });
    var bigBrands = Object.keys(perBrand).filter(function (b) { return perBrand[b] >= 30; });
    bigBrands.sort(function (a, b) { return perBrand[b] - perBrand[a]; });
    bigBrands.forEach(function (b, i) {
      // id theo tên hãng (không theo thứ tự) để lô đã gán không bị lệch khi nạp số liệu mới
      var slug = b.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_');
      mark(grp('g_br_' + slug, b + ' (treo tường & hàng nhẹ)', b, 'north', PALETTE[i % PALETTE.length],
        function (m) { return untaken(m) && m.brand === b; }));
    });
    mark(grp('g_khac', 'Hãng nhỏ & hàng khác', 'KHÁC', 'south', '#64748b', untaken));

    // độ ưu tiên (điểm cao xếp trước, gần cửa hơn): bán chạy hôm nay x10 + tồn x0.05
    groups.forEach(function (g) { g.priority = g.out * 10 + g.qty * 0.05; });
    return groups;
  }

  function groupOf(id) { return GROUPS.filter(function (g) { return g.id === id; })[0]; }

  // Thứ tự phân bổ diện tích: nhóm đặc thù trước (cần vị trí riêng), rồi hãng theo độ ưu tiên
  function groupOrder() {
    var special = ['g_maylon', 'g_dannong', 'g_phukien', 'g_linhtinh'];
    var rest = GROUPS.filter(function (g) { return special.indexOf(g.id) === -1 && g.id !== 'g_khac'; })
      .sort(function (a, b) { return b.priority - a.priority; });
    var order = [];
    special.forEach(function (id) { var g = groupOf(id); if (g) order.push(g); });
    order = order.concat(rest);
    var khac = groupOf('g_khac');
    if (khac) order.push(khac);
    return order;
  }

  // ---------- State ----------
  function defaultState() {
    var st = { blocks: defaultBlocks(), checked: {} };
    runOptimize(st, true);
    return st;
  }

  function readSaved() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var st = JSON.parse(raw);
        if (st && st.blocks) return st;
      }
    } catch (e) { /* dữ liệu hỏng -> mặc định */ }
    return null;
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* hết quota */ }
  }

  // khởi tạo 2 pha: items trước (GROUPS cần nó), rồi state
  var _saved = readSaved();
  ITEMS = rawToItems((_saved && _saved.items) || (typeof INVENTORY_DATA !== 'undefined' ? INVENTORY_DATA : []));
  GROUPS = buildGroups();
  var state = _saved || defaultState();
  // dọn id nhóm không còn tồn tại (vd hãng đã hết hàng sau lần nạp trước)
  state.blocks.forEach(function (b) {
    b.groupIds = (b.groupIds || []).filter(function (id) { return groupOf(id); });
  });
  var selectedBlock = null;
  var highlightBlocks = {};
  var activeGroup = null;
  var editMode = false;
  var colorMode = 'group';

  // ---------- Helpers ----------
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function blockOf(id) { return state.blocks.filter(function (b) { return b.id === id; })[0]; }

  function ceilingAt(y) { // 4m tại tường Bắc/Nam, 5m giữa kho
    return CFG.hMax - (CFG.hMax - CFG.hWall) * Math.abs(y - CFG.depth / 2) / (CFG.depth / 2);
  }
  function blockCeiling(b) { return ceilingAt(b.y + b.d / 2); }
  function layersFor(b, size) {
    var s = SIZE[size];
    return Math.max(1, Math.min(s.maxLayers, Math.floor((blockCeiling(b) - CLEARANCE) / s.layerH)));
  }
  function density(b, size) { return SIZE[size].perM2 * layersFor(b, size); }
  function blockArea(b) { return b.w * b.d; }
  function distTo(b, anchor) {
    return Math.hypot(b.x + b.w / 2 - anchor.x, b.y + b.d / 2 - anchor.y);
  }

  // ---------- Phân bổ model vào lô (suy ra từ block.groupIds, theo DIỆN TÍCH) ----------
  function computePlacement() {
    var res = { modelLoc: {}, blockItems: {}, blockUsed: {}, overflow: [] };
    var free = {};
    state.blocks.forEach(function (b) {
      res.blockItems[b.id] = []; res.blockUsed[b.id] = 0;
      free[b.id] = blockArea(b);
    });

    groupOrder().forEach(function (g) {
      var blocks = state.blocks.filter(function (b) { return b.groupIds.indexOf(g.id) !== -1; })
        .sort(function (a, b) { return distTo(a, ANCHORS[g.anchor]) - distTo(b, ANCHORS[g.anchor]); });
      g.items.forEach(function (m) {
        var need = m.qty / 1; // diện tích tính theo lô cụ thể (mật độ phụ thuộc trần)
        var target = null;
        for (var i = 0; i < blocks.length; i++) {
          var a = m.qty / density(blocks[i], m.size);
          if (free[blocks[i].id] >= a) { target = blocks[i]; break; }
        }
        if (!target) { // nhét lô còn trống nhất của nhóm
          blocks.forEach(function (b) { if (!target || free[b.id] > free[target.id]) target = b; });
          if (target && free[target.id] <= 0.05) target = null;
        }
        if (!target) { res.overflow.push({ model: m, qty: m.qty }); return; }
        var area = m.qty / density(target, m.size);
        res.modelLoc[m.sku + '|' + m.name] = target.id;
        res.blockItems[target.id].push({ model: m, qty: m.qty, area: area });
        res.blockUsed[target.id] += area;
        free[target.id] -= area;
      });
    });
    return res;
  }

  // ---------- Thuật toán gợi ý xếp kho ----------
  function runOptimize(st, silent) {
    var slots = st.blocks.map(function (b) {
      return { b: b, free: b.w * b.d, groups: [] };
    });

    var report = [];
    groupOrder().forEach(function (g) {
      // diện tích nhóm cần (ước theo lô trần trung bình giữa kho)
      var need = 0;
      g.items.forEach(function (m) {
        var s = SIZE[m.size];
        var layers = Math.max(1, Math.min(s.maxLayers, Math.floor((4.6 - CLEARANCE) / s.layerH)));
        need += m.qty / (s.perM2 * layers);
      });
      var got = 0, used = [];
      var sorted = slots.slice().sort(function (a, b) {
        return distTo(a.b, ANCHORS[g.anchor]) - distTo(b.b, ANCHORS[g.anchor]);
      });
      for (var i = 0; i < sorted.length && got < need; i++) {
        var s = sorted[i];
        if (s.groups.length >= 3 || s.free <= 0.5) continue;
        if (s.groups.length > 0 && s.free < Math.min(need - got, blockArea(s.b)) * 0.4) continue;
        var take = Math.min(need - got, s.free);
        s.groups.push(g.id);
        s.free -= take;
        got += take;
        used.push(s.b.label);
      }
      report.push({ g: g, need: need, got: got, blocks: used });
    });

    slots.forEach(function (s) { s.b.groupIds = s.groups; });
    if (!silent) showOptimizeResult(report);
  }

  function showOptimizeResult(report) {
    var rows = report.map(function (r) {
      var warn = r.got < r.need - 0.5 ? ' <b style="color:var(--red)">⚠ thiếu ' + Math.ceil(r.need - r.got) + 'm²</b>' : '';
      return '<li><span class="swatch" style="background:' + r.g.color + ';display:inline-block;vertical-align:-1px"></span> <b>' +
        esc(r.g.label) + '</b> (' + r.g.qty + ' máy, cần ~' + Math.ceil(r.need) + 'm²) → ' +
        (r.blocks.length ? 'lô ' + r.blocks.join(', ') : '<i>chưa có lô</i>') + warn + '</li>';
    }).join('');
    $('modalTitle').textContent = 'Gợi ý sơ đồ xếp kho';
    $('modalBody').innerHTML =
      '<p><b>Nguyên tắc áp dụng cho kho 50×40m này:</b></p><ul>' +
      '<li><b>MÁY LỚN / VRV-VRF / tủ đứng</b>: chỉ để sàn (không chồng cao), sát <b>cửa Tây</b> + lối xe nâng 4m.</li>' +
      '<li><b>Hãng bán chạy, tồn nhiều</b> (Panasonic, Casper, Daikin…): gần <b>CỬA CHÍNH Bắc</b> và khu tập kết.</li>' +
      '<li><b>Phụ kiện + hàng linh tinh</b>: gần <b>văn phòng</b> (góc Đông-Bắc) để dễ quản lý, tránh thất thoát.</li>' +
      '<li>Giữa kho trần 5m → treo tường chồng tối đa 8 lớp; sát tường 4m → giảm còn ~7 lớp. Máy vừa tối đa 3 lớp, máy lớn 2, VRV không chồng.</li>' +
      '<li>Mỗi lô tối đa 3 nhóm hàng; lối đi chính + lối ngang giữ trống 4m cho xe nâng.</li>' +
      '</ul><p><b>Phân bổ:</b></p><ul>' + rows + '</ul>' +
      '<p class="muted">Kéo thả lô ở chế độ ✎ Sửa sơ đồ nếu muốn chỉnh tay, sơ đồ sẽ lưu lại.</p>';
    $('modal').classList.remove('hidden');
  }

  // ---------- Vẽ sơ đồ SVG ----------
  function ceilBoundaries() {
    // đường đồng mức trần 4.5m (2 bên vì trần cao nhất ở giữa)
    var res = [];
    var frac = (CFG.hMax - 4.5) / (CFG.hMax - CFG.hWall); // = 0.5
    res.push({ y: CFG.depth / 2 - frac * CFG.depth / 2, label: 'trần 4.5m' });
    res.push({ y: CFG.depth / 2 + frac * CFG.depth / 2, label: 'trần 4.5m' });
    return res;
  }

  function blockFillPct(b, placement) {
    return Math.round((placement.blockUsed[b.id] || 0) / blockArea(b) * 100);
  }

  function blockColor(b, placement) {
    if (colorMode === 'fill') {
      var ratio = Math.min(1, (placement.blockUsed[b.id] || 0) / blockArea(b));
      return 'hsl(' + Math.max(0, 120 - 120 * ratio) + ',62%,58%)';
    }
    if (colorMode === 'layers') {
      var lv = layersFor(b, 'S');
      return { 5: '#dbe7f5', 6: '#a8c4e5', 7: '#6d9bd1', 8: '#3c72bd' }[lv] || '#dbe7f5';
    }
    return null;
  }

  function renderMap() {
    var placement = computePlacement();
    var pad = 3;
    var s = '<svg id="floorSvg" viewBox="' + (-pad) + ' ' + (-pad) + ' ' + (CFG.width + pad * 2) + ' ' + (CFG.depth + pad * 2) + '" xmlns="http://www.w3.org/2000/svg">';
    s += '<defs><radialGradient id="ceilGrad" cx="0.5" cy="0.5" r="0.75">' +
      '<stop offset="0" stop-color="#eef4fb"/><stop offset="1" stop-color="#f7f2e3"/></radialGradient></defs>';

    // sàn + lưới 1m
    s += '<rect x="0" y="0" width="' + CFG.width + '" height="' + CFG.depth + '" fill="url(#ceilGrad)"/>';
    for (var gx = 1; gx < CFG.width; gx++)
      s += '<line x1="' + gx + '" y1="0" x2="' + gx + '" y2="' + CFG.depth + '" stroke="#000" stroke-opacity="' + (gx % 5 ? .04 : .09) + '" stroke-width="0.04"/>';
    for (var gy = 1; gy < CFG.depth; gy++)
      s += '<line x1="0" y1="' + gy + '" x2="' + CFG.width + '" y2="' + gy + '" stroke="#000" stroke-opacity="' + (gy % 5 ? .04 : .09) + '" stroke-width="0.04"/>';

    // đồng mức trần
    ceilBoundaries().forEach(function (bd) {
      s += '<line x1="0" y1="' + bd.y + '" x2="' + CFG.width + '" y2="' + bd.y + '" stroke="#7c93b5" stroke-width="0.07" stroke-dasharray="0.7 0.5"/>';
      s += '<text x="1" y="' + (bd.y - 0.25) + '" font-size="0.6" fill="#5b7396">' + bd.label + '</text>';
    });
    s += '<text x="1" y="' + (CFG.depth / 2 + 0.25) + '" font-size="0.6" fill="#41618f">— giữa kho trần ' + CFG.hMax.toFixed(1) + 'm —</text>';

    // khu chức năng
    ZONES.forEach(function (z) {
      s += '<g class="zone"><rect x="' + z.x + '" y="' + z.y + '" width="' + z.w + '" height="' + z.d + '" rx="0.3" fill="' + z.fill + '" fill-opacity="0.8" stroke="' + z.stroke + '"/>';
      var cx = z.x + z.w / 2, cy = z.y + z.d / 2;
      var rot = z.vertical ? ' transform="rotate(-90 ' + cx + ' ' + cy + ')"' : '';
      var ly0 = cy - (z.lines.length - 1) * 0.4 + 0.22;
      s += '<g' + rot + '>';
      z.lines.forEach(function (line, i) {
        s += '<text x="' + cx + '" y="' + (ly0 + i * 0.8) + '" font-size="0.6" font-weight="600" fill="' + z.stroke + '" text-anchor="middle">' + esc(line) + '</text>';
      });
      s += '</g></g>';
    });

    // văn phòng
    s += '<g class="zone"><rect x="' + OFFICE.x + '" y="' + OFFICE.y + '" width="' + OFFICE.w + '" height="' + OFFICE.d + '" fill="#e7e2f7" stroke="#6d5bb8" stroke-width="0.12"/>' +
      '<text x="' + (OFFICE.x + OFFICE.w / 2) + '" y="' + (OFFICE.y + OFFICE.d / 2 - 0.2) + '" font-size="0.72" font-weight="700" fill="#4c3d99" text-anchor="middle">VĂN PHÒNG</text>' +
      '<text x="' + (OFFICE.x + OFFICE.w / 2) + '" y="' + (OFFICE.y + OFFICE.d / 2 + 0.75) + '" font-size="0.55" fill="#4c3d99" text-anchor="middle">KHO</text></g>';

    // tường
    s += '<rect x="0" y="0" width="' + CFG.width + '" height="' + CFG.depth + '" fill="none" stroke="#33465e" stroke-width="0.32"/>';

    // cửa + la bàn
    DOORS.forEach(function (d) {
      var t = 0.55;
      if (d.side === 'N') {
        s += '<rect x="' + d.x + '" y="' + (-t / 2) + '" width="' + d.w + '" height="' + t + '" fill="#fff" stroke="' + d.color + '" stroke-width="0.12"/>';
        s += '<text x="' + (d.x + d.w / 2) + '" y="-0.9" font-size="0.7" font-weight="700" fill="' + d.color + '" text-anchor="middle">' + esc(d.name) + '</text>';
        s += '<text x="' + (d.x + d.w / 2) + '" y="' + 1.2 + '" font-size="0.8" fill="' + d.color + '" text-anchor="middle">⬍</text>';
      } else if (d.side === 'S') {
        s += '<rect x="' + d.x + '" y="' + (CFG.depth - t / 2) + '" width="' + d.w + '" height="' + t + '" fill="#fff" stroke="' + d.color + '" stroke-width="0.12"/>';
        s += '<text x="' + (d.x + d.w / 2) + '" y="' + (CFG.depth + 1.4) + '" font-size="0.7" font-weight="700" fill="' + d.color + '" text-anchor="middle">' + esc(d.name) + '</text>';
      } else {
        s += '<rect x="' + (-t / 2) + '" y="' + d.y + '" width="' + t + '" height="' + d.w + '" fill="#fff" stroke="' + d.color + '" stroke-width="0.12"/>';
        var cyd = d.y + d.w / 2;
        s += '<text x="-1" y="' + cyd + '" font-size="0.7" font-weight="700" fill="' + d.color + '" text-anchor="middle" transform="rotate(-90 -1 ' + cyd + ')">' + esc(d.name) + '</text>';
      }
    });
    // la bàn: Bắc hướng lên
    s += '<g font-weight="700" text-anchor="middle"><circle cx="' + (CFG.width + 1.6) + '" cy="-1" r="1.05" fill="#fff" stroke="#33465e" stroke-width="0.08"/>' +
      '<text x="' + (CFG.width + 1.6) + '" y="-0.6" font-size="0.9" fill="#d62728">B↑</text></g>';

    // lô hàng
    state.blocks.forEach(function (b) {
      var pct = blockFillPct(b, placement);
      var cls = 'rack' + (selectedBlock === b.id ? ' selected' : '') + (highlightBlocks[b.id] ? ' highlight' : '');
      s += '<g class="' + cls + '" data-id="' + b.id + '">';
      var col = blockColor(b, placement);
      var gids = b.groupIds;
      if (col) {
        s += '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.d + '" fill="' + col + '"/>';
      } else if (!gids.length) {
        s += '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.d + '" fill="#d8dee8"/>';
      } else {
        var seg = b.w / gids.length;
        gids.forEach(function (gid, i) {
          s += '<rect x="' + (b.x + seg * i) + '" y="' + b.y + '" width="' + seg + '" height="' + b.d + '" fill="' + groupOf(gid).color + '"/>';
        });
      }
      s += '<rect class="body" x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.d + '" fill="none"/>';

      var cx = b.x + b.w / 2, cy = b.y + b.d / 2;
      var names = gids.map(function (id) { return groupOf(id).short; }).join('+');
      s += '<g text-anchor="middle" font-size="0.52" fill="#0d1b2e">';
      s += '<text x="' + cx + '" y="' + (cy - 0.12) + '" font-weight="700">' + esc(b.label) + ' · ' + pct + '%</text>';
      if (names) s += '<text x="' + cx + '" y="' + (cy + 0.55) + '">' + esc(names.length > 22 ? names.slice(0, 21) + '…' : names) + '</text>';
      s += '</g></g>';
    });

    // thước
    s += '<g font-size="0.65" fill="#6b7a8c"><line x1="0" y1="' + (CFG.depth + 1.8) + '" x2="10" y2="' + (CFG.depth + 1.8) + '" stroke="#6b7a8c" stroke-width="0.1"/>' +
      '<text x="10.4" y="' + (CFG.depth + 2.05) + '">10m — kho ' + CFG.depth + '×' + CFG.width + 'm, ô lưới 1m</text></g>';

    s += '</svg>';
    $('mapHost').innerHTML = s;
    bindMapEvents();
  }

  // ---------- Kéo thả + click ----------
  function svgPoint(evt) {
    var svg = $('floorSvg');
    var pt = new DOMPoint(evt.clientX, evt.clientY);
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function bindMapEvents() {
    var svg = $('floorSvg');
    if (editMode) svg.classList.add('edit-mode');
    svg.querySelectorAll('.rack').forEach(function (g) {
      var id = g.getAttribute('data-id');
      var dragging = false, moved = false, start = null, p0 = null;

      g.addEventListener('pointerdown', function (e) {
        if (!editMode) return;
        dragging = true; moved = false;
        start = svgPoint(e);
        var b = blockOf(id);
        p0 = { x: b.x, y: b.y };
        g.classList.add('dragging');
        g.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      g.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var p = svgPoint(e);
        var dx = p.x - start.x, dy = p.y - start.y;
        if (Math.abs(dx) + Math.abs(dy) > 0.15) moved = true;
        var b = blockOf(id);
        var nx = Math.round((p0.x + dx) * 2) / 2, ny = Math.round((p0.y + dy) * 2) / 2;
        nx = Math.max(0.2, Math.min(CFG.width - b.w - 0.2, nx));
        ny = Math.max(0.2, Math.min(CFG.depth - b.d - 0.2, ny));
        g.setAttribute('transform', 'translate(' + (nx - p0.x) + ' ' + (ny - p0.y) + ')');
        g._nx = nx; g._ny = ny;
      });
      g.addEventListener('pointerup', function () {
        if (!dragging) return;
        dragging = false;
        g.classList.remove('dragging');
        if (moved) {
          var b = blockOf(id);
          b.x = (typeof g._nx === 'number') ? g._nx : b.x;
          b.y = (typeof g._ny === 'number') ? g._ny : b.y;
          save();
          renderAll();
        }
      });
      g.addEventListener('click', function () {
        if (moved) { moved = false; return; }
        selectedBlock = (selectedBlock === id) ? null : id;
        renderAll();
      });
    });
  }

  // ---------- Panel chi tiết lô ----------
  function renderDetail() {
    var panel = $('detailPanel');
    if (!selectedBlock) { panel.classList.add('hidden'); return; }
    var b = blockOf(selectedBlock);
    if (!b) { selectedBlock = null; panel.classList.add('hidden'); return; }
    panel.classList.remove('hidden');

    var placement = computePlacement();
    var used = placement.blockUsed[b.id] || 0;
    var pct = blockFillPct(b, placement);
    var ceil = blockCeiling(b);

    $('detailName').textContent = 'Lô ' + b.label;
    $('detailMeta').textContent = b.w + '×' + b.d + 'm (' + blockArea(b).toFixed(0) + 'm²) · vị trí (' + b.x + ', ' + b.y + ')m';

    var html = '';
    html += '<div class="kv">' +
      '<div class="cell">Trần tại đây<b>' + ceil.toFixed(2) + ' m</b></div>' +
      '<div class="cell">Chồng treo tường<b>' + layersFor(b, 'S') + ' lớp</b></div>' +
      '<div class="cell">Diện tích dùng<b>' + used.toFixed(1) + ' / ' + blockArea(b).toFixed(0) + ' m²</b></div>' +
      '<div class="cell">Lấp đầy<b>' + pct + '%</b></div></div>';
    html += '<div class="fillbar' + (pct > 100 ? ' crit' : pct > 85 ? ' warn' : '') + '"><div style="width:' + Math.min(100, pct) + '%"></div></div>';

    html += '<p style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase">Nhóm hàng trên lô (tối đa 3 — bấm để gán/bỏ)</p><div class="chips">';
    GROUPS.forEach(function (g) {
      var on = b.groupIds.indexOf(g.id) !== -1;
      html += '<span class="chip' + (on ? ' on' : '') + '" data-group="' + g.id + '"' + (on ? ' style="background:' + g.color + '"' : '') + '>' + esc(g.short) + '</span>';
    });
    html += '</div>';

    html += '<div class="note">📌 Chồng tối đa tại lô này: treo tường <b>' + layersFor(b, 'S') + '</b> lớp · máy vừa <b>' + layersFor(b, 'M') +
      '</b> · máy lớn <b>' + layersFor(b, 'L') + '</b> · VRV/máy ≥5HP <b>không chồng</b>. Máy nặng luôn nằm dưới.</div>';

    if (editMode) {
      html += '<div class="detail-actions">' +
        '<button class="btn ghost" id="btnRotate">⟳ Xoay lô</button>' +
        '<button class="btn red" id="btnDelete">🗑 Xoá lô</button></div>';
    }

    var items = placement.blockItems[b.id].slice().sort(function (a, c) { return c.qty - a.qty; });
    html += '<table class="inv-table"><thead><tr><th>Model trên lô (' + items.length + ')</th><th>SL</th></tr></thead><tbody>';
    if (!items.length) html += '<tr><td colspan="2" style="color:var(--muted)">Lô trống — gán nhóm hàng ở trên.</td></tr>';
    items.slice(0, 80).forEach(function (it) {
      var m = it.model;
      var tag = m.size === 'X' ? '<span class="tag heavy">MÁY LỚN · SÀN</span>' :
        m.size === 'L' ? '<span class="tag heavy">NẶNG</span>' : '';
      html += '<tr><td>' + esc(m.name) + tag +
        '<div class="p-sku">' + esc(m.sku) + ' · ' + esc(CAT_LABEL[m.cat] || m.cat) + ' · ' + esc(m.brand) + '</div></td>' +
        '<td><b class="qty-edit" title="Bấm để sửa số lượng" data-key="' + esc(m.sku + '|' + m.name) + '">' + it.qty + '</b></td></tr>';
    });
    if (items.length > 80) html += '<tr><td colspan="2" class="p-sku">… và ' + (items.length - 80) + ' model nữa</td></tr>';
    html += '</tbody></table>';

    $('detailBody').innerHTML = html;

    $('detailBody').querySelectorAll('.chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var gid = chip.getAttribute('data-group');
        var i = b.groupIds.indexOf(gid);
        if (i !== -1) b.groupIds.splice(i, 1);
        else if (b.groupIds.length >= 3) { alert('Mỗi lô tối đa 3 nhóm hàng cho dễ tìm. Bỏ bớt 1 nhóm trước.'); return; }
        else b.groupIds.push(gid);
        save(); renderAll();
      });
    });
    $('detailBody').querySelectorAll('.qty-edit').forEach(function (el) {
      el.addEventListener('click', function () {
        var key = el.getAttribute('data-key');
        var v = prompt('Số lượng tồn mới (0 = hết hàng, bỏ khỏi sơ đồ):', el.textContent);
        if (v === null) return;
        var n = parseInt(v, 10);
        if (isNaN(n) || n < 0) return;
        updateQty(key, n);
      });
    });
    var rot = $('btnRotate');
    if (rot) rot.addEventListener('click', function () {
      var t = b.w; b.w = b.d; b.d = t;
      b.x = Math.min(b.x, CFG.width - b.w - 0.2);
      b.y = Math.min(b.y, CFG.depth - b.d - 0.2);
      save(); renderAll();
    });
    var del = $('btnDelete');
    if (del) del.addEventListener('click', function () {
      if (!confirm('Xoá lô ' + b.label + '? Hàng trên lô sẽ thành "chưa xếp".')) return;
      state.blocks = state.blocks.filter(function (x) { return x.id !== b.id; });
      selectedBlock = null;
      save(); renderAll();
    });
  }

  // ---------- Sidebar ----------
  function renderGroupList() {
    var ul = $('brandList');
    ul.innerHTML = '';
    GROUPS.forEach(function (g) {
      var li = document.createElement('li');
      if (activeGroup === g.id) li.className = 'active';
      li.innerHTML = '<span class="swatch" style="background:' + g.color + '"></span>' + esc(g.label) +
        '<span class="b-meta">' + g.items.length + ' model · ' + g.qty + '</span>';
      li.addEventListener('click', function () {
        activeGroup = (activeGroup === g.id) ? null : g.id;
        highlightBlocks = {};
        if (activeGroup) {
          state.blocks.forEach(function (b) { if (b.groupIds.indexOf(g.id) !== -1) highlightBlocks[b.id] = true; });
        }
        renderAll();
      });
      ul.appendChild(li);
    });
  }

  var CHECKLIST = [
    { group: '1. Sàng lọc' },
    { id: 's1', text: 'Lập danh sách hàng tồn lâu (catalog có 1259 mã đã hết/bán chậm) để thanh lý' },
    { id: 's2', text: 'Hàng lỗi / trả bảo hành gom về 1 lô riêng, không lẫn hàng bán' },
    { group: '2. Sắp xếp' },
    { id: 's3', text: 'Kẻ vạch sơn lối đi chính 4m (Bắc–Nam) + lối ngang 4m (ra cửa Tây), tuyệt đối không để hàng' },
    { id: 's4', text: 'VRV/VRF, máy ≥5HP, tủ đứng: để sàn sát cửa Tây, KHÔNG chồng, chừa lối xe nâng' },
    { id: 's5', text: 'Treo tường chồng tối đa 8 lớp giữa kho (trần 5m), 7 lớp sát tường (4m); thùng nặng nằm dưới' },
    { id: 's6', text: 'Phụ kiện, remote, hàng linh tinh: đưa về gần văn phòng, có khoá/tủ riêng' },
    { id: 's7', text: 'In sơ đồ này dán ở 3 cửa + văn phòng; dán nhãn lô L1–L25 xuống sàn' },
    { group: '3. Sạch sẽ' },
    { id: 's8', text: 'Quét sàn + hút bụi nóc kiện mỗi tuần; kiểm tra dột sau mưa (nhất là 2 mép trần 4m)' },
    { group: '4. Săn sóc' },
    { id: 's9', text: 'Cập nhật file BÁO CÁO hằng ngày rồi chạy lại tools/xlsx_to_data.py để sơ đồ khớp tồn thật' },
    { id: 's10', text: 'Kiểm kê chéo mỗi tháng theo từng lô' },
    { group: '5. Sẵn sàng' },
    { id: 's11', text: 'Phân công mỗi nhân viên kho phụ trách dãy lô cụ thể' }
  ];

  function renderChecklist() {
    var ul = $('checklist');
    ul.innerHTML = '';
    CHECKLIST.forEach(function (item) {
      var li = document.createElement('li');
      if (item.group) {
        li.className = 'cl-group';
        li.textContent = item.group;
      } else {
        var done = !!state.checked[item.id];
        li.innerHTML = '<input type="checkbox" ' + (done ? 'checked' : '') + '> <span class="' + (done ? 'done' : '') + '">' + esc(item.text) + '</span>';
        li.querySelector('input').addEventListener('change', function (e) {
          state.checked[item.id] = e.target.checked;
          save(); renderChecklist();
        });
      }
      ul.appendChild(li);
    });
  }

  // ---------- Tìm kiếm ----------
  function renderSearch(q) {
    var box = $('searchResults');
    q = q.trim().toLowerCase();
    if (!q) {
      box.classList.add('hidden'); box.innerHTML = '';
      if (!activeGroup) { highlightBlocks = {}; renderMap(); }
      return;
    }
    var placement = computePlacement();
    var hits = ITEMS.filter(function (m) {
      return m.sku.toLowerCase().indexOf(q) !== -1 || m.name.toLowerCase().indexOf(q) !== -1 || m.brand.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 10);

    box.classList.remove('hidden');
    if (!hits.length) { box.innerHTML = '<div class="sr-empty">Không tìm thấy trong hàng còn tồn.</div>'; return; }
    box.innerHTML = '';
    highlightBlocks = {};
    hits.forEach(function (m) {
      var bid = placement.modelLoc[m.sku + '|' + m.name];
      if (bid) highlightBlocks[bid] = true;
      var loc = bid ? 'Lô <span class="sr-loc">' + blockOf(bid).label + '</span>' : '<span style="color:var(--red)">chưa xếp</span>';
      var div = document.createElement('div');
      div.className = 'sr-item';
      div.innerHTML = '<b>' + esc(m.name) + '</b><br>' + esc(m.sku) + ' · tồn <b>' + m.qty + '</b> · ' + loc;
      div.addEventListener('click', function () { if (bid) { selectedBlock = bid; renderAll(); } });
      box.appendChild(div);
    });
    renderMap();
  }

  // ---------- Thống kê ----------
  function renderStats(placement) {
    var units = ITEMS.reduce(function (a, m) { return a + m.qty; }, 0);
    var area = state.blocks.reduce(function (a, b) { return a + blockArea(b); }, 0);
    var used = Object.keys(placement.blockUsed).reduce(function (a, k) { return a + placement.blockUsed[k]; }, 0);
    var ovr = placement.overflow.reduce(function (a, o) { return a + o.qty; }, 0);
    $('statBrands').textContent = GROUPS.length;
    $('statModels').textContent = ITEMS.length;
    $('statUnits').textContent = units;
    $('statFill').textContent = area ? Math.round(used / area * 100) + '%' : '—';
    $('statOverflow').textContent = ovr;
  }

  function renderAll() {
    var placement = computePlacement();
    renderStats(placement);
    renderGroupList();
    renderMap();
    renderDetail();
  }

  // ---------- Nạp dữ liệu động: Excel/CSV/Google Sheet -> tự xếp lại ----------
  var MISC_BRANDS = ['MÁY NƯỚC NÓNG', 'TỦ LẠNH- TỦ ĐÔNG', 'MÁY GIẶT', 'TIVI', 'NỒI -CHẢO', 'BẾP', 'ẤM ĐUN', 'QUẠT', 'MÔ HÌNH', 'NÓN BH +ÁO'];
  var ACCESSORY_BRANDS = ['PHỤ KIỆN MÁY LẠNH'];

  function stripAccents(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  // Phân loại model từ tên hàng (bản JS của tools/xlsx_to_data.py — giữ 2 bên giống nhau)
  function classify(brand, name) {
    var n = stripAccents(String(name).toUpperCase());
    if (ACCESSORY_BRANDS.indexOf(brand) !== -1 || /MAT NA|REMOTE|BO DIEU KHIEN|BO LOE/.test(n)) return ['phukien', 'S'];
    if (MISC_BRANDS.indexOf(brand) !== -1) return ['linhtinh', 'S'];
    if (n.indexOf('VRV') !== -1 || n.indexOf('VRF') !== -1) return ['vrv', 'X'];

    var hp = 0;
    var m = n.match(/(\d+(?:[\.,]\d+)?)\s*HP/);
    if (m) hp = parseFloat(m[1].replace(',', '.'));
    var bigCode = /(?:^|\D)(100|125|140|160|200|250)(?:\D|$)/.test(n);

    var cat;
    if (n.indexOf('TU DUNG') !== -1) cat = 'tudung';
    else if (n.indexOf('GIAU') !== -1) cat = 'giautran';
    else if (n.indexOf('AM TRAN') !== -1) cat = 'amtran';
    else if (n.indexOf('AP TRAN') !== -1) cat = 'aptran';
    else if (n.indexOf('MULTI') !== -1) cat = 'multi';
    else if (n.indexOf('TREO TUONG') !== -1) cat = 'treo';
    else if (n.indexOf('DAN NONG') !== -1) cat = 'dannong';
    else cat = 'khac';

    var size;
    if (hp >= 5 || (bigCode && cat !== 'treo' && cat !== 'khac')) size = 'X';
    else if (cat === 'tudung' || cat === 'giautran') size = 'L';
    else if (cat === 'amtran' || cat === 'aptran' || cat === 'dannong' || cat === 'multi') size = 'M';
    else size = 'S';
    return [cat, size];
  }

  function toNum(x) {
    var v = parseFloat(String(x == null ? '' : x).replace(/,/g, '.'));
    return isNaN(v) ? 0 : v;
  }

  // rows (mảng 2 chiều, cùng bố cục sheet TỒN KHO) -> raw items
  // Cột: A hãng (chỉ dòng đầu nhóm) · B mã · C tên hàng · D TỔNG TỒN CUỐI · I XUẤT
  function rowsToRaw(rows) {
    var hi = -1;
    for (var i = 0; i < Math.min(rows.length, 10); i++) {
      var joined = (rows[i] || []).map(function (c) { return stripAccents(String(c || '').toUpperCase()); }).join('|');
      if (joined.indexOf('TONG TON CUOI') !== -1) { hi = i; break; }
    }
    if (hi === -1) return null;
    var raw = [], brand = null;
    for (var r = hi + 1; r < rows.length; r++) {
      var row = rows[r] || [];
      var a = row[0], sku = row[1], name = row[2];
      if (a && String(a).trim() && String(a).trim() !== 'TỔNG') brand = String(a).trim();
      if (!sku && !name) continue;
      var qty = toNum(row[3]);
      if (qty <= 0) continue;
      name = String(name || '').replace(/\s+/g, ' ').trim();
      sku = String(sku || '').replace(/\s+/g, ' ').trim() || name.slice(0, 20);
      var cs = classify(brand, name);
      raw.push([brand, sku, name, Math.round(qty), Math.round(toNum(row[8])), cs[0], cs[1]]);
    }
    return raw;
  }

  function parseCSV(text) {
    var rows = [], row = [], cur = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cur); rows.push(row); row = []; cur = '';
      } else cur += c;
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }

  // Nạp bộ tồn kho mới -> TỰ CHẠY LẠI GỢI Ý XẾP KHO -> lưu + vẽ lại
  function applyRawItems(raw, label, silent) {
    state.items = raw;
    state.dataLabel = label;
    ITEMS = rawToItems(raw);
    GROUPS = buildGroups();
    state.blocks.forEach(function (b) {
      b.groupIds = (b.groupIds || []).filter(function (id) { return groupOf(id); });
    });
    runOptimize(state, !!silent); // sơ đồ tự điều chỉnh theo số mới
    save();
    updateDataLabel();
    renderAll();
  }

  function updateDataLabel() {
    var el = $('dataLabel');
    if (el) el.textContent = state.dataLabel || 'báo cáo 10/07/2026 (mặc định)';
  }

  // Sửa số lượng 1 model ngay trong app -> sơ đồ tự điều chỉnh
  function updateQty(key, newQty) {
    if (!state.items) state.items = ITEMS.map(function (m) { return [m.brand, m.sku, m.name, m.qty, m.out, m.cat, m.size]; });
    var hit = null;
    state.items.forEach(function (r) { if (r[1] + '|' + r[2] === key) hit = r; });
    if (!hit) return;
    hit[3] = newQty;
    state.items = state.items.filter(function (r) { return r[3] > 0; });
    ITEMS = rawToItems(state.items);
    GROUPS = buildGroups();
    state.blocks.forEach(function (b) {
      b.groupIds = (b.groupIds || []).filter(function (id) { return groupOf(id); });
    });
    // chỉ tự chạy lại gợi ý khi hết chỗ, để không xáo trộn sơ đồ ngoài ý muốn
    if (computePlacement().overflow.length) runOptimize(state, true);
    save();
    renderAll();
  }

  $('btnImport').addEventListener('click', function () { $('fileInput').click(); });
  $('fileInput').addEventListener('change', function () {
    var f = this.files[0];
    this.value = '';
    if (!f) return;
    var reader = new FileReader();
    if (/\.csv$/i.test(f.name)) {
      reader.onload = function () {
        var raw = rowsToRaw(parseCSV(String(reader.result)));
        if (!raw || !raw.length) { alert('Không tìm thấy cột "TỔNG TỒN CUỐI" trong file CSV. Xuất đúng sheet TỒN KHO nhé.'); return; }
        applyRawItems(raw, 'file ' + f.name);
      };
      reader.readAsText(f);
    } else {
      reader.onload = function () {
        try {
          var wb = XLSX.read(new Uint8Array(reader.result), { type: 'array' });
          var raw = null;
          for (var i = 0; i < wb.SheetNames.length && !raw; i++) {
            var rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[i]], { header: 1, raw: true, defval: '' });
            raw = rowsToRaw(rows);
          }
          if (!raw || !raw.length) { alert('Không tìm thấy sheet TỒN KHO (cột "TỔNG TỒN CUỐI") trong file Excel.'); return; }
          applyRawItems(raw, 'file ' + f.name);
        } catch (e) {
          alert('Không đọc được file Excel: ' + e.message);
        }
      };
      reader.readAsArrayBuffer(f);
    }
  });

  function syncSheet(url, silent) {
    return fetch(url)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function (t) {
        var raw = rowsToRaw(parseCSV(t));
        if (!raw || !raw.length) throw new Error('không thấy cột "TỔNG TỒN CUỐI" — hãy xuất bản đúng trang TỒN KHO dạng CSV');
        state.sheetUrl = url;
        applyRawItems(raw, 'Google Sheet · đồng bộ ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), silent);
      })
      .catch(function (e) {
        if (!silent) alert('Không đồng bộ được Google Sheet: ' + e.message +
          '\n\nCách lấy link đúng:\n1. Mở Google Sheet chứa tab TỒN KHO\n2. Tệp → Chia sẻ → Xuất bản lên web\n3. Chọn trang "TỒN KHO" + định dạng CSV → Xuất bản\n4. Dán link đó vào đây');
      });
  }

  $('btnSheet').addEventListener('click', function () {
    var url = prompt(
      'Dán link CSV của Google Sheet (Tệp → Chia sẻ → Xuất bản lên web → chọn trang TỒN KHO → CSV).\n' +
      'App sẽ tự kéo số tồn mới và tự xếp lại sơ đồ mỗi lần mở.\n\nĐể trống rồi OK nếu muốn ngắt kết nối.',
      state.sheetUrl || '');
    if (url === null) return;
    url = url.trim();
    if (!url) {
      delete state.sheetUrl;
      save();
      alert('Đã ngắt kết nối Google Sheet.');
      return;
    }
    syncSheet(url, false);
  });

  $('btnExport').addEventListener('click', function () {
    var placement = computePlacement();
    var out = {
      generated: new Date().toISOString(),
      source: state.dataLabel || 'báo cáo 10/07/2026 (mặc định)',
      warehouse: { width_m: CFG.width, depth_m: CFG.depth, ceiling_wall_m: CFG.hWall, ceiling_max_m: CFG.hMax, doors: DOORS, office: OFFICE },
      blocks: state.blocks.map(function (b) {
        return {
          id: b.id, label: b.label, x: b.x, y: b.y, w: b.w, d: b.d,
          area_m2: blockArea(b), used_m2: +((placement.blockUsed[b.id] || 0).toFixed(1)),
          ceiling_m: +blockCeiling(b).toFixed(2),
          groups: b.groupIds.map(function (id) { return groupOf(id).label; }),
          items: placement.blockItems[b.id].map(function (it) {
            return { brand: it.model.brand, sku: it.model.sku, name: it.model.name, qty: it.qty, cat: it.model.cat, size: it.model.size };
          })
        };
      }),
      unplaced: placement.overflow.map(function (o) { return { sku: o.model.sku, name: o.model.name, qty: o.qty }; })
    };
    var blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'so-do-kho.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // ---------- Toolbar ----------
  $('colorMode').addEventListener('change', function () { colorMode = this.value; renderMap(); });

  $('btnOptimize').addEventListener('click', function () {
    runOptimize(state, false);
    save();
    renderAll();
  });

  $('btnEdit').addEventListener('click', function () {
    editMode = !editMode;
    this.classList.toggle('active', editMode);
    this.textContent = editMode ? '✔ Xong' : '✎ Sửa sơ đồ';
    $('mapHint').textContent = editMode
      ? 'Chế độ sửa: kéo thả lô (bám lưới 0.5m) · bấm lô để xoay/xoá · nút ＋ Thêm lô trên thanh công cụ'
      : 'Bấm vào lô hàng để xem chi tiết · kéo thả lô ở chế độ ✎ Sửa sơ đồ';
    if (editMode && !$('btnAddRack')) {
      var btn = document.createElement('button');
      btn.className = 'btn green'; btn.id = 'btnAddRack'; btn.textContent = '＋ Thêm lô';
      btn.addEventListener('click', function () {
        var n = 1;
        while (blockOf('b' + n)) n++;
        state.blocks.push({ id: 'b' + n, label: 'L' + n, x: CFG.width / 2 - 3, y: CFG.depth / 2 - 2, w: 6, d: 4, groupIds: [] });
        selectedBlock = 'b' + n;
        save(); renderAll();
      });
      this.parentNode.insertBefore(btn, this.nextSibling);
    } else if (!editMode) {
      var b = $('btnAddRack');
      if (b) b.remove();
    }
    renderAll();
  });

  $('btnReset').addEventListener('click', function () {
    if (!confirm('Xoá bố trí đã chỉnh và quay về sơ đồ gợi ý mặc định (25 lô)? Dữ liệu tồn kho đã nạp vẫn giữ nguyên.')) return;
    var keepItems = state.items, keepLabel = state.dataLabel, keepUrl = state.sheetUrl;
    state = defaultState();
    if (keepItems) state.items = keepItems;
    if (keepLabel) state.dataLabel = keepLabel;
    if (keepUrl) state.sheetUrl = keepUrl;
    selectedBlock = null; activeGroup = null; highlightBlocks = {};
    save();
    renderAll();
  });

  $('searchInput').addEventListener('input', function () { renderSearch(this.value); });
  $('btnCloseDetail').addEventListener('click', function () { selectedBlock = null; renderAll(); });
  $('btnModalClose').addEventListener('click', function () { $('modal').classList.add('hidden'); });
  $('modal').addEventListener('click', function (e) { if (e.target === this) $('modal').classList.add('hidden'); });

  // ---------- Khởi động ----------
  renderChecklist();
  updateDataLabel();
  renderAll();
  // có kết nối Google Sheet -> tự kéo số tồn mới nhất rồi tự xếp lại
  if (state.sheetUrl) syncSheet(state.sheetUrl, true);
})();
