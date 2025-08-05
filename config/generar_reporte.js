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
  <style>
    body { font-family: Arial, sans-serif; margin: 2em; background: #f9f9f9; }
    h1 { color: #2c3e50; }
    table { border-collapse: collapse; width: 80%; margin: 2em 0; }
    th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
    th { background: #2c3e50; color: #fff; }
    tr:nth-child(even) { background: #f2f2f2; }
    .ok { color: green; font-weight: bold; }
    .fail { color: red; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Reporte de Prueba K6</h1>
  <h2>Resumen</h2>
  <ul>
    <li><b>Iteraciones completadas:</b> ${metrics.iterations.count}</li>
    <li><b>Duración total (estimada):</b> ${(metrics.iteration_duration.avg/1000).toFixed(2)} s</li>
    <li><b>Usuarios virtuales máximos:</b> ${metrics.vus_max.value}</li>
    <li><b>URL probada:</b> https://automationexercise.com/</li>
  </ul>
  <h2>Resultados HTTP</h2>
  <table>
    <tr><th>Métrica</th><th>Valor</th></tr>
    <tr><td>Duración promedio de solicitud</td><td>${metrics.http_req_duration.avg.toFixed(2)} ms</td></tr>
    <tr><td>Duración mínima de solicitud</td><td>${metrics.http_req_duration.min} ms</td></tr>
    <tr><td>Duración máxima de solicitud</td><td>${metrics.http_req_duration.max} ms</td></tr>
    <tr><td>Estado 200</td><td class="ok">✔ (${checks.passes} correctos)</td></tr>
    <tr><td>Errores</td><td class="ok">${checks.fails}</td></tr>
  </table>
  <p>Este reporte es un resumen visual basado en la última ejecución de tu script K6.</p>
</body>
</html>`;

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Reporte HTML generado en', htmlPath);
