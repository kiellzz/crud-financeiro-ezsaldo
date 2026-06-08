(function (window, document) {
  const config = window.EZSaldoConfig;
  const dateUtils = window.EZSaldoDateUtils;
  const formatters = window.EZSaldoFormatters;
  const chartData = window.EZSaldoChartData;
  const balanceChart = window.EZSaldoBalanceChart;

  const {
    DEFAULT_AVATAR_SRC,
    DEFAULT_CHART_RANGE,
    MAX_DESCRIPTION_LENGTH,
    MIN_TRANSACTION_DATE,
    USER_PROFILE_IMAGE_STORAGE_KEY
  } = config;

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const api = window.EZSaldoDashboardApi.create(token);
  const elements = window.EZSaldoDashboardDom.getElements();

  const state = {
    editingId: null,
    transactionToDelete: null,
    showAllTransactions: false,
    allTransactions: [],
    chartRange: DEFAULT_CHART_RANGE,
    accountCreatedAt: null,
    toastTimeoutId: null
  };

  function showLoader() {
    elements.globalLoader?.classList.remove("hidden");
  }

  function hideLoader() {
    elements.globalLoader?.classList.add("hidden");
  }

  function updateWelcomeMessage(name = "") {
    const firstName = formatters.getFirstName(name);

    if (elements.introDisplay) {
      elements.introDisplay.textContent = firstName
        ? "Seja bem-vindo(a),"
        : "Seja bem-vindo(a)!";
    }

    if (elements.nameDisplay) {
      elements.nameDisplay.textContent = firstName ? `${firstName}!` : "";
    }

    if (elements.avatarDisplay) {
      elements.avatarDisplay.alt = firstName
        ? `Foto de perfil de ${firstName}`
        : "Foto de perfil";
    }
  }

  function updateProfileAvatar(profileImage = "") {
    if (!elements.avatarDisplay) return;

    const nextAvatar = profileImage || DEFAULT_AVATAR_SRC;

    elements.avatarDisplay.dataset.isFallback = String(
      nextAvatar === DEFAULT_AVATAR_SRC
    );
    elements.avatarDisplay.src = nextAvatar;
  }

  function persistCurrentUser(name = "", profileImage = "") {
    const formattedName = formatters.capitalizeFullName(name);

    if (formattedName) {
      localStorage.setItem("userName", formattedName);
    }

    if (profileImage) {
      localStorage.setItem(USER_PROFILE_IMAGE_STORAGE_KEY, profileImage);
    } else {
      localStorage.removeItem(USER_PROFILE_IMAGE_STORAGE_KEY);
    }

    updateWelcomeMessage(formattedName);
    updateProfileAvatar(profileImage || "");
  }

  function loadCachedUserProfile() {
    updateWelcomeMessage(localStorage.getItem("userName") || "");
    updateProfileAvatar(
      localStorage.getItem(USER_PROFILE_IMAGE_STORAGE_KEY) || ""
    );
  }

  function setupAvatarFallback() {
    if (!elements.avatarDisplay) return;

    elements.avatarDisplay.addEventListener("error", () => {
      if (elements.avatarDisplay.dataset.isFallback === "true") {
        return;
      }

      elements.avatarDisplay.dataset.isFallback = "true";
      elements.avatarDisplay.src = DEFAULT_AVATAR_SRC;
    });
  }

  function clearFormFeedback() {
    if (!elements.formFeedback) return;

    elements.formFeedback.textContent = "";
    elements.formFeedback.classList.add("hidden");
    elements.formFeedback.classList.remove("error", "success", "info");
  }

  function showFormFeedback(message, type = "error") {
    if (!elements.formFeedback) return;

    elements.formFeedback.textContent = message;
    elements.formFeedback.classList.remove("hidden", "error", "success", "info");
    elements.formFeedback.classList.add(type);
  }

  function hideToast() {
    if (!elements.appToast) return;

    elements.appToast.classList.remove("visible", "error", "success", "info");

    if (state.toastTimeoutId) {
      clearTimeout(state.toastTimeoutId);
      state.toastTimeoutId = null;
    }

    window.setTimeout(() => {
      if (!elements.appToast.classList.contains("visible")) {
        elements.appToast.classList.add("hidden");
        elements.appToast.textContent = "";
      }
    }, 250);
  }

  function showToast(message, type = "error", duration = 3600) {
    if (!elements.appToast) return;

    if (state.toastTimeoutId) {
      clearTimeout(state.toastTimeoutId);
    }

    elements.appToast.textContent = message;
    elements.appToast.classList.remove("hidden", "error", "success", "info");
    elements.appToast.classList.add(type);

    window.requestAnimationFrame(() => {
      elements.appToast.classList.add("visible");
    });

    state.toastTimeoutId = window.setTimeout(hideToast, duration);
  }

  function getSubmitButton() {
    return elements.form?.querySelector('button[type="submit"]') || null;
  }

  function setSubmitButtonState({ text, disabled }) {
    const button = getSubmitButton();
    if (!button) return;

    button.innerText = text;
    button.disabled = disabled;
  }

  function setTransactionDateValue(dateKey) {
    if (!elements.dateInput) return;

    let nextDateKey = dateKey || dateUtils.getDefaultTransactionDateKey();

    if (nextDateKey < MIN_TRANSACTION_DATE) {
      nextDateKey = MIN_TRANSACTION_DATE;
    }

    elements.dateInput.value = nextDateKey;
  }

  function getSelectedTransactionDateKey() {
    const selectedDate = elements.dateInput?.value;

    return selectedDate && selectedDate >= MIN_TRANSACTION_DATE
      ? selectedDate
      : dateUtils.getDefaultTransactionDateKey();
  }

  function resetFormState() {
    elements.form?.reset();
    state.editingId = null;
    clearFormFeedback();

    if (elements.charCount) {
      elements.charCount.textContent = `0/${MAX_DESCRIPTION_LENGTH}`;
    }

    if (elements.dateInput) {
      elements.dateInput.min = MIN_TRANSACTION_DATE;
      elements.dateInput.max = dateUtils.getTodayDateKey();
      setTransactionDateValue(dateUtils.getDefaultTransactionDateKey());
    }

    setSubmitButtonState({
      text: "Adicionar",
      disabled: false
    });
  }

  function getInputStepValue(input, fallback = 1) {
    const parsedStep = Number(input?.step);

    return Number.isFinite(parsedStep) && parsedStep > 0
      ? parsedStep
      : fallback;
  }

  function getStepPrecision(stepValue) {
    const [, decimalPart = ""] = String(stepValue).split(".");
    return decimalPart.length;
  }

  function adjustAmountValue(direction) {
    if (!elements.amountInput) return;

    const stepValue = getInputStepValue(elements.amountInput, 0.01);
    const precision = getStepPrecision(stepValue);
    const multiplier = 10 ** precision;
    const currentValue = Number(elements.amountInput.value);
    const safeCurrentValue = Number.isFinite(currentValue) ? currentValue : 0;
    const currentUnits = Math.round(safeCurrentValue * multiplier);
    const stepUnits = Math.round(stepValue * multiplier);
    const nextValue = (currentUnits + direction * stepUnits) / multiplier;

    elements.amountInput.value = nextValue.toFixed(precision);
  }

  function adjustTransactionDate(offsetDays) {
    const baseDateKey = getSelectedTransactionDateKey();
    let nextDateKey = dateUtils.shiftDateKey(baseDateKey, offsetDays);

    if (nextDateKey < MIN_TRANSACTION_DATE) {
      nextDateKey = MIN_TRANSACTION_DATE;
    }

    if (nextDateKey > dateUtils.getTodayDateKey()) {
      nextDateKey = dateUtils.getTodayDateKey();
    }

    setTransactionDateValue(nextDateKey);
  }

  function setBalanceStyle(balance) {
    if (!elements.balanceDisplay) return;

    elements.balanceDisplay.classList.remove("positive", "negative", "neutral");

    if (balance === 0) {
      elements.balanceDisplay.classList.add("neutral");
    } else if (balance > 0) {
      elements.balanceDisplay.classList.add("positive");
    } else {
      elements.balanceDisplay.classList.add("negative");
    }
  }

  function getTransactionLabel(description) {
    const text = String(description || "").trim();
    return text || "Sem descri\u00e7\u00e3o";
  }

  function getTransactionAmountClass(type) {
    return type === "expense" ? "negative" : "positive";
  }

  function getTransactionSignedValue(type, amount) {
    const signal = type === "expense" ? "-" : "+";
    return `${signal} ${formatters.formatCurrency(amount)}`;
  }

  function getVisibleTransactions(transactions = []) {
    return state.showAllTransactions
      ? transactions
      : transactions.slice(0, 3);
  }

  function updateToggleTransactionsButton(totalTransactions) {
    if (!elements.toggleTransactionsBtn) return;

    if (totalTransactions <= 3) {
      elements.toggleTransactionsBtn.classList.add("hidden");
      return;
    }

    elements.toggleTransactionsBtn.classList.remove("hidden");
    elements.toggleTransactionsBtn.textContent = state.showAllTransactions
      ? "(-) Mostrar menos"
      : "(+) Exibir mais";
  }

  function updateChartFilterButtons() {
    elements.chartFilterButtons?.forEach((button) => {
      const isActive = button.dataset.range === state.chartRange;
      button.classList.toggle("active", isActive);
    });
  }

  function updateChartPeriod(period = null) {
    if (!elements.chartPeriod) return;

    if (!period?.startKey || !period?.endKey) {
      elements.chartPeriod.textContent = "Per\u00edodo: sem dados";
      return;
    }

    const firstDate = dateUtils.formatDateKeyBR(period.startKey);
    const lastDate = dateUtils.formatDateKeyBR(period.endKey);

    if (!firstDate || !lastDate) {
      elements.chartPeriod.textContent = "Per\u00edodo: sem datas v\u00e1lidas";
      return;
    }

    if (firstDate === lastDate) {
      elements.chartPeriod.textContent = `Per\u00edodo: ${firstDate}`;
      return;
    }

    elements.chartPeriod.textContent = `Per\u00edodo: ${firstDate} \u2192 ${lastDate}`;
  }

  function formatPeriodResultRange(startKey, endKey) {
    const startDate = dateUtils.formatDateKeyBR(startKey);
    const endDate = endKey === dateUtils.getTodayDateKey()
      ? "Hoje"
      : dateUtils.formatDateKeyBR(endKey);

    if (!startDate || !endDate) {
      return "\u2014";
    }

    return `${startDate} \u2192 ${endDate}`;
  }

  function getPeriodResultMessage(periodResult) {
    const changeAmount = Number(periodResult?.changeAmount) || 0;

    if (changeAmount > 0) {
      return `Seu saldo aumentou em ${formatters.formatCurrency(changeAmount)}`;
    }

    if (changeAmount < 0) {
      return `Seu saldo diminuiu em ${formatters.formatCurrency(Math.abs(changeAmount))}`;
    }

    return "Seu saldo permaneceu igual";
  }

  function updatePeriodResult(periodResult = null) {
    if (!elements.periodResultCard || !elements.periodResultMessage) return;

    const tone = periodResult?.tone || "neutral";

    elements.periodResultCard.classList.remove("positive", "negative", "neutral");
    elements.periodResultCard.classList.add(tone);

    if (elements.periodResultRange) {
      elements.periodResultRange.textContent = periodResult
        ? formatPeriodResultRange(periodResult.startKey, periodResult.endKey)
        : "\u2014";
    }

    elements.periodResultMessage.textContent = getPeriodResultMessage(periodResult);
  }

  function createElement(tagName, className, textContent = "") {
    const element = document.createElement(tagName);

    if (className) {
      element.className = className;
    }

    if (textContent) {
      element.textContent = textContent;
    }

    return element;
  }

  function createTransactionItem(transaction) {
    const amountClass = getTransactionAmountClass(transaction.type);
    const typeLabel = transaction.type === "expense" ? "Sa\u00edda" : "Entrada";
    const iconSymbol = transaction.type === "expense" ? "\u2198" : "\u2197";

    const item = createElement("li", "transaction-item");
    const left = createElement("div", "transaction-left");
    const icon = createElement("div", `transaction-icon ${amountClass}`, iconSymbol);
    const content = createElement("div", "transaction-content");
    const title = createElement(
      "strong",
      "transaction-title",
      getTransactionLabel(transaction.description)
    );
    const subtitle = createElement(
      "span",
      `transaction-subtitle ${amountClass}`,
      typeLabel
    );
    const right = createElement("div", "transaction-right");
    const value = createElement(
      "strong",
      `transaction-value ${amountClass}`,
      getTransactionSignedValue(transaction.type, transaction.amount)
    );
    const actions = createElement("div", "transaction-actions");
    const editButton = createElement("button", "edit-btn", "\uD83D\uDD8A");
    const deleteButton = createElement("button", "delete-btn", "\uD83D\uDDD1");

    editButton.type = "button";
    deleteButton.type = "button";

    editButton.addEventListener("click", () => {
      editTransaction(transaction);
    });

    deleteButton.addEventListener("click", () => {
      openDeleteModal(transaction._id);
    });

    content.append(title, subtitle);
    left.append(icon, content);
    actions.append(editButton, deleteButton);
    right.append(value, actions);
    item.append(left, right);

    return item;
  }

  function renderTransactions(transactions = []) {
    if (!elements.list) return;

    elements.list.innerHTML = "";

    if (transactions.length === 0) {
      const emptyItem = createElement(
        "li",
        "empty-state",
        "Nenhuma transa\u00e7\u00e3o ainda"
      );

      elements.list.appendChild(emptyItem);
      updateToggleTransactionsButton(0);
      return;
    }

    getVisibleTransactions(transactions).forEach((transaction) => {
      elements.list.appendChild(createTransactionItem(transaction));
    });

    updateToggleTransactionsButton(transactions.length);
  }

  function renderDashboardData() {
    renderTransactions(state.allTransactions);

    const series = chartData.buildChartSeries(
      state.allTransactions,
      state.chartRange,
      {
        accountCreatedAt: state.accountCreatedAt
      }
    );

    balanceChart.render(series);
    updateChartPeriod(series.period);
    updatePeriodResult(series.periodResult);
    updateChartFilterButtons();
  }

  async function loadCurrentUserProfile() {
    try {
      const profile = await api.getCurrentUserProfile();

      if (profile) {
        state.accountCreatedAt = profile.createdAt || null;
        persistCurrentUser(profile.name || "", profile.profileImage || "");

        if (state.chartRange === "account") {
          renderDashboardData();
        }
      }
    } catch (error) {
      console.error("Erro ao carregar perfil do usuario:", error);
    }
  }

  async function loadTransactions() {
    showLoader();

    try {
      const data = await api.getTransactions();

      state.allTransactions = data.transactions;

      if (elements.balanceDisplay) {
        elements.balanceDisplay.innerText = formatters.formatCurrency(data.balance);
      }

      setBalanceStyle(data.balance);
      renderDashboardData();
    } catch (error) {
      console.error("Erro ao carregar transacoes:", error);
      showToast(error.message || "Erro ao carregar transa\u00e7\u00f5es");
    } finally {
      hideLoader();
    }
  }

  async function handleTransactionSubmit(event) {
    event.preventDefault();
    clearFormFeedback();

    const description = elements.descriptionInput?.value.trim() || "";
    const amountValue = parseFloat(elements.amountInput?.value);
    const selectedDate = getSelectedTransactionDateKey();

    if (!Number.isFinite(amountValue) || amountValue === 0) {
      showFormFeedback("O valor da transa\u00e7\u00e3o deve ser diferente de 0.");
      return;
    }

    if (selectedDate && selectedDate < MIN_TRANSACTION_DATE) {
      showFormFeedback(
        "A data da transa\u00e7\u00e3o n\u00e3o pode ser anterior a 01/01/2026."
      );
      setTransactionDateValue(dateUtils.getDefaultTransactionDateKey());
      return;
    }

    const editingId = state.editingId;
    const wasEditing = Boolean(editingId);
    const transaction = {
      type: amountValue < 0 ? "expense" : "income",
      amount: Math.abs(amountValue),
      description,
      date: selectedDate || null
    };

    showLoader();
    setSubmitButtonState({
      text: wasEditing ? "Salvando..." : "Adicionando...",
      disabled: true
    });

    try {
      await api.saveTransaction(transaction, editingId);
      resetFormState();
      showToast(
        wasEditing
          ? "Transa\u00e7\u00e3o atualizada com sucesso."
          : "Transa\u00e7\u00e3o adicionada com sucesso.",
        "success"
      );
      await loadTransactions();
    } catch (error) {
      console.error("Erro ao salvar transacao:", error);
      showFormFeedback(error.message || "Erro na opera\u00e7\u00e3o");
    } finally {
      hideLoader();
      setSubmitButtonState({
        text: state.editingId ? "Atualizar" : "Adicionar",
        disabled: false
      });
    }
  }

  function editTransaction(transaction) {
    state.editingId = transaction._id;
    clearFormFeedback();

    if (elements.descriptionInput) {
      elements.descriptionInput.value = transaction.description || "";
    }

    if (elements.amountInput) {
      elements.amountInput.value =
        transaction.type === "expense"
          ? -Number(transaction.amount)
          : Number(transaction.amount);
    }

    if (elements.dateInput && transaction.date) {
      const dateKey = dateUtils.getTransactionDateKey(transaction.date);

      if (dateKey) {
        setTransactionDateValue(dateKey);
      }
    }

    if (elements.charCount && elements.descriptionInput) {
      elements.charCount.textContent =
        `${elements.descriptionInput.value.length}/${MAX_DESCRIPTION_LENGTH}`;
    }

    setSubmitButtonState({
      text: "Atualizar",
      disabled: false
    });
  }

  function openDeleteModal(id) {
    state.transactionToDelete = id;
    elements.deleteModal?.classList.remove("hidden");
  }

  function closeDeleteModal() {
    state.transactionToDelete = null;
    elements.deleteModal?.classList.add("hidden");
  }

  async function confirmDeleteTransaction() {
    if (!state.transactionToDelete) return;

    showLoader();

    try {
      await api.deleteTransaction(state.transactionToDelete);
      showToast("Transa\u00e7\u00e3o removida com sucesso.", "success");
      await loadTransactions();
    } catch (error) {
      console.error("Erro ao deletar transacao:", error);
      showToast(error.message || "Erro ao deletar");
    } finally {
      hideLoader();
      closeDeleteModal();
    }
  }

  function setupCharCount() {
    if (!elements.descriptionInput || !elements.charCount) return;

    elements.descriptionInput.addEventListener("input", () => {
      if (elements.descriptionInput.value.length > MAX_DESCRIPTION_LENGTH) {
        elements.descriptionInput.value = elements.descriptionInput.value.slice(
          0,
          MAX_DESCRIPTION_LENGTH
        );
      }

      elements.charCount.textContent =
        `${elements.descriptionInput.value.length}/${MAX_DESCRIPTION_LENGTH}`;
    });
  }

  function openLogoutModal() {
    elements.logoutModal?.classList.remove("hidden");
  }

  function closeLogoutModal() {
    elements.logoutModal?.classList.add("hidden");
  }

  function confirmLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem(USER_PROFILE_IMAGE_STORAGE_KEY);
    window.location.href = "login.html";
  }

  function setupEvents() {
    elements.form?.addEventListener("submit", handleTransactionSubmit);
    elements.logoutBtn?.addEventListener("click", openLogoutModal);
    elements.cancelLogoutBtn?.addEventListener("click", closeLogoutModal);
    elements.confirmLogoutBtn?.addEventListener("click", confirmLogout);
    elements.cancelDeleteBtn?.addEventListener("click", closeDeleteModal);
    elements.confirmDeleteBtn?.addEventListener("click", confirmDeleteTransaction);
    elements.amountInput?.addEventListener("input", clearFormFeedback);
    elements.descriptionInput?.addEventListener("input", clearFormFeedback);
    elements.dateInput?.addEventListener("input", clearFormFeedback);

    elements.editProfileBtn?.addEventListener("click", () => {
      window.location.href = "editUser.html";
    });

    elements.dateStepUpBtn?.addEventListener("click", () => {
      adjustTransactionDate(1);
    });

    elements.dateStepDownBtn?.addEventListener("click", () => {
      adjustTransactionDate(-1);
    });

    elements.amountStepUpBtn?.addEventListener("click", () => {
      clearFormFeedback();
      adjustAmountValue(1);
    });

    elements.amountStepDownBtn?.addEventListener("click", () => {
      clearFormFeedback();
      adjustAmountValue(-1);
    });

    elements.toggleTransactionsBtn?.addEventListener("click", () => {
      state.showAllTransactions = !state.showAllTransactions;
      renderTransactions(state.allTransactions);
    });

    elements.chartFilterButtons?.forEach((button) => {
      button.addEventListener("click", () => {
        state.chartRange = button.dataset.range;
        renderDashboardData();
      });
    });

    setupCharCount();
  }

  function setupInitialDateLimits() {
    if (!elements.dateInput) return;

    elements.dateInput.min = MIN_TRANSACTION_DATE;
    elements.dateInput.max = dateUtils.getTodayDateKey();
    setTransactionDateValue(dateUtils.getDefaultTransactionDateKey());
  }

  function init() {
    setupAvatarFallback();
    loadCachedUserProfile();
    setupInitialDateLimits();
    setupEvents();
    loadCurrentUserProfile();
    loadTransactions();
  }

  init();
})(window, document);
