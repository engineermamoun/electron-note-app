const { ipcRenderer } = require("electron");

const connection = require("./connection");

let newTimed = document.querySelector(".todo--timed .add-new-task");
newTimed.addEventListener("click", () => {
  ipcRenderer.send("new-timed");
});

ipcRenderer.on("add-timed-note", function (e, note, notificationDate) {
  addTimedTask(note, notificationDate);
});

function addTimedTask(note, notificationDate) {
  connection
    .insert({
      into: "timed",
      values: [
        {
          note: note,
          pick_status: 0,
          pick_time: notificationDate,
        },
      ],
    })
    .then(() => showTimed());
}

function deleteTask(taskId) {
  return connection
    .remove({
      from: "timed",
      where: {
        id: taskId,
      },
    })
    .then(() => showTimed());
}

function updateTask(taskId, taskValue) {
  return connection
    .update({
      in: "timed",
      where: {
        id: taskId,
      },
      set: {
        note: taskValue,
      },
    })
    .then(() => showTimed());
}

function showTimed() {
  let clearTimedBtn = document.querySelector(".todo--timed .clear-all");
  let timedList = document.querySelector(".todo--timed__list");
  timedList.innerHTML = "";
  connection
    .select({
      from: "timed",
    })
    .then((tasks) => {
      if (tasks.length === 0) {
        clearTimedBtn.classList.remove("clear-all--show");
        timedList.innerHTML = "<li class='empty-list'>لا توجد مهمام</li>";
      } else {
        clearTimedBtn.classList.add("clear-all--show");
        clearTimedBtn.addEventListener("click", () => {
          return connection
            .remove({
              from: "timed",
            })
            .then(() => showTimed());
        });

        for (let task of tasks) {
          let listItem = document.createElement("li");
          let taskInput = document.createElement("input");
          let timeHolder = document.createElement("div");
          let deleteBtn = document.createElement("button");
          let updateBtn = document.createElement("button");
          let exportBtn = document.createElement("button");
          let buttonsHolder = document.createElement("div");

          timeHolder.classList.add("time-holder");
          buttonsHolder.classList.add("buttons-holder");
          deleteBtn.innerHTML = "حذف <i class='fas fa-trash-alt'></i>";;
          deleteBtn.addEventListener("click", () => {
            deleteTask(task.id);
          });

          updateBtn.innerHTML = "تحديث <i class='fas fa-cloud-upload-alt'></i>";
          updateBtn.addEventListener("click", () => {
            updateTask(task.id, taskInput.value);
          });

          exportBtn.innerHTML = "تصدير <i class='fas fa-file-export'></i>";
          exportBtn.addEventListener("click", () => {
            ipcRenderer.send("create-txt", task.note);
          });

          if (task.pick_status === 1) {
            timeHolder.innerHTML =
              "جري التنبيه في الساعة" + task.pick_time.toLocaleTimeString();
          } else {
            timeHolder.innerHTML =
              "يتم التنبيه في الساعة" + task.pick_time.toLocaleTimeString();
          }

          let checkInterval = setInterval(function () {
            let currentDate = new Date();
            if (task.pick_time.toString() === currentDate.toString()) {
              connection
                .update({
                  in: "timed",
                  where: {
                    id: task.id,
                  },
                  set: {
                    pick_status: 1,
                  },
                })
                .then(() => showTimed());
              ipcRenderer.send("notify", task.note);

              clearInterval(checkInterval);
            }
          }, 1000);

          taskInput.value = task.note;
          buttonsHolder.appendChild(deleteBtn);
          buttonsHolder.appendChild(updateBtn);
          buttonsHolder.appendChild(exportBtn);
          listItem.appendChild(taskInput);
          listItem.appendChild(timeHolder);
          listItem.appendChild(buttonsHolder);
          timedList.appendChild(listItem);
        }
      }
    });
}

showTimed();
