import { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const pictures = require.context('./profil_picture', true);

function SearchBar (props) {

    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        searchHandler();
    }, [searchText]);

    const getSearchText = (evt) => {
        setSearchText(evt.target.value);
    };

    const searchHandler = () => {
        axios.get(`http://localhost:4000/api/user/search?q=${searchText}`)
        .then(res => { 
            setSearchResults(res.data);
        })
        .catch((error) => {
            if (error.response.status === 400) {
                setSearchResults("");
            } else {
                console.error(error);
            }
        })
    };

    const reset = () => {  
        setTimeout(() => {
            setSearching(false);
        }, 200);
    };

    return (
        <div>
            <label for="request">Recherche :</label>
            <input 
                id="request" 
                value={searchText} 
                onChange={getSearchText} 
                onClick={ () => { searchHandler(); setSearching(true); } }
                onBlur={reset}
                autoComplete="off"
            />

            { !searching ?   
                "" : 
                searchResults.length === 0 ?   
                    <div className="search-result">
                        <p>Aucun résultat trouvé</p>
                    </div>
                    :
                    <div className="search-result">
                        {searchResults.map((user) => (
                            <div className="profil-message" onClick={() => { props.changePage("profil_page"); props.setProfilId(user._id); props.setUpdateProfil(!props.updateProfil); reset(); }} >
                                <img src={pictures(`./${user.profil_picture}`)} alt="Photo de profil"/>
                                <p id="profil-message-text">{user.firstname} {user.lastname}</p>
                            </div>
                        ))}
                    </div>
            }
        
        </div>
    );  
}

export default SearchBar;
