// --- SELECCIONES DEL DOM ---
const btnRegistrarte = document.getElementById('btn-registrarte');
const btnLogin = document.getElementById('btn-login');
const btnCtaRegistrarte = document.getElementById('btn-cta-registrarte');
const btnCtaLogin = document.getElementById('btn-cta-login');
const btnRegresar = document.getElementById('btn-regresar');
const btnLoginRegresar = document.getElementById('btn-login-regresar');

const homeSection = document.getElementById('home-section');
const registerSection = document.getElementById('register-section');
const loginSection = document.getElementById('login-section');

// --- FUNCIONES DE NAVEGACIÓN ---
function mostrarSeccion(seccion) {
    if (homeSection) homeSection.classList.add('hidden');
    if (registerSection) registerSection.classList.add('hidden');
    if (loginSection) loginSection.classList.add('hidden');

    seccion.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Esta es la función que reemplaza a "volverInicio"
function mostrarHome() {
    if (homeSection) homeSection.classList.remove('hidden');
    if (registerSection) registerSection.classList.add('hidden');
    if (loginSection) loginSection.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- EVENTOS DE CLIC ---
// Navegación hacia registro
if (btnRegistrarte) {
    btnRegistrarte.addEventListener('click', () => mostrarSeccion(registerSection));
}
if (btnCtaRegistrarte) {
    btnCtaRegistrarte.addEventListener('click', () => mostrarSeccion(registerSection));
}

// Navegación hacia login
if (btnLogin) {
    btnLogin.addEventListener('click', () => mostrarSeccion(loginSection));
}
if (btnCtaLogin) {
    btnCtaLogin.addEventListener('click', () => mostrarSeccion(loginSection));
}

// Volver al inicio desde los botones de los formularios
if (btnRegresar) {
    btnRegresar.addEventListener('click', mostrarHome);
}
if (btnLoginRegresar) {
    btnLoginRegresar.addEventListener('click', mostrarHome);
}

// NOTA DE ARQUITECTURA: 
// Todo el código de validación de formularios (submit) fue removido de este archivo.
// Ahora, el archivo 'auth.js' escucha los eventos "submit" de los formularios 
// para enviar los datos reales a la base de datos de Firebase.