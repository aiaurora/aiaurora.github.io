const video1 = document.getElementById('inputVideo')
const inputtext = document.getElementById('inputtext')
const inputtextUser = document.getElementById('inputtextUser')
const mask = document.getElementById('mask')
const loadImg = document.getElementById('loadImg')

const idn = document.getElementById('identify')  //1.增加按鈕

// 讓輸入框圓角一點  需要 jquery-ui.min.js 和 jquery-ui.min.css
$('input:text').addClass("ui-widget ui-widget-content ui-corner-all ui-textfield");

// 儲存 cookie 的值(cookie的名字、cookie的值、儲存的天數)
function setCookie(cname,cvalue,exdays)
{
  var d = new Date();
  d.setTime(d.getTime()+(exdays*24*60*60*1000+8*60*60*1000));   // 因為是毫秒, 所以要乘以1000
  var expires = "expires="+d.toGMTString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}

// 得到 cookie 的值
function getCookie(cname)
{
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) 
  {
    var c = ca[i].trim();
    if (c.indexOf(name)==0) return c.substring(name.length,c.length);
  }
  return "";
}

var first = false  // 是否初始化網頁
var last_key = getCookie("key")
var last_name = getCookie("name")

// 確認 cookie 的值
function checkCookie()
{
  var key = ""
  var name = ""
  if(first == false){
    // 從 Cookie 中取值
    key = getCookie("key");
    inputtext.value = key
    name = getCookie("name");
    inputtextUser.value = name
    first = true
  }

  key = inputtext.value
  name = inputtextUser.value
  
  //if (key != "" && key != null)
  if(key != last_key)
  {
    setCookie("key",key,30);
    console.log("change:",key)
  }

  if(name != last_name)
  {
    setCookie("name",name,30);
    console.log("change:",name)
  }

  last_key = key
  last_name = name
}

// 先讀取完模型再開啟攝影機
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),     // 偵測臉部 
    faceapi.nets.ageGenderNet.loadFromUri('./models'),         // 年紀性別 

    faceapi.nets.faceLandmark68Net.loadFromUri('./models'), 
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),   
    faceapi.nets.faceExpressionNet.loadFromUri('./models'),    // 心情
    
    console.log("load models OK"),
    mask.style.display = "block",
    loadImg.style.display = "block",
    checkCookie()
  ]).then(startVideo)

async function startVideo(){
  await navigator.mediaDevices.getUserMedia({video: {}},)   
    .then(function(stream){
      console.log("setting")
      video1.setAttribute("autoplay", "true");
      video1.setAttribute("playsinline", "true");
      video1.setAttribute("muted", "true");
      video1.setAttribute("loop", "true");
      //video1.setAttribute("controls", "true");
      video1.srcObject = stream;
    })
    await video1.play();
    recognizeFaces()
  }

/*
function wait(ms){ 
    var start = new Date().getTime(); 
    var end = start; 
    while(end < start + ms) { 
    end = new Date().getTime(); 
    } 
}
*/
var displaySize;

var moods;  //2.global var 因為傳送按鈕

