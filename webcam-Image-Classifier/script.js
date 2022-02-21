// JavaScript
const vdo = document.getElementById("vdo");
const overlay = document.getElementById("overlay");
const classOneGallery = document.getElementById("classOneGallery");
const classTwoGallery = document.getElementById("classTwoGallery");
const trainingBtn = document.getElementById("trainingBtn");
const output = document.getElementById("output");

let webcam;
let featureExtractor;
let knnClassifier;
let canvas;
let allExamples = [];
let ready = false;


function setup() {
    cv = createCanvas(320, 240);
    cv.id("preview");
    cv.parent("container");
    canvas = document.getElementById("preview");
    
    webcam = createCapture(VIDEO);
    webcam.size(640, 480);
    webcam.parent(vdo);
    
    // load the pre-trained data
    featureExtractor = ml5.featureExtractor("MobileNet", modelReady);
    
    output.style.display = "none";
}

function modelReady() {
    // initialize the KNN classifier
    knnClassifier = ml5.KNNClassifier();
    
    // hide the overlay
    overlay.style.display = "none";
}

function addToClass(classNum) {
    // extract the image features
    let features = featureExtractor.infer(webcam);
    
    image(webcam, 0, 0, 320, 240);
    let img = createImg( canvas.toDataURL() );
    
    if (classNum == 1) {
        img.parent(classOneGallery);

        const newExample = {
            label: "One",
            features: features
        }

        allExamples.push(newExample);
    }
    else {
        img.parent(classTwoGallery);

        const newExample = {
            label: "Two",
            features: features
        }

        allExamples.push(newExample);
    }
}

function training() {
    // show overlay
    overlay.style.display = "flex";
    document.querySelector("#overlay h3").innerText = "Training";

    knnClassifier.clearAllLabels();

    allExamples.forEach(function(example) {
        knnClassifier.addExample(example.features, example.label);
    });

    setTimeout(function() {
        overlay.style.display = "none";

        trainingBtn.style.display = "none";

        ready = true;

        output.style.display = "block";
    }, 2000);
}

function draw() {
    if (ready) {
        goClassify(); 
    }
}

function goClassify() {
    let features = featureExtractor.infer(webcam);

    knnClassifier.classify(features, showResult);  
}

function showResult(err, result) {
    if (err) {
        console.error(err);
    }
    else {
        const label = result.label;
        const confidence = (result.confidencesByLabel[result.label] * 100).toFixed(2);

        output.innerHTML = "Class <span>" + label + "</span> with <span>" + confidence + "%</span> confidence";
    }
}