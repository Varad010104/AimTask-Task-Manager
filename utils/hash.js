/**
 * bcrypt ek password-hashing library hai.

    Jab user signup/login karta hai, tu uska password directly database me store nahi karna chahiye ❌.

    Agar koi tera database hack kare to seedha password mil jaayega.

    Isliye bcrypt password ko ek hash me convert kar deta hai jo irreversible hota hai.
 */

const bcrypt = require("bcrypt");
const saltRounds = 10;

/**
 * saltRounds = 10 → iska matlab bcrypt 2¹⁰ (1024) iterations karega hash banane me → thoda slow hoga but secure hoga.

* salt ek random string hota hai jo har password ke saath add hota hai → isse same password ka bhi alag hash banta hai.
 */

async function hashPassword(password) {
  return await bcrypt.hash(password, saltRounds);
}

async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

module.exports = {
  hashPassword,
  comparePassword,
};

/**
 * ⚡ Hashing vs Encryption

Encryption → reversible hai (decrypt karke original data nikal sakte ho).

Hashing (bcrypt) → irreversible hai, original password wapas nahi nikal sakte.

Isliye jab login hota hai, tu password ko dobara hash karta hai aur compare karta hai hash ke sath.
 */
