import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useRef } from 'react';

function Asmara() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const lastObstaclePosition = useRef(null);
  const lastCoinPosition = useRef(null);
  let moveDirection = 0;
  let jump = false;
  let player, renderer, scene, camera, bridge, obstacle;
  const obstacles = [];
  const coins = [];
  const carPool = useRef([]);
  const MAX_CARS = 1000; 
  let mixer; 
  const clock = new THREE.Clock(); 
  let obstacleSpeed = 0.4; 
  const speedIncrease = 0.03; 
  let lastIncreaseTime = 0; 

  const bridgeSegments = []; 
  const bridgeSegmentLength = 100; 

  const initBridges = () => {
    for (let i = 0; i < 2; i++) {
      loadBridge(-i * bridgeSegmentLength);
    }
  };

  const loadBridge = (zPosition) => {
    const loader = new GLTFLoader();
    loader.load('/asmara.glb', (gltf) => {
      const bridge = gltf.scene;
      bridge.position.set(0, 0, zPosition);
      scene.add(bridge);
      
      bridgeSegments.push(bridge);
    }, undefined, (error) => console.error(error));
  };


  useEffect(() => {

    init();

   

    setInterval(() => {
      obstacleSpeed += speedIncrease;
    }, 30000); 

    const currentTime = clock.getElapsedTime();
    if (currentTime - lastIncreaseTime > 30) { 
      obstacleSpeed += speedIncrease;
      lastIncreaseTime = currentTime;
    }
 
    document.body.style.overflow = 'hidden';
    return () => {
      cleanup();
      
    };
  }, []);

  const init = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 4, 8); 

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.physicallyCorrectLight = true;
    

    const ambientLight = new THREE.AmbientLight(0xffcccc, 0.3); 
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xff8c00, 0.5);
    directionalLight.position.set(-1, 1, -1);
    scene.add(directionalLight);

    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `;
    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize( vWorldPosition + offset ).y;
        gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0 ), exponent ), 0.0 ) ), 1.0 );
      }
    `;
    const uniforms = {
      topColor: { value: new THREE.Color(0x0077ff) }, 
      bottomColor: { value: new THREE.Color(0xffffff) }, 
      offset: { value: 33 },
      exponent: { value: 0.6 }
    };
    const skyGeo = new THREE.SphereGeometry(1000, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);


    const light1 = new THREE.DirectionalLight(0xffffff, 2);
    const light2= new THREE.DirectionalLight(0xffffff, 2);
    const light3= new THREE.DirectionalLight(0xffffff, 2);
    light1.position.set(0, 10000, -100);
    light2.position.set(100, 10000, 100);
    light3.position.set(0, 1000, 35);
    scene.add(light1);
    scene.add(light2);
    scene.add(light3);



    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x543b0e });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5;
    scene.add(ground);

    loadBridge();
    loadPlayerModel();

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    const spawnInterval = setInterval(spawnEntities, 2000);

    animate();

    return () => cleanup(spawnInterval);
  };

  const cleanup = (spawnInterval) => {
    document.body.removeChild(renderer.domElement);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    clearInterval(spawnInterval);
    document.body.style.overflow = '';
  };




  const loadPlayerModel = () => {
    const loader = new GLTFLoader();
    loader.load('/run_pose.glb', function (gltf) {
      if (!player) {
        player = gltf.scene;
        scene.add(player);

        player.scale.set(1, 1, 1);
        player.position.set(0, 0, 0);

        
        player.rotation.y = Math.PI;

        if (gltf.animations && gltf.animations.length) {
          mixer = new THREE.AnimationMixer(player);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }
      }
    }, undefined, function (error) {
      console.error(error);
    });
  };


  const spawnEntities = () => {
    const newPosition = (Math.random() - 0.5) * 5; 
    if (Math.random() > 0.5) {
      if (lastObstaclePosition.current === null || Math.abs(lastObstaclePosition.current - newPosition) > 1) {
        spawnObstacle(newPosition);
        lastObstaclePosition.current = newPosition;
      } else {
        spawnCoin((Math.random() - 0.5) * 5);
      }
    } else {
      if (lastCoinPosition.current === null || Math.abs(lastCoinPosition.current - newPosition) > 1) {
        spawnCoin(newPosition);
        lastCoinPosition.current = newPosition;
      } else {
        spawnObstacle((Math.random() - 0.5) * 5);
      }
    }
  };
  

  const spawnObstacle = () => {
    let obstacle = getCarFromPool();
    if (!obstacle) { 
      if (carPool.current.length < MAX_CARS) {
        const loader = new GLTFLoader();
        loader.load('/2_car.glb', function (gltf) {
          obstacle = gltf.scene;
          console.log("Obstacle loaded successfully"); 
          obstacle.position.set((Math.random() - 0.5) * 5, 0.5, -50);
          obstacle.scale.set(0.3, 0.3, 0.3);
          scene.add(obstacle); 
          carPool.current.push(obstacle); 
          obstacles.push(obstacle); 
        }, undefined, function (error) {
          console.error("Error loading model:", error);
        });
      } else {
        console.log('Car pool limit reached, not spawning new cars.');
      }
    } else {
    
      obstacle.visible = true; 
      obstacle.position.set((Math.random() - 0.5) * 5, 0.5, -50); 
      obstacles.push(obstacle); 
    }
  };

  function getCarFromPool() {
    return carPool.current.find(car => !car.visible);
  }
  
  function recycleCar(car) {
    car.visible = false; 
  }
  
  
  const spawnCoin = () => {
    const coinGeometry = new THREE.CylinderGeometry(0.26, 0.26, 0.13, 32); 
    const coinMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00, emissive: 0xaa9900 });
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    coin.position.set((Math.random() - 0.5) * 5, 0.5, -50); 
    coin.rotation.x = Math.PI / 2;
    coins.push(coin);
    scene.add(coin);
  };
  

  const onKeyDown = (event) => {
    if (event.key === "ArrowLeft") moveDirection = -0.05;
    if (event.key === "ArrowRight") moveDirection = 0.05;
    if (event.key === "ArrowUp" && player.position.y <= 1) jump = true;
  };

  const onKeyUp = (event) => {
    if (["ArrowLeft", "ArrowRight"].includes(event.key)) moveDirection = 0;
  };
  

  let verticalVelocity = 0; 


  function animate() {
    if (gameOver) return; 
    

    requestAnimationFrame(animate);
    bridgeSegments.forEach((bridge, index) => {
      bridge.position.z += obstacleSpeed; 

      if (bridge.position.z > camera.position.z) {
        let nextIndex = index - 1;
        if (nextIndex < 0) nextIndex = bridgeSegments.length - 1; 
        bridge.position.z = bridgeSegments[nextIndex].position.z - bridgeSegmentLength;
      }
    });

    const delta = clock.getDelta(); 
  
    if (mixer) mixer.update(delta);
  
    if (!player || !player.position) {
      return;
    }
  
    player.position.x += moveDirection;
    player.position.x = Math.max(Math.min(player.position.x, 2.7), -2.7);
  
    if (jump && player.position.y <= 1) {
      verticalVelocity = 5; 
      jump = false; 
    }
  
    verticalVelocity -= 9.8 * delta; 
    player.position.y += verticalVelocity * delta; 
  
    if (player.position.y < 1) {
      player.position.y = 1; 
      verticalVelocity = 0; 
    }

    obstacles.forEach((obstacle, index) => {
      obstacle.position.z += 0.1;
      if (obstacle.position.z > 10) {
        scene.remove(obstacle);
        obstacles.splice(index, 1);
      } else if (obstacle.position.distanceTo(player.position) < 1) {
        setGameOver(true);
      }
    });

    coins.forEach((coin, index) => {
      coin.position.z += 0.1;
      coin.rotation.z += 0.1; 
      if (coin.position.z > 10) {
        scene.remove(coin);
        coins.splice(index, 1);
      } else if (coin.position.distanceTo(player.position) < 1) {
        setScore((prevScore) => prevScore + 3);
        scene.remove(coin);
        coins.splice(index, 1);
      }
    });

    renderer.render(scene, camera);
  };


  return (
    <div>
      <h2 style={{ position: 'absolute', left: '10px', top: '10px', color: 'white' }}>Score: {score}</h2>
      <button
        style={{
          position: 'absolute',
          right: '10px',
          top: '10px',
          zIndex: 1000, 
        }}
      >
        Back to First Page
      </button>

      {gameOver && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }}
        >
          <h1>Game Over</h1>
          <p>Final Score: {score}</p>
          <button onClick={() => window.location.reload()}>Restart</button>
        </div>
      )}
    </div>
  );
}

export default Asmara;