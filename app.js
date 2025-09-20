let coeficientes = [];
let charts = {};
let chartInstance;
let rangoParaX = [];
let rangoParaY = [];
let xNormalizado = [];
let yNormalizado = [];
let graph = [];

const myButton = document.querySelector('#recalcular');
myButton.addEventListener('click', recalc);

function recalc(){
    const num = document.querySelector('#factorMultiplicador').value;

    tablaDeCoeficientes(num);

    tablaDeDatosGenerados();

    const { valorMinX, valorMaxX, valorMinY, valorMaxY } = rangoValores();

    tablaDeDatosGenerados(valorMinX, valorMaxX, valorMinY, valorMaxY);

    graficos(graph, 'orange', 'Y normalizado', 'lineChart')

    const puntos1 = tabla1Grafico2(xNormalizado, yNormalizado);
    const puntos2 = tabla2Grafico2(xNormalizado, yNormalizado);

    graficos(puntos1, 'blue', 'Promedio Y', 'ventasChart');
    graficos(puntos2, 'red', 'Promedio Y', 'distribucionChart');

    graficosUnidos([
        { data: graph, color: 'orange', label: 'Y normalizado' },
        { data: puntos1, color: 'blue', label: 'Promedio Y 1' },
        { data: puntos2, color: 'red', label: 'Promedio Y 2' }
    ], 'combinedChart');
}


function tablaDeCoeficientes(numeroEnviado){
    const coeficientesTabla = document.querySelector('#coeficientesTabla');

    coeficientesTabla.innerHTML = "";
    coeficientes = [];

    for (let index = 1; index <= 21; index++) {
        let resultadoCoeficiente = (Math.random() -  Math.random()) * numeroEnviado;
        coeficientes.push(resultadoCoeficiente);

        const div = document.createElement("div");
        div.innerHTML = `
        <div class="text-center p-3 bg-blue-50 rounded" id="idCoeficiente-${index}">${resultadoCoeficiente.toFixed(4)}</div>
        `;
        coeficientesTabla.appendChild(div);
    }
}

function tablaDeDatosGenerados(valorMinX, valorMaxX, valorMinY, valorMaxY){
    const tablaDatos = document.querySelector('#tabla-datos');

    tablaDatos.innerHTML = '';
    rangoParaX = [];
    rangoParaY = [];
    xNormalizado = [];
    yNormalizado = [];
    graph = [];

    for(let i = 0; i <= 360; i++){
    
        let resultadoY1 = coeficientes[0] * Math.sin(( coeficientes[7] * i + coeficientes[14]) * Math.PI / 180);
        let resultadoY2 = coeficientes[1] * Math.sin(( coeficientes[8] * i + coeficientes[15]) * Math.PI / 180);
        let resultadoY3 = coeficientes[2] * Math.sin(( coeficientes[9] * i + coeficientes[16]) * Math.PI / 180);
        let resultadoY4 = coeficientes[3] * Math.sin(( coeficientes[10] * i + coeficientes[17]) * Math.PI / 180);
        let resultadoY5 = coeficientes[4] * Math.sin(( coeficientes[11] * i + coeficientes[18]) * Math.PI / 180);
        let resultadoY6 = coeficientes[5] * Math.sin(( coeficientes[12] * i + coeficientes[19]) * Math.PI / 180);
        let resultadoY7 = coeficientes[6] * Math.sin(( coeficientes[13] * i + coeficientes[20]) * Math.PI / 180);
        let sumatoriaY = resultadoY1 + resultadoY2 + resultadoY3 + resultadoY4 + resultadoY5 + resultadoY6 + resultadoY7;
        let normalizadoX = (i-valorMinX)/(valorMaxX-valorMinX);
        let normalizadoY = (sumatoriaY-valorMinY)/(valorMaxY-valorMinY);

        rangoParaX.push(i);
        rangoParaY.push(sumatoriaY)
        graph.push({x: normalizadoX, y: normalizadoY});
        xNormalizado.push(normalizadoX);
        yNormalizado.push(normalizadoY)

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="sticky-column px-4 py-3 whitespace-nowrap text-sm font-bold text-black">${i}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-black">${resultadoY1.toFixed(4)}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-black">${resultadoY2.toFixed(4)}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-black">${resultadoY3.toFixed(4)}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-black">${resultadoY4.toFixed(4)}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-black">${resultadoY5.toFixed(4)}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-black">${resultadoY6.toFixed(4)}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-black">${resultadoY7.toFixed(4)}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium font-bold text-green-600">${sumatoriaY.toFixed(4)}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium font-bold text-purple-600">${normalizadoX.toFixed(4)}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium font-bold text-purple-600">${normalizadoY.toFixed(4)}</td>
        `;

        tablaDatos.appendChild(tr);
    }
}

function rangoValores(){
    let valorMinX = Math.min(...rangoParaX);
    let valorMaxX = Math.max(...rangoParaX);
    let valorMinY = Math.min(...rangoParaY);
    let valorMaxY = Math.max(...rangoParaY);
    
    const tablaRangoValores =  document.querySelector('#tablaRangoValores');
    tablaRangoValores.innerHTML = '';
    const html = `
    <div class="bg-blue-50 p-4 rounded-lg">
        <p class="text-sm font-bold text-emerald-500">X minimo</p>
        <p class="text-2xl font-bold text-emerald-500">${valorMinX}</p>
    </div>
    <div class="bg-green-50 p-4 rounded-lg">
        <p class="text-sm font-bold text-cyan-500">X maximo</p>
        <p class="text-2xl font-bold text-cyan-500">${valorMaxX}</p>
    </div>
    <div class="bg-purple-50 p-4 rounded-lg">
        <p class="text-sm font-bold text-amber-500">Y minimo</p>
        <p class="text-2xl font-bold text-amber-500">${valorMinY.toFixed(4)}</p>
    </div>
    <div class="bg-red-50 p-4 rounded-lg">
        <p class="text-sm font-bold text-blue-500">Y maximo</p>
        <p class="text-2xl font-bold text-blue-500">${valorMaxY.toFixed(4)}</p>
    </div>
`;

    document.querySelector('#tablaRangoValores').insertAdjacentHTML('beforeend', html);

    return { valorMinX, valorMaxX, valorMinY, valorMaxY };
}


function graficos(datos, color, etiqueta, id) {
  const ctx = document.getElementById(id).getContext('2d');

  if (charts[id]) {
    charts[id].destroy();
  }

  charts[id] = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: etiqueta,
        data: datos,
        borderColor: color,
        fill: false
      }]
    },
    options: {
      scales: {
        x: { type: 'linear', position: 'bottom' }
      }
    }
  });
}

function tabla1Grafico2(datoA,datoB){
    let conjuntoDatos = {
        Xa: [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9],
        Xb: [0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]
    }
    const tablaPromedio1 = document.querySelector('#tablaPromedio1');
    tablaPromedio1.innerHTML = '';

    let puntos = [];

    for (let i = 0; i < conjuntoDatos.Xa.length; i++) {
        const xc = ((conjuntoDatos.Xa[i] + conjuntoDatos.Xb[i]) / 2).toFixed(2);
        const promedio = promedioSiConjunto(datoB, datoA, conjuntoDatos.Xa[i], conjuntoDatos.Xb[i]);

        puntos.push({x: parseFloat(xc), y: promedio});

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-4 py-3 text-sm font-bold text-white-700">${conjuntoDatos.Xa[i]}</td>
            <td class="px-4 py-3 text-sm font-bold text-white-700">${conjuntoDatos.Xb[i]}</td>
            <td class="px-4 py-3 text-sm font-bold text-white-700">${xc}</td>
            <td class="px-4 py-3 text-sm font-bold text-white-700">${promedio}</td>
        `;

        tablaPromedio1.appendChild(tr);
    }

    return puntos;
}

