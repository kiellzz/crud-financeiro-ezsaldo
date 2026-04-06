const AUTH_API_URL = "http://localhost:5000/api/auth";
const USER_PROFILE_IMAGE_STORAGE_KEY = "userProfileImage";
const DEFAULT_AVATAR_SRC = "assets/avatar-default.png";
const NAME_LOCALE = "pt-BR";
const MIN_PASSWORD_LENGTH = 6;
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const elements = {
  loader: document.getElementById("globalLoader"),
  appToast: document.getElementById("appToast"),
  form: document.getElementById("editUserForm"),
  logoutBtn: document.getElementById("logoutBtn"),
  logoutModal: document.getElementById("logoutModal"),
  confirmLogoutBtn: document.getElementById("confirmLogout"),
  cancelLogoutBtn: document.getElementById("cancelLogout"),
  nameInput: document.getElementById("editUserName"),
  saveProfileBtn: document.getElementById("saveProfileBtn"),
  formFeedback: document.getElementById("formFeedback"),
  accountEmail: document.getElementById("accountEmail"),
  accountCreatedAt: document.getElementById("accountCreatedAt"),
  openChangeEmailBtn: document.getElementById("openChangeEmailBtn"),
  avatarPickerBtn: document.getElementById("avatarPickerBtn"),
  avatarPreview: document.getElementById("avatarPreview"),
  avatarTip: document.getElementById("avatarTip"),
  removeImageBtn: document.getElementById("removeImageBtn"),
  profileImageInput: document.getElementById("profileImage"),
  profileGreeting: document.getElementById("profileGreeting"),
  openChangePasswordBtn: document.getElementById("openChangePasswordBtn"),
  changeEmailModal: document.getElementById("changeEmailModal"),
  changeEmailForm: document.getElementById("changeEmailForm"),
  cancelChangeEmailBtn: document.getElementById("cancelChangeEmailBtn"),
  confirmChangeEmailBtn: document.getElementById("confirmChangeEmailBtn"),
  newEmailInput: document.getElementById("newEmail"),
  changeEmailFeedback: document.getElementById("changeEmailFeedback"),
  changePasswordModal: document.getElementById("changePasswordModal"),
  changePasswordForm: document.getElementById("changePasswordForm"),
  cancelChangePasswordBtn: document.getElementById("cancelChangePasswordBtn"),
  confirmChangePasswordBtn: document.getElementById("confirmChangePasswordBtn"),
  currentPasswordInput: document.getElementById("currentPassword"),
  newPasswordInput: document.getElementById("newPassword"),
  confirmNewPasswordInput: document.getElementById("confirmNewPassword"),
  changePasswordFeedback: document.getElementById("changePasswordFeedback"),
  openDeleteAccountBtn: document.getElementById("openDeleteAccountBtn"),
  deleteAccountModal: document.getElementById("deleteAccountModal"),
  deleteAccountStepIntro: document.getElementById("deleteAccountStepIntro"),
  deleteAccountStepConfirm: document.getElementById("deleteAccountStepConfirm"),
  cancelDeleteAccountBtn: document.getElementById("cancelDeleteAccountBtn"),
  continueDeleteAccountBtn: document.getElementById("continueDeleteAccountBtn"),
  backDeleteAccountBtn: document.getElementById("backDeleteAccountBtn"),
  confirmDeleteAccountBtn: document.getElementById("confirmDeleteAccountBtn"),
  deleteAccountPassword: document.getElementById("deleteAccountPassword"),
  deleteAccountFeedback: document.getElementById("deleteAccountFeedback"),
  cropModal: document.getElementById("cropModal"),
  cropperImage: document.getElementById("cropperImage"),
  zoomRange: document.getElementById("zoomRange"),
  cancelCropBtn: document.getElementById("cancelCropBtn"),
  confirmCropBtn: document.getElementById("confirmCropBtn")
};

