// Polyfill plus robuste pour crypto dans NestJS avec TypeORM
const crypto = require('crypto');

// Définir crypto globalement
global.crypto = {
    // Implémentation directe de randomUUID
    randomUUID: () => crypto.randomUUID(),

    // Autres méthodes qui pourraient être utilisées
    getRandomValues: (buffer) => {
        const bytes = crypto.randomBytes(buffer.length);
        buffer.set(new Uint8Array(bytes));
        return buffer;
    }
};

console.log("Polyfill crypto chargé avec succès");