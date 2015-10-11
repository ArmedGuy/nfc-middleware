var srv = require("http").createServer();
var io = require("socket.io")(srv);

var con_type = { ENDPOINT: 0, SCANNER: 1 }
var endpoints = {}
var scanners = {}

function EndPoint() {
	this.socket;
	this.scanners = [];
	this.active = true;
}

function Scanner(socket) {
	this.socket = socket;
	this.id;
	this.name;
}

io.on("connection", function(socket) {
	
	var type,endpoint,scanner;
	
	// reqister output connection
	socket.on("endpoint.register", function(msg) {
		if(type === undefined) {
			type = con_type.ENDPOINT;
			endpoints[msg.name] = new EndPoint();
			endpoints.socket = socket;
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
		if(type === undefined) {
			if(typeof(endpoint) === "undefined") {
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
			console.dir(endpoint.scanners);
			
			if(typeof(endpoint.socket) !== "undefined")
				endpoint.socket.emit("scanner.register", { id: msg.device_id, name: msg.device_name });
		}
	});
	// when scanned a card
	socket.on("scanner.scanned", function(msg) {
		if(type === con_type.SCANNER) {
			if(typeof(endpoint) !== "undefined") {
				endpoint.socket.emit("scanner.scanned", { scanner_id: scanner.id, card: msg.card_number });
			}
		}
	});
	
	
	socket.on("disconnect", function() {
		
	});
});


srv.listen(8080);