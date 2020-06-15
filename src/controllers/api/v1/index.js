const create = require('../../create');

module.exports = {
    url: "https://api.github.com/users/username/repos",
    jsonp: true,
    method: "GET",
    dataType: "json",
    success: function(res) {
        console.log(res)
    },
    getStatus: create((req, res) => {
        res.status(200).json({ status: 'Running' });
    }),

};