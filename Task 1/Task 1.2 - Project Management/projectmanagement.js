//Variable declaration for IndexedDB
var db;
var request;
request = window.indexedDB.open("ProjectManagement", 1);

request.onupgradeneeded = function (event) {
  // Triggers if the client had no database and database is created
  db = event.target.result;
  if (!db.objectStoreNames.contains("Project")) {
    db.createObjectStore("Project", { keyPath: "projectname" });
    console.log("Database Created");
  }
};

request.onsuccess = function () {
  //Database successfully created.
  db = request.result;
  // console.log("db", db);
};

request.onerror = function () {
  console.error("Error", request.error);
  //Error creating database
};

//Function to add data entry.
function addEntry() {
  var newEntry = {};

  var getValue = document.getElementsByClassName("getValue");

  for (let i = 0; i < getValue.length; i++) {
    // console.log(getValue[i]);
    if (getValue[i].value === "" || getValue[i].value === null) {
      newEntry = {};
      alert("Please fill all the fields");
      break;
    } else {
      newEntry[getValue[i].id] = getValue[i].value;
    }
  }
  if (Object.keys(newEntry).length !== 0) {
    request = db
      .transaction("Project", "readwrite")
      .objectStore("Project")
      .add(newEntry);
  }
  request.onsuccess = function () {
    alert("Data Added");
    window.location.reload();
  };

  request.onerror = function () {
    alert(
      "Unable to add data or project name " +
        newEntry.projectname +
        " is already present."
    );
  };
}

//Function to display all entries.
function readAll() {
  //Code to show/hide buttons
  document.getElementById("addItem").style.display = "block";
  document.getElementById("updateItem").style.display = "none";
  document.getElementById("cancelEdit").style.display = "none";

  var objectStore = db.transaction("Project").objectStore("Project");

  objectStore.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;
    var table = document.getElementById("tableBody");
    var editicon = document.createElement("i");
    editicon.classList.add("fas");
    editicon.classList.add("fa-edit");
    var deleteicon = document.createElement("i");
    deleteicon.classList.add("fas");
    deleteicon.classList.add("fa-trash");
    var detailsicon = document.createElement("i");
    detailsicon.classList.add("fas");
    detailsicon.classList.add("fa-info-circle");

    var tr;
    if (cursor) {
      tr = table.insertRow(-1);

      for (const [key, value] of Object.entries(cursor.value)) {
        if (key == "projectname" || key == "deadline" || key == "category") {
          var tabCell = tr.insertCell(-1);
          tabCell.innerHTML = value;
          if (key == "projectname")
            tabCell.setAttribute("data-label", "Project Title");
          if (key == "deadline") tabCell.setAttribute("data-label", "Deadline");
          if (key == "category") tabCell.setAttribute("data-label", "Category");
        }
      }
      var tabCell = tr.insertCell(-1);
      detailsicon.setAttribute("details", cursor.value.projectname);
      detailsicon.onclick = function (event) {
        openModal(event);
      };
      tabCell.setAttribute("data-label", "Details");
      tabCell.id = "detailsicon";
      tabCell.appendChild(detailsicon);

      var tabCell = tr.insertCell(-1);
      editicon.setAttribute("edit-data", cursor.value.projectname);
      editicon.onclick = function (event) {
        editItem(event);

        document.documentElement.scrollTop = 0;
      };
      tabCell.setAttribute("data-label", "Edit");
      tabCell.id = "editicon";

      tabCell.appendChild(editicon);

      var tabCell = tr.insertCell(-1);
      deleteicon.setAttribute("delete-data", cursor.value.projectname);
      deleteicon.onclick = function (event) {
        deleteItem(event);
      };
      tabCell.appendChild(deleteicon);
      tabCell.setAttribute("data-label", "Delete");
      tabCell.id = "deleteicon";
      table.appendChild(tr);

      cursor.continue();
    }
  };
}

//Function delete a data entry.
function deleteItem(event) {
  let dataTask = event.target.getAttribute("delete-data");
  console.log("de", dataTask);
  var transaction = db.transaction("Project", "readwrite");
  request = transaction.objectStore("Project").delete(dataTask);
  transaction.oncomplete = function () {
    alert("Deleted");
    window.location.reload();
  };
}
//Function to edit entry.
function editItem(event) {
  //Code to show/hide buttons
  document.getElementById("addItem").style.display = "none";
  document.getElementById("downloadData").style.display = "none";
  document.getElementById("impbtn").style.display = "none";
  document.getElementById("updateItem").style.display = "block";
  document.getElementById("cancelEdit").style.display = "block";

  //Main code to edit
  let dataTask = event.target.getAttribute("edit-data");
  console.log("event", dataTask);
  var transaction = db.transaction("Project", "readwrite");
  var objectStoreRequest = transaction.objectStore("Project").get(dataTask);
  objectStoreRequest.onsuccess = function (event) {
    var result = objectStoreRequest.result;

    console.log("event-data", Object.keys(result));
    var getValue = document.getElementsByClassName("getValue");

    getValue[0].disabled = true;
    var val = Object.values(result);
    for (let i = 0; i < getValue.length; i++) {
      getValue[i].value = val[i];
      if (i == 3) addMember();
    }
  };
}

