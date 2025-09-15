const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirmPassword");
const errorMssages = document.querySelector('#errorMsg');


async function signupValidate() {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  if (name === "") {
    alert("Please enter the name");
  } else if (email === "") {
    alert("Please enter the email");
  } else if (password === "") {
    alert("Please enter the password");
  } else if (password !== confirmPassword) {
    alert("Confirm password does not match");
  }else if(password.length <= 5){
    alert("Length of the password should be greater than 5");
  } else {
    console.log("signup Succefull");
  }
  const res = await fetch("/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });

  const result = await res.json();

  if (result.success) {
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.6 },
    });
    document.getElementById("successModal").classList.remove("hidden");
    const content = document.getElementById("successContent");
    content.classList.remove("opacity-0", "scale-90");
    content.classList.add("opacity-100", "scale-100");

    setTimeout(() => {
    content.classList.remove("opacity-100", "scale-100");
    content.classList.add("opacity-0", "scale-90");
    document.getElementById("successModal").classList.add("hidden");
      window.location.href = "/auth/login";
    }, 3000);
  } else {
    errorMssages.classList.remove('hidden');
    errorMssages.innerText = result.msg;
    setTimeout(()=>{
      errorMssages.classList.add('hidden');
    },6000)
  }
}

document
  .querySelector("#signupForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    signupValidate();
  });
