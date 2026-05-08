function showLoader() {
  const loader = document.getElementById("globalLoader");
  if (loader) loader.classList.remove("hidden");
}

function hideLoader() {
  const loader = document.getElementById("globalLoader");
  if (loader) loader.classList.add("hidden");
}

const API_URL = "https://ezsaldo-backend.onrender.com/api/transactions";
const AUTH_API_URL = "https://ezsaldo-backend.onrender.com/api/auth";
const MIN_TRANSACTION_DATE = "2026-01-01";
const DEFAULT_AVATAR_SRC = "assets/avatar-default.png";
const USER_PROFILE_IMAGE_STORAGE_KEY = "userProfileImage";
const NAME_LOCALE = "pt-BR";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const elements = {
  form: document.getElementById("transactionForm"),
  descriptionInput: document.getElementById("description"),
  amountInput: document.getElementById("amount"),
  amountStepUpBtn: document.getElementById("amountStepUpBtn"),
  amountStepDownBtn: document.getElementById("amountStepDownBtn"),
  dateInput: document.getElementById("transactionDate"),
  dateStepUpBtn: document.getElementById("dateStepUpBtn"),
  dateStepDownBtn: document.getElementById("dateStepDownBtn"),
  formFeedback: document.getElementById("formFeedback"),
  appToast: document.getElementById("appToast"),
  list: document.getElementById("transactionsList"),
  balanceDisplay: document.getElementById("balance"),
  charCount: document.getElementById("charCount"),
  logoutBtn: document.getElementById("logoutBtn"),
  editProfileBtn: document.getElementById("editProfileBtn"),
  introDisplay: document.querySelector(".intro"),
  nameDisplay: document.querySelector(".name"),
  avatarDisplay: document.getElementById("dashboardAvatar"),
  logoutModal: document.getElementById("logoutModal"),
  confirmLogoutBtn: document.getElementById("confirmLogout"),
  cancelLogoutBtn: document.getElementById("cancelLogout"),
  deleteModal: document.getElementById("deleteModal"),
  confirmDeleteBtn: document.getElementById("confirmDelete"),
  cancelDeleteBtn: document.getElementById("cancelDelete"),
  toggleTransactionsBtn: document.getElementById("toggleTransactionsBtn"),
  chartFilterButtons: document.querySelectorAll(".chart-filter-btn"),
  chartPeriod: document.getElementById("chartPeriod")
};

const state = {
  editingId: null,
  transactionToDelete: null,
  showAllTransactions: false,
  allTransactions: [],
  chartRange: "7",
  toastTimeoutId: null
};

const storedUserName = localStorage.getItem("userName") || "";
const storedUserProfileImage = localStorage.getItem(USER_PROFILE_IMAGE_STORAGE_KEY) || "";

if (elements.avatarDisplay) {
  elements.avatarDisplay.addEventListener("error", () => {
    if (elements.avatarDisplay.dataset.isFallback === "true") {
      return;
    }

    elements.avatarDisplay.dataset.isFallback = "true";
    elements.avatarDisplay.src = DEFAULT_AVATAR_SRC;
  });
}

/* ============================= */
/* HELPERS */
/* ============================= */

function getFirstName(name = "") {
  const normalizedName = typeof name === "string"
    ? name.trim().replace(/\s+/g, " ")
    : "";

  if (!normalizedName) {
    return "";
  }

  const capitalizedName = normalizedName
    .toLocaleLowerCase(NAME_LOCALE)
    .replace(/(^|\s)\S/g, (match) => match.toLocaleUpperCase(NAME_LOCALE));

  return capitalizedName.split(/\s+/)[0] || "";
}

function capitalizeFullName(name = "") {
  const normalizedName = typeof name === "string"
    ? name.trim().replace(/\s+/g, " ")
    : "";

  if (!normalizedName) {
    return "";
  }

  return normalizedName
    .toLocaleLowerCase(NAME_LOCALE)
    .replace(/(^|\s)\S/g, (match) => match.toLocaleUpperCase(NAME_LOCALE));
}

