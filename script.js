// script.js
let socket;
let joystick;
let cameraOn = false;
let autopilotOn = false;
let fullScreen = false;

function connect() {
    const ip = document.getElementById('ip').value;
    const password = document.getElementById('password').value;
    socket = new WebSocket(`wss://${ip}:8765`);

    socket.onopen = function(e) {
        console.log("[open] Connection established");
        socket.send(password);
    };

    socket.onmessage = function(event) {
        console.log(`[message] Data received from server: ${event.data}`);
        if (event.data === "Access Granted") {
            document.getElementById('login').style.display = 'none';
            document.getElementById('controls').style.display = 'block';
            document.addEventListener('keydown', handleKeyDown);
            initializeJoystick();
        } else if (event.data === "Access Denied") {
            alert("Access Denied. Incorrect Password.");
        }
    };

    socket.onclose = function(event) {
        if (event.wasClean) {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            console.log('[close] Connection died');
        }
    };

    socket.onerror = function(error) {
        console.log(`[error] ${error.message}`);
    };
}

function handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowUp':
            sendCommand('move_forward');
            break;
        case 'ArrowDown':
            sendCommand('move_backward');
            break;
        case 'ArrowLeft':
            sendCommand('turn_left');
            break;
        case 'ArrowRight':
            sendCommand('turn_right');
            break;
    }
}

function sendCommand(command) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(command);
    } else {
        console.log("WebSocket is not open.");
    }
}

function initializeJoystick() {
    joystick = nipplejs.create({
        zone: document.getElementById('joystick'),
        mode: 'static',
        position: { left: '50%', top: '50%' },
        color: 'red'
    });

    joystick.on('move', (event, data) => {
        const { angle, distance } = data;
        if (distance > 20) {
            const direction = angle.degree;
            if (direction > 45 && direction <= 135) {
                sendCommand('move_forward');
            } else if (direction > 225 && direction <= 315) {
                sendCommand('move_backward');
            } else if (direction > 135 && direction <= 225) {
                sendCommand('turn_left');
            } else if (direction <= 45 || direction > 315) {
                sendCommand('turn_right');
            }
        }
    });

    joystick.on('end', () => {
        // You can add a command to stop the robot if needed
        // sendCommand('stop');
    });
}

function toggleCamera() {
    cameraOn = !cameraOn;
    const command = cameraOn ? 'camera_on' : 'camera_off';
    sendCommand(command);
    const cameraButton = document.getElementById('cameraButton');
    const cameraPlaceholder = document.getElementById('cameraPlaceholder');
    if (cameraOn) {
        cameraButton.classList.add('active');
        cameraPlaceholder.style.display = 'none';
    } else {
        cameraButton.classList.remove('active');
        cameraPlaceholder.style.display = 'flex';
    }
}


function toggleAutopilot() {
    autopilotOn = !autopilotOn;
    const command = autopilotOn ? 'autopilot_on' : 'autopilot_off';
    sendCommand(command);
    const autopilotButton = document.getElementById('autopilotButton');
    if (autopilotOn) {
        autopilotButton.classList.add('active');
    } else {
        autopilotButton.classList.remove('active');
    }
}


function toggleFullScreen() {
    const elem = document.documentElement;
    if (!fullScreen) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { // Firefox
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE/Edge
            elem.msRequestFullscreen();
        }
        fullScreen = true;
        document.getElementById('fullscreenButton').textContent = 'Exit Fullscreen';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
        }
        fullScreen = false;
        document.getElementById('fullscreenButton').textContent = 'Go Fullscreen';
    }
}

