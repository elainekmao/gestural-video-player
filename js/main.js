var video = document.getElementById("myvideo");

var _isDown, _points, _r, _g, _rc;

function onLoadEvent() {
    _points = new Array();
    _r = new DollarRecognizer();

    var canvas = document.getElementById("gesturevidcanvas");
        _g = canvas.getContext('2d');
        _g.fillStyle = "rgb(0,0,0,0)";
        _g.strokeStyle = "rgb(0,0,225)";
        _g.lineWidth = 3;
        _rc = getCanvasRect(canvas); // canvas rect on page
        _g.fillStyle = "rgb(0,0,0,0)";
        _g.fillRect(0, 0, _rc.width, 20);

    _isDown = false;

    function getCanvasRect(canvas) {
        var w = canvas.width;
        var h = canvas.height;

        var cx = canvas.offsetLeft;
        var cy = canvas.offsetTop;
        while (canvas.offsetParent != null) {
            canvas = canvas.offsetParent;
            cx += canvas.offsetLeft;
            cy += canvas.offsetTop;
        }
        return {x: cx, y: cy, width: w, height: h};
    }
}

function getScrollY() {
    var scrollY = 0;
    if (typeof(document.body.parentElement) != 'undefined') {
        scrollY = document.body.parentElement.scrollTop; // IE
    } else if (typeof(window.pageYOffset) != 'undefined') {
        scrollY = window.pageYOffset; // FF
    }
    return scrollY;
}

function mouseDownEvent(x, y) {
    document.onselectstart = function() { return false; } // disable drag-select
    document.onmousedown = function() { return false; } // disable drag-select
    _isDown = true;
    x -= _rc.x;
    y -= _rc.y - getScrollY();
    if (_points.length > 0) 
        _g.clearRect(0, 0, _rc.width, _rc.height);
    _points.length = 1; // clear
    _points[0] = new Point(x, y);
    _g.fillRect(x - 4, y - 3, 9, 9);
    console.log("Mouse down event...")    
}

function mouseMoveEvent(x, y) {
    if (_isDown) {
        x -= _rc.x;
        y -= _rc.y - getScrollY();
        _points[_points.length] = new Point(x, y); // append
        drawConnectedPoint(_points.length - 2, _points.length - 1);
    }
}
                
function mouseUpEvent(x, y) {
    document.onselectstart = function() { return true; } // enable drag-select
    document.onmousedown = function() { return true; } // enable drag-select
    if (_isDown) {
        _isDown = false;
        if (_points.length >= 10) {
            var result = _r.Recognize(_points, false);
            console.log("Result: " + result.Name + " (" + round(result.Score,2) + ").");
            processGesture(result.Name)
        } else { // fewer than 10 points were inputted
            console.log("Too few points made. Please try again.");
        }
    }
}    
  
function processGesture(gesture) {
    var video = document.getElementById("myvideo");
    $("#messages").empty();
    // Play or pause video
    if (gesture == "P") {
        var playing = $("<div>Video is playing...</div>").addClass("gesture-alert confirmation");
        var pausing = $("<div>Video is paused.</div>").addClass("gesture-alert confirmation");
        if (video.paused) {
            video.play();
            $("#messages").append(playing);
        } else {
            video.pause();
            $("#messages").append(pausing);
        }
    //} else if (gesture == "caret" || gesture == "right square bracket") {
    } else if (gesture == "caret") {
        var volincrease = $("<div>Volume increased!</div>").addClass("gesture-alert confirmation");
        var volmax = $("<div>Video is already playing at maximum volume.</div>").addClass("gesture-alert confirmation");
        if (video.volume < 1) {
            video.volume += 0.1;
            $("#messages").append(volincrease);
        } else {
            video.volume = video.volume;
            $("#messages").append(volmax);
        }
    //} else if (gesture == "v" || gesture == "check" || gesture == "left square bracket") {
    } else if (gesture == "v") {
        var voldecrease = $("<div>Volume decreased!</div>").addClass("gesture-alert confirmation");
        var volmin = $("<div>Video is already playing at lowest volume.</div>").addClass("gesture-alert confirmation");
        if (video.volume >= 0.1) {
            video.volume -= 0.1;
            $("#messages").append(voldecrease);
        } else {
            video.volume = video.volume;
            $("#messages").append(volmin);
        }    
    } else if (gesture == "M") {
        var muted = $("<div>Video muted.</div>").addClass("gesture-alert confirmation");
        var unmuted = $("<div>Video unmuted.</div>").addClass("gesture-alert confirmation");
        if (video.muted) {
            video.muted = false;
            $("#messages").append(unmuted);
        } else {
            video.muted = true;
            $("#messages").append(muted);
        }
    } else if (gesture == "delete") {
        var vidfaster = $("<div>Video speed increased!</div>").addClass("gesture-alert confirmation");
        video.playbackRate += .25;
        $("#messages").append(vidfaster);
    } else if (gesture == "pigtail") {
        var vidslower = $("<div>Video speed decreased!</div>").addClass("gesture-alert confirmation");
        video.playbackRate -= .25;
        $("#messages").append(vidslower);
    } else if (gesture == "arrow") {
        var skip = $("<div>Video skipped forward by 5 seconds.</div>").addClass("gesture-alert confirmation");
        video.currentTime += 5;
        $("#messages").append(skip);
    } else if (gesture == "backarrow") {
        var backskip = $("<div>Video skipped back by 5 seconds.</div>").addClass("gesture-alert confirmation");
        video.currentTime -= 5;
        $("#messages").append(backskip);
    } else {
        var warning = $("<div>Your gesture was not understood! Please try again. For help, refer to our <a href='help.html' target='_blank'>documentation</a>.</div>").addClass("gesture-alert warning");
        $("#messages").append(warning);
    }
}

function drawConnectedPoint(from, to) {
    _g.beginPath();
    _g.moveTo(_points[from].X, _points[from].Y);
    _g.lineTo(_points[to].X, _points[to].Y);
    _g.closePath();
    _g.stroke();
}

function round(n, d) { // round 'n' to 'd' decimals
    d = Math.pow(10, d);
    return Math.round(n * d) / d
}
