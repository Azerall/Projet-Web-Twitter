import { useState, useEffect } from 'react'
import ProfilEdit from './profil_edit';
import axios from 'axios';
import './index.css';
import MessageList from './message_list';
import FriendList from './friend_list';

const pictures = require.context('./profil_picture', true);

function ProfilPage (props) {

    const [updateUser, setUpdateUser] = useState(true);

    const [profilUser, setProfilUser] = useState();
    const [isUser, setIsUser] = useState();
    const [isFollow, setIsFollow] = useState();

    const [list, setList] = useState("messages_list");
    const [updateListMessage, setUpdateListMessage] = useState(true);

    useEffect(() => {
    setIsUser(props.user._id === props.profilId);
    setIsFollow(props.user.followings.includes(props.profilId));
    setIsUser(props.user._id === props.profilId);

    axios.get(`http://localhost:4000/api/user/${props.profilId}`)
        .then(res => { 
            setProfilUser(res.data);
            setIsFollow(props.user.followings.includes(props.profilId));
            setList("messages_list");
            setUpdateListMessage(!updateListMessage);
            })
        .catch((error) => {
            console.log("Erreur profilUser", error);
        }) 
    }, [props.updateProfil]);

    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [description, setDescription] = useState("");
    const [profil_picture, setProfilPicture] = useState("");
    const [nbFollowers, setNbFollowers] = useState("");
    const [nbFollowing, setNbFollowing] = useState("");

    useEffect(() => {
        if (profilUser) {
            setUsername(profilUser.login);
            setLastName(profilUser.lastname);
            setFirstName(profilUser.firstname);
            setDescription(profilUser.description);
            setProfilPicture(profilUser.profil_picture);
            setNbFollowers(profilUser.followers.length);
            setNbFollowing(profilUser.followings.length);
        }
    }, [profilUser]);

    const [isEditing, setIsEditing] = useState(false);
    const edit = () => {
        setIsEditing(!isEditing);
    };

    useEffect(() => {
        axios.get(`http://localhost:4000/api/user/${props.user._id}`)
        .then(res => { 
            props.setUser(res.data);
            props.setUpdateProfil(!props.updateProfil);
            setUpdateListMessage(!updateListMessage);
        })
        .catch((error) => {
            console.log("Erreur profilUser", error);
        })
    }, [updateUser]);

    const follow = () => {
        axios.post(`http://localhost:4000/api/user/${props.user._id}/${props.profilId}`)
        .then(res => { 
            setIsFollow(true);
            setNbFollowers(nbFollowers+1);
        })
        .catch((error) => {
            console.log("Erreur", error);
        })
    }
  
    const unfollow = () => {
        axios.delete(`http://localhost:4000/api/user/${props.user._id}/${props.profilId}`)
        .then(res => { 
            setIsFollow(false);
            setNbFollowers(nbFollowers-1);
        })
        .catch((error) => {
            console.log("Erreur", error);
        })
    }

  return (
    <article>

        <div id="profil_entete">
            <div id="profil_image">
                { profil_picture ? <img src={pictures(`./${profil_picture}`)} alt="Photo de profil"/> : "" }
            </div>
            <div id="profil_text">
                <h2>
                    {firstname} {lastname}
                </h2>
                <h3>
                    @{username}
                </h3>
                <div id="profil_description">
                    {description}
                </div>
            </div>

            <div id="profil_compteurs">
                <button onClick={() => setList("followings_list") }>{nbFollowing} abonnements</button>
                <button onClick={() => setList("followers_list") }>{nbFollowers} abonnés</button>
            </div>

            { isUser ? 
                (isEditing ? 
                    <ProfilEdit user={props.user} retour={edit} updateUser={updateUser} setUpdateUser={setUpdateUser} /> 
                    : 
                    <button type="button" onClick={edit}>Éditer le profil</button>
                )
                :
                (isFollow ? 
                    <button type="button" onClick={unfollow}>Ne plus suivre</button>
                    :
                    <button type="button" onClick={follow}>Suivre</button> 
                ) 
            }  

        </div>
            
        { profilUser && list==="messages_list" ? <MessageList user={props.user} profilUser={profilUser} onlyUser={true} changePage={props.changePage} setProfilId={props.setProfilId} updateListMessage={updateListMessage} setUpdateListMessage={setUpdateListMessage} trending={false} /> : ""}
        { profilUser && list==="followers_list" ? <FriendList profilUser={profilUser} top={false} followers={true} setList={setList} changePage={props.changePage} setProfilId={props.setProfilId} /> : ""}
        { profilUser && list==="followings_list" ? <FriendList profilUser={profilUser} top={false} followers={false} setList={setList} changePage={props.changePage} setProfilId={props.setProfilId} /> : ""}

    </article>
  );
}

export default ProfilPage; 