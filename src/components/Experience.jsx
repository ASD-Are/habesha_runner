import { OrbitControls } from "@react-three/drei";
import { Background } from "./Background";
import SanFranciscoCloud from "./SanFranciscoCloud";

export const Experience = () => {
    return (
        <>
        <OrbitControls/>
        <Background />
        <mesh>
            <boxGeometry/>
            <meshNormalMaterial/>
            
        </mesh>
        
        </>
    )
}