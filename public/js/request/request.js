document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/getRequest', {
        method: 'GET',
        credentials: 'same-origin'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Unauthorized: User is not authenticated');
            }
            return response.json();
        })
        .then(data => {
            let sql_id = null;
            let selecttime = '';
            if (data.length > 0) { // ตรวจสอบว่ามีข้อมูล request หรือไม่
                const requestData = data[0]; // รับข้อมูล request ล่าสุด
                if (requestData.selecttime === 1) {
                    selecttime = '08:00-10:00';
                } else if (requestData.selecttime === 2) {
                    selecttime = '10:00-12:00';
                } else if (requestData.selecttime === 3) {
                    selecttime = '13:00-15:00';
                } else {
                    selecttime = '15:00-17:00';
                }
                if (requestData.date) {
                    let date = new Date(requestData.date);
                    let formattedDate = date.toLocaleDateString("en-US");
                    document.getElementById('date').innerText = formattedDate;
                }                               
                if (requestData.room_id) {
                    document.getElementById('roomName').innerText = requestData.roomname;
                }
                if (requestData.selecttime) {
                    document.getElementById('time').innerText = selecttime;
                }

                if (requestData.student_id) {
                    document.getElementById('studentId').innerText = requestData.student_id;
                }
                if (requestData.name) {
                    document.getElementById('Name').innerText = requestData.name;
                }
                if (requestData.request_id) {
                    sql_id = requestData.request_id
                    // document.getElementById('requestId').innerText = requestData.request_id;
                    // console.log(requestData.request_id)
                }
            } else {
                console.error('No request data available');
            }

            // เพิ่มการจัดการเหตุการณ์เมื่อคลิกปุ่ม "Cancel"
            document.getElementById('cancelBtn').addEventListener('click', function () {
                console.log('it cancel')
                const requestId = sql_id;
                if (!requestId) {
                    console.error('Error cancelling request: Request ID is missing');
                    return;
                }

                fetch('/delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ request_id: requestId })
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to cancel request');
                        }
                    })
                    .catch(error => console.error('Error cancelling request:', error));
            });
        })
        .catch(error => console.error('Error fetching request data:', error));
});

document.addEventListener('DOMContentLoaded', function () {
    // สร้างวัตถุ Date สำหรับวันที่ปัจจุบัน
    let currentDate = new Date();

    // จัดรูปแบบวันที่ปัจจุบันให้อยู่ในรูปของ ISO string
    let formattedDate = currentDate.toISOString().split('T')[0];

    // ตั้งค่าข้อความใน element ที่มี id เป็น 'date' เป็นวันที่ปัจจุบัน
    document.getElementById('date').innerText = formattedDate;

    // เพิ่มการจัดการเหตุการณ์เมื่อคลิกปุ่ม "Submit"
    document.getElementById('submitBtn').addEventListener('click', function () {
        console.log('it submit');
        const requestId = sql_id; // รับค่า requestId จากข้อมูลที่ดึงมา
        const roomId = document.getElementById('roomName').innerText; // รับค่าหมายเลขห้องจาก DOM
        const timeSlot = document.getElementById('time').innerText; // รับค่าช่วงเวลาจาก DOM

        if (!requestId || !roomId || !timeSlot) {
            console.error('Error submitting request: Missing data');
            return;
        }

        // ส่งคำขออัปเดตสถานะของห้องไปยังเซิร์ฟเวอร์
        fetch('/api/updateRoomStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requestId: requestId, roomId: roomId, timeSlot: timeSlot })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update room status');
                }
                console.log('Room status updated successfully');

                // Redirect to the booking details page
                window.location.href = '/userDetail';
            })
            .catch(error => console.error('Error updating room status:', error));

    });
});
