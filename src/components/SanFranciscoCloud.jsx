import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useRef } from 'react';
import { Water } from 'three/examples/jsm/objects/Water.js';

function SanFranciscoCloud() {
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
  const MAX_CARS = 1000; // Adjust based on needsased on performance and needs
  let mixer; // Define outside of the useEffect
  const clock = new THREE.Clock(); // Define outside of the useEffect
  let obstacleSpeed = 0.2; // Base speed of obstacles
  const speedIncrease = 0.01; // How much the speed increases
  let lastIncreaseTime = 0; // Track when the last speed increase happened

  const bridgeSegments = []; // This will store your bridge segments
  const bridgeSegmentLength = 100; // Adjust based on your model

  const cloudPool = useRef([]);
  const MAX_CLOUDS = 1; // Set a max limit for clouds based on your needs and performance


  const initBridges = () => {
    for (let i = 0; i < 2; i++) {
      loadBridge(-i * bridgeSegmentLength);
    }
  };

  const loadBridge = (zPosition) => {
    const loader = new GLTFLoader();
    loader.load('/4_golden.glb', (gltf) => {
      const bridge = gltf.scene;
      bridge.position.set(0, 0, zPosition);
      scene.add(bridge);
      bridgeSegments.push(bridge);
    }, undefined, (error) => console.error(error));
  };

  const positionClouds = () => {
    cloudPool.current.forEach((cloud, index) => {
      if (cloud.position.z > camera.position.z + 50) { // Example: If cloud moved out of view
        // Reposition cloud to a new location
        cloud.position.set((Math.random() - 0.5) * 50, 10 + Math.random() * 15, camera.position.z - 100 - Math.random() * 50);
      }
    });
  };
  

  const loadCloud = (x, y, zPosition) => {
      const loader = new GLTFLoader();
      loader.load('/cloud.glb', (gltf) => {
        const cloud = gltf.scene;
        cloud.position.set(x, y, zPosition);
        scene.add(cloud);
        cloudPool.current.push(cloud); // Add to the cloud pool
      }, undefined, (error) => console.error(error));
    };

  const initClouds = () => {
    for (let i = 0; i < MAX_CLOUDS; i++) {
      const zPosition = -40 - Math.random() * 50;
      loadCloud((Math.random() - 0.5) * 50, 10 + Math.random() * 25, zPosition);
    }
  };


  // adding sun to the 3D design
  const loadSun = () => {
    const loader = new GLTFLoader();
    loader.load('/aron_s2.glb', (gltf) => {
        console.log("Sun loaded successfully");
      const sun = gltf.scene;
      sun.position.set(-150, 100, -280);
      sun.scale.set(1.5, 1.5, 1.5);
      scene.add(sun);
    //   camera.lookAt(sun.position)
    }, undefined, (error) => console.error(error));
  };
  

  useEffect(() => {

    init();

    setInterval(() => {
      obstacleSpeed += speedIncrease;
    }, 30000); // Adjust the interval as needed for your game's pacing

    const currentTime = clock.getElapsedTime();
    // Optionally, increase speed based on elapsed time instead of using setInterval
    if (currentTime - lastIncreaseTime > 30) { // Check if 30 seconds have passed
      obstacleSpeed += speedIncrease;
      lastIncreaseTime = currentTime;
    }
 
    // Prevent unnecessary horizontal scrolling
    document.body.style.overflow = 'hidden';



    return () => {
      cleanup();
      
      
    };
  }, []);

  const init = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 4, 8); // Adjusted camera position for better view

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // aron
    // Add an ambient light and a directional light to simulate sunset
    const ambientLight = new THREE.AmbientLight(0xffcccc, 0.3); // Soft red ambient light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xff8c00, 0.5); // Sunset-like directional light
    directionalLight.position.set(-1, 1, -1);
    scene.add(directionalLight);

    // Create a large sphere with a basic gradient material as background
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
      topColor: { value: new THREE.Color(0x0077ff) }, // Sky color
      bottomColor: { value: new THREE.Color(0xffffff) }, // Ground color
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
    //aron


    // Adding lights to make the 
    const light = new THREE.DirectionalLight(0xffffff, 9);
    const light2= new THREE.DirectionalLight(0xffffff, 8);
    const light3= new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10000, -100);
    light2.position.set(100, 1000, 100);
    light3.position.set(0, 100, 35);
    scene.add(light);
    scene.add(light2);
    scene.add(light3);

    // const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    // scene.add(ambientLight);

    
    // code to add water to the ground 
    // const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    // const water = new Water(
    //   waterGeometry, {
    //     textureWidth: 512,
    //     textureHeight: 512,
    //     waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function (texture) {
    //       texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    //     }),
    //     alpha: 1.0,
    //     sunDirection: new THREE.Vector3(),
    //     sunColor: 0xffffff,
    //     waterColor: 0x001e0f,
    //     distortionScale: 3.7,
    //     fog: scene.fog !== undefined
    //   }
    // );
    // water.rotation.x = - Math.PI / 2;
    // water.position.y = -1;
    // scene.add(water);



    const groundGeometry = new THREE.PlaneGeometry(700, 1000);
    // const groundMaterial = new THREE.MeshLambertMaterial({color: 0x006994});
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: 0x006994,
      transparent: true,
      opacity: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    loadBridge();
    loadPlayerModel();
    loadCloud(15, 12, -9);
    // loadCloud(-25, 12, -10);
    // loadCloud(-24, 15, -20);

    initClouds();
    loadSun();

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
    document.body.style.overflow = ''; // Reset overflow property
  };

  // let bridgeCreated = false; // Track if the bridge has been created





  const loadPlayerModel = () => {
    const loader = new GLTFLoader();
    loader.load('/run_pose.glb', function (gltf) {
      // Ensure the player model is only added once
      if (!player) {
        player = gltf.scene;
        scene.add(player);

        player.scale.set(1, 1, 1);
        player.position.set(0, 0, 0);

        // Rotate the player to face towards the camera initially, then adjust as necessary
        player.rotation.y = Math.PI; // Rotates the player 180 degrees around the Y axis

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
    const newPosition = (Math.random() - 0.5) * 5; // Generate a new position
    if (Math.random() > 0.5) {
      // Attempt to spawn an obstacle if the last obstacle position is different
      if (lastObstaclePosition.current === null || Math.abs(lastObstaclePosition.current - newPosition) > 1) {
        spawnObstacle(newPosition);
        lastObstaclePosition.current = newPosition;
      } else {
        // Spawn a coin instead if the position is too close to the last obstacle
        spawnCoin((Math.random() - 0.5) * 5);
      }
    } else {
      // Attempt to spawn a coin if the last coin position is different
      if (lastCoinPosition.current === null || Math.abs(lastCoinPosition.current - newPosition) > 1) {
        spawnCoin(newPosition);
        lastCoinPosition.current = newPosition;
      } else {
        // Spawn an obstacle instead if the position is too close to the last coin
        spawnObstacle((Math.random() - 0.5) * 5);
      }
    }
  };
  

  const spawnObstacle = () => {
    // Check if there's an available car in the pool
    let obstacle = getCarFromPool();
    if (!obstacle) { // If no car is available from the pool, load a new one if pool is not full
      if (carPool.current.length < MAX_CARS) {
        const loader = new GLTFLoader();
        loader.load('/2_car.glb', function (gltf) {
          obstacle = gltf.scene;
          console.log("Obstacle loaded successfully"); // Debugging line
          obstacle.position.set((Math.random() - 0.5) * 5, 0.5, -50);
          obstacle.scale.set(0.3, 0.3, 0.3);
          scene.add(obstacle); 
          carPool.current.push(obstacle); // Add the new car to the pool
          obstacles.push(obstacle); // Optionally maintain a separate list for active obstacles
        }, undefined, function (error) {
          console.error("Error loading model:", error);
        });
      } else {
        console.log('Car pool limit reached, not spawning new cars.');
      }
    } else {
      // Reuse the car from the pool
      obstacle.visible = true; // Make the reused car visible
      obstacle.position.set((Math.random() - 0.5) * 5, 0.5, -50); // Reposition the car
      obstacles.push(obstacle); // Add to the obstacles array for game logic handling
    }
  };

  function getCarFromPool() {
    return carPool.current.find(car => !car.visible);
  }
  
  function recycleCar(car) {
    car.visible = false; // Hide the car, marking it as available for reuse
    // Reset other necessary properties here, such as position, if needed
  }
  
  
  const spawnCoin = () => {
    const coinGeometry = new THREE.CylinderGeometry(0.26, 0.26, 0.13, 32); // Increased size by 1.3%
    const coinMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00, emissive: 0xaa9900 });
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    coin.position.set((Math.random() - 0.5) * 5, 0.5, -50); // Narrow down the spawn area
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
  

  let verticalVelocity = 0; // Add this line outside of the useEffect


  const bridgeStartingZPosition = -70; // Example starting position
  const bridgeResetThreshold = 1; //
  function animate() {
    if (gameOver) return; // Check if the game is over

    // Reposition clouds based on their and the camera's position
    positionClouds();

    requestAnimationFrame(animate);
    bridgeSegments.forEach((bridge, index) => {
      bridge.position.z += obstacleSpeed; // Move each bridge segment towards the player

      // If the bridge has moved past the player, reset its position to the start
      if (bridge.position.z > camera.position.z) {
        let nextIndex = index - 1;
        if (nextIndex < 0) nextIndex = bridgeSegments.length - 1; // Wrap to the last segment
        bridge.position.z = bridgeSegments[nextIndex].position.z - bridgeSegmentLength;
      }
    });

    const delta = clock.getDelta(); // Get the delta time since the last frame
  
    if (mixer) mixer.update(delta);
  
    if (!player || !player.position) {
      return;
    }
  
    player.position.x += moveDirection;
    player.position.x = Math.max(Math.min(player.position.x, 2.7), -2.7);
  
    // Adjust the jump mechanics
    if (jump && player.position.y <= 1) {
      verticalVelocity = 5; // This will give the player an initial upward velocity
      jump = false; // Prevent additional jumps until landing
    }
  
    verticalVelocity -= 9.8 * delta; // Simulate gravity
    player.position.y += verticalVelocity * delta; // Apply vertical velocity to the player's position
  
    if (player.position.y < 1) {
      player.position.y = 1; // Reset to ground level
      verticalVelocity = 0; // Reset vertical velocity
    }

    // Update obstacles and coins
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
      coin.rotation.z += 0.1; // Make the coins spin for visual effect
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

export default SanFranciscoCloud;