function updateWelcomeMessage(name = "") {
  const firstName = getFirstName(name);

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
  const formattedName = capitalizeFullName(name);

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

updateWelcomeMessage(storedUserName);
updateProfileAvatar(storedUserProfileImage);

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
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

  state.toastTimeoutId = window.setTimeout(() => {
    hideToast();
  }, duration);
}

function padDatePart(value) {
  return String(value).padStart(2, "0");
}

function createDateKey(year, month, day) {
  return `${year}-${padDatePart(month)}-${padDatePart(day)}`;
}

function getLocalDateKey(date) {
  return createDateKey(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
}

function getUtcDateKey(date) {
  return createDateKey(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate()
  );
}

function isMidnightUtcDate(date) {
  return (
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0
  );
}

// Date-only transactions were shifting by timezone; grouping by calendar day fixes the filters.
function getTransactionDateKey(dateValue) {
  if (!dateValue) {
    return null;
  }

  if (typeof dateValue === "string") {
    const trimmedValue = dateValue.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
      return trimmedValue;
    }
  }

  const parsedDate = new Date(dateValue);

  if (isNaN(parsedDate.getTime())) {
    return null;
  }

  return isMidnightUtcDate(parsedDate)
    ? getUtcDateKey(parsedDate)
    : getLocalDateKey(parsedDate);
}

function formatDateKeyBR(dateKey) {
  if (!dateKey) {
    return null;
  }

  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day, 12));

  return date.toLocaleDateString("pt-BR", {
    timeZone: "UTC"
  });
}

function getTodayDateKey() {
  return getLocalDateKey(new Date());
}

function getDefaultTransactionDateKey() {
  const todayKey = getTodayDateKey();
  return todayKey < MIN_TRANSACTION_DATE
    ? MIN_TRANSACTION_DATE
    : todayKey;
}

function getClampedChartDateKey(dateKey, fallback = getDefaultTransactionDateKey()) {
  const normalizedDateKey = String(dateKey || "").trim();
  const safeDateKey = /^\d{4}-\d{2}-\d{2}$/.test(normalizedDateKey)
    ? normalizedDateKey
    : fallback;
  const todayKey = getTodayDateKey();

  if (safeDateKey < MIN_TRANSACTION_DATE) {
    return MIN_TRANSACTION_DATE;
  }

  if (safeDateKey > todayKey) {
    return todayKey;
  }

  return safeDateKey;
}

function getSubmitButton() {
  return elements.form?.querySelector('button[type="submit"]') || null;
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

function shiftDateKey(dateKey, offsetDays) {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return dateKey;
  }

  const date = new Date(year, month - 1, day, 12);
  date.setDate(date.getDate() + offsetDays);

  return getLocalDateKey(date);
}

function setTransactionDateValue(dateKey) {
  if (!elements.dateInput) return;

  let nextDateKey = dateKey || getDefaultTransactionDateKey();

  if (nextDateKey < MIN_TRANSACTION_DATE) {
    nextDateKey = MIN_TRANSACTION_DATE;
  }

  elements.dateInput.value = nextDateKey;
}

function getSelectedTransactionDateKey() {
  const selectedDate = elements.dateInput?.value;

  return selectedDate && selectedDate >= MIN_TRANSACTION_DATE
    ? selectedDate
    : getDefaultTransactionDateKey();
}

