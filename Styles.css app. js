// Simple SPA logic: template selection, estimate, stripe checkout + local generation (JSZip)
const templates = {
  portfolio: {
    name: "Portfolio",
    providerEstimateUSD: 0.5, // example estimate for provider compute
    files: {
      "index.html": `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{{title}}</title><link rel="stylesheet" href="styles.css"></head><body><header><h1>{{title}}</h1><p>Welcome to my portfolio.</p></header><main><section><h2>About</h2><p>This is a demo portfolio page.</p></section></main></body></html>`,
      "styles.css": `body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#222}header{background:{{color}};color:#fff;padding:20px;border-radius:8px}`
    }
  },
  landing: {
    name: "Landing Page",
    providerEstimateUSD: 1.0,
    files: {
      "index.html": `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{{title}}</title><link rel="stylesheet" href="styles.css"></head><body><section class="hero" style="background:{{color}};color:#fff;padding:40px;text-align:center"><h1>{{title}}</h1><p>Simple landing page generated instantly.</p></section></body></html>`,
      "styles.css": `body{font-family:Arial,Helvetica,sans-serif;padding:0;margin:0}section.hero{min-height:320px;display:flex;align-items:center;justify-content:center}`
    }
  }
};

const el = id => document.getElementById(id);
const templateSelect = el('templateSelect');
const projectNameInput = el('projectName');
const colorInput = el('primaryColor');
const providerKeyInput = el('providerKey');

const providerCostEl = el('providerCost');
const platformFeeEl = el('platformFee');
const totalCostEl = el('totalCost');
const statusEl = el('status');

const estimateBtn = el('estimateBtn');
const payBtn = el('payBtn');
const generateBtn = el('generateBtn');
const previewFrame = el('previewFrame');

function formatUSD(n){ return `$${n.toFixed(2)}`; }

function estimateCosts(){
  const t = templateSelect.value;
  const base = templates[t].providerEstimateUSD || 0.5;
  // if user provided provider key we still estimate same; if they elect managed service later we would recalc
  const providerEstimate = base;
  const platformFee = +(providerEstimate * 0.10).toFixed(2);
  const total = +(providerEstimate + platformFee).toFixed(2);
  providerCostEl.textContent = formatUSD(providerEstimate);
  platformFeeEl.textContent = formatUSD(platformFee);
  totalCostEl.textContent = formatUSD(total);
  return { providerEstimate, platformFee, total };
}

estimateBtn.addEventListener('click',() => {
  const est = estimateCosts();
  statusEl.textContent = `Estimate calculated: ${formatUSD(est.total)} (includes platform fee).`;
});

// Stripe checkout flow: call serverless endpoint to create session
payBtn.addEventListener('click', async () => {
  const { total } = estimateCosts();
  // Convert to cents
  const amountCents = Math.round(total * 100);
  statusEl.textContent = 'Creating checkout session...';
  try {
    const resp = await fetch('/api/create-checkout-session', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        amount_cents: amountCents,
        currency: 'usd',
        metadata: {
          template: templateSelect.value,
          projectName: projectNameInput.value || 'My Project'
        }
      })
    });
    const data = await resp.json();
    if(data.url){
      // Redirect to Stripe Checkout
      window.location = data.url;
    } else {
      statusEl.textContent = 'Checkout session creation failed.';
      console.error(data);
    }
  } catch(err){
    console.error(err);
    statusEl.textContent = 'Error creating checkout session.';
  }
});

// Generation + download (client-side)
generateBtn.addEventListener('click', async () => {
  statusEl.textContent = 'Generating project...';
  const t = templateSelect.value;
  const tpl = templates[t];
  const name = projectNameInput.value || 'my-project';
  const color = colorInput.value || '#1f8ef1';

  const zip = new JSZip();
  Object.entries(tpl.files).forEach(([path, content]) => {
    const out = content.replace(/{{title}}/g,name).replace(/{{color}}/g,color);
    zip.file(path, out);
  });

  const blob = await zip.generateAsync({type:'blob'});
  saveAs(blob, `${name}.zip`);
  statusEl.textContent = 'Download ready — ZIP saved.';
  // update preview
  const indexHtml = tpl.files['index.html'].replace(/{{title}}/g,name).replace(/{{color}}/g,color);
  const previewBlob = new Blob([indexHtml],{type:'text/html'});
  const url = URL.createObjectURL(previewBlob);
  previewFrame.src = url;
});

// Auto-estimate on load
estimateCosts();
