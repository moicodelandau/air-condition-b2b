/* Sơ Đồ Kho Điều Hòa – bản đồ mặt bằng bên trong kho.
 * - Trần dốc: cao nhất (tường sau) -> thấp nhất (tường trước); số tầng kệ tính theo độ cao trần tại vị trí kệ.
 * - 3 cửa: nhập, xuất chính, phụ. Thuật toán tối ưu xếp hãng bán chạy gần cửa xuất.
 * - Dữ liệu bố trí kệ + checklist lưu localStorage. Đơn vị: mét. */
(function () {
  'use strict';

  var STORAGE_KEY = 'ac-warehouse-floor-v1';

  // ---------- Cấu hình kho ----------
  var DEFAULT_CONFIG = {
    width: 30,   // chiều rộng (m, trục x)
    depth: 20,   // chiều sâu (m, trục y)
    hMax: 5.0,   // trần cao nhất – tại tường sau (y = 0)
    hMin: 3.5    // trần thấp nhất – tại tường trước (y = depth)
  };
  var LEVEL_H = 1.1;      // mỗi tầng kệ ~1.1m (kiện máy + kệ)
  var CLEARANCE = 0.4;    // khoảng hở an toàn dưới trần
  var UNITS_PER_M = 3;    // số kiện máy xếp được trên 1m dài kệ / tầng

  // Cửa: side N/S/E/W, frac = vị trí tương đối dọc tường (0-1), width (m)
  var DOORS = [
    { id: 'c1', name: 'Cửa nhập (C1)', side: 'W', frac: 0.125, width: 3, color: '#16a34a' },
    { id: 'c2', name: 'Cửa xuất chính (C2)', side: 'S', frac: 0.5, width: 4, color: '#1668dc' },
    { id: 'c3', name: 'Cửa phụ (C3)', side: 'E', frac: 0.78, width: 1.6, color: '#d97706' }
  ];

  // Khu vực sàn (toạ độ tương đối theo kích thước kho để tự co giãn)
  var ZONES = [
    { id: 'recv', lines: ['Khu nhận &', 'kiểm hàng'], fx: .017, fy: .025, fw: .133, fh: .25, fill: '#dbeafe', stroke: '#1668dc' },
    { id: 'ship', lines: ['Khu tập kết xuất'], fx: .333, fy: .825, fw: .334, fh: .15, fill: '#dcfce7', stroke: '#16a34a' },
    { id: 'defect', lines: ['Hàng lỗi /', 'bảo hành'], fx: .85, fy: .025, fw: .133, fh: .21, fill: '#fee2e2', stroke: '#dc2626' },
    { id: 'acc', lines: ['Phụ kiện', '& vật tư'], fx: .867, fy: .64, fw: .117, fh: .33, fill: '#fef9c3', stroke: '#d97706' }
  ];

  // ---------- Hãng (19 hãng) ----------
  // [id, tên, tên ngắn, độ bán chạy 1-5, seri treo tường 1, seri treo tường 2]
  var BRAND_DEFS = [
    ['daikin', 'Daikin', 'Daikin', 5, 'FTKA', 'FTKY'],
    ['panasonic', 'Panasonic', 'Pana', 5, 'XU', 'PU'],
    ['casper', 'Casper', 'Casper', 5, 'GC', 'SC'],
    ['lg', 'LG', 'LG', 4, 'V', 'B'],
    ['midea', 'Midea', 'Midea', 4, 'MSAF', 'MSAG'],
    ['gree', 'Gree', 'Gree', 4, 'GWC', 'CHARM'],
    ['aqua', 'Aqua', 'Aqua', 3, 'AQA-KCR', 'AQA-RV'],
    ['sharp', 'Sharp', 'Sharp', 3, 'AH-X', 'AH-A'],
    ['toshiba', 'Toshiba', 'Toshiba', 3, 'RAS-H', 'RAS-U'],
    ['samsung', 'Samsung', 'Samsung', 3, 'AR-TY', 'AR-BY'],
    ['mitsuele', 'Mitsubishi Electric', 'Mitsu E', 3, 'MSY-JW', 'MS-JS'],
    ['mitsuheavy', 'Mitsubishi Heavy', 'Mitsu H', 2, 'SRK-YXP', 'SRK-CS'],
    ['hitachi', 'Hitachi', 'Hitachi', 2, 'RAK-DJ', 'RAK-F'],
    ['electrolux', 'Electrolux', 'Electrolux', 2, 'ESV-CRO', 'ESM-CRM'],
    ['funiki', 'Funiki', 'Funiki', 2, 'HIC', 'SIC'],
    ['nagakawa', 'Nagakawa', 'Nagakawa', 2, 'NIS-C', 'NS-C'],
    ['sumikura', 'Sumikura', 'Sumikura', 1, 'APS/APO-092', 'APS/APO-H'],
    ['reetech', 'Reetech', 'Reetech', 1, 'RT-RC', 'RTV-BF'],
    ['tcl', 'TCL', 'TCL', 1, 'TAC-XA', 'TAC-XAB']
  ];

  var PALETTE = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2',
    '#7f7f7f', '#bcbd22', '#17becf', '#3b82f6', '#f59e0b', '#10b981', '#ef4444',
    '#8b5cf6', '#f97316', '#14b8a6', '#a855f7', '#65a30d'
  ];

  // ---------- RNG có seed (dữ liệu mẫu ổn định) ----------
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // ---------- Sinh danh mục hãng + ~300 model ----------
  var BRANDS = BRAND_DEFS.map(function (d, i) {
    return { id: d[0], name: d[1], short: d[2], vel: d[3], s1: d[4], s2: d[5], color: PALETTE[i % PALETTE.length] };
  });

  function genModels() {
    var rnd = mulberry32(20260708);
    var models = [];
    var HPS = [1.0, 1.5, 2.0, 2.5];
    BRANDS.forEach(function (b) {
      function add(sku, name, type, heavy) {
        var qty = Math.floor(rnd() * (2.2 + b.vel * 1.1));
        models.push({ sku: sku, brand: b.id, name: name, type: type, heavy: !!heavy, qty: qty });
      }
      HPS.forEach(function (hp) {
        add(b.short.toUpperCase().replace(/\s/g, '') + '-' + b.s1 + Math.round(hp * 10),
          b.name + ' ' + b.s1 + Math.round(hp * 10) + ' ' + hp + 'HP Inverter', 'Treo tường');
      });
      HPS.forEach(function (hp) {
        add(b.short.toUpperCase().replace(/\s/g, '') + '-' + b.s2 + Math.round(hp * 10),
          b.name + ' ' + b.s2 + Math.round(hp * 10) + ' ' + hp + 'HP Mono', 'Treo tường');
      });
      if (b.vel >= 2) { // hầu hết hãng có thêm dòng cao cấp
        HPS.forEach(function (hp) {
          add(b.short.toUpperCase().replace(/\s/g, '') + '-PR' + Math.round(hp * 10),
            b.name + ' Premium ' + hp + 'HP Inverter WiFi', 'Treo tường');
        });
      }
      [2.5, 5.0].forEach(function (hp) {
        add(b.short.toUpperCase().replace(/\s/g, '') + '-TD' + Math.round(hp * 10),
          b.name + ' tủ đứng ' + hp + 'HP', 'Tủ đứng', true);
      });
      [2.0, 3.0].forEach(function (hp) {
        add(b.short.toUpperCase().replace(/\s/g, '') + '-CT' + Math.round(hp * 10),
          b.name + ' âm trần cassette ' + hp + 'HP', 'Âm trần', true);
      });
    });
    return models;
  }

  var MODELS = genModels();

  // ---------- Bố trí kệ mặc định (kho 30 x 20m) ----------
  function defaultRacks() {
    var defs = [
      // [x, y, w(dài theo x), d(sâu theo y)]
      [5.5, 1.0, 8, 1.2], [15.5, 1.0, 8, 1.2],                    // hàng 1 – trần ~5m, kệ 4 tầng
      [1.0, 4.8, 8, 1.2], [11.0, 4.8, 8, 1.2], [21.0, 4.8, 8, 1.2],
      [1.0, 8.6, 8, 1.2], [11.0, 8.6, 8, 1.2], [21.0, 8.6, 8, 1.2],
      [1.0, 12.4, 8, 1.2], [11.0, 12.4, 8, 1.2], [21.0, 12.4, 4, 1.2],
      [1.0, 16.6, 7.5, 1.2], [21.0, 16.6, 4, 1.2]                 // hàng cuối – trần ~3.6m, kệ 2 tầng
    ];
    return defs.map(function (d, i) {
      return { id: 'k' + (i + 1), label: 'K' + (i + 1), x: d[0], y: d[1], w: d[2], d: d[3], brandIds: [] };
    });
  }

  var CHECKLIST = [
    { group: '1. Sàng lọc' },
    { id: 's1', text: 'Gom máy lỗi / trưng bày / trả bảo hành về khu Hàng lỗi, không để lẫn trên kệ bán' },
    { id: 's2', text: 'Lập danh sách hàng tồn quá 12 tháng để thanh lý / khuyến mãi' },
    { group: '2. Sắp xếp' },
    { id: 's3', text: 'Dán nhãn kệ (K1–K13) và in sơ đồ này dán ở 3 cửa' },
    { id: 's4', text: 'Máy nặng (tủ đứng, âm trần) chỉ để tầng 1; máy treo tường nhẹ để tầng trên' },
    { id: 's5', text: 'Hãng bán chạy xếp gần Cửa xuất chính (C2) — bấm ⚡ Tối ưu sắp xếp' },
    { id: 's6', text: 'Lối đi giữa các kệ giữ trống ≥ 2.5m, không để hàng chắn 3 cửa' },
    { group: '3. Sạch sẽ' },
    { id: 's7', text: 'Quét sàn, hút bụi nóc kiện hàng mỗi tuần' },
    { id: 's8', text: 'Kiểm tra dột / ẩm khu trần thấp 3.5m (gần tường trước) sau mưa' },
    { group: '4. Săn sóc' },
    { id: 's9', text: 'Kiểm kê chéo mỗi tháng, đối chiếu số tồn với sơ đồ' },
    { id: 's10', text: 'Đổi vị trí kệ xong phải cập nhật lại sơ đồ ngay' },
    { group: '5. Sẵn sàng' },
    { id: 's11', text: 'Phân công mỗi nhân viên phụ trách 1 dãy kệ cụ thể' }
  ];

  // ---------- State ----------
  function defaultState() {
    var st = {
      config: JSON.parse(JSON.stringify(DEFAULT_CONFIG)),
      racks: defaultRacks(),
      checked: {}
    };
    runOptimize(st, true); // bố trí mặc định = kết quả tối ưu
    return st;
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var st = JSON.parse(raw);
        if (st && st.racks && st.config) return st;
      }
    } catch (e) { /* dữ liệu hỏng -> dùng mặc định */ }
    return defaultState();
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* hết quota */ }
  }

  var state = load();
  var selectedRack = null;
  var highlightRacks = {};   // rackId -> true (kết quả tìm kiếm / lọc hãng)
  var activeBrand = null;
  var editMode = false;
  var colorMode = 'brand';

  // ---------- Helpers ----------
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function brandOf(id) { return BRANDS.filter(function (b) { return b.id === id; })[0]; }
  function rackOf(id) { return state.racks.filter(function (r) { return r.id === id; })[0]; }

  function ceilingAt(y) {
    var c = state.config;
    return c.hMax + (c.hMin - c.hMax) * (y / c.depth);
  }
  function rackCeiling(r) { return ceilingAt(r.y + r.d / 2); }
  function rackLevels(r) {
    var lv = Math.floor((rackCeiling(r) - CLEARANCE) / LEVEL_H);
    return Math.max(1, Math.min(5, lv));
  }
  function rackLength(r) { return Math.max(r.w, r.d); }
  function rackCapacity(r) { return Math.round(rackLength(r) * UNITS_PER_M) * rackLevels(r); }

  function doorRect(door) {
    var c = state.config, t = 0.5; // độ dày vẽ cửa
    var len = (door.side === 'N' || door.side === 'S') ? c.width : c.depth;
    var pos = Math.max(0.3, Math.min(len - door.width - 0.3, door.frac * len - door.width / 2));
    switch (door.side) {
      case 'N': return { x: pos, y: -t / 2, w: door.width, h: t };
      case 'S': return { x: pos, y: c.depth - t / 2, w: door.width, h: t };
      case 'W': return { x: -t / 2, y: pos, w: t, h: door.width };
      default:  return { x: c.width - t / 2, y: pos, w: t, h: door.width };
    }
  }
  function doorCenter(door) {
    var r = doorRect(door);
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  }

  // ---------- Phân bổ model vào kệ (suy ra từ rack.brandIds) ----------
  // Duyệt hãng theo cùng thứ tự ưu tiên với thuật toán tối ưu (bán chạy trước),
  // mỗi hãng đổ hàng vào các kệ của mình theo thứ tự gần cửa xuất, tới đâu hết chỗ tới đó.
  // Trả về: { modelLoc: sku->rackId, rackItems: rackId->[{model, qty}], rackLoad: rackId->units, overflow: [{model, qty}] }
  function distToOut(r) {
    var out = DOORS.filter(function (d) { return d.id === 'c2'; })[0];
    var p = doorCenter(out);
    return Math.hypot(r.x + r.w / 2 - p.x, r.y + r.d / 2 - p.y);
  }

  function brandPriorityOrder() {
    var need = {};
    MODELS.forEach(function (m) { need[m.brand] = (need[m.brand] || 0) + m.qty; });
    return BRANDS.slice().sort(function (a, b) {
      return (b.vel - a.vel) || ((need[b.id] || 0) - (need[a.id] || 0));
    });
  }

  function computePlacement() {
    var res = { modelLoc: {}, rackItems: {}, rackLoad: {}, overflow: [] };
    var free = {};
    state.racks.forEach(function (r) {
      res.rackItems[r.id] = []; res.rackLoad[r.id] = 0;
      free[r.id] = rackCapacity(r);
    });

    brandPriorityOrder().forEach(function (b) {
      var racks = state.racks.filter(function (r) { return r.brandIds.indexOf(b.id) !== -1; })
        .sort(function (x, y) { return distToOut(x) - distToOut(y); });
      MODELS.filter(function (m) { return m.brand === b.id && m.qty > 0; }).forEach(function (m) {
        var r = null;
        for (var i = 0; i < racks.length; i++) {
          if (free[racks[i].id] >= m.qty) { r = racks[i]; break; }
        }
        if (!r) { // không kệ nào đủ chỗ nguyên kiện -> nhét kệ còn trống nhiều nhất
          racks.forEach(function (x) { if (!r || free[x.id] > free[r.id]) r = x; });
          if (r && free[r.id] <= 0) r = null;
        }
        if (!r) { res.overflow.push({ model: m, qty: m.qty }); return; }
        res.modelLoc[m.sku] = r.id;
        res.rackItems[r.id].push({ model: m, qty: m.qty });
        res.rackLoad[r.id] += m.qty;
        free[r.id] -= m.qty;
      });
    });
    return res;
  }

  // ---------- Thuật toán tối ưu ----------
  // Hãng bán chạy (vel cao) + tồn nhiều -> kệ gần Cửa xuất chính; mỗi kệ tối đa 2 hãng.
  function runOptimize(st, silent) {
    var need = {};
    MODELS.forEach(function (m) { need[m.brand] = (need[m.brand] || 0) + m.qty; });

    var out = DOORS.filter(function (d) { return d.id === 'c2'; })[0];
    var dc = (function () {
      var c = st.config, len = c.width;
      var pos = out.frac * len;
      return { x: pos, y: c.depth };
    })();

    var slots = st.racks.map(function (r) {
      var cap = (function () {
        var lv = Math.floor(((st.config.hMax + (st.config.hMin - st.config.hMax) * ((r.y + r.d / 2) / st.config.depth)) - CLEARANCE) / LEVEL_H);
        lv = Math.max(1, Math.min(5, lv));
        return Math.round(Math.max(r.w, r.d) * UNITS_PER_M) * lv;
      })();
      var cx = r.x + r.w / 2, cy = r.y + r.d / 2;
      return { r: r, cap: cap, free: cap, brands: [], dist: Math.hypot(cx - dc.x, cy - dc.y) };
    }).sort(function (a, b) { return a.dist - b.dist; });

    var order = BRANDS.slice().sort(function (a, b) {
      return (b.vel - a.vel) || ((need[b.id] || 0) - (need[a.id] || 0));
    });

    var overflow = [];
    order.forEach(function (b) {
      var q = need[b.id] || 0;
      if (q <= 0) return;
      var guard = 0;
      while (q > 0 && guard++ < 100) {
        var cand = null;
        for (var i = 0; i < slots.length; i++) {
          var s = slots[i];
          if (s.brands.length >= 2 || s.free <= 0) continue;
          if (s.brands.length === 1 && s.free < Math.min(q, s.cap) * 0.5) continue;
          cand = s; break;
        }
        if (!cand) { overflow.push({ brand: b, qty: q }); break; }
        var take = Math.min(q, cand.free);
        cand.brands.push(b.id);
        cand.free -= take;
        q -= take;
      }
    });

    slots.forEach(function (s) { s.r.brandIds = s.brands; });
    if (!silent) showOptimizeResult(slots, overflow);
  }

  function showOptimizeResult(slots, overflow) {
    var rows = slots.slice().sort(function (a, b) { return a.r.label.localeCompare(b.r.label, 'vi', { numeric: true }); })
      .map(function (s) {
        var names = s.brands.map(function (id) { return brandOf(id).name; }).join(' + ') || '<i>trống</i>';
        return '<li><b>' + s.r.label + '</b> (' + rackLevels(s.r) + ' tầng, sức chứa ' + s.cap + '): ' + names + '</li>';
      }).join('');
    var ovr = overflow.length
      ? '<p style="color:var(--red)"><b>⚠ Thiếu chỗ:</b> ' + overflow.map(function (o) { return o.brand.name + ' (' + o.qty + ' máy)'; }).join(', ') + ' — cần thêm kệ (bật ✎ Sửa sơ đồ → ＋ Thêm kệ).</p>'
      : '<p style="color:var(--green)"><b>✔</b> Tất cả hàng đều có chỗ trên kệ.</p>';
    $('modalTitle').textContent = 'Kết quả tối ưu sắp xếp';
    $('modalBody').innerHTML =
      '<p><b>Nguyên tắc áp dụng:</b></p><ul>' +
      '<li>Hãng <b>bán chạy + tồn nhiều</b> → kệ gần <b>Cửa xuất chính (C2)</b> để lấy hàng nhanh.</li>' +
      '<li>Khu trần cao 5m (tường sau) dùng kệ <b>4 tầng</b>; khu trần 3.5m chỉ <b>2 tầng</b>.</li>' +
      '<li>Mỗi kệ tối đa <b>2 hãng</b> để dễ tìm, dễ kiểm kê.</li>' +
      '<li>Máy nặng (tủ đứng, âm trần) luôn để <b>tầng 1</b> (ghi chú trong chi tiết kệ).</li>' +
      '</ul>' + ovr + '<p><b>Phân bổ kệ:</b></p><ul>' + rows + '</ul>';
    $('modal').classList.remove('hidden');
  }

  // ---------- Vẽ sơ đồ SVG ----------
  function levelBoundaries() {
    // các đường ranh giới nơi số tầng kệ thay đổi (do trần dốc)
    var c = state.config, res = [];
    for (var lv = 5; lv >= 2; lv--) {
      var cNeed = CLEARANCE + LEVEL_H * lv;
      if (c.hMax === c.hMin) continue;
      var y = (c.hMax - cNeed) / (c.hMax - c.hMin) * c.depth;
      if (y > 0.5 && y < c.depth - 0.5) res.push({ y: y, lv: lv });
    }
    return res;
  }

  function fillColor(r, placement) {
    if (colorMode === 'fill') {
      var cap = rackCapacity(r);
      var ratio = cap ? placement.rackLoad[r.id] / cap : 0;
      var hue = Math.max(0, 120 - 120 * Math.min(1, ratio));
      return 'hsl(' + hue + ',62%,58%)';
    }
    if (colorMode === 'levels') {
      var lv = rackLevels(r);
      return { 2: '#cdddf2', 3: '#8fb3e2', 4: '#4a7cc4', 5: '#2b5a9e' }[lv] || '#cdddf2';
    }
    return null; // chế độ brand vẽ riêng
  }

  function renderMap() {
    var c = state.config;
    var placement = computePlacement();
    var pad = 2.2;
    var s = '';
    s += '<svg id="floorSvg" viewBox="' + (-pad) + ' ' + (-pad) + ' ' + (c.width + pad * 2) + ' ' + (c.depth + pad * 2) + '" xmlns="http://www.w3.org/2000/svg">';
    s += '<defs><linearGradient id="ceilGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#e2ebf7"/><stop offset="1" stop-color="#f6f1e4"/></linearGradient></defs>';

    // sàn + lưới 1m
    s += '<rect x="0" y="0" width="' + c.width + '" height="' + c.depth + '" fill="url(#ceilGrad)"/>';
    for (var gx = 1; gx < c.width; gx++)
      s += '<line x1="' + gx + '" y1="0" x2="' + gx + '" y2="' + c.depth + '" stroke="#000" stroke-opacity="' + (gx % 5 ? .04 : .1) + '" stroke-width="0.03"/>';
    for (var gy = 1; gy < c.depth; gy++)
      s += '<line x1="0" y1="' + gy + '" x2="' + c.width + '" y2="' + gy + '" stroke="#000" stroke-opacity="' + (gy % 5 ? .04 : .1) + '" stroke-width="0.03"/>';

    // ranh giới số tầng theo trần dốc
    levelBoundaries().forEach(function (b) {
      s += '<line x1="0" y1="' + b.y + '" x2="' + c.width + '" y2="' + b.y + '" stroke="#7c93b5" stroke-width="0.06" stroke-dasharray="0.6 0.4"/>';
      s += '<text x="' + (c.width / 2) + '" y="' + (b.y - 0.18) + '" font-size="0.5" fill="#5b7396" text-anchor="middle">— phía trên: kệ ' + b.lv + ' tầng —</text>';
    });

    // chú thích độ cao trần (bên trái)
    s += '<text x="-0.5" y="0.7" font-size="0.6" fill="#41618f" text-anchor="end">trần ' + c.hMax.toFixed(1) + 'm</text>';
    s += '<text x="-0.5" y="' + (c.depth - 0.2) + '" font-size="0.6" fill="#8a7a4e" text-anchor="end">trần ' + c.hMin.toFixed(1) + 'm</text>';
    s += '<line x1="-1.4" y1="1" x2="-1.4" y2="' + (c.depth - 1) + '" stroke="#9aa8bd" stroke-width="0.05" marker-end="url(#)"/>';

    // khu vực sàn
    ZONES.forEach(function (z) {
      var x = z.fx * c.width, y = z.fy * c.depth, w = z.fw * c.width, h = z.fh * c.depth;
      s += '<g class="zone"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="0.3" fill="' + z.fill + '" fill-opacity="0.75" stroke="' + z.stroke + '"/>';
      var ly0 = y + h / 2 - (z.lines.length - 1) * 0.33 + 0.18;
      z.lines.forEach(function (line, i) {
        s += '<text x="' + (x + w / 2) + '" y="' + (ly0 + i * 0.66) + '" font-size="0.52" font-weight="600" fill="' + z.stroke + '" text-anchor="middle">' + esc(line) + '</text>';
      });
      s += '</g>';
    });

    // tường
    s += '<rect x="0" y="0" width="' + c.width + '" height="' + c.depth + '" fill="none" stroke="#33465e" stroke-width="0.28"/>';

    // cửa (nhãn tường trái/phải xoay dọc để không tràn ra ngoài)
    DOORS.forEach(function (d) {
      var r = doorRect(d);
      s += '<rect x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '" fill="#fff" stroke="' + d.color + '" stroke-width="0.1"/>';
      s += doorArrow(d, r);
      var t = '<text font-size="0.62" font-weight="700" fill="' + d.color + '" text-anchor="middle"';
      if (d.side === 'S') {
        s += t + ' x="' + (r.x + r.w / 2) + '" y="' + (c.depth + 1.1) + '">' + esc(d.name) + '</text>';
      } else if (d.side === 'N') {
        s += t + ' x="' + (r.x + r.w / 2) + '" y="-0.6">' + esc(d.name) + '</text>';
      } else if (d.side === 'W') {
        var cyw = r.y + r.h / 2;
        s += t + ' x="-0.8" y="' + cyw + '" transform="rotate(-90 -0.8 ' + cyw + ')">' + esc(d.name) + '</text>';
      } else {
        var cye = r.y + r.h / 2;
        s += t + ' x="' + (c.width + 0.9) + '" y="' + cye + '" transform="rotate(90 ' + (c.width + 0.9) + ' ' + cye + ')">' + esc(d.name) + '</text>';
      }
    });

    // kệ hàng
    state.racks.forEach(function (r) {
      var cap = rackCapacity(r);
      var loadPct = cap ? Math.round(placement.rackLoad[r.id] / cap * 100) : 0;
      var cls = 'rack' + (selectedRack === r.id ? ' selected' : '') + (highlightRacks[r.id] ? ' highlight' : '');
      s += '<g class="' + cls + '" data-id="' + r.id + '">';
      var col = fillColor(r, placement);
      if (col) {
        s += '<rect x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.d + '" fill="' + col + '"/>';
      } else if (r.brandIds.length === 0) {
        s += '<rect x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.d + '" fill="#d8dee8"/>';
      } else if (r.brandIds.length === 1) {
        s += '<rect x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.d + '" fill="' + brandOf(r.brandIds[0]).color + '"/>';
      } else {
        var horiz = r.w >= r.d;
        var b0 = brandOf(r.brandIds[0]).color, b1 = brandOf(r.brandIds[1]).color;
        if (horiz) {
          s += '<rect x="' + r.x + '" y="' + r.y + '" width="' + (r.w / 2) + '" height="' + r.d + '" fill="' + b0 + '"/>';
          s += '<rect x="' + (r.x + r.w / 2) + '" y="' + r.y + '" width="' + (r.w / 2) + '" height="' + r.d + '" fill="' + b1 + '"/>';
        } else {
          s += '<rect x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + (r.d / 2) + '" fill="' + b0 + '"/>';
          s += '<rect x="' + r.x + '" y="' + (r.y + r.d / 2) + '" width="' + r.w + '" height="' + (r.d / 2) + '" fill="' + b1 + '"/>';
        }
      }
      s += '<rect class="body" x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.d + '" fill="none"/>';

      // nhãn kệ
      var cx = r.x + r.w / 2, cy = r.y + r.d / 2;
      var vertical = r.d > r.w;
      var line1 = r.label + ' · ' + rackLevels(r) + 'T · ' + loadPct + '%';
      var line2 = r.brandIds.map(function (id) { return brandOf(id).short; }).join(' + ');
      var rot = vertical ? ' transform="rotate(-90 ' + cx + ' ' + cy + ')"' : '';
      s += '<g' + rot + ' text-anchor="middle" font-size="0.42" fill="#102038">';
      s += '<text x="' + cx + '" y="' + (cy - 0.08) + '" font-weight="700">' + esc(line1) + '</text>';
      if (line2) s += '<text x="' + cx + '" y="' + (cy + 0.44) + '">' + esc(line2) + '</text>';
      s += '</g></g>';
    });

    // thước tỉ lệ
    s += '<g font-size="0.55" fill="#6b7a8c"><line x1="0" y1="' + (c.depth + 1.3) + '" x2="5" y2="' + (c.depth + 1.3) + '" stroke="#6b7a8c" stroke-width="0.08"/>' +
      '<text x="5.3" y="' + (c.depth + 1.5) + '">5m — kho ' + c.width + '×' + c.depth + 'm</text></g>';

    s += '</svg>';
    $('mapHost').innerHTML = s;
    bindMapEvents();
  }

  function doorArrow(d, r) {
    // mũi tên chỉ hướng nhập/xuất
    var a = '';
    if (d.id === 'c1') a = '<text x="' + (r.x + 0.9) + '" y="' + (r.y + r.h / 2 + 0.18) + '" font-size="0.7" fill="' + d.color + '">➜</text>';
    if (d.id === 'c2') a = '<text x="' + (r.x + r.w / 2 - 0.35) + '" y="' + (r.y + 0.15) + '" font-size="0.7" fill="' + d.color + '">⬇</text>';
    return a;
  }

  // ---------- Sự kiện trên bản đồ (click + kéo thả) ----------
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
      var dragging = false, moved = false, start = null, r0 = null;

      g.addEventListener('pointerdown', function (e) {
        if (!editMode) return;
        dragging = true; moved = false;
        start = svgPoint(e);
        var r = rackOf(id);
        r0 = { x: r.x, y: r.y };
        g.classList.add('dragging');
        g.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      g.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var p = svgPoint(e);
        var dx = p.x - start.x, dy = p.y - start.y;
        if (Math.abs(dx) + Math.abs(dy) > 0.15) moved = true;
        var r = rackOf(id);
        var c = state.config;
        var nx = Math.round((r0.x + dx) * 2) / 2, ny = Math.round((r0.y + dy) * 2) / 2;
        nx = Math.max(0.2, Math.min(c.width - r.w - 0.2, nx));
        ny = Math.max(0.2, Math.min(c.depth - r.d - 0.2, ny));
        g.setAttribute('transform', 'translate(' + (nx - r0.x) + ' ' + (ny - r0.y) + ')');
        g._nx = nx; g._ny = ny;
      });
      g.addEventListener('pointerup', function () {
        if (!dragging) return;
        dragging = false;
        g.classList.remove('dragging');
        if (moved) {
          var r = rackOf(id);
          r.x = (typeof g._nx === 'number') ? g._nx : r.x;
          r.y = (typeof g._ny === 'number') ? g._ny : r.y;
          save();
          renderAll();
        }
      });
      g.addEventListener('click', function () {
        if (moved) { moved = false; return; }
        selectRack(id);
      });
    });
  }

  function selectRack(id) {
    selectedRack = (selectedRack === id) ? null : id;
    renderAll();
  }

  // ---------- Panel chi tiết kệ ----------
  function renderDetail() {
    var panel = $('detailPanel');
    if (!selectedRack) { panel.classList.add('hidden'); return; }
    var r = rackOf(selectedRack);
    if (!r) { selectedRack = null; panel.classList.add('hidden'); return; }
    panel.classList.remove('hidden');

    var placement = computePlacement();
    var cap = rackCapacity(r), load = placement.rackLoad[r.id];
    var pct = cap ? Math.round(load / cap * 100) : 0;
    var lv = rackLevels(r), ceil = rackCeiling(r);

    $('detailName').textContent = 'Kệ ' + r.label;
    $('detailMeta').textContent = rackLength(r) + 'm dài · vị trí (' + r.x + ', ' + r.y + ')m';

    var html = '';
    html += '<div class="kv">' +
      '<div class="cell">Trần tại đây<b>' + ceil.toFixed(2) + ' m</b></div>' +
      '<div class="cell">Số tầng kệ<b>' + lv + ' tầng</b></div>' +
      '<div class="cell">Sức chứa<b>' + cap + ' máy</b></div>' +
      '<div class="cell">Đang chứa<b>' + load + ' máy (' + pct + '%)</b></div></div>';
    html += '<div class="fillbar' + (pct > 100 ? ' crit' : pct > 85 ? ' warn' : '') + '"><div style="width:' + Math.min(100, pct) + '%"></div></div>';

    html += '<p style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase">Hãng trên kệ (tối đa 2 — bấm để gán/bỏ)</p><div class="chips">';
    BRANDS.forEach(function (b) {
      var on = r.brandIds.indexOf(b.id) !== -1;
      html += '<span class="chip' + (on ? ' on' : '') + '" data-brand="' + b.id + '"' + (on ? ' style="background:' + b.color + '"' : '') + '>' + esc(b.short) + '</span>';
    });
    html += '</div>';

    html += '<div class="note">📌 Máy <b>tủ đứng / âm trần</b> (gắn nhãn NẶNG) luôn xếp <b>tầng 1</b>; máy treo tường nhẹ xếp tầng 2–' + lv + '.</div>';

    if (editMode) {
      html += '<div class="detail-actions">' +
        '<button class="btn ghost" id="btnRotate">⟳ Xoay kệ</button>' +
        '<button class="btn red" id="btnDelete">🗑 Xoá kệ</button></div>';
    }

    var items = placement.rackItems[r.id];
    html += '<table class="inv-table"><thead><tr><th>Model trên kệ (' + items.length + ')</th><th>SL</th></tr></thead><tbody>';
    if (!items.length) html += '<tr><td colspan="2" style="color:var(--muted)">Kệ trống — gán hãng ở trên để chứa hàng.</td></tr>';
    items.forEach(function (it) {
      html += '<tr><td>' + esc(it.model.name) +
        (it.model.heavy ? '<span class="tag heavy">NẶNG · TẦNG 1</span>' : '') +
        '<div class="p-sku">' + esc(it.model.sku) + ' · ' + esc(it.model.type) + '</div></td>' +
        '<td><b>' + it.qty + '</b></td></tr>';
    });
    html += '</tbody></table>';

    $('detailBody').innerHTML = html;

    $('detailBody').querySelectorAll('.chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var bid = chip.getAttribute('data-brand');
        var i = r.brandIds.indexOf(bid);
        if (i !== -1) r.brandIds.splice(i, 1);
        else if (r.brandIds.length >= 2) { alert('Mỗi kệ tối đa 2 hãng để dễ tìm và kiểm kê. Bỏ bớt 1 hãng trước.'); return; }
        else r.brandIds.push(bid);
        save();
        renderAll();
      });
    });
    var rot = $('btnRotate');
    if (rot) rot.addEventListener('click', function () {
      var c = state.config, t = r.w; r.w = r.d; r.d = t;
      r.x = Math.min(r.x, c.width - r.w - 0.2);
      r.y = Math.min(r.y, c.depth - r.d - 0.2);
      save(); renderAll();
    });
    var del = $('btnDelete');
    if (del) del.addEventListener('click', function () {
      if (!confirm('Xoá kệ ' + r.label + '? Hàng của hãng trên kệ sẽ chuyển sang trạng thái "chưa xếp".')) return;
      state.racks = state.racks.filter(function (x) { return x.id !== r.id; });
      selectedRack = null;
      save(); renderAll();
    });
  }

  // ---------- Sidebar ----------
  function renderBrandList(placement) {
    var ul = $('brandList');
    ul.innerHTML = '';
    BRANDS.forEach(function (b) {
      var ms = MODELS.filter(function (m) { return m.brand === b.id; });
      var units = ms.reduce(function (a, m) { return a + m.qty; }, 0);
      var li = document.createElement('li');
      if (activeBrand === b.id) li.className = 'active';
      li.innerHTML = '<span class="swatch" style="background:' + b.color + '"></span>' + esc(b.name) +
        ' <span class="vel">' + '★'.repeat(b.vel) + '</span>' +
        '<span class="b-meta">' + ms.length + ' model · ' + units + '</span>';
      li.addEventListener('click', function () {
        activeBrand = (activeBrand === b.id) ? null : b.id;
        highlightRacks = {};
        if (activeBrand) {
          state.racks.forEach(function (r) { if (r.brandIds.indexOf(b.id) !== -1) highlightRacks[r.id] = true; });
        }
        renderAll();
      });
      ul.appendChild(li);
    });
  }

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
      if (!activeBrand) { highlightRacks = {}; renderMap(); }
      return;
    }
    var placement = computePlacement();
    var hits = MODELS.filter(function (m) {
      var b = brandOf(m.brand);
      return m.sku.toLowerCase().indexOf(q) !== -1 || m.name.toLowerCase().indexOf(q) !== -1 || b.name.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 10);

    box.classList.remove('hidden');
    if (!hits.length) { box.innerHTML = '<div class="sr-empty">Không tìm thấy model nào.</div>'; return; }
    box.innerHTML = '';
    highlightRacks = {};
    hits.forEach(function (m) {
      var rid = placement.modelLoc[m.sku];
      if (rid) highlightRacks[rid] = true;
      var loc = rid ? 'Kệ <span class="sr-loc">' + rackOf(rid).label + '</span>' :
        (m.qty > 0 ? '<span style="color:var(--red)">chưa xếp</span>' : 'hết hàng');
      var div = document.createElement('div');
      div.className = 'sr-item';
      div.innerHTML = '<b>' + esc(m.name) + '</b><br>' + esc(m.sku) + ' · tồn <b>' + m.qty + '</b> · ' + loc;
      div.addEventListener('click', function () { if (rid) { selectedRack = rid; renderAll(); } });
      box.appendChild(div);
    });
    renderMap();
  }

  // ---------- Thống kê ----------
  function renderStats(placement) {
    var units = MODELS.reduce(function (a, m) { return a + m.qty; }, 0);
    var cap = state.racks.reduce(function (a, r) { return a + rackCapacity(r); }, 0);
    var placed = Object.keys(placement.rackLoad).reduce(function (a, k) { return a + placement.rackLoad[k]; }, 0);
    var ovr = placement.overflow.reduce(function (a, o) { return a + o.qty; }, 0);
    $('statBrands').textContent = BRANDS.length;
    $('statModels').textContent = MODELS.length;
    $('statUnits').textContent = units;
    $('statFill').textContent = cap ? Math.round(placed / cap * 100) + '%' : '—';
    $('statOverflow').textContent = ovr;
  }

  function renderAll() {
    var placement = computePlacement();
    renderStats(placement);
    renderBrandList(placement);
    renderMap();
    renderDetail();
  }

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
      ? 'Chế độ sửa: kéo thả kệ để di chuyển (bám lưới 0.5m) · bấm kệ để xoay/xoá · nút ＋ Thêm kệ bên dưới'
      : 'Bấm vào kệ để xem chi tiết · kéo thả kệ ở chế độ ✎ Sửa sơ đồ';
    if (editMode && !$('btnAddRack')) {
      var b = document.createElement('button');
      b.className = 'btn green'; b.id = 'btnAddRack'; b.textContent = '＋ Thêm kệ';
      b.addEventListener('click', function () {
        var n = 1;
        while (rackOf('k' + n)) n++;
        state.racks.push({ id: 'k' + n, label: 'K' + n, x: state.config.width / 2 - 3, y: state.config.depth / 2, w: 6, d: 1.2, brandIds: [] });
        selectedRack = 'k' + n;
        save(); renderAll();
      });
      this.parentNode.insertBefore(b, this.nextSibling);
    } else if (!editMode) {
      var btn = $('btnAddRack');
      if (btn) btn.remove();
    }
    renderAll();
  });

  $('btnReset').addEventListener('click', function () {
    if (!confirm('Xoá bố trí đã chỉnh và quay về sơ đồ mặc định (30×20m, 13 kệ, đã tối ưu)?')) return;
    state = defaultState();
    selectedRack = null; activeBrand = null; highlightRacks = {};
    save();
    renderAll();
  });

  $('searchInput').addEventListener('input', function () { renderSearch(this.value); });
  $('btnCloseDetail').addEventListener('click', function () { selectedRack = null; renderAll(); });
  $('btnModalClose').addEventListener('click', function () { $('modal').classList.add('hidden'); });
  $('modal').addEventListener('click', function (e) { if (e.target === this) $('modal').classList.add('hidden'); });

  // ---------- Khởi động ----------
  renderChecklist();
  renderAll();
})();
