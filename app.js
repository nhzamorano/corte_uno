// ================= CONFIG ==================
const X_START = 0;
const X_END = 39;   // inclusive -> 40 puntos (0..39)
const X_STEP = 1;

const N_SERIES = 7;      // Y1..Y7
const POLY_DEGREE = 6;   // cantidad de coeficientes por serie - 1

// COEFICIENTES
const BASE_COEFFICIENTS = [
  [-5.818335388271143, 4.212906476248181, 3.6189239903600257, -0.6424225428138108, -9.052424789207494, 4.0804038873483295, -6.300358037449846],
  [ 3.8268568281914837, -4.464344951901706, -2.8086530257356013, 7.280365764365516, -0.8564507137455302, -7.707713489182316, 3.9951114701223],
  [ 6.521577, 6.7726, -1.9691, 3.558, -5.1, 1.8, 0.9],
  [-2.1, 1.9, 3.2, -4.6, 2.5, -1.3, 0.6],
  [ 1.4, -2.3, 1.9, 0.2, -0.9, 0.4, -0.15],
  [-0.9, 0.8, -0.5, 0.3, -0.2, 0.1, -0.04],
  [ 0.7, -0.6, 0.5, -0.4, 0.3, -0.2, 0.1],
];

// =============== UTIL ===============
const $ = (sel) => document.querySelector(sel);
function fmt(n){
  if (typeof n !== "number" || !isFinite(n)) return n ?? "";
  return Math.abs(n) < 1e-9 ? "0" : n.toLocaleString("es-CO",{maximumFractionDigits:6});
}
function toTable(headers, rows){
  let thead = "<thead><tr>" + headers.map(h => `<th>${h}</th>`).join("") + "</tr></thead>";
  let tbody = "<tbody>" + rows.map(r => "<tr>" + r.map((c,i)=> i===0?`<td>${c}</td>`:`<td>${fmt(c)}</td>`).join("") + "</tr>").join("") + "</tbody>";
  return `<table>${thead}${tbody}</table>`;
}
function rangeX(start,end,step){
  const out = [];
  for (let x=start; x<=end; x+=step) out.push(x);
  return out;
}
function evalPoly(coeffs, x){
  let y=0, xp=1;
  for (let i=0;i<coeffs.length;i++){
    y += coeffs[i]*xp;
    xp *= x;
  }
  return y;
}
function minMax(arr){
  let mn = Infinity, mx = -Infinity;
  for (const v of arr){ if (v < mn) mn = v; if (v > mx) mx = v; }
  return [mn, mx];
}
function normalizeMinMax(arr){
  const [mn,mx] = minMax(arr);
  if (!isFinite(mn) || !isFinite(mx) || mx === mn) return arr.map(()=>0.5);
  return arr.map(v => (v - mn) / (mx - mn));
}
function binCounts(values, width){
  const nBins = Math.ceil(1/width);
  const counts = Array.from({length:nBins}, ()=>0);
  const edges = [];
  for (let i=0;i<nBins;i++){
    edges.push([i*width, Math.min(1, (i+1)*width)]);
  }
  for (const v of values){
    let idx = Math.floor(v/width);
    if (idx < 0) idx = 0;
    if (idx >= nBins) idx = nBins - 1;
    counts[idx] += 1;
  }
  return { edges, counts, width };
}

// ============= CÁLCULOS PRINCIPALES =============
function computeAll(factor){
  // escalar coeficientes
  const scaled = BASE_COEFFICIENTS.map(row => row.map(c => c * factor));

  // X
  const X = rangeX(X_START, X_END, X_STEP);

  // calcular Ys
  const Ys = [];
  for (let k=0;k<N_SERIES;k++){
    const coeffs = scaled[k];
    Ys.push(X.map(x => evalPoly(coeffs, x)));
  }

  // Y sum
  const Ysum = X.map((_,i) => {
    let s = 0;
    for (let k=0;k<N_SERIES;k++) s += Ys[k][i];
    return s;
  });

  // normalizaciones
  const Xnorm = normalizeMinMax(X);
  const Ynorm = normalizeMinMax(Ysum);

  // binning sobre Ynorm
  const bin01 = binCounts(Ynorm, 0.1);
  const bin005 = binCounts(Ynorm, 0.05);

  return { scaled, X, Ys, Ysum, Xnorm, Ynorm, bin01, bin005 };
}

// ============== RENDER TABLAS ==============
function renderCoefTable(scaled){
  const headers = ["Serie"].concat(scaled[0].map((_,i)=>`a${i}`));
  const rows = scaled.map((r,i)=> [ `Y${i+1}`, ...r ]);
  $("#coeficientesTabla").innerHTML = toTable(headers, rows);
}
function renderDatosTabla(X, Ys, Ysum){
  const headers = ["X"].concat(Array.from({length:N_SERIES}, (_,i)=>`Y${i+1}`)).concat(["Y sumatoria"]);
  const rows = X.map((x,i)=> [ x, ...Ys.map(yk=>yk[i]), Ysum[i] ]);
  $("#tabla-datos").innerHTML = toTable(headers, rows);
}
function renderNormalizadoTabla(Xnorm, Ynorm){
  const headers = ["X norm", "Y norm"];
  const rows = Xnorm.map((xn,i)=> [ xn, Ynorm[i] ]);
  $("#tabla-normalizado").innerHTML = toTable(headers, rows);
}
function renderBinTabla(containerId, bin){
  const headers = ["Rango", "Frecuencia"];
  const rows = bin.edges.map((e,i)=> [ `[${fmt(e[0])}, ${fmt(e[1])}${i===bin.edges.length-1?']':')'}`, bin.counts[i] ]);
  document.querySelector(containerId).innerHTML = toTable(headers, rows);
}

