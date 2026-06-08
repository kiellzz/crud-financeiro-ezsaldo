(function (window) {
  const { MIN_TRANSACTION_DATE } = window.EZSaldoConfig;
  const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

  function isDateKey(value) {
    return ISO_DATE_PATTERN.test(String(value || "").trim());
  }

  function isMidnightUtcDate(date) {
    return (
      date.getUTCHours() === 0 &&
      date.getUTCMinutes() === 0 &&
      date.getUTCSeconds() === 0 &&
      date.getUTCMilliseconds() === 0
    );
  }

  function getTransactionDateKey(dateValue) {
    if (!dateValue) {
      return null;
    }

    if (typeof dateValue === "string") {
      const trimmedValue = dateValue.trim();

      if (isDateKey(trimmedValue)) {
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

  function getClampedChartDateKey(
    dateKey,
    fallback = getDefaultTransactionDateKey()
  ) {
    const normalizedDateKey = String(dateKey || "").trim();
    const safeDateKey = isDateKey(normalizedDateKey)
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

  function shiftDateKey(dateKey, offsetDays) {
    const [year, month, day] = dateKey.split("-").map(Number);

    if (!year || !month || !day) {
      return dateKey;
    }

    const date = new Date(year, month - 1, day, 12);
    date.setDate(date.getDate() + offsetDays);

    return getLocalDateKey(date);
  }

  window.EZSaldoDateUtils = {
    formatDateKeyBR,
    getClampedChartDateKey,
    getDefaultTransactionDateKey,
    getTodayDateKey,
    getTransactionDateKey,
    shiftDateKey
  };
})(window);
