import Logout from './logout';
import './index.css';

function NavigationPanel(props) { // un composant par page
    return (
        <aside>
            <nav>
                <button onClick={() => props.changePage("message_page")}>Accueil</button>

                <button onClick={() => {
                    props.changePage("profil_page");
                    props.setProfilId(props.user._id);
                    props.setUpdateProfil(!props.updateProfil);
                }}>Profil</button>

                <button onClick={() => props.changePage("parametres")}>Paramètres</button>

                <Logout logout={props.logout}/>
            </nav>
        </aside>
    );
}

export default NavigationPanel;
