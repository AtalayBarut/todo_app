// Task management
class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.taskForm = document.getElementById('taskForm');
        this.tasksList = document.getElementById('tasksList');
        this.taskTemplate = document.getElementById('taskTemplate');
        this.editModal = document.getElementById('editTaskModal');
        this.editForm = document.getElementById('editTaskForm');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        
        this.init();
    }

    init() {
        console.log('Initializing TodoApp...');
        this.taskForm.addEventListener('submit', (e) => this.handleAddTask(e));
        this.editForm.addEventListener('submit', (e) => this.handleEditFormSubmit(e));
        this.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        this.renderTasks();
        console.log('TodoApp initialized');
    }

    handleAddTask(e) {
        e.preventDefault();
        console.log('Adding task...');
        
        try {
            const taskInput = document.getElementById('taskInput');
            const taskDate = document.getElementById('taskDate');
            const taskTime = document.getElementById('taskTime');
            const taskStatus = document.getElementById('taskStatus');
            const taskCompletion = document.getElementById('taskCompletion');

            // Validate inputs
            if (!taskInput.value || !taskDate.value || !taskTime.value) {
                console.log('Missing required fields');
                return;
            }

            const status = taskStatus.value || 'ongoing';
            // Set completion to 100 if status is completed, otherwise use the input value
            const completion = status === 'completed' ? 100 : (parseInt(taskCompletion.value) || 0);

            const task = {
                id: Date.now(),
                text: taskInput.value.trim(),
                date: taskDate.value,
                time: taskTime.value,
                status: status,
                completion: completion,
                completed: status === 'completed'
            };

            console.log('New task:', task);

            this.tasks.push(task);
            this.saveTasks();
            this.renderTasks();
            
            // Reset form
            taskInput.value = '';
            taskDate.value = '';
            taskTime.value = '';
            taskStatus.value = 'ongoing';
            taskCompletion.value = '0';
            console.log('Task added successfully');
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }

    handleEditTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        // Populate the edit form
        document.getElementById('editTaskId').value = task.id;
        document.getElementById('editTaskInput').value = task.text;
        document.getElementById('editTaskDate').value = task.date;
        document.getElementById('editTaskTime').value = task.time;
        document.getElementById('editTaskStatus').value = task.status;
        document.getElementById('editTaskCompletion').value = task.completion;

        // Show the modal
        this.editModal.classList.remove('hidden');
        this.editModal.classList.add('flex');

        // Add event listener for status change
        const statusSelect = document.getElementById('editTaskStatus');
        const completionInput = document.getElementById('editTaskCompletion');
        
        statusSelect.addEventListener('change', () => {
            if (statusSelect.value === 'completed') {
                completionInput.value = '100';
                completionInput.disabled = true;
            } else {
                completionInput.disabled = false;
            }
        });

        // Initial check for completion field
        if (task.status === 'completed') {
            completionInput.disabled = true;
        }
    }

    closeEditModal() {
        this.editModal.classList.add('hidden');
        this.editModal.classList.remove('flex');
    }

    handleEditFormSubmit(e) {
        e.preventDefault();
        
        const taskId = parseInt(document.getElementById('editTaskId').value);
        const task = this.tasks.find(t => t.id === taskId);
        
        if (!task) return;

        const newStatus = document.getElementById('editTaskStatus').value;
        const newCompletion = newStatus === 'completed' ? 100 : parseInt(document.getElementById('editTaskCompletion').value);

        task.text = document.getElementById('editTaskInput').value.trim();
        task.date = document.getElementById('editTaskDate').value;
        task.time = document.getElementById('editTaskTime').value;
        task.status = newStatus;
        task.completion = newCompletion;
        task.completed = newStatus === 'completed';

        this.saveTasks();
        this.renderTasks();
        this.closeEditModal();
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
            
            // Update status and completion when checked
            if (task.completed) {
                task.status = 'completed';
                task.completion = 100;
            } else {
                // When unchecking, revert to ongoing status and keep the previous completion
                task.status = 'ongoing';
            }
            
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

            // Add status indicator with proper checks
            const taskStatus = taskItem.querySelector('.task-status');
            const status = task.status || 'ongoing';
            taskStatus.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            
            // Apply status classes safely
            const statusClass = this.getStatusClass(status);
            statusClass.split(' ').forEach(className => {
                taskStatus.classList.add(className);
            });

            // Add completion bar and text with proper checks
            const taskCompletionBar = taskItem.querySelector('.task-completion-bar');
            const completion = task.completion || 0;
            taskCompletionBar.style.width = `${completion}%`;
            
            const taskCompletionText = taskItem.querySelector('.task-completion-text');
            taskCompletionText.textContent = `${completion}%`;

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

    getStatusClass(status) {
        // Remove any existing status classes first
        const statusClasses = {
            'ongoing': 'bg-yellow-100 text-yellow-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
            'onhold': 'bg-gray-100 text-gray-800'
        };
        return statusClasses[status] || statusClasses['ongoing'];
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating TodoApp...');
    new TodoApp();
}); 