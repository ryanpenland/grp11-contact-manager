const urlBase = "http://grp11.me/LAMPAPI";
const extension = "php";

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin() {
  userId = 0;
  firstName = "";
  lastName = "";

  let login = document.getElementById("loginName").value;
  let password = document.getElementById("loginPassword").value;
  //	var hash = md5( password );

  document.getElementById("loginResult").innerHTML = "";

  let tmp = { login: login, password: password };
  //	var tmp = {login:login,password:hash};
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
  //	var hash = md5( password );

  document.getElementById("registerResult").innerHTML = "";

  let tmp = {
    firstName: firstName,
    lastName: lastName,
    login: login,
    password: password,
  };
  //	var tmp = {login:login,password:hash};
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
    if (tokens[0] == "firstName") {
      firstName = tokens[1];
    } else if (tokens[0] == "lastName") {
      lastName = tokens[1];
    } else if (tokens[0] == "userId") {
      userId = parseInt(tokens[1].trim());
    }
  }

  if (userId < 0) {
    window.location.href = "index.html";
  } else {
    // document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
  }
}

function doLogout() {
  userId = 0;
  firstName = "";
  lastName = "";
  document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
  window.location.href = "index.html";
}

function loadContacts() {
   let currentPage = 1;
   let LIMIT = 10;

   let offset = (currentPage - 1) * LIMIT;

   let tmp = {userID: userId, offset: offset, limit: LIMIT};
   let jsonPayload = JSON.stringify(tmp);

   let url = urlBase + "/LoadContacts." + extension;

   let xhr = new XMLHttpRequest();
   xhr.open("POST", url, true);
   xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
   try {
      xhr.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
            let jsonObject = JSON.parse(xhr.responseText);
            let numContacts = jsonObject.results.length;
            let table = document.getElementById("contact-list");

            // let row = table.insertRow(0);
            // let fName = row.insertCell(0);
            // fName.innerHTML = "Joshua";
            // let lName = row.insertCell(1);
            // lName.innerHTML = "Balila";
            // let email = row.insertCell(2);
            // email.innerHTML = "joshua@gmail.com";
            // let phone = row.insertCell(3);
            // phone.innerHTML = "111-222-3333";
            // let created = row.insertCell(4);
            // created.innerHTML = "";
            // let actions = row.insertCell(5);
            // actions.innerHTML = "";

            // Print out <results> info into table format
            for (let j = 0; j < numContacts; j++) {
               // Add new row to table
               let row = table.insertRow(j+1);

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
               created.innerHTML = "";
               let actions = row.insertCell(5);
               actions.innerHTML = "";
            }
         }
      };
      xhr.send(jsonPayload);
   } catch(err) {
      document.getElementById("contact-list").innerHTML = err.message;
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
     if (typeof contactFirstName === 'string' && contactFirstName.trim() === '') throw "Please fill in all fields";
     if (typeof contactLastName === 'string' && contactLastName.trim() === '') throw "Please fill in all fields";
     if (typeof email === 'string' && email.trim() === '') throw "Please fill in all fields";
     if (typeof phone === 'string' && phone.trim() === '') throw "Please fill in all fields";

     // Make sure email is valid
     if (validateEmail(email) == false) throw "Please enter a valid email";

     // Make sure phone is valid
     if (validatePhone(phone) == false) throw "Please enter a valid phone-number";
  }
  catch(err) {
     document.getElementById("addContactResult").innerHTML = err;
     return;
  }

  document.getElementById("addContactResult").innerHTML = "";

  let tmp = { firstName: contactFirstName, lastName: contactLastName, email: email, phone: phone, userID: userId };
  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/AddContact." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
         window.location.reload();
         document.getElementById("addContactResult").innerHTML = "Contact added";
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("addContactResult").innerHTML = err.message;
  }
}

function searchColor() {
  let srch = document.getElementById("searchText").value;
  document.getElementById("colorSearchResult").innerHTML = "";

  let colorList = "";

  let tmp = { search: srch, userId: userId };
  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/SearchColors." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("colorSearchResult").innerHTML =
          "Color(s) has been retrieved";
        let jsonObject = JSON.parse(xhr.responseText);

        for (let i = 0; i < jsonObject.results.length; i++) {
          colorList += jsonObject.results[i];
          if (i < jsonObject.results.length - 1) {
            colorList += "<br />\r\n";
          }
        }

        document.getElementsByTagName("p")[0].innerHTML = colorList;
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("colorSearchResult").innerHTML = err.message;
  }
}

// ----------------- REGEX VALIDATIONS ----------------- //
// Code courtesy of w3resource.com
function validateEmail(email) {
   if (email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/))
      return true;
   else
      return false;
}

// Code courtesy of w3resources.com
// Valid phones of the form {XXX XXX XXXX} {XXX.XXX.XXXX} {XXX-XXX-XXXX}
function validatePhone(phone) {
   if (phone.match(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/))
      return true;
   else
      return false;
}
// ----------------------------------------------------- //
