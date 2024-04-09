import React from 'react';
import { Link } from 'react-router-dom';
import corn from '../assets/images/corn.png';
import logo from '../assets/images/logo.png';
import woman from '../assets/images/woman.png';
import popthink from '../assets/images/popthink.png';
import '../App.css';
import './home.css'

const Page1 = () => {
    return (
        <div className="background-container">
            <img src={corn} className="background-image" alt="full page corn photo" />
           
            {/* Render logo container in the corner */}
            <div className="logo-container">
                <img src={logo} className="logo" alt="Your Logo" />
            </div>
            
            {/* Render woman image */}
            <img src={woman} className="woman" alt="Woman Photo" />

            {/* Render popthink image */}
            <div className="popthink-container">
                <img src={popthink} className="popthink" alt="Think Photo" />
                <div className="popthink-text">
                    Watching over my corn
                </div>
            </div>

            <div className="content">
                <div className="card1">
                    <Link to="/">
                        <button>Go Back</button>
                    </Link>
                </div>
                <div className="card2">
                    <Link to="/page2">
                        <button>Tab To Continue</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Page1;
