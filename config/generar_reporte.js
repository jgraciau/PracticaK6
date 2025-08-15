const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../resultados/resultado.json');
const htmlPath = path.join(__dirname, '../resultados/reporte_k6.html');

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const metrics = data.metrics;
const checks = data.root_group.checks[Object.keys(data.root_group.checks)[0]];


const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte de Prueba K6</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 2em; background: #f4f6fa; }
    h1 { color: #1a237e; }
    h2 { color: #3949ab; }
    .resumen, .graficas { display: flex; flex-wrap: wrap; gap: 2em; }
    .resumen ul { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 1.5em 2em; min-width: 300px; }
    table { border-collapse: collapse; width: 100%; margin: 2em 0; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; }
    th, td { border: 1px solid #e0e0e0; padding: 10px 16px; text-align: left; }
    th { background: #3949ab; color: #fff; }
    tr:nth-child(even) { background: #f2f2f2; }
    .ok { color: #388e3c; font-weight: bold; }
    .fail { color: #d32f2f; font-weight: bold; }
    .graficas { gap: 3em; margin-top: 2em; }
    .grafica { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 1.5em; }
  </style>
</head>
<body>
  <h1>Reporte de Prueba K6</h1>
  <div class="resumen">
    <ul>
      <li><b>Iteraciones completadas:</b> ${metrics.iterations.count}</li>
      <li><b>Duración total (estimada):</b> ${(metrics.iteration_duration.avg/1000).toFixed(2)} s</li>
      <li><b>Usuarios virtuales máximos:</b> ${metrics.vus_max.value}</li>
      <li><b>URL probada:</b> https://automationexercise.com/</li>
    </ul>
    <div class="graficas">
      <div class="grafica">
        <h3 style="text-align:center; margin-bottom:0.5em;">Tiempos de Respuesta</h3>
        <canvas id="graficoTiempos" width="350" height="250"></canvas>
      </div>
      <div class="grafica">
        <h3 style="text-align:center; margin-bottom:0.5em;">Respuesta</h3>
        <canvas id="graficoChecks" width="350" height="250"></canvas>
      </div>
    </div>
  </div>


  <h2>Statistics</h2>
  <table style="text-align:center;">
    <tr style="background:#b7cee6;">
      <th colspan="4">Requests</th>
      <th colspan="4">Executions</th>
      <th colspan="5">Response Times (s)</th>
      <th colspan="2">Throughput</th>
      <th colspan="2">Network (KB/sec)</th>
    </tr>
    <tr style="background:#b7cee6;">
      <th>Label</th>
      <th>#Samples</th>
      <th>FAIL</th>
      <th>Error %</th>
      <th>Average</th>
      <th>Min</th>
      <th>Max</th>
      <th>Median</th>
      <th>90th pct</th>
      <th>95th pct</th>
      <th>99th pct</th>
      <th>Transactions/s</th>
      <th>Received</th>
      <th>Sent</th>
    </tr>
    <tr>
      <td>All</td>
      <td>${metrics.http_reqs.count}</td>
      <td>${(checks.fails && checks.fails > 0) ? checks.fails : 0}</td>
      <td>${(checks.fails && checks.fails > 0 && metrics.http_reqs.count > 0) ? ((checks.fails/metrics.http_reqs.count)*100).toFixed(2) : '0.00'}%</td>
      <td>${(metrics.http_req_duration.avg/1000).toFixed(3)}</td>
      <td>${(metrics.http_req_duration.min/1000).toFixed(3)}</td>
      <td>${(metrics.http_req_duration.max/1000).toFixed(3)}</td>
      <td>${(metrics.http_req_duration.med/1000).toFixed(3)}</td>
      <td>${(metrics.http_req_duration['p(90)']/1000).toFixed(3)}</td>
      <td>${(metrics.http_req_duration['p(95)']/1000).toFixed(3)}</td>
      <td>-</td>
      <td>${metrics.http_reqs.rate ? metrics.http_reqs.rate.toFixed(2) : 'N/A'}</td>
      <td>${metrics.data_received ? (metrics.data_received.rate/1024).toFixed(2) : 'N/A'}</td>
      <td>${metrics.data_sent ? (metrics.data_sent.rate/1024).toFixed(2) : 'N/A'}</td>
    </tr>
  </table>

  <h2>Errors</h2>
  <table style="text-align:center;">
    <tr style="background:#b7cee6;">
      <th>Type of error</th>
      <th>Number of errors</th>
      <th>% in errors</th>
      <th>% in all samples</th>
    </tr>
    <tr>
      <td>Checks fallidos</td>
      <td>${checks.fails}</td>
      <td>${(checks.fails + (metrics.http_req_failed && typeof metrics.http_req_failed.fails === 'number' ? metrics.http_req_failed.fails : 0)) > 0 ? ((checks.fails/(checks.fails + (metrics.http_req_failed && typeof metrics.http_req_failed.fails === 'number' ? metrics.http_req_failed.fails : 0)))*100).toFixed(2) : '0.00'}%</td>
      <td>${metrics.http_reqs.count > 0 ? ((checks.fails/metrics.http_reqs.count)*100).toFixed(2) : '0.00'}%</td>
    </tr>
    <tr>
    </tr>
  </table>
  <p>Este reporte es un resumen visual basado en la última ejecución de tu script K6.</p>

  <script>
    // Gráfico de barras para tiempos de respuesta
    new Chart(document.getElementById('graficoTiempos').getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Mínimo', 'Promedio', 'Máximo'],
        datasets: [{
          label: 'Duración de solicitud (ms)',
          data: [${(metrics.http_req_duration.min/1000).toFixed(3)}, ${(metrics.http_req_duration.avg/1000).toFixed(3)}, ${(metrics.http_req_duration.max/1000).toFixed(3)}],
          label: 'Duración de solicitud (s)',
          backgroundColor: ['#43a047', '#1976d2', '#d32f2f']
        }]
      },
      options: {
        responsive: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });

    // Gráfico de pastel para checks
    new Chart(document.getElementById('graficoChecks').getContext('2d'), {
      type: 'pie',
      data: {
        labels: [
          'Correctos (' + (${checks.passes}/(${checks.passes}+${checks.fails})*100).toFixed(1) + '%)',
          'Errores (' + (${checks.fails}/(${checks.passes}+${checks.fails})*100).toFixed(1) + '%)'
        ],
        datasets: [{
          data: [${checks.passes}, ${checks.fails}],
          backgroundColor: ['#43a047', '#d32f2f']
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  </script>
</body>
</html>`;

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Reporte HTML generado en', htmlPath);
