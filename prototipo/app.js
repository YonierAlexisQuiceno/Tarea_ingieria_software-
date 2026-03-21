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

    // --- DATOS GLOBALES (LocalStorage) ---
    let adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [
        { nombre: 'Juan Pérez', cedula: '123456', usuario: 'juanp', rol: 'Operario', estado: 'ACTIVO' },
        { nombre: 'María García', cedula: '789012', usuario: 'mariam', rol: 'Administrador', estado: 'INACTIVO' }
    ];
    let adminRoles = JSON.parse(localStorage.getItem('adminRoles')) || [
        { nombre: 'Administrador', icono: '💼' },
        { nombre: 'Operario', icono: '👨‍🔧' }
    ];
    let adminCeldas = JSON.parse(localStorage.getItem('adminCeldas')) || [
        { codigo: 'C1', tipo: 'Carro' }, { codigo: 'C2', tipo: 'Carro' },
        { codigo: 'C3', tipo: 'Carro' }, { codigo: 'C4', tipo: 'Carro' },
        { codigo: 'M1', tipo: 'Moto' }, { codigo: 'M2', tipo: 'Moto' },
        { codigo: 'M3', tipo: 'Moto' }, { codigo: 'M4', tipo: 'Moto' }
    ];
    let vehiculosAdentro = JSON.parse(localStorage.getItem('vehiculosAdentro')) || [
        { placa: 'XYZ-123', tipo: 'Carro', hora: '10:15 AM', mensualidad: 'Activa', novedades: 'Ninguna' },
        { placa: 'MTO-001', tipo: 'Moto', hora: '11:30 AM', mensualidad: 'Inactiva', novedades: 'Rayón lateral' },
        { placa: 'DEF-456', tipo: 'Carro', hora: '12:05 PM', mensualidad: 'Ocasional', novedades: '' }
    ];

    function saveToStorage() {
        localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
        localStorage.setItem('adminRoles', JSON.stringify(adminRoles));
        localStorage.setItem('adminCeldas', JSON.stringify(adminCeldas));
        localStorage.setItem('vehiculosAdentro', JSON.stringify(vehiculosAdentro));
    }

    let celdasTotales = adminCeldas.length;

    // --- LÓGICA VISTA OPERARIO ---

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
    const inputSearchPlaca = document.getElementById('operario-search-placa');
    if (inputSearchPlaca) {
        inputSearchPlaca.addEventListener('input', (e) => renderVehiculos(e.target.value));
    }

    function renderVehiculos(filter = '') {
        tbody.innerHTML = '';
        celdasTotales = adminCeldas.length; // re-sync
        
        let filtrados = vehiculosAdentro.filter(v => v.placa.toLowerCase().includes(filter.toLowerCase()));
        
        filtrados.forEach((v) => {
            const tr = document.createElement('tr');
            
            let tipoBadge = v.tipo === 'Carro' ? '<span class="type-badge type-car">🚙 Carro</span>' : '<span class="type-badge type-moto">🏍️ Moto</span>';
            
            let classMs = '';
            if(v.mensualidad === 'Activa') classMs = 'ms-activa';
            else if(v.mensualidad === 'Inactiva') classMs = 'ms-inactiva';
            else classMs = 'ms-ocasional';

            tr.innerHTML = `
                <td>
                    <strong>${v.placa}</strong>
                    ${v.novedades ? `<br><small style="color:#666; font-size:0.8em">✏️ ${v.novedades}</small>` : ''}
                </td>
                <td>${tipoBadge}</td>
                <td>${v.hora}</td>
                <td><span class="mensualidad-badge ${classMs}">${v.mensualidad}</span></td>
                <td><button class="btn-outline-red btn-dar-salida" data-idx="${vehiculosAdentro.indexOf(v)}">Dar Salida</button></td>
            `;
            tbody.appendChild(tr);
        });

        cuposCount.innerText = `${celdasTotales - vehiculosAdentro.length} / ${celdasTotales}`;
        document.getElementById('table-summary').innerText = `Mostrando ${filtrados.length} vehículos.`;

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
        celdasTotales = adminCeldas.length;
        if (vehiculosAdentro.length >= celdasTotales) {
            return alert("No hay cupos disponibles. El parqueadero está lleno según la capacidad configurada.");
        }

        const placa = txtPlaca.value.toUpperCase();
        if(placa.length < 5) return alert("Ingrese una placa válida");
        
        if (vehiculosAdentro.find(v => v.placa === placa)) return alert("El vehículo ya se encuentra adentro.");

        const tipoSelected = document.querySelector('input[name="tipo"]:checked').value;
        const novedades = document.getElementById('novedades').value.trim();
        const hora = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        
        let mensualidadMock = placa.includes('1') ? 'Activa' : 'Ocasional';

        vehiculosAdentro.push({ placa, tipo: tipoSelected, hora, mensualidad: mensualidadMock, novedades });
        saveToStorage();
        
        txtPlaca.value = '';
        document.getElementById('novedades').value = '';
        txtPlaca.dispatchEvent(new Event('input')); // Reset info box
        
        if(inputSearchPlaca) renderVehiculos(inputSearchPlaca.value);
        else renderVehiculos();
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
        
        let msg = `¿Confirmar salida de ${vehiculo.placa}?\nTipo: ${vehiculo.tipo}\nHora Ingreso: ${vehiculo.hora}\nHora Salida: ${horaSalida}\n`;
        if (vehiculo.novedades) {
            msg += `Novedades registradas: ${vehiculo.novedades}\n`;
        }
        
        if(confirm(msg)){
            let cobroInfo = vehiculo.mensualidad === 'Activa' 
                ? 'Vehículo con mensualidad activa. No genera cobro adicional.'
                : 'Cobro calculado por el sistema backend: $4,500';
            
            alert(`✅ Salida registrada con éxito.\n${cobroInfo}`);
            
            vehiculosAdentro.splice(index, 1);
            saveToStorage();
            
            if(inputSearchPlaca) renderVehiculos(inputSearchPlaca.value);
            else renderVehiculos();
        }
    }


    // --- LÓGICA VISTA ADMINISTRADOR ---

    // -- USUARIOS --
    const tbodyUsers = document.getElementById('admin-users-tbody');
    const btnCreateUser = document.getElementById('admin-btn-create-user');
    const inputSearchUser = document.getElementById('admin-search-user');

    function renderUsers(filter = '') {
        tbodyUsers.innerHTML = '';
        adminUsers.filter(u => u.nombre.toLowerCase().includes(filter.toLowerCase()) || u.usuario.toLowerCase().includes(filter.toLowerCase())).forEach((u, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.nombre}</td>
                <td>${u.cedula}</td>
                <td>${u.usuario}</td>
                <td>${u.rol}</td>
                <td><span class="badge ${u.estado === 'ACTIVO' ? 'badge-active' : 'badge-inactive'}">${u.estado}</span></td>
                <td>
                    <button class="btn-action red btn-delete-user" data-idx="${i}">🗑️ Eliminar</button>
                    ${u.estado === 'ACTIVO' 
                        ? `<button class="btn-action outline btn-toggle-user" data-idx="${i}">Desactivar</button>`
                        : `<button class="btn-action blue btn-toggle-user" data-idx="${i}">Activar</button>`}
                </td>
            `;
            tbodyUsers.appendChild(tr);
        });

        document.querySelectorAll('.btn-delete-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-idx');
                if(confirm('¿Eliminar usuario?')) {
                    adminUsers.splice(idx, 1);
                    saveToStorage();
                    renderUsers(inputSearchUser.value);
                }
            });
        });

        document.querySelectorAll('.btn-toggle-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-idx');
                adminUsers[idx].estado = adminUsers[idx].estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
                saveToStorage();
                renderUsers(inputSearchUser.value);
            });
        });
    }

    btnCreateUser.addEventListener('click', () => {
        const nombre = prompt('Nombre completo:');
        if(!nombre) return;
        const cedula = prompt('Cédula:');
        const usuario = prompt('Usuario (username):');
        const rol = prompt('Rol (Administrador/Operario):', 'Operario');
        adminUsers.push({ nombre, cedula, usuario, rol, estado: 'ACTIVO' });
        saveToStorage();
        renderUsers(inputSearchUser.value);
    });

    inputSearchUser.addEventListener('input', (e) => renderUsers(e.target.value));

    // -- ROLES --
    const listRoles = document.getElementById('admin-roles-list');
    const btnCreateRole = document.getElementById('admin-btn-create-role');
    const inputRole = document.getElementById('admin-input-role');

    function renderRoles() {
        listRoles.innerHTML = '';
        adminRoles.forEach((r, i) => {
            const div = document.createElement('div');
            div.className = 'role-item';
            div.innerHTML = `
                <span>${r.icono} <strong>${r.nombre}</strong></span>
                <div class="role-actions">
                    <button class="btn-action red-outline btn-delete-role" data-idx="${i}">Eliminar</button>
                </div>
            `;
            listRoles.appendChild(div);
        });

        document.querySelectorAll('.btn-delete-role').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-idx');
                if(confirm('¿Eliminar rol?')) {
                    adminRoles.splice(idx, 1);
                    saveToStorage();
                    renderRoles();
                }
            });
        });
    }

    btnCreateRole.addEventListener('click', () => {
        const nombre = inputRole.value.trim();
        if(!nombre) return alert('Ingrese un nombre de rol');
        adminRoles.push({ nombre, icono: '🛠️' });
        inputRole.value = '';
        saveToStorage();
        renderRoles();
    });

    // -- CELDAS --
    const gridCeldas = document.getElementById('celdas-grid');
    const btnCreateCelda = document.getElementById('admin-btn-create-celda');
    const inputCeldaCode = document.getElementById('admin-input-celda-code');
    const selectCeldaType = document.getElementById('admin-select-celda-type');

    function renderCeldasAdmin() {
        gridCeldas.innerHTML = '';
        let totales = adminCeldas.length;
        let ocupadas = vehiculosAdentro.length > totales ? totales : vehiculosAdentro.length;
        let libres = totales - ocupadas;

        document.getElementById('stat-ocupadas').innerText = ocupadas;
        document.getElementById('stat-disponibles').innerText = libres;
        document.getElementById('stat-totales').innerText = totales;

        adminCeldas.forEach((celda, index) => {
            const div = document.createElement('div');
            const isOcupada = index < ocupadas;
            div.className = `celda ${isOcupada ? 'ocupada' : 'libre'}`;
            // Muestra código y tipo abreviado
            div.innerHTML = `${celda.codigo}<br><small style="font-size:0.6em; font-weight:normal">${celda.tipo}</small>`;
            gridCeldas.appendChild(div);
        });
        
        celdasTotales = totales;
        if (document.getElementById('cupos-count')) {
             document.getElementById('cupos-count').innerText = `${totales - ocupadas} / ${totales}`;
        }
    }

    btnCreateCelda.addEventListener('click', () => {
        const codigo = inputCeldaCode.value.trim().toUpperCase();
        const tipo = selectCeldaType.value;
        if(!codigo || !tipo) return alert('Ingrese código y seleccione tipo de celda');
        
        if (adminCeldas.find(c => c.codigo === codigo)) {
            return alert('El código de celda ya existe');
        }

        adminCeldas.push({ codigo, tipo });
        inputCeldaCode.value = '';
        selectCeldaType.value = '';
        saveToStorage();
        renderCeldasAdmin();
    });

    // Init Admin
    renderUsers();
    renderRoles();
    renderVehiculos();
});
