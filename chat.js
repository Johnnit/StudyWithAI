let submitBtn = document.querySelector("#send");
let promptForm = document.querySelector(".prompt-form");
let inputVal = document.querySelector("#msg");
let chatsContainer = document.querySelector(".messageArea");
let container = document.querySelector("section.chat");
let fileInput = document.querySelector(".fileInput");
let fileWrap = document.querySelector(".fileWrap");

  const chatHistory = [];
  const userData = {message: "", file: {}};
  const API_KEY = "AIzaSyBJVu76htGhMT5h-a15eiGs8SE3FLJoAWw";
 const API_URL =  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
 


const createMsgElement = (content, ...classes) =>{
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
}

//autoscroll page on text type and overflowY
const scrollToBottom = ()=>{
  window.scrollBy(0, 1000);
}

// typing effect animation for bot
const typingEffect = (text, textElement, botMsgDIV) =>{
  textElement.textContent = "";
  const words = text.split(" ");
  let wordIndex = 0;
  
  const typingInterval = setInterval(()=>{
    if(wordIndex < words.length){
      textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
      botMsgDIV.classList.remove("loading");
       //autoscroll to bottom
    scrollToBottom();
    }else{
      clearInterval(typingInterval);
    }
  }, 40);
}

// generate bot response
const generateResponse = async(botMsgDIV)=>{
  const textElement = botMsgDIV.querySelector(".message-text");
  chatHistory.push({
    role: 'user',
    parts: [{text: userData.message}, ...(userData.file.data ? [{inline_data: (({fileName, isImage, ...rest})=> rest)(userData.file)}] : [])]
  });
  try{
    //getting reply from Gemini AI
    const response = await fetch(API_URL, {
      method: "POST",
      methods:  'Content-Type: application/json',
      body: JSON.stringify({contents: chatHistory})
    });
    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
    
        //typing effect animation
    typingEffect(reply, textElement, botMsgDIV);
    
   chatHistory.push({
    role: 'model',
    parts: [{text: reply}]
  });
    
  }catch(error){
    console.log(error);
  }finally{
    userData.file = {};
    fileWrap.classList.remove("active", "image-attached", "file-attached");
  }
}

//handle message content
const sendMessage = (e)=>{
  e.preventDefault();
  const userMsg = inputVal.value.trim();
  userData.message = userMsg;
  if(!userMsg) return;
  // generate user message html and add to chat container
 let userMsgHTML = ` <p class="message-text"></p>
 ${userData.file.data ? (userData.file.isImage ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="img-attachment" >` : `<p class="file-attachment"><span class="bx bx-file"></span>${userData.file.fileName}</p>`) : ""}`;
  let userMsgDIV = createMsgElement(userMsgHTML, "user-msg");
  userMsgDIV.querySelector(".message-text").textContent = userMsg;
  chatsContainer.append(userMsgDIV);
  scrollToBottom();
  inputVal.value = "";
  
  setTimeout(()=>{
      // generate bot message html and add to chat container after 600ms
    let botMsgHTML = '<img src="./ai.png" alt="ailogo"> <p class="message-text">Getting response...</p>';
  let botMsgDIV = createMsgElement(botMsgHTML, "bot-msg", "loading");
  chatsContainer.append(botMsgDIV);
scrollToBottom();
  generateResponse(botMsgDIV);
  
  }, 600);
}
//form submission
promptForm.addEventListener("submit", sendMessage);

//handling file and image input change
fileInput.addEventListener("change", ()=>{
  const file = fileInput.files[0];
  
  if(!file) return;
  
  const isImage = file.type.startsWith("image/");
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e)=>{
    fileInput.value = "";
    const base64String = e.target.result.split(",")[1];
    fileWrap.querySelector(".imgUpload").src = e.target.result;
    fileWrap.classList.add("active", isImage ? "image-attached" : "file-attached");
    //store file data in userData
    userData.file = {fileName: file.name, data: base64String, mime_type: file.type, isImage
  }
  }
})
document.querySelector(".close").addEventListener("click", ()=>{
  userData.file = {};
  fileWrap.classList.remove("active", "image-attached", "file-attached");
})
document.getElementById("file").addEventListener("click", ()=> {
  
  fileInput.click();
})
