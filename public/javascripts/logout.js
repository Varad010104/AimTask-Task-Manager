const logoutButton = document.querySelector('#profile_Logout')
logoutButton.addEventListener('click',async ()=>{
    console.log("Hiii")
    const response = await fetch('/auth/logout', {
        method: 'POST',
        headers:{
            "Content-Type": "application/json",
        }
    })

    //Converting the result into the JSON
    const result = await response.json();
    if(result.success){
        window.location.href = result.redirect;
    }

})