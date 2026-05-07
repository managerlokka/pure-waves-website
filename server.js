const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // API to handle Admin panel saving videos
    if (req.url === '/api/videos' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                // Validate JSON
                const videos = JSON.parse(body);
                // Save to data.json
                fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(videos, null, 2));
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Videos saved successfully!' }));
            } catch (err) {
                console.error(err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Server error saving videos' }));
            }
        });
        return;
    }

    // API to handle Admin panel saving settings
    if (req.url === '/api/settings' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const settings = JSON.parse(body);
                fs.writeFileSync(path.join(__dirname, 'settings.json'), JSON.stringify(settings, null, 2));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Settings saved successfully!' }));
            } catch (err) {
                console.error(err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Server error saving settings' }));
            }
        });
        return;
    }

    // Serve Static Files
    let filePath = req.url === '/' ? '/index.html' : req.url;
    // Remove query parameters if any
    filePath = filePath.split('?')[0];
    // Decode URL so files with spaces (like "Pure Waves Logo.png") load correctly
    filePath = decodeURIComponent(filePath);
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    const fullPath = path.join(__dirname, filePath);

    fs.readFile(fullPath, (error, content) => {
        if (error) {
            if(error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Server running locally!`);
    console.log(`🌐 Website: http://localhost:${PORT}`);
    console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin.html`);
    console.log(`=========================================`);
});
