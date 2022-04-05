let img=[];
let img2;
let icon;
let i=0;

let result;
let filen;


let xOffset=100;
let yOffset= 20;
let testFont;
let mouseActive=1;

let particles = [];
let myFrameCount = 0;

let particleSize = 10;  //10;
let alpha = 150;
let moveSteps=4;
let dd = 5;  // move distance


let perlinNoise = 0.0055// 0.0035;
let maxColorNoise = 50; // 20;
let numberParticles = 500;   // number of particles before particle update


let xBorder = 100;
let yBorder = 70;

let endTime = 0;
let startTime = 0;

let imageHoldMS = 10000;
let myDelay = 20;

let firstPass=1;
let totalParticles = 25000;
let maxFrameCount = moveSteps*totalParticles/numberParticles;
//====================================================
function myDelayTimer(){
  var start=millis();
  while(millis()-start < myDelay)
     {var xxx=1;}
  }
//====================================================
//function mousePressed(){
//         location.replace("./index.html");  // send to interactive file
//    }
//=======================================================
function preload(){

var result = document.getElementById("code").value;
       document.getElementById("demo").innerHTML = "Image code: " + result ;

//       filename = "https://portrait.quest-science.net/SN/images/art2020"+result+".jpg";
       filename = "https://portrait.quest-science.net/SN/art2020_"+result+".jpg";

       img2 = loadImage(filename);

       testFont = loadFont('assets/LemonJellyPersonalUse-dEqR.ttf');
  }
//====================================================
function setup() {
  createCanvas(2000,1000);
  background(150,150,150,255);
  textSize(24);
  noStroke();
        img.push(img2);
        img[img.length-1].resize(1300,0);
        updateParticles();

        startTime = millis();
   image(img[img.length-1],xOffset+xBorder,yOffset+yBorder);
   myDelayTimer();
//   img[img.length-1].hide();
//   clear();
//  background(150,150,150,255);
}
//=====================================================

function draw() {

// console.log("entering draw");

  textSize(86);
  textFont(testFont);
  fill(255,255,255);
  text("Quest Science Center",750,55);


  myFrameCount += 1;

  for (let p of particles) {
    p.draw();
    p.move();
  }
  if (myFrameCount % moveSteps === 0) {
    updateParticles();
  }
//=============================================
//  Go to this closing section to hold image on screen for imageHoldMS msec.
//

      if (myFrameCount > maxFrameCount){
        numberParticles = 1;
          if(firstPass)
          {
                endTime = millis() + imageHoldMS;totalTime=(endTime-startTime)*0.001;firstPass=0;
          }  // image will be removed after  seconds
          if(millis() > endTime){
              location.reload();
          }
       }


}
//========================================================
function updateParticles() {
  particles = [];
  for (let kk = 0; kk < numberParticles; kk++) {

    let x_inImage =  random(0, img[i].width -1);
    let y_inImage =  random(0, img[i].height -1);

    let pix = img[i].get(x_inImage, y_inImage);
    let c_ = color(pix[0] + random(maxColorNoise),
                   pix[1] + random(maxColorNoise),
                   pix[2] + random(maxColorNoise),
                   alpha);
 //   print(kk,x_inImage,y_inImage,c_);

    particles.push(new Particle(x_inImage+xBorder, y_inImage+yBorder, particleSize,  c_));
  }
}

function Particle(x_, y_, s_, c_) {
  this.x = x_;
  this.y = y_;
  this.size = s_;
  this.c = c_;


  this.move = function() {
    let theta = noise(this.x * perlinNoise,
                      this.y * perlinNoise)*PI*4;
    let v = p5.Vector.fromAngle(theta, dd);
    this.x += v.x;
    this.y += v.y;

  };


  this.draw = function() {
    fill(this.c);
    noStroke();
    circle(this.x + xOffset, this.y + yOffset, this.size);
  };
}


