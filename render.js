function render() {
  requestAnimationFrame(render);

  var dt = computerClock.getDelta();  // must be before call to getElapsedTime, otherwise dt=0 !!!
  var t = computerClock.getElapsedTime();
  // Motion along a straight line:
  //multiplies vector with dt
  transMat = new Array(numBalls);
  rotMat = new Array(numBalls);
  for (i=0;i<numBalls;i++){
	  
  
	  currentPos[i].add(ballSpeed[i].clone().multiplyScalar(dt));
	  transMat[i] = new THREE.Matrix4();
	  transMat[i].makeTranslation(currentPos[i].x, currentPos[i].y, currentPos[i].z);

	  // Rotation
	  rotMat[i] = new THREE.Matrix4();
	  rotMat[i].makeRotationAxis(rotAxis[i], omega*t);

	  ball[i].matrix.copy(transMat[i]);
	  ball[i].matrix.multiply(rotMat[i]);
  
	  // Reflection
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
	  
	
		
		if(currentPos[i].length()>10.5){
			ball[i].visible = true;				
		}
		
  }
	
  
    light.position.x = 10*Math.sin(t/10);
	light.position.z = 10*Math.cos(t/10);
	sun.position.copy(light.position);
	
	
	
  controls.update();
  renderer.render(scene, camera);
}
render();

function myFunction() {
    myVar = setInterval(changeSpeedBySecond, 1000);
	console.log('Hi');
}
function changeSpeedByCollision(i) {
	var speed = 0.8;
	  		ballSpeed[i].x = 	ballSpeed[i].x*speed;
			ballSpeed[i].z = 	ballSpeed[i].z*speed;	
	
}
function changeSpeedBySecond() {
	var speed = 0.8;
	  for (i=0;i<numBalls;i++){
			ballSpeed[i].x = 	ballSpeed[i].x*speed;
			ballSpeed[i].z = 	ballSpeed[i].z*speed;
	  
	  }
}