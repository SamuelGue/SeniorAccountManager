/* Illustrative models. Every output is worked out from the visible inputs. None of this is Skin + Me data. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const val = (id) => {
    const el = document.getElementById(id);
    const n = el ? parseFloat(el.value) : NaN;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const text = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  const html = (id, v) => { const el = document.getElementById(id); if (el) el.innerHTML = v; };
  const commas = (n) => Math.round(n).toLocaleString('en-GB');
  const gbp = (n) => '£' + commas(n);
  const gbp2 = (n) => '£' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const count = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2) + 'm' : commas(n));
  const ratioText = (n) => (n == null ? 'n/a' : n.toFixed(1) + '×');
  const cacText = (n) => (n == null ? 'n/a' : gbp(n));

  // One chain for both models. Each stage is rounded, then used by the next, so every line can be checked by hand.
  function run(i) {
    const activated = Math.round(i.sourced * i.activation / 100);
    const posts = Math.round(activated * i.ppc);
    const impressions = posts * i.views;
    const clicks = Math.round(impressions * i.ctr / 100);
    const consults = Math.round(clicks * i.consult / 100);
    const customers = Math.round(consults * i.paid / 100);
    const revenue = customers * i.value;
    const fees = posts * i.fee;
    const commission = Math.round(revenue * i.comm / 100);
    const total = fees + commission + i.amp;
    const cac = customers > 0 ? total / customers : null;
    const ltv = i.retention < 100 ? i.value / (1 - i.retention / 100) : null;
    const ratio = cac && ltv ? ltv / cac : null;
    return { activated, posts, impressions, clicks, consults, customers, revenue, fees, commission, amp: i.amp, total, cac, ltv, ratio };
  }

  // ---------------------------------------------------------------- Section 03
  const aIds = { sourced: 'a-sourced', activation: 'a-activation', ppc: 'a-ppc', views: 'a-views', ctr: 'a-ctr', consult: 'a-consult', paid: 'a-paid', value: 'a-value', retention: 'a-retention', fee: 'a-fee', comm: 'a-comm', amp: 'a-amp' };
  const readInputs = (ids, prefix) => Object.fromEntries(Object.entries(ids).map(([k, id]) => [k, val(id)]));

  function renderAccount() {
    const o = run(readInputs(aIds));
    text('a-scale-posts', commas(o.posts));
    text('a-o-activated', commas(o.activated));
    text('a-o-posts', commas(o.posts));
    text('a-o-impr', count(o.impressions));
    text('a-o-clicks', commas(o.clicks));
    text('a-o-consults', commas(o.consults));
    text('a-o-customers', commas(o.customers));
    text('a-f-activated', commas(o.activated));
    text('a-f-posts', commas(o.posts));
    text('a-f-impr', count(o.impressions));
    text('a-f-clicks', commas(o.clicks));
    text('a-f-consults', commas(o.consults));
    text('a-f-customers', commas(o.customers));
    const max = Math.max(o.impressions, 1);
    const w = (v) => Math.max(3, Math.round(100 * Math.log10(v + 1) / Math.log10(max + 1))) + '%';
    [['activated', o.activated], ['posts', o.posts], ['impr', o.impressions], ['clicks', o.clicks], ['consults', o.consults], ['customers', o.customers]]
      .forEach(([k, v]) => { const el = document.getElementById('a-b-' + k); if (el) el.style.width = w(v); });
    text('a-o-revenue', gbp(o.revenue));
    text('a-o-fees', gbp(o.fees));
    text('a-o-comm', gbp(o.commission));
    text('a-o-amp', gbp(o.amp));
    text('a-o-total', gbp(o.total));
    text('a-o-cac', o.cac == null ? 'n/a' : '≈ ' + cacText(o.cac));
    text('a-o-ltv', o.ltv == null ? 'n/a' : '≈ ' + gbp(o.ltv));
    text('a-o-ratio', o.ratio == null ? 'n/a' : '≈ ' + ratioText(o.ratio));
    text('a-o-rpm', o.impressions ? gbp(o.revenue / o.impressions * 1000) : 'n/a');
    text('a-o-rpc', o.activated ? gbp(o.revenue / o.activated) : 'n/a');
  }

  // ---------------------------------------------------------------- Section 08
  const sIds = { sourced: 's-creators', activation: 's-activation', ppc: 's-ppc', views: 's-views', ctr: 's-ctr', consult: 's-consult', paid: 's-paid', value: 's-value', retention: 's-retention', fee: 's-fee', comm: 's-comm', amp: 's-amp' };
  const scenarios = {
    lo: { name: 'Conservative', views: 0.75, ctr: 0.85, consult: 0.85, paid: 0.9 },
    mid: { name: 'Base', views: 1, ctr: 1, consult: 1, paid: 1 },
    hi: { name: 'Upside', views: 1.25, ctr: 1.15, consult: 1.1, paid: 1.1 },
  };
  const scale = (base, f) => ({ ...base, views: base.views * f.views, ctr: base.ctr * f.ctr, consult: base.consult * f.consult, paid: base.paid * f.paid });

  function renderSimulator() {
    const base = readInputs(sIds);
    const out = {};
    Object.entries(scenarios).forEach(([k, f]) => {
      const o = run(scale(base, f));
      out[k] = o;
      text(`s-${k}-cust`, commas(o.customers));
      text(`s-${k}-rev`, gbp(o.revenue));
      text(`s-${k}-cac`, cacText(o.cac));
      text(`s-${k}-ratio`, ratioText(o.ratio));
    });
    text('s-range-lo', commas(out.lo.customers));
    text('s-range-hi', commas(out.hi.customers));

    const col = (fn) => ['lo', 'mid', 'hi'].map((k) => `<td>${fn(out[k], scale(base, scenarios[k]))}</td>`).join('');
    const rows = [
      ['Creators sourced', (o, i) => commas(i.sourced)],
      ['× activation', (o, i) => i.activation + '%'],
      ['= creators activated', (o) => commas(o.activated)],
      ['× posts per creator', (o, i) => i.ppc],
      ['= posts', (o) => commas(o.posts)],
      ['× views per post', (o, i) => commas(i.views)],
      ['= impressions', (o) => count(o.impressions)],
      ['× CTR', (o, i) => (+i.ctr.toFixed(2)) + '%'],
      ['= clicks', (o) => commas(o.clicks)],
      ['× consultation conversion', (o, i) => (+i.consult.toFixed(2)) + '%'],
      ['= consultations', (o) => commas(o.consults)],
      ['× paid conversion', (o, i) => (+i.paid.toFixed(2)) + '%'],
      ['= customers', (o) => commas(o.customers)],
      ['× monthly customer value', (o, i) => gbp(i.value)],
      ['= revenue (first month)', (o) => gbp(o.revenue)],
      ['Creator fees (posts × fee)', (o) => gbp(o.fees)],
      ['Commission (rate × revenue)', (o) => gbp(o.commission)],
      ['Paid amplification', (o) => gbp(o.amp)],
      ['= total acquisition cost', (o) => gbp(o.total)],
      ['Blended CAC (total ÷ customers)', (o) => cacText(o.cac)],
      ['LTV (value ÷ (1 − retention))', (o) => (o.ltv == null ? 'n/a' : gbp(o.ltv))],
      ['LTV : CAC', (o) => ratioText(o.ratio)],
    ];
    html('s-math', `<table class="math-table"><thead><tr><th></th><th>CONSERVATIVE</th><th>BASE</th><th>UPSIDE</th></tr></thead><tbody>${rows.map(([l, fn]) => `<tr><th>${l}</th>${col(fn)}</tr>`).join('')}</tbody></table>`);

    // How much does the CAC move if one assumption is 20% worse?
    const b = out.mid;
    const variants = [
      ['CTR', { ...base, ctr: base.ctr * 0.8 }, '20% lower'],
      ['Consultation conversion', { ...base, consult: base.consult * 0.8 }, '20% lower'],
      ['Paid conversion', { ...base, paid: base.paid * 0.8 }, '20% lower'],
      ['Views per post', { ...base, views: base.views * 0.8 }, '20% lower'],
      ['Creator fee per post', { ...base, fee: base.fee * 1.2 }, '20% higher'],
    ].map(([n, inp, d]) => ({ n, d, o: run(inp) }))
      .map((v) => ({ ...v, delta: b.cac && v.o.cac ? (v.o.cac / b.cac - 1) * 100 : 0 }))
      .sort((x, y) => y.delta - x.delta);
    html('s-sens', variants.map((v, k) => `<strong>${k + 1}. ${v.n} ${v.d} <em>CAC ${cacText(v.o.cac)} (${v.delta >= 0 ? '+' : ''}${v.delta.toFixed(0)}%)</em></strong>`).join(''));
    text('s-success', b.cac ? `Success: CAC at or below ${gbp(b.cac)}, the base-case blended CAC, with customers who turn out to be a good fit.` : 'Success: set by the base-case blended CAC once the inputs produce customers.');
  }

  // ---------------------------------------------------------------- Client room creator table
  function renderRoomTable() {
    const table = document.getElementById('room-creator-table');
    if (!table) return;
    const fee = val('room-fee');
    const value = val('room-value');
    text('room-fee-out', gbp(fee));
    text('room-value-out', gbp(value));
    $$('tbody tr', table).forEach((tr) => {
      const posts = +tr.dataset.posts;
      const customers = +tr.dataset.customers;
      const cost = posts * fee;
      $('[data-cell="rev"]', tr).textContent = gbp(customers * value);
      $('[data-cell="cost"]', tr).textContent = gbp(cost);
      $('[data-cell="cac"]', tr).textContent = customers ? gbp(cost / customers) : 'n/a';
    });
  }

  // ---------------------------------------------------------------- Creator lab
  const creator = document.getElementById('creator');
  const cv = (testid) => {
    const el = creator && creator.querySelector(`[data-testid="${testid}"]`);
    return el ? el : null;
  };
  const cn = (testid) => { const el = cv(testid); const n = el ? parseFloat(el.value) : NaN; return Number.isFinite(n) && n >= 0 ? n : 0; };
  const tierEvidence = { None: 0, Weak: 12, Moderate: 30, Strong: 50 };
  const tierOpportunity = { None: 0, Weak: 8, Moderate: 18, Strong: 30 };
  const demoDefaults = new Map();
  const weightRows = [
    ['AUDIENCE FIT', 20, 'UK audience ÷ 10 (max 10) + target age fit ÷ 10 (max 10)'],
    ['PROBLEM FIT', 15, 'Concern talk ÷ 10 (max 10) + skincare content ÷ 20 (max 5)'],
    ['CONTENT PERFORMANCE', 20, '12 × (average views ÷ followers ÷ 50%, max 1) + 8 × (engagement rate ÷ 8%, max 1)'],
    ['TRUST / ENGAGEMENT', 15, '(audience trust + repeat engagement + content consistency) ÷ 30 × 15'],
    ['COMMERCIAL EVIDENCE', 30, 'Previous Skin + Me conversion: None 0, Weak 8, Moderate 18, Strong 30'],
  ];

  function scoreCreator() {
    const followers = cn('input-followers');
    const views = cn('input-average-views-post');
    const likes = cn('input-average-likes');
    const comments = cn('input-average-comments');
    const eng = views ? (likes + comments) / views * 100 : 0;
    const engEl = cv('input-engagement-rate');
    if (engEl) { engEl.value = eng.toFixed(1); engEl.readOnly = true; engEl.title = 'Worked out: (likes + comments) ÷ views'; }
    const uk = cn('input-uk-audience');
    const age = cn('input-target-age-fit');
    const skin = cn('input-skincare-content');
    const concern = cn('input-actual-concern-talk');
    const trust = cn('input-audience-trust');
    const repeat = cn('input-repeat-engagement');
    const consistency = cn('input-content-consistency');
    const tier = (cv('select-previous-conversion') || {}).value || 'None';
    const tierKey = Object.keys(tierOpportunity).find((k) => tier.trim().toLowerCase() === k.toLowerCase()) || 'None';

    const audience = Math.round(Math.min(10, uk / 10) + Math.min(10, age / 10));
    const problem = Math.round(Math.min(10, concern / 10) + Math.min(5, skin / 20));
    const reach = followers ? views / followers : 0;
    const content = Math.round(12 * Math.min(1, reach / 0.5) + 8 * Math.min(1, eng / 8));
    const trustScore = Math.round((trust + repeat + consistency) / 30 * 15);
    const commercial = tierOpportunity[tierKey];
    const opportunity = audience + problem + content + trustScore + commercial;

    const evCommercial = tierEvidence[tierKey];
    const evSignal = Math.round((repeat + consistency) / 20 * 25);
    const evConcern = Math.round(Math.min(25, concern * 0.25));
    const evidence = evCommercial + evSignal + evConcern;

    const rec = opportunity >= 65 && evidence >= 50 ? 'SHORTLIST' : opportunity >= 50 ? 'WATCH' : 'PASS';
    return { eng, audience, problem, content, trustScore, commercial, opportunity, evCommercial, evSignal, evConcern, evidence, rec, tierKey, views, followers, uk };
  }

  function renderCreator() {
    if (!creator) return;
    const s = scoreCreator();
    const setBig = (sel, n) => { const el = $(sel + ' strong', creator); if (el) el.innerHTML = `${n}<small>/100</small>`; };
    setBig('.score-opportunity', s.opportunity);
    setBig('.score-evidence', s.evidence);
    const rec = $('.recommendation strong', creator);
    if (rec) rec.textContent = s.rec;

    const customers = cn('input-previous-customers');
    const revenue = cn('input-previous-revenue');
    const commercialNote = s.commercial === 0
      ? (customers > 0 ? 'Customers are recorded but the conversion level says None. Worth checking which is right.' : 'No Skin + Me conversion history yet. That is the gap.')
      : `Conversion history set to ${s.tierKey.toLowerCase()}${customers ? `, ${commas(customers)} customers` : ''}${revenue && customers ? `, ${gbp(revenue / customers)} per customer` : ''}. Still worth testing before trusting it.`;
    const rows = [
      ['AUDIENCE FIT', s.audience, 20, 'UK audience and target age fit.'],
      ['PROBLEM FIT', s.problem, 15, 'How much the content is about a real skin concern. Interesting, not proof.'],
      ['CONTENT PERFORMANCE', s.content, 20, 'Views against followers, plus engagement. Reach matters more than follower count.'],
      ['TRUST / ENGAGEMENT', s.trustScore, 15, 'A responsiveness clue, not a promise of sales.'],
      ['COMMERCIAL EVIDENCE', s.commercial, 30, commercialNote],
    ];
    const panel = $('.score-panel', creator);
    if (!panel) return;
    $$('.score-row, .score-total, .score-weights', panel).forEach((n) => n.remove());
    const callout = $('.score-callout', panel);
    const rowHtml = rows.map(([n, v, m, d]) => `<div class="score-row"><div><span>${n}</span><strong>${v} / ${m}</strong></div><div class="score-track"><i style="width: ${Math.round(v / m * 100)}%;"></i></div><small>${d}</small></div>`).join('');
    const total = `<div class="score-row score-total"><div><span>OPPORTUNITY TOTAL</span><strong>${rows.map((r) => r[1]).join(' + ')} = ${s.opportunity} / 100</strong></div></div>`;
    const showWeights = $('[data-testid="toggle-score-weights-button"]', creator);
    const open = showWeights && showWeights.dataset.open === 'true';
    const weights = `<div class="score-weights" ${open ? '' : 'hidden'}><span class="eyebrow">WEIGHTS: COMMERCIAL EVIDENCE CARRIES THE MOST</span><ul>${weightRows.map(([n, m, f]) => `<li><b>${n} (max ${m})</b>${f}</li>`).join('')}</ul><p>Opportunity = the five components added together, out of 100. The commercial slice is the biggest because actual conversion is worth more than reach.</p><span class="eyebrow">EVIDENCE SCORE: ${s.evidence} / 100</span><ul><li><b>COMMERCIAL HISTORY (max 50)</b>None 0, Weak 12, Moderate 30, Strong 50. This creator: ${s.evCommercial}</li><li><b>SIGNAL OVER TIME (max 25)</b>(repeat engagement + consistency) ÷ 20 × 25. This creator: ${s.evSignal}</li><li><b>TALKS ABOUT THE CONCERN (max 25)</b>Concern talk % × 0.25. This creator: ${s.evConcern}</li></ul><p>${s.evCommercial} + ${s.evSignal} + ${s.evConcern} = ${s.evidence}. Recommendation: SHORTLIST needs opportunity 65+ and evidence 50+. WATCH needs opportunity 50+.</p></div>`;
    callout.insertAdjacentHTML('beforebegin', rowHtml + total + weights);

    const reasoning = $('.creator-reasoning p', creator);
    const problemSel = cv('select-relevant-problem');
    const problemName = problemSel ? problemSel.value.trim().toLowerCase() : 'acne';
    if (reasoning) reasoning.textContent = `On the demo inputs, opportunity is ${s.opportunity}/100 and evidence is ${s.evidence}/100. This creator talks about ${problemName} and has a ${s.uk}% UK audience in the demo. None of that is Skin + Me conversion evidence. I'd test one story detail first.`;
    const list = $$('.reasoning-list > div', creator);
    if (list[0]) list[0].innerHTML = `<span>WHAT THE DEMO INPUTS SAY</span><strong>${s.uk}% UK / ${s.eng.toFixed(1)}% engagement / ${commas(s.views)} average views. Demo / illustrative inputs, not verified data.</strong>`;
    if (list[1]) list[1].innerHTML = `<span>WHAT WE DON'T KNOW YET</span><strong>${s.commercial === 0 ? 'No conversion history yet. That is the gap.' : 'Whether the history holds up on a fresh test.'}</strong>`;
    const fee = cn('input-estimated-creator-fee');
    let feeBox = $('.fee-math', creator);
    if (!feeBox) {
      feeBox = document.createElement('div');
      feeBox.className = 'fee-math';
      const rl = $('.reasoning-list', creator);
      if (rl) rl.appendChild(feeBox);
    }
    const funnel = val('a-ctr') / 100 * val('a-consult') / 100 * val('a-paid') / 100;
    const expected = s.views * funnel;
    feeBox.innerHTML = `<span>ILLUSTRATIVE FEE MATH</span><strong>${gbp(fee)} ÷ ${commas(s.views)} views = ${gbp2(s.views ? fee / s.views * 1000 : 0)} per 1,000 views. At the Section 03 funnel rates, one post gets about ${expected.toFixed(0)} customers, so a fee-only CAC of ${expected >= 0.5 ? gbp(fee / Math.round(expected)) : 'n/a'}. An assumption, not a forecast.</strong>`;
  }

  // ---------------------------------------------------------------- Experiment lab
  function renderExperiment() {
    const form = document.getElementById('experiment-result-form');
    if (!form) return;
    const f = (name) => { const el = form.elements[name]; const n = el ? parseFloat(el.value) : NaN; return el && el.value !== '' && Number.isFinite(n) ? n : null; };
    const cCust = f('controlCustomers');
    const tCust = f('testCustomers');
    const cCost = f('controlCost');
    const tCost = f('testCost');
    const cCac = cCust > 0 && cCost != null ? cCost / cCust : null;
    const tCac = tCust > 0 && tCost != null ? tCost / tCust : null;
    const show = (v, fmt) => (v == null ? 'Not run yet' : fmt(v));
    text('exp-control-cac', show(cCac, gbp2));
    text('exp-test-cac', show(tCac, gbp2));
    const boxes = $$('.outcome-columns .metric strong');
    const vals = [f('controlClicks'), cCust, cCac, f('testClicks'), tCust, tCac];
    boxes.forEach((el, k) => {
      const v = vals[k];
      el.textContent = v == null ? 'Not run yet' : (k % 3 === 2 ? gbp2(v) : commas(v));
    });
    const verdict = document.getElementById('exp-verdict');
    if (!verdict) return;
    const thr = val('exp-threshold');
    if (cCust > 0 && tCust != null && cCac != null && tCac != null) {
      const lift = (tCust / cCust - 1) * 100;
      const clears = lift >= thr && tCac <= cCac;
      verdict.textContent = clears
        ? `TEST has ${lift.toFixed(0)}% more customers at ${gbp2(tCac)} against ${gbp2(cCac)}. That clears the ${thr}% rule. I'd repeat it with another cohort before changing the brief.`
        : `TEST has ${lift.toFixed(0)}% more customers at ${gbp2(tCac)} against ${gbp2(cCac)}. That doesn't clear the ${thr}% rule. I'd look at where the story stopped working.`;
    } else {
      verdict.textContent = 'Nothing to judge yet. The test hasn\'t run.';
    }
  }

  // ---------------------------------------------------------------- Wiring
  function bind(ids, fn) {
    Object.values(ids).forEach((id) => document.getElementById(id)?.addEventListener('input', fn));
  }
  bind(aIds, () => { renderAccount(); renderCreator(); });
  bind(sIds, renderSimulator);
  ['room-fee', 'room-value'].forEach((id) => document.getElementById(id)?.addEventListener('input', renderRoomTable));
  document.getElementById('a-edit')?.addEventListener('click', () => {
    const el = document.getElementById('a-sourced');
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    el?.focus({ preventScroll: true });
  });

  if (creator) {
    $$('input, select', creator).forEach((el) => {
      demoDefaults.set(el, el.value);
      el.addEventListener('input', renderCreator);
      el.addEventListener('change', renderCreator);
    });
    $('[data-testid="demo-creator-button"]', creator)?.addEventListener('click', () => {
      demoDefaults.forEach((v, el) => { el.value = v; });
      renderCreator();
    });
    const toggle = $('[data-testid="toggle-score-weights-button"]', creator);
    toggle?.addEventListener('click', () => {
      const open = toggle.dataset.open !== 'true';
      toggle.dataset.open = String(open);
      const w = $('.score-weights', creator);
      if (w) w.hidden = !open;
      const node = Array.from(toggle.childNodes).find((n) => n.nodeType === 3);
      if (node) node.textContent = open ? 'HIDE WEIGHTS ' : 'SHOW WEIGHTS ';
    });
  }

  const expForm = document.getElementById('experiment-result-form');
  expForm?.addEventListener('input', renderExperiment);
  document.getElementById('exp-threshold')?.addEventListener('input', renderExperiment);

  renderAccount();
  renderSimulator();
  renderRoomTable();
  renderCreator();
  renderExperiment();
})();
