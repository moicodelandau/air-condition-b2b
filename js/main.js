// ===== An Nhiên Care – main.js =====

// Mobile navigation toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

navToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

// Close mobile menu when a link is clicked
mainNav.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// Booking form validation + submit
const form = document.getElementById('bookingForm');
const status = document.getElementById('formStatus');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const phone = form.phone.value.replace(/\s/g, '');
  const phoneOk = /^0\d{9,10}$/.test(phone);

  form.name.classList.toggle('invalid', !name);
  form.phone.classList.toggle('invalid', !phoneOk);

  if (!name || !phoneOk) {
    status.textContent = !name
      ? 'Vui lòng nhập họ và tên.'
      : 'Số điện thoại chưa đúng định dạng (VD: 0901234567).';
    status.className = 'form-status err';
    return;
  }

  // Demo: chưa có backend — lưu yêu cầu vào localStorage và báo thành công.
  // Khi triển khai thật, thay đoạn này bằng fetch() tới API hoặc Google Form/Zalo OA.
  const request = {
    name,
    phone,
    service: form.service.value,
    note: form.note.value.trim(),
    at: new Date().toISOString(),
  };
  try {
    const saved = JSON.parse(localStorage.getItem('bookingRequests') || '[]');
    saved.push(request);
    localStorage.setItem('bookingRequests', JSON.stringify(saved));
  } catch (_) { /* localStorage không khả dụng thì bỏ qua */ }

  status.textContent = `Cảm ơn ${name}! Chúng tôi sẽ gọi lại số ${phone} trong 15 phút.`;
  status.className = 'form-status ok';
  form.reset();
});
