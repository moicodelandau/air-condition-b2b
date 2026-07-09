/* ============================================================
   Quyết Nhanh · Decision Autopilot
   Automate your thinking: classify any decision in ~30 seconds,
   break procrastination with launch timers, codify personal
   if-then rules, and learn from a decision journal.
   All data lives in localStorage — no server, no account.
   ============================================================ */

(function () {
  "use strict";

  // ---------------------------------------------------------- i18n
  const I18N = {
    vi: {
      appName: "Quyết Nhanh",
      tabDecide: "Quyết định",
      tabStart: "Bắt đầu",
      tabRules: "Luật",
      tabJournal: "Nhật ký",

      statToday: "quyết hôm nay",
      statAvg: "giây / quyết định",
      statFocus: "phiên tập trung",
      statStreak: "ngày liên tiếp",

      decideTitle: "Đang phân vân điều gì?",
      decideSub: "Trả lời tối đa 4 câu hỏi — hệ thống sẽ chỉ cho bạn cách xử lý ngay, không cần nghĩ thêm.",
      decidePlaceholder: "VD: Có nên nhập thêm lô máy lạnh model X?",
      decideGo: "⚡ Phân loại trong 30 giây",
      decideNeedText: "Nhập điều bạn đang phân vân trước đã!",

      q_twoMin: "Làm luôn có mất dưới 2 phút không?",
      q_twoMin_hint: "Trả lời tin nhắn, ký duyệt, gọi 1 cuộc điện thoại ngắn…",
      q_onlyYou: "Bắt buộc phải là bạn quyết / làm?",
      q_onlyYou_hint: "Nếu người khác làm được 80% tốt như bạn → không bắt buộc.",
      q_reversible: "Nếu chọn sai, có sửa lại được dễ không?",
      q_reversible_hint: "Cửa 2 chiều: đổi trả được, hủy được, làm lại được → Có.",
      q_matters: "Sau 10 tháng nữa, việc này còn quan trọng?",
      q_matters_hint: "Nghĩ xem tương lai của bạn có nhớ đến quyết định này không.",
      yes: "Có",
      no: "Không",

      v_now_badge: "Làm ngay",
      v_now_title: "Đừng nghĩ nữa — làm luôn!",
      v_now_why: "Quy tắc 2 phút: việc dưới 2 phút mà đem đi cân nhắc là lỗ vốn. Thời gian nghĩ đã đủ để làm xong.",
      v_now_steps: ["Bấm hẹn giờ 2 phút bên dưới", "Làm ngay, không mở tab khác", "Xong thì quay lại bấm ✓"],
      v_now_timer: "Hẹn giờ 2 phút & làm",

      v_delegate_badge: "Giao việc",
      v_delegate_title: "Đây không phải việc của bạn",
      v_delegate_why: "Không bắt buộc là bạn → giữ lại chỉ tốn chỗ trong đầu. Chuyển cho đúng người, kèm deadline rõ ràng.",
      v_delegate_steps: ["Chọn người phù hợp nhất", "Nhắn 1 tin: việc gì, kết quả mong muốn, hạn chót", "Đặt lịch kiểm tra lại — rồi quên nó đi"],
      v_delegate_who: "Giao cho ai? (không bắt buộc)",

      v_quick_badge: "Quyết nhanh",
      v_quick_title: "Chọn phương án 'đủ tốt' đầu tiên",
      v_quick_why: "Sai thì sửa được, 10 tháng nữa chẳng ai nhớ. Tối ưu thêm chỉ tốn thời gian — người quyết nhanh thắng người quyết đúng 100%.",
      v_quick_steps: ["Đặt 5 phút bên dưới", "Phương án đầu tiên đạt yêu cầu → chọn luôn", "Hết giờ chưa chọn được → tung đồng xu"],
      v_quick_timer: "Đặt 5 phút & chốt",

      v_timebox_badge: "Đóng khung 15 phút",
      v_timebox_title: "Quan trọng, nhưng sửa được → không cần hoàn hảo",
      v_timebox_why: "Quyết định loại này xứng đáng 15 phút — không phải 15 ngày. Cấu trúc hoá rồi chốt khi hết giờ.",
      v_timebox_steps: ["Viết tối đa 3 lựa chọn", "Mỗi cái 1 dòng ưu, 1 dòng nhược", "Hết 15 phút: chọn cái có nhược điểm chịu được nhất"],
      v_timebox_timer: "Đặt 15 phút & chốt",

      v_big_badge: "Quyết định lớn",
      v_big_title: "Khó đảo ngược + quan trọng → đi theo quy trình, đừng nghĩ vòng quanh",
      v_big_why: "Loại này chiếm ~5% quyết định. Nghĩ lan man không giúp gì — làm đủ 4 bước dưới đây rồi chốt đúng hạn.",
      v_big_steps: ["Viết ra kịch bản xấu nhất — chịu được không?", "Có cách thử nhỏ trước không? (thử 1 đơn hàng, 1 tháng, 1 khách)", "Hỏi đúng 1 người có kinh nghiệm thật", "Đặt hạn chót quyết định bên dưới — đến hạn là chốt"],
      v_big_deadline: "Hạn chót phải chốt:",

      commitLabel: "Bạn chốt phương án nào?",
      commitPlaceholder: "VD: Nhập 50 bộ, thử bán 2 tuần",
      commitBtn: "✓ Chốt & ghi nhật ký",
      commitLater: "Lưu vào nhật ký, chốt sau",
      decidedIn: "Bạn phân loại xong trong {s} giây",
      savedToast: "Đã ghi vào nhật ký ✓",
      newDecision: "＋ Quyết định mới",

      timerRunning: "Đang chạy — tập trung chốt!",
      timerDone: "⏰ Hết giờ — chốt ngay, không gia hạn!",
      timerCancel: "Hủy",
      timerFinish: "Xong sớm ✓",

      startTitle: "Phá trì hoãn",
      startSub: "Não trì hoãn vì việc trông quá to. Thu nhỏ nó lại thành 1 bước 5 phút, rồi phóng.",
      startTaskLabel: "Việc bạn đang né tránh?",
      startTaskPlaceholder: "VD: Làm báo giá cho khách A",
      startStepLabel: "Bước nhỏ nhất làm được trong 5 phút?",
      startStepPlaceholder: "VD: Mở file báo giá cũ và đổi tên khách",
      chipOpen: "Mở file / tài liệu",
      chipWrite: "Viết 1 câu đầu tiên",
      chipCall: "Gọi / nhắn 1 người",
      chipFind: "Tìm 1 thông tin",
      chipList: "Liệt kê 3 ý chính",
      durLabel: "Thời lượng phiên:",
      launchBtn: "🚀 5·4·3·2·1 — Phóng!",
      launchNeedTask: "Ghi việc bạn đang né trước đã!",
      focusOn: "Đang tập trung:",
      focusDoneMsg: "🎉 +1 phiên! Đà đã có — chạy tiếp?",
      focusAgain: "Thêm 1 phiên nữa",
      focusStop: "Nghỉ, đủ rồi",
      startTip: "Mẹo: đừng đợi 'có hứng'. Hứng đến sau khi bắt đầu 2–3 phút, không phải trước.",

      rulesTitle: "Luật cá nhân",
      rulesSub: "Quyết định 1 lần, áp dụng mãi mãi. Mỗi luật là một quyết định bạn không bao giờ phải nghĩ lại.",
      ruleIf: "Nếu",
      ruleThen: "Thì",
      ruleIfPlaceholder: "VD: Đơn hàng lãi dưới 200k",
      ruleThenPlaceholder: "VD: Báo giá chuẩn, không thương lượng",
      ruleAdd: "＋ Thêm luật",
      ruleApplied: "Đã áp dụng ✓",
      ruleTimes: "{n} lần",
      ruleDeleteConfirm: "Xoá luật này?",

      journalTitle: "Nhật ký quyết định",
      journalSub: "Xem lại kết quả để não học được: quyết nhanh thường vẫn đúng.",
      jHowDidItGo: "Kết quả ra sao?",
      jGood: "👍 Tốt",
      jOk: "😐 Tạm",
      jBad: "👎 Tệ",
      jOutcomeGood: "👍 Kết quả tốt",
      jOutcomeOk: "😐 Tạm ổn",
      jOutcomeBad: "👎 Không ổn — có bài học",
      jChosen: "Đã chốt:",
      jPending: "Chưa chốt",
      jDeadline: "Hạn chốt:",
      jEmpty: "Chưa có quyết định nào. Qua tab 🎯 để bắt đầu!",
      jInsight: "💡 {pct}% quyết định nhanh của bạn cho kết quả ổn trở lên — cứ tin vào quyết nhanh, đừng nghĩ quá lâu.",
      jExport: "⬇ Xuất dữ liệu",
      jMarkDecided: "Chốt ngay",

      confirmReset: "Hủy phiên đang chạy?",
    },

    en: {
      appName: "QuickDecide",
      tabDecide: "Decide",
      tabStart: "Start",
      tabRules: "Rules",
      tabJournal: "Journal",

      statToday: "decided today",
      statAvg: "sec / decision",
      statFocus: "focus sessions",
      statStreak: "day streak",

      decideTitle: "What are you stuck on?",
      decideSub: "Answer up to 4 questions — the system tells you exactly how to handle it. No more overthinking.",
      decidePlaceholder: "E.g. Should I restock AC model X?",
      decideGo: "⚡ Classify in 30 seconds",
      decideNeedText: "Type what you're stuck on first!",

      q_twoMin: "Would doing it now take under 2 minutes?",
      q_twoMin_hint: "Replying to a message, approving, one short call…",
      q_onlyYou: "Does it have to be YOU who decides / does it?",
      q_onlyYou_hint: "If someone else can do it 80% as well → it doesn't.",
      q_reversible: "If you choose wrong, is it easy to fix?",
      q_reversible_hint: "Two-way door: refundable, cancellable, redoable → Yes.",
      q_matters: "Will this still matter in 10 months?",
      q_matters_hint: "Will future-you even remember this decision?",
      yes: "Yes",
      no: "No",

      v_now_badge: "Do it now",
      v_now_title: "Stop thinking — just do it!",
      v_now_why: "The 2-minute rule: deliberating over a sub-2-minute task costs more than doing it. You've already spent the time.",
      v_now_steps: ["Start the 2-minute timer below", "Do it now, no other tabs", "Come back and hit ✓"],
      v_now_timer: "Start 2-min timer & do it",

      v_delegate_badge: "Delegate",
      v_delegate_title: "This is not your job",
      v_delegate_why: "It doesn't require you → keeping it only clutters your head. Hand it to the right person with a clear deadline.",
      v_delegate_steps: ["Pick the best-fit person", "Send one message: the task, the expected result, the deadline", "Schedule a check-in — then forget it"],
      v_delegate_who: "Delegate to whom? (optional)",

      v_quick_badge: "Quick pick",
      v_quick_title: "Take the first 'good enough' option",
      v_quick_why: "It's fixable and forgettable in 10 months. Extra optimizing is pure waste — fast deciders beat perfect deciders.",
      v_quick_steps: ["Start the 5-minute timer below", "First option that meets the bar → take it", "Timer ends undecided → flip a coin"],
      v_quick_timer: "Start 5 min & commit",

      v_timebox_badge: "Timebox 15 min",
      v_timebox_title: "Important but fixable → good beats perfect",
      v_timebox_why: "This class of decision deserves 15 minutes — not 15 days. Structure it, then commit when time's up.",
      v_timebox_steps: ["Write at most 3 options", "One line of pros, one of cons each", "At 15 minutes: pick the one whose downside you can live with"],
      v_timebox_timer: "Start 15 min & commit",

      v_big_badge: "Big decision",
      v_big_title: "Hard to reverse + important → follow the protocol, don't circle",
      v_big_why: "These are ~5% of decisions. Rumination doesn't help — run the 4 steps below and commit by your deadline.",
      v_big_steps: ["Write the worst-case scenario — can you survive it?", "Can you run a small test first? (one order, one month, one client)", "Ask exactly ONE person with real experience", "Set a decide-by date below — when it hits, you commit"],
      v_big_deadline: "Decide-by date:",

      commitLabel: "What did you commit to?",
      commitPlaceholder: "E.g. Order 50 units, trial-sell for 2 weeks",
      commitBtn: "✓ Commit & log it",
      commitLater: "Save to journal, decide later",
      decidedIn: "Classified in {s} seconds",
      savedToast: "Logged to journal ✓",
      newDecision: "＋ New decision",

      timerRunning: "Running — focus and commit!",
      timerDone: "⏰ Time's up — commit now, no extensions!",
      timerCancel: "Cancel",
      timerFinish: "Done early ✓",

      startTitle: "Beat procrastination",
      startSub: "Your brain stalls because the task looks huge. Shrink it to one 5-minute step, then launch.",
      startTaskLabel: "What are you avoiding?",
      startTaskPlaceholder: "E.g. Prepare the quote for client A",
      startStepLabel: "Smallest step doable in 5 minutes?",
      startStepPlaceholder: "E.g. Open the old quote file, rename the client",
      chipOpen: "Open the file / doc",
      chipWrite: "Write the first sentence",
      chipCall: "Call / message one person",
      chipFind: "Look up one fact",
      chipList: "List 3 key points",
      durLabel: "Session length:",
      launchBtn: "🚀 5·4·3·2·1 — Launch!",
      launchNeedTask: "Write down what you're avoiding first!",
      focusOn: "Focusing on:",
      focusDoneMsg: "🎉 +1 session! Momentum is here — keep going?",
      focusAgain: "One more session",
      focusStop: "Stop, that's enough",
      startTip: "Tip: don't wait for motivation. It shows up 2–3 minutes AFTER you start, not before.",

      rulesTitle: "Personal rules",
      rulesSub: "Decide once, apply forever. Every rule is a decision you never have to think about again.",
      ruleIf: "If",
      ruleThen: "Then",
      ruleIfPlaceholder: "E.g. Order profit under $10",
      ruleThenPlaceholder: "E.g. Standard quote, no negotiation",
      ruleAdd: "＋ Add rule",
      ruleApplied: "Applied ✓",
      ruleTimes: "{n}×",
      ruleDeleteConfirm: "Delete this rule?",

      journalTitle: "Decision journal",
      journalSub: "Review outcomes so your brain learns: fast decisions are usually right anyway.",
      jHowDidItGo: "How did it go?",
      jGood: "👍 Good",
      jOk: "😐 OK",
      jBad: "👎 Bad",
      jOutcomeGood: "👍 Went well",
      jOutcomeOk: "😐 Was fine",
      jOutcomeBad: "👎 Went badly — lesson learned",
      jChosen: "Committed:",
      jPending: "Undecided",
      jDeadline: "Decide by:",
      jEmpty: "No decisions yet. Head to 🎯 to start!",
      jInsight: "💡 {pct}% of your fast decisions turned out fine or better — trust the quick call, skip the overthinking.",
      jExport: "⬇ Export data",
      jMarkDecided: "Commit now",

      confirmReset: "Cancel the running session?",
    },
  };

  const SEED_RULES = {
    vi: [
      { if: "Mua đồ dưới 500k và chắc chắn sẽ dùng", then: "Mua luôn — nghiên cứu tối đa 5 phút" },
      { if: "Email / tin nhắn công việc", then: "Chạm 1 lần: trả lời ngay, giao, hẹn lịch, hoặc xoá" },
      { if: "Lời mời họp không có mục đích rõ", then: "Hỏi lại agenda, không có thì từ chối" },
      { if: "Sau 21h có việc quan trọng cần quyết", then: "Ghi lại, sáng mai quyết — không quyết đêm" },
      { if: "Phân vân giữa 2 lựa chọn ngang nhau quá 10 phút", then: "Tung đồng xu và làm theo, không hối hận" },
      { if: "Việc nghĩ đến lần thứ 3 mà vẫn chưa làm", then: "Hoặc lên lịch giờ cụ thể ngay, hoặc bỏ hẳn" },
    ],
    en: [
      { if: "Purchase under $20 that I'll definitely use", then: "Just buy it — max 5 minutes of research" },
      { if: "Work email / message", then: "Touch once: reply, delegate, schedule, or delete" },
      { if: "Meeting invite with no clear purpose", then: "Ask for the agenda; none → decline" },
      { if: "Important decision after 9pm", then: "Write it down, decide in the morning — never at night" },
      { if: "Torn between two equal options for 10+ minutes", then: "Flip a coin and go — no regrets" },
      { if: "Thought about a task 3 times without doing it", then: "Either schedule an exact time now, or drop it for good" },
    ],
  };

  // ---------------------------------------------------------- store
  const KEY = "quyetnhanh.v1";

  function todayStr(d) {
    d = d || new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function defaultState() {
    return {
      lang: "vi",
      seeded: false,
      journal: [],   // {id, text, verdict, decidedAt, secondsToDecide, chosen, outcome, decideBy, who}
      rules: [],     // {id, if, then, used}
      focus: [],     // {date, count}
      lastFocusDate: null,
      streak: 0,
    };
  }

  let S;
  try {
    S = Object.assign(defaultState(), JSON.parse(localStorage.getItem(KEY) || "{}"));
  } catch (e) {
    S = defaultState();
  }
  if (!S.seeded) {
    S.rules = SEED_RULES[S.lang].map(function (r, i) {
      return { id: "seed" + i, if: r.if, then: r.then, used: 0 };
    });
    S.seeded = true;
    save();
  }

  function save() { localStorage.setItem(KEY, JSON.stringify(S)); }
  function t(key) { return (I18N[S.lang] && I18N[S.lang][key]) || I18N.vi[key] || key; }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---------------------------------------------------------- timers
  let ticker = null;
  function clearTicker() { if (ticker) { clearInterval(ticker); ticker = null; } }

  function fmtMMSS(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  // ---------------------------------------------------------- app state (per session)
  let activeTab = "decide";
  const wizard = { step: -1, text: "", answers: {}, startedAt: 0, verdict: null, seconds: 0 };
  const focus = { phase: "idle", task: "", step: "", dur: 25, left: 0, total: 0 };

  const $view = document.getElementById("view");
  const $stats = document.getElementById("statsStrip");

  // ---------------------------------------------------------- stats
  function focusToday() {
    const f = S.focus.find(function (x) { return x.date === todayStr(); });
    return f ? f.count : 0;
  }

  function renderStats() {
    const today = todayStr();
    const dToday = S.journal.filter(function (j) { return j.decidedAt && j.decidedAt.slice(0, 10) === today; }).length;
    const timed = S.journal.filter(function (j) { return j.secondsToDecide > 0; });
    const avg = timed.length
      ? Math.round(timed.reduce(function (a, j) { return a + j.secondsToDecide; }, 0) / timed.length)
      : 0;
    $stats.innerHTML =
      stat(dToday, t("statToday")) +
      stat(avg || "—", t("statAvg")) +
      stat(focusToday(), t("statFocus")) +
      stat(S.streak, t("statStreak"));
  }
  function stat(v, label) {
    return '<div class="stat"><b>' + v + "</b><span>" + label + "</span></div>";
  }

  // ---------------------------------------------------------- DECIDE tab
  const QUESTIONS = ["twoMin", "onlyYou", "reversible", "matters"];

  function computeVerdict(a) {
    if (a.twoMin) return "now";
    if (a.onlyYou === false) return "delegate";
    if (a.reversible === false && a.matters) return "big";
    if (a.matters) return "timebox";   // reversible (or skipped) + matters
    return "quick";                    // doesn't matter in 10 months
  }

  function renderDecide() {
    clearTicker();
    if (wizard.step === -1) {
      $view.innerHTML =
        '<div class="card">' +
        "<h2>" + t("decideTitle") + "</h2>" +
        '<p class="sub">' + t("decideSub") + "</p>" +
        '<textarea id="dText" rows="2" placeholder="' + esc(t("decidePlaceholder")) + '">' + esc(wizard.text) + "</textarea>" +
        '<div class="btn-row"><button class="btn" id="dGo">' + t("decideGo") + "</button></div>" +
        "</div>";
      function go() {
        const v = document.getElementById("dText").value.trim();
        if (!v) { alert(t("decideNeedText")); return; }
        wizard.text = v;
        wizard.step = 0;
        wizard.answers = {};
        wizard.startedAt = Date.now();
        wizard.verdict = null;
        renderDecide();
      }
      document.getElementById("dGo").addEventListener("click", go);
      // Enter submits (Shift+Enter for a newline) — one less tap
      document.getElementById("dText").addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(); }
      });
      return;
    }

    if (wizard.verdict) { renderVerdict(); return; }

    const qKey = QUESTIONS[wizard.step];
    let bars = "";
    for (let i = 0; i < QUESTIONS.length; i++) {
      bars += "<i" + (i <= wizard.step ? ' class="on"' : "") + "></i>";
    }
    $view.innerHTML =
      '<div class="card">' +
      '<div class="q-progress">' + bars + "</div>" +
      '<div class="decision-quote">“' + esc(wizard.text) + "”</div>" +
      '<div class="q-text">' + t("q_" + qKey) + "</div>" +
      '<div class="q-hint">' + t("q_" + qKey + "_hint") + "</div>" +
      '<div class="yn-row">' +
      '<button class="yn yes" id="qYes">' + t("yes") + "</button>" +
      '<button class="yn no" id="qNo">' + t("no") + "</button>" +
      "</div></div>";

    function answer(val) {
      wizard.answers[qKey] = val;
      // Short-circuit: verdict may be reachable before all questions
      if (qKey === "twoMin" && val) { finishWizard(); return; }
      if (qKey === "onlyYou" && !val) { finishWizard(); return; }
      if (wizard.step >= QUESTIONS.length - 1) { finishWizard(); return; }
      wizard.step++;
      renderDecide();
    }
    document.getElementById("qYes").addEventListener("click", function () { answer(true); });
    document.getElementById("qNo").addEventListener("click", function () { answer(false); });
  }

  function finishWizard() {
    wizard.seconds = Math.max(1, Math.round((Date.now() - wizard.startedAt) / 1000));
    wizard.verdict = computeVerdict(wizard.answers);
    renderDecide();
  }

  const VERDICT_TIMERS = { now: 2, quick: 5, timebox: 15 };

  function renderVerdict() {
    const v = wizard.verdict;
    const steps = t("v_" + v + "_steps");
    let stepsHtml = "";
    for (let i = 0; i < steps.length; i++) stepsHtml += "<li>" + steps[i] + "</li>";

    let extra = "";
    if (v === "delegate") {
      extra = '<label class="field-label">' + t("v_delegate_who") + '</label>' +
        '<input type="text" id="vWho">';
    }
    if (v === "big") {
      const dflt = todayStr(new Date(Date.now() + 3 * 864e5));
      extra = '<label class="field-label">' + t("v_big_deadline") + '</label>' +
        '<input type="date" id="vDeadline" value="' + dflt + '">';
    }

    let timerBtn = "";
    if (VERDICT_TIMERS[v]) {
      timerBtn = '<button class="btn secondary" id="vTimer">⏱ ' + t("v_" + v + "_timer") + "</button>";
    }

    $view.innerHTML =
      '<div class="card v-' + v + '">' +
      '<span class="verdict-badge">' + t("v_" + v + "_badge") + "</span>" +
      '<div class="decision-quote">“' + esc(wizard.text) + "”</div>" +
      '<div class="verdict-title">' + t("v_" + v + "_title") + "</div>" +
      '<div class="verdict-why">' + t("v_" + v + "_why") + "</div>" +
      '<ul class="verdict-steps">' + stepsHtml + "</ul>" +
      extra +
      '<div id="timerZone"></div>' +
      (timerBtn ? '<div class="btn-row">' + timerBtn + "</div>" : "") +
      '<div class="divider"></div>' +
      '<label class="field-label">' + t("commitLabel") + "</label>" +
      '<input type="text" id="vChosen" placeholder="' + esc(t("commitPlaceholder")) + '">' +
      '<div class="btn-row">' +
      '<button class="btn" id="vCommit">' + t("commitBtn") + "</button>" +
      "</div>" +
      '<div class="btn-row"><button class="btn secondary" id="vLater">' + t("commitLater") + "</button></div>" +
      '<div class="decide-time">' + t("decidedIn").replace("{s}", wizard.seconds) + "</div>" +
      "</div>";

    if (VERDICT_TIMERS[v]) {
      document.getElementById("vTimer").addEventListener("click", function () {
        runInlineTimer(VERDICT_TIMERS[v] * 60, document.getElementById("timerZone"));
        this.disabled = true;
      });
    }

    function saveEntry(chosen) {
      const entry = {
        id: uid(),
        text: wizard.text,
        verdict: v,
        decidedAt: new Date().toISOString(),
        secondsToDecide: wizard.seconds,
        chosen: chosen || "",
        outcome: null,
      };
      if (v === "delegate") {
        const who = document.getElementById("vWho").value.trim();
        if (who) entry.who = who;
      }
      if (v === "big") {
        entry.decideBy = document.getElementById("vDeadline").value || null;
      }
      S.journal.unshift(entry);
      save();
      wizard.step = -1;
      wizard.text = "";
      wizard.verdict = null;
      renderStats();
      renderDecide();
      toast(t("savedToast"));
    }

    document.getElementById("vCommit").addEventListener("click", function () {
      saveEntry(document.getElementById("vChosen").value.trim());
    });
    document.getElementById("vChosen").addEventListener("keydown", function (e) {
      if (e.key === "Enter") saveEntry(this.value.trim());
    });
    document.getElementById("vLater").addEventListener("click", function () { saveEntry(""); });
  }

  function runInlineTimer(totalSec, zone) {
    clearTicker();
    let left = totalSec;
    function draw() {
      const pct = Math.round(((totalSec - left) / totalSec) * 100);
      zone.innerHTML =
        '<div class="timer-box' + (left <= 30 ? " urgent" : "") + '">' +
        '<div class="timer-display">' + fmtMMSS(left) + "</div>" +
        '<div class="timer-label">' + (left > 0 ? t("timerRunning") : t("timerDone")) + "</div>" +
        '<div class="timer-bar"><i style="width:' + pct + '%"></i></div>' +
        "</div>";
    }
    draw();
    ticker = setInterval(function () {
      left--;
      if (left < 0) { clearTicker(); return; }
      draw();
      if (left === 0) {
        clearTicker();
        vibrate();
      }
    }, 1000);
  }

  // ---------------------------------------------------------- START tab (anti-procrastination)
  function renderStart() {
    clearTicker();

    if (focus.phase === "countdown") { renderLaunchCountdown(); return; }
    if (focus.phase === "running") { renderFocusRunning(); return; }
    if (focus.phase === "done") { renderFocusDone(); return; }

    const chips = ["chipOpen", "chipWrite", "chipCall", "chipFind", "chipList"];
    let chipsHtml = "";
    for (let i = 0; i < chips.length; i++) {
      chipsHtml += '<button class="chip" data-chip="' + chips[i] + '">' + t(chips[i]) + "</button>";
    }
    const durs = [5, 15, 25];
    let dursHtml = "";
    for (let i = 0; i < durs.length; i++) {
      dursHtml += '<button class="chip' + (focus.dur === durs[i] ? " on" : "") + '" data-dur="' + durs[i] + '">' + durs[i] + "′</button>";
    }

    $view.innerHTML =
      '<div class="card">' +
      "<h2>" + t("startTitle") + "</h2>" +
      '<p class="sub">' + t("startSub") + "</p>" +
      '<label class="field-label">' + t("startTaskLabel") + "</label>" +
      '<input type="text" id="fTask" placeholder="' + esc(t("startTaskPlaceholder")) + '" value="' + esc(focus.task) + '">' +
      '<label class="field-label">' + t("startStepLabel") + "</label>" +
      '<input type="text" id="fStep" placeholder="' + esc(t("startStepPlaceholder")) + '" value="' + esc(focus.step) + '">' +
      '<div class="chips">' + chipsHtml + "</div>" +
      '<label class="field-label">' + t("durLabel") + "</label>" +
      '<div class="chips" id="durChips">' + dursHtml + "</div>" +
      '<div class="btn-row"><button class="btn" id="fLaunch">' + t("launchBtn") + "</button></div>" +
      '<p class="sub" style="margin-top:12px">' + t("startTip") + "</p>" +
      "</div>";

    $view.querySelectorAll("[data-chip]").forEach(function (c) {
      c.addEventListener("click", function () {
        document.getElementById("fStep").value = t(c.getAttribute("data-chip"));
      });
    });
    $view.querySelectorAll("[data-dur]").forEach(function (c) {
      c.addEventListener("click", function () {
        focus.dur = parseInt(c.getAttribute("data-dur"), 10);
        focus.task = document.getElementById("fTask").value;
        focus.step = document.getElementById("fStep").value;
        renderStart();
      });
    });
    function launch() {
      const task = document.getElementById("fTask").value.trim();
      if (!task) { alert(t("launchNeedTask")); return; }
      focus.task = task;
      focus.step = document.getElementById("fStep").value.trim();
      focus.phase = "countdown";
      renderStart();
    }
    document.getElementById("fLaunch").addEventListener("click", launch);
    document.getElementById("fStep").addEventListener("keydown", function (e) {
      if (e.key === "Enter") launch();
    });
  }

  function renderLaunchCountdown() {
    let n = 5;
    $view.innerHTML =
      '<div class="card"><div class="countdown-launch" id="cd">5</div></div>';
    const el = document.getElementById("cd");
    ticker = setInterval(function () {
      n--;
      if (n <= 0) {
        clearTicker();
        focus.phase = "running";
        focus.total = focus.dur * 60;
        focus.left = focus.total;
        vibrate();
        renderStart();
        return;
      }
      el.textContent = n;
    }, 1000);
  }

  function renderFocusRunning() {
    $view.innerHTML =
      '<div class="card">' +
      '<p class="sub">' + t("focusOn") + " <b>" + esc(focus.task) + "</b>" +
      (focus.step ? "<br>→ " + esc(focus.step) : "") + "</p>" +
      '<div class="timer-box" id="fBox"></div>' +
      '<div class="btn-row">' +
      '<button class="btn" id="fDone">' + t("timerFinish") + "</button>" +
      '<button class="btn danger-ghost" id="fCancel">' + t("timerCancel") + "</button>" +
      "</div></div>";

    const box = document.getElementById("fBox");
    function draw() {
      const pct = Math.round(((focus.total - focus.left) / focus.total) * 100);
      box.innerHTML =
        '<div class="timer-display">' + fmtMMSS(focus.left) + "</div>" +
        '<div class="timer-bar"><i style="width:' + pct + '%"></i></div>';
    }
    draw();
    ticker = setInterval(function () {
      focus.left--;
      if (focus.left <= 0) {
        clearTicker();
        completeFocusSession();
        return;
      }
      draw();
    }, 1000);

    document.getElementById("fDone").addEventListener("click", function () {
      clearTicker();
      completeFocusSession();
    });
    document.getElementById("fCancel").addEventListener("click", function () {
      if (!confirm(t("confirmReset"))) return;
      clearTicker();
      focus.phase = "idle";
      renderStart();
    });
  }

  function completeFocusSession() {
    const today = todayStr();
    let f = S.focus.find(function (x) { return x.date === today; });
    if (!f) { f = { date: today, count: 0 }; S.focus.push(f); }
    f.count++;
    // streak: consecutive days with >= 1 session
    if (S.lastFocusDate !== today) {
      const yest = todayStr(new Date(Date.now() - 864e5));
      S.streak = S.lastFocusDate === yest ? S.streak + 1 : 1;
      S.lastFocusDate = today;
    }
    save();
    vibrate();
    focus.phase = "done";
    renderStats();
    renderStart();
  }

  function renderFocusDone() {
    $view.innerHTML =
      '<div class="card" style="text-align:center">' +
      '<div style="font-size:2.6rem;margin-bottom:8px">🎉</div>' +
      "<h2>" + t("focusDoneMsg") + "</h2>" +
      '<div class="btn-row" style="margin-top:16px">' +
      '<button class="btn" id="fAgain">' + t("focusAgain") + "</button>" +
      '<button class="btn secondary" id="fStop">' + t("focusStop") + "</button>" +
      "</div></div>";
    document.getElementById("fAgain").addEventListener("click", function () {
      focus.phase = "countdown";
      renderStart();
    });
    document.getElementById("fStop").addEventListener("click", function () {
      focus.phase = "idle";
      focus.task = "";
      focus.step = "";
      renderStart();
    });
  }

  // ---------------------------------------------------------- RULES tab
  function renderRules() {
    clearTicker();
    let cards = "";
    for (let i = 0; i < S.rules.length; i++) {
      const r = S.rules[i];
      cards +=
        '<div class="rule-card">' +
        '<div class="rule-body">' +
        '<div class="rule-if">' + t("ruleIf") + '</div>' +
        '<div class="rule-text">' + esc(r.if) + "</div>" +
        '<div class="rule-then">' + t("ruleThen") + '</div>' +
        '<div class="rule-text">' + esc(r.then) + "</div>" +
        "</div>" +
        '<div class="rule-side">' +
        '<button class="rule-use" data-use="' + r.id + '">' + t("ruleApplied") + "</button>" +
        '<span class="rule-count">' + t("ruleTimes").replace("{n}", r.used) + "</span>" +
        '<button class="rule-del" data-del="' + r.id + '">🗑</button>' +
        "</div></div>";
    }

    $view.innerHTML =
      '<div class="card">' +
      "<h2>" + t("rulesTitle") + "</h2>" +
      '<p class="sub">' + t("rulesSub") + "</p>" +
      '<label class="field-label">' + t("ruleIf") + "…</label>" +
      '<input type="text" id="rIf" placeholder="' + esc(t("ruleIfPlaceholder")) + '">' +
      '<label class="field-label">' + t("ruleThen") + "…</label>" +
      '<input type="text" id="rThen" placeholder="' + esc(t("ruleThenPlaceholder")) + '">' +
      '<div class="btn-row"><button class="btn" id="rAdd">' + t("ruleAdd") + "</button></div>" +
      "</div>" +
      cards;

    function addRule() {
      const rIf = document.getElementById("rIf").value.trim();
      const rThen = document.getElementById("rThen").value.trim();
      if (!rIf || !rThen) return;
      S.rules.unshift({ id: uid(), if: rIf, then: rThen, used: 0 });
      save();
      renderRules();
    }
    document.getElementById("rAdd").addEventListener("click", addRule);
    document.getElementById("rThen").addEventListener("keydown", function (e) {
      if (e.key === "Enter") addRule();
    });
    $view.querySelectorAll("[data-use]").forEach(function (b) {
      b.addEventListener("click", function () {
        const r = S.rules.find(function (x) { return x.id === b.getAttribute("data-use"); });
        if (r) { r.used++; save(); renderRules(); }
      });
    });
    $view.querySelectorAll("[data-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!confirm(t("ruleDeleteConfirm"))) return;
        S.rules = S.rules.filter(function (x) { return x.id !== b.getAttribute("data-del"); });
        save();
        renderRules();
      });
    });
  }

  // ---------------------------------------------------------- JOURNAL tab
  function renderJournal() {
    clearTicker();
    const fmt = new Intl.DateTimeFormat(S.lang === "vi" ? "vi-VN" : "en-US", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });

    // insight: % of quick-class decisions (now/quick/timebox) reviewed as ok-or-better
    const fast = S.journal.filter(function (j) {
      return (j.verdict === "quick" || j.verdict === "now" || j.verdict === "timebox") && j.outcome;
    });
    let insight = "";
    if (fast.length >= 3) {
      const fine = fast.filter(function (j) { return j.outcome === "good" || j.outcome === "ok"; }).length;
      const pct = Math.round((fine / fast.length) * 100);
      insight = '<div class="insight">' + t("jInsight").replace("{pct}", pct) + "</div>";
    }

    let entries = "";
    for (let i = 0; i < S.journal.length; i++) {
      const j = S.journal[i];
      let outcomeHtml;
      if (j.outcome) {
        const key = j.outcome === "good" ? "jOutcomeGood" : j.outcome === "ok" ? "jOutcomeOk" : "jOutcomeBad";
        outcomeHtml = '<div class="j-outcome ' + j.outcome + '">' + t(key) + "</div>";
      } else {
        outcomeHtml =
          '<div class="j-review"><span>' + t("jHowDidItGo") + "</span>" +
          '<button data-out="good" data-id="' + j.id + '">' + t("jGood") + "</button>" +
          '<button data-out="ok" data-id="' + j.id + '">' + t("jOk") + "</button>" +
          '<button data-out="bad" data-id="' + j.id + '">' + t("jBad") + "</button>" +
          "</div>";
      }
      const chosenHtml = j.chosen
        ? '<div class="j-chosen">' + t("jChosen") + " <b>" + esc(j.chosen) + "</b>" + (j.who ? " → " + esc(j.who) : "") + "</div>"
        : '<div class="j-chosen">' + t("jPending") +
          (j.decideBy ? " · " + t("jDeadline") + " <b>" + esc(j.decideBy) + "</b>" : "") +
          ' <button class="btn small secondary" data-decide="' + j.id + '" style="margin-left:6px">' + t("jMarkDecided") + "</button></div>";

      entries +=
        '<div class="j-entry">' +
        '<div class="j-head"><div class="j-text">' + esc(j.text) + '</div>' +
        '<div class="j-date">' + fmt.format(new Date(j.decidedAt)) + "</div></div>" +
        '<div class="j-meta">' +
        '<span class="j-tag t-' + j.verdict + '">' + t("v_" + j.verdict + "_badge") + "</span>" +
        (j.secondsToDecide ? '<span class="j-tag">⏱ ' + j.secondsToDecide + "s</span>" : "") +
        "</div>" +
        chosenHtml +
        outcomeHtml +
        "</div>";
    }

    $view.innerHTML =
      '<div class="section-head"><h2>' + t("journalTitle") + "</h2>" +
      '<button class="btn small secondary" id="jExport">' + t("jExport") + "</button></div>" +
      '<p class="sub">' + t("journalSub") + "</p>" +
      insight +
      (entries || '<div class="empty"><span class="big">📓</span>' + t("jEmpty") + "</div>");

    $view.querySelectorAll("[data-out]").forEach(function (b) {
      b.addEventListener("click", function () {
        const j = S.journal.find(function (x) { return x.id === b.getAttribute("data-id"); });
        if (j) { j.outcome = b.getAttribute("data-out"); save(); renderJournal(); }
      });
    });
    $view.querySelectorAll("[data-decide]").forEach(function (b) {
      b.addEventListener("click", function () {
        const j = S.journal.find(function (x) { return x.id === b.getAttribute("data-decide"); });
        if (!j) return;
        const chosen = prompt(t("commitLabel"));
        if (chosen && chosen.trim()) { j.chosen = chosen.trim(); save(); renderJournal(); }
      });
    });
    document.getElementById("jExport").addEventListener("click", exportData);
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "quyet-nhanh-" + todayStr() + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ---------------------------------------------------------- shell
  function toast(msg) {
    const el = document.createElement("div");
    el.textContent = msg;
    el.style.cssText =
      "position:fixed;left:50%;bottom:90px;transform:translateX(-50%);" +
      "background:var(--text);color:var(--bg);padding:10px 20px;border-radius:999px;" +
      "font-weight:700;font-size:.9rem;z-index:99;box-shadow:var(--shadow);";
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2200);
  }

  function vibrate() {
    if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
  }

  const RENDER = { decide: renderDecide, start: renderStart, rules: renderRules, journal: renderJournal };

  function showTab(name) {
    activeTab = name;
    document.querySelectorAll(".tab").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-tab") === name);
    });
    RENDER[name]();
  }

  function renderChrome() {
    document.title = t("appName") + " · Decision Autopilot";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.getElementById("langToggle").textContent = S.lang === "vi" ? "EN" : "VI";
    renderStats();
  }

  document.querySelectorAll(".tab").forEach(function (b) {
    b.addEventListener("click", function () { showTab(b.getAttribute("data-tab")); });
  });

  document.getElementById("langToggle").addEventListener("click", function () {
    S.lang = S.lang === "vi" ? "en" : "vi";
    save();
    renderChrome();
    RENDER[activeTab]();
  });

  // ---------------------------------------------------------- boot
  renderChrome();
  showTab("decide");

  // Offline support when served over http(s) — skipped on file://
  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
})();
