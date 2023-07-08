let currentDate = new Date();
let displayDate = formatDate(currentDate);
document.getElementById("dateDisplay").textContent = displayDate;

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
  
    return `${day}/${month}`;
  }

function incrementDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (currentDate.getTime() < today.getTime()) {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    clearTable();
    clearDescription();
    sendRequest();
  }
}

function decrementDate() {
  currentDate.setDate(currentDate.getDate() - 1);
  updateDateDisplay();
  clearTable();
  sendRequest();
  clearDescription();
}

function updateDescription(text) {
    const descriptionDiv = document.getElementById("description");
    descriptionDiv.textContent = text;
}


function updateDateDisplay() {
  const displayDate = formatDate(currentDate);
  document.getElementById("dateDisplay").textContent = displayDate;
}

function sendRequest() {
    //const selectedDate = currentDate.toISOString().slice(0, 10);
    
    // selected date must be displayed in the format yyyy-mm-dd
    let selectedDate = document.getElementById("dateDisplay").textContent + "/" + currentDate.getFullYear();
    selectedDate = selectedDate.slice(6, 10) + "-" + selectedDate.slice(3, 5) + "-" + selectedDate.slice(0, 2);

    // Get today's date
    const today = new Date().toISOString().slice(0, 10);
  
    if (selectedDate > today) {
      alert("Cannot select a date after today");
      return;
    }
  
    // Make request to API
    const url = `/api/get_status?date=${selectedDate}`;
    // Replace the above URL with the actual URL of your API
  
    // Use fetch or another AJAX method to make the request
    fetch(url)
    .then(response => response.json())
    .then(data => {

      // Update the table with the received data
      updateLogTable(data);
    })
    .catch(error => {
      console.log('Error:', error);
    });
}

    function clearDescription() {
        const descriptionDiv = document.getElementById("description");
        descriptionDiv.textContent = "";
    }

    function clearTable() {
        const logTableBody = document.getElementById("logTableBody");
        logTableBody.innerHTML = "";
    }
  
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const hour = date.getHours();
    // if minute < 10, add a 0 in front of it
    const minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
  
    return `${hour}:${minute}`;
  }
  
  function updateLogTable(data) {
    const logTableBody = document.getElementById("logTableBody");
  
    // Clear existing rows
    logTableBody.innerHTML = "";
    clearDescription();
  
    // Convert data to an array if it's not already
    data = Array.from(data);
  
    // Sort data by timestamp in descending order
    data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
    // Iterate through status entries
    data.forEach(entry => {
      const row = document.createElement("tr");
  
      const statusCell = document.createElement("td");
      const statusText = entry.status === 1 ? "  " : "  ";
      const statusEmoji = entry.status === 1 ? "✅" : "❌";
      const statusColor = entry.status === 1 ? "green" : "red";
      statusCell.innerHTML = `${statusEmoji} <span style="color: ${statusColor};">${statusText}</span>`;
      row.appendChild(statusCell);
  
      const timestampCell = document.createElement("td");
      timestampCell.textContent = formatTimestamp(entry.timestamp);
      row.appendChild(timestampCell);
  
      logTableBody.appendChild(row);
    });

    updateSubmissionCount(data);
  }
  
  function updateSubmissionCount(data) {
    const submissionCount = data.length;
  
    const submissionCountElement = document.getElementById("submissionCount");
    submissionCountElement.textContent = `Número de status enviados nessa data: ${submissionCount}`;
  }
  
  function sendStatus(status) {
    // Make request to API
    const url = "/api/send_status";
    // Replace the above URL with the actual URL of your API
  

    let selectedDate = document.getElementById("dateDisplay").textContent + "/" + currentDate.getFullYear();
    selectedDate = selectedDate.slice(6, 10) + "-" + selectedDate.slice(3, 5) + "-" + selectedDate.slice(0, 2);

    // Create request body
    const requestBody = {
      status: status,
      date_time: selectedDate
    };
  
    // Use fetch or another AJAX method to make the request
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    })
      .then(response => response.json())
      .then(data => {
        // Display the description
        updateDescription(data.description);
      })
      .catch(error => {
        console.log(error);
      });
  }
  
  const statusForm = document.getElementById("statusForm");
  statusForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const statusSelect = document.getElementById("status");
    const status = statusSelect.value;
    sendStatus(status);
  });
  
  // Call sendRequest() initially to make the initial API request
  sendRequest();

  // Update the table every 3 second
  setInterval(sendRequest, 3000);