function tabla2Grafico2(datoA,datoB){
    let conjuntoDatos = {
        Xa: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.60, 0.65, 0.70, 0.75, 0.8, 0.85, 0.9, 0.95],
        Xb: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.60, 0.65, 0.70, 0.75, 0.8, 0.85, 0.9, 0.95, 1]
    }
    const tablaPromedio2 = document.querySelector('#tablaPromedio2');
    tablaPromedio2.innerHTML = '';

    let puntos = [];

    for (let i = 0; i < conjuntoDatos.Xa.length; i++) {
        const xc = ((conjuntoDatos.Xa[i] + conjuntoDatos.Xb[i]) / 2).toFixed(2);
        const promedio = promedioSiConjunto(datoB, datoA, conjuntoDatos.Xa[i], conjuntoDatos.Xb[i]);

        puntos.push({x: parseFloat(xc), y: promedio});

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-4 py-3 text-sm font-bold text-white-700">${conjuntoDatos.Xa[i]}</td>
            <td class="px-4 py-3 text-sm font-bold text-white-700">${conjuntoDatos.Xb[i]}</td>
            <td class="px-4 py-3 text-sm font-bold text-white-700">${xc}</td>
            <td class="px-4 py-3 text-sm font-bold text-white-700">${promedio}</td>
        `;

        tablaPromedio2.appendChild(tr);
    }

    return puntos;
}

function promedioSiConjunto(valores, criterios, y, z) {
  let filtrados = valores.filter((_, i) => criterios[i] >= y && criterios[i] <= z);

  if (filtrados.length === 0) return null;

  let suma = filtrados.reduce((acc, v) => acc + v, 0);
  return parseFloat((suma / filtrados.length).toFixed(4));
}

function graficosUnidos(datasets, canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    if (window.combinedInstance) {
        window.combinedInstance.destroy();
    }

    window.combinedInstance = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: datasets.map(ds => ({
                label: ds.label,
                data: ds.data,
                borderColor: ds.color,
                backgroundColor: ds.color,
                fill: false,
                tension: 0.3
            }))
        },
        options: {
            responsive: true,
            scales: {
                x: { type: 'linear', position: 'bottom' },
                y: { beginAtZero: false }
            }
        }
    });
}
recalc();