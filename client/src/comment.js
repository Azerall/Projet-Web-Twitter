import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

import './index.css';

const pictures = require.context('./profil_picture', true);

function Comment(props) {

    const [author, setAuthor] = useState();

    useEffect(() => {
		axios.get(`http://localhost:4000/api/user/${props.comment.authorid}`)
        .then(res => { 
            setAuthor(res.data);
        })
        .catch((error) => {
            console.log(error);
        })
	}, [props.updateComment]);

    const [modifying, setModifying] = useState(false);
    const [modifiedText, setModifiedText] = useState("");
	const getModifiedText = (evt) => {setModifiedText(evt.target.value)};
    const [filled, setFilled] = useState(true);

    const edit_comment = () => {
        if (!modifying) setModifiedText(props.comment.text);
        setModifying(!modifying);
    }

    const save_comment = (evt) => {
        evt.preventDefault();
        setFilled(true);
        axios.patch(`http://localhost:4000/api/message/${props.user._id}/comments/${props.message._id}/${props.comment._id}`, { text: modifiedText }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => { 
            props.setUpdateListComment(!props.updateListComment);
            edit_comment();
        })
        .catch((error) => {
            console.log(error);
            setFilled(false);
        })
    }

    const remove_comment = (evt) => {
        axios.delete(`http://localhost:4000/api/message/${props.user._id}/comments/${props.message._id}/${props.comment._id}`)
        .then(res => { 
            props.setUpdateListComment(!props.updateListComment);
            console.log("Commentaire supprimé");
        })
        .catch((error) => {
            console.log(error);
        })
    }
        
    const getAuthor = () => {
        if (author) {
          return ( 
            <div onClick={() => { props.changePage("profil_page"); props.setProfilId(author._id); }} className="profil-comment">
                <img src={pictures(`./${author.profil_picture}`)} alt="Photo de profil"/>
                <p id="profil-comment-text">{author.firstname} {author.lastname}</p> <p id="profil-comment-subtext"> @{author.login} • {getDate()} </p>
            </div>
          );
        }
    };

    const getDate = () => {
        const diff = moment.duration(moment().diff(moment(props.comment.date)));
        const secondes = Math.floor(diff.asSeconds());
        const minutes = Math.floor(diff.asMinutes());
        const heures = Math.floor(diff.asHours());
        const jours = Math.floor(diff.asDays());
        const mois = Math.floor(diff.asMonths());
        if (mois > 0 || jours > 6) {
            return moment(props.comment.date).format("MMM D");
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

    return(
        <div className="comment">
            <div key={props.comment._id}>
                {getAuthor()}
                <div>
                    { !modifying ?
                        <textarea id="commentcontent" type="text" className="textarea-comment" readonly="readonly" value={props.comment.text}/>
                        :
                        <textarea id="commentcontent" type="text" className="textarea-comment-modified" value={modifiedText} onChange={getModifiedText}/>
                    }
                </div>
                {modifying && !filled ? <p style={{color:"red"}}>Erreur : comment vide ou supérieur à 240 caractères</p> : <p></p> }
                
                { props.user._id === props.comment.authorid ?
                    !modifying ? 
                        <button id="commment-like" type="button" onClick={edit_comment}>Modifier</button>
                        :
                        <div>
                        <button id="commment-unlike" type="button" onClick={save_comment}>Enregistrer</button>
                        <button id="commment-unlike" type="button" onClick={edit_comment}>Annuler</button>
                        </div>
                    :
                    ""
                }

                { props.user._id === props.comment.authorid && !modifying ?
                    <button id="commment-unlike" type="button" onClick={remove_comment}>Supprimer</button>
                    :
                    ""
                }
            
            </div>
        </div>

    );
    
}

export default Comment;