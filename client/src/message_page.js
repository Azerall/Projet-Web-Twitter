import { useState, useEffect } from 'react';
import './index.css';
import axios from 'axios';
import MessageList from './message_list';

const pictures = require.context('./profil_picture', true);

function MessagePage (props) {

    const [text, setText] = useState("");
    const getText = (evt) => {setText(evt.target.value)};
    const [filled, setFilled] = useState(true);

    const [updateListMessage, setUpdateListMessage] = useState(true);

    useEffect(() => {
        setUpdateListMessage(!updateListMessage);
    }, []);

    const submissionHandler = (evt) => {
        evt.preventDefault();
        setFilled(true);
        axios.put(`http://localhost:4000/api/message/${props.user._id}`, {text}, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => { 
            setText("");
            setUpdateListMessage(!updateListMessage);
        })
        .catch((error) => {
            setFilled(false);
        })
    }
    
    return (
        
        <article>

            <div className="send-message">

                <div onClick={() => { props.changePage("profil_page"); props.setProfilId(props.user._id); }} className="profil-message">
                    <img src={pictures(`./${props.user.profil_picture}`)} alt="Photo de profil"/>
                    <p id="profil-message-text">{props.user.firstname} {props.user.lastname}</p> <p id="profil-message-subtext"> @{props.user.login} </p>
                </div>

                <form onSubmit={submissionHandler}>
                    <textarea id="messagecontent" className="textarea-container-message" type="text" placeholder="Nouveau message" value={text} onChange={getText}/>
                    <button type="submit" className="submit-message">Envoyer</button>
                    <button type="reset" className="submit-message" onClick={() => setText("")}>Annuler</button>
                    {filled ? <p></p> : <p style={{color:"red"}}>Erreur : message vide ou supérieur à 240 caractères</p>}
                </form>
            </div>

            { <MessageList user={props.user} profilUser={props.user} onlyUser={false} changePage={props.changePage} setProfilId={props.setProfilId} updateListMessage={updateListMessage} setUpdateListMessage={setUpdateListMessage} trending={false} updateMessageStat={props.updateMessageStat} setUpdateMessageStat={props.setUpdateMessageStat} /> }

        </article>			
        
    );
	
}

export default MessagePage;
