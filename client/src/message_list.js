import { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import Message from './message';


const pictures = require.context('./profil_picture', true);


function MessageList (props) {

  const [listMessages, setListMessages] = useState([]);

  const [updateMessage, setUpdateMessage] = useState(true);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
		setUpdateMessage(!updateMessage);
    setIsClicked(false);
	}, []);

  useEffect(() => {
    if (props.trending){
      axios.get(`http://localhost:4000/api/message/trendings`)
      .then(res => { 
        const list = res.data.listmessage.sort((a, b) => {
          return b.likers.length - a.likers.length;
        });
        setListMessages(list);
        setUpdateMessage(!updateMessage);
      })
      .catch((error) => {
        console.log("Erreur récupération des messages", error);
      })
    }
  }, [props.user, props.updateMessageStat]);

  useEffect(() => {
    if (!props.trending) {
      if (!props.onlyUser) {
        if (isClicked){
          axios.get(`http://localhost:4000/api/message/${props.profilUser._id}/followings`)
          .then(res => { 
            const list = res.data.listmessage.sort((a, b) => {
              return new Date(b.date) - new Date(a.date);
            });
            setListMessages(list);
            setUpdateMessage(!updateMessage);
            props.setUpdateMessageStat(!props.updateMessageStat);
          })
          .catch((error) => {
            console.log("Erreur récupération des messages", error);
          })
        }
        else {
          axios.get(`http://localhost:4000/api/message`)
          .then(res => { 
            const list = res.data.listmessage.sort((a, b) => {
              return new Date(b.date) - new Date(a.date);
            });
            setListMessages(list);
            setUpdateMessage(!updateMessage);
            props.setUpdateMessageStat(!props.updateMessageStat);
          })
          .catch((error) => {
            console.log("Erreur récupération des messages", error);
          })
        }
      } else {
        axios.get(`http://localhost:4000/api/message/${props.profilUser._id}`)
        .then(res => { 
          const list = res.data.listmessage.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
          });
          setListMessages(list);
          setUpdateMessage(!updateMessage);
          props.setUpdateMessageStat(!props.updateMessageStat);
        })
        .catch((error) => {
          console.log("Erreur récupération des messages", error);
        })
      }
    }
  }, [props.updateListMessage, props.user, isClicked]);

  return(
    <section>
      <div className="message_list">
      { !props.trending && !props.onlyUser ?
          isClicked ? 
            <button type="button" onClick={() => {setIsClicked(false)}}> Tous les messages </button>
            :
            <button type="button" onClick={() => {setIsClicked(true)}}> Mes messages et ceux de mes abonnements</button> 
          :
          ""
      }
      
      {!props.trending ? !props.onlyUser ? isClicked ? <h2>Liste de mes messages et de ceux de mes abonnements</h2> : <h2>Liste de tous les messages</h2> : <h2>Liste des messages</h2> :""}
      
      { listMessages.map((message) => (
        <Message user={props.user} message={message} trending={props.trending} changePage={props.changePage} setProfilId={props.setProfilId} updateListMessage={props.updateListMessage} setUpdateListMessage={props.setUpdateListMessage} updateMessage={updateMessage} setUpdateMessage={setUpdateMessage} updateMessageStat={props.updateMessageStat} setUpdateMessageStat={props.setUpdateMessageStat} />
      )) }
      
      </div>
    </section>
  );

}

export default MessageList;