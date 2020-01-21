/*global addAxes, dat, THREE */

//* Initialize webGL
var canvas = document.getElementById("myCanvas");
var renderer = new THREE.WebGLRenderer({canvas:canvas});
renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor('rgb(255, 255, 255)');    // set background color

// Create a new Three.js scene with camera and light
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height,
                                          0.1, 1000 );
camera.position.set(20,15,20);
camera.lookAt(scene.position);

var angular;
var collision;
//Biliard Table Object,hierarchy parent
var billiardTable = new THREE.Object3D();
scene.add(billiardTable);
//Decease speed per second by ratio
var decreaseSpeedBySecond = 0.2;
//Decease speed per elastic collision by ratio
var decreaseSpeedByCollision =0.3;
//Decease speed per cushio collision by ratio
var decreaseSpeedByCushionCollision = 0.2;
//Radius of black spots on Billiard
var spotRadius = 0.5;
//Length and Width of Ground below Billiard
var lenWidOfGround = 40;
//Radius of Sun,light source
var sunradius = 1;
//Number of Balls
var numBalls = 8;
var blackBall;
//Radius of billiard balls
var ballRadius = 0.4;
//Billiard ball triangles
var ballTri = 16;
//Stick width at start
var stickLen = 0.1;
//Stick width at end
var stickWidth = 0.05;
//Width of leg of Billard Table
var legWidth = 1;
//HEight if leg of Billard
var legHeight = 4;
//Speed of billiard balls
var speedOfBall = 5;
//Length of billiard table 
var floorX = 20;
//Width of billiard table
var floorZ = 10;
//Resolution of shadow
var shadowResolution = 2048;
//Height of light Source
var heighOfLightSource = 12;
//Geometry of billiard ball
var ballGeo;
//Billiard ball object
var ball; 
//Billiard ball position
var currentPos;
//Billiard ball Speed
var ballSpeed;
//Billiard Ball rotation Axis
var rotAxis;
//Billiard Ball translation Matrix
var transMat;
//Billiard ball rotation matrix
var rotMat;
//black ball geometry
var blackBallGeo;
//ambientLight light
var ambientLight;
//SpotLight
var light;
//Object of light source,sun
var sun;
//Material of Ground 
var groundMat;
//Geometry of Ground
var groundGeo;
//Object/Plane Ground
var ground;
//Object billiard floor
var billiardFloor;
//Angular velocity
var omega;
var ballsTxtLoader;

//Texture loader for sun(light source)
var txtLoader = new THREE.TextureLoader();
txtLoader.load("./images/sunmap.jpg",createLight);
//Texture loader for billiard top
var txtLoader1 = new THREE.TextureLoader();
txtLoader1.load("./images/green.jpg",createBilliardFloor);
//Texture loader for billiard cushion
var txtLoader2 = new THREE.TextureLoader();
txtLoader2.load("./images/cushion 1.jpg",createCushion);
//Texture loader for billiard table 
var txtLoader3 = new THREE.TextureLoader();
txtLoader3.load("./images/woods.jpg",createWoodDown);
//Texture loader for billiard table legs
var txtLoader4 = new THREE.TextureLoader();
txtLoader4.load("./images/woods.jpg",createBilliardLegs);
//Texture loader for billiard table boundary
var txtLoader5 = new THREE.TextureLoader();
txtLoader5.load("./images/woods.jpg",createBrownBoundary);
//create Billiard Balls
createBalls();
//Create ground below billiard
createGround();
//Create Spots on Billiard
createSpots();
//Create white line on billiard
createLine();
//Create Billiard Stick
createStick();
//Billiard Table shifted by a posiion
billiardTable.position.y = legHeight+0.01;

//* Render loop
var computerClock = new THREE.Clock();
var controls = new THREE.TrackballControls( camera );

//addAxes(scene);


