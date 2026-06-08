(function (window) {
  window.EZSaldoConfig = Object.freeze({
    API_URL: "https://ezsaldo-backend.onrender.com/api/transactions",
    AUTH_API_URL: "https://ezsaldo-backend.onrender.com/api/auth",
    MIN_TRANSACTION_DATE: "2026-01-01",
    DEFAULT_AVATAR_SRC: "assets/avatar-default.png",
    USER_PROFILE_IMAGE_STORAGE_KEY: "userProfileImage",
    NAME_LOCALE: "pt-BR",
    MAX_DESCRIPTION_LENGTH: 40,
    DEFAULT_CHART_RANGE: "7"
  });
})(window);
