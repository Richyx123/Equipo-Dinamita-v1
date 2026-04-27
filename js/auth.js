// js/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// IMPORTAMOS LA CONFIGURACIÓN CENTRAL
import { firebaseConfig } from './firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ... (el resto de tu lógica de login y registro se queda igual)

// --- LÓGICA DE REGISTRO ---
const registroForm = document.getElementById('registro-form');
if (registroForm) {
    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const correo = document.getElementById('correo').value;
        const pass = document.getElementById('password').value;
        const passConfirm = document.getElementById('password-confirm').value;

        if (pass !== passConfirm) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, correo, pass);
            const user = userCredential.user;

            await setDoc(doc(db, "usuarios", user.uid), {
                correo: user.email,
                fecha_registro: new Date(),
                rol: "estudiante"
            });

            alert("¡Cuenta creada con éxito!");
            window.location.href = 'panel.html'; // Redirección corregida
        } catch (error) {
            console.error("Error de Firebase:", error.code);
            alert("Error: " + error.message);
        }
    });
}

// --- LISTA DE ADMINISTRADORES ---
const ADMIN_EMAILS = ['richi@gmail.com']; // Aquí tu correo

// --- MANEJO DE INICIO DE SESIÓN: ESTUDIANTE ---
const formLoginUser = document.getElementById('form-login-user');
if (formLoginUser) {
    formLoginUser.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const correo = document.getElementById('login-correo').value;
        const pass = document.getElementById('login-password').value;

        try {
            await signInWithEmailAndPassword(auth, correo, pass);
            window.location.href = 'panel.html';
        } catch (error) {
            alert("Credenciales incorrectas o usuario no encontrado.");
        }
    });
}

// --- MANEJO DE INICIO DE SESIÓN: ADMINISTRADOR ---
const formLoginAdmin = document.getElementById('form-login-admin');
if (formLoginAdmin) {
    formLoginAdmin.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const correo = document.getElementById('admin-correo').value;
        const pass = document.getElementById('admin-password').value;

        try {
            // 1. Intentamos iniciar sesión en Firebase
            const userCredential = await signInWithEmailAndPassword(auth, correo, pass);
            const user = userCredential.user;

            // 2. Validamos si el correo está en la lista de administradores
            if (ADMIN_EMAILS.includes(user.email)) {
                window.location.href = 'panel.html';
            } else {
                // Si la contraseña es correcta pero NO es admin, le cerramos la sesión y bloqueamos el paso
                await signOut(auth);
                alert("Acceso denegado: Tu cuenta no tiene permisos de administrador.");
            }
        } catch (error) {
            alert("Credenciales de administrador incorrectas.");
        }
    });
}