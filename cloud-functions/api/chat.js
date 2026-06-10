import { GoogleGenAI } from "@google/genai";
import { LIN_AN_SYSTEM_INSTRUCTION } from "../lib/linAnSystemInstruction.js";

let aiClient = null;

function getGeminiClient(apiKey) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=UTF-8" },
  });
}

export async function onRequestPost(context) {
  try {
    const apiKey =
      context.env?.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    const { message, history } = await context.request.json();

    if (!message) {
      return jsonResponse({ error: "请输入内容后再提问哦！" }, 400);
    }

    const ai = getGeminiClient(apiKey);
    const contents = [];

    if (history && Array.isArray(history)) {
      for (const turn of history) {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.text }],
        });
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: LIN_AN_SYSTEM_INSTRUCTION,
        temperature: 0.75,
      },
    });

    return jsonResponse({
      text: response.text || "好像信号不太好，我一时间不知道怎么表达了...",
    });
  } catch (error) {
    console.error("Gemini API Error details:", error);
    return jsonResponse(
      {
        error:
          "服务器出了一点点小状况，我的分身暂时去泡茶了。建议您稍后再试，或者直接联系林安本人哈！",
        details: error?.message || "",
      },
      500
    );
  }
}
