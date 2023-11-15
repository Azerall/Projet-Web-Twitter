import { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import Comment from './comment';


const pictures = require.context('./profil_picture', true);


function CommentList (props) {

    const [listComments, setListComments] = useState([]);

    const [updateComment, setUpdateComment] = useState(true);

    useEffect(() => {
      setUpdateComment(!updateComment);
    }, []);

    useEffect(() => {
      axios.get(`http://localhost:4000/api/message/${props.message.authorid}/comments/${props.message._id}`)
        .then(res => { 
          setListComments(res.data.comments);
          setUpdateComment(!updateComment);
        })
        .catch((error) => {
          console.log("Erreur récupération des commentaires", error);
        })
    }, [props.updateListComment]);

    return(
        <div className="comment_list">
        { listComments.map((comment) => (
            <Comment message={props.message} user={props.user} changePage={props.changePage} setProfilId={props.setProfilId} comment={comment} updateListComment={props.updateListComment} setUpdateListComment={props.setUpdateListComment} updateComment={updateComment} setUpdateComment={setUpdateComment}/>
        )) }
        </div>
    );

}

export default CommentList;