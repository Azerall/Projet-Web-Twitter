const express = require("express");
const Users = require("./entities/users.js");
const Messages = require("./entities/messages.js");

function init(db) {
    const router = express.Router();
    // On utilise JSON
    router.use(express.json());
    // simple logger for this router's requests
    // all requests to this router will first hit this middleware
    router.use((req, res, next) => {
        console.log('API: method %s, path %s', req.method, req.path);
        console.log('Body', req.body);
        next();
    });


    // Users

    const users = new Users.default(db);

    //login
    router.post("/user/login", async (req, res) => {
        try {
            const { login, password } = req.body;
            // Erreur sur la requête HTTP
            if (!login || !password) {
                res.status(400).json({
                    status: 400,
                    "message": "Requête invalide : login et password nécessaires"
                });
                return;
            }
            if(! await users.exists(login)) {
                res.status(401).json({
                    status: 401,
                    message: "Utilisateur inconnu"
                });
                return;
            }
            let userid = await users.checkpassword(login, password);
            if (userid) {
                req.session.regenerate(function (err) {
                    if (err) {
                        res.status(500).json({
                            status: 500,
                            message: "Erreur interne"
                        });
                    }
                    else {
                        // C'est bon, nouvelle session créée
                        req.session.userid = userid;
                        req.session.isAuthenticated = true;
                        res.status(200).json({
                            status: 200,
                            message: "Login et mot de passe accepté",
                            userid: userid
                        });
                    }
                });
                return;
            }
            // Faux login : destruction de la session et erreur
            req.session.destroy((err) => { });
            res.status(403).json({
                status: 403,
                message: "login et/ou le mot de passe invalide(s)"
            });
            return;
        }
        catch (e) {
            // Toute autre erreur
            res.status(500).json({
                status: 500,
                message: "erreur interne",
                details: (e || "Erreur inconnue").toString()
            });
        }
    });

    //searchUser
    router.get("/user/search", async (req, res) => {
        try {
            const { q: searchText } = req.query;
            const resultat = await users.search(searchText);
            res.send(resultat);
        } catch (e) {
            res.status(500).send(e.message);
        }
    });

    //Redirection vers la page d'accueil' de l'utilisateur si son cookie n'a pas expiré
    router.get('/user/check', async (req, res) => {
        if (req.session.isAuthenticated) {
            console.log(`Found User Session`.green);
            res.redirect('/api/user/'+req.session.userid);
        }
    });

    //topUsers
    router.get("/user/top", async (req, res) => {
        try {
            const resultat = await users.topUsers();
            res.status(200).send({top : resultat});
        } catch (e) {
            res.status(500).send(e.message);
        }
    });

    router
        .route("/user/:user_id")
    //getUser
        .get(async (req, res) => {
        try {
            const user = await users.get(req.params.user_id);
            if (!user)
                res.sendStatus(404);
            else
                res.send(user);
        }
        catch (e) {
            res.status(500).send(e);
        }
    })
    //editUser
        .patch(async (req, res) => {
        try {
            const { lastname, firstname, email, description, profil_picture } = req.body;
            if (!lastname || !firstname || !email || !description || !profil_picture) {
                res.status(400).send("Missing fields");
            } else {
                users.editUser(req.params.user_id, lastname, firstname, email, description, profil_picture)
                    .then(res.status(200).json({
                        status: 200,
                        message: "User modifié"
                    }))
                    .catch((err) => res.status(500).send(err));
            }                    
        } catch (e) {
            res.status(500).send(e);
        }
    })
    //deleteUser
        .delete(async (req, res) => {
        try {
            await users.delete(req.params.user_id);
            res.send(`delete user ${req.params.user_id}`)
        } catch (e) {
            res.status(500).send(e);
        }
    });

    //changeUsername
    router.patch('/user/:user_id/changeUsername', async (req, res) => {
        try {
            const { login, password } = req.body;
            if (!login || !password) {
                res.status(400).send("Missing fields");
                return;
            }

            let user = await users.get(req.params.user_id);
            let userid = await users.checkpassword(user.login, password);
            if (userid) {
                if(await users.exists(login)) {
                    res.status(409).json({
                        status: 409,
                        message: "username déjà utilisé"
                    });
                    return;
                } else {
                    users.changeUser(req.params.user_id, login, password)
                    .then((user_id) => res.status(201).send({ id: user_id }))
                    .catch((err) => res.status(500).send(err));
                    return;
                } 
            } else {
                res.status(403).json({
                    status: 403,
                    message: "login et/ou le mot de passe invalide(s)"
                });
                return;
            }
        }
        catch (e) {
            // Toute autre erreur
            res.status(500).json({
                status: 500,
                message: "erreur interne",
                details: (e || "Erreur inconnue").toString()
            });
        }
    });

    //changePassword
    router.patch('/user/:user_id/changePassword', async (req, res) => {
        try {
            const { newpassword, password } = req.body;
            if (!newpassword || !password) {
                res.status(400).send("Missing fields");
                return;
            }
            let user = await users.get(req.params.user_id);
            let userid = await users.checkpassword(user.login, password);
            if (userid) {
                users.changeUser(req.params.user_id, user.login, newpassword)
                    .then((user_id) => res.status(201).send({ id: user_id }))
                    .catch((err) => res.status(500).send(err));
                    return;
            } else {
                res.status(403).json({
                    status: 403,
                    message: "login et/ou le mot de passe invalide(s)"
                });
                return;
            }
        }
        catch (e) {
            // Toute autre erreur
            res.status(500).json({
                status: 500,
                message: "erreur interne",
                details: (e || "Erreur inconnue").toString()
            });
        }
    });

    //createUser
    router
        .route("/user")
        .put(async (req, res) => {
        try{
            const { login, password, lastname, firstname, email } = req.body;
            if (!login || !password || !lastname || !firstname || !email) {
                res.status(400).send("Missing fields");
            }
            if(await users.exists(login)) {
                res.status(409).json({
                    status: 409,
                    message: "Username déjà utilisé"
                });
                return;
            }
            else {
                users.create(login, password, lastname, firstname, email)
                    .then((user_id) => res.status(201).send({ id: user_id }))
                    .catch((err) => res.status(500).send(err));
            }
        }
        catch (e) {
            // Toute autre erreur
            res.status(500).json({
                status: 500,
                message: "erreur interne",
                details: (e || "Erreur inconnue").toString()
            });
        }
    })

    //logout
    router.delete('/user/:user_id/logout', (req, res) => {
        if (req.session) {
            req.session.destroy(err => {
                if (err) {
                      res.status(400).send('Unable to log out');
                } else {
                    console.log("Cookie cleared");
                    res.clearCookie('cookie_twister');
                    res.send('Logged out');
                }
            });
        } else {
            res.end();
        }
    })

    router
        .route("/user/:user_id/:follow_id")
    //follow
        .post(async (req, res) => {
        try {
            await users.addFollow(req.params.user_id, req.params.follow_id);
            res.status(200).send('New follower');
        }
        catch (e) {
            res.status(500).send(e);
        }
    })
    //unfollow
        .delete(async (req, res) => {
        try {
            await users.deleteFollow(req.params.user_id, req.params.follow_id);
            res.status(200).send('Follower removed');
        }
        catch (e) {
            res.status(500).send(e);
        }
    });

    //getListFollowers
    router.get("/user/:user_id/followers",  async function(req, res){
        try {
            const followers = await users.getListFollowers(req.params.user_id);
            res.status(200).json({followers});
        } catch (err) {
            res.status(500).send(err);
        }
    });

    //getListFollowings
    router.get("/user/:user_id/followings",  async function(req, res){
        try {
            const followings = await users.getListFollowings(req.params.user_id);
            res.status(200).json({followings});
        } catch (err) {
            res.status(500).send(err);
        }
    });


    // Messages
    const messages = new Messages.default(db);

    //createMessage
    router.put("/message/:user_id", async (req, res) => {
        const { text } = req.body;
        const authorid = req.params.user_id; 
        if (!text ) {
            res.status(400).send("Missing fields");
        } else {
            messages.create(authorid, text)
                .then((messageid) => res.status(201).send({ id: messageid }))
                .catch((err) => res.status(500).send(err));
        }
    })

    router
        .route("/message/:user_id/:message_id")
    //editMessage
        .patch((req, res) => {
            const { text } = req.body;
            const authorid = req.params.user_id; 
            const messageid = req.params.message_id; 
            if (!text) {
                res.status(400).send("Missing fields");
            } else {
                messages.set(authorid, messageid, text)
                    .then((message) => res.status(200).send({ status: 200, message : message }))
                    .catch((err) => res.status(500).send(err));
            }
        })
    //deleteMessage
        .delete((req, res) =>{
            const authorid = req.params.user_id; 
            const messageid = req.params.message_id; 
            messages.delete(authorid, messageid)
                .then(() => res.status(200).send({ status: 200, comment: "Message supprimé" }))
                .catch((err) => res.status(500).send(err));
        });

    //getListMessageFromFollowings + MessageFromUser
    router.get("/message/:user_id/followings", (req, res) => {
        const authorid = req.params.user_id; 
        messages.getListMessagesFromFollowing(authorid)
            .then((listmessage) => 
                res.status(200).send({listmessage})
            )
            .catch((err) => res.status(500).send(err));
    });

    //trendings
    router.get("/message/trendings", (req, res) => {
		messages.trendings()
            .then((listmessage) => res.status(200).send({listmessage}))
            .catch((err) => res.status(500).send(err));
    });

    //getListMessageFromUser
    router.get("/message/:user_id", (req, res) => {
        const authorid = req.params.user_id; 
        if (!authorid) {
            res.status(400).send("Missing authorid");
        } 
        else {
            messages.getListMessagesFromUser(authorid)
                .then((listmessage) => res.status(200).send({listmessage}))
                .catch((err) => res.status(500).send(err));
        }
    });

    //getListMessage
    router.get("/message", (req, res) => {
		messages.getListMessages()
            .then((listmessage) => res.status(200).send({listmessage}))
            .catch((err) => res.status(500).send(err));
    });

    
    
    router
        .route("/message/:user_id/comments/:message_id")
    //addComment
	    .put((req, res) => {
            const { text } = req.body;
            const authorid = req.params.user_id; 
            const messageid = req.params.message_id;
            if (!text) {
                res.status(400).send("Missing fields");
            } else {
                messages.addComment(messageid, authorid, text)
                    .then((id) => res.status(200).send({id: id}))
                    .catch((err) => res.status(500).send(err));;

            }
        })

    //getComments
        .get((req, res) => {
            const messageid = req.params.message_id;
            messages.getComments(messageid)
                .then((comments) => res.status(200).json({comments}))
                .catch((err) => res.status(500).send(err));;
        });

    router
        .route("/message/:user_id/comments/:message_id/:comment_id")
    //editComment
        .patch((req, res) => {
            const { text } = req.body;
            const authorid = req.params.user_id; 
            const messageid = req.params.message_id;
            const commentid = req.params.comment_id;
            if (!text) {
                res.status(400).send("Missing fields");
            } else {
                messages.setComment(messageid, authorid, commentid, text)
                    .then((comment) => res.status(200).send({comment: comment}))
                    .catch((err) => res.status(500).send(err));

            }
        })
    //removeComment
        .delete((req, res) => {
            const authorid = req.params.user_id; 
            const messageid = req.params.message_id;
            const commentid = req.params.comment_id;
            messages.deleteComment(messageid, authorid, commentid)
                .then((message) => res.status(200).send({message : message}))
                .catch((err) => res.status(500).send(err));

        })
    
    router
        .route("/message/:user_id/like/:message_id")
    //like
	    .put((req, res) => {
            const liker = req.params.user_id; 
            const messageid = req.params.message_id;
            messages.like(messageid, liker)
                .then((nb) => res.status(200).send({nbLikes : nb, comment: `Un like de plus`}))
                .catch((err) => res.status(500).send(err));
        })
	//unlike
	    .delete((req, res) => {
            const liker = req.params.user_id; 
            const messageid = req.params.message_id;
            messages.unlike(messageid, liker)
                .then((nb) => res.status(200).send({nbLikes : nb, comment: `Un like de moins`}))
                .catch((err) => res.status(500).send(err));
        })
    //getNbLikes
        .get((req, res) => {
            const messageid = req.params.message_id;
            messages.nbLikes(messageid)
                .then((nb) => res.status(200).send({nb : nb}))
                .catch((err) => res.status(500).send(err));

        });

    //nombre de likes au total
    router.get("/message/:user_id/stats/like",  (req, res) =>{
        const userid = req.params.user_id;
        messages.LikeCountPerUser(userid)
            .then((nb) => res.status(200).send({nb : nb}))
            .catch((err) => res.status(500).send(err));
    }); 

    //nombre de messages au total
    router.get("/message/:user_id/stats/messages",  (req, res) =>{
        const userid = req.params.user_id;
        messages.MessageCountPerUser(userid)
            .then((nb) => res.status(200).send({nb : nb}))
            .catch((err) => res.status(500).send(err));
    }); 

    return router;
}
exports.default = init;
