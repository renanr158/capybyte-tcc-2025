// js/auth.js

// --- CONFIGURAÇÃO DO FIREBASE ---
// SUBSTITUA COMPLETAMENTE ESTE OBJETO COM O SEU REAL DO CONSOLE DO FIREBASE!
  const firebaseConfig = {
    apiKey: "AIzaSyDLZqSSL9ovJkEQLSHye2m42Zm1qq1vGUw",
    authDomain: "capybyte-41433.firebaseapp.com",
    projectId: "capybyte-41433",
    storageBucket: "capybyte-41433.firebasestorage.app",
    messagingSenderId: "1047945311319",
    appId: "1:1047945311319:web:d45ca4fbe6d504aed05f12",
    measurementId: "G-JTJ81YWED9"
  };

// Inicialize o Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// --- FUNÇÃO UTILITÁRIA: EXIBIR MENSAGENS NA TELA ---
// Esta função procura por um elemento com id="message" na página atual
// para exibir erros ou sucessos.
window.showMessage = function(msg, isError = true) {
    const messageDisplay = document.getElementById('message');
    if (messageDisplay) {
        messageDisplay.textContent = msg;
        messageDisplay.style.color = isError ? 'red' : 'green';
    } else {
        console.warn("Elemento 'message' não encontrado na página para exibir:", msg);
    }
};

// --- FUNÇÕES DE AUTENTICAÇÃO CHAMADAS PELAS PÁGINAS HTML ---

// Função para registrar um novo usuário
window.signupUser = async function(email, password) {
    window.showMessage(''); // Limpa mensagens anteriores
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        window.showMessage('Usuário registrado com sucesso!', false);
        // O redirecionamento para a página segura será feito pelo onAuthStateChanged
    } catch (error) {
        window.showMessage(`Erro ao registrar: ${error.message}`);
    }
};

// Função para fazer login de um usuário existente
window.loginUser = async function(email, password) {
    window.showMessage(''); // Limpa mensagens anteriores
    try {
        await auth.signInWithEmailAndPassword(email, password);
        window.showMessage('Login efetuado com sucesso!', false);
        // O redirecionamento para a página segura será feito pelo onAuthStateChanged
    } catch (error) {
        window.showMessage(`ERRO AO FAZER LOGIN! VERIFIQUE SENHA E EMAIL!: ${error.message}`);
    }
};

// Função para fazer logout
window.logoutUser = async function() {
    window.showMessage(''); // Limpa mensagens anteriores
    try {
        await auth.signOut();
        window.showMessage('Você saiu da sua conta.', false);
        // O redirecionamento para a página de login será feito pelo onAuthStateChanged
    } catch (error) {
        window.showMessage(`Erro ao sair: ${error.message}`);
    }
};

// --- OUVINTE DE ESTADO DE AUTENTICAÇÃO (onAuthStateChanged) ---
// Este é o coração do sistema. Ele é chamado sempre que o estado de autenticação muda
// (usuário logou, deslogou, ou a página foi carregada e o status é verificado).
auth.onAuthStateChanged((user) => {
    const currentPath = window.location.pathname;

    if (user) {
        // Usuário está logado
        // Se o usuário está em uma página pública (login, cadastro) e logou, redireciona para a segura.
        if (currentPath.includes('login.html') || currentPath.includes('cadastro.html') || currentPath === '/' || currentPath.endsWith('index.html')) {
            window.location.href = 'cursos.html';
        }
        // Se o usuário já está na página segura, atualiza o e-mail exibido
        else if (currentPath.includes('cursos.html')) {
            const userEmailDisplay = document.getElementById('userEmailDisplay');
            if (userEmailDisplay) {
                userEmailDisplay.textContent = user.email;
            }
        }
    } else {
        // Usuário está deslogado
        // Se o usuário está na página segura e deslogou, ou acessou ela deslogado, redireciona para o login.
        if (currentPath.includes('cursos.html')) {
            window.location.href = 'login.html';
        }
        // Em outras páginas (login, cadastro), não faz nada, pois é o estado esperado.
    }
});
