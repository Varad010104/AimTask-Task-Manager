const otpForm = document.querySelector('#otpVerificationForm');
const inputs = [...document.querySelectorAll('input[type=text]')];
const submitButton = document.querySelector('button[type=submit]')
const inputemail = document.querySelector('#email');
const showMessages = document.querySelector('#showError')


const handleInput = (e) => {
    const {target} = e;  // event.target -> jis input me type kiya user ne
    const index = inputs.indexOf(target); // ye current input ka index nikal raha hai array 'inputs' me se

    if(target.value){ // agar user ne kuch type kiya (empty nahi hai)
        if(index < inputs.length - 1){  
            // agar abhi last input box pe nahi hai
            inputs[index+1].focus();  
            // to next input pe cursor le jao
        }else{
            submitButton.focus();  
            // agar last input box tha -> to submit button pe cursor le jao
        }
    }
}

const handleKeydown = (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {  
        // agar user ne Delete ya Backspace dabaya
        const index = inputs.indexOf(e.target);  
        // jis input pe dabaya uska index nikal liya

        if (index > 0) {  
            // agar ye pehla input box nahi hai
            inputs[index].value = '';  
            // current box ko empty kar do
            inputs[index - 1].focus();  
            // aur cursor ko pichhle box pe le jao
        }
    }
}



inputs.forEach((input)=>{
    input.addEventListener('input',handleInput);
    input.addEventListener('keydown',handleKeydown);
})

async function dataFetch(input1, input2, input3, input4,inputemail) {
    const val1 = input1.value;
    const val2 = input2.value;
    const val3 = input3.value;
    const val4 = input4.value;
    const email = inputemail.value;

    const res = await fetch('/auth/verify-otp', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ val1, val2,val3,val4,email })
    });
    return res;
}

async function processOtp(){
    
    const responseValue = await dataFetch(...inputs,inputemail)
    const result = await responseValue.json();
    if(result.success){
        showMessages.classList.remove('hidden','text-red-500');
        showMessages.classList.add('text-green-500')
        showMessages.innerText = result.msg;

        setTimeout(()=>{
            showMessages.classList.remove('text-green-500')
            showMessages.classList.add('hidden','text-red-500');
            window.location.href = `/auth/reset-password/${inputemail.value}`
        },2000)
    }else{
        showMessages.classList.remove('hidden');
        showMessages.innerText = result.msg;

        setTimeout(()=>{
            showMessages.classList.add('hidden');
            window.location.href = '/auth/forgot-password';
        },3000)
    }

}

otpForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    processOtp();
})