//Function to update entry.
function updateItems() {
  let dataTask = document.getElementById("projectname").value;
  var transaction = db.transaction("Project", "readwrite");
  request = transaction.objectStore("Project").delete(dataTask);
  transaction.oncomplete = function () {
    addEntry();
  };
}

//Function to add project members

function addMember() {
  var number = document.getElementById("nofuser").value;
  if (number > 0) {
    var allMember = document.getElementById("allMembers");

    while (allMember.hasChildNodes()) {
      allMember.removeChild(allMember.lastChild);
    }
    for (var i = 0; i < number; i++) {
      var label = document.createElement("label");
      label.classList.add("fieldlabel");
      label.innerHTML = "Member " + (i + 1);
      allMember.appendChild(label);
      var input = document.createElement("input");
      input.type = "text";
      input.classList.add("getValue");
      input.classList.add("fieldinput");
      input.id = "member" + (i + 1);
      allMember.appendChild(input);
    }
  } else {
    alert("Select valid number of members.");
  }
}

//Functions for modal
function openModal(event) {
  var modal = document.getElementById("myModal");
  modal.style.display = "block";

  var modalData = document.getElementById("modalData");
  while (modalData.hasChildNodes()) {
    modalData.removeChild(modalData.lastChild);
  }
  //Main code to data to modal
  let dataTask = event.target.getAttribute("details");

  var transaction = db.transaction("Project", "readwrite");
  var objectStoreRequest = transaction.objectStore("Project").get(dataTask);
  objectStoreRequest.onsuccess = function (event) {
    var result = Object.values(objectStoreRequest.result);

    var modalLabel = [
      "Project Title :- ",
      "Category :- ",
      "Deadline :- ",
      "Number of members :- ",
      "Members :- ",
      "Description :- ",
    ];

    //To display project title, category, deadline, number of members.
    for (var i = 0; i < 4; i++) {
      var label = document.createElement("div");
      label.classList.add("col-1");
      label.innerHTML = modalLabel[i];
      modalData.appendChild(label);
      var content = document.createElement("div");
      content.classList.add("col-2");
      content.innerHTML = result[i];
      modalData.appendChild(content);
    }
    //To display member names
    var label = document.createElement("div");
    label.classList.add("col-1");
    label.innerHTML = modalLabel[4];
    modalData.appendChild(label);
    var content = document.createElement("div");
    content.classList.add("col-2");

    for (var i = 4; i < result.length - 1; i++) {
      var member = document.createElement("p");
      member.innerHTML = result[i];
      content.appendChild(member);
      if (i == result.length - 2) {
        modalData.appendChild(content);
      }
    }

    //To display description
    var label = document.createElement("div");
    label.classList.add("col-1");
    label.innerHTML = modalLabel[5];
    modalData.appendChild(label);
    var content = document.createElement("div");
    content.classList.add("col-2");
    content.innerHTML = result[result.length - 1];
    modalData.appendChild(content);
  };
}
window.onclick = function (event) {
  var modal = document.getElementById("myModal");

  if (event.target == modal) {
    modal.style.display = "none";
  }
};

function closeModal() {
  var modal = document.getElementById("myModal");
  modal.style.display = "none";
}

//Funtion to export data
function download() {
  var objectStore = db.transaction("Project").objectStore("Project");

  objectStore.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;

    if (cursor) {
      expData[cursor.value.projectname] = cursor.value;

      cursor.continue();
    } else expo();
  };
}
var expData = {};

function expo() {
  var data =
    "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(expData));

  var a = document.getElementById("down");
  a.href = "data:" + data;
  a.download = "data.txt";
}
//Function to import data.
async function importtxt(event) {
  console.log(event.target.files[0]);
  var file = event.target.files[0];
  let text = await file.text();
  console.log("text", text);
  if (text == "" || text == "{}") {
    console.log("Empty");
  } else {
    try {
      var obj = JSON.parse(text);

      const vals = Object.values(obj);

      var ct = 0;
      vals.forEach((element) => {
        request = db
          .transaction("Project", "readwrite")
          .objectStore("Project")
          .add(element);
        request.onsuccess = function () {
          ct++;
          console.log("Data Added", element);
          if (ct == vals.length) {
            alert("Data imported successfully.");
            window.location.reload();
          }
        };

        request.onerror = function () {
          ct++;
          alert(
            "Unable to add data or project name " +
              element.projectname +
              " is already present."
          );
          if (ct == vals.length) window.location.reload();
        };
      });
      console.log(ct);
    } catch (err) {
      console.log("err", err);
      alert("Error occured or Unsupported data. Check format of data.");
    }
  }
}
