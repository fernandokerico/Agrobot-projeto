let mediaRecorder;
let chunks = [];

const btn = document.getElementById("record");
const messages = document.getElementById("messages");

btn.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  chunks = [];

  mediaRecorder.ondataavailable = e => chunks.push(e.data);
  mediaRecorder.onstop = sendAudio;

  mediaRecorder.start();
  btn.textContent = "⏹️ Parar";

  btn.onclick = () => {
    mediaRecorder.stop();
    btn.textContent = "🎤 Gravar";
    btn.onclick = arguments.callee; // mantém o evento original
  };
});

async function sendAudio() {
  const blob = new Blob(chunks, { type: "audio/webm" });
  const form = new FormData();
  form.append("audio", blob, "audio.webm");

  addMessage("Você enviou áudio 🎤", "user");

  const resp = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    body: form,
  });

  const audioBuffer = await resp.arrayBuffer();
  const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
  const audioURL = URL.createObjectURL(audioBlob);

  addMessage(`<audio controls src="${audioURL}"></audio>`, "bot");
}

function addMessage(html, cls) {
  const el = document.createElement("div");
  el.className = "message " + cls;
  el.innerHTML = html;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}