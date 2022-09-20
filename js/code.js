const urlBase = "http://grp11.me/LAMPAPI";
const extension = "php";

// For User login
let userId = 0;
let firstName = "";
let lastName = "";

// For loading in Contacts
let search = "";
let currentPage = 1;
let LIMIT = 10;
let totalContacts = 0;

function doLogin() {
  userId = 0;
  firstName = "";
  lastName = "";

  let login = document.getElementById("loginName").value;
  let password = document.getElementById("loginPassword").value;

  try {
     if (typeof login === "string" && login.trim() === "")
      throw "Please fill in all fields";
     if (typeof password === "string" && password.trim() === "")
      throw "Please fill in all fields";
  } catch(err) {
     document.getElementById("loginResult").innerHTML = err;
     return;
  }

  let hash = md5( password );

  document.getElementById("loginResult").innerHTML = "";

  let tmp = { login: login, password: hash };
  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/Login." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let jsonObject = JSON.parse(xhr.responseText);
        userId = jsonObject.id;

        if (userId < 1) {
          document.getElementById("loginResult").innerHTML =
            "User/Password combination incorrect";
          return;
        }

        firstName = jsonObject.firstName;
        lastName = jsonObject.lastName;

        saveCookie();

        window.location.href = "contacts.html";
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("loginResult").innerHTML = err.message;
  }
}

function doRegister() {
  firstName = document.getElementById("registerFirst").value;
  lastName = document.getElementById("registerLast").value;
  let login = document.getElementById("registerName").value;
  let password = document.getElementById("registerPassword").value;
  let confirm = document.getElementById("confirmPassword").value;

  try {
     if (typeof firstName === "string" && firstName.trim() === "")
       throw "Please fill in all fields";
     if (typeof lastName === "string" && lastName.trim() === "")
       throw "Please fill in all fields";
     if (typeof login === "string" && login.trim() === "")
       throw "Please fill in all fields";
     if (typeof password === "string" && password.trim() === "")
       throw "Please fill in all fields";
     if (typeof confirm === "string" && confirm.trim() === "")
       throw "Please fill in all fields";
     if ((typeof password === "string" && typeof confirm === "string") && (password !== confirm))
       throw "Passwords do not match";
  } catch(err) {
     document.getElementById("registerResult").innerHTML = err;
     return;
  }

  let hash = md5( password );

  document.getElementById("registerResult").innerHTML = "";

  let tmp = {
    firstName: firstName,
    lastName: lastName,
    login: login,
    password: hash,
  };

  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/Register." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        window.location.href = "index.html";
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("registerResult").innerHTML = err.message;
  }
}

function showPassword() {
  var x = document.getElementById("registerPassword");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

function showAddContact() {
  var text = document.getElementById("addContact");
  text.classList.toggle("hide");
  text.classList.toggle("show");
}

function saveCookie() {
  let minutes = 20;
  let date = new Date();
  date.setTime(date.getTime() + minutes * 60 * 1000);
  document.cookie =
    "firstName=" +
    firstName +
    ",lastName=" +
    lastName +
    ",userId=" +
    userId +
    ";expires=" +
    date.toGMTString();
}

function readCookie() {
  userId = -1;
  let data = document.cookie;
  let splits = data.split(",");

  for (var i = 0; i < splits.length; i++) {
    let thisOne = splits[i].trim();
    let tokens = thisOne.split("=");

    if (tokens[0] == "firstName") firstName = tokens[1];
    else if (tokens[0] == "lastName") lastName = tokens[1];
    else if (tokens[0] == "userId") userId = parseInt(tokens[1].trim());
  }

  if (userId < 0) {
    window.location.href = "index.html";
  } else {
    document.getElementById("title").innerHTML = firstName + "'s Contacts";
  }
}

function doLogout() {
  userId = 0;
  firstName = "";
  lastName = "";
  document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
  window.location.href = "index.html";
}

function resetTable() {
  let table = document.getElementById("contact-list");
  let rowCount = table.rows.length;
  for (let i = 1; i < rowCount; i++) table.deleteRow(1);
}

function decPage() {
  currentPage--;
  resetTable();
  displayButtons();
  loadContacts();
}

function incPage() {
  currentPage++;
  resetTable();
  displayButtons();
  loadContacts();
}

function load() {
  readCookie();
  getNumContacts();
  loadContacts();
}

function getNumContacts() {
  let tmp = { userID: userId };
  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/GetNumberOfContacts." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let jsonObject = JSON.parse(xhr.responseText);
        totalContacts = jsonObject.totalContacts;

        displayButtons();
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    // TODO: Add error message
  }
}

