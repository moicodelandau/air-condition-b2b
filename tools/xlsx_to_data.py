#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Chuyển sheet TỒN KHO trong file báo cáo Excel thành js/data.js cho app sơ đồ kho.

Cách dùng:
    pip install openpyxl
    python3 tools/xlsx_to_data.py "BÁO CÁO NGÀY xx.xx.xxxx.xlsx"

Sheet TỒN KHO cần các cột (dòng tiêu đề ở hàng 1):
    A: hãng (chỉ ghi ở dòng đầu mỗi nhóm)   B: TÊN RÚT GỌN (mã)   C: TÊN HÀNG
    D: TỔNG TỒN CUỐI                          I: XUẤT (dùng tính độ bán chạy)
"""
import json
import re
import sys
import unicodedata

import openpyxl

# Các "hãng" thực chất là nhóm hàng linh tinh / phụ kiện
MISC_BRANDS = {
    'MÁY NƯỚC NÓNG', 'TỦ LẠNH- TỦ ĐÔNG', 'MÁY GIẶT', 'TIVI', 'NỒI -CHẢO',
    'BẾP', 'ẤM ĐUN', 'QUẠT', 'MÔ HÌNH', 'NÓN BH +ÁO',
}
ACCESSORY_BRANDS = {'PHỤ KIỆN MÁY LẠNH'}


def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')


def classify(brand, name):
    """Trả về (cat, size). size: S nhỏ / M vừa / L lớn / X siêu lớn (VRV, máy >=5HP)."""
    n = strip_accents(name.upper())
    if brand in ACCESSORY_BRANDS or any(k in n for k in ('MAT NA', 'REMOTE', 'BO DIEU KHIEN', 'BO LOE')):
        return 'phukien', 'S'
    if brand in MISC_BRANDS:
        return 'linhtinh', 'S'
    if 'VRV' in n or 'VRF' in n:
        return 'vrv', 'X'

    # công suất (HP) nếu ghi rõ trong tên
    hp = 0.0
    m = re.search(r'(\d+(?:[\.,]\d+)?)\s*HP', n)
    if m:
        hp = float(m.group(1).replace(',', '.'))
    # mã công suất lớn trong tên model (kW x10: 100 = 10kW ~ 4HP trở lên) -> máy rất nặng
    big_code = bool(re.search(r'(?<!\d)(100|125|140|160|200|250)(?!\d)', n))

    if 'TU DUNG' in n:
        cat = 'tudung'
    elif 'GIAU TRAN' in n or 'GIAU TRAN' in n or 'GIAU' in n:
        cat = 'giautran'
    elif 'AM TRAN' in n:
        cat = 'amtran'
    elif 'AP TRAN' in n:
        cat = 'aptran'
    elif 'MULTI' in n:
        cat = 'multi'
    elif 'TREO TUONG' in n or 'TREO  TUONG' in n:
        cat = 'treo'
    elif 'DAN NONG' in n or 'DAN NONG' in n:
        cat = 'dannong'
    else:
        cat = 'khac'

    if hp >= 5 or (big_code and cat not in ('treo', 'khac')):
        size = 'X'  # máy lớn: chỉ để sàn, gần cửa, cần xe nâng
    elif cat in ('tudung', 'giautran'):
        size = 'L'
    elif cat in ('amtran', 'aptran', 'dannong', 'multi'):
        size = 'M'
    else:
        size = 'S'
    return cat, size


def main(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb['TỒN KHO']

    def num(x):
        try:
            return float(x)
        except (TypeError, ValueError):
            return 0.0

    items, brand = [], None
    for r in ws.iter_rows(min_row=4, values_only=True):
        a, sku, name, qty, out = r[0], r[1], r[2], r[3], r[8]
        if a and str(a).strip() and str(a).strip() != 'TỔNG':
            brand = str(a).strip()
        if not sku and not name:
            continue
        qty = num(qty)
        if qty <= 0:
            continue  # chỉ vẽ hàng còn tồn
        name = re.sub(r'\s+', ' ', str(name or '')).strip()
        sku = re.sub(r'\s+', ' ', str(sku or '')).strip() or name[:20]
        cat, size = classify(brand, name)
        items.append([brand, sku, name, int(qty), int(num(out)), cat, size])

    header = '// Sinh tự động bởi tools/xlsx_to_data.py — KHÔNG sửa tay, chạy lại script khi có báo cáo mới.\n'
    src = ws.cell(row=1, column=1).value or ''
    body = 'var INVENTORY_DATA = ' + json.dumps(items, ensure_ascii=False, separators=(',', ':')) + ';\n'
    with open('js/data.js', 'w', encoding='utf-8') as f:
        f.write(header + body)
    total = sum(i[3] for i in items)
    brands = sorted({i[0] for i in items})
    print(f'OK: {len(items)} model còn tồn, {total} máy, {len(brands)} nhóm -> js/data.js')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('Cách dùng: python3 tools/xlsx_to_data.py <file bao cao.xlsx>')
    main(sys.argv[1])
