document.addEventListener('DOMContentLoaded', () => {
    
    // --- NAVEGACIÓN ENTRE VISTAS ---
    const btnOperario = document.getElementById('btnViewOperario');
    const btnAdmin = document.getElementById('btnViewAdmin');
    const viewOperario = document.getElementById('view-operario');
    const viewAdmin = document.getElementById('view-admin');

    btnOperario.addEventListener('click', () => {
        btnOperario.classList.add('active');
        btnAdmin.classList.remove('active');
        viewOperario.classList.add('active');
        viewAdmin.classList.remove('active');
    });

    btnAdmin.addEventListener('click', () => {
        btnAdmin.classList.add('active');
        btnOperario.classList.remove('active');
        viewAdmin.classList.add('active');
        viewOperario.classList.remove('active');
    });

    // --- LÓGICA VISTA OPERARIO ---
    
    // Base de datos local mock
    let celdasTotales = 50;
    
    let vehiculosAdentro = [
        { placa: 'XYZ-123', tipo: 'Carro', hora: '10:15 AM', mensualidad: 'Activa' },
        { placa: 'MTO-001', tipo: 'Moto', hora: '11:30 AM', mensualidad: 'Inactiva' },
        { placa: 'DEF-456', tipo: 'Carro', hora: '12:05 PM', mensualidad: 'Ocasional' }
    ];

    // Selectores Operario
    const tbody = document.getElementById('vehiculos-tbody');
    const cuposCount = document.getElementById('cupos-count');
    const txtPlaca = document.getElementById('placa');
    const radiosTipo = document.querySelectorAll('input[name="tipo"]');
    const boxMensualidad = document.getElementById('mensualidad-info');
    const btnEntrada = document.getElementById('btn-registrar-entrada');
    const btnSalida = document.getElementById('btn-registrar-salida');

    // Estado Formulario Radio Buttons
    radiosTipo.forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.querySelectorAll('.radio-card').forEach(rc => rc.classList.remove('active'));
            e.target.parentElement.classList.add('active');
        });
    });

    // Simulación Validación Mensualidad al escribir placa
    txtPlaca.addEventListener('input', (e) => {
        const val = e.target.value.toUpperCase();
        if(val.length >= 5) {
            // Mostrar estado mock
            if(val.includes('1')){
                boxMensualidad.innerHTML = '✅ Estado de Mensualidad: <strong style="color:#166534">Activa (Prepagada)</strong>';
                boxMensualidad.style.backgroundColor = '#dcfce7';
                boxMensualidad.style.borderColor = '#bbf7d0';
            } else {
                boxMensualidad.innerHTML = '⚠️ Estado de Mensualidad: <strong style="color:#92400e">Ocasional / Sin plan activo</strong>';
                boxMensualidad.style.backgroundColor = '#fef3c7';
                boxMensualidad.style.borderColor = '#fde68a';
            }
        } else {
            boxMensualidad.innerHTML = 'ℹ️ Estado de Mensualidad: <em>Esperando placa...</em>';
            boxMensualidad.style.backgroundColor = '#fff9c4';
            boxMensualidad.style.borderColor = '#f2e27e';
        }
    });

    // Renderizar Tabla Operario
    function renderVehiculos() {
        tbody.innerHTML = '';
        vehiculosAdentro.forEach((v, index) => {
            const tr = document.createElement('tr');
            
            let tipoBadge = v.tipo === 'Carro' ? '<span class="type-badge type-car">🚙 Carro</span>' : '<span class="type-badge type-moto">🏍️ Moto</span>';
            
            let classMs = '';
            if(v.mensualidad === 'Activa') classMs = 'ms-activa';
            else if(v.mensualidad === 'Inactiva') classMs = 'ms-inactiva';
            else classMs = 'ms-ocasional';

            tr.innerHTML = `
                <td><strong>${v.placa}</strong></td>
                <td>${tipoBadge}</td>
                <td>${v.hora}</td>
                <td><span class="mensualidad-badge ${classMs}">${v.mensualidad}</span></td>
                <td><button class="btn-outline-red btn-dar-salida" data-idx="${index}">Dar Salida</button></td>
            `;
            tbody.appendChild(tr);
        });

        cuposCount.innerText = `${celdasTotales - vehiculosAdentro.length} / ${celdasTotales}`;
        document.getElementById('table-summary').innerText = `Mostrando ${vehiculosAdentro.length} vehículos actualmente estacionados.`;

        // Eventos dar salida
        document.querySelectorAll('.btn-dar-salida').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-idx');
                darSalida(idx);
            });
        });

        renderCeldasAdmin(); // Sincronizar con admin
    }

    btnEntrada.addEventListener('click', () => {
        const placa = txtPlaca.value.toUpperCase();
        if(placa.length < 5) return alert("Ingrese una placa válida");

        const tipoSelected = document.querySelector('input[name="tipo"]:checked').value;
        const hora = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        
        let mensualidadMock = placa.includes('1') ? 'Activa' : 'Ocasional';

        vehiculosAdentro.push({ placa, tipo: tipoSelected, hora, mensualidad: mensualidadMock });
        txtPlaca.value = '';
        document.getElementById('novedades').value = '';
        txtPlaca.dispatchEvent(new Event('input')); // Reset info box
        renderVehiculos();
    });

    btnSalida.addEventListener('click', () => {
        const placa = txtPlaca.value.toUpperCase();
        if(placa.length < 5) return alert("Ingrese una placa válida a dar salida");
        
        const index = vehiculosAdentro.findIndex(v => v.placa === placa);
        if(index !== -1){
            darSalida(index);
            txtPlaca.value = '';
            txtPlaca.dispatchEvent(new Event('input'));
        } else {
            alert("Vehículo no encontrado en el parqueadero.");
        }
    });

    function darSalida(index) {
        const vehiculo = vehiculosAdentro[index];
        const horaSalida = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        if(confirm(`¿Confirmar salida del vehículo ${vehiculo.placa}?\nHora Actual: ${horaSalida}\nTiempo estimado de cobro calculado por el sistema backend.`)){
            vehiculosAdentro.splice(index, 1);
            renderVehiculos();
        }
    }


    // --- LÓGICA VISTA ADMINISTRADOR ---
    const gridCeldas = document.getElementById('celdas-grid');
    const maxCeldasDemo = 12;

    function renderCeldasAdmin() {
        gridCeldas.innerHTML = '';
        let ocupadas = vehiculosAdentro.length > maxCeldasDemo ? maxCeldasDemo : vehiculosAdentro.length;
        let libres = maxCeldasDemo - ocupadas;

        document.getElementById('stat-ocupadas').innerText = ocupadas;
        document.getElementById('stat-disponibles').innerText = libres;
        document.getElementById('stat-totales').innerText = maxCeldasDemo;

        // Render Celdas Ocupadas
        for(let i=1; i<=ocupadas; i++){
            const div = document.createElement('div');
            div.className = 'celda ocupada';
            div.innerText = `C${i}`;
            gridCeldas.appendChild(div);
        }
        // Render Celdas Libres
        for(let i=ocupadas+1; i<=maxCeldasDemo; i++){
            const div = document.createElement('div');
            div.className = 'celda libre';
            div.innerText = `C${i}`;
            gridCeldas.appendChild(div);
        }
    }

    // Init
    renderVehiculos();
});
