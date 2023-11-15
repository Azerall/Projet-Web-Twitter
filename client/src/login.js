import { useState } from 'react';
import './index.css';
import logo from './logo.png';
import logoDark from './logo_dark.png';
import axios from 'axios';

function Login(props) {

    const [darkMode, setDarkMode] = useState(false);

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    const getLogin = (evt) => {setLogin(evt.target.value)}
    const getPassword = (evt) => {setPassword(evt.target.value)}

    const [filled, setFilled] = useState(true);
    const [exist, setExist] = useState(true);
    const [passOK, setPassOK] = useState(true);
    
    const submissionHandler = (evt) => {
      evt.preventDefault();
      setFilled(true);
      setExist(true);
      setPassOK(true);
      axios.post('http://localhost:4000/api/user/login', {login, password}, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        credentials: 'include'
      })
      .then(res => { 
        if(res.status === 200) {
          props.login(res.data.userid);
        } 
      })
      .catch((error) => {
        if (error.response.status === 400) {
          setFilled(false);
        } else if (error.response.status === 401) {
          setExist(false);
        } else if (error.response.status === 403 ) {
          setPassOK(false);
        } else {
          console.log("Erreur interne");
        }
      })
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
            <div className="title">Bonjour</div>
            <div className="subtitle">Connecte-toi vite !</div>
            <div className="input-container ic1">
              <input id="login" className="input" type="text" placeholder=" " onChange={getLogin}/>
              <div className="cut"></div>
              <label for="login" className="placeholder">Identifiant</label>
            </div>
            <div className="input-container ic2">
              <input id="signin_mdp1" className="input" type="password" placeholder=" " onChange={getPassword}/>
              <div className="cut cut-long"></div>
              <label for="signin_mdp1" className="placeholder">Mot de passe</label>
            </div>
              <button type="submit" className="submit">Se connecter</button>
              <button type="submit" className="submit" onClick={props.signin}>S'inscrire</button>
              <button type="reset" className="submit">Annuler</button>
              {exist ? <p></p> : <p style={{color:"red"}}>Erreur : utilisateur inconnu</p>}
              {filled ? <p></p> : <p style={{color:"red"}}>Erreur : veuillez remplir tous les champs</p>}
              {passOK ? <p></p> : <p style={{color:"red"}}>Erreur : mot de passe invalide</p>}
          </form>
          </div>
        </div>
    );
}

export default Login;
