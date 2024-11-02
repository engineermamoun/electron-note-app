const { ipcRenderer } = require("electron");

const connection = require("./connection");

let newNormal = document.querySelector(".todo--normal .add-new-task");
newNormal.addEventListener("click", () => {
  ipcRenderer.send("new-nromal");
});
ipcRenderer.on("add-normal-task", function (e, task) {
  addNormalTask(task);
});

function addNormalTask(task) {
  connection
    .insert({
      into: "tasks",
      values: [
        {
          note: task,
        },
      ],
    })
    .then(() => {
  
      showNormal();
    })
    .catch((err) => {
      console.error("Error adding task:", err);
    });
}
function deleteTask(taskId) {
  return connection
    .remove({
      from: "tasks",
      where: {
        id: taskId,
      },
    })
    .then(() => showNormal());
}
function updateTask(taskId, taskValue) {
  return connection
    .update({
      in: "tasks",
      where: {
        id: taskId,
      },
      set: {
        note: taskValue,
      },
    })
    .then(() => showNormal());
}

function showNormal() {
  let clearNormalBtn = document.querySelector(".todo--normal .clear-all");
  let normalTasksList = document.querySelector(".todo--normal__list");
  normalTasksList.innerHTML = "";
  connection
    .select({
      from: "tasks",
    })
    .then((tasks) => {
      if (tasks.length === 0) {
        clearNormalBtn.classList.remove("clear-all--show");
        normalTasksList.innerHTML = "<li class='empty-list'>لا توجد مهام</li>";
      } else {
        clearNormalBtn.classList.add("clear-all--show");
        clearNormalBtn.addEventListener("click", () => {
          return connection
            .remove({
              from: "tasks",
            })
            .then(() => showNormal());
        });
        for (let task of tasks) {
          let listItem = document.createElement("li");
          let taskInput = document.createElement("input");
          let deleteBtn = document.createElement("button");
          let buttonsHolder = document.createElement("div");
          let updateBtn = document.createElement("button");
          let exportBtn = document.createElement("button");

          buttonsHolder.classList.add("buttons-holder");
          deleteBtn.innerHTML = "حذف <i class='fas fa-trash-alt'></i>";
          deleteBtn.addEventListener("click", () => {
            deleteTask(task.id);
          });

          updateBtn.innerHTML ="تحديث <i class='fas fa-cloud-upload-alt'></i>";
          updateBtn.addEventListener("click", () => {
            updateTask(task.id, taskInput.value);
          });

          exportBtn.innerHTML ="تصدير <i class='fas fa-file-export'></i>";
          exportBtn.addEventListener("click", () => {
            ipcRenderer.send("create-txt", task.note);
          });

          taskInput.value = task.note;
          buttonsHolder.appendChild(deleteBtn);
          buttonsHolder.appendChild(updateBtn);
          buttonsHolder.appendChild(exportBtn);
          listItem.appendChild(taskInput);
          listItem.appendChild(buttonsHolder);
          normalTasksList.appendChild(listItem);
        }
      }
    });
}
showNormal();
