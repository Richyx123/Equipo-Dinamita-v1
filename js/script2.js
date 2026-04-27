// js/script2.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
// IMPORTAMOS LA CONFIGURACIÓN CENTRAL (MISMA QUE EN AUTH.JS)
import { firebaseConfig } from './firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let userEmail = "";
let mapa;
let marcadorTemporal; 
let grupoMarcadores; 

// NUEVO: Lista de correos con privilegios de administrador
const ADMIN_EMAILS = [
    'richi@gmail.com', // Tú tienes el control total
    // 'profesor@minatitlan.tecnm.mx' (Puedes agregar más en el futuro)
];

// 1. FUNCIÓN CORREGIDA: CARGAR FEED Y DIBUJAR PUNTOS EN EL MAPA
const cargarFeedYMapa = () => {
    const feedReportes = document.getElementById('feed-reportes');
    const q = query(collection(db, "reportes"), orderBy("fecha", "desc"));

    onSnapshot(q, (snapshot) => {
        feedReportes.innerHTML = ''; 
        
        if (!grupoMarcadores) {
            grupoMarcadores = L.layerGroup().addTo(mapa);
        } else {
            grupoMarcadores.clearLayers();
        }

        snapshot.forEach((doc) => {
            const data = doc.data();
            
            // --- DIBUJAR EN EL FEED ---
            const card = crearTarjetaHTML(data, doc.id);
            feedReportes.appendChild(card);

            // --- DIBUJAR EN EL MAPA ---
            if (data.lat && data.lng) {
                const iconoColor = data.tipo === 'perdido' ? '#dc3545' : '#198754';
                
                const marcador = L.circleMarker([data.lat, data.lng], {
                    color: iconoColor,
                    fillColor: iconoColor,
                    fillOpacity: 0.6,
                    radius: 10
                }).addTo(grupoMarcadores);

                // VALIDACIÓN DE PRIVILEGIOS PARA EL MAPA
                const esMiReporte = data.usuario === userEmail;
                const esAdmin = ADMIN_EMAILS.includes(userEmail);

                const botonEliminarHTML = (esMiReporte || esAdmin) 
                    ? `<button class="btn btn-sm btn-danger mt-2 w-100" onclick="eliminarReporte('${doc.id}', '${data.objeto}')">Eliminar Reporte</button>` 
                    : '';

                marcador.bindPopup(`
                    <div class="text-center">
                        <strong>${data.objeto}</strong><br>
                        <span class="badge ${data.tipo === 'perdido' ? 'bg-danger' : 'bg-success'}">
                            ${data.tipo === 'perdido' ? 'Perdido' : 'Encontrado'}
                        </span><br>
                        <small>📍 ${data.lugar}</small>
                        ${botonEliminarHTML}
                    </div>
                `);
            }
        });
    });
};

// 2. FUNCIÓN AUXILIAR PARA EL DISEÑO DE LAS TARJETAS
const crearTarjetaHTML = (data, docId) => {
    const card = document.createElement('div');
    const esPerdido = data.tipo === 'perdido';
    card.className = `card shadow-sm mb-3 border-start border-4 ${esPerdido ? 'border-danger' : 'border-success'}`;
    
    // VALIDACIÓN DE PRIVILEGIOS
    const esMiReporte = data.usuario === userEmail;
    const esAdmin = ADMIN_EMAILS.includes(userEmail); // ¿El usuario actual es admin?
    
    // Si es mi reporte O soy admin, muestro el botón
    const botonEliminarHTML = (esMiReporte || esAdmin) 
        ? `<button class="btn btn-sm btn-outline-danger float-end btn-eliminar" title="Eliminar reporte"><i class="bi bi-trash"></i></button>` 
        : '';

    card.innerHTML = `
        <div class="card-body p-3">
            ${botonEliminarHTML}
            <h6 class="mb-1 fw-bold">${data.objeto}</h6>
            <p class="small mb-0 text-secondary">📍 ${data.lugar}</p>
            <hr class="my-2">
            <small class="text-muted" style="font-size: 0.7rem;">Reportado por: ${data.usuario}</small>
        </div>
    `;

    // Si el botón se dibujó, le damos la función de borrar
    if (esMiReporte || esAdmin) {
        const btnEliminar = card.querySelector('.btn-eliminar');
        btnEliminar.addEventListener('click', async () => {
            const mensaje = esAdmin && !esMiReporte 
                ? `[MODO ADMIN] ¿Eliminar el reporte de ${data.usuario}?` 
                : `¿Estás seguro de que deseas eliminar este reporte?`;
                
            if (confirm(mensaje)) {
                try {
                    await deleteDoc(doc(db, "reportes", docId));
                } catch (error) {
                    console.error("Error al eliminar el reporte:", error);
                    alert("Hubo un error al intentar eliminar el reporte.");
                }
            }
        });
    }

    return card;
};

