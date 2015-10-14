var _ = require("underscore");
var http = require("http");


var con_type = { ENDPOINT: 0, SCANNER: 1 };
var endpoints = {};
var scanners = [];

var srv = http.createServer(function(req, res) {
	res.end("Number of endpoints: " + Object.keys(endpoints).length + ", number of scanners: " + (function() { var i = 0; for k in endpoints { i += endpoints[k].scanners.length; } return i; })());
});
var io = require("socket.io")(srv);

function EndPoint() {
	this.socket = null;
	this.scanners = [];
	this.active = true;
}

function Scanner(socket) {
	this.socket = socket;
	this.id;
	this.name;
}

io.on("connection", function(socket) {

	var type = null, endpoint = null, scanner = null;

	// reqister output connection
	socket.on("endpoint.register", function(msg) {
		if(type === null) {
			if(typeof(endpoints[msg.name]) === "undefined") {
				endpoints[msg.name] = new EndPoint();
				endpoints[msg.name].socket = socket;
			} else {
				endpoints[msg.name].socket = socket;
			}
			
			endpoint = endpoints[msg.name];
			type = con_type.ENDPOINT;
		}
	});
	// remove output connection
	socket.on("endpoint.unregister", function(msg) {
		if(type === con_type.ENDPOINT) {
			for(key in endpoints) {
				if(endpoints[key] === socket) {
					delete endpoints[key]
				}
			}
		}
	});
	// notify scanner about something
	socket.on("endpoint.scanner_error", function(msg) {
		if(type === con_type.ENDPOINT) {

		}
	});
	// get all the scans!
	socket.on("endpoint.all", function(msg) {
		if(type === con_type.ENDPOINT) {

		}
	});


	// register a scanner device
	socket.on("scanner.register", function(msg) {
		if(type == null) {
			if(endpoint == null) {
				endpoint = new EndPoint();
				endpoints[msg.endpoint] = endpoint;
			} else {
				endpoint = endpoints[msg.endpoint];
			}
			type = con_type.SCANNER;
			scanner = new Scanner(socket);
			scanner.id = msg.device_id;
			scanner.name = msg.device_name;

			endpoint.scanners.push(scanner);

			console.dir(msg);

			if(endpoint.socket != null)
				endpoint.socket.emit("scanner.register", { device_id: msg.device_id, name: msg.device_name });
		}
	});
	// when scanned a card
	socket.on("scanner.scanned", function(msg) {
		if(type === con_type.SCANNER) {
			console.dir(msg);
			if(endpoint != null && endpoint.socket != null) {
				endpoint.socket.emit("scanner.scanned", { device_id: scanner.id, card_id: msg.card_number });
			}
		}
	});

	socket.on("scanner.settings", function(msg) {
		if(type === con_type.SCANNER) {

		}
	});


	socket.on("disconnect", function() {

	});
});


srv.listen(8080, "130.240.202.160");
