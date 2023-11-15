import { useState, useEffect } from 'react'
import './index.css';
import axios from 'axios';

function Parametres(props) {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const getUsername = (evt) => {setUsername(evt.target.value)}
    const getPassword = (evt) => {setPassword(evt.target.value)}

    const [pass1, setPass1] = useState("");
    const [pass2, setPass2] = useState("");
    const getPass1 = (evt) => {setPass1(evt.target.value)};
    const getPass2 = (evt) => {setPass2(evt.target.value)};
    
    const [passLength, setPassLength] = useState(true);
    const [loginLength, setLoginLength] = useState(true);

    const [filled, setFilled] = useState(true);
    const [exist, setExist] = useState(true);
    const [passOK, setPassOK] = useState(true);
    const [passDiff, setPassDiff] = useState(true);

    const [changeUsername, setChangeUsername] = useState(false);
    const [changePassword, setChangePassword] = useState(false);
    const [deleteUser, setDeleteUser] = useState(false);

    const submissionHandlerUsername = (evt) => {
        evt.preventDefault();
        setFilled(true);
        setExist(true);
        setPassOK(true);
        setLoginLength(true);
        if (username.length >= 3 && username.length <= 16) {
            axios.patch(`http://localhost:4000/api/user/${props.user._id}/changeUsername`, {login: username, password}, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => { 
                console.log("Nom d'utilisateur modifié");
                props.setUpdateProfil(!props.updateProfil);
                props.setUpdateMessageStat(!props.updateMessageStat);
                setChangeUsername(false);
            })
            .catch((error) => {
                if (error.response.status === 400) {
                    setFilled(false);
                } else if (error.response.status === 403 ) {
                    setExist(false);
                } else if (error.response.status === 409) {
                    setPassDiff(false);
                } else {
                    console.log("Erreur interne", error);
                }
            })
        } else setLoginLength(false);
      }

      const submissionHandlerPassword = (evt) => {
        evt.preventDefault();
        setFilled(true);
        setPassOK(true);
        setPassDiff(true);
        setPassLength(true);
        if (pass1 === pass2) {
            if (pass1.length >= 6) { 
                axios.patch(`http://localhost:4000/api/user/${props.user._id}/changePassword`, {newpassword: pass1,  password}, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(res => { 
                    console.log("Mot de passe modifié");
                    props.setUpdateProfil(!props.updateProfil);
                    setChangePassword(false);
                })
                .catch((error) => {
                    if (error.response.status === 400) {
                        setFilled(false);
                    } else if (error.response.status === 403 ) {
                        setPassOK(false);
                    } else {
                        console.log(error);
                    }
                })
            }
            else setPassLength(false);
        } else setPassDiff(false);
      }

      const submissionHandlerDelete = (evt) => {
        evt.preventDefault();
        axios.delete(`http://localhost:4000/api/user/${props.user._id}/`)
        .then(res => { 
            console.log("Utilisateur supprimé");
            props.logout();
        })
        .catch((error) => {
            console.log(error);
        })
      }

      const reset = () => {
        setUsername("");
        setPassword("");
        setPass1("");
        setPass2("");
        setFilled(true);
        setPassOK(true);
        setPassDiff(true);
        setExist(true);
        setPassLength(true);
        setLoginLength(true);
      }

    return (
        <article id="article_parametres">
        <div>
            <button onClick={() => props.setDarkMode(!props.darkMode)}>Mode Sombre/Mode Clair</button>
            
            <button onClick={() => { setChangeUsername(!changeUsername); setChangePassword(false); setDeleteUser(false); reset(); }}>Changer le nom d'utilisateur</button>

            { changeUsername ?
                <form className="form_parametres" onSubmit={submissionHandlerUsername}>
                    <div>
                        <label for="username">Nouveau nom d'utilisateur : </label>
                        <input id="username" type="text" onChange={getUsername}/>
                    </div>
                    <div>
                        <label for="password">Mot de passe : </label>
                        <input id="password" type="password" onChange={getPassword}/>
                    </div>
                    <div className="button_parametres">
                        <button type="submit" >Enregistrer</button>
                        <button type="text" onClick={() => setChangeUsername(false)}>Annuler</button>
                    </div>
                    {exist ? <p></p> : <p style={{color:"red"}}>Erreur : cet nom d'utilisateur existe déjà</p>}
                    {filled ? <p></p> : <p style={{color:"red"}}>Erreur : veuillez remplir tous les champs</p>}
                    {passOK ? <p></p> : <p style={{color:"red"}}>Erreur : mot de passe invalide</p>}
                    {loginLength ? <p></p> : <p style={{color:"red"}}>Erreur : Votre Identifiant doit faire au moins 3 caractères et maximum 16 caractères</p>}
                </form>
                :
                ""
            }

            <button onClick={() => { setChangeUsername(false); setChangePassword(!changePassword); setDeleteUser(false); reset(); }}>Modifier le mot de passe</button>

            { changePassword ?
                <form className="form_parametres" onSubmit={submissionHandlerPassword}>
                    <div>
                        <label for="pass1">Nouveau mot de passe : </label>
                        <input id="pass1" type="password" onChange={getPass1}/>
                    </div>
                    <div>
                        <label for="pass2">Confirmation mot de passe : </label>
                        <input id="pass2" type="password" onChange={getPass2}/>
                    </div>
                    <div>
                        <label for="pass">Ancien mot de passe : </label>
                        <input id="pass" type="password" onChange={getPassword}/>
                    </div>
                    <div className="button_parametres">
                        <button type="submit" >Enregistrer</button>
                        <button type="text" onClick={() => setChangePassword(false)}>Annuler</button>
                    </div>
                    {filled ? <p></p> : <p style={{color:"red"}}>Erreur : veuillez remplir tous les champs</p>}
                    {passDiff ? <p></p> : <p style={{color:"red"}}>Erreur : Mots de passe différents</p>}
                    {passOK ? <p></p> : <p style={{color:"red"}}>Erreur : mot de passe invalide</p>}
                    {passLength ? <p></p> : <p style={{color:"red"}}>Erreur : Votre mot de passe doit faire au moins 6 caractères</p>}
                </form>
                :
                ""
            }

            <button onClick={() => { setChangeUsername(false); setChangePassword(false); setDeleteUser(!deleteUser); }}>Supprimer le compte</button>
            { deleteUser ?
                <form className="form_parametres" onSubmit={submissionHandlerDelete}>
                    Etes-vous sûr de vouloir supprimer votre compte ?
                    <div className="button_parametres">
                        <button type="submit" >Oui</button>
                        <button type="text" onClick={() => setDeleteUser(false)}>Annuler</button>
                    </div>
                </form>
                :
                ""
            }
        </div>
        </article>
    );
}

export default Parametres;
