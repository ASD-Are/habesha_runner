// // Importing all the games for different cities
// import SanFranciscoCloud from './components/SanFranciscoCloud'; // Make sure the path matches your file structure
// import SanFranciscoDay from './components/SanFranciscoDay';
// import San_Diego from './components/San_Diego';
// import Dubai from './components/Dubai';
// import Detroit from './components/Detroit';
// import Asmara from './components/Asmara';

// function App() {
//   return (
//     <>
//     {/* <Canvas>
//       <color attach="background" args={["#ececec"]} />
//       <Experience />
//     </Canvas> */}
//       <div>
//         {/* <SanFranciscoCloud/> */}
//         {/* <SanFranciscoDay/> */}
//         {/* <Detroit /> */}
//         {/* <Dubai /> */}
//         <San_Diego />
//         {/* <Asmara/> */}
        
//         </div>
//     </>
    
//   );
// }

// export default App;


import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Page1 from './components/page1';
import Page2 from './components/page2';
import Page3  from './components/page3';
import Page4 from './components/page4';
// Importing all the games for different cities
import SanFranciscoCloud from './components/SanFranciscoCloud'; // Make sure the path matches your file structure
import SanFranciscoDay from './components/SanFranciscoDay';
import San_Diego from './components/San_Diego';
import Dubai from './components/Dubai';
import Detroit from './components/Detroit';
import Asmara from './components/Asmara';
import ChooseCity from './components/ChooseCity';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/page1" element={<Page1 />} />
                <Route path="/page2" element={<Page2 />} />
                <Route path="/page3" element={<Page3 />} />
                <Route path="/page4" element={<Page4 />} />
                <Route path="/ChooseCity" element={<ChooseCity />} />
                {/* // cities route */}
                <Route path="/SanFransicoCloud" element={<SanFranciscoCloud />} />
                <Route path="/SanFransiscoDay" element={<SanFranciscoDay />} />
                <Route path="/San_Diego" element={<San_Diego />} />
                <Route path="/Dubai" element={<Dubai />} />
                <Route path="/Detroit" element={<Detroit />} />
                <Route path="/Asmara" element={<Asmara />} />

            </Routes>
        </Router>
    );
}

export default App;

