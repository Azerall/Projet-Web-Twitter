import { useState } from "react";

function Logout (props) {

    const [logout, setLogout] = useState(false);

    return (
        <div>
            <button className="button" onClick={() => {setLogout(!logout)}}>Déconnexion</button>
            { logout ?
                <form className="form_parametres" onSubmit={props.logout}>
                    Etes-vous sûr de vouloir vous déconnecter ?
                    <div className="button_logout">
                        <button type="submit">Oui</button>
                        <button type="text" onClick={() => setLogout(false)}>Non</button>
                    </div>
                </form>
                :
                ""
            }
        </div>
    );
}

export default Logout;