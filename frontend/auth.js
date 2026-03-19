// ==============================
// CONFIG
// ==============================

const API_URL = "http://localhost:5000/api/auth";

// ==============================
// LOADER (seguro)
// ==============================

function showLoader() {
  const loader = document.getElementById("globalLoader");
  if (loader) loader.classList.remove("hidden");
}

function hideLoader() {
  const loader = document.getElementById("globalLoader");
  if (loader) loader.classList.add("hidden");
}

// ==============================
// LOGIN
// ==============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const errorText = document.getElementById("loginError");
    if (errorText) errorText.textContent = "";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    showLoader();

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        hideLoader();

        if (errorText) {
          if (data.message === "Usuário não encontrado") {
            errorText.textContent = "Usuário não encontrado";
          } else if (data.message === "Senha inválida") {
            errorText.textContent = "Senha incorreta";
          } else {
            errorText.textContent = data.message || "Erro ao fazer login";
          }
        }

        return;
      }

      // sucesso
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name);

      // pequena transição
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 400);

    } catch (error) {
      hideLoader();
      if (errorText) {
        errorText.textContent = "Erro de conexão com servidor";
      }
    }
  });
}

// ==============================
// REGISTER
// ==============================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    showLoader();

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        hideLoader();
        alert(data.message || "Erro ao cadastrar");
        return;
      }

      // sucesso
      alert("Conta criada com sucesso!");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 400);

    } catch (error) {
      hideLoader();
      alert("Erro ao conectar com servidor");
    }
  });
}
