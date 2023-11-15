import { useState, useEffect } from 'react';
import axios from 'axios';

const pictures = require.context('./profil_picture', true);

function FriendList (props) {

    const [listAmi, setListAmi] = useState([]);

    useEffect(() => {
        if (props.top){
            axios.get(`http://localhost:4000/api/user/top`)
            .then(res => { 
                setListAmi(res.data.top);
            })
            .catch((error) => {
                console.log("Erreur récupération des top utilisateurs", error);
            })
        }
        else if (props.followers) {
            axios.get(`http://localhost:4000/api/user/${props.profilUser._id}/followers`)
            .then(res => { 
                setListAmi(res.data.followers);
            })
            .catch((error) => {
                console.log("Erreur récupération des followers", error);
            })
        } else {
            axios.get(`http://localhost:4000/api/user/${props.profilUser._id}/followings`)
            .then(res => { 
                setListAmi(res.data.followings);
            })
            .catch((error) => {
                console.log("Erreur récupération des followings", error);
            })
        }
    }, [props.user]);

    useEffect(() => {
        if (props.top){
            axios.get(`http://localhost:4000/api/user/top`)
            .then(res => { 
                setListAmi(res.data.top);
            })
            .catch((error) => {
                console.log("Erreur récupération des top utilisateurs", error);
            })
        }
        else if (props.followers) {
            axios.get(`http://localhost:4000/api/user/${props.profilUser._id}/followers`)
            .then(res => { 
                setListAmi(res.data.followers);
            })
            .catch((error) => {
                console.log("Erreur récupération des followers", error);
            })
        } else {
            axios.get(`http://localhost:4000/api/user/${props.profilUser._id}/followings`)
            .then(res => { 
                setListAmi(res.data.followings);
            })
            .catch((error) => {
                console.log("Erreur récupération des followings", error);
            })
        }
    }, [props.profilUser]);

    return(
        <section>
            { !props.top && props.followers ? <h2>Liste des abonnés</h2> : ""}
            { !props.top && !props.followers ? <h2>Liste des abonnements</h2> : "" }
            { listAmi.map((ami) => (
                <div className="friend">
                <div key={ami._id} onClick={() => { props.changePage("profil_page"); props.setProfilId(ami._id); }} className="profil-message">
                    <img src={pictures(`./${ami.profil_picture}`)} alt="Photo de profil"/>
                    <p id="profil-message-text">{ami.firstname} {ami.lastname}</p> <p id="profil-message-subtext"> @{ami.login}</p>
                </div>
                </div>
            )) }
            <div className="retour_div">
                {!props.top ? <button id="retour" onClick={() => props.setList("messages_list")}>Retour</button> : ""}
            </div>
        </section>
    );

}

export default FriendList;
