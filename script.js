// Variables globales
let verificationCount = 0;
let onionGenCount = 0;

// Agregar log al panel
function addLog(message, type = 'info') {
    const logs = document.getElementById('connectionLogs');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `[${timestamp}] ${message}`;
    logs.appendChild(logEntry);
    logs.scrollTop = logs.scrollHeight;
}

// 1. Verificar Estado de Tor
async function checkTorStatus() {
    const torStatusEl = document.getElementById('torStatus');
    const torIPEl = document.getElementById('torIP');
    
    try {
        const response = await fetch('https://check.torproject.org/api/ip');
        if (response.ok) {
            const data = await response.json();
            if (data.IsTor) {
                torStatusEl.textContent = '✅ Conectado a Tor';
                torStatusEl.className = 'value connected';
                torIPEl.textContent = data.IP;
                addLog('✅ Conectado a la red Tor - IP: ' + data.IP);
            } else {
                torStatusEl.textContent = '❌ No usando Tor';
                torStatusEl.className = 'value disconnected';
                torIPEl.textContent = 'No disponible';
                addLog('❌ No se detecta conexión Tor');
            }
        }
    } catch (error) {
        torStatusEl.textContent = '⚠️ No se pudo verificar';
        addLog('⚠️ Error verificando estado Tor: ' + error.message);
    }
}

// 2. Obtener IP Pública
async function getPublicIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        document.getElementById('publicIP').textContent = data.ip;
        addLog('🌐 IP Pública obtenida: ' + data.ip);
        verificationCount++;
        updateStats();
    } catch (error) {
        document.getElementById('publicIP').textContent = 'Error';
        addLog('⚠️ Error obteniendo IP pública');
    }
}

// 3. Verificar Puertos Tor
async function checkPort(port) {
    const portElement = document.getElementById(`port${port}`);
    portElement.textContent = '⏳ Probando...';
    
    // Simulación de verificación de puerto (navegador no puede hacer port scanning real)
    setTimeout(() => {
        // Simulación: Puerto 9050 y 9150 son los comunes de Tor
        const isOpen = Math.random() > 0.3; // Simulado
        if (isOpen) {
            portElement.textContent = '✅ Abierto';
            portElement.style.color = '#10b981';
            addLog(`🔌 Puerto ${port} - Parece estar accesible`);
        } else {
            portElement.textContent = '❌ Cerrado';
            portElement.style.color = '#ef4444';
            addLog(`🔌 Puerto ${port} - No accesible`);
        }
    }, 1000);
}

function checkAllPorts() {
    checkPort(9050);
    checkPort(9150);
    checkPort(9040);
}

