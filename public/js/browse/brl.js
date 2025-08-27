document.addEventListener('DOMContentLoaded', function () {
    const con = document.querySelector('.con');

    //-----------------------Function update room display------------------------------
    function updateRoomDisplay() {
        fetch('/api/rooms')
            .then(response => response.json())
            .then(data => {
                let showRoomList = '';
                data.forEach(rl => { //show all room
                    if (rl.status == 1) { //show room only enable status
                        let roomId = rl.room_id;
                        let roomname = rl.roomname;
                        let roomImage = rl.image;
                        let roomdes = rl.description;

                        // Start inner fetch operation
                        fetch('/api/room_request')
                            .then(response => response.json())
                            .then(reqData => {
                                // Construct HTML for each room and its time slots
                                showRoomList += `<div class="template-container">`;
                                showRoomList += `<div class="container">`;
                                showRoomList += `<h1 class="product-name">${roomname}</h1>`;
                                showRoomList += `<img class="product-image" src="/img/browse/${roomImage}" alt="Product Image">`;
                                showRoomList += `<div class="product-info">`;
                                showRoomList += `<div class="edit">`;
                                // showRoomList += `<button class="edit_btn">Edit</button>`;
                                showRoomList += `</div>`;
                                showRoomList += `<h2>Room Description</h2>`;
                                showRoomList += `<p>${roomdes}</p>`;
                                showRoomList += `<h2>Time-slot</h2>`;
                                showRoomList += `<ul class="availability-list">`;

                                for (let i = 1; i <= 4; i++) {
                                    let status = 'FREE'; // Default status
                                    let selecttime = '';
                                    if (i === 1) {
                                        selecttime = '08:00-10:00';
                                    } else if (i === 2) {
                                        selecttime = '10:00-12:00';
                                    } else if (i === 3) {
                                        selecttime = '13:00-15:00';
                                    } else {
                                        selecttime = '15:00-17:00';
                                    }
                                    reqData.forEach(req => {
                                        if (req.room_id === roomId && req.selecttime === i) {
                                            if (req.status.toString() === 'approved') {
                                                status = 'RESERVED';
                                            } else if (req.status.toString() === 'pending') {
                                                status = 'PENDING';
                                            }
                                        }
                                    });
                                    showRoomList += `<li>${selecttime} : <a class="availability-status ${status} ${i} btn" data-room="${roomId}" data-time="${i}"><span>${status}</span></a></li>`;
                                }

                                showRoomList += `</ul>`;
                                showRoomList += `</div>`; // Close product-info div
                                showRoomList += `</div>`; // Close container div
                                showRoomList += `</div>`; // Close template-container div

                                // Display room data in '.con' after all rooms are processed
                                con.innerHTML = showRoomList;
                            })
                            .catch(error => console.error(error)); // End inner fetch operation
                    }
                });
            })
            .catch(error => console.error(error));
    }
    updateRoomDisplay();// Call the function to update room display
    //-----------------------Function 1 user per 1 request------------------------------
    function oneday() {
        fetch('/api/oneday', {
            method: 'GET',
            credentials: 'same-origin'
        }).then(response => {
            if (!response.ok) {
                throw new Error('Unauthorized: User is not authenticated');
            }
            return response.json();
        })
            .then(data => {
                if (data.length === 0) {
                    // No existing requests, allow the client to make a new request
                    con.addEventListener('click', function (event) {
                        const target = event.target;
                        const currentHour = new Date().getHours(); // Get the current hour
                        const currentMinute = new Date().getMinutes(); // Get the current minute
                        if (target.classList.contains('availability-status') && target.classList.contains('FREE')) {
                            event.preventDefault(); // Prevent the default action of link click

                            // Check the current time and the time slot of the room
                            if ((currentHour > 10 || (currentHour === 10 && currentMinute >= 0)) &&
                                ((currentHour < 12 || (currentHour === 12 && currentMinute <= 0)) && target.classList.contains('1')) || //first button
                                ((currentHour > 12 || (currentHour === 12 && currentMinute >= 0)) &&
                                    (currentHour < 15 || (currentHour === 15 && currentMinute <= 0)) &&
                                    (target.classList.contains('2') || target.classList.contains('1'))) ||//second button
                                ((currentHour > 15 || (currentHour === 15 && currentMinute >= 0)) &&
                                    (currentHour < 17 || (currentHour === 17 && currentMinute <= 0)) &&
                                    (target.classList.contains('3') || target.classList.contains('2') || target.classList.contains('1'))) ||//third button
                                (currentHour > 17 || (currentHour === 17 && currentMinute >= 0)) &&
                                (target.classList.contains('4') || target.classList.contains('3') || target.classList.contains('2') || target.classList.contains('1'))) { //four button
                                // Do not send the request if the current time is past the time slot
                                return;
                            }

                            // Send the request to update the status to the server
                            const roomId = target.dataset.room; // Get room_id from data-room attribute
                            const timeSlot = target.dataset.time; // Get timeSlot from data-time attribute
                            sendDataToRequest(roomId, timeSlot); // Call the function using updateRoomStatusToPending()
                        }
                    });
                }
            })
    }
    oneday();//call function
    //-----------------------Function sent request to database------------------------------
    function sendDataToRequest(roomId, timeSlot) {
        // Prepare request data
        const requestData = {
            roomId: roomId,
            timeSlot: timeSlot
        };

        // Send POST request to API endpoint
        fetch('/api/insertRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to send request to server');
                }
                console.log('Request sent successfully');
                // Redirect to the request page after successfully sending the data
                window.location.href = '/studentRequest';
            })
            .catch(error => console.error('Error sending request to server:', error));

    }
    //----------------------- Create date------------------------------
    const date = document.querySelector('.date');
    // Get the current date
    const currentDate = new Date();
    // Extract day, month, and year from the current date
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // Note: January is 0!
    const year = currentDate.getFullYear();
    // Format the date as desired (e.g., DD-MM-YYYY)
    const formattedDate = `${day < 10 ? '0' : ''}${day}-${month < 10 ? '0' : ''}${month}-${year}`;
    date.innerHTML = 'Date: ' + formattedDate;
});