// ============== GRÁFICOS (Chart.js) ==============
let chartYNorm = null, chartCombo = null, chartBin01 = null, chartBin005 = null;

function makeLineChart(ctx, labels, data, label){
  return new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{ label, data, fill:false, tension:0.25 }]
    },
    options: {
      responsive:true, maintainAspectRatio:false, animation:false,
      scales: { x: { ticks:{maxRotation:0, autoSkip:true} } }
    }
  });
}
function makeBarChart(ctx, labels, data, label){
  return new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ label, data }] },
    options: { responsive:true, maintainAspectRatio:false, animation:false }
  });
}

function densifyBinsToSeries(Ynorm, bin){
  // para cada punto i devolvemos el conteo del bin al que pertenece su Ynorm
  const width = bin.width;
  const nBins = bin.counts.length;
  return Ynorm.map(v => {
    let idx = Math.floor(v/width);
    if (idx < 0) idx = 0;
    if (idx >= nBins) idx = nBins - 1;
    return bin.counts[idx];
  });
}

function renderCharts(X, Ynorm, bin01, bin005){
  // Y Normalizado
  if (chartYNorm) chartYNorm.destroy();
  chartYNorm = makeLineChart(document.getElementById("chartYNorm").getContext("2d"), X, Ynorm, "Y normalizado");

  // Bins 0.1
  if (chartBin01) chartBin01.destroy();
  const labels01 = bin01.edges.map(e => `${e[0].toFixed(2)}–${e[1].toFixed(2)}`);
  chartBin01 = makeBarChart(document.getElementById("chartBin01").getContext("2d"), labels01, bin01.counts, "Frecuencia (0.1)");

  // Bins 0.05
  if (chartBin005) chartBin005.destroy();
  const labels005 = bin005.edges.map(e => `${e[0].toFixed(2)}–${e[1].toFixed(2)}`);
  chartBin005 = makeBarChart(document.getElementById("chartBin005").getContext("2d"), labels005, bin005.counts, "Frecuencia (0.05)");

  // Combinado: linea Ynorm + barras densificadas de bin01
  if (chartCombo) chartCombo.destroy();
  chartCombo = new Chart(document.getElementById("chartCombo").getContext("2d"), {
    type: "bar",
    data: {
      labels: X,
      datasets: [
        { type:"line", label:"Y normalizado", data:Ynorm, yAxisID:"y1", tension:0.25, fill:false },
        { type:"bar", label:"Frecuencia (bin 0.1) (por punto)", data: densifyBinsToSeries(Ynorm, bin01), yAxisID:"y2", backgroundColor:"rgba(99,132,255,0.5)" }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false, animation:false,
      scales:{
        y1:{ type:"linear", position:"left", min:0, max:1, title:{display:true,text:"Y norm"} },
        y2:{ type:"linear", position:"right", title:{display:true, text:"Frecuencia (bin)"} }
      }
    }
  });
}

// ============== INTERACCIÓN ==============
function updateInfo(X){
  $("#infoNPuntos").textContent = X.length;
  $("#infoXmin").textContent = X[0];
  $("#infoXmax").textContent = X[X.length-1];
  $("#infoXstep").textContent = X_STEP;
}
function wireTabs(){
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      tabs.forEach(b=>b.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(p=>p.classList.remove("active"));
      btn.classList.add("active");
      const id = btn.dataset.tab;
      document.getElementById(id).classList.add("active");
    });
  });
}

function exportCSV(rows, filename="datos_export.csv"){
  const csv = rows.map(r => r.map(c => (typeof c === "string"? `"${c.replace(/"/g,'""')}"` : c)).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function recalc(){
  const factor = parseFloat($("#factor").value || "1");
  const { scaled, X, Ys, Ysum, Xnorm, Ynorm, bin01, bin005 } = computeAll(factor);

  renderCoefTable(scaled);
  renderDatosTabla(X, Ys, Ysum);
  renderNormalizadoTabla(Xnorm, Ynorm);
  renderBinTabla("#tablaBin01", bin01);
  renderBinTabla("#tablaBin005", bin005);
  renderCharts(X, Ynorm, bin01, bin005);
  updateInfo(X);

  // Prepara array para export CSV (X, Y1..Y7, Ysum, Xnorm, Ynorm)
  const headers = ["X", ...Array.from({length:N_SERIES},(_,i)=>`Y${i+1}`), "Ysum", "Xnorm", "Ynorm"];
  const rows = [headers];
  for (let i=0;i<X.length;i++){
    const row = [X[i]];
    for (let k=0;k<N_SERIES;k++) row.push(Ys[k][i]);
    row.push(Ysum[i], Xnorm[i], Ynorm[i]);
    rows.push(row);
  }
  // Retornamos rows para permitir export si se desea
  return rows;
}

// ============== BOOTSTRAP ==============
document.addEventListener("DOMContentLoaded", ()=>{
  wireTabs();
  $("#recalcular").addEventListener("click", ()=> recalc());
  $("#exportCSV").addEventListener("click", ()=>{
    const rows = recalc(); // recalcula y obtiene rows actuales
    exportCSV(rows, "datos_binning.csv");
  });
  // primer render
  recalc();
});