const state = {
  toastTimeoutId: null,
  cropperInstance: null,
  currentImageSrc: "",
  croppedAvatarBase64: "",
  initialZoomRatio: 1,
  deleteAccountSubmitting: false,
  changePasswordSubmitting: false,
  changeEmailSubmitting: false,
  currentEmail: "",
  currentCreatedAt: null
};

function showLoader() {
  elements.loader?.classList.remove("hidden");
}

function hideLoader() {
  elements.loader?.classList.add("hidden");
}

function clearFormFeedback() {
  if (!elements.formFeedback) return;

  elements.formFeedback.textContent = "";
  elements.formFeedback.classList.add("hidden");
  elements.formFeedback.classList.remove("success");
}

function showFormFeedback(message, type = "error") {
  if (!elements.formFeedback) return;

  elements.formFeedback.textContent = message;
  elements.formFeedback.classList.remove("hidden", "success");

  if (type === "success") {
    elements.formFeedback.classList.add("success");
  }
}

function clearDeleteAccountFeedback() {
  if (!elements.deleteAccountFeedback) return;

  elements.deleteAccountFeedback.textContent = "";
  elements.deleteAccountFeedback.classList.add("hidden");
}

function showDeleteAccountFeedback(message) {
  if (!elements.deleteAccountFeedback) return;

  elements.deleteAccountFeedback.textContent = message;
  elements.deleteAccountFeedback.classList.remove("hidden");
}

function clearChangePasswordFeedback() {
  if (!elements.changePasswordFeedback) return;

  elements.changePasswordFeedback.textContent = "";
  elements.changePasswordFeedback.classList.add("hidden");
}

function showChangePasswordFeedback(message) {
  if (!elements.changePasswordFeedback) return;

  elements.changePasswordFeedback.textContent = message;
  elements.changePasswordFeedback.classList.remove("hidden");
}

function resetInputBorder(input) {
  if (!input) return;

  input.style.removeProperty("border-color");
}

function setInputBorderSuccess(input) {
  if (!input) return;

  input.style.borderColor = "#22c55e";
}

function setInputBorderError(input) {
  if (!input) return;

  input.style.borderColor = "#ef4444";
}

function validateChangePasswordFields() {
  if (!elements.newPasswordInput || !elements.confirmNewPasswordInput) {
    return true;
  }

  const newPassword = elements.newPasswordInput.value;
  const confirmNewPassword = elements.confirmNewPasswordInput.value;
  const newPasswordValidationMessage = getPasswordValidationMessage(newPassword);

  if (!newPassword) {
    resetInputBorder(elements.newPasswordInput);
  } else if (newPasswordValidationMessage) {
    setInputBorderError(elements.newPasswordInput);
  } else {
    setInputBorderSuccess(elements.newPasswordInput);
  }

  if (!confirmNewPassword) {
    resetInputBorder(elements.confirmNewPasswordInput);
    return false;
  }

  if (newPasswordValidationMessage) {
    setInputBorderError(elements.confirmNewPasswordInput);
    return false;
  }

  if (newPassword === confirmNewPassword) {
    setInputBorderSuccess(elements.confirmNewPasswordInput);
    return true;
  }

  setInputBorderError(elements.confirmNewPasswordInput);
  return false;
}

function getPasswordValidationMessage(password = "") {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  return "";
}

function clearChangeEmailFeedback() {
  if (!elements.changeEmailFeedback) return;

  elements.changeEmailFeedback.textContent = "";
  elements.changeEmailFeedback.classList.add("hidden");
}

function showChangeEmailFeedback(message) {
  if (!elements.changeEmailFeedback) return;

  elements.changeEmailFeedback.textContent = message;
  elements.changeEmailFeedback.classList.remove("hidden");
}

