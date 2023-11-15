import { useState, useEffect } from 'react';
import Login from './login';
import Signin from './signin';
import NavigationPanel from './navigation_panel';
import Statistiques from './statistics';
import MessagePage from './message_page';
import ProfilPage from './profil_page';
import Parametres from './parameters'
import SearchBar from './search_bar'
import logo from './logo.png';
import logoDark from './logo_dark.png';
import './index.css';
import axios from 'axios';

function MainPage (props) {
  const [isConnected, setConnect] = useState(false);
  const [page, setPage] = useState("log_page");
  const [TitrePage, setTitre] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const [user, setUser] = useState(null);
  const [profilId, setProfilId] = useState(null);
  const [updateProfil, setUpdateProfil] = useState(true);
  const [updateMessageStat, setUpdateMessageStat] = useState(true);
  
  useEffect(() => {
    setUpdateMessageStat(!updateMessageStat);
  }, []);

  useEffect(() => {
    axios.get('http://localhost:4000/api/user/check', { withCredentials: true })
    .then(res => {
      console.log("Session active");
      setConnect(true);
      setUser(res.data);
      setProfilId(res.data._id);
      changePage('message_page');
    })
    .catch((error) => {
      setConnect(false);
    });
  }, []);

  const getConnected = (userid) => {
    setConnect(true);
    axios.get(`http://localhost:4000/api/user/${userid}`)
    .then(res => { 
      setUser(res.data);
      setProfilId(res.data._id);
      changePage("message_page");
    })
    .catch((error) => {
      console.log(error);
    })
  }

  const setLogout = () => {
    setConnect(false);
    setPage("log_page");
    if (user != null) {
      axios.delete(`http://localhost:4000/api/user/${user._id}/logout`, { withCredentials: true })
    .then(res => { 
      console.log(res.data);
    })
    .catch((error) => {
      console.log(error);
    })
    }
  }

  const getSignin = () => {
    setPage("signin_page");
  }

  const changePage = (page) => {
    setPage(page);
    if (page==="message_page") setTitre("Accueil");
    else if (page==="profil_page") {
      setTitre("Profil");
      setUpdateProfil(!updateProfil);
    }
    else if (page==="parametres") setTitre("Paramètres");
  }

  useEffect(() => {
    // Appliquer la classe darkMode au body lorsque le mode est activé
    const body = document.querySelector('body');
    if (body) {
      body.classList.toggle('darkMode', darkMode);
    }
  }, [darkMode]);

  return (

    <div>
      { isConnected ? 
        <header>
          <div className="logo" id="logo">
            { darkMode ? <img srcSet={logoDark} alt="Main Logo"/> : <img srcSet={logo} alt="Main Logo"/> }
            <div className="titre_site" id="titre_site">TwiTerre</div>
          </div>
          
          <div className="titre" id="titre">{TitrePage}</div>

          <div className="search" id="search">
            { isConnected ? <SearchBar changePage={changePage} setProfilId={setProfilId} updateProfil={updateProfil} setUpdateProfil={setUpdateProfil} /> : "" }
          </div>
        </header>
        : ""
      }
    
      <main>
        { page==="log_page"? <Login login={getConnected} signin={getSignin}/> : "" }
        { page==="signin_page"? <Signin logout={setLogout}/> : "" }
        { isConnected ? <NavigationPanel changePage={changePage} logout={setLogout} user={user} setProfilId={setProfilId} updateProfil={updateProfil} setUpdateProfil={setUpdateProfil} /> : "" }
        { page==="message_page"? <MessagePage user={user} changePage={changePage} setProfilId={setProfilId} updateMessageStat={updateMessageStat} setUpdateMessageStat={setUpdateMessageStat} /> : "" }
        { page==="profil_page"? <ProfilPage user={user} setUser={setUser} profilId={profilId} changePage={changePage} setProfilId={setProfilId} updateProfil={updateProfil} setUpdateProfil={setUpdateProfil} /> : "" }
        { page==="parametres"? <Parametres user={user} logout={setLogout} darkMode={darkMode} setDarkMode={setDarkMode} updateProfil={updateProfil} setUpdateProfil={setUpdateProfil} updateMessageStat={updateMessageStat} setUpdateMessageStat={setUpdateMessageStat} /> : "" }
        { isConnected ? <Statistiques user={user} changePage={changePage} setProfilId={setProfilId} updateMessageStat={updateMessageStat} setUpdateMessageStat={setUpdateMessageStat} /> : "" }
      </main>

    </div>
  );
}

export default MainPage;
