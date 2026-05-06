import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext'
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';

function User() {
    const { isLoggedIn, logout, username } = useContext(AuthContext);

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (
        <>
            {isLoggedIn && (
                <>
                    <h1>Hi, {username}</h1>
                    <h3>e21</h3>
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
                </>
                )}
        </>
    )
}

export default User