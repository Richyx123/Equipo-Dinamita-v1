const btnRegistrarte = document.getElementById('btn-registrarte');
const btnRegresar = document.getElementById('btn-regresar');
const homeSection = document.getElementById('home-section');
const registerSection = document.getElementById('register-section');

// Mostrar formulario
btnRegistrarte.addEventListener('click', () => {
    homeSection.classList.add('hidden');
    registerSection.classList.remove('hidden');
});

// Volver al inicio
btnRegresar.addEventListener('click', () => {
    registerSection.classList.add('hidden');
    homeSection.classList.remove('hidden');
});