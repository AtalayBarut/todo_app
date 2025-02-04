// Task management
class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.taskForm = document.getElementById('taskForm');
        this.tasksList = document.getElementById('tasksList');
        this.taskTemplate = document.getElementById('taskTemplate');
        
        this.init();
    }

    init() {
        this.taskForm.addEventListener('submit', (e) => this.handleAddTask(e));
        this.renderTasks();
    }

    handleAddTask(e) {
        e.preventDefault();
        
        const taskInput = document.getElementById('taskInput');
        const taskDate = document.getElementById('taskDate');
        const taskTime = document.getElementById('taskTime');

        const task = {
            id: Date.now(),
            text: taskInput.value,
            date: taskDate.value,
            time: taskTime.value,
            completed: false
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        
        taskInput.value = '';
        taskDate.value = '';
        taskTime.value = '';
    }

    handleEditTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const newText = prompt('Edit task:', task.text);
        if (newText === null) return;

        task.text = newText.trim();
        this.saveTasks();
        this.renderTasks();
    }

    handleDeleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
    }

    handleToggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    formatDateTime(date, time) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        const dateTime = new Date(`${date}T${time}`);
        return dateTime.toLocaleString('en-US', options);
    }

    renderTasks() {
        this.tasksList.innerHTML = '';
        
        this.tasks.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });

        this.tasks.forEach(task => {
            const taskElement = this.taskTemplate.content.cloneNode(true);
            const taskItem = taskElement.querySelector('.task-item');
            
            if (task.completed) {
                taskItem.classList.add('completed');
            }

            const checkbox = taskItem.querySelector('.task-checkbox');
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => this.handleToggleTask(task.id));

            const taskText = taskItem.querySelector('.task-text');
            taskText.textContent = task.text;

            const taskDateTime = taskItem.querySelector('.task-datetime');
            taskDateTime.textContent = this.formatDateTime(task.date, task.time);

            const editBtn = taskItem.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => this.handleEditTask(task.id));

            const deleteBtn = taskItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => this.handleDeleteTask(task.id));

            this.tasksList.appendChild(taskElement);
        });
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
}); 