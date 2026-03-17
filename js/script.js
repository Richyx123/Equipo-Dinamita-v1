const btnRegistrarte = document.getElementById('btn-registrarte');
const btnLogin = document.getElementById('btn-login');
const btnCtaRegistrarte = document.getElementById('btn-cta-registrarte');
const btnCtaLogin = document.getElementById('btn-cta-login');
const btnRegresar = document.getElementById('btn-regresar');
const btnLoginRegresar = document.getElementById('btn-login-regresar');

const homeSection = document.getElementById('home-section');
const registerSection = document.getElementById('register-section');
const loginSection = document.getElementById('login-section');

const registroForm = document.getElementById('registro-form');
const inputCorreo = document.getElementById('correo');
const inputPassword = document.getElementById('password');
const inputPasswordConfirm = document.getElementById('password-confirm');
const passwordConfirmFeedback = document.getElementById('password-confirm-feedback');

const loginForm = document.getElementById('login-form');
const loginCorreo = document.getElementById('login-correo');
const loginPassword = document.getElementById('login-password');

function mostrarSeccion(seccion) {
    if (homeSection) homeSection.classList.add('hidden');
    if (registerSection) registerSection.classList.add('hidden');
    if (loginSection) loginSection.classList.add('hidden');

    seccion.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarHome() {
    if (!homeSection) return;
    if (homeSection) homeSection.classList.remove('hidden');
    if (registerSection) registerSection.classList.add('hidden');
    if (loginSection) loginSection.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Navegación: registro
if (btnRegistrarte) {
    btnRegistrarte.addEventListener('click', () => mostrarSeccion(registerSection));
}
if (btnCtaRegistrarte) {
    btnCtaRegistrarte.addEventListener('click', () => mostrarSeccion(registerSection));
}

// Navegación: login
if (btnLogin) {
    btnLogin.addEventListener('click', () => mostrarSeccion(loginSection));
}
if (btnCtaLogin) {
    btnCtaLogin.addEventListener('click', () => mostrarSeccion(loginSection));
}

// Volver al inicio desde formularios
if (btnRegresar) {
    btnRegresar.addEventListener('click', mostrarHome);
}
if (btnLoginRegresar) {
    btnLoginRegresar.addEventListener('click', mostrarHome);
}

// Validación simple del formulario
if (registroForm) {
    registroForm.addEventListener('submit', (event) => {
        let formEsValido = true;

        // Validación nativa de Bootstrap/HTML5
        if (!registroForm.checkValidity()) {
            formEsValido = false;
        }

        // Validar coincidencia de contraseñas
        if (inputPassword.value !== inputPasswordConfirm.value) {
            formEsValido = false;
            inputPasswordConfirm.classList.add('is-invalid');
            if (passwordConfirmFeedback) {
                passwordConfirmFeedback.textContent = 'Las contraseñas deben coincidir.';
            }
        } else {
            inputPasswordConfirm.classList.remove('is-invalid');
        }

        if (!formEsValido) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
            alert('Registro simulado con éxito. Aquí iría el envío al servidor.');
            registroForm.reset();
            registroForm.classList.remove('was-validated');
            volverInicio();
        }

        registroForm.classList.add('was-validated');
    });
}

// Validación simple del formulario de login
if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        let formEsValido = true;

        if (!loginForm.checkValidity()) {
            formEsValido = false;
        }

        if (!formEsValido) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
            alert('Inicio de sesión simulado. Aquí iría la validación real.');
            loginForm.reset();
            loginForm.classList.remove('was-validated');
            mostrarHome();
        }

        loginForm.classList.add('was-validated');
    });
}