function adjustTransactionDate(offsetDays) {
  const baseDateKey = getSelectedTransactionDateKey();
  let nextDateKey = shiftDateKey(baseDateKey, offsetDays);

  if (nextDateKey < MIN_TRANSACTION_DATE) {
    nextDateKey = MIN_TRANSACTION_DATE;
  }

  setTransactionDateValue(nextDateKey);
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

function setBalanceStyle(balance) {
  const { balanceDisplay } = elements;

  balanceDisplay.classList.remove("positive", "negative", "neutral");

  if (balance === 0) {
    balanceDisplay.classList.add("neutral");
  } else if (balance > 0) {
    balanceDisplay.classList.add("positive");
  } else {
    balanceDisplay.classList.add("negative");
  }
}

function getTransactionLabel(description) {
  const text = String(description || "").trim();
  return text || "Sem descrição";
}

function getTransactionAmountClass(type) {
  return type === "expense" ? "negative" : "positive";
}

function getTransactionSignedValue(type, amount) {
  const signal = type === "expense" ? "-" : "+";
  return `${signal} ${formatCurrency(amount)}`;
}

function resetFormState() {
  elements.form.reset();
  state.editingId = null;
  clearFormFeedback();

  if (elements.charCount) {
    elements.charCount.textContent = "0/40";
  }

  if (elements.dateInput) {
    elements.dateInput.min = MIN_TRANSACTION_DATE;
    setTransactionDateValue(getDefaultTransactionDateKey());
  }

  const submitButton = getSubmitButton();

  if (submitButton) {
    submitButton.innerText = "Adicionar";
    submitButton.disabled = false;
  }
}

function setSubmitButtonState({ text, disabled }) {
  const button = getSubmitButton();
  if (!button) return;

  button.innerText = text;
  button.disabled = disabled;
}

function getRequestHeaders(withJson = false) {
  const headers = {
    Authorization: `Bearer ${token}`
  };

  if (withJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function loadCurrentUserProfile() {
  try {
    const response = await fetch(`${AUTH_API_URL}/me`, {
      headers: getRequestHeaders()
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    persistCurrentUser(data.name || "", data.profileImage || "");
  } catch (error) {
    console.error("Erro ao carregar perfil do usuario:", error);
  }
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
  if (!elements.chartFilterButtons) return;

  elements.chartFilterButtons.forEach((button) => {
    const isActive = button.dataset.range === state.chartRange;
    button.classList.toggle("active", isActive);
  });
}

function getChartTransactions(transactions = []) {
  return [...transactions]
    .map((transaction, index) => {
      const parsedTimestamp = new Date(transaction.date || 0).getTime();
      const amount = Number(transaction.amount) || 0;

      return {
        ...transaction,
        amount,
        signedAmount: transaction.type === "expense" ? -amount : amount,
        dateKey: getTransactionDateKey(transaction.date),
        timestamp: Number.isNaN(parsedTimestamp)
          ? Number.MAX_SAFE_INTEGER
          : parsedTimestamp,
        originalIndex: index
      };
    })
    .filter((transaction) => transaction.dateKey)
    .sort((a, b) => a.timestamp - b.timestamp || a.originalIndex - b.originalIndex);
}

function buildDailyBalancePoints(transactions = []) {
  const dailyPoints = new Map();

  transactions.forEach((transaction) => {
    const existingPoint = dailyPoints.get(transaction.dateKey) || {
      dateKey: transaction.dateKey,
      netChange: 0,
      transactionCount: 0
    };

    existingPoint.netChange += transaction.signedAmount;
    existingPoint.transactionCount += 1;

    dailyPoints.set(transaction.dateKey, existingPoint);
  });

  return [...dailyPoints.values()].sort((a, b) =>
    a.dateKey.localeCompare(b.dateKey)
  );
}

function buildChartSeriesLegacy(transactions = [], range = "7") {
  const normalizedTransactions = getChartTransactions(transactions);

  if (!normalizedTransactions.length) {
    return {
      labels: [],
      data: [],
      points: [],
      period: null
    };
  }

  if (range === "all") {
    const dailyPoints = buildDailyBalancePoints(normalizedTransactions);
    let runningBalance = 0;

    const points = dailyPoints.map((point) => {
      runningBalance += point.netChange;

      return {
        ...point,
        balance: runningBalance,
        label: formatDateKeyBR(point.dateKey),
        marker: "activity"
      };
    });

    return {
      labels: points.map((point) => point.label),
      data: points.map((point) => point.balance),
      points,
      period: {
        startKey: points[0].dateKey,
        endKey: points[points.length - 1].dateKey
      }
    };
  }

  const days = Number(range);

  if (!Number.isFinite(days) || days <= 0) {
    return buildChartSeries(transactions, "all");
  }

  const todayKey = getTodayDateKey();
  const startKey = shiftDateKey(todayKey, -(days - 1));

  const openingBalance = normalizedTransactions.reduce((total, transaction) => (
    transaction.dateKey < startKey
      ? total + transaction.signedAmount
      : total
  ), 0);

  const transactionsInRange = normalizedTransactions.filter((transaction) => (
    transaction.dateKey >= startKey && transaction.dateKey <= todayKey
  ));

  const dailyPoints = buildDailyBalancePoints(transactionsInRange);
  const points = [];
  let runningBalance = openingBalance;

  points.push({
    dateKey: startKey,
    netChange: 0,
    transactionCount: 0,
    balance: openingBalance,
    label: `Início • ${formatDateKeyBR(startKey)}`,
    marker: "start"
  });

  dailyPoints.forEach((point) => {
    runningBalance += point.netChange;

    points.push({
      ...point,
      balance: runningBalance,
      label: formatDateKeyBR(point.dateKey),
      marker: "activity"
    });
  });

  const lastPoint = points[points.length - 1];
  const finalBalance = lastPoint ? lastPoint.balance : openingBalance;

  if (!lastPoint || lastPoint.dateKey !== todayKey) {
    points.push({
      dateKey: todayKey,
      netChange: 0,
      transactionCount: 0,
      balance: finalBalance,
      label: `Hoje • ${formatDateKeyBR(todayKey)}`,
      marker: "end"
    });
  }

  return {
    labels: points.map((point) => point.label),
    data: points.map((point) => point.balance),
    points,
    period: {
      startKey,
      endKey: todayKey
    }
  };
}

function buildBoundedChartSeries(
  normalizedTransactions = [],
  startKey,
  endKey,
  options = {}
) {
  const {
    startLabelPrefix = "Inicio",
    endLabelPrefix = "Hoje",
    activityLabelFormatter = (dateKey) => formatDateKeyBR(dateKey)
  } = options;

  const openingBalance = normalizedTransactions.reduce((total, transaction) => (
    transaction.dateKey < startKey
      ? total + transaction.signedAmount
      : total
  ), 0);

  const transactionsInRange = normalizedTransactions.filter((transaction) => (
    transaction.dateKey >= startKey && transaction.dateKey <= endKey
  ));

  const dailyPoints = buildDailyBalancePoints(transactionsInRange);
  const points = [];
  let runningBalance = openingBalance;

  points.push({
    dateKey: startKey,
    netChange: 0,
    transactionCount: 0,
    balance: openingBalance,
    label: `${startLabelPrefix} • ${formatDateKeyBR(startKey)}`,
    marker: "start"
  });

  dailyPoints.forEach((point) => {
    runningBalance += point.netChange;

    points.push({
      ...point,
      balance: runningBalance,
      label: activityLabelFormatter(point.dateKey, endKey),
      marker: "activity"
    });
  });

  const lastPoint = points[points.length - 1];
  const finalBalance = lastPoint ? lastPoint.balance : openingBalance;
  const shouldForceEndPoint = startKey === endKey && dailyPoints.length === 0;

  if (shouldForceEndPoint || !lastPoint || lastPoint.dateKey !== endKey) {
    points.push({
      dateKey: endKey,
      netChange: 0,
      transactionCount: 0,
      balance: finalBalance,
      label: `${endLabelPrefix} • ${formatDateKeyBR(endKey)}`,
      marker: "end"
    });
  }

  return {
    labels: points.map((point) => point.label),
    data: points.map((point) => point.balance),
    points,
    period: {
      startKey,
      endKey
    }
  };
}

function buildChartSeries(transactions = [], range = "7") {
  const normalizedTransactions = getChartTransactions(transactions);

  if (!normalizedTransactions.length) {
    return {
      labels: [],
      data: [],
      points: [],
      period: null
    };
  }

  if (range === "all") {
    const dailyPoints = buildDailyBalancePoints(normalizedTransactions);
    let runningBalance = 0;

    const points = dailyPoints.map((point) => {
      runningBalance += point.netChange;

      return {
        ...point,
        balance: runningBalance,
        label: formatDateKeyBR(point.dateKey),
        marker: "activity"
      };
    });

    return {
      labels: points.map((point) => point.label),
      data: points.map((point) => point.balance),
      points,
      period: {
        startKey: points[0].dateKey,
        endKey: points[points.length - 1].dateKey
      }
    };
  }

  const todayKey = getTodayDateKey();

  if (range === "today") {
    return buildBoundedChartSeries(
      normalizedTransactions,
      todayKey,
      todayKey,
      {
        startLabelPrefix: "00:00",
        endLabelPrefix: "Hoje",
        activityLabelFormatter: (dateKey) => `Hoje • ${formatDateKeyBR(dateKey)}`
      }
    );
  }

  const days = Number(range);

  if (!Number.isFinite(days) || days <= 0) {
    return buildChartSeries(transactions, "all");
  }

  const startKey = getClampedChartDateKey(
    shiftDateKey(todayKey, -(days - 1)),
    todayKey
  );

  return buildBoundedChartSeries(
    normalizedTransactions,
    startKey,
    todayKey,
    {
      startLabelPrefix: "Inicio",
      endLabelPrefix: "Hoje"
    }
  );
}

function updateChartPeriod(period = null) {
  if (!elements.chartPeriod) return;

  if (!period?.startKey || !period?.endKey) {
    elements.chartPeriod.textContent = "Período: sem dados";
    return;
  }

  const firstDate = formatDateKeyBR(period.startKey);
  const lastDate = formatDateKeyBR(period.endKey);

  if (!firstDate || !lastDate) {
    elements.chartPeriod.textContent = "Período: sem datas válidas";
    return;
  }

  if (firstDate === lastDate) {
    elements.chartPeriod.textContent = `Período: ${firstDate}`;
    return;
  }

  elements.chartPeriod.textContent = `Período: ${firstDate} → ${lastDate}`;
}

/* ============================= */
/* RENDER */
/* ============================= */

function createTransactionItem(transaction) {
  const li = document.createElement("li");
  li.classList.add("transaction-item");

  const amountClass = getTransactionAmountClass(transaction.type);
  const signedValue = getTransactionSignedValue(
    transaction.type,
    transaction.amount
  );

  const typeLabel = transaction.type === "expense" ? "Saída" : "Entrada";
  const iconSymbol = transaction.type === "expense" ? "↘" : "↗";

  li.innerHTML = `
    <div class="transaction-left">
      <div class="transaction-icon ${amountClass}">
        ${iconSymbol}
      </div>

      <div class="transaction-content">
        <strong class="transaction-title">
          ${getTransactionLabel(transaction.description)}
        </strong>

        <span class="transaction-subtitle ${amountClass}">
          ${typeLabel}
        </span>
      </div>
    </div>

    <div class="transaction-right">
      <strong class="transaction-value ${amountClass}">
        ${signedValue}
      </strong>

      <div class="transaction-actions">
        <button class="edit-btn" type="button">🖊</button>
        <button class="delete-btn" type="button">🗑</button>
      </div>
    </div>
  `;

  const editBtn = li.querySelector(".edit-btn");
  const deleteBtn = li.querySelector(".delete-btn");

  editBtn.addEventListener("click", () => {
    editTransaction(transaction);
  });

  deleteBtn.addEventListener("click", () => {
    openDeleteModal(transaction._id);
  });

  return li;
}

function renderTransactions(transactions = []) {
  elements.list.innerHTML = "";

  if (transactions.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.classList.add("empty-state");
    emptyItem.textContent = "Nenhuma transação ainda";
    elements.list.appendChild(emptyItem);

    updateToggleTransactionsButton(0);
    return;
  }

  const visibleTransactions = getVisibleTransactions(transactions);

  visibleTransactions.forEach((transaction) => {
    const item = createTransactionItem(transaction);
    elements.list.appendChild(item);
  });

  updateToggleTransactionsButton(transactions.length);
}

function renderDashboardData() {
  renderTransactions(state.allTransactions);

  const chartSeries = buildChartSeries(
    state.allTransactions,
    state.chartRange
  );

  renderBalanceChart(chartSeries);
  updateChartPeriod(chartSeries.period);
  updateChartFilterButtons();
}

/* ============================= */
/* LOAD */
/* ============================= */

async function loadTransactions() {
  showLoader();

  try {
    const response = await fetch(API_URL, {
      headers: getRequestHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.message || "Erro ao carregar transações");
      return;
    }

    state.allTransactions = Array.isArray(data.transactions)
      ? data.transactions
      : [];

    elements.balanceDisplay.innerText = formatCurrency(data.balance);
    setBalanceStyle(data.balance);

    renderDashboardData();
  } catch (error) {
    console.error("Erro ao carregar transações:", error);
    showToast("Erro ao carregar transações");
  } finally {
    hideLoader();
  }
}

/* ============================= */
/* CREATE + UPDATE */
/* ============================= */

async function handleTransactionSubmit(event) {
  event.preventDefault();
  clearFormFeedback();

  const description = elements.descriptionInput.value.trim();
  const amountValue = parseFloat(elements.amountInput.value);
  const selectedDate = getSelectedTransactionDateKey();

  if (!Number.isFinite(amountValue) || amountValue === 0) {
    showFormFeedback("O valor da transação deve ser diferente de 0.");
    return;
  }

  if (selectedDate && selectedDate < MIN_TRANSACTION_DATE) {
    showFormFeedback("A data da transação não pode ser anterior a 01/01/2026.");
    setTransactionDateValue(getDefaultTransactionDateKey());
    return;
  }

  const wasEditing = Boolean(state.editingId);
  const type = amountValue < 0 ? "expense" : "income";
  const amount = Math.abs(amountValue);

  const url = state.editingId ? `${API_URL}/${state.editingId}` : API_URL;
  const method = state.editingId ? "PUT" : "POST";

  showLoader();
  setSubmitButtonState({
    text: state.editingId ? "Salvando..." : "Adicionando...",
    disabled: true
  });

  try {
    const response = await fetch(url, {
      method,
      headers: getRequestHeaders(true),
      body: JSON.stringify({
        type,
        amount,
        description,
        date: selectedDate || null
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showFormFeedback(data.message || "Erro na operação");
      return;
    }

    resetFormState();
    showToast(
      wasEditing
        ? "Transação atualizada com sucesso."
        : "Transação adicionada com sucesso.",
      "success"
    );
    await loadTransactions();
  } catch (error) {
    console.error("Erro ao salvar transação:", error);
    showFormFeedback("Erro na operação");
  } finally {
    hideLoader();
    setSubmitButtonState({
      text: state.editingId ? "Atualizar" : "Adicionar",
      disabled: false
    });

    if (!state.editingId) {
      setSubmitButtonState({
        text: "Adicionar",
        disabled: false
      });
    }
  }
}

/* ============================= */
/* EDIT */
/* ============================= */

function editTransaction(transaction) {
  state.editingId = transaction._id;
  clearFormFeedback();

  elements.descriptionInput.value = transaction.description || "";
  elements.amountInput.value =
    transaction.type === "expense"
      ? -Number(transaction.amount)
      : Number(transaction.amount);

  if (elements.dateInput && transaction.date) {
    const dateKey = getTransactionDateKey(transaction.date);

    if (dateKey) {
      setTransactionDateValue(dateKey);
    }
  }

  if (elements.charCount) {
    elements.charCount.textContent = `${elements.descriptionInput.value.length}/40`;
  }

  setSubmitButtonState({
    text: "Atualizar",
    disabled: false
  });
}

/* ============================= */
/* DELETE */
/* ============================= */

function openDeleteModal(id) {
  state.transactionToDelete = id;
  elements.deleteModal.classList.remove("hidden");
}

function closeDeleteModal() {
  state.transactionToDelete = null;
  elements.deleteModal.classList.add("hidden");
}

async function confirmDeleteTransaction() {
  if (!state.transactionToDelete) return;

  showLoader();

  try {
    const response = await fetch(`${API_URL}/${state.transactionToDelete}`, {
      method: "DELETE",
      headers: getRequestHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.message || "Erro ao deletar");
      return;
    }

    closeDeleteModal();
    showToast("Transação removida com sucesso.", "success");
    await loadTransactions();
  } catch (error) {
    console.error("Erro ao deletar transação:", error);
    showToast("Erro ao deletar");
  } finally {
    hideLoader();
    closeDeleteModal();
  }
}

/* ============================= */
/* CHAR COUNT */
/* ============================= */

function setupCharCount() {
  if (!elements.descriptionInput || !elements.charCount) return;

  elements.descriptionInput.addEventListener("input", () => {
    if (elements.descriptionInput.value.length > 40) {
      elements.descriptionInput.value = elements.descriptionInput.value.slice(0, 40);
    }

    elements.charCount.textContent = `${elements.descriptionInput.value.length}/40`;
  });
}

/* ============================= */
/* LOGOUT */
/* ============================= */

function openLogoutModal() {
  elements.logoutModal.classList.remove("hidden");
}

function closeLogoutModal() {
  elements.logoutModal.classList.add("hidden");
}

function confirmLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  localStorage.removeItem(USER_PROFILE_IMAGE_STORAGE_KEY);
  window.location.href = "login.html";
}

/* ============================= */
/* EVENTS */
/* ============================= */

function setupEvents() {
  elements.form.addEventListener("submit", handleTransactionSubmit);

  elements.logoutBtn.addEventListener("click", openLogoutModal);
  elements.cancelLogoutBtn.addEventListener("click", closeLogoutModal);
  elements.confirmLogoutBtn.addEventListener("click", confirmLogout);

  if (elements.editProfileBtn) {
    elements.editProfileBtn.addEventListener("click", () => {
      window.location.href = "editUser.html";
    });
  }

  elements.cancelDeleteBtn.addEventListener("click", closeDeleteModal);
  elements.confirmDeleteBtn.addEventListener("click", confirmDeleteTransaction);

  if (elements.dateStepUpBtn) {
    elements.dateStepUpBtn.addEventListener("click", () => {
      adjustTransactionDate(1);
    });
  }

  if (elements.dateStepDownBtn) {
    elements.dateStepDownBtn.addEventListener("click", () => {
      adjustTransactionDate(-1);
    });
  }

  if (elements.amountStepUpBtn) {
    elements.amountStepUpBtn.addEventListener("click", () => {
      clearFormFeedback();
      adjustAmountValue(1);
    });
  }

  if (elements.amountStepDownBtn) {
    elements.amountStepDownBtn.addEventListener("click", () => {
      clearFormFeedback();
      adjustAmountValue(-1);
    });
  }

  if (elements.toggleTransactionsBtn) {
    elements.toggleTransactionsBtn.addEventListener("click", () => {
      state.showAllTransactions = !state.showAllTransactions;
      renderTransactions(state.allTransactions);
    });
  }

  if (elements.chartFilterButtons) {
    elements.chartFilterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.chartRange = button.dataset.range;
        renderDashboardData();
      });
    });
  }

  if (elements.amountInput) {
    elements.amountInput.addEventListener("input", clearFormFeedback);
  }

  if (elements.descriptionInput) {
    elements.descriptionInput.addEventListener("input", clearFormFeedback);
  }

  if (elements.dateInput) {
    elements.dateInput.addEventListener("input", clearFormFeedback);
  }

  setupCharCount();
}

/* ============================= */
/* INIT */
/* ============================= */

function init() {
  if (elements.dateInput) {
    elements.dateInput.min = MIN_TRANSACTION_DATE;
    setTransactionDateValue(getDefaultTransactionDateKey());
  }

  setupEvents();
  loadCurrentUserProfile();
  loadTransactions();
}

init();