function recognizeFaces(){  
    const canvas = faceapi.createCanvasFromMedia(video1)
    document.body.append(canvas)
    canvas.style.left = getPosition(video1)["x"] + "px";
    canvas.style.top = getPosition(video1)["y"] + "px";
    displaySize = { width: video1.offsetWidth, height: video1.offsetHeight }   //3.這兩行不放的話按鈕時會放大
    faceapi.matchDimensions(canvas, displaySize)                               //3.這兩行不放的話按鈕時會放大
  
    setInterval(async () => {
      inputtext.style.width = video1.offsetWidth.toString()+"px"
      inputtext.style.height = video1.offsetHeight.toString()/8+"px"
      inputtextUser.style.width = video1.offsetWidth.toString()+"px"
      inputtextUser.style.height = video1.offsetHeight.toString()/8+"px"
      idn.style.height = video1.offsetHeight.toString()/8+"px"                 //4.0208增加測試是否能消除疊框
      idn.style.fontSize = video1.offsetHeight.toString()/15+"px"              //4.0208增加測試是否能消除疊框
      displaySize = { width: video1.offsetWidth, height: video1.offsetHeight }
      faceapi.matchDimensions(canvas, displaySize)
      // 年紀性別與結果
      const detections = await faceapi.detectAllFaces(video1, new faceapi.TinyFaceDetectorOptions()).withAgeAndGender()          
      const resizedDetections = faceapi.resizeResults(detections, displaySize)    
   
      // 心情與結果    
      const detections2 = await faceapi.detectAllFaces(video1, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()   
      const resizedDetections2 = faceapi.resizeResults(detections2, displaySize) 
      //moods = detections2[0]['expressions']      // 心情 
      moods = resizedDetections2[0]['expressions']      // 心情           
      
      /*
      if(resizedDetections.length >= 1){
          box = resizedDetections[0]['detection']['_box']  
          age = resizedDetections[0]['age']                // 年紀
          gender = resizedDetections[0]['gender']          // 性別  
      }
      */
      
      mask.style.display = "none"
      loadImg.style.display = "none"
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      faceapi.draw.drawDetections(canvas, resizedDetections)
    
      var dis_y = (video1.offsetHeight-video1.offsetWidth/1.337)/2   // 從左上角增加的距離
      var dis_x = (video1.offsetWidth-video1.offsetHeight*1.337)/2

      resizedDetections.forEach(detection => {
          canvas.style.left = getPosition(video1)["x"] + "px";
          canvas.style.top = getPosition(video1)["y"] + "px";
         const { age, gender, genderProbability } = detection
          new faceapi.draw.DrawTextField([
             `${parseInt(age, 10)} years old`,
              `${gender} (${parseInt(genderProbability * 100, 10)})`
             ], detection.detection.box.topRight).draw(canvas)
        }) 
      
      //faceapi.draw.drawDetections(canvas, resizedDetections2)
      //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections2)
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections2)  
      
      checkCookie()
    }, 100) 
}

$('#identify').click((e) => {      //5.按鈕作用
    console.log("執行辨識")
            
    //{key:value}物件轉為陣列型態[{key,value}]    
    var moodsArray = Object.keys(moods).map(key => {
          return {
                  "name": key,         //共有七種心情
                  "prop": moods[key]   //可信度
                 }
       })   
    //找出可信度最高的心情
    moodsArray.sort((a, b) => {
         return b.prop - a.prop;
    })
    mood = moodsArray[0].name
    console.log("moodArray_sorted#1:", mood)  
  
    var moodlabels = prompt("要不要修改呢?!我的心情(neutral,happy,angry,sad,surprised):",mood).toString().split(",")  //6.加確認用提示
    $.ajax({url: "https://io.adafruit.com/api/v2/"+inputtextUser.value+"/feeds/mood/data?X-AIO-Key="+inputtext.value,
    data:{"value":moodlabels[0]},  //7.mood改為moodlabels[0]
           type: "POST"
    })
    console.log("mood data send to adafruitIO:", moodlabels[0])
    
            /*
            $.ajax({url: "https://io.adafruit.com/api/v2/"+inputtextUser.value+"/feeds/age/data?X-AIO-Key="+inputtext.value,
                    data:{"value":parseInt(age)},
                    type: "POST"
                   })
            console.log("age data  send to adafruit")  
            $.ajax({url: "https://io.adafruit.com/api/v2/"+inputtextUser.value+"/feeds/gender/data?X-AIO-Key="+inputtext.value,
                    data:{"value":gender},
                    type: "POST"
                   })
            console.log("gender data send to adafruit") 
            */    
});

// 取得元素位置
function getPosition (element) {
    var x = 0;
    var y = 0;
    while ( element ) {
      x += element.offsetLeft - element.scrollLeft + element.clientLeft;
      y += element.offsetTop - element.scrollLeft + element.clientTop;
      element = element.offsetParent;
    }
    return { x: x, y: y };
 }
