const errorResponse = document.querySelector("#showError");
const passwordResetForm = document.querySelector("#passwordResetForm");
const emailInput = document.querySelector("#email");
const loader = document.querySelector('#loader')
async function catchError() {
  loader.classList.remove('hidden'); 

  let email = emailInput.value.trim();

  try {
    const res = await fetch("/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await res.json();

    loader.classList.add('hidden'); 
    if (!result.success) {
      errorResponse.classList.remove("hidden");
      errorResponse.innerText = result.msg;

      setTimeout(() => {
        errorResponse.classList.add("hidden");
      }, 4000);
    } else {
      errorResponse.classList.remove("hidden", "text-red-500");
      errorResponse.classList.add("text-green-700");
      errorResponse.innerText = result.msg;

      setTimeout(() => {
        errorResponse.classList.remove("text-green-700");
        errorResponse.classList.add("hidden", "text-red-500");
        window.location.href = `/auth/verify-otp/${email}`;
      }, 4000);
    }
  } catch (err) {
    loader.classList.add('hidden'); 
    errorResponse.classList.remove("hidden");
    errorResponse.innerText = "Something went wrong, please try again!";
  }
}

passwordResetForm.addEventListener("submit", (e) => {
  e.preventDefault();
  catchError();
});
