const { createProxyMiddleware } = require('http-proxy-middleware');
     
module.exports = function(app) {
    app.use(createProxyMiddleware('/api/**', { target: 'https://melting-works-backend.herokuapp.com' }));
    app.use(createProxyMiddleware('/otherApi/**', { target: 'https://melting-works-backend.herokuapp.com' }));
};