function hideToast() {
  if (!elements.appToast) return;

  elements.appToast.classList.remove("visible", "error", "success");

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

function showToast(message, type = "error", duration = 3200) {
  if (!elements.appToast) return;

  if (state.toastTimeoutId) {
    clearTimeout(state.toastTimeoutId);
  }

  elements.appToast.textContent = message;
  elements.appToast.classList.remove("hidden", "error", "success");
  elements.appToast.classList.add(type);

  window.requestAnimationFrame(() => {
    elements.appToast.classList.add("visible");
  });

  state.toastTimeoutId = window.setTimeout(() => {
    hideToast();
  }, duration);
}

function formatAccountCreatedAt(dateValue) {
  if (!dateValue) {
    return "Nao disponivel";
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Nao disponivel";
  }

  return parsedDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function updateAccountMeta(email = "", createdAt = null) {
  state.currentEmail = email || "";
  state.currentCreatedAt = createdAt || null;

  if (elements.accountEmail) {
    elements.accountEmail.textContent = email || "Nao disponivel";
  }

  if (elements.accountCreatedAt) {
    elements.accountCreatedAt.textContent = formatAccountCreatedAt(createdAt);
  }

  if (elements.openChangeEmailBtn) {
    const nextLabel = email
      ? `Alterar email atual: ${email}`
      : "Alterar email";

    elements.openChangeEmailBtn.setAttribute("aria-label", nextLabel);
    elements.openChangeEmailBtn.setAttribute("title", nextLabel);
  }
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

function normalizeNameValue(name = "") {
  return typeof name === "string"
    ? name.trim().replace(/\s+/g, " ")
    : "";
}

function normalizeEmailValue(email = "") {
  return typeof email === "string"
    ? email.trim().toLowerCase()
    : "";
}

function getEmailValidationMessage(email = "") {
  const normalizedEmail = normalizeEmailValue(email);

  if (!normalizedEmail) {
    return "Digite um email.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return "Digite um email valido.";
  }

  if (state.currentEmail && normalizedEmail === normalizeEmailValue(state.currentEmail)) {
    return "Digite um email diferente do atual.";
  }

  return "";
}

function capitalizeFullName(name = "") {
  const normalizedName = normalizeNameValue(name);

  if (!normalizedName) {
    return "";
  }

  return normalizedName
    .toLocaleLowerCase(NAME_LOCALE)
    .replace(/(^|\s)\S/g, (match) => match.toLocaleUpperCase(NAME_LOCALE));
}

function getNameValidationMessage(name = "") {
  const words = normalizeNameValue(name)
    .split(" ")
    .filter(Boolean);

  if (words.length === 0) {
    return "Informe um nome valido.";
  }

  if (words.length === 1) {
    return "Digite um sobrenome.";
  }

  const uniqueWords = new Set(
    words.map((word) => word.toLocaleLowerCase(NAME_LOCALE))
  );

  if (uniqueWords.size < 2) {
    return "Informe nome e sobrenome diferentes.";
  }

  return "";
}

function normalizeNameInputValue() {
  if (!elements.nameInput) {
    return "";
  }

  const capitalizedName = capitalizeFullName(elements.nameInput.value);
  elements.nameInput.value = capitalizedName;
  return capitalizedName;
}

function getFirstName(name = "") {
  return capitalizeFullName(name).split(/\s+/)[0] || "";
}

function persistCurrentUser(name = "", profileImage = "") {
  localStorage.setItem("userName", capitalizeFullName(name));

  if (profileImage) {
    localStorage.setItem(USER_PROFILE_IMAGE_STORAGE_KEY, profileImage);
  } else {
    localStorage.removeItem(USER_PROFILE_IMAGE_STORAGE_KEY);
  }
}

function updateProfileGreeting(name = "") {
  if (!elements.profileGreeting) return;

  const firstName = getFirstName(name);
  elements.profileGreeting.textContent = firstName
    ? `${firstName}, esse é o seu visual atual!`
    : "Seu perfil esta pronto para edicao.";
}

function syncAvatarPreview() {
  const hasAvatar = Boolean(state.croppedAvatarBase64);
  const nextAvatar = hasAvatar ? state.croppedAvatarBase64 : DEFAULT_AVATAR_SRC;

  if (elements.avatarPreview) {
    elements.avatarPreview.src = nextAvatar;
    elements.avatarPreview.classList.remove("hidden");
  }

  if (elements.avatarTip) {
    elements.avatarTip.classList.toggle("hidden", hasAvatar);
  }

  if (elements.avatarPickerBtn) {
    const avatarActionLabel = hasAvatar
      ? "Alterar imagem de perfil"
      : "Adicionar imagem de perfil";

    elements.avatarPickerBtn.setAttribute("aria-label", avatarActionLabel);
    elements.avatarPickerBtn.setAttribute("title", avatarActionLabel);
  }

  if (elements.removeImageBtn) {
    elements.removeImageBtn.classList.toggle("hidden", !hasAvatar);
  }
}

function resetAvatarSelection() {
  state.croppedAvatarBase64 = "";
  state.currentImageSrc = "";

  if (elements.profileImageInput) {
    elements.profileImageInput.value = "";
  }

  syncAvatarPreview();
}

function openCropModal() {
  elements.cropModal?.classList.remove("hidden");
}

function closeCropModal() {
  elements.cropModal?.classList.add("hidden");

  if (state.cropperInstance) {
    state.cropperInstance.destroy();
    state.cropperInstance = null;
  }

  if (elements.zoomRange) {
    elements.zoomRange.value = "1";
  }

  state.initialZoomRatio = 1;
}

function getCurrentCropperZoomRatio() {
  if (!state.cropperInstance) return 1;

  const imageData = state.cropperInstance.getImageData();

  if (!imageData.naturalWidth) {
    return 1;
  }

  return imageData.width / imageData.naturalWidth;
}

function setSavingState(isSaving) {
  if (!elements.saveProfileBtn) return;

  elements.saveProfileBtn.disabled = isSaving;
  elements.saveProfileBtn.textContent = isSaving
    ? "Salvando..."
    : "Salvar alterações";
}

function resetPasswordToggleState(scopeElement) {
  if (!scopeElement) return;

  scopeElement.querySelectorAll(".toggle-password").forEach((button) => {
    const input = button.previousElementSibling;

    if (input) {
      input.type = "password";
    }

    button.classList.remove("is-visible");
    button.setAttribute("aria-label", "Mostrar senha");
    button.setAttribute("aria-pressed", "false");
  });
}

function setupPasswordToggles() {
  document.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.previousElementSibling;
      if (!input) return;

      const isHidden = input.type === "password";

      input.type = isHidden ? "text" : "password";
      button.classList.toggle("is-visible", isHidden);
      button.setAttribute(
        "aria-label",
        isHidden ? "Ocultar senha" : "Mostrar senha"
      );
      button.setAttribute(
        "aria-pressed",
        isHidden ? "true" : "false"
      );
    });
  });
}

function clearAuthenticatedSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  localStorage.removeItem(USER_PROFILE_IMAGE_STORAGE_KEY);
}

function openLogoutModal() {
  elements.logoutModal?.classList.remove("hidden");
}

function closeLogoutModal() {
  elements.logoutModal?.classList.add("hidden");
}

function confirmLogout() {
  clearAuthenticatedSession();
  window.location.href = "login.html";
}

function resetChangePasswordForm() {
  elements.changePasswordForm?.reset();
  clearChangePasswordFeedback();
  resetPasswordToggleState(elements.changePasswordModal);
  resetInputBorder(elements.currentPasswordInput);
  resetInputBorder(elements.newPasswordInput);
  resetInputBorder(elements.confirmNewPasswordInput);
}

function resetChangeEmailForm() {
  elements.changeEmailForm?.reset();
  clearChangeEmailFeedback();

  if (elements.newEmailInput) {
    elements.newEmailInput.value = "";
  }
}

function openChangeEmailModal() {
  resetChangeEmailForm();
  elements.changeEmailModal?.classList.remove("hidden");

  window.setTimeout(() => {
    elements.newEmailInput?.focus();
  }, 0);
}

function closeChangeEmailModal() {
  elements.changeEmailModal?.classList.add("hidden");
  resetChangeEmailForm();
  setChangeEmailSubmitting(false);
}

