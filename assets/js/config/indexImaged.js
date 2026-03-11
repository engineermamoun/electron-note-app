const { ipcRenderer } = require("electron");
const fs = require("fs");
const connection = require("./connection");

let newImaged = document.querySelector(".todo--images .add-new-task");
newImaged.addEventListener("click", () => {
  ipcRenderer.send("new-imaged");
});
ipcRenderer.on("add-imaged-task", function (e, note, imgURL) {
  addImagedTask(note, imgURL);
});

function addImagedTask(note, imgURL) {
  connection
    .insert({
      into: "imaged",
      values: [
        {
          note: note,
          img_uri: imgURL,
        },
      ],
    })
    .then(() => showImaged());
}

function deleteImagedTask(taskId, taskimguri) {
  if (taskimguri) {
    fs.unlink(taskimguri, (err) => {
      if (err) {
        console.log(err);
        return;
      }
    });
  }
  return connection
    .remove({
      from: "imaged",
      where: {
        id: taskId,
      },
    })
    .then(() => showImaged());
}
function updateImagedTask(taskId, taskValue) {
  return connection
    .update({
      in: "imaged",
      where: {
        id: taskId,
      },
      set: {
        note: taskValue,
      },
    })
    .then(() => showImaged());
}

function showImaged() {
  let clearImagedBtn = document.querySelector(".todo--images .clear-all");

  let imagedList = document.querySelector(".todo--images__list");
  imagedList.innerHTML = "";

  connection
    .select({
      from: "imaged",
    })
    .then((tasks) => {
      if (tasks.length === 0) {
        clearImagedBtn.classList.remove("clear-all--show");
        imagedList.innerHTML = "<li class='empty-list'>لا توجد مهام</li>";
      } else {
        clearImagedBtn.classList.add("clear-all--show");
        clearImagedBtn.addEventListener("click", () => {
          return connection
            .remove({
              from: "imaged",
            })
            .then(() => showImaged());
        });

        for (let task of tasks) {
          clearImagedBtn.addEventListener("click", () => {
            fs.unlink(task.img_uri, (err) => {
              if (err) {
                console.log(err);
                return;
              }
            }).then(() => showImaged());
          });

          let listItem = document.createElement("li");
          listItem.classList.add("image-task-item"); // Add class for styling
          let taskInput = document.createElement("input");

          let imageHolder = document.createElement("div");
          imageHolder.classList.add("image-container-modern"); // Add class for styling
          let taskImage = document.createElement("img");

          let deleteBtn = document.createElement("button");
          let noteContentHolder = document.createElement("div");
          noteContentHolder.classList.add("content-holder"); // Add class for styling
          let buttonsHolder = document.createElement("div");
          // buttonsHolder.classList.add("buttons-holder");
          buttonsHolder.classList.add("buttons-holder", "buttons-modern"); // Add modern class

          let exportBtn = document.createElement("button");

          let updateBtn = document.createElement("button");
          taskInput.value = task.note;
          taskInput.classList.add("task-input"); // Add class for styling
          taskImage.setAttribute("src", task.img_uri);
          taskImage.classList.add("task-image-modern"); // Add class for styling

          // Add error handling for broken images
          taskImage.onerror = function () {
            this.src = "./assets/images/icons.png"; // Add a placeholder image
            this.classList.add("image-error");
          };

          deleteBtn.innerHTML = "حذف <i class='fas fa-trash-alt'></i>";
          deleteBtn.addEventListener("click", () => {
            deleteImagedTask(task.id, task.img_uri);
          });

          updateBtn.innerHTML = "تحديث <i class='fas fa-cloud-upload-alt'></i>";
          updateBtn.addEventListener("click", () => {
            updateImagedTask(task.id, taskInput.value);
          });

          exportBtn.innerHTML = "تصدير <i class='fas fa-file-export'></i>";
          exportBtn.addEventListener("click", () => {
            ipcRenderer.send("create-txt", task.note);
          });

          buttonsHolder.appendChild(deleteBtn);
          buttonsHolder.appendChild(updateBtn);
          buttonsHolder.appendChild(exportBtn);
          noteContentHolder.appendChild(buttonsHolder);
          imageHolder.appendChild(taskImage);
          listItem.appendChild(noteContentHolder);
          listItem.appendChild(imageHolder);
          listItem.appendChild(taskInput);
          imagedList.appendChild(listItem);
        }
      }
    });
}
showImaged();
