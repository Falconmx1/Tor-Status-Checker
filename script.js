// Función para verificar estado de Tor
async function checkTorStatus() {
    const torStatusDiv = document.getElementById('torStatus');
    
    try {
        // Intentar conectar a check.torproject.org
        const response = await fetch('https://check.torproject.org/api/ip', {
            method: 'GET',
            mode: 'cors'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.IsTor) {
                torStatusDiv.textContent = '✅ Conectado a Tor';
                torStatusDiv.className = 'status connected';
            } else {
                torStatusDiv.textContent = '❌ No usando Tor';
                torStatusDiv.className = 'status disconnected';
            }
        } else {
            throw new Error('No se pudo verificar');
        }
    } catch (error) {
        torStatusDiv.textContent = '⚠️ No se puede verificar';
        torStatusDiv.className = 'status disconnected';
    }
}

// Función para obtener IP pública
async function getPublicIP() {
    const ipDiv = document.getElementById('ipAddress');
    ipDiv.textContent = 'Obteniendo IP...';
    
    try {
        // Usar API de ipify
        const response = await fetch('https://api.ipify.org?format=json');
        if (response.ok) {
            const data = await response.json();
            ipDiv.textContent = data.ip;
        } else {
            // Fallback a otra API
            const backupResponse = await fetch('https://api.my-ip.io/ip.json');
            const backupData = await backupResponse.json();
            ipDiv.textContent = backupData.ip;
        }
    } catch (error) {
        ipDiv.textContent = 'Error obteniendo IP';
        console.error('Error:', error);
    }
}

// Verificar IP alternativa (más simple)
async function checkSimpleIP() {
    const ipDiv = document.getElementById('ipAddress');
    ipDiv.textContent = 'Verificando...';
    
    try {
        const response = await fetch('https://httpbin.org/ip');
        const data = await response.json();
        ipDiv.textContent = data.origin;
    } catch (error) {
        ipDiv.textContent = 'No se pudo obtener IP';
    }
}

// Event Listeners
document.getElementById('checkBtn').addEventListener('click', getPublicIP);

// Cargar información al iniciar
window.addEventListener('load', () => {
    checkTorStatus();
    getPublicIP();
});
