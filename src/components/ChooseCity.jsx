import React from 'react';
import { Link } from 'react-router-dom';
import './ChooseCity.css'; 

import Detroit from '../assets/images/Detroit.png';
import SanFrans from '../assets/images/SanFras_img.png'
import Asmara from '../assets/images/Asm_img.png'
import SanDeigo from '../assets/images/SanDeigo_img.png'
import Dubai from '../assets/images/Dubai_img.png'
import Sanfran2 from '../assets/images/SanFras_img copy.png'


const ChooseCity = () => {
  const cities = [
    { name: '', img: Detroit, path: '/Detroit' },
    { name: '', img: SanFrans, path: '/SanFransicoCloud' },
    { name: '', img: Asmara, path: '/Asmara' },
    { name: '', img: SanDeigo, path: '/San_Diego' },
    { name: '', img: Dubai, path: '/Dubai' },
    { name: '', img: Sanfran2, path: '/SanFransiscoDay' },
    
  ];

  return (
    <div className="choose-city-container">
      {cities.map((city, index) => (
        <Link key={index} to={city.path} className="city-button">
          <button style={{ backgroundImage: `url(${city.img})` }}>
            {city.name}
          </button>
        </Link>
      ))}
    </div>
  );
};

export default ChooseCity;
