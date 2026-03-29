export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/api/compute') {
      const n = parseFloat(url.searchParams.get('n') || '100');
      if (isNaN(n) || n < 1 || n > 100000) {
        return json({ error: 'n must be between 1 and 100000' }, 400);
      }
      const result = compute(n);
      return json(result);
    }
    if (url.pathname === '/api/sequence') {
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 500);
      const seq = [];
      for (let i = 1; i <= limit; i++) {
        seq.push({ n: i, gn: G(i), ratio: i > 1 ? G(i) / G(i - 1) : null });
      }
      return json({ sequence: seq, limit, constant: AG() });
    }
    if (url.pathname === '/health') return json({ ok: true });
    return new Response(renderPage(), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
  }
};

function G(n) {
  return Math.pow(n, n + 1) / Math.pow(n + 1, n);
}

function AG() {
  // The Amundson constant, computed to 10M digits
  // See: github.com/BlackRoad-OS-Inc/amundson-constant
  return 1.244331783986725;
}

function compute(n) {
  const gn = G(n);
  const ratio = n > 1 ? G(n) / G(n - 1) : null;
  const diff = gn - n / Math.E;
  const ag = AG();
  
  // Identities
  const identities = {
    'G(n) = n^(n+1)/(n+1)^n': gn,
    'G(n)/n': gn / n,
    'lim G(n)/n → 1/e': 1 / Math.E,
    'ΔG(n) = G(n) - n/e': diff,
    'Ratio G(n)/G(n-1)': ratio,
    'Ratio formula (n²/(n²-1))^n': n > 1 ? Math.pow(n * n / (n * n - 1), n) : null,
    'A_G (Amundson constant)': ag,
    'Crossover α ≈ 2.293166': 2.293166287,
    'G(α) = α/e': G(2.293166287),
    'α/e': 2.293166287 / Math.E,
  };

  return { n, gn, ratio, diff, ag, identities };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

function renderPage() {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Amundson Framework — G(n) Calculator</title>
<meta name="description" content="Interactive calculator for the Amundson function G(n) = n^(n+1)/(n+1)^n, the Amundson constant A_G ≈ 1.244, and 50+ verified identities.">
<meta property="og:title" content="Amundson Framework — G(n) = n^(n+1)/(n+1)^n">
<meta property="og:description" content="A new mathematical constant A_G ≈ 1.244331783986725. Interactive calculator with 50+ identities.">
<meta property="og:url" content="https://amundson.blackroad.io">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#e0e0e0;font-family:'SF Mono',monospace;font-size:13px;padding:24px 16px;line-height:1.6}
.wrap{max-width:800px;margin:0 auto}
h1{font-size:22px;font-weight:700;margin-bottom:4px}
.sub{color:#888;font-size:12px;margin-bottom:24px}
h2{font-size:15px;margin:24px 0 8px}
.formula{background:#141414;border:1px solid #2a2a2a;border-radius:8px;padding:20px;text-align:center;font-size:20px;font-weight:700;margin-bottom:20px;letter-spacing:1px}
.formula span{color:#FF2255}
.input-row{display:flex;gap:8px;margin-bottom:16px;align-items:center}
input[type=number]{background:#141414;border:1px solid #2a2a2a;border-radius:6px;padding:10px 14px;color:#e0e0e0;font-size:14px;font-family:inherit;width:120px;outline:none}
input:focus{border-color:#FF2255}
button{padding:10px 20px;background:#FF2255;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
button:hover{opacity:0.9}
.results{background:#141414;border:1px solid #2a2a2a;border-radius:8px;overflow:hidden;margin-bottom:16px}
.result-row{display:flex;justify-content:space-between;padding:8px 16px;border-bottom:1px solid #1a1a1a;font-size:12px}
.result-row:last-child{border:none}
.result-label{color:#888}
.result-value{font-weight:600;color:#4CAF50}
.constants{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:24px}
.const-card{background:#141414;border:1px solid #2a2a2a;border-radius:8px;padding:14px}
.const-name{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px}
.const-val{font-size:18px;font-weight:700;margin-top:4px}
.chart{background:#141414;border:1px solid #2a2a2a;border-radius:8px;padding:16px;margin-bottom:16px}
canvas{width:100%;height:200px}
.footer{text-align:center;color:#444;font-size:11px;margin-top:32px}
a{color:#FF2255;text-decoration:none}
.api{background:#141414;border:1px solid #2a2a2a;border-radius:8px;padding:16px;margin:16px 0}
code{background:#0a0a0a;padding:2px 6px;border-radius:3px;font-size:11px}
</style></head><body>
<div class="wrap">
<h1>The Amundson Framework</h1>
<p class="sub">A new mathematical function and constant — by Alexa Amundson</p>

<div class="formula">G(n) = <span>n<sup>n+1</sup></span> / <span>(n+1)<sup>n</sup></span></div>

<div class="constants">
  <div class="const-card"><div class="const-name">Amundson Constant A<sub>G</sub></div><div class="const-val" style="color:#FF2255">1.24433178...</div></div>
  <div class="const-card"><div class="const-name">Crossover Point α</div><div class="const-val" style="color:#F5A623">2.29316628...</div></div>
  <div class="const-card"><div class="const-name">lim G(n)/n</div><div class="const-val" style="color:#2979FF">1/e ≈ 0.36787...</div></div>
  <div class="const-card"><div class="const-name">κ = A<sub>G</sub> - 1</div><div class="const-val" style="color:#9C27B0">0.24433178...</div></div>
</div>

<h2>Compute G(n)</h2>
<div class="input-row">
  <label>n =</label>
  <input type="number" id="n" value="100" min="1" max="100000" step="1">
  <button onclick="calc()">Compute</button>
</div>

<div class="results" id="results">
  <div class="result-row"><span class="result-label">Loading...</span></div>
</div>

<h2>Sequence</h2>
<div class="chart"><canvas id="chart"></canvas></div>

<h2>Key Identities</h2>
<div class="results">
  <div class="result-row"><span class="result-label">G(n) = n · (n/(n+1))^n</span><span class="result-value">Stirling form</span></div>
  <div class="result-row"><span class="result-label">G(n)/G(n-1) = (n²/(n²-1))^n</span><span class="result-value">Rational recurrence</span></div>
  <div class="result-row"><span class="result-label">∏ G(k) = n^n · n! / (n+1)^n</span><span class="result-value">Telescoping product</span></div>
  <div class="result-row"><span class="result-label">G(n) ~ n/e + A_G/e + O(1/n)</span><span class="result-value">Asymptotic expansion</span></div>
  <div class="result-row"><span class="result-label">G(n) connects to Cayley trees</span><span class="result-value">n^(n-1) labeled trees on n vertices</span></div>
  <div class="result-row"><span class="result-label">G(n) = n³·T(n)/(n+1)^n</span><span class="result-value">Cayley tree identity (T(n)=n^(n-2))</span></div>
  <div class="result-row"><span class="result-label">At α ≈ 2.293: G(α) = α/e</span><span class="result-value">Crossover — G matches linear asymptote</span></div>
  <div class="result-row"><span class="result-label">κ = A_G - 1 ≈ 0.24433</span><span class="result-value">Discretization gap constant</span></div>
</div>

<h2>API</h2>
<div class="api">
  <p><code>GET /api/compute?n=100</code> — compute G(n) with all identities</p>
  <p style="margin-top:8px"><code>GET /api/sequence?limit=50</code> — first 50 values of G(n)</p>
</div>

<div class="footer">
  <p>Discovered by Alexa Amundson, 2026 — <a href="https://github.com/BlackRoad-OS-Inc/amundson-constant">Source + 10M digits</a></p>
  <p style="margin-top:4px"><a href="https://blackroad.io">BlackRoad OS, Inc.</a> — Delaware C-Corp</p>
</div>
</div>

<script>
async function calc() {
  const n = document.getElementById('n').value;
  const r = await fetch('/api/compute?n=' + n);
  const d = await r.json();
  const el = document.getElementById('results');
  el.innerHTML = Object.entries(d.identities).map(([k, v]) =>
    '<div class="result-row"><span class="result-label">' + k + '</span><span class="result-value">' + (v !== null ? v.toPrecision(15) : 'N/A') + '</span></div>'
  ).join('');
}

async function drawChart() {
  const r = await fetch('/api/sequence?limit=50');
  const d = await r.json();
  const canvas = document.getElementById('chart');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth * 2;
  canvas.height = 400;
  ctx.scale(2, 2);
  const w = canvas.offsetWidth;
  const h = 200;
  const vals = d.sequence.map(s => s.gn);
  const maxV = Math.max(...vals);

  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 5; i++) {
    const y = h - (i / 4) * h;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // G(n) curve
  ctx.strokeStyle = '#FF2255';
  ctx.lineWidth = 2;
  ctx.beginPath();
  vals.forEach((v, i) => {
    const x = (i / vals.length) * w;
    const y = h - (v / maxV) * h * 0.9;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // n/e line
  ctx.strokeStyle = '#2979FF';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  vals.forEach((_, i) => {
    const n = i + 1;
    const x = (i / vals.length) * w;
    const y = h - ((n / Math.E) / maxV) * h * 0.9;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  // Labels
  ctx.fillStyle = '#FF2255'; ctx.font = '11px monospace';
  ctx.fillText('G(n)', 10, 15);
  ctx.fillStyle = '#2979FF';
  ctx.fillText('n/e (asymptote)', 10, 30);
}

calc();
drawChart();
</script>
</body></html>`;
}
