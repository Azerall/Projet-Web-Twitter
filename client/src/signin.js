import { useState } from 'react';
import './index.css';
import logo from './logo.png';
import logoDark from './logo_dark.png';
import axios from 'axios';

function Signin (props) {

  const [darkMode, setDarkMode] = useState(false);

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [passOK, setPassOK] = useState(true);
  const [pass2, setPass2] = useState("");

  const [filled, setFilled] = useState(true);
  const [exist, setExist] = useState(true);

  const [loginLength, setLoginLength] = useState(true);
  const [isValidLogin, setIsValidLogin] = useState(true);
  const regexLogin = /^[a-z\d_\.]{3,16}$/;

  const [isValidPassword, setIsValidPassword] = useState(true);
  const regexPassword = /^[A-Za-z\d@$!%*?&]{6,}$/;
  
  const [isValidEmail, setIsValidEmail] = useState(true);
  const regexEmail = new RegExp("[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$");

  const getLogin = (evt) => {setLogin(evt.target.value)};
  const getFirstName = (evt) => {setFirstName(evt.target.value)};
  const getLastName = (evt) => {setLastName(evt.target.value)};
  const getPassword = (evt) => {setPassword(evt.target.value)};
  const getPass2 = (evt) => {setPass2(evt.target.value)};
  const getEmail = (evt) => {setEmail(evt.target.value)};

  const submissionHandler = (evt) => {
    evt.preventDefault();
    setExist(true);
    setIsValidLogin(true);
    setIsValidEmail(true);
    setIsValidPassword(true);

    if (login.length >= 3 && login.length <= 16) {
      setLoginLength(true);
      if (!regexLogin.test(login)) {
        setIsValidLogin(false);
      }
    }
    else {
      setLoginLength(false);
    }
    

    if (!regexEmail.test(email)) {
      setIsValidEmail(false);
    }

    if (!regexPassword.test(email)) {
      setIsValidPassword(false);
    }

    if (password === pass2) {
      setPassOK(true);
      axios.put('http://localhost:4000/api/user', {login, password, lastname, firstname, email}, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(res => { 
        console.log("Utilisateur inscrit");
        console.log(res.data);
        props.logout();
      })
      .catch((error) => {
        if (error.response.status === 400) {
          setFilled(false);
        } else if (error.response.status === 409) {
          setExist(false);
        } else {
          console.log("Erreur interne");
        }
      })
    }
    else setPassOK(false);
  }

  return (
    <div id="logsignin">
      <div className="form form-logsignin">
        <form onSubmit={submissionHandler}>
          <div id ="entetesitelogo">
            { darkMode ? <img srcSet={logoDark} alt="Main Logo"/> : <img srcSet={logo} alt="Main Logo"/> }
          </div>
          <div id ="entetesite">
            <div className="titre_site" id="titre_site">TwiTerre</div>
          </div>
          <div className="title">Bienvenue</div>

          <div className="subtitle">Rejoins-nous et crée-toi un compte!</div>

          <div className="input-container ic1">
            <input id="firstname" className="input" type="text" placeholder=" " onChange={getFirstName}/>
            <div className="cut"></div>
            <label for="firstname" className="placeholder">Prénom</label>
          </div>

          <div className="input-container ic2">
            <input id="lastname" className="input" type="text" placeholder=" " onChange={getLastName}/>
            <div className="cut cut-long"></div>
            <label for="lastname" className="placeholder">Nom de famille</label>
          </div>

          <div className="input-container ic2">
            <input id="login" className="input" type="text" placeholder=" " onChange={getLogin}/>
            <div className="cut"></div>
            <label for="login" className="placeholder">Identifiant</label>
          </div>
          <div className="input-container ic2">
            <input id="email" className="input" type="text" placeholder=" " onChange={getEmail}/>
            <div className="cut cut-short"></div>
            <label for="email" className="placeholder">Email</label>
          </div>
          <div className="input-container ic2">
            <input id="signin_mdp1" className="input" type="password" placeholder=" " onChange={getPassword}/>
            <div className="cut cut-long"></div>
            <label for="signin_mdp1" className="placeholder">Mot de passe</label>
          </div>
          <div className="input-container ic2">
            <input id="signin_mdp2" className="input" type="password" placeholder=" " onChange={getPass2}/>
            <div className="cut cut-verylong"></div>
            <label for="signin_mdp2" className="placeholder">Confirmation du mot de passe</label>
          </div>
          <button type="submit" className="submit">S'inscrire</button>
          <button type="reset" className="submit">Annuler</button>
          <button type="text" className="submit" onClick={props.logout}>Déjà inscrit ?</button>
          {filled ? <p></p> : <p style={{color:"red"}}>Erreur : Veuillez remplir tous les champs</p>}
          {passOK ? <p></p> : <p style={{color:"red"}}>Erreur : Mots de passe différents</p>}
          {isValidPassword ? <p></p> : <p style={{color:"red"}}>Erreur : Votre mot de passe doit faire au moins 6 caractères</p>}
          {loginLength ? <p></p> : <p style={{color:"red"}}>Erreur : Votre identifiant doit faire au moins 3 caractères et maximum 16 caractères</p>}
          {isValidLogin ? <p></p> : <p style={{color:"red"}}>Erreur : Identifiant incorrect</p>}
          {exist ? <p></p> : <p style={{color:"red"}}>Erreur : Utilisateur déjà existant</p>}
          {isValidEmail ? <p></p> :  <p style={{color:"red"}}>Erreur : Adresse e-mail invalide</p>}
        </form>
      </div>
    </div>
  );
}

export default Signin;
