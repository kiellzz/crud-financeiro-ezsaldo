document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("transactionForm");
  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const transactionList = document.getElementById("transactionList");
  const balanceDisplay = document.getElementById("balance");
  const charCount = document.getElementById("charCount");

  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  /* ============================= */
  /* UTIL */
  /* ============================= */

  const saveToStorage = () => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  };

  const formatCurrency = (value) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  const generateId = () => {
    return crypto.randomUUID();
  };

  /* ============================= */
  /* SALDO */
  /* ============================= */

  const updateBalance = () => {
    const total = transactions.reduce((acc, t) => acc + t.amount, 0);
    balanceDisplay.textContent = formatCurrency(total);
  };

  /* ============================= */
  /* DELETE */
  /* ============================= */

  const deleteTransaction = (id) => {
    transactions = transactions.filter(t => t.id !== id);
    saveToStorage();
    renderTransactions();
  };

  transactionList.addEventListener("click", (e) => {
    const deleteButton = e.target.closest(".delete-btn");

    if (!deleteButton) return;

    const id = deleteButton.dataset.id;
    deleteTransaction(id);
  });

  /* ============================= */
  /* RENDER */
  /* ============================= */

  const renderTransactions = () => {
    transactionList.innerHTML = "";

    transactions.forEach(transaction => {
      const li = document.createElement("li");
      li.classList.add("transaction-item");

      li.innerHTML = `
        <div class="transaction-info">
          <span>${transaction.description || "Sem descrição"}</span>
          <strong class="${transaction.amount < 0 ? "expense" : "income"}">
            ${formatCurrency(transaction.amount)}
          </strong>
        </div>

        <button class="delete-btn" data-id="${transaction.id}">
          ✕
        </button>
      `;

      transactionList.appendChild(li);
    });

    updateBalance();
  };

  /* ============================= */
  /* CONTADOR DE CARACTERES */
  /* ============================= */

  if (descriptionInput && charCount) {
    const updateCounter = () => {
      if (descriptionInput.value.length > 40) {
        descriptionInput.value = descriptionInput.value.slice(0, 40);
      }

      charCount.textContent = `${descriptionInput.value.length}/40`;
    };

    descriptionInput.addEventListener("input", updateCounter);
    updateCounter();
  }

  /* ============================= */
  /* FORM SUBMIT */
  /* ============================= */

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const description = descriptionInput.value.trim();
    const amountValue = parseFloat(amountInput.value);

    if (isNaN(amountValue)) {
      alert("Valor inválido.");
      return;
    }

    const transaction = {
      id: generateId(),
      description,
      amount: parseFloat(amountValue.toFixed(2)),
      createdAt: new Date().toISOString()
    };

    transactions.push(transaction);

    saveToStorage();
    renderTransactions();

    form.reset();
    if (charCount) charCount.textContent = "0/40";
  });

  /* ============================= */
  /* INIT */
  /* ============================= */

  renderTransactions();

});
