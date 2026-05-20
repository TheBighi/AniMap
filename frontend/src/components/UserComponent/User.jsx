import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext'
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import './User.css';

const fetchUserPins = async () => {
  const response = await fetch('http://localhost:3006/api/pins/userPins', {
        method: 'POST',
        credentials: 'include',
  })
  const data = await response.json()
  const pins = data.pins
  console.log(pins)
  return pins
}


function User() {
    const { isLoggedIn, logout, username } = useContext(AuthContext);
    const [pins, setPins] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const loadPins = async () => {
          const data = await fetchUserPins();
          setPins(data || []);
        };
        loadPins();
    }, []);


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {isLoggedIn && (
                <>
                    <h1>Hi, {username}</h1>
                    <button
                    onClick={handleLogout}
                    style={{
                    background: 'none',
                    border: 'none',
                    color: '#333',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '5px 10px',
                    fontSize: 'inherit',
                    fontFamily: 'inherit'
                    }}
                >
                    sign out
                </button>

                <br></br>

                {pins.length === 0 && <p>No pins.</p>}
                {pins.map((pin, index) => (
                    <div key={pin.id}>
                        <h2>{pin.title}</h2>
                        <h3>{pin.animeName}</h3>
                        <p>{pin.description}</p>
                        <img className="limited-photo" src={`http://localhost:3006${pin.realImageUrl}`} />
                        <img className="limited-photo" src={`http://localhost:3006${pin.animeImageUrl}`} />
                    </div>
                ))}








                </>
                )}
        </>
    )
}

export default User