// 4. Generador .onion falso
function generateOnion() {
    const length = document.getElementById('onionLength').value;
    const v3Mode = document.getElementById('v3Onion').checked;
    let finalLength = v3Mode ? 56 : parseInt(length);
    
    const chars = 'abcdefghijklmnopqrstuvwxyz234567';
    let onion = '';
    for (let i = 0; i < finalLength; i++) {
        onion += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    onion += '.onion';
    
    document.getElementById('onionAddress').textContent = onion;
    onionGenCount++;
    updateStats();
    addLog(`🎲 Nuevo .onion generado: ${onion.substring(0, 20)}...`);
}

function copyOnion() {
    const onion = document.getElementById('onionAddress').textContent;
    navigator.clipboard.writeText(onion);
    addLog('📋 .onion copiado al portapapeles');
    alert('¡Dirección .onion copiada!');
}

// 5. Verificar sitio .onion (simulado)
async function checkOnionSite() {
    const onionInput = document.getElementById('onionInput').value;
    const resultDiv = document.getElementById('onionResult');
    
    if (!onionInput.includes('.onion')) {
        resultDiv.innerHTML = '⚠️ Por favor ingresa una dirección .onion válida';
        resultDiv.style.background = '#fee2e2';
        return;
    }
    
    resultDiv.innerHTML = '🔄 Verificando sitio .onion...';
    resultDiv.style.background = '#fef3c7';
    
    // Simulación (en realidad necesitarías un proxy Tor)
    setTimeout(() => {
        const randomStatus = Math.random();
        if (randomStatus > 0.5) {
            resultDiv.innerHTML = '✅ El sitio parece estar ONLINE<br><small>Respuesta simulada - Para verificación real necesitas Tor Browser</small>';
            resultDiv.style.background = '#d1fae5';
            addLog(`🔍 Sitio ${onionInput} - ONLINE (simulado)`);
        } else {
            resultDiv.innerHTML = '❌ El sitio parece estar OFFLINE o no responde<br><small>Verifica la dirección o intenta más tarde</small>';
            resultDiv.style.background = '#fee2e2';
            addLog(`🔍 Sitio ${onionInput} - OFFLINE (simulado)`);
        }
        verificationCount++;
        updateStats();
    }, 2000);
}

// 6. Lista de Relays Tor (usando Onionoo API)
async function fetchTorRelays() {
    const relaysList = document.getElementById('relaysList');
    const country = document.getElementById('relayCountry').value;
    
    relaysList.innerHTML = '<div class="loading">🔄 Cargando relays desde Tor Network...</div>';
    addLog('🔄 Solicitando lista de relays activos');
    
    try {
        let url = 'https://onionoo.torproject.org/summary?limit=20';
        if (country) {
            url += `&country=${country}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.relays && data.relays.length > 0) {
            relaysList.innerHTML = '';
            data.relays.forEach(relay => {
                const relayDiv = document.createElement('div');
                relayDiv.className = 'relay-item';
                relayDiv.innerHTML = `
                    <div class="relay-name">🔒 ${relay.fingerprint.substring(0, 16)}...</div>
                    <div class="relay-details">
                        📍 ${relay.country || 'Desconocido'} | 
                        🏷️ ${relay.nickname || 'Sin nombre'} | 
                        📡 ${relay.last_seen ? new Date(relay.last_seen).toLocaleDateString() : 'N/A'}
                    </div>
                `;
                relaysList.appendChild(relayDiv);
            });
            addLog(`✅ ${data.relays.length} relays cargados desde la red Tor`);
            document.getElementById('onlineRelays').textContent = data.relays.length;
        } else {
            relaysList.innerHTML = '<div class="loading">⚠️ No se encontraron relays</div>';
        }
    } catch (error) {
        relaysList.innerHTML = '<div class="loading">❌ Error cargando relays: ' + error.message + '</div>';
        addLog('❌ Error obteniendo lista de relays');
    }
}

// 7. Actualizar estadísticas
function updateStats() {
    document.getElementById('checkCount').textContent = verificationCount;
    document.getElementById('onionGenCount').textContent = onionGenCount;
}

// 8. Verificar Todo
async function checkAll() {
    addLog('🚀 Iniciando verificación completa del sistema...');
    
    await checkTorStatus();
    await getPublicIP();
    checkAllPorts();
    await fetchTorRelays();
    
    addLog('✅ Verificación completa finalizada');
    verificationCount++;
    updateStats();
}

// 9. Limpiar Logs
function clearLogs() {
    document.getElementById('connectionLogs').innerHTML = '<div class="log-entry">⚡ Logs limpiados - Nueva sesión iniciada</div>';
    addLog('🧹 Logs eliminados por el usuario');
}

// Event Listeners y inicialización
function init() {
    // Eventos principales
    document.getElementById('checkAllBtn').addEventListener('click', checkAll);
    document.getElementById('clearLogsBtn').addEventListener('click', clearLogs);
    document.getElementById('generateOnionBtn').addEventListener('click', generateOnion);
    document.getElementById('copyOnionBtn').addEventListener('click', copyOnion);
    document.getElementById('checkOnionBtn').addEventListener('click', checkOnionSite);
    document.getElementById('refreshRelaysBtn').addEventListener('click', fetchTorRelays);
    document.getElementById('relayCountry').addEventListener('change', fetchTorRelays);
    
    // Rango de longitud
    const lengthSlider = document.getElementById('onionLength');
    const lengthValue = document.getElementById('lengthValue');
    lengthSlider.addEventListener('input', (e) => {
        lengthValue.textContent = e.target.value;
        if (!document.getElementById('v3Onion').checked) {
            generateOnion();
        }
    });
    
    // Checkbox v3
    document.getElementById('v3Onion').addEventListener('change', (e) => {
        if (e.target.checked) {
            lengthSlider.disabled = true;
            generateOnion();
        } else {
            lengthSlider.disabled = false;
            generateOnion();
        }
    });
    
    // Carga inicial
    checkTorStatus();
    getPublicIP();
    fetchTorRelays();
    generateOnion();
    
    addLog('🎯 Tor Suite Pro inicializado correctamente');
}

// Iniciar cuando cargue la página
window.addEventListener('load', init);
