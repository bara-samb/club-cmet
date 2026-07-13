const http = require('http');
const { exec } = require('child_process');
const WebSocket = require('ws');

// 1. Démarrer Chrome en mode Debug remote
const chromeProcess = exec('"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless --remote-debugging-port=9222 --disable-gpu --no-sandbox http://localhost:5175/');

setTimeout(() => {
    // 2. Récupérer l'adresse WebSocket du debugger
    http.get('http://127.0.0.1:9222/json/list', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const list = JSON.parse(data);
                if (list.length > 0) {
                    const target = list[0];
                    const wsUrl = target.webSocketDebuggerUrl;
                    console.log("Connecting to WebSocket:", wsUrl);
                    
                    const ws = new WebSocket(wsUrl);
                    
                    ws.on('open', () => {
                        // Activer le domaine Runtime et Log pour écouter les messages
                        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
                        ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
                    });
                    
                    ws.on('message', (message) => {
                        const event = JSON.parse(message);
                        
                        // Capturer les erreurs de la console
                        if (event.method === 'Runtime.consoleAPICalled') {
                            const args = event.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
                            console.log(`[CONSOLE ${event.params.type.toUpperCase()}]:`, args);
                        }
                        
                        // Capturer les exceptions non interceptées
                        if (event.method === 'Runtime.exceptionThrown') {
                            console.error('[EXCEPTION]:', event.params.exceptionDetails.exception.description);
                        }
                    });
                } else {
                    console.log("Aucune cible Chrome active.");
                }
            } catch (e) {
                console.error("Erreur parsing JSON:", e);
            }
            
            // Fermer Chrome après 4 secondes d'écoute
            setTimeout(() => {
                chromeProcess.kill();
                process.exit(0);
            }, 4000);
        });
    }).on('error', (err) => {
        console.error("Impossible de joindre le port 9222:", err.message);
        chromeProcess.kill();
        process.exit(1);
    });
}, 2000);
