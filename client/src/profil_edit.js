import { useState, useEffect } from 'react'
import './index.css';
import axios from 'axios';

const pictures = require.context('./profil_picture', true);

function ProfilEdit (props) {

  const [firstname, setFirstName] = useState(props.user.firstname);
  const [lastname, setLastName] = useState(props.user.lastname);
  const [email, setEmail] = useState(props.user.email);
  const [description, setDescription] = useState(props.user.description);
  const [profil_picture, setPicture] = useState(props.user.profil_picture);

  const getFirstName = (evt) => {setFirstName(evt.target.value)};
  const getLastName = (evt) => {setLastName(evt.target.value)};
  const getEmail = (evt) => {setEmail(evt.target.value)};
  const getDescription = (evt) => {setDescription(evt.target.value)};

  const [isValidEmail, setIsValidEmail] = useState(true);
  const regexEmail = new RegExp("[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$");

  const [filled, setFilled] = useState(true);
  
  const allPictures = pictures.keys();
  const changePicture = (evt, picturePath) => {
    const pictureName = picturePath.split('/').pop();
    setPicture(pictureName);
  };

  const submissionHandler = (evt) => {
    evt.preventDefault();
    if (!regexEmail.test(email)) {
      setIsValidEmail(false);
    }
    else{
      setIsValidEmail(true);
      axios.patch(`http://localhost:4000/api/user/${props.user._id}`, {lastname, firstname, email, description, profil_picture}, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(res => { 
        props.setUpdateUser(!props.updateUser);
        props.retour();
      })
      .catch((error) => {
        console.log(error);
        setFilled(false);
      })
    }
  }

  return (
    <div className="form form-profil-edit">
      <form onSubmit={submissionHandler}>
        <div className="title">Editer le profil</div>

        <div id="profil_image_edit">
          <img src={pictures(`./${profil_picture}`)} alt="Photo de profil"/>
        </div>

        <div id="list_image">
          {allPictures.map((picturePath, index) => (
            picturePath === `./${profil_picture}` ? 
              "" : 
              <img key={index} src={pictures(picturePath)} alt={picturePath} onClick={(evt) => changePicture(evt, picturePath)}/>
          ))}
        </div>

        <div className="input-container ic1">
          <input id="firstname" className="input" type="text" placeholder=" " value={firstname} onChange={getFirstName}/>
          <div className="cut"></div>
          <label for="firstname" className="placeholder">Prénom</label>
        </div>

        <div className="input-container ic2">
          <input id="lastname" className="input" type="text" placeholder=" " value={lastname} onChange={getLastName}/>
          <div className="cut cut-long"></div>
          <label for="lastname" className="placeholder">Nom de famille</label>
        </div>

        <div className="input-container ic2">
          <input id="email" className="input" type="text" placeholder=" " value={email} onChange={getEmail}/>
          <div className="cut cut-short"></div>
          <label for="email" className="placeholder">Email</label>
        </div>

        <div className="textarea-container ic2">
          <textarea id="description" className="textarea" type="text" placeholder=" " value={description} onChange={getDescription}/>
          <div className="cut cut-long"></div>
          <label for="description" className="placeholder">Description</label>
        </div>

        <button type="submit" className="submit">Enregistrer</button>
        <button type="text" className="submit" onClick={props.retour}>Retour</button>
        {filled ? <p></p> : <p style={{color:"red"}}>Erreur : veuillez remplir tous les champs</p>}
        {isValidEmail ? <p></p> :  <p style={{color:"red"}}>Erreur : Adresse e-mail invalide</p>}
      </form>
    </div>
  );
}

export default ProfilEdit; 