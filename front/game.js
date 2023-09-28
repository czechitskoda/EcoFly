import { randFloat } from "three/src/math/MathUtils";
import { cloudCreate } from "./cloud";
import { earthCreate } from "./earth";
import { flyingVehicleCreate } from "./flyingVehicle";
import * as THREE from "three"
import { QuestionsLength, answerQuestion, getQuestion } from "./axioshandler";

let gameSpeed = 0.5;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.shadowMap.enabled = true;

// lighting
const rimLight = new THREE.PointLight(0xffffff, 90); // Adjust intensity and color
rimLight.position.set(0, 0, 5); // Adjust position
rimLight.rotation.x = 90
rimLight.castShadow = true
scene.add(rimLight);

const rimLight2 = new THREE.PointLight(0xffffff, 10); // Adjust intensity and color
rimLight2.position.set(0, -1, -1); // Adjust position
rimLight2.rotation.x = 90
rimLight2.castShadow = true
scene.add(rimLight2);

scene.background = new THREE.Color(0x9EE4E4);

let mouseY = 0;
document.addEventListener('mousemove', (event) => {
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// add earth
let earth = await earthCreate()
scene.add(earth)

//add flyingvehicle
const { flyingVehicle, propellerMesh } = await flyingVehicleCreate()
scene.add(flyingVehicle)

flyingVehicle.position.z = mouseY + 1;
let lastpos = 1
let mouseposraw = 1
let mousepos = 1

//add cloud
let cloud1 = await cloudCreate(1.4, 'acloud', 0x87CEFA)
scene.add(cloud1)
let cloud2 = await cloudCreate(1.1, 'bcloud', 0xFFFF99)
scene.add(cloud2)
let cloud3 = await cloudCreate(0.8,'ccloud', 0x99FF99)
scene.add(cloud3)

let cloudStart = await cloudCreate(0.8,'startcloud', 0xFFFFFF)
scene.add(cloudStart)
cloudStart.rotation.set(Math.PI/2 + 0.1, Math.PI, 0);
cloudStart.position.set(1.5, 0, 0.8);

let planeup = 5;
const cloudxstart = 3; // where on x clouds start
let movx = cloudxstart;
let movs = 1.5;

let turbulancei = 0;
let turbulance = false; // turns turbulance off

let answered = false;

let cloudBlink = false;
let cloudPicked = 0;
let blinkCounter = 0;

let cloudon = true;

let gameStart = false;

let cloudsMove = true;
let cloudSpeed = 1; // 1 is ideal

let questionNum = -1;

let nextTimer = 0;
let nextReady = false;

let timeTillNextQ = 100; // threejs animate tics time between the next question.
let score = 0;


let questionsLength = 10;
QuestionsLength().then((re) => {
  questionsLength = re;
});

function nextQuestion(){
  resetClouds()
  questionNum += 1;
  if(questionNum == questionsLength){
    questionNum = 0;
  }

  getQuestion(questionNum).then((re) => {
    // get next question
    document.getElementById("question").innerHTML = re.title;
    document.getElementById("a1").innerHTML = "A: " + re.answers.a;
    document.getElementById("a2").innerHTML = "B: " + re.answers.b;
    document.getElementById("a3").innerHTML = "C: " + re.answers.c;
    // text back to black
    document.getElementById("question").style.color = "black";
    document.getElementById("question").style.fontSize = "3em"; 
    document.getElementById("a1").style.color = "#456A80";
    document.getElementById("a2").style.color = "#82824E";
    document.getElementById("a3").style.color = "#4E824E";

    console.log("Question number: "+ questionNum)

    answered = false;
  })
}

function showCorrect(){
  answerQuestion(questionNum, String(cloudPicked - 1)).then((re) => {
    console.log(re)
    if(cloudPicked == (re.correct + 1)){
      // correct
      document.getElementById("question").innerHTML = "Správně";
      document.getElementById("question").style.color = "green";
      score += 1;
      document.getElementById("score").innerHTML = "Score: " + score;
    } else {
      // incorrect
      document.getElementById("question").innerHTML = "Špatně";
      document.getElementById("question").style.color = "red";
      score = 0;
      document.getElementById("score").innerHTML = "Score: " + score;
    }
    document.getElementById("a"+ (re.correct + 1)).style.color = "green";
    document.getElementById("a"+ (re.bad[0] + 1)).style.color = "red";
    document.getElementById("a"+ (re.bad[1] + 1)).style.color = "red";
    });
}

function answerHandler(answer){
  switch(answer){
    case 1:
      nextReady = true;
      showCorrect()
      break;
    case 2:
      nextReady = true;
      showCorrect()
      break;
    case 3:
      nextReady = true;
      showCorrect()
      break;
  }
}

// load the first question at start
// if(gameStart){
//   getQuestion(questionNum).then((re) => {
//     document.getElementById("question").innerHTML = re.title;
//     document.getElementById("a1").innerHTML = "A: " + re.answers.a;
//     document.getElementById("a2").innerHTML = "B: " + re.answers.b;
//     document.getElementById("a3").innerHTML = "C: " + re.answers.c;

//     questionNum += 1;
//     console.log("Question number: "+ questionNum)
//   })
// }

function planeAnimation(){
  if(0.7 < (mouseY*0.5 + 1) && (mouseY*0.6 + 1) < 1.57){
    mouseposraw = mouseY*0.6 + 1;
  }
  mousepos += 0.25*(mouseposraw - mousepos)
  flyingVehicle.position.z = mousepos; // Adjust the sensitivity as needed

  if(lastpos<mouseposraw){
    //flyingVehicle.rotation.set(6, 0.5, 160)
    if(planeup < 6){
      planeup +=0.3 * gameSpeed
    }
  }
  if(lastpos==mouseposraw){
    //flyingVehicle.rotation.set(5, 0.5, 160)
    if(planeup > 5){
      planeup -=0.3 * gameSpeed
    }
    if(planeup < 5){
      planeup +=0.3 * gameSpeed
    }
  }
  if(lastpos>mouseposraw){
    //flyingVehicle.rotation.set(4, 0.5, 160)
    if(planeup > 4.5){
      planeup -=0.3 * gameSpeed
    }
  }
}

function planeTurbulance(){
  // turbulance !! UNSTABLE
  if(turbulance && turbulancei == 3){
    planeup += randFloat(-0.02, 0.02);
    turbulancei = 0;
  }
  turbulancei += 1;

  flyingVehicle.rotation.set(planeup, 0.1, 160)
  lastpos = mouseposraw
}

function moveClouds(){
  movx -= 0.01 * gameSpeed * cloudSpeed
  cloud1.position.set(movx, 0, 1.4);
  cloud2.position.set(movx, 0, 1.1);
  cloud3.position.set(movx, 0, 0.8);
}

function checkCollisions(){
  // collision boexs
  const boxv = new THREE.Box3().setFromObject(flyingVehicle);
  const box1 = new THREE.Box3().setFromObject(cloud1);
  const box2 = new THREE.Box3().setFromObject(cloud2);
  const box3 = new THREE.Box3().setFromObject(cloud3);

  if (boxv.intersectsBox(box1)) {
    answered = true;
    console.log("Collision cloud 1");
    cloudBlink = true;
    cloudPicked = 1;

    cloud2.visible = false;
    cloud3.visible = false;
  }
  if (boxv.intersectsBox(box2) && !answered) {
    answered = true;
    console.log("Collision cloud 2");

    cloudBlink = true;
    cloudPicked = 2;

    cloud1.visible = false;
    cloud3.visible = false;
  }
  if (boxv.intersectsBox(box3) && !answered) {
    answered = true;
    console.log("Collision cloud 3");
    cloudBlink = true;
    cloudPicked = 3;

    cloud1.visible = false;
    cloud2.visible = false;
  }
}

function blinkClouds(cloud){
  switch(cloud){
    case 1:
      if(cloudon){
        cloud1.visible = false;
        cloudon = false;
      }else{
        cloud1.visible = true;
        cloudon = true;
      }
      break;
    case 2:
      if(cloudon){
        cloud2.visible = false;
        cloudon = false;
      }else{
        cloud2.visible = true;
        cloudon = true;
      }
      break;
    case 3:
      if(cloudon){
        cloud3.visible = false;
        cloudon = false;
      }else{
        cloud3.visible = true;
        cloudon = true;
      }
      break;
    }
}

function resetClouds(){
  movx = cloudxstart; 
  cloud1.position.set(movx, 0, 1.4);
  cloud2.position.set(movx, 0, 1.1);
  cloud3.position.set(movx, 0, 0.8);
  cloud1.visible = true;
  cloud2.visible = true;
  cloud3.visible = true;
}

function animate() {
  requestAnimationFrame(animate);
  if(gameStart){
    // turn on answer things
    document.getElementById("a1").style.display = "block";
    document.getElementById("a2").style.display = "block";
    document.getElementById("a3").style.display = "block";
    document.getElementById("score").style.display = "block";
    // earth
    earth.rotation.y -= 0.003 * gameSpeed;
    propellerMesh.rotation.x += 0.4 * gameSpeed;

    planeAnimation()

    planeTurbulance()

    // cloud moving all the time
    if(cloudsMove) {
      moveClouds()
    }

    if(cloudBlink && blinkCounter < 21){
      
      blinkClouds(cloudPicked);
      blinkCounter += 1;
    } else if(cloudBlink && blinkCounter > 20){
      cloudBlink = false;
      blinkCounter = 0;
      answerHandler(cloudPicked)
    }

    if(nextReady){
      nextTimer += 1
    }

    if(nextTimer > timeTillNextQ){
      nextReady = false;
      nextTimer = 0;
      nextQuestion()
    }

    //cloud "blinking" and pushing them back after done blinking
    // if(cloudBlink[2] < -1){
    //   cloudBlink[0] = false
    //   cloudBlink[2] = 1;
    //   movx = cloudxstart; 
    //   cloud1.position.set(movx, 0, 1.4);
    //   cloud2.position.set(movx, 0, 1.1);
    //   cloud3.position.set(movx, 0, 0.8);
    //   cloud1.visible = true;
    //   cloud2.visible = true;
    //   cloud3.visible = true;
    //   cloudsMove = false;
    //   gameLogic()
    // }

    

    if(!answered){
      checkCollisions();
    }

    // if(answeredBox != 0 && cloud1.position.x < (-1)){
    //   answerHandler(answeredBox)
    //   console.log("gothere")
    //   answeredBox = 0;
    // }

    
  } 

  // START MENU
  else
  {
    // turn off answers
    document.getElementById("question").style.fontSize = "10em"; 
    document.getElementById("a1").style.display = "none"
    document.getElementById("a2").style.display = "none"
    document.getElementById("a3").style.display = "none"
    document.getElementById("score").style.display = "none"

    earth.rotation.y -= 0.001 * gameSpeed;
    propellerMesh.rotation.x += 0.2 * gameSpeed;

    cloudStart.position.set(movs, 0, 0.8);

    if(cloudStart.position.x > -0.001){
      movs -= 0.005 * gameSpeed * cloudSpeed;
    }

    if(0.7 < (mouseY*0.5 + 1) && (mouseY*0.6 + 1) < 1.57){
      mouseposraw = mouseY*0.6 + 1;
    }
    mousepos += 0.13*(mouseposraw - mousepos)
    flyingVehicle.position.z = mousepos; // Adjust the sensitivity as needed

    if(lastpos<mouseposraw){
      //flyingVehicle.rotation.set(6, 0.5, 160)
      if(planeup < 6){
        planeup +=0.1 * gameSpeed
      }
    }
    if(lastpos==mouseposraw){
      //flyingVehicle.rotation.set(5, 0.5, 160)
      if(planeup > 5){
        planeup -=0.1 * gameSpeed
      }
      if(planeup < 5){
        planeup +=0.1 * gameSpeed
      }
    }
    if(lastpos>mouseposraw){
      //flyingVehicle.rotation.set(4, 0.5, 160)
      if(planeup > 4.5){
        planeup -=0.1 * gameSpeed
      }
    }

    const startv = new THREE.Box3().setFromObject(flyingVehicle);
    const startcloudbox = new THREE.Box3().setFromObject(cloudStart);

    if (startv.intersectsBox(startcloudbox)) {
      scene.remove(cloudStart)
      nextQuestion()
      gameStart = true;
    }

    flyingVehicle.rotation.set(planeup, 0.1, 160)
    lastpos = mouseposraw
  }

  renderer.render(scene, camera);
}

animate();

camera.position.z = 0.7; // 0.7
camera.position.y = -0.5;
camera.rotation.x = 90
