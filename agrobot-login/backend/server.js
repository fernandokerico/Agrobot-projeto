import express from "express";
import multer from "multer";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/chat", upload.single("audio"), async (req, res) => {
  try {
    // 1. AUDIO -> TEXTO (ASR do ElevenLabs)
    const sttResp = await axios.post(
      "https://api.elevenlabs.io/v1/speech-to-text",
      req.file.buffer,
      {
        headers: {
          "Content-Type": "audio/webm",
          "xi-api-key": process.env.ELEVEN_API_KEY,
        },
      }
    );

    const textoPergunta = sttResp.data.text;

    // 2. IA responde com TEXTO
    const respostaTexto = `Você disse: ${textoPergunta}`; // aqui seria sua IA real

    // 3. TEXTO -> ÁUDIO (TTS)
    const ttsResp = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL",
      {
        text: respostaTexto,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVEN_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": "inline; filename=voz.mp3",
    });

    res.send(ttsResp.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro ao processar áudio" });
  }
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));