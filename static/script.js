const video = document.getElementById("video");

const emotionDiv =
document.getElementById("emotion");

const confidenceDiv =
document.getElementById("confidence");

const emojiDiv =
document.getElementById("emoji");

const progressBar =
document.getElementById("progress-bar");

const dominantMood =
document.getElementById("dominant-mood");

const stability =
document.getElementById("stability");

const countDiv =
document.getElementById("count");

const timestamp =
document.getElementById("timestamp");

let detections = 0;

let emotionHistory = [];

navigator.mediaDevices.getUserMedia({
    video:true
})
.then(stream=>{
    video.srcObject = stream;
});

const canvas =
document.createElement("canvas");

setInterval(async()=>{

    if(!video.videoWidth)
        return;

    canvas.width =
    video.videoWidth;

    canvas.height =
    video.videoHeight;

    const ctx =
    canvas.getContext("2d");

    ctx.drawImage(video,0,0);

    const image =
    canvas.toDataURL("image/jpeg");

    try{

        const response =
        await fetch("/detect",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                image:image
            })
        });

        const data =
        await response.json();

        const emotionMap = {

            happy:"Happy",
            sad:"Sad",
            angry:"Angry",

            surprise:"Surprised",

            fear:"Surprised",
            fearful:"Surprised",

            disgust:"Angry",

            neutral:"Neutral"
        };

        const displayEmotion =
        emotionMap[data.emotion] ||
        "Neutral";

        const emojiMap = {

            Happy:"😊",
            Sad:"😢",
            Angry:"😠",
            Surprised:"😲",
            Neutral:"😐"
        };

        emotionDiv.innerText =
        displayEmotion;

        emojiDiv.innerText =
        emojiMap[displayEmotion];

        confidenceDiv.innerText =
        `Confidence: ${data.confidence}%`;

        progressBar.style.width =
        `${data.confidence}%`;

        detections++;

        countDiv.innerText =
        detections;

        timestamp.innerText =
        new Date().toLocaleTimeString();

        emotionHistory.push(
            displayEmotion
        );

        if(emotionHistory.length > 20){
            emotionHistory.shift();
        }

        const frequency = {};

        emotionHistory.forEach(e=>{

            frequency[e] =
            (frequency[e] || 0) + 1;

        });

        let dominant =
        displayEmotion;

        let max = 0;

        for(const key in frequency){

            if(frequency[key] > max){

                max =
                frequency[key];

                dominant =
                key;
            }
        }

        dominantMood.innerText =
        dominant;

        if(emotionHistory.length < 5){

            stability.innerText =
            "Learning";

        }else{

            const unique =
            new Set(
                emotionHistory.slice(-5)
            );

            stability.innerText =
            unique.size <= 2
            ? "Stable"
            : "Dynamic";
        }

    }catch(error){

        console.log(error);

    }

},3000);