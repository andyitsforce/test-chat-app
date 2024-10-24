var app = require('http').createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('okay!');
})
var io = require('socket.io')(app, {
    allowEIO3: true
});
var siofu = require('socketio-file-upload');
var fs = require('fs');
var roomUsers = {};

app.listen(8080, function () {
    console.log('listening');
});

io.on('connection', function (socket) {
    /**********************************************
     CUSTOMER
     ***********************************************/
    socket.on('newCustomerConneted', function (details) {
        var index = details.customerData.uniqueId;
        roomUsers[index] = socket.id;
        Object.keys(roomUsers).forEach(function (key, value) {
            if (key === details.receiverUniqueId) {
                let receiverSocketId = roomUsers[key];
                socket.broadcast.to(receiverSocketId).emit('seller:received:refresh-seller-chat-list', details);
            }
        });
    });
    socket.on('customer:send:new-message', function (data) {
        try {
            if (typeof (data) !== 'undefined') {
                Object.keys(roomUsers).forEach(function (key, value) {
                    if (key === data.receiverUniqueId) {
                        let receiverSocketId = roomUsers[key];
                        socket.broadcast.to(receiverSocketId).emit('seller:received:new-message', data);
                    }
                });
            }
        } catch (e) {
            console.log("ERROR:" + e);
        }

    });
    socket.on('customer:send:customer-profile-change', function (data) {
        try {
            if (typeof (data) !== 'undefined') {
                Object.keys(roomUsers).forEach(function (key) {
                    Object(data.receiverList).forEach(function (receiverId) {
                        if (key === receiverId) {
                            const receiverSocketId = roomUsers[key];
                            socket.broadcast.to(receiverSocketId).emit('seller:received:customer-profile-change',
                                data.profileData
                            );
                        }
                    })
                })
            }
        } catch (e) {
            console.log("ERROR:" + e);
        }
    });

    socket.on('customer:send:start-new-conversation', function (data) {
        try {
            if (typeof (data) !== 'undefined') {
                Object.keys(roomUsers).forEach(function (key) {
                    if (key === data.receiverId) {
                        const receiverSocketId = roomUsers[key];
                        socket.broadcast.to(receiverSocketId).emit(
                            'seller:received:new-conversation',
                            {
                                'newConversation': data.newConversation,
                                'newMessage': data.newMessage ? data.newMessage : ''
                            }
                        );
                    }
                })
            }
        } catch (e) {
            console.log("ERROR:" + e);
        }

    });
    socket.on('customer:send:customer-status-change', function (data) {
        try {
            if (typeof (data) !== 'undefined') {
                Object.keys(roomUsers).forEach(function (key) {
                    Object(data.receiverList).forEach(function (receiverId) {
                        if (key === receiverId) {
                            const receiverSocketId = roomUsers[key];
                            socket.broadcast.to(receiverSocketId).emit(
                                'seller:received:customer-status-change',
                                {
                                    status: data.status,
                                    uniqueId: data.uniqueID
                                }
                            );
                        }
                    })
                })
            }
        } catch (e) {
            console.log("ERROR:" + e);
        }
    })

    socket.on('customer:send:block-event', function (data) {
        try {
            if (typeof (data) !== 'undefined') {
                Object.keys(roomUsers).forEach(function (key, value) {
                    if (key === data.customerUniqueId) {
                        let receiverSocketId = roomUsers[key];
                        socket.broadcast.to(receiverSocketId).emit('customer blocked by seller', data);
                    }
                });
            }
        } catch (e) {
            console.log("ERROR:" + e);
        }
    });
    socket.on('customer:send:typing-message', function (data) {
        try {
            if (typeof (data) !== 'undefined') {
                Object.keys(roomUsers).forEach(function (key, value) {
                    Object(data.receiverList).forEach(function (receiverId) {
                        if (key === receiverId) {
                            const receiverSocketId = roomUsers[key];
                            socket.broadcast.to(receiverSocketId).emit(
                                'seller:received:typing-message',
                                {
                                    name: data.name,
                                    message: data.message,
                                    conversationUniqueId: data.conversationUniqueId,
                                    uniqueId: receiverId
                                }
                            );
                        }
                    });
                });
            }
        } catch (e) {
            console.log("ERROR:" + e);
        }
    });
    /**********************************************
     SELlER
     ***********************************************/
    socket.on('newSellerConneted', function (details) {
        var index = details.uniqueId;
        roomUsers[index] = socket.id;

    });
    socket.on('seller:send:seller-profile-change', function (data) {
        try {
            if (typeof (data) !== 'undefined') {
                Object.keys(roomUsers).forEach(function (key) {
                    Object(data.receiverList).forEach(function (receiverId) {
                        if (key === receiverId) {
                            const receiverSocketId = roomUsers[key];
                            socket.broadcast.to(receiverSocketId).emit('customer:received:seller-profile-change',
                                data.profileData
                            );
                        }
                    })
                })
            }
        } catch (e) {
            console.log("ERROR:" + e);
        }

    });
    socket.on('seller:send:new-message', function (data) {
        try {
            if (typeof (data) !== 'undefined') {
                Object.keys(roomUsers).forEach(function (key, value) {
                    if (key === data.receiverUniqueId) {
                        receiverSocketId = roomUsers[key];
                        socket.broadcast.to(receiverSocketId).emit('customer:received:new-message', data);
                    }
                });
            }
        } catch (e) {
            console.log("ERROR:" + e);
        }

    });
    socket.on('seller:send:seller-status-change', function (data) {
        try {
            if (typeof (data) !== 'undefined') {
                Object.keys(roomUsers).forEach(function (key, value) {
                    Object(data.receiverList).forEach(function (receiverId) {
                        if (key === receiverId) {
                            const receiverSocketId = roomUsers[key];
                            socket.broadcast.to(receiverSocketId).emit(
                                'customer:received:seller-status-change',
                                {
                                    status: data.status,
                                    uniqueId: data.uniqueId
                                }
                            );
                        }
                    });
                });
            }
        } catch (e) {
            console.log("ERROR:" + e);
        }
    });
    socket.on('seller:send:typing-message', function (data) {
        try {
            if (typeof (data) !== 'undefined') {
                Object.keys(roomUsers).forEach(function (key, value) {
                    Object(data.receiverList).forEach(function (receiverId) {
                        if (key === receiverId) {
                            const receiverSocketId = roomUsers[key];
                            socket.broadcast.to(receiverSocketId).emit(
                                'customer:received:typing-message',
                                {
                                    name: data.name,
                                    message: data.message,
                                    conversationUniqueId: data.conversationUniqueId,
                                    uniqueId: receiverId
                                }
                            );
                        }
                    });
                });
            }
        } catch (e) {
            console.log("ERROR:" + e);
        }
    });

});