function createLight(sunMap){
	//Amibient Light is for reflected rays from objects
	ambientLight = new THREE.AmbientLight(0x707070);
	scene.add(ambientLight);
	//SportLight has a direction,and casts shadow
	light = new THREE.SpotLight(0xffffff);
	//Set position of spotlight
	light.position.set(10,heighOfLightSource,10);
	//Shadow casted by spotlight enabled
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 40;
	//Resolution of shadow 
	light.shadow.mapSize.width = shadowResolution;
	light.shadow.mapSize.height = shadowResolution; 
	scene.add(light);
		
	//Sun Object to represent source of light
	sun = new THREE.Mesh(new THREE.SphereGeometry(sunradius, 32, 32),
							 new THREE.MeshBasicMaterial({color:0xffdd00,
														map : sunMap,
														needsUpdate:true													
														 }));														
	sun.position.copy(light.position);
	scene.add(sun);
}

function createGround(){
	//Material of ground below billiard
	groundMat = new THREE.MeshPhongMaterial({color:0x00ff00,side:THREE.DoubleSide});
	groundMat.transparent = true;
	groundMat.opacity = 0.5;
	//Geometry of groudn below billiard
	groundGeo = new THREE.PlaneGeometry(lenWidOfGround,lenWidOfGround);
	ground = new THREE.Mesh(groundGeo, groundMat);
	ground.rotation.x = -Math.PI/2;
	//Ground to receive shadow 
	ground.receiveShadow = true;
	scene.add(ground);
}

function createBilliardFloor(billiardFloorMap){
	//BilliardFloor Object
	billiardFloor = new THREE.Mesh(new THREE.BoxBufferGeometry(floorX, floorZ, 0.5),
							   new THREE.MeshPhongMaterial({wireframe:false,
															color:0x00ff00,
															side:THREE.DoubleSide,														
															shading: THREE.FlatShading,
															map: billiardFloorMap}));
	//BilliardFloor to receive Shadow
	billiardFloor.receiveShadow = true;
	billiardFloor.rotation.x = Math.PI/2;
	billiardFloor.castShadow = true;
	billiardTable.add(billiardFloor);
}
function createCushion(cushionMap){
	var thicknessRatio = 1/3;
	var side1Y = 0.74*thicknessRatio;
	var side1X = floorX+side1Y;
	var side1Z = 1;
	var sidesReflection = 0x999999;
	var sidesShininess = 10;
	//One of the side of cushion of billiard table
	var cushion1 = new THREE.Mesh(new THREE.BoxBufferGeometry(side1X, side1Y, side1Z),
							   new THREE.MeshPhongMaterial({wireframe:false,
															color:0x00ff99,														
															side:THREE.DoubleSide,
															map:cushionMap}));
	cushion1.position.z = floorZ/2+side1Y/2;
	cushion1.position.y = thicknessRatio-0.1;
	cushion1.material.transparent = true;
	cushion1.material.opacity = 1;
	cushion1.rotation.x = Math.PI/2;
	billiardTable.add(cushion1);

	//Cushion object of billiard table
	var cushion2 = new THREE.Mesh(new THREE.BoxBufferGeometry(side1X, side1Y, side1Z),
							   new THREE.MeshPhongMaterial({wireframe:false,
															color:0x00ff99,														
															side:THREE.DoubleSide,
															map:cushionMap}));
	cushion2.position.z = -floorZ/2-side1Y/2;
	cushion2.position.y = thicknessRatio-0.1;
	cushion2.material.transparent = true;
	cushion2.material.opacity = 1;
	cushion2.rotation.x = Math.PI/2;
	billiardTable.add(cushion2);

	var side3X = floorZ;
	var side3Y = 0.74*thicknessRatio;
	var side3Z = 1;
	//Cushion object of billiard table
	var cushion3 = new THREE.Mesh(new THREE.BoxBufferGeometry(side3Y, side3X, side3Z),
							   new THREE.MeshPhongMaterial({wireframe:false,
															color:0x00ff99,
															side:THREE.DoubleSide,
															map:cushionMap}));
	cushion3.position.x = floorX/2;
	cushion3.position.y = thicknessRatio-0.1;
	cushion3.material.transparent = true;
	cushion3.material.opacity = 1;
	cushion3.rotation.x = Math.PI/2;
	billiardTable.add(cushion3);

	//Cushion object of billiard table
	var cushion4 = new THREE.Mesh(new THREE.BoxBufferGeometry(side3Y, side3X, side3Z),
							   new THREE.MeshPhongMaterial({wireframe:false,
															color:0x00ff99,														
															side:THREE.DoubleSide,
															map:cushionMap}));
	cushion4.position.x = -floorX/2;
	cushion4.position.y = thicknessRatio-0.1;
	cushion4.material.transparent = true;
	cushion4.material.opacity = 1;
	cushion4.rotation.x = Math.PI/2;
	billiardTable.add(cushion4);
}
function createWoodDown(woodDownMap){

	var downfloorX = floorX+1;
	var downfloorZ = floorZ + 1;
	//Object to cover the bottom of billiard table
	var down = new THREE.Mesh(new THREE.BoxBufferGeometry(downfloorX, downfloorZ, 0.1),
							   new THREE.MeshPhongMaterial({wireframe:false,
															color:0x663300,
															side:THREE.DoubleSide,
															map: woodDownMap}));
	down.position.y = -0.25;
	down.rotation.x = Math.PI/2;
	billiardTable.add(down);
}