function displayButtons() {
  let buttonLocation = document.getElementById("pageButtons");
  let maxPages = Math.ceil((totalContacts / LIMIT));
  buttonLocation.innerHTML = "";
  if (currentPage > 1)
    buttonLocation.innerHTML =
      '<button type="button" id="decrement-button" onclick="decPage();"><ion-icon name="chevron-back-circle-outline"></ion-icon></button>';
  if (currentPage < maxPages)
    buttonLocation.innerHTML +=
      '<button type="button" id="increment-button" onclick="incPage();"><ion-icon name="chevron-forward-circle-outline"></ion-icon></button>';
}

function loadContacts() {
  let table = document.getElementById("contact-list");
  let numContacts = 0;
  let offset = (currentPage - 1) * LIMIT;

  let tmp = { search: search, userID: userId, offset: offset, limit: LIMIT };
  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/Search." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let jsonObject = JSON.parse(xhr.responseText);
        numContacts = jsonObject.results.length;

        // Print out <results> info into table format
        for (let j = 0; j < numContacts; j++) {
          // Add new row to table
          let row = table.insertRow(j + 1);

          // Populate table fields
          let fName = row.insertCell(0);
          fName.innerHTML = jsonObject.results[j].firstName;
          let lName = row.insertCell(1);
          lName.innerHTML = jsonObject.results[j].lastName;
          let email = row.insertCell(2);
          email.innerHTML = jsonObject.results[j].email;
          let phone = row.insertCell(3);
          phone.innerHTML = jsonObject.results[j].phone;
          let created = row.insertCell(4);
          created.innerHTML = jsonObject.results[j].dateCreated;
          let actions = row.insertCell(5);
          actions.innerHTML =
            '<button type="button" onclick="updateContact(' +
            (j + 1) +
            ", " +
            jsonObject.results[j].ID +
            ');">Update</button>';
          actions.innerHTML +=
            '<button type="button" onclick="deleteContact(' +
            jsonObject.results[j].ID +
            ');">Delete</button>';
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("contact-list").innerHTML = err.message;
  }
}

function searchContacts() {
  search = document.getElementById("searchText").value;
  resetTable();
  loadContacts();
}

function updateContact(rowIndex, contactID) {
  let table = document.getElementById("contact-list");
  let row = table.rows[rowIndex];
  let fName = row.cells[0].innerHTML;
  let lName = row.cells[1].innerHTML;
  let email = row.cells[2].innerHTML;
  let phone = row.cells[3].innerHTML;
  let created = row.cells[4].innerHTML;

  // window.alert(row.cells[0].innerHTML);
  // Change fields in table to fillable-forms
  row.cells[0].innerHTML =
    '<input type="updateField" id="updateFirstName" value="' + fName + '" />'; // First Name
  row.cells[1].innerHTML =
    '<input type="updateField" id="updateLastName" value="' + lName + '" />'; // Last Name
  row.cells[2].innerHTML =
    '<input type="updateField" id="updateEmail" value="' + email + '" />'; // Email
  row.cells[3].innerHTML =
    '<input type="updateField" id="updatePhone" value="' + phone + '" />'; // Phone number

  // Change "Update" button to "Confirm" or "Deny"
  row.cells[5].innerHTML =
    '<button type="button" onclick="confirmUpdate(' +
    contactID +
    ');">Confirm</button>';
  row.cells[5].innerHTML +=
    ' <button type="button" onclick="declineUpdate();">Cancel</button>';
}

