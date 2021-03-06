<!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js"></script> -->
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8/dist/teachablemachine-image.min.js"></script>
<script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
<!-- <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script> -->
<script src="https://cdn.bootcss.com/noty/3.1.4/noty.min.js"></script>
<script type="text/javascript">

    // More API functions here:
    // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

    $(document).ready(function () {
            //$('#activekey').on('input', function () {
            $('#modelurl').on('input', function () {        //0217手動只要輸入 modelurl的網址
                if ($(this).val() != '') {
                    $('#startBtn').attr('disabled', false);
                    $('#startBtn').css({'color':'rgb(255,255,255)','background-color':'rgb(65,65,65)'})
                }
                else {
                    $('#startBtn').attr('disabled', true);
                    $('#startBtn').css({'color':'rgb(65,65,65)','background-color':'rgb(128,128,128)'})
                }
            });
        });

    let model, webcam, labelContainer, maxPredictions, aio_n, aio_k, aio_f;
    var sendClicked = false;
    var pred_result_index = 0;
    // Load the image model and setup the webcam
    async function init() {

        // the link to your model provided by Teachable Machine export panel
        const URL = document.getElementById("modelurl").value;
        document.getElementById("msgbox").style.display = "none";
        // document.getElementById("scoreBar").style.display = "block";
        labelContainer = document.getElementById("label-container");
        labelContainer.appendChild(document.createElement("h1"));
        labelContainer.firstChild.innerHTML = "模型讀取中..." ;      
        labelContainer.style.display = "block"; 

        //******Read AIO info.*******
        // Adafruit user name
        aio_n = document.getElementById("username").value; 
        // Adafruit IO Key
        aio_k = document.getElementById("activekey").value;
        // Adafruit feed name 
        aio_f = document.getElementById("feed").value; 
        
        //正確完整賦值 0213
        aio_k = ""
        if (!aio_k.includes("aio")) {           
           aio_k = "aio";
        }
        if(!aio_k.includes("_KmsD57ndY6KVG1ihCyNCmXH4lQGw")) {           
           aio_k = aio_k + "_KmsD57ndY6KVG1ihCyNCmXH4lQGw";
        }  
        aio_n = ""
        if (!aio_n.includes("hylin")) {           
           aio_n = "hylin";
        }
        aio_f = ""
        if (!aio_f.includes("mood")) {           
           aio_f = "mood";
        }

        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // or files from your local hard drive
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        //亂數機
        const generator = new Math.seedrandom(Date.now());
        const randomNumber = generator();
        //隨機出題，排除最後一類：背景
        qNum = Math.floor(Math.random() * (maxPredictions - 1));

        console.log(qNum);
        

        // convenience function to setup a webcam
        const flip = true; // whether to flip the webcam
        webcam = new tmImage.Webcam(200, 200, flip); // width, height
        await webcam.setup({ facingMode: "user" }); // use "user" to use front-cam on mobile phones

        // append elements to the DOM --> **before starting the webcam**
        // document.getElementById('webcam-container').appendChild(webcam.canvas); // just in case you want to use specifically the canvas
        document.getElementById('webcam-container').appendChild(webcam.webcam); // webcam object needs to be added in any case to make this work on iOS

        // grab video-object in any way you want and set the attributes --> **"muted" and "playsinline"**
        let wc = document.getElementsByTagName('video')[0];
        wc.setAttribute("playsinline", true); // written with "setAttribute" bc. iOS buggs otherwise :-)

        wc.muted = "true"
        wc.id = "webcamVideo";

        // only now start the webcam --> **after video-object added to DOM and attributes are set**
        webcam.play();
        window.requestAnimationFrame(loop); // update canvas by loop-function
        document.getElementById("sendBtn").style.display = "block";
        // 更改 讀取中 文字
        labelContainer.firstChild.innerHTML = "準備好後請按下分享心情按鈕";
        //增加放 label 的 Div
        for (let i = 0; i < maxPredictions; i++) { // and class labels
                labelContainer.appendChild(document.createElement("div"));
            }
        predict();
    }

    async function loop() {
        webcam.update(); // update the webcam frame
        // await predict();
        window.requestAnimationFrame(loop);
    }

    // run the webcam image through the image model
    function preding() {
        labelContainer.firstChild.innerHTML = '心情辨識中...';
        // document.getElementById("sendBtn").style.backgroundColor = "#bbb";
        // document.getElementById("sendBtn").setAttribute("disabled","true");
        console.log("辨識中");
        sendClicked = true;
        predict();
    }
    async function predict() { 
        // predict can take in an image, video or canvas html element
        const prediction = await model.predict(webcam.canvas);

        var pred_result = [];
        for (let i = 0; i < maxPredictions; i++) {
                const Predct_Name = prediction[i].className;
                const Predct_Probability = prediction[i].probability.toFixed(2);
                
                if (typeof pred_result !== 'undefined' && pred_result.length == 0){
                    pred_result = [parseFloat(Predct_Probability), Predct_Name];
                }                
                else if (parseFloat(Predct_Probability) > pred_result[0]){                   
                    pred_result = [parseFloat(Predct_Probability), Predct_Name];
                    pred_result_index = i;
                }
                
                // console.log([parseFloat(Predct_Probability), parseFloat(pred_result[0])]);
                
                // labelContainer.childNodes[i].innerHTML = Predct_Name + " : " + Predct_Probability;
            }
        if (sendClicked){        
            labelContainer.firstChild.innerHTML = "您看起來有" + Math.floor(pred_result[0]*100) + "%心情是 " + pred_result[1];
                //****POST Value****
            $.ajax({
                    url: "https://io.adafruit.com/api/v2/" + aio_n + "/feeds/" + aio_f + "/data?X-AIO-Key=" + aio_k,
                    type: "POST",
                    data: {
                        "value":pred_result_index
                    },
                    })

                    .fail(function () {
                    new Noty({
                        text: '無法發出通知',
                        type: 'error'
                    }).show();
                    });    
        }
        pred_result_index = 0;

        }

</script>
