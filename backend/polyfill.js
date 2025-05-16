// Polyfill pour le module crypto
global.crypto = require('crypto-browserify');
global.crypto.randomUUID = () => {
    return require('crypto').randomUUID();
};