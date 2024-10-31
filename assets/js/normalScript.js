//normalScript.js
const { ipcRenderer } = require("electron");

const form = document.querySelector("form");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const input = document.querySelector("#task").value;
  console.log("Submitting task:", input); // Add this line
  ipcRenderer.send("add-normal-task", input);
});
