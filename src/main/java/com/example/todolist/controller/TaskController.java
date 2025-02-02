package  com.example.todolist.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.todolist.model.Task;
import com.example.todolist.repository.TaskRepository;


@RestController
@RequestMapping("/api")
public class TaskController{

    @Autowired
    private TaskRepository taskRepository;

    //get all tasks
    @GetMapping("/tasks")
    public List<Task> getAllTasks(){
        return taskRepository.findAll();
    }

    //task by id
    @GetMapping("/tasks/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id){
        Optional<Task> task = taskRepository.findById(id);
        return task.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
    }

    //create task
    @PostMapping("/tasks")
    public Task createTask(@RequestBody Task task){
        return taskRepository.save(task);
    }

    //update task
    @PutMapping("/tasks/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task taskDetails){
        Optional<Task> optionalTask = taskRepository.findById(id);
        if (!optionalTask.isPresent()){
            return ResponseEntity.notFound().build();
        }
        Task task = optionalTask.get();
        task.SetTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        task.setCompleted(taskDetails.isCompleted());
        Task updateTask = taskRepository.save(task);
        return ResponseEntity.ok(updateTask);

    }

    //delete task
    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id){
        Optional<Task> task = taskRepository.findById(id);
        if (!task.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        taskRepository.delete(task.get());
        return ResponseEntity.ok().build();
    }
}