function openChangePasswordModal() {
  resetChangePasswordForm();
  elements.changePasswordModal?.classList.remove("hidden");

  window.setTimeout(() => {
    elements.currentPasswordInput?.focus();
  }, 0);
}

function closeChangePasswordModal() {
  elements.changePasswordModal?.classList.add("hidden");
  resetChangePasswordForm();
  setChangePasswordSubmitting(false);
}

function setChangePasswordSubmitting(isSubmitting) {
  state.changePasswordSubmitting = isSubmitting;

  if (elements.confirmChangePasswordBtn) {
    elements.confirmChangePasswordBtn.disabled = isSubmitting;
    elements.confirmChangePasswordBtn.textContent = isSubmitting
      ? "Salvando..."
      : "Salvar nova senha";
  }

  if (elements.cancelChangePasswordBtn) {
    elements.cancelChangePasswordBtn.disabled = isSubmitting;
  }
}

function setChangeEmailSubmitting(isSubmitting) {
  state.changeEmailSubmitting = isSubmitting;

  if (elements.confirmChangeEmailBtn) {
    elements.confirmChangeEmailBtn.disabled = isSubmitting;
    elements.confirmChangeEmailBtn.textContent = isSubmitting
      ? "Salvando..."
      : "Confirmar email";
  }

  if (elements.cancelChangeEmailBtn) {
    elements.cancelChangeEmailBtn.disabled = isSubmitting;
  }
}

async function handleChangePassword(event) {
  event.preventDefault();

  const currentPassword = elements.currentPasswordInput?.value || "";
  const newPassword = elements.newPasswordInput?.value || "";
  const confirmNewPassword = elements.confirmNewPasswordInput?.value || "";
  const newPasswordValidationMessage = getPasswordValidationMessage(newPassword);
  const passwordsMatch = validateChangePasswordFields();

  clearChangePasswordFeedback();

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    showChangePasswordFeedback("Preencha todos os campos para continuar.");
    return;
  }

  if (newPasswordValidationMessage) {
    showChangePasswordFeedback(newPasswordValidationMessage);
    return;
  }

  if (!passwordsMatch) {
    showChangePasswordFeedback("A confirmacao da nova senha nao confere.");
    return;
  }

  if (currentPassword === newPassword) {
    showChangePasswordFeedback("A nova senha deve ser diferente da senha atual.");
    return;
  }

  showLoader();
  setChangePasswordSubmitting(true);

  try {
    const response = await fetch(`${AUTH_API_URL}/me/password`, {
      method: "PUT",
      headers: getRequestHeaders(true),
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showChangePasswordFeedback(data.message || "Erro ao alterar senha.");
      return;
    }

    closeChangePasswordModal();
    showToast(data.message || "Senha alterada com sucesso.", "success");
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    showChangePasswordFeedback("Erro ao alterar senha.");
  } finally {
    hideLoader();
    setChangePasswordSubmitting(false);
  }
}

