//get date when page load
document.addEventListener('DOMContentLoaded', function () {

    // แสดงวันที่ปัจจุบัน
    const date = document.querySelector('.date');
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // January is 0!
    const year = currentDate.getFullYear();
    const formattedDate = `${day < 10 ? '0' : ''}${day}-${month < 10 ? '0' : ''}${month}-${year}`;
    date.innerHTML = 'Date: ' + formattedDate;
});
const con = document.querySelector('.con');

// Function to update room display
function updateRoomDisplay() {
    fetch('/api/rooms')
        .then(response => response.json())
        .then(data => {
            let showRoomList = '';
            data.forEach(rl => { //show all room

                let roomId = rl.room_id;
                let roomname = rl.roomname;
                let roomImage = rl.image;
                let roomdes = rl.description;
                let status = rl.status;

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
                        showRoomList += `<div class="form-check form-switch"><input class="form-check-input" type="checkbox" onchange="confirm(event, ${roomId})"`;
                        if (status == 1) {
                            showRoomList += ` checked`;
                        }
                        showRoomList += `></div>`;
                        // Add an edit button with a click event listener to redirect to '/edit' with room ID
                        showRoomList += `<button class="edit_btn" onclick="redirectToEdit('${roomId}')">Edit</button>`;
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
                            showRoomList += `<li>${selecttime} : <button class="availability-status ${status}" data-room="${roomId}" data-time="${i}">${status}</button></li>`;
                        }

                        showRoomList += `</ul>`;
                        showRoomList += `</div>`; // Close product-info div
                        showRoomList += `</div>`; // Close container div
                        showRoomList += `</div>`; // Close template-container div

                        // Display room data in '.con' after all rooms are processed
                        con.innerHTML = showRoomList;
                    })
                    .catch(error => console.error(error)); // End inner fetch operation

            });
        })
        .catch(error => console.error(error));
}
updateRoomDisplay(); //call function show room

// Function to redirect to '/edit' with the room ID
function redirectToEdit(roomId) {
    location.assign(`/edit/` + roomId);
}

const button = document.getElementById('add_btn');
button.onclick = function () {
    location.assign('/add'); // Replace '/add' with your desired route
};
// confirm change room status
function confirm(cb, rid) {
    // console.log(cb.target.checked, pid);
    const check = cb.target.checked;
    let message = 'Disable room?';
    if(check) {
        message = 'Enable room?';
    }
    Notiflix.Confirm.show('Confirm', message, 'Yes', 'No', 
        function okCb() {
            enableRoom(rid, check);
        }, 
        function cancelCb() {
            cb.target.checked = !check;
        }
    );
}
// enable/disable room
async function enableRoom(rid, check) {
    let status = 0;
    if(check) {
        status = 1;
    }
    try {
        const response = await fetch(`/admin/room/${rid}/${status}`, {method: 'PUT'});
        if (response.ok) {
            const data = await response.text();
            Notiflix.Report.success('Success', data, 'OK');
        }
        else if (response.status == 500) {
            const data = await response.text();
            throw Error(data);
        }
        else {
            throw Error('Connection error');
        }
    } catch (err) {
        console.error(err.message);
        Notiflix.Report.failure('Error', err.message, 'Close');
    }
}