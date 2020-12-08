// Import des packages
const Sauce = require('../models/Sauces');
const fs = require('fs');

// Fonction de création de sauce
exports.createSauces = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Objet Validé!' }))
        .catch(error => res.status(400).json({ error }));
}

// Fonction de modification de sauce
exports.modifySauces = (req, res, next) => {
    const sauceObject = req.file ?
        { 
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet Modifié!' }))
        .catch(error => res.status(400).json({ error }));
};

// Fonction de suppression de sauce
exports.deleteSauces = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet Supprimé!' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

// Fonction de récupération d'une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
};

// Fonction de récupération de toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

// Fonction de gestion des likes / dislikes
exports.addLikes = (req, res, next) => {
    let userId = req.body.userId, like = req.body.like;
    Sauce.findOne({ _id: req.params.id }).exec(function (error, sauce){
        let msg = "", usersL = sauce.usersLiked.indexOf(userId), usersD = sauce.usersDisliked.indexOf(userId);

    if(like == 0 && usersL >-1){
        sauce.likes--;
        sauce.usersLiked.splice(usersL,1);
        msg = "Unliked !";
    } else if(like == 0 && usersD >-1){
        sauce.dislikes--;
        sauce.usersDisliked.splice(usersD,1);
        msg = "Undisliked !";
    };
  
    if(like == 1){
        sauce.likes++;
        if (sauce.usersLiked.length > 0){
          sauce.usersLiked=[userId];
        } else{
          sauce.usersLiked.push(userId);
        }
        msg = "Like pris en compte !";
    };
  
    if(like == -1){
        sauce.dislikes++;
        if (sauce.usersDisliked.length > 0){
          sauce.usersDisliked=[userId];
        } else{
          sauce.usersDisliked.push(userId);
        }
        msg = "Dislike pris en compte !";
    };
  
    sauce.save()
        .then(() => res.status(201).json({ message: msg}))
        .catch(error => res.status(400).json({ error }));
    });
};
