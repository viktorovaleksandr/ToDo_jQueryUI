const $addModal = $('.js-add-modal');
const $editModal = $('.js-edit-modal');

const $addTodoModalButton = $('.js-show-add-modal');
const $updateButton = $('.js-update');
const $addButton =  $('.js-add-todo');
const $cancelButton =  $('.js-cancel');

const $todoAddForm = $('form[name="todo"]');
const $todoEditForm = $('form[name="edit-todo"]');

const ulTodoElement = document.querySelector('.js-list-todo');
const $ulTodoElement = $('.js-list-todo');
const $inputEditCheckbox = $('#checkbox-1');

class TodoRequests {
	static sendGetTodosRequest() {
	return fetch('https://jsonplaceholder.typicode.com/todos').then((response) => response.json())
	}

	static sendPostTodoRequest(todo) {
	return fetch('https://jsonplaceholder.typicode.com/todos', {
  		method: 'POST',
  		body: JSON.stringify(todo),
  		headers: {
    		'Content-type': 'application/json; charset=UTF-8',
  		},
	})
  	.then((response) => response.json())
	}

	static sendPutTodoRequest(id,todo) {
	return fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
  		method: 'PUT',
  		body: JSON.stringify(todo),
  		headers: {
    		'Content-type': 'application/json; charset=UTF-8',
  		},
	})
  .then((response) => response.json())
	}

	static sendDeleteTodoRequest(id) {
   	return fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
      method: 'DELETE',
   	});
	}
}

class TodosRopository {
	constructor() {
		this._todos = [];
		this._selectedTodoId = null;
	}
	get selectedTodoId() {
      return this._selectedTodoId;
   }
   set selectedTodoId(selectedTodoId) {
      this._selectedTodoId = selectedTodoId;
   }
	get todos() {
		return this._todos;
	}
	set todos(todos) {
		this._todos = todos;
	}
	getTodoById(id) {
		return this._todos.find(todo => todo.id === id);
	}
}

class TodoUI {
   static initModals() {
      const baseModalOptions = {
         autoOpen: false,
			modal: true,
			hide: {
        		effect: "explode",
        		duration: 800
      	}
      };
      $addModal.dialog(baseModalOptions);
      $editModal.dialog(baseModalOptions);
   }
}

class TodoLogic {
	static getTodos() {
		const promise = TodoRequests.sendGetTodosRequest();
	  		promise.then((todos) => {
	  		renderTodos(todos);
	  		todosRopository.todos = todos;
	  	});
	}

	static createTodos() {
		const todo = getTodoFormData($todoAddForm);
		const promise = TodoRequests.sendPostTodoRequest(todo);
		
		promise.then(todo => { 
			cleanForm($todoAddForm);
			todosRopository.todos.push(todo); 
			renderTodo(todo);
			$addModal.dialog("close");
		});
	}
// ----------------------------------------------------
	static updateTodo() {
      const todo = getTodoFormData($todoEditForm);
      const id = todosRopository.selectedTodoId;
      const $checkbox = $todoEditForm[0]['checkbox-1'];

      const promise = TodoRequests.sendPutTodoRequest(id, todo); 
      promise.then(editTodo => {
         todosRopository.selectedTodoId = null;

         todosRopository.todos = todosRopository.todos.map(todo => {

            if(todo.id === id) {
               return editTodo;
            }
               return todo;
            });

         if ($($checkbox).is(':checked')) editTodo.completed = !editTodo.completed;

         const $listElementId = $(ulTodoElement).find(`li[data-id="${id}"]`);

         $listElementId.replaceWith(renderTodo(editTodo));
         cleanForm($todoEditForm);
         $editModal.dialog('close');
      });
   }
// ----------------------------------------------------
	static deleteTodo(event) {
		const listElement = event.target.closest('li');
		const id = parseInt(listElement.dataset.id, 10);

		const promise = TodoRequests.sendDeleteTodoRequest(id);
		promise.then(() => {
			const $listElementId = $(ulTodoElement).find(`li[data-id="${id}"]`);
			$listElementId.remove();
			todosRopository.todos = todosRopository.todos.filter(todo => todo.id !== id);
		});
	}
}

class TodoEvent {
	static createAddTodoModalEventListener() {
	   $addTodoModalButton.click(() => {
	      $addModal.dialog("open");
	   })
	}

	static createEditUserEventListener() {
	   $updateButton.click(() => {
	      TodoLogic.updateTodo();
	   })
	}

	static createAddTodoEventListener() {
		$addButton.click(function() {
			TodoLogic.createTodos();
		});	
	}

	static createDeleteTodoEventListener() {
		ulTodoElement.addEventListener('click', (event) => {
	   	if(event.target.classList.contains('bi-trash-fill')) {
	      	TodoLogic.deleteTodo(event);
	      	event.stopPropagation();
	    	}
	   },true)
	}

	static createEditTodoEventListener() {	
		$ulTodoElement.click(function(event) {
	   	if($(event.target).closest('li')) {
	      	editTodo(event);
	    	}
	   })
	}

	static createCancelEditEventListener() {
	   $cancelButton.click(() => {
	      cancelEdit();
	   })
	}	
}

// RENDER 

function renderTodos(todos) {
	const lists = todos.map((todos) => createListElement(todos));
}

function renderTodo(todo) {
	const list = createListElement(todo);	
}

function createListElement(todo) {
	const list = document.createElement('li');
	list.className = `list-group-item list-group-item-action d-flex 
	justify-content-between rounded-pill list-group-item-secondary`;
	list.dataset.id = todo.id;
	list.textContent = todo.title;
	const closeButton = `<i class="bi bi-trash-fill"></i>`;
	
	if (todo.completed) {
		list.classList.add('list-group-item-info');
	}  

	ulTodoElement.prepend(list);
	list.insertAdjacentHTML('beforeend', closeButton);
}

// FORM UTILS

function getTodoFormData($form) {
	const formData = new FormData($form[0]);
	return {
   	title: formData.get('name'),
   	completed: false,
   }
}

function editTodo(event) {
   const listElement = event.target.closest('li');
   todosRopository.selectedTodoId = parseInt(listElement.dataset.id, 10);
   const todo = todosRopository.getTodoById(todosRopository.selectedTodoId);

   setEditTodoFormData(todo);
   $editModal.dialog('open');
}

function setEditTodoFormData(todo) {
   $todoEditForm[0].name.value = todo.title;	
   if (todo.completed) {
   	$todoEditForm[0]['checkbox-1'].setAttribute("checked",'');			
   } else {
   	$todoEditForm[0]['checkbox-1'].removeAttribute('checked');
   }   
}	

function cancelEdit() {
   cleanForm($todoEditForm);
   $editModal.dialog('close');
}

function cleanForm($form) {
   $form[0].reset();
}

// INIT TODOS

const todosRopository = new TodosRopository();

function init() {
	TodoUI.initModals();
	TodoLogic.getTodos();
	TodoEvent.createEditUserEventListener()
	TodoEvent.createAddTodoModalEventListener();
	TodoEvent.createAddTodoEventListener();
	TodoEvent.createEditTodoEventListener();
	TodoEvent.createDeleteTodoEventListener();
	TodoEvent.createCancelEditEventListener();
}
init();
