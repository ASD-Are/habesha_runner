import React from 'react';
import { Experience } from './components/Experience';
import { Canvas } from '@react-three/fiber';

// Importing all the games for different cities
import SanFranciscoCloud from './components/SanFranciscoCloud'; // Make sure the path matches your file structure
import SanFranciscoDay from './components/SanFranciscoDay';
import San_Diego from './components/San_Diego';
import Dubai from './components/Dubai';
import Detroit from './components/Detroit';
import Asmara from './components/Asmara';

function App() {
  return (
    <>
    {/* <Canvas>
      <color attach="background" args={["#ececec"]} />
      <Experience />
    </Canvas> */}
      <div>
        {/* <SanFranciscoCloud/> */}
        {/* <SanFranciscoDay/> */}
        {/* <Detroit /> */}
        {/* <Dubai /> */}
        <San_Diego />
        {/* <Asmara/> */}
        
        </div>
    </>
    
  );
}

export default App;
