import React from 'react';
import { Link } from 'react-router-dom';
import enjeralogo from '../assets/images/logo.png';
import '../App.css';

const Home = () => {
    return (
        <>
            <div>
                <img src={enjeralogo} class="logo" alt="Habesha logo" />
            </div>
            <h2>Habesha Runner Game</h2>
            <div className="card">
                <Link to="/page1">
                    <button>Play</button>
                </Link>
            </div>
        </>
    );
};

export default Home;
