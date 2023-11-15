import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

import CommentList from './comment_list';

import './index.css';

const pictures = require.context('./profil_picture', true);

function Message(props) {

    const [author, setAuthor] = useState();
    const [deleteMessage, setDeleteMessage] = useState(false);

    useEffect(() => {
		axios.get(`http://localhost:4000/api/user/${props.message.authorid}`)
        .then(res => { 
            setAuthor(res.data);
            setUpdateListComment(!updateListComment);
        })
        .catch((error) => {
            console.log(error);
        })
	}, [props.updateMessage]);

    const [isLiked, setIsLiked] = useState();
    const [nbLikes, setNbLikes] = useState();

    useEffect (() => {
        axios.get(`http://localhost:4000/api/message/${props.message.authorid}/like/${props.message._id}`)
        .then(res => { 
            setNbLikes(res.data.nb);
        })
        .catch((error) => {
            console.log("Erreur", error);
        })
        if(props.message.likers.find((u) => u === props.user._id)){
            setIsLiked(true);
        }
        else{
            setIsLiked(false);
        }
    }, [props.updateMessage]);

    const like = () => {
        axios.put(`http://localhost:4000/api/message/${props.user._id}/like/${props.message._id}`)
        .then(res => { 
            setIsLiked(true);
            setNbLikes(nbLikes+1);
            props.setUpdateListMessage(!props.updateListMessage);
        })
        .catch((error) => {
            console.log("Erreur", error);
        })
    }
      
    const unlike = () => {
        axios.delete(`http://localhost:4000/api/message/${props.user._id}/like/${props.message._id}`)
        .then(res => { 
            setIsLiked(false);
            setNbLikes(nbLikes-1);
            props.setUpdateListMessage(!props.updateListMessage);
        })
        .catch((error) => {
          console.log("Erreur", error);
        })
    }
    
    const [modifying, setModifying] = useState(false);
    const [modifiedText, setModifiedText] = useState("");
	const getModifiedText = (evt) => {setModifiedText(evt.target.value)};
    const [filled, setFilled] = useState(true);

    const edit_message = () => {
        if (!modifying) setModifiedText(props.message.text);
        setModifying(!modifying);
    }

    const save_message = (evt) => {
        evt.preventDefault();
        setFilled(true);
        axios.patch(`http://localhost:4000/api/message/${props.user._id}/${props.message._id}`, { text: modifiedText }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => { 
            props.setUpdateListMessage(!props.updateListMessage);
            edit_message();
        })
        .catch((error) => {
            console.log(error);
            setFilled(false);
        })
      }

    const remove_message = (evt) => {
        evt.preventDefault();
        axios.delete(`http://localhost:4000/api/message/${props.user._id}/${props.message._id}`)
        .then(res => { 
            props.setUpdateListMessage(!props.updateListMessage);
            setDeleteMessage(false);
            console.log("Message supprimé");
        })
        .catch((error) => {
            console.log(error);
        })
    }
        
    const getAuthor = () => {
        if (author) {
          return ( 
            <div onClick={() => { props.changePage("profil_page"); props.setProfilId(author._id); }} className="profil-message">
                <img src={pictures(`./${author.profil_picture}`)} alt="Photo de profil"/>
                <p id="profil-message-text">{author.firstname} {author.lastname}</p> <p id="profil-message-subtext"> @{author.login} • {getDate()} </p>
            </div>
          );
        }
    };

    const getDate = () => {
        const diff = moment.duration(moment().diff(moment(props.message.date)));
        const secondes = Math.floor(diff.asSeconds());
        const minutes = Math.floor(diff.asMinutes());
        const heures = Math.floor(diff.asHours());
        const jours = Math.floor(diff.asDays());
        const mois = Math.floor(diff.asMonths());
        if (mois > 0 || jours > 6) {
            return moment(props.message.date).format("MMM D");
        } else if (jours > 0) {
            return `${jours}j`;
        } else if (heures > 0) {
            return `${heures}h`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        } else if (secondes > 0) {
            return `${secondes}s`;
        } else {
            return `maintenant`;
        }
    }


    const [comment, setComment] = useState(false);

    const commenter = () => {
        setComment(!comment);
    }

    const [commentText, setCommentText] = useState("");
	const getCommentText = (evt) => {setCommentText(evt.target.value)};
    const [commentFilled, setCommentFilled] = useState(true);

	const [updateListComment, setUpdateListComment] = useState(true);

    useEffect(() => {
		setUpdateListComment(!updateListComment);
	}, []);

    const submissionHandler = (evt) => {
        evt.preventDefault();
        setCommentFilled(true);
        axios.put(`http://localhost:4000/api/message/${props.user._id}/comments/${props.message._id}`, {text: commentText}, {
            headers: {
                'Content-Type': 'application/json'
            }
            })
        .then(res => { 
            setCommentText("");
            setUpdateListComment(!updateListComment);
        })
        .catch((error) => {
            setCommentFilled(false);
        })
    }

    return(
        <div id="post">
            <div key={props.message._id}>
                {getAuthor()}
                <div>
                    { !props.trending ? 
                        !modifying ?
                            <textarea id="messagecontent" type="text" className="textarea-message" readonly="readonly" value={props.message.text}/>
                            :
                            <textarea id="messagecontent" type="text" className="textarea-message-modified" value={modifiedText} onChange={getModifiedText}/>
                        :
                        <textarea id="messagecontent" type="text" className="textarea-message-trending" readonly="readonly" value={props.message.text}/>
                    }
                </div>
                {modifying && !filled ? <p style={{color:"red"}}>Erreur : message vide ou supérieur à 240 caractères</p> : <p></p> }
                
                <div>
                    { !props.trending ? 
                        isLiked && !modifying ? 
                            <button id="unlike" type="button" onClick={unlike}>Je n'aime plus | {nbLikes} </button>
                            :
                            ""
                        :
                        <div>Nombre de "J'aime" : <p id="number"> {nbLikes} </p></div>
                    }
                    { !props.trending ? 
                        !isLiked && !modifying ? 
                            <button id="like" type="button" onClick={like}>J'aime | {nbLikes} </button> 
                            :
                            ""
                        :
                        ""
                    }
                    
                    { !props.trending ? 
                        props.user._id === props.message.authorid ?
                            !modifying ? 
                                <button id="like" type="button" onClick={edit_message}>Modifier</button>
                                :
                                <button id="unlike" type="button" onClick={save_message}>Enregistrer</button>
                            :
                            ""
                        :
                        ""
                    }

                    { !props.trending ?
                        !modifying ? 
                            ""
                            :
                            <button id="unlike" type="button" onClick={edit_message}>Annuler</button>
                        :
                        ""
                    }


                    { !props.trending ?
                        props.user._id === props.message.authorid && !modifying ?
                            <button id="unlike" type="button" onClick={() => setDeleteMessage(!deleteMessage)}>Supprimer</button>
                            :
                            ""
                        :
                        ""
                    }

                    {!props.trending ? <button id="like" type="button" onClick={commenter}>Commenter</button> : ""}
                </div>

                { deleteMessage ?
                        <form className="form_parametres" onSubmit={remove_message}>
                            Etes-vous sûr de vouloir supprimer le message ?
                            <div className="button_parametres">
                                <button type="submit" >Oui</button>
                                <button type="text" onClick={() => setDeleteMessage(false)}>Annuler</button>
                            </div>
                        </form>
                        :
                        ""
                }
                { comment ?
                    <div className="comment-container">
                        <form className="comment" onSubmit={submissionHandler}>
                            <textarea id="commentcontent" type="text" className="textarea-comment-container" placeholder="Nouveau commentaire" value={commentText} onChange={getCommentText}/>
                            <button class="button" type="submit" id="commment-like">Envoyer</button>
                            <button class="button" type="reset" id="commment-like" onClick={() => setCommentText("")}>Annuler</button>
                            {commentFilled ? <p></p> : <p style={{color:"red"}}>Erreur : commentaire vide ou supérieur à 240 caractères</p>}
                        </form>
                    </div>
                    : 
                    ""
                }

                { !props.trending ? <CommentList message={props.message} user={props.user} onlyUser={false} changePage={props.changePage} setProfilId={props.setProfilId} updateListComment={updateListComment} setUpdateListComment={setUpdateListComment} /> : "" }

            </div>
        </div>

    );
    
}

export default Message;