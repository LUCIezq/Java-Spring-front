const formulario = document.getElementById('form');
const mainList = document.getElementById('mainList');


//--> Llamo al formulario
formulario.addEventListener('submit', (e) => {
    e.preventDefault(); //--> prevengo el comportamiento default
    guardarTarea();// --> Ejecuto logica
})

const guardarTarea = async () => {
    //--> Obtengo los campos del form
    let campos = {
        title: document.getElementById('name').value,
        description: document.getElementById('description').value
    };

    //--> Apunto a la peticion que quiero mandarle los datos
    const peticion = await fetch("http://localhost:8080/task",

        {
            method: "POST", // --> Tipo de metodo HTTP
            headers: {
                //-->Estos headers le dicen al servidor qué tipo de datos estás enviando y qué tipo de respuesta esperás recibir.
                "Accept": "application/json", //-> 
                "Content-Type": "application/json",
            },

            body: JSON.stringify(campos) // --> le mandamos al cuerpo de la peticion los campos del formulario 
        })
    mostrarTareas();
    limpiarInputs();
}

function limpiarInputs() {
    document.getElementById('name').value = '';
    document.getElementById('description').value = '';
}

const mostrarTareas = async () => {
    try {
        const peticion = await fetch("http://localhost:8080/task");
        const data = await peticion.json();

        if (!peticion.ok) {
            throw new Error(`Error al guardar la tarea: ${peticion.status}`);
        }

        generarContenido(data);
    } catch (error) {
        console.log("Error: ", error);
    }
    statusUl();
    progreso();
    completarTarea();
}

const generarContenido = (data) => {
    const fragment = document.createDocumentFragment();

    mainList.innerHTML = '';
    data.forEach(element => {
        const div = document.createElement('div');
        div.innerHTML = generarContenidoHtml(element);
        fragment.appendChild(div);
        div.classList.add('task__container');
    })
    mainList.appendChild(fragment);
}

const generarContenidoHtml = (element) => {
    return `
            <div class ='task__left'>
                    <label class="container__input">
                        <input type="checkbox" id="${element.id}">
                        <div class="checkmark"></div>
                    </label>                
                    <div class = 'task__detail'>
                    <form method = 'post' id = 'formUpdate${element.id}' class ='form__update'>
                        <div class = 'form__update-inputs'>
                            <input type = 'text' value ="${element.title}" disabled id ="title${element.id}" class='task__title task__input'></input>
                            <input type = 'text' value ="${element.description}" disabled id ="description${element.id}" class='task__description task__input '></input>
                        </div>
                        <button type='submit'disabled id='buttonUpdate${element.id}' class = 'hidden'>Actualizar</button>
                    </form>
                </div>
            </div>

            <button id='moreOptions${element.id}' class = 'button__options' onclick= 'mostrarModal(${element.id})'>
                <img src='./more_vert_24dp_4B4949_FILL0_wght400_GRAD0_opsz24.svg'>
            </button>

            <div class = 'task__container-img' id ='taskContainer-${element.id}' >
                <div class ='task__edit'>
                    <button id='updateTask' class = 'task__button'  onclick = "editarTarea(${element.id})">
                        <img  src = './edit.svg'>
                    </button>
                    <span onclick = "editarTarea(${element.id})" >Edit</span>
                </div>    
            <div class = 'task__delete'>
                    <button class = 'task__button'  onclick = "borrarTarea(${element.id})">
                        <img  src = './delete.svg'>
                    </button>
                    <span onclick= "borrarTarea(${element.id})">Delete</span>
                </div>
            </div>
            `;
}

function mostrarModal(id) {
    const modals = document.querySelectorAll('.task__container-img');
    const active = Array.from(modals).find(item => item.classList.contains('visible__modal'));
    const modal = document.getElementById(`taskContainer-${id}`);

    if (active && active != modal) {
        active.classList.remove('visible__modal')
    }

    modal.classList.toggle('visible__modal');
}

const editarTarea = (id) => {
    const title = document.getElementById(`title${id}`);
    const description = document.getElementById(`description${id}`);
    const button = document.getElementById(`buttonUpdate${id}`);
    const formUpdate = document.getElementById(`formUpdate${id}`);
    const inputs = document.querySelectorAll(`#formUpdate${id} input`);

    const titleValue = title.value;
    const descriptionValue = description.value;

    formUpdate.addEventListener('submit', (e) => {
        e.preventDefault();
        peticionUpdate(id);
    })

    button.classList.remove('hidden');
    activarInputs(title, description);

    inputs.forEach(input => {
        input.addEventListener('keyup', () => {
            if (titleValue != title.value || descriptionValue != description.value) {
                button.disabled = false;
                button.classList.add('active__button');
            } else {
                button.disabled = true;
                button.classList.remove('active__button');
            }
        })
    })

}

function activarInputs(title, description) {
    title.disabled = false;
    description.disabled = false;
    title.focus();
    title.classList.add('active');
    description.classList.add('active');
}

const obtenerTareas = async () => {
    const response = await fetch("http://localhost:8080/task");
    const data = await response.json();

    return data;
}

const progreso = async () => {
    const containerInformation = document.getElementById("containerInformation");
    const tareas = await obtenerTareas();
    const tareasCompletadas = await obtenerTareasCompletadas();

    if (tareas.length > 0) {
        containerInformation.textContent = `${await obtenerTareasCompletadas()} de ${tareas.length} tareas completadas`;
    } else {
        containerInformation.textContent = '';
    }
}
const obtenerTareasCompletadas = async () => {
    const response = await obtenerTareas();
    return response.filter(element => element.completed).length;
}

const completarTarea = async () => {
    const inputStatus = document.querySelectorAll(".task__left input[type = 'checkbox']");

    inputStatus.forEach(input => {

        const id = parseInt(input.getAttribute('id'));
        input.addEventListener('change', async () => {

            const response = await fetch(`http://localhost:8080/task/${id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({ completed: input.checked })
                })
            progreso();
            const inputValue = document.getElementById(`title${id}`);
            input.checked ? inputValue.classList.add('completed') : inputValue.classList.remove('completed');
        })
    })
}

const generarContenidoP = () => {
    return `<p>Tienes <span>0</span>de <span>0</span>tareas por completar.</p>`;
}

const peticionUpdate = async (id) => {
    let campos = {
        id: id,
        title: document.getElementById(`title${id}`).value,
        description: document.getElementById(`description${id}`).value,
        completed: false
    }

    try {
        const peticionUpdate = await fetch(`http://localhost:8080/task/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(campos)
            });
    } catch (error) {
        console.error('Error al actualizar:', error);
    }

    mostrarTareas();
}

const borrarTarea = async (id) => {
    try {
        const peticion = await fetch(`http://localhost:8080/task/${id}`,
            {
                method: "DELETE",
            })
        if (peticion.ok) {
            console.log('Tarea eliminada');
        }
    } catch (error) {
        console.log("Error al eliminar: ", error);
    }

    mostrarTareas();
}

const statusUl = () => {
    const mainStatus = document.querySelector('.main__status');
    mainList.innerHTML != '' ? mainStatus.classList.add('hidden') : mainStatus.classList.remove('hidden')
}

completarTarea();
mostrarTareas();
