const { ipcRenderer } = require("electron");
const fs = require("fs");
const connection = require("./connection");

let newImaged = document.querySelector(".todo--images .add-new-imaged");
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
        imagedList.innerHTML = "<li class='empty-list'>لا توجد مهام</li>";
      } else {
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
          let taskInput = document.createElement("input");

          let imageHolder = document.createElement("div");
          let taskImage = document.createElement("img");

          let deleteBtn = document.createElement("button");
          let noteContentHolder = document.createElement("div");
          let buttonsHolder = document.createElement("div");
          buttonsHolder.classList.add("buttons-holder");

          let exportBtn = document.createElement("button");

          let updateBtn = document.createElement("button");
          taskInput.value = task.note;
          taskImage.setAttribute("src", task.img_uri);

          deleteBtn.innerHTML = "حذق";
          deleteBtn.addEventListener("click", () => {
            deleteImagedTask(task.id, task.img_uri);
          });

          updateBtn.innerHTML = "تحديث";
          updateBtn.addEventListener("click", () => {
            updateImagedTask(task.id, taskInput.value);
          });

          exportBtn.innerHTML = "تصدير";
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
