const con = document.querySelector('.con');
    
// Function to update room display
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
                                if(i===1){
                                    selecttime = '08:00-10:00';
                                }else if(i===2){
                                    selecttime = '10:00-12:00';
                                }else if(i===3){
                                    selecttime = '13:00-15:00';
                                }else{
                                    selecttime = '15:00-17:00';
                                }
                                reqData.forEach(req => {
                                    if(req.room_id === roomId && req.selecttime === i){
                                        if(req.status.toString() === 'approved'){
                                            status = 'RESERVED';
                                        }else if(req.status.toString() === 'pending'){
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
                }
            });
        })
        .catch(error => console.error(error));
}
updateRoomDisplay();
    
    document.addEventListener('DOMContentLoaded', function() {
        const date = document.querySelector('.date');
        // Get the current date
        const currentDate = new Date();
    
        // Extract day, month, and year from the current date
        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1; // Note: January is 0!
        const year = currentDate.getFullYear();
        console.log(date);
        // Format the date as desired (e.g., YYYY-MM-DD)
        // const formattedDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
        const formattedDate = `${day < 10 ? '0' : ''}${day}-${month < 10 ? '0' : ''}${month}-${year}`;
        date.innerHTML = 'Date: ' + formattedDate; 
    });



    // --------------------------------------

 
    
    




