import axios from 'axios';
import { useState, useEffect } from 'react';
import './index.css';
import MessageList from './message_list';
import FriendList from './friend_list';


function Statistiques(props) { 

    const [updateListMessage, setUpdateListMessage] = useState(true);

    useEffect(() => {
        setUpdateListMessage(!updateListMessage);
    }, []);

    const [nbLikes, setNbLikes] = useState();
    const [nbMessages, setNbMessages] = useState();

    useEffect(() => {
        if (props.user){
            axios.get(`http://localhost:4000/api/message/${props.user._id}/stats/like`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => { 
                setNbLikes(res.data.nb);
            })
            .catch((error) => {
                console.log("Erreur", error);
            })
        }
    }, [props.updateMessageStat, props.user]);

    useEffect(() => {
        if (props.user){
            axios.get(`http://localhost:4000/api/message/${props.user._id}/stats/messages`)
            .then(res => { 
                setNbMessages(res.data.nb);
            })
            .catch((error) => {
                console.log("Erreur", error);
            })
        }
    }, [props.updateMessageStat, props.user]);

    return (
        <aside>
            <div className="titre_stats" id="titre_stats">Statistiques</div>
            <div> ‣ Vous avez reçu <p id="number">  {nbLikes}</p> "J'aime" au total.</div>
            <div> ‣ Vous avez posté <p id="number"> {nbMessages}</p> messages au total.</div>

                <div className="mini_titre_stats" id="mini_titre_stats">Tendances</div>
                { <MessageList user={props.user} profilUser={props.user} onlyUser={false} changePage={props.changePage} setProfilId={props.setProfilId} updateListMessage={updateListMessage} setUpdateListMessage={setUpdateListMessage} trending={true} updateMessageStat={props.updateMessageStat} setUpdateMessageStat={props.setUpdateMessageStat} /> }

                <div className="mini_titre_stats" id="mini_titre_stats">Top Utilisateurs</div>
                { <FriendList user={props.user} top={true} followers={false} changePage={props.changePage} setProfilId={props.setProfilId} />}

            
        </aside>
    );
}

export default Statistiques;
