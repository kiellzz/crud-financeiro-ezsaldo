(function (window) {
  const { NAME_LOCALE } = window.EZSaldoConfig;

  function normalizeName(name = "") {
    return typeof name === "string"
      ? name.trim().replace(/\s+/g, " ")
      : "";
  }

  function capitalizeFullName(name = "") {
    const normalizedName = normalizeName(name);

    if (!normalizedName) {
      return "";
    }

    return normalizedName
      .toLocaleLowerCase(NAME_LOCALE)
      .replace(/(^|\s)\S/g, (match) => match.toLocaleUpperCase(NAME_LOCALE));
  }

  function getFirstName(name = "") {
    const capitalizedName = capitalizeFullName(name);
    return capitalizedName.split(/\s+/)[0] || "";
  }

  function formatCurrency(value) {
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  window.EZSaldoFormatters = {
    capitalizeFullName,
    formatCurrency,
    getFirstName
  };
})(window);
