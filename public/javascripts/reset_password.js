const userEmail = document.querySelector('#email');
const resetPasswordForm = document.querySelector('#resetPasswordForm')
const userPassword = document.querySelector('#password')
const userConfirmPassword = document.querySelector('#confirmPassword')
const showMessages = document.querySelector('#showError')

async function provideEmail(userPassword,userConfirmPassword,userEmail){
    let email = userEmail.value;
    let password = userPassword.value;
    let confirmPassword = userConfirmPassword.value;

    let result = await fetch('/auth/reset-password',{
        method:"POST",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email,password,confirmPassword})
    })

    return result
}

async function processResetPassword(){
    let data = await provideEmail(userPassword,userConfirmPassword,userEmail);
    let response = await data.json();

    if(response.success){
        confetti({
            particleCount: 200,
            spread: 90,
            origin: { y: 0.6 },
          });
          
          const modal = document.getElementById("successModal");
          const content = document.getElementById("successContent");
          
          
          modal.classList.remove("hidden");
          modal.classList.add("flex","items-center", "justify-center");
          
        
          content.classList.remove("opacity-0", "scale-90");
          content.classList.add("opacity-100", "scale-100");
          
         
          setTimeout(() => {
            content.classList.remove("opacity-100", "scale-100");
            content.classList.add("opacity-0", "scale-90");
          
            // wait for transition (300ms) then hide modal
            setTimeout(() => {
              modal.classList.remove("flex","items-center", "justify-center");
              modal.classList.add("hidden");
              window.location.href = "/auth/login";
            }, 300); // 👈 match with Tailwind `duration-300`
          }, 3000);
          
    }else{
        showMessages.classList.remove('hidden');
        showMessages.innerText = response.msg;

        setTimeout(()=>{
            showMessages.classList.add('hidden');
        },4000)
    }
}
resetPasswordForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    processResetPassword();
})