// 3. DETECTOR DE SESIÓN CORREGIDO (Llamando a la función correcta)
onAuthStateChanged(auth, (user) => {
    const enPanel = window.location.pathname.includes('panel.html');

    if (user) {
        userEmail = user.email;
        const display = document.getElementById('user-email-display');
        if (display) display.textContent = user.email;

        if (enPanel) {
            inicializarMapa();
            cargarFeedYMapa(); // ✅ AHORA SÍ LLAMAMOS A LA FUNCIÓN QUE DIBUJA EL MAPA
        }
    } else if (enPanel) {
        window.location.replace('index.html');
    }
});

// 4. INICIALIZAR MAPA CON CLIC INTERACTIVO (Punto 1)

const inicializarMapa = () => {
    if (mapa) return;

    // 1. LIMITAMOS EL ÁREA (Caja que encierra solo los edificios del ITM)
    // Coordenadas ajustadas para no salirse a las calles vecinas
    const limitesCampus = L.latLngBounds(
        [18.0125, -94.5575], // Esquina Sur-Oeste (Cerca del Domo)
        [18.0165, -94.5510]  // Esquina Norte-Este (Cerca de la Av. Tecnológico)
    );

    // 2. CONFIGURACIÓN DEL MAPA
    mapa = L.map('map-container', {
        maxBounds: limitesCampus,        // Bloqueo total fuera de esta zona
        maxBoundsViscosity: 1.0,         // Rebote inmediato al llegar al límite
        minZoom: 17,                     // No permite alejarse más allá del campus
        maxZoom: 19                      // Zoom máximo para ver los edificios con detalle
    }).setView([18.0146, -94.5542], 18); // CENTRO: Justo sobre el Edificio LISC

    // 3. CAPA VISUAL
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© ITM - TecFind'
    }).addTo(mapa);

    // 4. EVENTO CLIC (Mantiene tu lógica de reporte)
    mapa.on('click', (e) => {
        const { lat, lng } = e.latlng;
        document.getElementById('latitud').value = lat;
        document.getElementById('longitud').value = lng;

        if (marcadorTemporal) {
            marcadorTemporal.setLatLng(e.latlng);
        } else {
            marcadorTemporal = L.marker(e.latlng).addTo(mapa)
                .bindPopup("Ubicación del objeto").openPopup();
        }
        
        const miModal = new bootstrap.Modal(document.getElementById('modalReporte'));
        miModal.show();
    });
};

// 5. GUARDAR COORDENADAS EN FIRESTORE (Punto 2)
const formReporte = document.getElementById('form-nuevo-reporte');
if (formReporte) {
    formReporte.addEventListener('submit', async (e) => {
        e.preventDefault();

        const lat = document.getElementById('latitud').value;
        const lng = document.getElementById('longitud').value;

        if (!lat || !lng) {
            alert("Por favor, selecciona primero el lugar en el mapa.");
            return;
        }

        const datos = {
            tipo: document.getElementById('tipo_reporte').value,
            objeto: document.getElementById('titulo_objeto').value,
            lugar: document.getElementById('lugar_referencia').value,
            usuario: userEmail,
            fecha: serverTimestamp(),
            lat: parseFloat(lat), // Guardamos como número para el mapa
            lng: parseFloat(lng)
        };

        try {
            await addDoc(collection(db, "reportes"), datos);
            alert("¡Reporte georreferenciado con éxito!");
            formReporte.reset();
            if (marcadorTemporal) mapa.removeLayer(marcadorTemporal);
            marcadorTemporal = null;
            bootstrap.Modal.getInstance(document.getElementById('modalReporte')).hide();
        } catch (error) {
            console.error("Error:", error);
        }
    });
}

// 6. DETECTOR DE SESIÓN CORREGIDO (Llamando a la función correcta)
onAuthStateChanged(auth, (user) => {
    const enPanel = window.location.pathname.includes('panel.html');

    if (user) {
        userEmail = user.email;
        const display = document.getElementById('user-email-display');
        if (display) display.textContent = user.email;

        if (enPanel) {
            inicializarMapa();
            cargarFeedYMapa(); // ✅ AHORA SÍ LLAMAMOS A LA FUNCIÓN QUE DIBUJA EL MAPA
        }
    } else if (enPanel) {
        window.location.replace('index.html');
    }
});

// Función global para que el botón del mapa pueda llamarla
window.eliminarReporte = async (docId, objeto) => {
    const confirmar = confirm(`¿Estás seguro de que deseas eliminar el reporte de: ${objeto}?`);
    if (confirmar) {
        try {
            await deleteDoc(doc(db, "reportes", docId));
            alert("Reporte eliminado correctamente.");
        } catch (error) {
            console.error("Error al eliminar el reporte:", error);
            alert("Hubo un error al intentar eliminar el reporte.");
        }
    }
};

// Cerrar sesión
document.getElementById('btn-logout')?.addEventListener('click', () => signOut(auth));