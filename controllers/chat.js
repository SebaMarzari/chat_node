const path = require('path');

const getChat = async (req, res) => {
    const view = path.join(__dirname + '/../views/index.html');
    res.sendFile(view);
}

module.exports = {
    getChat
}