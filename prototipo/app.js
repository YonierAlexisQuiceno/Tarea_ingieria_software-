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
    
    // Default vehiculos with designated valid cells to match new system
    let vehiculosAdentro = JSON.parse(localStorage.getItem('vehiculosAdentro')) || [
        { placa: 'XYZ-123', tipo: 'Carro', celda: 'C1', hora: '10:15 AM', mensualidad: 'Activa', novedades: 'Ninguna' },
        { placa: 'MTO-001', tipo: 'Moto', celda: 'M1', hora: '11:30 AM', mensualidad: 'Inactiva (Vencida)', novedades: 'Rayón lateral' },
        { placa: 'DEF-456', tipo: 'Carro', celda: 'C2', hora: '12:05 PM', mensualidad: 'Ocasional', novedades: '' }
    ];

    let adminPagos = JSON.parse(localStorage.getItem('adminPagos')) || [
        { placa: 'XYZ-123', cliente: 'Carlos Vargas', fechaVencimiento: '2026-12-31' },
    ];

    function saveToStorage() {
        localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
        localStorage.setItem('adminRoles', JSON.stringify(adminRoles));
        localStorage.setItem('adminCeldas', JSON.stringify(adminCeldas));
        localStorage.setItem('vehiculosAdentro', JSON.stringify(vehiculosAdentro));
        localStorage.setItem('adminPagos', JSON.stringify(adminPagos));
    }

    function verificarMensualidad(placa) {
        const pago = adminPagos.find(p => p.placa === placa);
        if(!pago) return 'Ocasional';
        // Simplified check date logic (ignore timezone mismatch offset)
        const hoyStr = new Date().toISOString().split('T')[0];
        return pago.fechaVencimiento >= hoyStr ? 'Activa' : 'Inactiva (Vencida)';
    }

    let celdasTotales = adminCeldas.length;

    // --- LÓGICA VISTA OPERARIO ---
    const tbody = document.getElementById('vehiculos-tbody');
    const cuposCount = document.getElementById('cupos-count');
    const txtPlaca = document.getElementById('placa');
    const radiosTipo = document.querySelectorAll('input[name="tipo"]');
    const boxMensualidad = document.getElementById('mensualidad-info');
    const btnEntrada = document.getElementById('btn-registrar-entrada');
    const btnSalida = document.getElementById('btn-registrar-salida');

    radiosTipo.forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.querySelectorAll('.radio-card').forEach(rc => rc.classList.remove('active'));
            e.target.parentElement.classList.add('active');
        });
    });

    txtPlaca.addEventListener('input', (e) => {
        const val = e.target.value.toUpperCase();
        if(val.length >= 5) {
            let estadoMensualidad = verificarMensualidad(val);
            if(estadoMensualidad === 'Activa'){
                boxMensualidad.innerHTML = '✅ Estado de Mensualidad: <strong style="color:#166534">Activa (Prepagada)</strong>';
                boxMensualidad.style.backgroundColor = '#dcfce7';
                boxMensualidad.style.borderColor = '#bbf7d0';
            } else if (estadoMensualidad.includes('Inactiva')) {
                boxMensualidad.innerHTML = '⚠️ Estado de Mensualidad: <strong style="color:#991b1b">Inactiva (Vencida)</strong>';
                boxMensualidad.style.backgroundColor = '#fecaca';
                boxMensualidad.style.borderColor = '#f87171';
            } else {
                boxMensualidad.innerHTML = 'ℹ️ Estado de Mensualidad: <strong style="color:#92400e">Ocasional / Sin plan activo</strong>';
                boxMensualidad.style.backgroundColor = '#fef3c7';
                boxMensualidad.style.borderColor = '#fde68a';
            }
        } else {
            boxMensualidad.innerHTML = 'ℹ️ Estado de Mensualidad: <em>Esperando placa...</em>';
            boxMensualidad.style.backgroundColor = '#fff9c4';
            boxMensualidad.style.borderColor = '#f2e27e';
        }
    });

    const inputSearchPlaca = document.getElementById('operario-search-placa');
    if (inputSearchPlaca) {
        inputSearchPlaca.addEventListener('input', (e) => renderVehiculos(e.target.value));
    }

    function renderVehiculos(filter = '') {
        tbody.innerHTML = '';
        celdasTotales = adminCeldas.length; 
        
        let filtrados = vehiculosAdentro.filter(v => v.placa.toLowerCase().includes(filter.toLowerCase()));
        
        filtrados.forEach((v) => {
            const tr = document.createElement('tr');
            let tipoBadge = v.tipo === 'Carro' ? '<span class="type-badge type-car">🚙 Carro</span>' : '<span class="type-badge type-moto">🏍️ Moto</span>';
            
            let classMs = '';
            if(v.mensualidad === 'Activa') classMs = 'ms-activa';
            else if(v.mensualidad.includes('Inactiva')) classMs = 'ms-inactiva';
            else classMs = 'ms-ocasional';

            tr.innerHTML = `
                <td>
                    <strong>\${v.placa}</strong> <span style="color: #6366f1;">(\${v.celda || 'N/A'})</span>
                    \${v.novedades ? \`<br><small style="color:#666; font-size:0.8em">✏️ \${v.novedades}</small>\` : ''}
                </td>
                <td>\${tipoBadge}</td>
                <td>\${v.hora}</td>
                <td><span class="mensualidad-badge \${classMs}">\${v.mensualidad}</span></td>
                <td><button class="btn-outline-red btn-dar-salida" data-idx="\${vehiculosAdentro.indexOf(v)}">Dar Salida</button></td>
            `;
            tbody.appendChild(tr);
        });

        cuposCount.innerText = `\${celdasTotales - vehiculosAdentro.length} / \${celdasTotales}`;
        document.getElementById('table-summary').innerText = `Mostrando \${filtrados.length} vehículos.`;

        document.querySelectorAll('.btn-dar-salida').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-idx');
                darSalida(idx);
            });
        });

        renderCeldasAdmin();
    }

    btnEntrada.addEventListener('click', () => {
        celdasTotales = adminCeldas.length;
        if (vehiculosAdentro.length >= celdasTotales) {
            return alert("No hay cupos disponibles en el parqueadero.");
        }

        const placa = txtPlaca.value.toUpperCase();
        if(placa.length < 5) return alert("Ingrese una placa válida");
        
        if (vehiculosAdentro.find(v => v.placa === placa)) return alert("El vehículo ya se encuentra adentro.");

        const tipoSelected = document.querySelector('input[name="tipo"]:checked').value;
        const celdasOcupadas = vehiculosAdentro.map(v => v.celda);
        const celdasDisponibles = adminCeldas.filter(c => c.tipo === tipoSelected && !celdasOcupadas.includes(c.codigo));

        if (celdasDisponibles.length === 0) {
            return alert(`Atención: No hay celdas disponibles para \${tipoSelected}.`);
        }
        
        const celdaAsignada = celdasDisponibles[0].codigo;
        const novedades = document.getElementById('novedades').value.trim();
        const hora = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        let estadoMensualidad = verificarMensualidad(placa);

        vehiculosAdentro.push({ placa, tipo: tipoSelected, hora, mensualidad: estadoMensualidad, novedades, celda: celdaAsignada });
        saveToStorage();
        
        alert(`✅ Ingreso registrado.\nSe asignó la celda: \${celdaAsignada}`);

        txtPlaca.value = '';
        document.getElementById('novedades').value = '';
        txtPlaca.dispatchEvent(new Event('input'));
        
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
        
        let msg = `¿Confirmar salida de \${vehiculo.placa}?\nCelda liberada: \${vehiculo.celda}\nTipo: \${vehiculo.tipo}\nHora Ingreso: \${vehiculo.hora}\nHora Salida: \${horaSalida}\n`;
        if (vehiculo.novedades) {
            msg += `Novedades registradas: \${vehiculo.novedades}\n`;
        }
        
        if(confirm(msg)){
            let cobroInfo = vehiculo.mensualidad === 'Activa' 
                ? 'El vehículo tiene pago mensual vigente. No realizar cobros o deducción extra.'
                : 'Cobro por tarifa ocasional/fraccionada calculado: $4,500';
            
            alert(`✅ Salida procesada.\n\${cobroInfo}`);
            
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
                <td>\${u.nombre}</td>
                <td>\${u.cedula}</td>
                <td>\${u.usuario}</td>
                <td>\${u.rol}</td>
                <td><span class="badge \${u.estado === 'ACTIVO' ? 'badge-active' : 'badge-inactive'}">\${u.estado}</span></td>
                <td>
                    <button class="btn-action red btn-delete-user" data-idx="\${i}">🗑️ Eliminar</button>
                    \${u.estado === 'ACTIVO' 
                        ? \`<button class="btn-action outline btn-toggle-user" data-idx="\${i}">Desactivar</button>\`
                        : \`<button class="btn-action blue btn-toggle-user" data-idx="\${i}">Activar</button>\`}
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
                <span>\${r.icono} <strong>\${r.nombre}</strong></span>
                <div class="role-actions">
                    <button class="btn-action red-outline btn-delete-role" data-idx="\${i}">Eliminar</button>
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
        let ocupadas = vehiculosAdentro.length;
        let libres = totales - ocupadas;

        document.getElementById('stat-ocupadas').innerText = ocupadas;
        document.getElementById('stat-disponibles').innerText = libres;
        document.getElementById('stat-totales').innerText = totales;

        adminCeldas.forEach((celda) => {
            const div = document.createElement('div');
            const vehiculoOcupante = vehiculosAdentro.find(v => v.celda === celda.codigo);
            
            div.className = `celda \${vehiculoOcupante ? 'ocupada' : 'libre'}`;
            // Muestra código y tipo abreviado
            div.innerHTML = `\${celda.codigo}<br><small style="font-size:0.6em; font-weight:normal">\${celda.tipo}</small>`;
            
            if (vehiculoOcupante) {
                div.innerHTML += `<br><span style="font-size:0.7em; font-weight:bold; color: white;">\${vehiculoOcupante.placa}</span>`;
            }

            gridCeldas.appendChild(div);
        });
        
        celdasTotales = totales;
        if (document.getElementById('cupos-count')) {
             document.getElementById('cupos-count').innerText = `\${totales - ocupadas} / \${totales}`;
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

    // -- PAGOS (MENSUALIDADES) --
    const tbodyPagos = document.getElementById('admin-pagos-tbody');
    const btnCreatePago = document.getElementById('admin-btn-create-pago');
    const inputPagoPlaca = document.getElementById('admin-input-pago-placa');
    const inputPagoCliente = document.getElementById('admin-input-pago-cliente');
    const inputPagoFecha = document.getElementById('admin-input-pago-fecha');

    function renderPagos() {
        if (!tbodyPagos) return;
        tbodyPagos.innerHTML = '';
        const hoyStr = new Date().toISOString().split('T')[0];
        
        adminPagos.forEach((p, i) => {
            const tr = document.createElement('tr');
            const isVigente = p.fechaVencimiento >= hoyStr;
            tr.innerHTML = `
                <td><strong>\${p.placa}</strong></td>
                <td>\${p.cliente}</td>
                <td>\${p.fechaVencimiento}</td>
                <td><span class="badge \${isVigente ? 'badge-active' : 'badge-inactive'}">\${isVigente ? 'VIGENTE' : 'VENCIDA'}</span></td>
                <td>
                    <button class="btn-action red btn-delete-pago" data-idx="\${i}">🗑️ Eliminar</button>
                </td>
            `;
            tbodyPagos.appendChild(tr);
        });

        document.querySelectorAll('.btn-delete-pago').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-idx');
                if(confirm('¿Seguro de eliminar este registro de pago?')) {
                    adminPagos.splice(idx, 1);
                    saveToStorage();
                    renderPagos();
                    if(document.getElementById('placa')) document.getElementById('placa').dispatchEvent(new Event('input')); 
                    if(inputSearchPlaca) renderVehiculos(inputSearchPlaca.value);
                }
            });
        });
    }

    if (btnCreatePago) {
        btnCreatePago.addEventListener('click', () => {
            const placa = inputPagoPlaca.value.trim().toUpperCase();
            const cliente = inputPagoCliente.value.trim();
            const fecha = inputPagoFecha.value;

            if(!placa || !cliente || !fecha) return alert('Por favor complete la placa, el cliente y la fecha de vencimiento.');

            const idx = adminPagos.findIndex(p => p.placa === placa);
            if(idx !== -1) {
                adminPagos[idx] = { placa, cliente, fechaVencimiento: fecha };
            } else {
                adminPagos.push({ placa, cliente, fechaVencimiento: fecha });
            }

            inputPagoPlaca.value = '';
            inputPagoCliente.value = '';
            inputPagoFecha.value = '';
            
            saveToStorage();
            renderPagos();
            if(document.getElementById('placa')) document.getElementById('placa').dispatchEvent(new Event('input'));
            if(inputSearchPlaca) renderVehiculos(inputSearchPlaca.value);
            
            alert('Pago registrado correctamente. Mensualidad extendida.');
        });
    }

    // Init Admin
    renderUsers();
    renderRoles();
    renderPagos();
    renderVehiculos();
});
