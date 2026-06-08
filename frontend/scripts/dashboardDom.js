(function (window, document) {
  function getElements() {
    return {
      globalLoader: document.getElementById("globalLoader"),
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
      chartPeriod: document.getElementById("chartPeriod"),
      periodResultCard: document.getElementById("periodResultCard"),
      periodResultRange: document.getElementById("periodResultRange"),
      periodResultMessage: document.getElementById("periodResultMessage")
    };
  }

  window.EZSaldoDashboardDom = {
    getElements
  };
})(window, document);
