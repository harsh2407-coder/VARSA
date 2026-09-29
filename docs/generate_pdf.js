import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

async function generatePdf() {
  const htmlPath = path.resolve('docs/report.html');
  const pdfPath = path.resolve('docs/VARSA_Technical_Documentation.pdf');

  if (!fs.existsSync(htmlPath)) {
    throw new Error('docs/report.html not found!');
  }

  console.log('Reading HTML source from:', htmlPath);
  console.log('Launching headless Edge browser with CDP...');
  
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = spawn(edgePath, [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9777',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const list = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9777/json/list', res => {
        let d = '';
        res.on('data', chunk => d += chunk);
        res.on('end', () => resolve(JSON.parse(d)));
      }).on('error', reject);
    });

    const pageTarget = list.find(t => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const curId = id++;
        const handler = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', handler);
            if (msg.error) reject(new Error(msg.error.message));
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    console.log('Navigating to local HTML file...');
    await send('Page.enable');
    const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
    await send('Page.navigate', { url: fileUrl });
    
    // Wait for full layout and CSS rendering
    await new Promise(r => setTimeout(r, 2000));

    console.log('Generating A4 PDF via Page.printToPDF...');
    const pdfData = await send('Page.printToPDF', {
      printBackground: true,
      paperWidth: 8.27,  // A4 inches
      paperHeight: 11.69,
      marginTop: 0.6,
      marginBottom: 0.6,
      marginLeft: 0.6,
      marginRight: 0.6,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size:7pt; font-family:-apple-system, sans-serif; width:100%; display:flex; justify-content:space-between; color:#64748b; padding:0 16mm;">
          <span style="font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">VARSA — Adaptive Weather Intelligence Engine</span>
          <span>SIH26081 · Arctic Rangers</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size:7pt; font-family:-apple-system, sans-serif; width:100%; display:flex; justify-content:space-between; color:#64748b; padding:0 16mm;">
          <span>Technical Documentation Report · Demonstration Dataset</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `
    });

    console.log('Writing PDF to file system...');
    fs.writeFileSync(pdfPath, Buffer.from(pdfData.data, 'base64'));

    const stat = fs.statSync(pdfPath);
    console.log('SUCCESS! PDF generated successfully.');
    console.log('PDF Path:', pdfPath);
    console.log('File Size:', stat.size, 'bytes');

    ws.close();
  } catch (err) {
    console.error('Error during PDF rendering:', err);
    throw err;
  } finally {
    browser.kill();
  }
}

generatePdf().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
