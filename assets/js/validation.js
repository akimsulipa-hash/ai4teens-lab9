// ===== Регулярні вирази =====
// Телефон: +380 і рівно 9 цифр
const REGEX_PHONE = /^\+380\d{9}$/;
// Email: спрощений формат (текст@текст.текст без пробілів)
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ===== Елементи DOM =====
const form = document.getElementById('feedbackForm');
const nameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const messageInput = document.getElementById('message');
const agreementInput = document.getElementById('agreement');
const modal = document.getElementById('successModal');
const closeModalBtn = document.getElementById('closeModal');
const submitBtn = form.querySelector('button[type="submit"]');

// Позначаємо поля, з якими користувач уже взаємодіяв
const touched = new Set();

// ===== Допоміжні функції UI =====

// Показати помилку: червона рамка, текст під полем, aria-invalid
function showError(input, message) {
  const errorEl = document.getElementById(input.id + 'Error');
  input.classList.remove('border-gray-300', 'border-green-500');
  input.classList.add('border-red-500');
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', errorEl.id);
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

// Показати успіх: зелена рамка, помилку прибрати
function showSuccess(input) {
  const errorEl = document.getElementById(input.id + 'Error');
  input.classList.remove('border-gray-300', 'border-red-500');
  input.classList.add('border-green-500');
  input.setAttribute('aria-invalid', 'false');
  input.removeAttribute('aria-describedby');
  errorEl.textContent = '';
  errorEl.classList.add('hidden');
}

// Скинути стан поля до нейтрального (нічого не показувати)
function clearError(input) {
  const errorEl = document.getElementById(input.id + 'Error');
  input.classList.remove('border-red-500', 'border-green-500');
  input.classList.add('border-gray-300');
  input.setAttribute('aria-invalid', 'false');
  input.removeAttribute('aria-describedby');
  errorEl.textContent = '';
  errorEl.classList.add('hidden');
}

// ===== Функції валідації полів =====
// Кожна повертає true, якщо поле коректне, і показує відповідний стан

function validateName() {
  const value = nameInput.value.trim();
  if (value.length < 2) {
    showError(nameInput, 'Введіть щонайменше 2 символи');
    return false;
  }
  showSuccess(nameInput);
  return true;
}

function validateEmail() {
  const value = emailInput.value.trim();
  if (!REGEX_EMAIL.test(value)) {
    showError(emailInput, 'Введіть коректну електронну адресу');
    return false;
  }
  showSuccess(emailInput);
  return true;
}

function validatePhone() {
  const value = phoneInput.value.trim();
  if (!REGEX_PHONE.test(value)) {
    showError(phoneInput, 'Формат: +380XXXXXXXXX (9 цифр після +380)');
    return false;
  }
  showSuccess(phoneInput);
  return true;
}

function validateMessage() {
  const value = messageInput.value.trim();
  if (value.length < 10) {
    showError(messageInput, 'Мінімум 10 символів');
    return false;
  }
  showSuccess(messageInput);
  return true;
}

function validateAgreement() {
  if (!agreementInput.checked) {
    showError(agreementInput, 'Потрібна згода з політикою конфіденційності');
    return false;
  }
  showSuccess(agreementInput);
  return true;
}

// Карта: поле -> функція його перевірки
const validators = {
  username: validateName,
  email: validateEmail,
  phone: validatePhone,
  message: validateMessage,
  agreement: validateAgreement
};

// ===== Динамічна валідація =====
// Перевіряємо поле лише після того, як користувач з ним взаємодіяв

Object.keys(validators).forEach((id) => {
  const input = document.getElementById(id);
  const eventType = input.type === 'checkbox' ? 'change' : 'input';

  // Під час введення оновлюємо стан, якщо поле вже "торкнуте"
  input.addEventListener(eventType, () => {
    if (touched.has(id)) validators[id]();
  });

  // Після виходу з поля — фінальна перевірка
  input.addEventListener('blur', () => {
    touched.add(id);
    validators[id]();
  });
});

// ===== Надсилання форми =====

form.addEventListener('submit', (event) => {
  // Не даємо браузеру перезавантажити сторінку
  event.preventDefault();

  // Позначаємо всі поля як "торкнуті", щоб показати всі помилки
  Object.keys(validators).forEach((id) => touched.add(id));

  // Перевіряємо всі поля (через масив, щоб не зупинитися на першій помилці)
  const results = Object.values(validators).map((validate) => validate());
  const isFormValid = results.every(Boolean);

  if (!isFormValid) {
    // Переносимо фокус на перше поле з помилкою
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  // Імітація надсилання: сервера немає, тому лише показуємо модальне вікно
  openModal();
  form.reset();
  Object.keys(validators).forEach((id) => clearError(document.getElementById(id)));
  touched.clear();
});

// ===== Модальне вікно =====

function openModal() {
  modal.classList.remove('hidden');
  closeModalBtn.focus();
}

function closeModal() {
  modal.classList.add('hidden');
  submitBtn.focus();
}

closeModalBtn.addEventListener('click', closeModal);

// Закриття клавішею Escape
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});