function createSpots(){

	var SpotWidth = 9.75;
	var spotHeight = 4.75;
	//Object to represent black spots on the billiard table
	var spot = new THREE.Mesh(new THREE.CircleBufferGeometry(spotRadius, 32, 32),
							   new THREE.MeshPhongMaterial({wireframe:false,
															color:'black',														
															side:THREE.DoubleSide}));
	//six spots for each corner and the middle of the table
	spot.rotation.x = Math.PI/2;
	spot.position.y = 0.255;
	spot.position.x = 9.75;
	spot.position.z = 4.75;
	billiardTable.add(spot);										
	var spot2 = spot.clone();
	spot2.position.x = -SpotWidth;
	billiardTable.add(spot2);
	var spot3 = spot2.clone();
	spot3.position.z = -spotHeight;
	billiardTable.add(spot3);
	var spot4 = spot3.clone();
	spot4.position.x = SpotWidth;
	billiardTable.add(spot4);
	var spot5 = spot4.clone();
	spot5.position.x = 0;
	spot5.position.z = -spotHeight;
	billiardTable.add(spot5);
	var spot6 = spot.clone();
	spot6.position.x = 0;
	spot6.position.z = spotHeight;
	billiardTable.add(spot6);

}

function createBalls(){
	
	angular = new Array(numBalls);
	//Tecture loader to load texture of balls
	ballsTxtLoader = new THREE.TextureLoader();
	//* Add ball
	//Ball Geometry is created here
	 ballGeo = new THREE.SphereGeometry(ballRadius, ballTri, ballTri);
	 //Array representing ball Object
	 ball = new Array(numBalls);
	 //Array representing position of balls
	 currentPos = new Array(numBalls);
	 //Array representing speed of balls
	 ballSpeed = new Array(numBalls);
	 //Array representing rotation axis of balls
	 rotAxis = new Array(numBalls);
	 //Array to represent angulare velocity of balls
	 omega = new Array(numBalls);
	for (i=0;i<numBalls;i++){
		ball[i] = new THREE.Mesh(ballGeo,  new THREE.MeshPhongMaterial( {color: 0xffffff,
																		  wireframe:false,
																		  map: ballsTxtLoader.load("./images/"+(i+1)+".jpg")
																		  }));
		ball[i].castShadow = true;

		currentPos[i] = new THREE.Vector3(i,2*ballRadius-0.2,0);
		billiardTable.add(ball[i]);
		if(i<numBalls/2){
			ballSpeed[i] = new THREE.Vector3(speedOfBall*Math.random(), 0, speedOfBall*Math.random());
		}
		else{
			ballSpeed[i] = new THREE.Vector3(-speedOfBall*Math.random(), 0, -speedOfBall*Math.random());
		}
		rotAxis[i] = new THREE.Vector3(0,1,0); 
		rotAxis[i].cross(ballSpeed[i].clone()).normalize();
		//Angular Velocity
		omega[i] = ballSpeed[i].length()/ballRadius;
		ball[i].matrixAutoUpdate = false;
		angular[i] = 0;
	}
}
function myCallback(event) {
    if(event.keyCode === 39){
	   ballSpeed[0].x += 1;
    }
	if(event.keyCode === 37){
	  ballSpeed[0].x  += -1;
	}
	if(event.keyCode === 38){
	  ballSpeed[0].z += -1;
    }
	if(event.keyCode === 40){
	  ballSpeed[0].z += 1;
	}
	if(event.keyCode === 87){
	  ballSpeed[0].z += 1;
    }
	if(event.keyCode === 83){
	  ballSpeed[0].z += -1;
	}
		
}
document.addEventListener("keydown", myCallback);
document.addEventListener("keyup", function() {vx=0;});

