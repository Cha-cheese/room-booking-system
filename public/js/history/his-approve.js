const con = document.querySelector('.tbody');
//  Read user
function updateRoomDisplay() {
    fetch('/api/his_approver', {
        method: 'GET',
        credentials: 'same-origin'
    }).then(response => {
        if (!response.ok) {
            throw new Error('Unauthorized: User is not authenticated');
        }
        return response.json();
    })
        .then(data => {
            let filteredAssets = '';
            data.forEach(rl => {
                const formattedDate = new Date(rl.date).toLocaleDateString('en-GB');
                filteredAssets += `<tr id="animation">`;
                filteredAssets += `<tr class="template-container">`;
                filteredAssets += `<td class="product-name">${rl.roomname}</td>`;
                filteredAssets += `<td>${rl.request_user_id}</td>`;
                filteredAssets += `<td>${rl.request_username}</td>`;
                filteredAssets += `<td>${formattedDate}</td>`;
                filteredAssets += `<td>${rl.selecttime}</td>`;
                if (rl.status.toUpperCase() === "APPROVED") {
                    filteredAssets += `<td class="fw-bold text-success text-uppercase">${rl.status}</td>`;
                }if (rl.status.toUpperCase() === "PENDING") {
                    filteredAssets += `<td class="fw-bold text-uppercase" style="color: #ff8000";>${rl.status}</td>`;
                }if (rl.status.toUpperCase() === "REJECTED") {
                    filteredAssets += `<td class="fw-bold text-uppercase" style="color: red";>${rl.status}</td>`;
                }
                filteredAssets += `</tr>`;
            });
            // Display room data in '.con'
            con.innerHTML = filteredAssets;
        })
        .catch(error => console.error(error));
}

updateRoomDisplay();



// function filterAssets() {
//     const searchInput = document.getElementById('searchInput').value.toLowerCase();
//     const filteredAssets = assets.filter(asset =>
//         asset.Room.toLowerCase().includes(searchInput)
//     );
//     readUser(filteredAssets);
// }

// // Initial display
// readUser(assets);

// // Event listener for input changes
// document.getElementById('searchInput').addEventListener('input', filterAssets);