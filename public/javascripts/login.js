const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const loginForm = document.querySelector("#loginForm");
const showMessages = document.querySelector("#showErrorMessage");

async function handleLogin() {
  let email = emailInput.value.trim();
  let password = passwordInput.value.trim();

  const result = await fetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const response = await result.json();

  if (response.success) {
    console.log("hiii");
    window.location.href = "/profile";
  } else {
    showMessages.classList.remove("hidden");
    showMessages.innerText = response.msg;

    setTimeout(() => {
      showMessages.classList.add("hidden");
    }, 3000);
  }
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleLogin();
});