function createLine(){
	//White Line on the billiard table is created here
	var mat = new THREE.LineBasicMaterial({color:0xffffff});
	var geo = new THREE.Geometry();
	geo.vertices.push(
		new THREE.Vector3(-6,0.3,-5),	
		new THREE.Vector3(-6,0.3,5)
	);
	var line = new THREE.Line(geo,mat);
	billiardTable.add(line);
}

function createStick(){
	//Billiard Stick is created here
	var stick = new THREE.Mesh(new THREE.CylinderBufferGeometry(stickLen, stickWidth, 14),
							   new THREE.MeshPhongMaterial({wireframe:false,
															color:0x663300,														
															side:THREE.DoubleSide,
															map: txtLoader.load("./images/stick.jpg")}));
	stick.rotation.z = Math.PI/3;
	stick.position.y = 4;
	stick.position.x = -10;
	stick.castShadow = true;
	billiardTable.add(stick);
}
function render() {
  requestAnimationFrame(render);

  var dt = computerClock.getDelta();  // must be before call to getElapsedTime, otherwise dt=0 !!!
  var t = computerClock.getElapsedTime();
  // Motion along a straight line:
  //multiplies vector with dt
  transMat = new Array(numBalls);
  rotMat = new Array(numBalls);
  for (i=0;i<numBalls;i++){	 
		  ballSpeed[i].x = ballSpeed[i].x*(1-decreaseSpeedBySecond*dt);
		  ballSpeed[i].z = ballSpeed[i].z*(1-decreaseSpeedBySecond*dt);
		  omega[i] = ballSpeed[i].length()/ballRadius;	
		  currentPos[i].add(ballSpeed[i].clone().multiplyScalar(dt));
		  transMat[i] = new THREE.Matrix4();
		  transMat[i].makeTranslation(currentPos[i].x, currentPos[i].y, currentPos[i].z);

		  // Rotation
		  rotMat[i] = new THREE.Matrix4();
		  angular[i] += omega[i] * dt;
		  rotMat[i].makeRotationAxis(rotAxis[i], angular[i]);	  
		  ball[i].matrix.copy(transMat[i]);
		  ball[i].matrix.multiply(rotMat[i]);
	  
		  // Reflection against boundary of billiard table
		  if(currentPos[i].x>(floorX/2-ballRadius)) {
			ballSpeed[i].x = - Math.abs(ballSpeed[i].x);
			rotAxis[i] = new THREE.Vector3(0,1,0);
			rotAxis[i].cross(ballSpeed[i].clone()).normalize();
			changeSpeedByCollision(i);
		  }
		  else if(currentPos[i].z>(floorZ/2-ballRadius)) {
			ballSpeed[i].z = - Math.abs(ballSpeed[i].z);
			rotAxis[i] = new THREE.Vector3(0,1,0);
			rotAxis[i].cross(ballSpeed[i].clone()).normalize();
			changeSpeedByCollision(i);
		  }
		  else if(currentPos[i].x<-(floorX/2-ballRadius)) {
			ballSpeed[i].x = + Math.abs(ballSpeed[i].x);
			rotAxis[i] = new THREE.Vector3(0,1,0);
			rotAxis[i].cross(ballSpeed[i].clone()).normalize();
			changeSpeedByCollision(i);
		  }
		  else if(currentPos[i].z<-(floorZ/2-ballRadius)) {
			ballSpeed[i].z = + Math.abs(ballSpeed[i].z);
			rotAxis[i] = new THREE.Vector3(0,1,0);
			rotAxis[i].cross(ballSpeed[i].clone()).normalize();
			changeSpeedByCollision(i);
			
		  }
			for(var j=0;j<numBalls;j++){
				if(i!=j){
					//Find distance between two balls
					var x = Math.abs(currentPos[i].x - currentPos[j].x);		
					var z = Math.abs(currentPos[i].z - currentPos[j].z);	
					var distance = Math.sqrt(x*x+z*z);
					//if distance between two balls is less than their diameter(collision)
					if(distance<=2*ballRadius){	
						//Vector d represent distance between balls
						var d = new THREE.Vector3(x,0,z);
						//find difference of their speed
						var differenceSpeed  =  ballSpeed[i].clone().sub(ballSpeed[j].clone());
						//2*distance of balls multiplied by difference of their speed
						var dU = d.clone().multiply(d.clone().multiply(differenceSpeed.clone()));
						//dot product of distance betwene balls
						var dDot = d.clone().dot(d.clone());
						//Value of speed in x and z direction
						var newX = dU.x/dDot;
						var newZ = dU.z/dDot;
						//Vector for new Speed
						var newSpeed = new THREE.Vector3(newX,0,newZ);
						//Vector to decrease speed of ball after collision
						var decreaseSpeed = new THREE.Vector3(1-decreaseSpeedByCollision,0,1-decreaseSpeedByCollision);
						ballSpeed[i] = ballSpeed[i].sub(newSpeed.clone());
						ballSpeed[j] = ballSpeed[j].add(newSpeed.clone());
						ballSpeed[i] = ballSpeed[i].clone(decreaseSpeed.clone());
						ballSpeed[j] = ballSpeed[j].clone(decreaseSpeed.clone());
						rotAxis[i] = new THREE.Vector3(0,1,0);
						rotAxis[i].cross(ballSpeed[i].clone()).normalize();	  
						rotAxis[j] = new THREE.Vector3(0,1,0);
						rotAxis[j].cross(ballSpeed[j].clone()).normalize();						
						}
					
				}
			
			}
	  
	
	
  }
	
	if(typeof light!='undefined'){
		light.position.x = 10*Math.sin(t/10);
		light.position.z = 10*Math.cos(t/10);
		sun.position.copy(light.position);
	}
	
	
  controls.update();
  renderer.render(scene, camera);
}
render();

