/* Lovely Math — interface strings in English and Turkish, and the language switch.
   Content (walkthroughs, cards, tests) is translated separately and sealed per language. */
(function () {
  'use strict';
  const KEY = 'lm:lang';
  let lang = 'en';
  try { lang = localStorage.getItem(KEY) === 'tr' ? 'tr' : 'en'; } catch (e) { /* default */ }

  const EN = {
    'nav.patterns': 'Patterns', 'nav.labs': 'Labs', 'nav.finder': 'Method finder', 'nav.toolbox': 'Toolbox', 'nav.test': 'Test room', 'nav.plan': '7-day plan',
    'logout': 'Log out', 'petals.title': 'Falling petals on/off', 'petals.on': 'Petals on ✿', 'petals.off': 'Petals off', 'lang.label': 'Language',
    'gate.kicker': 'MAT 1330 study garden', 'gate.sub': 'This little garden is private. Sign in to come in ♡', 'gate.name': 'Name', 'gate.password': 'Password',
    'gate.enter': 'Enter the garden ♡', 'gate.note': 'You stay signed in on this device, and your progress saves automatically.',
    'gate.nocrypto': 'This garden needs a modern browser, opened over https or from a local file.', 'gate.welcome': 'welcome back… ♡',
    'gate.both': 'Both fields, please ♡', 'gate.opening': 'opening the garden gate… ✿',
    'gate.wrong1': 'Not quite… try again ♡', 'gate.wrong2': 'Hmm, that’s not it ✿', 'gate.wrong3': 'Check the name and password once more ♡',
    'hero.kicker': 'MAT 1330 · Calculus for the Life Sciences I · uOttawa', 'hero.ribbon': 'THINK · SOLVE · ACHIEVE',
    'hero.sub': 'A study garden built from real past-exam patterns. Learn the handful of question types that keep coming back, practice them until they feel easy, then test yourself.',
    'hero.cta1': 'See the exam patterns ✿', 'hero.cta2': 'Enter the test room ♡', 'hero.quote': 'The only way to learn mathematics is to <em>do</em> mathematics.',
    'greet.morning': 'Good morning', 'greet.afternoon': 'Good afternoon', 'greet.evening': 'Good evening',
    'greet.progress': '{done} of 14 families mastered so far.', 'greet.start': 'One family at a time.', 'welcome': 'Welcome back, {name} ♡',
    'tip.pyth': '<strong>Pythagoras.</strong> The distance formula in disguise: the distance from (0,0) to (x, y) is √(x² + y²).',
    'tip.power': '<strong>Power rule.</strong> d/dx xⁿ = n·xⁿ⁻¹, so d/dx x² = 2x. The slope of a parabola grows linearly.',
    'tip.line': '<strong>Lines.</strong> m is the slope (rise over run), b the intercept. Every tangent line is one of these: y = f(a) + f′(a)(x − a).',
    'tip.deriv': '<strong>The derivative.</strong> The slope of the secant line as the gap h shrinks to 0. Try it in the Tangent Lab.',
    'tip.pi': '<strong>π.</strong> Period of sin(bt) is 2π/b. That is how a model with a 24-hour rhythm picks its b = 2π/24.',
    'tip.gauss': '<strong>Young Gauss</strong> reportedly summed 1 to 100 in seconds by pairing numbers: 1+100, 2+99, … 50 pairs of 101 = 5050.',
    'tip.e': '<strong>e ≈ 2.71828.</strong> The one base where the slope of eˣ equals its height: d/dx eˣ = eˣ.',
    'tip.sqrt': '<strong>√x</strong> is x to the power ½, so its derivative is ½x^(−½) = 1/(2√x). That slope blows up at x = 0, so the derivative does not exist there.',
    'tip.area': '<strong>Area and volume.</strong> dA/dr = 2πr is the circumference, and dV/dr = 4πr² is the surface area. Derivatives everywhere!',
    'pat.kicker': 'What keeps coming back', 'pat.title': 'The <span class="swash">exam patterns</span>',
    'pat.lead': 'Each card is a question family found across past MAT 1330 papers. Tap one to walk through how to solve it, one step at a time.',
    'filter.all': 'All', 'filter.aria': 'Filter question families', 'pat.lab': 'has a lab', 'pat.solved': 'your turn ✓', 'pat.cue': 'open the walkthrough →', 'pat.openAria': 'Open walkthrough:',
    'conf.1': 'low confidence', 'conf.2': 'medium confidence', 'conf.3': 'high confidence', 'mastered.badge': 'mastered ♥',
    'wt.close': 'Close walkthrough', 'wt.testing': 'What it is really testing:', 'wt.spot': 'How to spot it', 'wt.example': 'Worked example (original)',
    'wt.solve': 'Solve it with me, one step at a time', 'wt.back': '◀ Back', 'wt.all': 'Show all steps', 'wt.next': 'Show step {n} ✿', 'wt.done': 'All steps shown ♡',
    'wt.status': 'Showing step {n} of {total}', 'wt.trap': 'Watch out:', 'why': 'why?', 'wt.check': 'Check your answer', 'wt.mistakes': 'Common mistakes',
    'wt.vary': 'How examiners vary it', 'wt.breaks': 'When the template breaks', 'wt.prereq': 'Know these first', 'wt.lab': 'Open the matching lab →',
    'try.title': 'Your turn', 'try.placeholder': 'your answer', 'try.check': 'Check ♡', 'try.hint': 'Hint', 'hint.label': 'Hint:',
    'try.invalid': 'Type a number or expression, e.g. 3/4 or ln(2)/0.3', 'try.good': 'Yes! Lovely work ♡', 'try.bad': 'Not yet. Check the steps above and try again ✿',
    'master.yes': 'I can do this now ♡', 'master.done': 'Mastered ♡ (tap to undo)', 'master.toast': 'Added to your mastered list ✿',
    'labs.kicker': 'Play with the ideas', 'labs.title': 'Little <span class="swash">math labs</span>',
    'labs.lead': 'Drag the sliders and watch the mathematics move. Each lab matches one of the exam patterns.',
    'find.kicker': 'When you see this…', 'find.title': '…<span class="swash">try this method</span>',
    'find.lead': 'Flip a card to see which method a phrase usually signals. Search a word from a question to find the right card.',
    'find.placeholder': 'Try: stable, maximize, ‘each hour’, limit…', 'find.label': 'Search the method cards', 'find.see': 'When you see', 'find.think': 'Consider', 'find.flip': 'tap to flip →',
    'tool.kicker': 'Your pencil case', 'tool.title': 'The <span class="swash">toolbox</span>',
    'tool.lead': 'A working pink calculator and a pocket formula sheet. Check the exam rules on calculators before relying on one.',
    'tool.formulas': 'Pocket formula sheet', 'tool.calcnote': 'psst… type on your keyboard too ♡', 'calc.cheers': '1 ♡ U|U CAN DO IT|SO PROUD ✿|KEEP GOING|BRAIN: 100%|A+ VIBES',
    'test.kicker': 'Practice under exam conditions', 'test.title': 'The <span class="swash">test room</span>',
    'test.lead': 'Original exam-style questions written for this garden (not copies of past papers). Hints are free, and each full worked solution waits behind its own button, so try first.',
    'test.signedin': 'You’re signed in, so every worked solution opens with one tap. Attempt the question first ♡', 'test.tabsAria': 'Practice tests',
    'q.prefix': 'Q', 'test.questions': '{n} questions', 'test.marks': '{n} marks', 'test.mark1': '1 mark', 'test.minutes': '{n} min suggested',
    'timer.start': 'Start timer', 'timer.pause': 'Pause timer', 'timer.resume': 'Resume timer', 'timer.done': 'Time! Pencils down ♡',
    'sol.show': 'Show full solution', 'sol.hide': 'Hide solution', 'sol.title': 'Full worked solution', 'sol.missing': 'This solution is missing.',
    'sol.error': 'Could not open that solution.', 'sol.signin': 'Please sign in again ♡',
    'score.got': 'Got it', 'score.partly': 'Partly', 'score.missed': 'Missed', 'score.aria': 'How did this question go?',
    'score.title': 'Your self-check: {pct}%', 'score.sub': '{n} of {total} questions marked. Weakest families first, so you know what to review:',
    'plan.kicker': 'One week, one family at a time', 'plan.title': 'Your <span class="swash">7-day plan</span>',
    'plan.lead': 'Tick things off as you go. Progress saves automatically on this device.',
    'plan.cheer0': 'Every tick is a tiny win ♡', 'plan.cheer1': 'Lovely start, keep going ♡', 'plan.cheer2': 'Over halfway. So proud of you ✿', 'plan.cheer3': 'All done! Go get that exam ♡',
    'foot.sign': 'with love & limits', 'foot.made': 'Made for MAT 1330 · University of Ottawa',
    // labs
    'lab.tab.cobweb': 'Cobweb garden', 'lab.tab.tangent': 'Secant → tangent', 'lab.tab.taylor': 'Tangent line & Taylor', 'lab.tab.optimize': 'Find the best',
    'lab.tab.newton': 'Newton’s method', 'lab.tab.area': 'Area & FTC', 'lab.tab.rhythm': 'Seasonal rhythms',
    'lab.cobweb.intro': 'Pick an updating function, set a starting value and watch the cobweb. The derivative at each equilibrium tells you whether solutions are pulled in or pushed away.',
    'lab.model': 'Model', 'lab.m.linear': 'Linear: dose or harvest, xₜ₊₁ = a·xₜ + b', 'lab.m.logistic': 'Logistic: xₜ₊₁ = r·xₜ(1 − xₜ)',
    'lab.m.bh': 'Saturating (Beverton–Holt): xₜ₊₁ = r·xₜ / (1 + xₜ)', 'lab.m.ricker': 'Ricker: xₜ₊₁ = r·xₜ·e^(−xₜ)',
    'lab.p.a': 'a (fraction kept / growth factor)', 'lab.p.b': 'b (dose added, or −harvest)', 'lab.p.r': 'r (growth parameter)', 'lab.p.rmax': 'r (maximum per-capita growth)',
    'lab.x0': 'starting value x₀', 'lab.steps': 'number of steps', 'lab.animate': 'Animate the cobweb ✿', 'lab.eq.head': 'Equilibria (where f(x*) = x*):', 'lab.eq.none': 'none in view',
    'lab.v.stableOsc': 'stable, oscillating approach', 'lab.v.stableMono': 'stable, monotone approach', 'lab.v.unstableOsc': 'unstable, oscillating away',
    'lab.v.unstable': 'unstable', 'lab.v.inconclusive': '|f′| = 1: the test is inconclusive',
    'lab.tangent.intro': 'The derivative is the slope the secant line settles on as h shrinks. Slide h toward 0, or drag the point along the curve.',
    'lab.function': 'Function', 'lab.pointA': 'point a', 'lab.gapH': 'gap h', 'lab.secantSlope': 'secant slope', 'lab.tangentSlope': 'tangent slope',
    'lab.dq': 'difference quotient', 'lab.legend': 'purple = secant · green dashes = tangent',
    'lab.taylor.intro': 'Degree 1 is the tangent line (the linearization). Raise the degree and watch the polynomial hug the curve near the centre a.',
    'lab.centre': 'centre a', 'lab.degree': 'degree n', 'lab.estAt': 'estimate at x', 'lab.true': 'true', 'lab.estimate': 'estimate', 'lab.error': 'error',
    'lab.opt.intro': 'Closed-interval method: check where f′ = 0 (or does not exist), then compare with the endpoints. Drag the point to feel the slope change sign.',
    'lab.o.harvest': 'Harvest yield: Y(E) = E·(1 − E/2)', 'lab.o.drug': 'Drug level: C(t) = 5t·e^(−t/2)', 'lab.o.forage': 'Foraging rate: R(t) = (t/(t+1)) / (t + 2)',
    'lab.o.cubic': 'Cubic on [−1, 3]: f(x) = x³ − 3x² + 1', 'lab.o.effort': 'effort E', 'lab.o.time': 'time t (h)', 'lab.o.patch': 'patch time t',
    'lab.move': 'move the point', 'lab.slopeHere': 'slope here', 'lab.rising': 'rising ↗', 'lab.falling': 'falling ↘', 'lab.flat': 'flat: a critical point!',
    'lab.candidate': 'candidate', 'lab.endpoint': 'endpoint', 'lab.critical': 'critical point', 'lab.absMax': 'absolute max {v} at x = {x}', 'lab.absMin': 'absolute min {v} at x = {x}',
    'lab.newton.intro': 'Each step slides down the tangent line to where it crosses the x-axis: xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ).',
    'lab.equation': 'Equation f(x) = 0', 'lab.n.sqrt2': 'x² − 2 (find √2)', 'lab.firstGuess': 'first guess x₀', 'lab.stepsShown': 'steps shown',
    'lab.flatFail': 'f′ = 0: the tangent is flat, so Newton fails here', 'lab.lastStep': 'f(x) at the last step',
    'lab.area.intro': 'Rectangles estimate the area; the Fundamental Theorem gives it exactly: F(b) − F(a), where F′ = f. Add rectangles and watch the estimate close in.',
    'lab.integrand': 'Integrand', 'lab.a.x2': 'f(x) = x² on [0, b]', 'lab.a.xex': 'f(x) = x·e⁻ˣ on [0, b] (by parts)', 'lab.a.inv': 'f(x) = 1/x on [1, b]', 'lab.a.sin': 'f(x) = sin x on [0, b]',
    'lab.upper': 'upper limit b', 'lab.rects': 'rectangles n', 'lab.heights': 'Heights from', 'lab.left': 'left endpoints', 'lab.right': 'right endpoints', 'lab.mid': 'midpoints',
    'lab.rule.left': 'left', 'lab.rule.right': 'right', 'lab.rule.mid': 'mid', 'lab.riemann': 'Riemann sum ({rule}, n = {n})', 'lab.exact': 'Exact by FTC: F(b) − F(a) with F(x) = {F}',
    'lab.rhythm.intro': 'A cosine model T(t) = M + A·cos(2π(t − t₀)/P): M is the average, A the amplitude, P the period and t₀ the time of the peak. The derivative tells you how fast things change.',
    'lab.r.M': 'average M (°C)', 'lab.r.A': 'amplitude A (°C)', 'lab.r.P': 'period P (months)', 'lab.r.t0': 'peak time t₀ (month)', 'lab.r.t': 'look at month t',
    'lab.r.note': 'Illustrative numbers only, not real weather data.', 'lab.r.months': 't (months)', 'lab.r.rate': 'rate', 'lab.r.perMonth': '°C per month',
    'lab.r.maxAt': 'max {max} °C at t = {t0} (+ every {P} months) · min {min} °C', 'lab.r.fastest': 'fastest change: ±{r} °C/month, a quarter-period from each peak'
  };

  const TR = {
    'nav.patterns': 'Kalıplar', 'nav.labs': 'Laboratuvar', 'nav.finder': 'Yöntem bulucu', 'nav.toolbox': 'Araç kutusu', 'nav.test': 'Sınav odası', 'nav.plan': '7 günlük plan',
    'logout': 'Çıkış yap', 'petals.title': 'Düşen yapraklar açık/kapalı', 'petals.on': 'Yapraklar açık ✿', 'petals.off': 'Yapraklar kapalı', 'lang.label': 'Dil',
    'gate.kicker': 'MAT 1330 çalışma bahçesi', 'gate.sub': 'Bu küçük bahçe özel. İçeri girmek için giriş yap ♡', 'gate.name': 'Ad', 'gate.password': 'Şifre',
    'gate.enter': 'Bahçeye gir ♡', 'gate.note': 'Bu cihazda oturumun açık kalır ve ilerlemen otomatik olarak kaydedilir.',
    'gate.nocrypto': 'Bu bahçe için güncel bir tarayıcı gerekiyor; sayfayı https üzerinden ya da yerel dosyadan aç.', 'gate.welcome': 'tekrar hoş geldin… ♡',
    'gate.both': 'İki alanı da doldur lütfen ♡', 'gate.opening': 'bahçe kapısı açılıyor… ✿',
    'gate.wrong1': 'Tam olmadı… bir daha dene ♡', 'gate.wrong2': 'Hmm, bu değil ✿', 'gate.wrong3': 'Adı ve şifreyi bir kez daha kontrol et ♡',
    'hero.kicker': 'MAT 1330 · Yaşam Bilimleri için Kalkülüs I · uOttawa', 'hero.ribbon': 'DÜŞÜN · ÇÖZ · BAŞAR',
    'hero.sub': 'Gerçek geçmiş sınavların kalıplarından kurulmuş bir çalışma bahçesi. Sürekli karşına çıkan birkaç soru tipini öğren, kolaylaşana kadar çalış, sonra kendini sına.',
    'hero.cta1': 'Sınav kalıplarını gör ✿', 'hero.cta2': 'Sınav odasına gir ♡', 'hero.quote': 'Matematiği öğrenmenin tek yolu matematik <em>yapmaktır</em>.',
    'greet.morning': 'Günaydın', 'greet.afternoon': 'İyi günler', 'greet.evening': 'İyi akşamlar',
    'greet.progress': 'Şu ana kadar 14 ailenin {done} tanesinde ustalaştın.', 'greet.start': 'Her seferinde bir aile.', 'welcome': 'Tekrar hoş geldin, {name} ♡',
    'tip.pyth': '<strong>Pisagor.</strong> Kılık değiştirmiş uzaklık formülü: (0,0) ile (x, y) arasındaki uzaklık √(x² + y²).',
    'tip.power': '<strong>Kuvvet kuralı.</strong> d/dx xⁿ = n·xⁿ⁻¹, yani d/dx x² = 2x. Parabolün eğimi doğrusal olarak büyür.',
    'tip.line': '<strong>Doğrular.</strong> m eğim (dikey değişim / yatay değişim), b kesim noktası. Her teğet doğrusu böyledir: y = f(a) + f′(a)(x − a).',
    'tip.deriv': '<strong>Türev.</strong> h aralığı 0’a küçülürken kesen doğrusunun eğimi. Teğet laboratuvarında dene.',
    'tip.pi': '<strong>π.</strong> sin(bt)’nin periyodu 2π/b’dir. 24 saatlik ritmi olan bir model b = 2π/24’ü böyle seçer.',
    'tip.gauss': 'Anlatılana göre <strong>genç Gauss</strong> 1’den 100’e kadar sayıları eşleyerek saniyeler içinde topladı: 1+100, 2+99, … 101’lik 50 çift = 5050.',
    'tip.e': '<strong>e ≈ 2.71828.</strong> eˣ’in eğiminin yüksekliğine eşit olduğu tek taban: d/dx eˣ = eˣ.',
    'tip.sqrt': '<strong>√x</strong>, x’in ½. kuvvetidir; türevi ½x^(−½) = 1/(2√x). Bu eğim x = 0’da sonsuza gider, yani orada türev yoktur.',
    'tip.area': '<strong>Alan ve hacim.</strong> dA/dr = 2πr çevreyi, dV/dr = 4πr² yüzey alanını verir. Türevler her yerde!',
    'pat.kicker': 'Tekrar tekrar gelenler', 'pat.title': '<span class="swash">Sınav kalıpları</span>',
    'pat.lead': 'Her kart, geçmiş MAT 1330 sınavlarında bulunan bir soru ailesidir. Nasıl çözüleceğini adım adım görmek için birine dokun.',
    'filter.all': 'Tümü', 'filter.aria': 'Soru ailelerini filtrele', 'pat.lab': 'laboratuvarı var', 'pat.solved': 'sıra sende ✓', 'pat.cue': 'adım adım çözümü aç →', 'pat.openAria': 'Adım adım çözümü aç:',
    'conf.1': 'düşük güven', 'conf.2': 'orta güven', 'conf.3': 'yüksek güven', 'mastered.badge': 'ustalaştın ♥',
    'wt.close': 'Kapat', 'wt.testing': 'Asıl sınanan:', 'wt.spot': 'Nasıl tanınır', 'wt.example': 'Çözümlü örnek (özgün)',
    'wt.solve': 'Benimle adım adım çöz', 'wt.back': '◀ Geri', 'wt.all': 'Tüm adımları göster', 'wt.next': '{n}. adımı göster ✿', 'wt.done': 'Tüm adımlar gösterildi ♡',
    'wt.status': '{total} adımdan {n}. adım gösteriliyor', 'wt.trap': 'Dikkat:', 'why': 'neden?', 'wt.check': 'Cevabını kontrol et', 'wt.mistakes': 'Sık yapılan hatalar',
    'wt.vary': 'Sınavda nasıl değiştirilir', 'wt.breaks': 'Kalıp ne zaman işe yaramaz', 'wt.prereq': 'Önce bunları bil', 'wt.lab': 'İlgili laboratuvarı aç →',
    'try.title': 'Sıra sende', 'try.placeholder': 'cevabın', 'try.check': 'Kontrol et ♡', 'try.hint': 'İpucu', 'hint.label': 'İpucu:',
    'try.invalid': 'Bir sayı ya da ifade yaz, ör. 3/4 veya ln(2)/0.3', 'try.good': 'Evet! Harika iş ♡', 'try.bad': 'Henüz değil. Yukarıdaki adımlara bak ve tekrar dene ✿',
    'master.yes': 'Artık bunu yapabiliyorum ♡', 'master.done': 'Ustalaştın ♡ (geri almak için dokun)', 'master.toast': 'Ustalaştıkların listesine eklendi ✿',
    'labs.kicker': 'Fikirlerle oyna', 'labs.title': 'Küçük <span class="swash">matematik laboratuvarları</span>',
    'labs.lead': 'Kaydırıcıları sürükle ve matematiğin hareketini izle. Her laboratuvar bir sınav kalıbına karşılık gelir.',
    'find.kicker': 'Bunu gördüğünde…', 'find.title': '…<span class="swash">bu yöntemi dene</span>',
    'find.lead': 'Bir ifadenin genelde hangi yöntemi işaret ettiğini görmek için kartı çevir. Doğru kartı bulmak için sorudan bir kelime ara.',
    'find.placeholder': 'Dene: kararlı, maksimum, ‘saatte’, limit…', 'find.label': 'Yöntem kartlarında ara', 'find.see': 'Bunu görünce', 'find.think': 'Şunu düşün', 'find.flip': 'çevirmek için dokun →',
    'tool.kicker': 'Kalem kutun', 'tool.title': '<span class="swash">Araç kutusu</span>',
    'tool.lead': 'Çalışan pembe bir hesap makinesi ve cep formül kâğıdı. Hesap makinesine güvenmeden önce sınav kurallarına bak.',
    'tool.formulas': 'Cep formül kâğıdı', 'tool.calcnote': 'psst… klavyenle de yazabilirsin ♡', 'calc.cheers': 'SENİ SEVİYORUM|YAPABİLİRSİN|GURUR DUYUYORUM ✿|DEVAM ET|BEYİN: %100|AA HAVASI',
    'test.kicker': 'Sınav koşullarında pratik', 'test.title': '<span class="swash">Sınav odası</span>',
    'test.lead': 'Bu bahçe için yazılmış özgün, sınav tarzı sorular (geçmiş sınavların kopyası değil). İpuçları serbest; her ayrıntılı çözüm kendi düğmesinin arkasında bekliyor, önce sen dene.',
    'test.signedin': 'Giriş yaptın; her çözüm tek dokunuşla açılır. Önce soruyu kendin dene ♡', 'test.tabsAria': 'Deneme sınavları',
    'q.prefix': 'S', 'test.questions': '{n} soru', 'test.marks': '{n} puan', 'test.mark1': '1 puan', 'test.minutes': 'önerilen süre {n} dk',
    'timer.start': 'Zamanlayıcıyı başlat', 'timer.pause': 'Duraklat', 'timer.resume': 'Devam et', 'timer.done': 'Süre doldu! Kalemler bırakılsın ♡',
    'sol.show': 'Ayrıntılı çözümü göster', 'sol.hide': 'Çözümü gizle', 'sol.title': 'Ayrıntılı çözüm', 'sol.missing': 'Bu çözüm eksik.',
    'sol.error': 'Bu çözüm açılamadı.', 'sol.signin': 'Lütfen tekrar giriş yap ♡',
    'score.got': 'Yaptım', 'score.partly': 'Kısmen', 'score.missed': 'Yapamadım', 'score.aria': 'Bu soru nasıl geçti?',
    'score.title': 'Öz değerlendirmen: %{pct}', 'score.sub': '{total} sorudan {n} tanesi işaretlendi. En zayıf aileler önce, böylece neyi tekrar edeceğini bilirsin:',
    'plan.kicker': 'Bir hafta, her seferinde bir aile', 'plan.title': '<span class="swash">7 günlük planın</span>',
    'plan.lead': 'İlerledikçe işaretle. İlerlemen bu cihazda otomatik olarak kaydedilir.',
    'plan.cheer0': 'Her işaret küçük bir zafer ♡', 'plan.cheer1': 'Harika bir başlangıç, devam et ♡', 'plan.cheer2': 'Yarıyı geçtin. Seninle gurur duyuyorum ✿', 'plan.cheer3': 'Hepsi bitti! Şimdi o sınavı kazanma zamanı ♡',
    'foot.sign': 'sevgiyle ve limitlerle', 'foot.made': 'MAT 1330 için hazırlandı · Ottawa Üniversitesi',
    // labs
    'lab.tab.cobweb': 'Örümcek ağı bahçesi', 'lab.tab.tangent': 'Kesen → teğet', 'lab.tab.taylor': 'Teğet doğrusu ve Taylor', 'lab.tab.optimize': 'En iyisini bul',
    'lab.tab.newton': 'Newton yöntemi', 'lab.tab.area': 'Alan ve Temel Teorem', 'lab.tab.rhythm': 'Mevsimsel ritimler',
    'lab.cobweb.intro': 'Bir güncelleme fonksiyonu seç, başlangıç değerini ayarla ve örümcek ağını izle. Her denge noktasındaki türev, çözümlerin içeri mi çekildiğini yoksa dışarı mı itildiğini söyler.',
    'lab.model': 'Model', 'lab.m.linear': 'Doğrusal: doz veya hasat, xₜ₊₁ = a·xₜ + b', 'lab.m.logistic': 'Lojistik: xₜ₊₁ = r·xₜ(1 − xₜ)',
    'lab.m.bh': 'Doymalı (Beverton–Holt): xₜ₊₁ = r·xₜ / (1 + xₜ)', 'lab.m.ricker': 'Ricker: xₜ₊₁ = r·xₜ·e^(−xₜ)',
    'lab.p.a': 'a (kalan oran / büyüme çarpanı)', 'lab.p.b': 'b (eklenen doz ya da −hasat)', 'lab.p.r': 'r (büyüme parametresi)', 'lab.p.rmax': 'r (birey başına en yüksek büyüme)',
    'lab.x0': 'başlangıç değeri x₀', 'lab.steps': 'adım sayısı', 'lab.animate': 'Örümcek ağını canlandır ✿', 'lab.eq.head': 'Denge noktaları (f(x*) = x* olan yerler):', 'lab.eq.none': 'görünürde yok',
    'lab.v.stableOsc': 'kararlı, salınarak yaklaşır', 'lab.v.stableMono': 'kararlı, tek yönlü yaklaşır', 'lab.v.unstableOsc': 'kararsız, salınarak uzaklaşır',
    'lab.v.unstable': 'kararsız', 'lab.v.inconclusive': '|f′| = 1: test sonuç vermez',
    'lab.tangent.intro': 'Türev, h küçülürken kesen doğrusunun eğiminin yerleştiği değerdir. h’yi 0’a doğru kaydır ya da noktayı eğri boyunca sürükle.',
    'lab.function': 'Fonksiyon', 'lab.pointA': 'a noktası', 'lab.gapH': 'h aralığı', 'lab.secantSlope': 'kesen eğimi', 'lab.tangentSlope': 'teğet eğimi',
    'lab.dq': 'fark bölümü', 'lab.legend': 'mor = kesen · yeşil kesik çizgi = teğet',
    'lab.taylor.intro': '1. derece teğet doğrusudur (doğrusallaştırma). Dereceyi artır ve polinomun a merkezinin yakınında eğriye nasıl sarıldığını izle.',
    'lab.centre': 'merkez a', 'lab.degree': 'derece n', 'lab.estAt': 'x’te tahmin', 'lab.true': 'gerçek', 'lab.estimate': 'tahmin', 'lab.error': 'hata',
    'lab.opt.intro': 'Kapalı aralık yöntemi: f′ = 0 olan (ya da tanımsız olan) yerlere bak, sonra uç noktalarla karşılaştır. Eğimin işaret değiştirdiğini hissetmek için noktayı sürükle.',
    'lab.o.harvest': 'Hasat verimi: Y(E) = E·(1 − E/2)', 'lab.o.drug': 'İlaç düzeyi: C(t) = 5t·e^(−t/2)', 'lab.o.forage': 'Besin arama hızı: R(t) = (t/(t+1)) / (t + 2)',
    'lab.o.cubic': '[−1, 3] üzerinde kübik: f(x) = x³ − 3x² + 1', 'lab.o.effort': 'çaba E', 'lab.o.time': 'zaman t (sa)', 'lab.o.patch': 'alanda geçen süre t',
    'lab.move': 'noktayı hareket ettir', 'lab.slopeHere': 'buradaki eğim', 'lab.rising': 'artıyor ↗', 'lab.falling': 'azalıyor ↘', 'lab.flat': 'düz: kritik nokta!',
    'lab.candidate': 'aday', 'lab.endpoint': 'uç nokta', 'lab.critical': 'kritik nokta', 'lab.absMax': 'mutlak maksimum {v}, x = {x}', 'lab.absMin': 'mutlak minimum {v}, x = {x}',
    'lab.newton.intro': 'Her adım teğet doğrusu boyunca x eksenini kestiği yere kayar: xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ).',
    'lab.equation': 'Denklem f(x) = 0', 'lab.n.sqrt2': 'x² − 2 (√2’yi bul)', 'lab.firstGuess': 'ilk tahmin x₀', 'lab.stepsShown': 'gösterilen adım',
    'lab.flatFail': 'f′ = 0: teğet yatay, Newton burada işe yaramaz', 'lab.lastStep': 'son adımda f(x)',
    'lab.area.intro': 'Dikdörtgenler alanı tahmin eder; Analizin Temel Teoremi tam değeri verir: F′ = f olmak üzere F(b) − F(a). Dikdörtgen ekle ve tahminin yaklaşmasını izle.',
    'lab.integrand': 'İntegrand', 'lab.a.x2': '[0, b] üzerinde f(x) = x²', 'lab.a.xex': '[0, b] üzerinde f(x) = x·e⁻ˣ (kısmi integrasyon)', 'lab.a.inv': '[1, b] üzerinde f(x) = 1/x', 'lab.a.sin': '[0, b] üzerinde f(x) = sin x',
    'lab.upper': 'üst sınır b', 'lab.rects': 'dikdörtgen sayısı n', 'lab.heights': 'Yükseklikler', 'lab.left': 'sol uç noktalar', 'lab.right': 'sağ uç noktalar', 'lab.mid': 'orta noktalar',
    'lab.rule.left': 'sol', 'lab.rule.right': 'sağ', 'lab.rule.mid': 'orta', 'lab.riemann': 'Riemann toplamı ({rule}, n = {n})', 'lab.exact': 'Temel Teorem ile tam değer: F(x) = {F} için F(b) − F(a)',
    'lab.rhythm.intro': 'Bir kosinüs modeli T(t) = M + A·cos(2π(t − t₀)/P): M ortalama, A genlik, P periyot, t₀ tepenin zamanı. Türev, değişimin ne kadar hızlı olduğunu söyler.',
    'lab.r.M': 'ortalama M (°C)', 'lab.r.A': 'genlik A (°C)', 'lab.r.P': 'periyot P (ay)', 'lab.r.t0': 'tepe zamanı t₀ (ay)', 'lab.r.t': 't. aya bak',
    'lab.r.note': 'Sadece örnek sayılar; gerçek hava verisi değil.', 'lab.r.months': 't (ay)', 'lab.r.rate': 'hız', 'lab.r.perMonth': '°C/ay',
    'lab.r.maxAt': 'maks {max} °C, t = {t0} (her {P} ayda bir) · min {min} °C', 'lab.r.fastest': 'en hızlı değişim: ±{r} °C/ay, her tepeden çeyrek periyot sonra'
  };

  const STR = { en: EN, tr: TR };
  function t(key, vars) {
    let s = STR[lang][key];
    if (s == null) s = EN[key];
    if (s == null) return key;
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  }
  function apply(root) {
    const r = root || document;
    r.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    r.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    r.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.dataset.i18nAttr.split(';').forEach((pair) => {
        const [attr, k] = pair.split(':').map((s) => s.trim());
        if (attr && k) el.setAttribute(attr, t(k));
      });
    });
    document.documentElement.lang = lang;
    const css = document.documentElement.style;
    css.setProperty('--why', JSON.stringify(t('why') + ' '));
    css.setProperty('--mastered', JSON.stringify(t('mastered.badge')));
    css.setProperty('--tapflip', JSON.stringify(t('find.flip')));
  }
  function set(next) {
    if (next === lang) return;
    try { localStorage.setItem(KEY, next); } catch (e) { /* stays for this visit only */ }
    location.reload(); // the remembered sign-in reopens the garden in the new language
  }
  window.LovelyI18n = { lang, t, apply, set };

  document.querySelectorAll('.lang-switch button').forEach((b) => {
    const on = b.dataset.lang === lang;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
    b.addEventListener('click', () => set(b.dataset.lang));
  });
  apply();
})();
