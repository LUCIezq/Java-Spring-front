const dialog = document.getElementById('myDialog');
const openButton = document.getElementById('openDialog');
const closeModal = document.getElementById('closeModal');

openButton.addEventListener('click',()=>{
    dialog.showModal();
})

closeModal.addEventListener('click',()=>{
    dialog.close();
})



