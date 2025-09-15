const userModal = require("../models/user");
async function findEmail(email) {
  let result = await userModal.findOne({ email });
  if (result) { //If it not null
    return true;
  }
  return false;
}

module.exports = {
  findEmail,
};
