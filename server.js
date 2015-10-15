var _ = require("underscore");
var http = require("http");


var con_type = { ENDPOINT: 0, SCANNER: 1 };
var endpoints = {};

var srv = http.createServer(function(req, res) {
	res.end(
		"Number of endpoints: " + Object.keys(endpoints).length +
		", number of scanners: " + (function() { var i = 0; for (k in endpoints) { i += endpoints[k].scanners.length; } return i; })());
});
var io = require("socket.io")(srv);

function EndPoint(name, socket) {
	this.name = name;
	this.socket = socket;
	this.scanners = [];
	this.active = true;
}

function Scanner(socket) {
	this.socket = socket;
	this.id = "";
	this.name = "";
}

io.on("connection", function(socket) {

	var type = null, endpoint = null, scanner = null;

	// reqister output connection
	socket.on("endpoint.register", function(msg) {
		if(type === null) {
			if(typeof(endpoints[msg.name]) === "undefined") {
				endpoints[msg.name] = new EndPoint(msg.name, socket);
			} else {
				endpoints[msg.name].socket = socket;
				for(var k in endpoints[msg.name].scanners) {
					var s = endpoints[msg.name].scanners[k];
					socket.emit("scanner.registered", { device_id: s.id, device_name: s.name, endpoint: msg.name });
				}
			}
			endpoint = endpoints[msg.name];
			console.dir(msg);
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
			if(typeof(endpoints[msg.endpoint]) === "undefined") {
				endpoints[msg.endpoint] = new EndPoint(msg.endpoint, null);
			}
			type = con_type.SCANNER;
			scanner = new Scanner(socket);
			scanner.id = msg.device_id;
			scanner.name = msg.device_name;

			endpoints[msg.endpoint].scanners.push(scanner);
			endpoint = endpoints[msg.endpoint];

			console.dir(msg);

			if(endpoint.socket != null)
				endpoint.socket.emit("scanner.registered", msg);
		}
	});
	// when scanned a card
	socket.on("scanner.scanned", function(msg) {
		if(type === con_type.SCANNER) {
			console.dir(msg);
			if((typeof(endpoints[msg.endpoint]) !== "undefined")
					&& endpoints[msg.endpoint].socket != null) {
				endpoints[msg.endpoint].socket.emit("scanner.scanned", { device_id: scanner.id, card_id: msg.card_id });
			}
		}
	});

	socket.on("scanner.settings", function(msg) {
		if(type === con_type.SCANNER) {

		}
	});


	socket.on("disconnect", function() {
		if(type === con_type.SCANNER) {
			if(endpoint != null) {
				if(endpoint.socket != null) {
					endpoint.socket.emit("scanner.disconnected", { device_id: scanner.id });
				}
				var i = endpoint.scanners.indexOf(scanner);
				endpoint.scanners.splice(i, 1);
			}
		}
		if(type === con_type.ENDPOINT) {

		}
	});
});


srv.listen(8080, "0.0.0.0");
console.log("Server running!");
