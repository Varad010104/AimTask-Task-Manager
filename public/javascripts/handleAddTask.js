const titleInput = document.querySelector('#title');

const descriptionInput = document.querySelector('#description');

const priorityInput = document.querySelector('#priority');

const dueDateInput = document.querySelector('#dueDate');

const startTimeInput = document.querySelector('#startTime');

const categoryInput = document.querySelector('#category');

const addTaskForm = document.querySelector('#addTaskForm');

const addMessage = document.querySelector('#errorMsg');

const emailInput = document.querySelector('#emailInput')



async function passingValues(title,description,priority,dueDate,startTime,category,email){

    let response = await fetch(`/tasks/add/${email}`,{
        method:"POST",
        headers:{
            "Content-Type": "application/json",
        },
        body:JSON.stringify({title,description,priority,dueDate,startTime,category}),

    });

    return response;
}
async function handleAddTask(){
    let title = titleInput.value.trim();
    let description = descriptionInput.value.trim();
    let priority = priorityInput.value.trim();
    let dueDate = dueDateInput.value.trim();
    let startTime = startTimeInput.value.trim();
    let category = categoryInput.value.trim();
    let email = emailInput.value.trim();

    let data = await passingValues(title,description,priority,dueDate,startTime,category,email);

    let result = await data.json();

    if(result.success){
        addMessage.classList.remove('text-red-700','hidden');
        addMessage.classList.add('text-green-700')
        addMessage.innerText = result.msg;

        setTimeout(()=>{
            addMessage.classList.remove('text-green-700');
            addMessage.classList.add('text-red-700','hidden');
        },4000)
    }else{
        addMessage.classList.remove('hidden');
        addMessage.innerText = result.msg;

        setTimeout(()=>{
            addMessage.classList.add('hidden');
        },4000)
    }
}

addTaskForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    handleAddTask();
})

