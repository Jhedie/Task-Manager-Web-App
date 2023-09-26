// JavaScript for disabling form submissions if there are invalid fields
(function () {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

// logic for rendering calendar
if (window.location.pathname.endsWith("/calendar.html")) {
  //get tasklist from local storage
  let eventlist = JSON.parse(localStorage.getItem("todotaskslist"))
    ? JSON.parse(localStorage.getItem("todotaskslist"))
    : [];

  //render calendar
  renderCalendar(
    eventlist.map((taskobject) => {
      return {
        title: taskobject.taskname,
        start: taskobject.task_start,
        end: taskobject.task_end,
      };
    })
  );
  function renderCalendar(data) {
    var calendarEl = document.getElementById("calendar");
    var calendar = new FullCalendar.Calendar(calendarEl, {
      themeSystem: "bootstrap5",
      prev: "arrow-left-square-fill",
      next: "arrow-right-square-fill",
      height: "100%",
      editable: true,
      selectable: true,
      businessHours: true,
      dayMaxEvents: true, // allow "more" link when too many events
      events: data,
      buttonText: { today: "Today" },
      titleFormat: { year: "numeric", month: "long" }, // like 'September 2009', for month view
      customButtons: {
        myCustomButton: {
          icon: "calendar3",
          click: function () {
            alert("clicked the custom button!");
          },
        },
      },
      headerToolbar: {
        left: "prev myCustomButton next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
    });

    calendar.render();
  }
}

//logic for rendering stats chart
if (window.location.pathname.endsWith("/statistics.html")) {
  const labels = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const data = {
    labels: labels,
    datasets: [
      {
        label: "AllTasks",
        backgroundColor: "lightgrey",
        borderColor: "lightgrey",
        data: [5, 11, 4, 2, 8, 7, 10],
      },
      {
        label: "Work",
        backgroundColor: "#F7ECDD",
        borderColor: "#F7ECDD",
        data: [1, 10, 1, 0, 6, 2, 2],
      },
      {
        label: "Business",
        backgroundColor: "#F8D8B2",
        borderColor: "#F8D8B2",
        data: [2, 0, 1, 0, 1, 2, 2],
      },
      {
        label: "School",
        backgroundColor: "#FCCAE5",
        borderColor: "#FCCAE5",
        data: [1, 0, 1, 0, 1, 1, 3],
      },
      {
        label: "Personal",
        backgroundColor: "#84CDCA",
        borderColor: "#84CDCA",
        data: [1, 1, 1, 1, 0, 2, 3],
      },
    ],
  };

  const config = {
    type: "line",
    data: data,
    options: { responsive: true },
  };
  const myChart = new Chart(document.getElementById("myChart"), config);
}

if (!window.location.pathname.endsWith("/index.html")) {
  checkUserLoggedIn();
}
function checkUserLoggedIn() {
  //get the name of the current user. If no name store an empty string
  let name = localStorage.getItem("name") ? localStorage.getItem("name") : "";
  //check if user is logged in
  if (name == "") {
    console.log(window.location);
    alert("Login required");
    window.location.pathname = "./index.html";
  }
}

//login system

//implement functions
function loginUser(event) {
  let name, pass;
  name = document.querySelector("#loginUsername").value;
  pass = document.querySelector("#loginPass").value;

  //check if name and password are not empty
  if (name != "" || pass != "") {
    //get all users from local storage
    let all_users = new Array();
    all_users = JSON.parse(localStorage.getItem("users"))
      ? JSON.parse(localStorage.getItem("users"))
      : [];
    //check if the user exists
    if (
      all_users.some((cred) => {
        return cred.username == name && cred.password == pass;
      })
    ) {
      //get the current user logged in
      let current_user = all_users.filter((u) => {
        return u.username == name && u.password == pass;
      })[0];
      localStorage.setItem("name", current_user.username);
      window.location.pathname = "./home.html";
      alert("Login Successful");
    } else {
      alert("Login Failed");
    }
  }
}

function createUser(event) {
  let name, email, password;

  name = document.querySelector("#signin-username").value;
  email = document.querySelector("#signin-email").value;
  password = document.querySelector("#signin-password").value;

  //create an array
  let all_users = new Array();
  //check if users table already exists
  all_users = JSON.parse(localStorage.getItem("users"))
    ? JSON.parse(localStorage.getItem("users"))
    : [];
  //check if user entered already exists in user table otherwise add the new user
  if (
    all_users.some((e) => {
      e.email == email;
    })
  ) {
    alert("User with this email already exists");
  } else {
    all_users.push({
      username: name,
      email: email,
      password: password,
    });
    //store user
    localStorage.setItem("users", JSON.stringify(all_users));
  }
}

//function for Logout
function Logout() {
  localStorage.removeItem("name");
  window.location.href = "index.html";
}

//adding tasks

//get all categories
let todotasks_sect = document.querySelector("#pills-todo .todotasks-section");
let completedtasks_sect = document.querySelector(
  "#pills-completed .completedtasks-section"
);

let todotaskslist;
//when page loads get tasks and add to sections
let completedtaskslist;
let currentTheme = localStorage.getItem("theme")
  ? localStorage.getItem("theme")
  : "";
let linkTheme = document.querySelector("#pagetheme");

if (currentTheme == "dark") {
  linkTheme.setAttribute("href", "css/stylesheet_darkmode.css");
  //themeToggle set checked
  document.querySelector("#toggleThemeSwitch").checked = true;
}
if (currentTheme == "light") {
  // ...otherwise use the .light-theme class
  linkTheme.setAttribute("href", "");
  document.querySelector("#toggleThemeSwitch").checked = false;
}

load();
function load() {
  //obtain stringed format of task from local storage
  let retrievedtaskslist = localStorage.getItem("todotaskslist");
  let retrievedcompletedtaskslist = localStorage.getItem("completedtaskslist");
  // parse retrieved list
  completedtaskslist = JSON.parse(retrievedcompletedtaskslist)
    ? JSON.parse(retrievedcompletedtaskslist)
    : [];
  todotaskslist = JSON.parse(retrievedtaskslist)
    ? JSON.parse(retrievedtaskslist)
    : [];

  renderTaskList();
  renderCompletedTaskList();
}

//save button for saving a task
let createtaskbutton = document.getElementById("savenewtask");
if (createtaskbutton != null) {
  createtaskbutton.addEventListener("click", addTask, false);
}

function addTask(event) {
  //get all task details
  let taskname = document.getElementById("taskname");
  let taskdescription = document.getElementById("taskdescription");
  let task_start = document.getElementById("taskStarttimeDate");
  let task_end = document.getElementById("taskEndtimeDate");
  //get checked value of radio input
  // let task_label = document.querySelector("input[type=radio][name=tasklabel]:checked");

  let label;
  //get all label
  let labels = document.querySelectorAll("input[type=radio][name=tasklabel]");

  //add event for label choice
  labels.forEach((e) => {
    //check if label is checked
    if (e.checked) {
      label = e.value;
    }
  });

  let taskobject = {
    taskname: taskname.value,
    taskdescription: taskdescription.value,
    task_start: task_start.value,
    task_end: task_end.value,
    checkedlabel: label,
  };
  addToTaskList(taskobject);
  todotaskslist.push(taskobject);
  save("todo");

  taskname.value = "";
  taskdescription.value = "";
  task_start.value = "";
  task_end.value = "";
}

//get all buttons on the actions column for a task and add event listeners
//because buttons are dynamically added use event bubbling

let actions_container = document.querySelectorAll(".taskitem");
actions_container.forEach((a) => {
  a.addEventListener(
    "click",
    (event) => {
      let current_click = event.target.classList;

      if (current_click.contains("task-edit-button")) {
        event.target.addEventListener("click", editTask);
        return;
      }
      if (current_click.contains("task-delete-button")) {
        event.target.addEventListener("click", deleteTask);
        return;
      }

      if (current_click.contains("task-mark-complete-button")) {
        event.target.addEventListener("click", markCompleteTask);
        return;
      }
      if (current_click.contains("task-expand-button")) {
        event.target.addEventListener("click", expandTaskView);
        return;
      }
    },
    true
  );
});

function expandTaskView(event) {
  let currentTask = this.parentNode.parentNode.childNodes;
  let currentTaskname = currentTask[0].textContent;
  let currentObject;

  for (let i = 0; i < todotaskslist.length; i++) {
    if (todotaskslist[i].taskname == currentTaskname) {
      currentObject = todotaskslist[i];
    }
  }
  let expandModal = document.querySelector("#expand-task-modal");
  let modal = bootstrap.Modal.getOrCreateInstance(expandModal); // Returns a Bootstrap modal instance
  modal.show();
}
//actions functionality for edit task delete, expand  and mark as completed
function editTask(event) {
  let currentTask = this.parentNode.parentNode.childNodes;
  let currentTaskname = currentTask[0].textContent;
  let currentObject;

  for (let i = 0; i < todotaskslist.length; i++) {
    if (todotaskslist[i].taskname == currentTaskname) {
      currentObject = todotaskslist[i];
    }
  }

  let myModalEl = document.querySelector("#edittaskModalOnTaskpage");
  let modal = bootstrap.Modal.getOrCreateInstance(myModalEl); // Returns a Bootstrap modal instance
  modal.show();

  let taskname = document.getElementById("edittaskname");
  let taskdescription = document.getElementById("edittaskdescription");
  let task_start = document.getElementById("edittaskStarttimeDate");
  let task_end = document.getElementById("edittaskEndtimeDate");

  //radio box and checked value from localstoaage
  // let checkedlabel = currentObject.checkedlabel;
  let labels = document.querySelectorAll(
    "input[type=radio][name=edittasklabel]"
  );
  labels.forEach((e) => {
    if (e.value == currentObject.checkedlabel) {
      e.checked = true;
    }
  });

  taskname.value = currentObject.taskname;
  taskdescription.value = currentObject.taskdescription;
  task_start.value = currentObject.task_start;
  task_end.value = currentObject.task_end;

  //save button for saving a task
  let edittaskbutton = document.getElementById("editnewtask");

  edittaskbutton.addEventListener(
    "click",
    (applyEdit) => {
      let newtaskobject = {
        taskname: taskname.value,
        taskdescription: taskdescription.value,
        task_start: task_start.value,
        task_end: task_end.value,
        checkedlabel: document.querySelector(
          "input[type=radio][name=edittasklabel]:checked"
        ).value,
      };
      let index;
      for (let i = 0; i < todotaskslist.length; i++) {
        if (todotaskslist[i].taskname == currentTaskname) {
          index = i;
        }
      }
      todotaskslist[index] = newtaskobject;
      //save new list
      save("todo");
      modal.hide();
      window.location.reload();
    },
    false
  );
}

function deleteTask() {
  let currentTask = this.parentNode.parentNode.childNodes;
  let currentTaskname = currentTask[0].textContent;
  let currentlabel =
    this.parentNode.parentNode.parentNode.childNodes[0].style.backgroundColor;

  for (let i = 0; i < todotaskslist.length; i++) {
    if (todotaskslist[i].taskname == currentTaskname) {
      todotaskslist.splice(i, 1);
    }
  }
  for (let i = 0; i < completedtaskslist.length; i++) {
    if (completedtaskslist[i].taskname == currentTaskname) {
      completedtaskslist.splice(i, 1);
    }
  }
  save("todo");
  save("completed");

  this.parentNode.parentNode.parentNode.remove();
}

function markCompleteTask() {
  let currentTask = this.parentNode.parentNode.childNodes;
  let currentTaskname = currentTask[0].textContent;
  let currentlabel =
    this.parentNode.parentNode.parentNode.childNodes[0].style.backgroundColor;
  for (let i = 0; i < todotaskslist.length; i++) {
    if (todotaskslist[i].taskname == currentTaskname) {
      if (!completedtaskslist.includes(todotaskslist[i])) {
        completedtaskslist.push(todotaskslist[i]);
      }

      todotaskslist.splice(i, 1);
    }
  }
  save("todo");
  save("completed");
  //hide buttons after marked as complete
  this.parentNode.parentNode.childNodes[1].childNodes[1].hidden = true;
  this.parentNode.parentNode.childNodes[1].childNodes[0].hidden = true;
  //transfer card
  completedtasks_sect.appendChild(this.parentNode.parentNode.parentNode);
}

// local storage functionality
function save(category) {
  if (category === "todo") {
    localStorage.setItem("todotaskslist", JSON.stringify(todotaskslist));
  } else if (category === "completed") {
    localStorage.setItem(
      "completedtaskslist",
      JSON.stringify(completedtaskslist)
    );
  }
}

//geting all the task from local storage
function renderTaskList() {
  todotaskslist.forEach((taskObject) => {
    addToTaskList(taskObject);
  });
}
function renderCompletedTaskList() {
  completedtaskslist.forEach((taskObject) => {
    addtoCompleteList(taskObject);
  });
}

function addtoCompleteList(object) {
  let {
    taskname: taskname,
    taskdescription: taskdescription,
    task_start: task_start,
    task_end: task_end,
    checkedlabel: checkedlabel,
  } = object;
  //create a card to add new task
  let taskCard = document.createElement("div");
  taskCard.className = "card";

  //add task to all to do section except the completed task table

  // card header
  let cardheader = document.createElement("div");
  cardheader.className = "card-header taskname-taskbuttons";

  // card title
  let cardtaskname = document.createElement("h5");
  cardtaskname.className = "taskname";
  cardtaskname.innerText = taskname;
  cardheader.appendChild(cardtaskname);
  // card buttons

  let buttongroup = document.createElement("div");
  buttongroup.className = "taskbuttons";

  let expandbutton = document.createElement("button");
  expandbutton.className =
    "btn btn-primary  bi bi-arrows-fullscreen task-expand-button";

  let deletebutton = document.createElement("button");
  deletebutton.className =
    "btn btn-primary bi bi-trash3-fill task-delete-button";

  buttongroup.appendChild(expandbutton);
  buttongroup.appendChild(deletebutton);
  cardheader.appendChild(buttongroup);
  // body of card
  let cardbody = document.createElement("div");
  cardbody.className = "card-body duedate-description-statusvalue";

  let cardDuedate = document.createElement("div");
  cardDuedate.className = "duedate";
  cardDuedate.innerHTML =
    "Due: " + new Date(task_end).toISOString().slice(0, 10);

  let carddescription = document.createElement("div");
  carddescription.className = "card-text taskdescription";
  carddescription.innerText = taskdescription;

  let cardstatus = document.createElement("div");
  cardstatus.className = "taskstatus-statusvalue";

  let taskstatus = document.createElement("span");
  taskstatus.className = "taskstatus";
  taskstatus.innerText = "STATUS: ";

  let taskstatusvalue = document.createElement("span");
  taskstatusvalue.className = "status-value";
  taskstatusvalue.innerText = "ONTIME";

  cardstatus.appendChild(taskstatus);
  cardstatus.appendChild(taskstatusvalue);
  cardbody.appendChild(cardDuedate);
  cardbody.appendChild(carddescription);
  cardbody.appendChild(cardstatus);

  taskCard.appendChild(cardheader);
  taskCard.appendChild(cardbody);

  //label colouring
  switch (checkedlabel) {
    case "Work":
      cardheader.style.backgroundColor = "#F7ECDD";
      break;
    case "School":
      cardheader.style.backgroundColor = "#FCCAE5";
      break;

    case "Business":
      cardheader.style.backgroundColor = "#F8D8B2";
      break;

    case "Personal":
      cardheader.style.backgroundColor = "#84CDCA";
      break;
  }
  //if on the tasks page
  if (window.location.pathname.endsWith("/tasks.html")) {
    completedtasks_sect.appendChild(taskCard);
  }
}

function addToTaskList(object) {
  let {
    taskname: taskname,
    taskdescription: taskdescription,
    task_start: task_start,
    task_end: task_end,
    checkedlabel: checkedlabel,
  } = object;

  //create a card to add new task
  let taskCard = document.createElement("div");
  taskCard.className = "card";

  //add task to all to do section except the completed task table

  // card header
  let cardheader = document.createElement("div");
  cardheader.className = "card-header taskname-taskbuttons";

  // card title
  let cardtaskname = document.createElement("h5");
  cardtaskname.className = "taskname";
  cardtaskname.innerText = taskname;
  cardheader.appendChild(cardtaskname);

  // card buttons
  let buttongroup = document.createElement("div");
  buttongroup.className = "taskbuttons";

  let editbutton = document.createElement("button");
  editbutton.className = "btn btn-primary  bi bi-pencil-fill task-edit-button";

  let markascompletedbutton = document.createElement("button");
  markascompletedbutton.className =
    "btn btn-primary bi bi-check-circle-fill task-mark-complete-button";

  let expandbutton = document.createElement("button");
  expandbutton.className =
    "btn btn-primary  bi bi-arrows-fullscreen task-expand-button";

  let deletebutton = document.createElement("button");
  deletebutton.className =
    "btn btn-primary bi bi-trash3-fill task-delete-button";

  buttongroup.appendChild(editbutton);
  buttongroup.appendChild(markascompletedbutton);
  buttongroup.appendChild(expandbutton);
  buttongroup.appendChild(deletebutton);
  cardheader.appendChild(buttongroup);
  // body of card
  let cardbody = document.createElement("div");
  cardbody.className = "card-body duedate-description-statusvalue";

  let cardDuedate = document.createElement("div");
  cardDuedate.className = "duedate";
  cardDuedate.innerHTML =
    "Due: " + new Date(task_end).toISOString().slice(0, 10);

  let carddescription = document.createElement("div");
  carddescription.className = "card-text taskdescription";
  carddescription.innerText = taskdescription;

  let cardstatus = document.createElement("div");
  cardstatus.className = "taskstatus-statusvalue";

  let taskstatus = document.createElement("span");
  taskstatus.className = "taskstatus";
  taskstatus.innerText = "STATUS: ";

  let taskstatusvalue = document.createElement("span");
  taskstatusvalue.className = "status-value";
  taskstatusvalue.innerText = "ONTIME";

  cardstatus.appendChild(taskstatus);
  cardstatus.appendChild(taskstatusvalue);
  cardbody.appendChild(cardDuedate);
  cardbody.appendChild(carddescription);
  cardbody.appendChild(cardstatus);

  taskCard.appendChild(cardheader);
  taskCard.appendChild(cardbody);

  //label colouring
  switch (checkedlabel) {
    case "Work":
      cardheader.style.backgroundColor = "#F7ECDD";
      break;
    case "School":
      cardheader.style.backgroundColor = "#FCCAE5";
      break;

    case "Business":
      cardheader.style.backgroundColor = "#F8D8B2";
      break;

    case "Personal":
      cardheader.style.backgroundColor = "#84CDCA";
      break;
  }

  if (window.location.pathname.endsWith("/tasks.html")) {
    console.log(todotasks_sect);
    todotasks_sect.appendChild(taskCard);
  }
  if (
    document
      .querySelector("#createtaskModalOnTaskpage")
      .classList.contains("show")
  ) {
    bootstrap.Modal.getInstance(
      document.querySelector("#createtaskModalOnTaskpage")
    ).hide();
  }
}

function viewAccessibility() {
  let myModalEl = document.querySelector("#viewAccessibilitysmodal");
  let modal = bootstrap.Modal.getOrCreateInstance(myModalEl); // Returns a Bootstrap modal instance

  modal.show();

  // Select the button
  let themetoggler = document.querySelector("#toggleThemeSwitch");
  let themeSwitch = "light";

  themetoggler.addEventListener(
    "click",
    function () {
      if (linkTheme.getAttribute("href") == "") {
        linkTheme.href = "css/stylesheet_darkmode.css";
        themeSwitch = "dark";
      } else {
        linkTheme.href = "";
        themeSwitch = "light";
      }
    },
    false
  );

  let accessibilitychangeButton = document.querySelector(
    "#accessibilitychangeButton"
  );
  accessibilitychangeButton.addEventListener(
    "click",
    function () {
      modal.hide();
      localStorage.setItem("theme", themeSwitch);
      window.location.reload();
    },
    false
  );
}
