const User = require("../Models/User");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    console.log("je suis dans le middleware");
    // Etape 1 : récupérer le token :
    const sentToken = req.headers.authorization.replace("Bearer ", "");
    // Etape 2 : retirer le "Bearer " devant celui-ci :
    // Etape 3 : chercher la correspondance du token avec un utilisateur de la BDD
    const tokenUser = await User.findOne({ token: sentToken });
    if (tokenUser) {
      req.token = sentToken;
      console.log("autorisé");
      next();
    } else {
      res.status(401).json("unauthorized");
    }
  } else {
    res.status(401).json("unauthorized");
  }
};

module.exports = isAuthenticated;
