// worker.js
var wp = google.gears.workerPool;
wp.allowCrossOrigin();

wp.onmessage = function(a, b, message) {
    var s = message.body;

    var request = google.gears.factory.create('beta.httprequest');

    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            wp.sendMessage(request.responseText, message.sender);
        }
    };

    request.open(s.type, s.url);

    for (var name in s.headers) {
        request.setRequestHeader(name, s.headers[name]);
    }

    if (s.data) {
        request.send(s.data);
    } else {
        request.send();
    }
};