//Decreases the speed of balls after every collision against billiard cushion
function changeSpeedByCollision(i) {
		ballSpeed[i].x = ballSpeed[i].x*(1-decreaseSpeedByCushionCollision);
		ballSpeed[i].z = ballSpeed[i].z*(1-decreaseSpeedByCushionCollision);	
}
//Creates the legs of billiard table
function createBilliardLegs(billiardLegMap){

//Object of one of the legs of billiard table
var leg1 = new THREE.Mesh(new THREE.BoxBufferGeometry(legWidth, legWidth, legHeight),
														new THREE.MeshPhongMaterial({wireframe:false,
                                                        color:0x663300,														
                                                        side:THREE.DoubleSide,
														map: billiardLegMap})
													);
leg1.position.x = -floorX/2+0.5;
leg1.position.z = -floorZ/2+0.5;
leg1.position.y = -legHeight/2;
leg1.material.transparent = true;
leg1.material.opacity = 1;
leg1.rotation.x = Math.PI/2;
billiardTable.add(leg1);


var leg2 = new THREE.Mesh(new THREE.BoxBufferGeometry(legWidth, legWidth, legHeight),
                           new THREE.MeshPhongMaterial({wireframe:false,
                                                        color:0x663300,														
                                                        side:THREE.DoubleSide,
														map: billiardLegMap}));
leg2.position.x = floorX/2-0.5;
leg2.position.z = floorZ/2-0.5;
leg2.position.y = -legHeight/2;
leg2.material.transparent = true;
leg2.material.opacity = 1;
leg2.rotation.x = Math.PI/2;
billiardTable.add(leg2);



var leg3 = new THREE.Mesh(new THREE.BoxBufferGeometry(legWidth, legWidth, legHeight),
                           new THREE.MeshPhongMaterial({wireframe:false,
                                                        color:0x663300,														
                                                        side:THREE.DoubleSide,
														map: billiardLegMap}));
leg3.position.x = floorX/2-1/2;
leg3.position.z = -floorZ/2+1/2;
leg3.position.y = -legHeight/2;
leg3.material.transparent = true;
leg3.material.opacity = 1;
leg3.rotation.x = Math.PI/2;
billiardTable.add(leg3);



var leg4 = new THREE.Mesh(new THREE.BoxBufferGeometry(legWidth, legWidth, legHeight),
                           new THREE.MeshPhongMaterial({wireframe:false,
                                                        color:0x663300,														
                                                        side:THREE.DoubleSide,
														map: billiardLegMap}));
leg4.position.x = -floorX/2+1/2;
leg4.position.z = floorZ/2-1/2;
leg4.position.y = -legHeight/2;
leg4.material.transparent = true;
leg4.material.opacity = 1;
leg4.rotation.x = Math.PI/2;
billiardTable.add(leg4);

}
//Creates brown boundary around billiard table
function createBrownBoundary(billiardBoundary){
	
var ratioOfSideY = 2/3
var brownSide1Y = 0.74*ratioOfSideY;
var brownSide = 0.74*1/2;
var brownSide1X = floorX+0.74+brownSide1Y;
var brownSide1Z = 1;
var brownSide1 = new THREE.Mesh(new THREE.BoxBufferGeometry(brownSide1X, brownSide1Y, brownSide1Z),
                           new THREE.MeshPhongMaterial({wireframe:false,
                                                        color:0x663300,
														specular: 0x999999, 
														shininess: 30, 
                                                        side:THREE.DoubleSide,
														map: billiardBoundary}));
brownSide1.position.z = floorZ/2+brownSide1Y;
brownSide1.position.y = (1-ratioOfSideY)-0.1;
brownSide1.rotation.x = Math.PI/2;
billiardTable.add(brownSide1);


var brownSide2 = new THREE.Mesh(new THREE.BoxBufferGeometry(brownSide1X, brownSide1Y, brownSide1Z),
                           new THREE.MeshPhongMaterial({wireframe:false,
                                                        color:0x663300,
														specular: 0x999999, 
														shininess: 30, 
                                                        side:THREE.DoubleSide,
														map: billiardBoundary}));
brownSide2.position.z = -floorZ/2-brownSide1Y;
brownSide2.position.y = (1-ratioOfSideY)-0.1;
brownSide2.rotation.x = Math.PI/2;
billiardTable.add(brownSide2);

var brownSide3Y = 0.74*ratioOfSideY;
var brownSide3X = floorZ+brownSide3Y;
var brownSide3Z = 1;
var brownSide3 = new THREE.Mesh(new THREE.BoxBufferGeometry(brownSide3Y, brownSide3X, brownSide3Z),
                           new THREE.MeshPhongMaterial({wireframe:false,
                                                        color:0x663300,
														specular: 0x999999, 
														shininess: 30, 
                                                        side:THREE.DoubleSide,
														map: billiardBoundary}));
brownSide3.position.x = floorX/2+brownSide;
brownSide3.position.y = (1-ratioOfSideY)-0.1;
brownSide3.rotation.x = Math.PI/2;
billiardTable.add(brownSide3);


var brownSide4 = new THREE.Mesh(new THREE.BoxBufferGeometry(brownSide3Y, brownSide3X, brownSide3Z),
                           new THREE.MeshPhongMaterial({wireframe:false,
                                                        color:0x663300,
														specular: 0x999999, 
														shininess: 30, 
                                                        side:THREE.DoubleSide,
														map: billiardBoundary}));
brownSide4.position.x = -floorX/2-brownSide;
brownSide4.position.y = (1-ratioOfSideY)-0.1;
brownSide4.rotation.x = Math.PI/2;
billiardTable.add(brownSide4);
}