async function handleChangeEmail(event) {
  event.preventDefault();

  const newEmail = normalizeEmailValue(elements.newEmailInput?.value || "");
  const emailValidationMessage = getEmailValidationMessage(newEmail);

  clearChangeEmailFeedback();

  if (emailValidationMessage) {
    showChangeEmailFeedback(emailValidationMessage);
    return;
  }

  showLoader();
  setChangeEmailSubmitting(true);

  try {
    const response = await fetch(`${AUTH_API_URL}/me/email`, {
      method: "PUT",
      headers: getRequestHeaders(true),
      body: JSON.stringify({
        email: newEmail
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showChangeEmailFeedback(data.message || "Erro ao alterar email.");
      return;
    }

    const savedEmail = normalizeEmailValue(data.email || newEmail);

    updateAccountMeta(savedEmail, state.currentCreatedAt);
    closeChangeEmailModal();
    showToast(data.message || "Email alterado com sucesso.", "success");
  } catch (error) {
    console.error("Erro ao alterar email:", error);
    showChangeEmailFeedback("Erro ao alterar email.");
  } finally {
    hideLoader();
    setChangeEmailSubmitting(false);
  }
}

function showDeleteAccountIntroStep() {
  elements.deleteAccountStepIntro?.classList.remove("hidden");
  elements.deleteAccountStepConfirm?.classList.add("hidden");
  clearDeleteAccountFeedback();
  resetPasswordToggleState(elements.deleteAccountModal);

  if (elements.deleteAccountPassword) {
    elements.deleteAccountPassword.value = "";
  }
}

function showDeleteAccountConfirmStep() {
  elements.deleteAccountStepIntro?.classList.add("hidden");
  elements.deleteAccountStepConfirm?.classList.remove("hidden");
  clearDeleteAccountFeedback();
  window.setTimeout(() => {
    elements.deleteAccountPassword?.focus();
  }, 0);
}

function openDeleteAccountModal() {
  showDeleteAccountIntroStep();
  elements.deleteAccountModal?.classList.remove("hidden");
}

function closeDeleteAccountModal() {
  elements.deleteAccountModal?.classList.add("hidden");
  showDeleteAccountIntroStep();
  setDeleteAccountSubmitting(false);
}

function setDeleteAccountSubmitting(isSubmitting) {
  state.deleteAccountSubmitting = isSubmitting;

  if (elements.confirmDeleteAccountBtn) {
    elements.confirmDeleteAccountBtn.disabled = isSubmitting;
    elements.confirmDeleteAccountBtn.textContent = isSubmitting
      ? "Excluindo..."
      : "Excluir conta";
  }

  if (elements.continueDeleteAccountBtn) {
    elements.continueDeleteAccountBtn.disabled = isSubmitting;
  }

  if (elements.cancelDeleteAccountBtn) {
    elements.cancelDeleteAccountBtn.disabled = isSubmitting;
  }

  if (elements.backDeleteAccountBtn) {
    elements.backDeleteAccountBtn.disabled = isSubmitting;
  }
}

async function handleDeleteAccount() {
  const password = elements.deleteAccountPassword?.value || "";

  clearDeleteAccountFeedback();

  if (!password.trim()) {
    showDeleteAccountFeedback("Digite sua senha para continuar.");
    return;
  }

  showLoader();
  setDeleteAccountSubmitting(true);

  try {
    const response = await fetch(`${AUTH_API_URL}/me`, {
      method: "DELETE",
      headers: getRequestHeaders(true),
      body: JSON.stringify({ password })
    });

    const data = await response.json();

    if (!response.ok) {
      showDeleteAccountFeedback(data.message || "Erro ao excluir conta.");
      return;
    }

    clearAuthenticatedSession();
    window.location.href = "login.html";
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    showDeleteAccountFeedback("Erro ao excluir conta.");
  } finally {
    hideLoader();
    setDeleteAccountSubmitting(false);
  }
}

async function loadCurrentUserProfile() {
  showLoader();
  clearFormFeedback();

  try {
    const response = await fetch(`${AUTH_API_URL}/me`, {
      headers: getRequestHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      showFormFeedback(data.message || "Erro ao carregar perfil.");
      return;
    }

    const currentName = data.name || localStorage.getItem("userName") || "";
    const currentEmail = data.email || "";
    const currentCreatedAt = data.createdAt || null;
    const currentProfileImage = data.profileImage || "";

    elements.nameInput.value = capitalizeFullName(currentName);
    state.croppedAvatarBase64 = currentProfileImage;
    state.currentImageSrc = currentProfileImage;

    updateProfileGreeting(currentName);
    updateAccountMeta(currentEmail, currentCreatedAt);
    syncAvatarPreview();
    persistCurrentUser(currentName, currentProfileImage);
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    showFormFeedback("Erro ao carregar perfil.");
  } finally {
    hideLoader();
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  clearFormFeedback();

  const name = normalizeNameInputValue();
  const nameValidationMessage = getNameValidationMessage(name);

  if (nameValidationMessage) {
    showFormFeedback(nameValidationMessage);
    return;
  }

  showLoader();
  setSavingState(true);

  try {
    const response = await fetch(`${AUTH_API_URL}/me`, {
      method: "PUT",
      headers: getRequestHeaders(true),
      body: JSON.stringify({
        name,
        profileImage: state.croppedAvatarBase64 || ""
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showFormFeedback(data.message || "Erro ao salvar perfil.");
      return;
    }

    const savedName = data.name || name;
    const savedProfileImage = data.profileImage || "";

    persistCurrentUser(savedName, savedProfileImage);
    updateProfileGreeting(savedName);
    state.croppedAvatarBase64 = savedProfileImage;
    state.currentImageSrc = savedProfileImage;
    syncAvatarPreview();

    showFormFeedback("Perfil atualizado com sucesso.", "success");
    showToast("Perfil salvo com sucesso.", "success");
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    showFormFeedback("Erro ao salvar perfil.");
  } finally {
    hideLoader();
    setSavingState(false);
  }
}

function setupAvatarEditing() {
  if (elements.avatarPreview) {
    elements.avatarPreview.addEventListener("error", () => {
      elements.avatarPreview.src = DEFAULT_AVATAR_SRC;
    });
  }

  if (elements.avatarPickerBtn && elements.profileImageInput) {
    elements.avatarPickerBtn.addEventListener("click", () => {
      elements.profileImageInput.click();
    });
  }

  if (elements.profileImageInput) {
    elements.profileImageInput.addEventListener("change", async (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      try {
        state.currentImageSrc = await readFileAsDataURL(file);

        elements.cropperImage.onload = () => {
          openCropModal();

          if (state.cropperInstance) {
            state.cropperInstance.destroy();
            state.cropperInstance = null;
          }

          state.cropperInstance = new Cropper(elements.cropperImage, {
            aspectRatio: 1,
            viewMode: 1,
            dragMode: "move",
            background: false,
            guides: false,
            center: true,
            autoCropArea: 1,
            movable: true,
            zoomable: true,
            scalable: false,
            rotatable: false,
            ready() {
              state.initialZoomRatio = getCurrentCropperZoomRatio();

              if (elements.zoomRange) {
                elements.zoomRange.value = "1";
              }
            },
            zoom(event) {
              if (!elements.zoomRange || !state.initialZoomRatio) return;

              const minRatio = state.initialZoomRatio * Number(elements.zoomRange.min);
              const maxRatio = state.initialZoomRatio * Number(elements.zoomRange.max);
              const zoomTolerance = 0.001;

              if (
                event.detail.ratio < minRatio - zoomTolerance ||
                event.detail.ratio > maxRatio + zoomTolerance
              ) {
                event.preventDefault();
                return;
              }

              const relativeZoom = event.detail.ratio / state.initialZoomRatio;
              elements.zoomRange.value = relativeZoom.toFixed(2);
            }
          });
        };

        elements.cropperImage.src = state.currentImageSrc;
      } catch (error) {
        console.error("Erro ao carregar imagem:", error);
        showToast("Erro ao carregar imagem.", "error");
      }
    });
  }

  if (elements.zoomRange) {
    elements.zoomRange.addEventListener("input", (event) => {
      if (!state.cropperInstance || !state.initialZoomRatio) return;

      const minZoom = Number(elements.zoomRange.min);
      const maxZoom = Number(elements.zoomRange.max);
      const zoomValue = Math.min(
        maxZoom,
        Math.max(minZoom, Number(event.target.value))
      );

      state.cropperInstance.zoomTo(state.initialZoomRatio * zoomValue);
    });
  }

  if (elements.cancelCropBtn) {
    elements.cancelCropBtn.addEventListener("click", () => {
      closeCropModal();
      state.currentImageSrc = state.croppedAvatarBase64 || "";

      if (elements.profileImageInput) {
        elements.profileImageInput.value = "";
      }
    });
  }

  if (elements.confirmCropBtn) {
    elements.confirmCropBtn.addEventListener("click", async () => {
      if (!state.cropperInstance || !state.currentImageSrc) return;

      const cropData = state.cropperInstance.getData(true);

      try {
        state.croppedAvatarBase64 = await getCroppedImage(
          state.currentImageSrc,
          {
            x: cropData.x,
            y: cropData.y,
            width: cropData.width,
            height: cropData.height
          },
          256
        );

        state.currentImageSrc = state.croppedAvatarBase64;

        if (elements.profileImageInput) {
          elements.profileImageInput.value = "";
        }

        syncAvatarPreview();
        closeCropModal();
      } catch (error) {
        console.error("Erro ao recortar imagem:", error);
        showToast("Erro ao recortar imagem.", "error");
      }
    });
  }

  if (elements.removeImageBtn) {
    elements.removeImageBtn.addEventListener("click", () => {
      closeCropModal();
      resetAvatarSelection();
    });
  }
}

function setupEvents() {
  elements.form?.addEventListener("submit", handleSubmit);
  elements.logoutBtn?.addEventListener("click", openLogoutModal);
  elements.cancelLogoutBtn?.addEventListener("click", closeLogoutModal);
  elements.confirmLogoutBtn?.addEventListener("click", confirmLogout);
  elements.nameInput?.addEventListener("input", clearFormFeedback);
  elements.nameInput?.addEventListener("blur", normalizeNameInputValue);
  elements.openChangeEmailBtn?.addEventListener("click", openChangeEmailModal);
  elements.changeEmailForm?.addEventListener("submit", handleChangeEmail);
  elements.cancelChangeEmailBtn?.addEventListener("click", closeChangeEmailModal);
  elements.openChangePasswordBtn?.addEventListener("click", openChangePasswordModal);
  elements.changePasswordForm?.addEventListener("submit", handleChangePassword);
  elements.cancelChangePasswordBtn?.addEventListener("click", closeChangePasswordModal);
  elements.openDeleteAccountBtn?.addEventListener("click", openDeleteAccountModal);
  elements.cancelDeleteAccountBtn?.addEventListener("click", closeDeleteAccountModal);
  elements.continueDeleteAccountBtn?.addEventListener("click", showDeleteAccountConfirmStep);
  elements.backDeleteAccountBtn?.addEventListener("click", showDeleteAccountIntroStep);
  elements.confirmDeleteAccountBtn?.addEventListener("click", handleDeleteAccount);
  elements.deleteAccountPassword?.addEventListener("input", clearDeleteAccountFeedback);
  elements.newEmailInput?.addEventListener("input", clearChangeEmailFeedback);
  elements.currentPasswordInput?.addEventListener("input", clearChangePasswordFeedback);
  elements.newPasswordInput?.addEventListener("input", () => {
    clearChangePasswordFeedback();
    validateChangePasswordFields();
  });
  elements.confirmNewPasswordInput?.addEventListener("input", () => {
    clearChangePasswordFeedback();
    validateChangePasswordFields();
  });

  elements.changeEmailModal?.addEventListener("click", (event) => {
    if (event.target === elements.changeEmailModal && !state.changeEmailSubmitting) {
      closeChangeEmailModal();
    }
  });

  elements.changePasswordModal?.addEventListener("click", (event) => {
    if (event.target === elements.changePasswordModal && !state.changePasswordSubmitting) {
      closeChangePasswordModal();
    }
  });

  elements.deleteAccountModal?.addEventListener("click", (event) => {
    if (event.target === elements.deleteAccountModal && !state.deleteAccountSubmitting) {
      closeDeleteAccountModal();
    }
  });

  setupPasswordToggles();
  setupAvatarEditing();
}

function init() {
  syncAvatarPreview();
  setupEvents();
  loadCurrentUserProfile();
}

init();