// User clicks "Confirm" button after clicking "Update"
// Update contact in database and reload table
function confirmUpdate(contactID) {
  let contactFirstName = document.getElementById("updateFirstName").value;
  let contactLastName = document.getElementById("updateLastName").value;
  let email = document.getElementById("updateEmail").value;
  let phone = document.getElementById("updatePhone").value;

  // Error-handling for Updating Contact
  try {
    // Make sure all form elements are filled in
    if (typeof contactFirstName === "string" && contactFirstName.trim() === "")
      throw "Please fill in all fields";
    if (typeof contactLastName === "string" && contactLastName.trim() === "")
      throw "Please fill in all fields";
    if (typeof email === "string" && email.trim() === "")
      throw "Please fill in all fields";
    if (typeof phone === "string" && phone.trim() === "")
      throw "Please fill in all fields";

    // Make sure email is valid
    if (validateEmail(email) == false) throw "Please enter a valid email";

    // Make sure phone is valid
    if (validatePhone(phone) == false)
      throw "Please enter a valid phone-number";
  } catch (err) {
    // TODO: Add error message
    return;
  }

  let tmp = {
    firstName: contactFirstName,
    lastName: contactLastName,
    email: email,
    phone: phone,
    ID: contactID,
  };
  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/UpdateContact." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        document.location.reload();
        // TODO: Add update confirmation message
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    // TODO: Add error-handling message
  }
}

// User clicked "Decline" button after clicking "Update"
// Reload table without updating contact
function declineUpdate() {
  document.location.reload();
}

function deleteContact(contactID) {
  // Confirm that User wants to delete contact
  let confirmation = "Are you sure you want to delete this contact?";
  if (!window.confirm(confirmation)) return;

  // Set up variables for sending JSON payload to Delete.php
  let tmp = { ID: contactID };
  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/DeleteContact." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        document.location.reload();
        // TODO: Add delete confirmation message
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    // TODO: Add error-handling message
  }
}

function addContact() {
  let contactFirstName = document.getElementById("firstName").value;
  let contactLastName = document.getElementById("lastName").value;
  let email = document.getElementById("email").value;
  let phone = document.getElementById("phone").value;

  // Error-handling for "Add Contact" form
  try {
    // Make sure all form elements are filled in
    if (typeof contactFirstName === "string" && contactFirstName.trim() === "")
      throw "Please fill in all fields";
    if (typeof contactLastName === "string" && contactLastName.trim() === "")
      throw "Please fill in all fields";
    if (typeof email === "string" && email.trim() === "")
      throw "Please fill in all fields";
    if (typeof phone === "string" && phone.trim() === "")
      throw "Please fill in all fields";

    // Make sure email is valid
    if (validateEmail(email) == false) throw "Please enter a valid email";

    // Make sure phone is valid
    if (validatePhone(phone) == false)
      throw "Please enter a valid phone-number";
  } catch (err) {
    document.getElementById("addContactResult").innerHTML = err;
    return;
  }

  let tmp = {
    firstName: contactFirstName,
    lastName: contactLastName,
    email: email,
    phone: phone,
    userID: userId,
  };
  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/AddContact." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        document.location.reload();
        document.getElementById("addContactResult").innerHTML = "Contact added";
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("addContactResult").innerHTML = err.message;
  }
}

// ----------------- REGEX VALIDATIONS ----------------- //
// Code courtesy of w3resource.com
function validateEmail(email) {
  if (email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) return true;
  else return false;
}

// Code courtesy of w3resources.com
// Valid phones of the form {XXX XXX XXXX} {XXX.XXX.XXXX} {XXX-XXX-XXXX}
function validatePhone(phone) {
  if (phone.match(/^\(?([0-9]{3})\)?[-]?([0-9]{3})[-]?([0-9]{4})$/))
    return true;
  else return false;
}
// ----------------------------------------------------- //
