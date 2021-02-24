module.exports = function(RED) {
    "use strict";
    const https = require('https');

    function TechulusPushNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.title = config.title;
        node.link = config.link;

        var credentials = node.credentials;
        if ((credentials) && (credentials.hasOwnProperty("apikey"))) {
            node.apikey = credentials.apikey;
        } else {
            node.log("Techulus API key not set!");
        }

        node.on("input", function(msg, send, done) {
            node.status({});
            if (!node.apikey) {
                if (done) {
                    done("API key not set!");
                } else {
                    node.error("API key not set!", msg);
                }
                return false;;
            }
            if (!msg.payload) {
                if (done) {
                    done("No msg.payload found!")
                } else {
                    node.error("No msg.payload found!", msg)
                }
            } else if (typeof(msg.payload) == 'object') {
                msg.payload = JSON.stringify(msg.payload);
            } else {
                msg.payload = String(msg.payload);
            }

            let notification = {
                'title': node.title || msg.topic || 'Node-RED',
                'body': msg.payload,
                'link': node.link || msg.link || null,
            };
            if (!notification['link']) {
                delete notification['link'];
            }

            var data = JSON.stringify(notification);
            var options = {
                hostname: "push.techulus.com",
                port: 443,
                path: "/api/v1/notify",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': node.apikey,
                    'Content-Length': data.length
                }
            }

            var req = https.request(options, res => {
                node.trace(`statusCode: ${res.statusCode}`)

                res.on('data', d => {
                    let result = JSON.parse(d);
                    if (result.success) {
                        // A call has as many responses as there are registered devices.
                        // Log each response, and accumulate their counts for the status.
                        let messages = {},
                            color = "green";
                        result.responses.forEach((response) => {
                            if (response.success) {
                                node.log(response.message);
                            } else {
                                node.error(response.message);
                                color = "red";
                            }
                            messages[response.message] = messages[response.message] + 1 || 1
                        });
                        let message = "";
                        for (const [msg, count] of Object.entries(messages)) {
                            if (count > 1) {
                                message += `, ${msg} (${count} times)`;
                            } else {
                                message += `, ${msg}`;
                            }
                        }
                        message = message.substr(2);
                        node.status({fill: color, shape: "dot", text: message});
                    }
                    if (done) {
                        done();
                    }
                });
            });

            req.on('error', error => {
                node.status({fill: "red", shape: "ring", text: error});
                if (done) {
                    done(error)
                } else {
                    node.error(error, msg)
                }
            });

            req.write(data);
            req.end();
        });
    }

    RED.nodes.registerType("techulus-push", TechulusPushNode, {
        credentials: {
            apikey: {
                type: "text"
            }
        }
    });
}
