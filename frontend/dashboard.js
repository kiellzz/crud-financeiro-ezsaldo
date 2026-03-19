function showLoader() {
  const loader = document.getElementById("globalLoader");
  if (loader) loader.classList.remove("hidden");
}

function hideLoader() {
  const loader = document.getElementById("globalLoader");
  if (loader) loader.classList.add("hidden");
}

const API_URL = "http://localhost:5000/api/transactions";

const token = localStorage.getItem("token");

// 🔒 proteção
if (!token) {
  window.location.href = "login.html";
}

// elementos
const form = document.getElementById("transactionForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const list = document.getElementById("transactionsList");
const balanceDisplay = document.getElementById("balance");
const charCount = document.getElementById("charCount");
const logoutBtn = document.getElementById("logoutBtn");
const nameDisplay = document.querySelector(".name");

// Exibir nome do usuário
const userName = localStorage.getItem("userName");
if (nameDisplay && userName) {
  nameDisplay.textContent = userName;
}

// estado de edição
let editingId = null;

/* ============================= */
/* FORMAT */
/* ============================= */

const formatCurrency = (value) => {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
};

/* ============================= */
/* LOAD */
/* ============================= */

async function loadTransactions() {
  showLoader();

  try {
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      alert("Erro ao carregar");
      return;
    }

    balanceDisplay.innerText = formatCurrency(data.balance);
    
    // Aplicar cor ao saldo conforme o valor
    if (data.balance === 0) {
      balanceDisplay.classList.remove('positive', 'negative');
      balanceDisplay.classList.add('neutral');
    } else if (data.balance > 0) {
      balanceDisplay.classList.remove('neutral', 'negative');
      balanceDisplay.classList.add('positive');
    } else {
      balanceDisplay.classList.remove('neutral', 'positive');
      balanceDisplay.classList.add('negative');
    }

    list.innerHTML = "";

    data.transactions.forEach(t => {
      const li = document.createElement("li");
      li.classList.add("transaction-item");

      li.innerHTML = `
        <div class="transaction-info">
          <span>${t.description || "Sem descrição"}</span>
          <strong class="${t.type === "expense" ? "expense" : "income"}">
            ${formatCurrency(t.amount)}
          </strong>
        </div>

        <div>
          <button class="edit-btn" onclick="editTransaction('${t._id}', '${t.description}', ${t.amount}, '${t.type}')">✏️</button>
          <button class="delete-btn" onclick="deleteTransaction('${t._id}')">🗑️</button>
        </div>
      `;

      list.appendChild(li);
    });

  } catch (error) {
    console.error(error);
  } finally {
    hideLoader();
  }
}

/* ============================= */
/* CREATE + UPDATE */
/* ============================= */

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const button = form.querySelector("button");

  const description = descriptionInput.value.trim();
  const amountValue = parseFloat(amountInput.value);

  if (isNaN(amountValue)) {
    alert("Valor inválido");
    return;
  }

  const type = amountValue < 0 ? "expense" : "income";
  const amount = Math.abs(amountValue);

  const url = editingId
    ? `${API_URL}/${editingId}`
    : API_URL;

  const method = editingId ? "PUT" : "POST";

  // 🔥 LOADING UI
  showLoader();
  button.innerText = editingId ? "Salvando..." : "Adicionando...";
  button.disabled = true;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ type, amount, description })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    // reset estado
    form.reset();
    editingId = null;
    charCount.textContent = "0/40";

    // botão volta ao normal
    button.innerText = "Adicionar";

    // 🔥 atualiza lista
    await loadTransactions();

  } catch (error) {
    console.error(error);
    alert("Erro na operação");
  } finally {
    // 🔥 SEMPRE EXECUTA
    hideLoader();
    button.disabled = false;
    button.innerText = "Adicionar";
  }
});

/* ============================= */
/* DELETE */
/* ============================= */

window.deleteTransaction = function (id) {
  transactionToDelete = id;
  deleteModal.classList.remove("hidden");
};

let transactionToDelete = null;

const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");

/* ============================= */
/* EDIT */
/* ============================= */

function editTransaction(id, description, amount, type) {
  editingId = id;

  descriptionInput.value = description || "";

  const value = type === "expense" ? -amount : amount;
  amountInput.value = value;

  form.querySelector("button").innerText = "Atualizar";
}

/* ============================= */
/* CHAR COUNT */
/* ============================= */

if (descriptionInput && charCount) {
  descriptionInput.addEventListener("input", () => {
    if (descriptionInput.value.length > 40) {
      descriptionInput.value = descriptionInput.value.slice(0, 40);
    }

    charCount.textContent = `${descriptionInput.value.length}/40`;
  });
}

/* ============================= */
/* LOGOUT */
/* ============================= */

const modal = document.getElementById("logoutModal");
const confirmBtn = document.getElementById("confirmLogout");
const cancelBtn = document.getElementById("cancelLogout");

// abrir modal
logoutBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

// cancelar
cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// confirmar logout
confirmBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  window.location.href = "login.html";
});

/* ============================= */
/* INIT */
/* ============================= */

loadTransactions();






// cancelar
cancelDeleteBtn.addEventListener("click", () => {
  deleteModal.classList.add("hidden");
  transactionToDelete = null;
});

// confirmar delete
confirmDeleteBtn.addEventListener("click", async () => {
  if (!transactionToDelete) return;

  showLoader();

  try {
    const response = await fetch(`${API_URL}/${transactionToDelete}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    await loadTransactions();

  } catch (error) {
    console.error(error);
    alert("Erro ao deletar");
  } finally {
    hideLoader();
    deleteModal.classList.add("hidden");
    transactionToDelete = null;
  }
});