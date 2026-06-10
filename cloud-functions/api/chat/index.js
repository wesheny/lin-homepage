import { LIN_AN_SYSTEM_INSTRUCTION } from "../../lib/linAnSystemInstruction.js";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
}

function getApiKey(context) {
  const env = context.env || {};
  const raw = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
  return String(raw).trim().replace(/^["']|["']$/g, "");
}

function buildContents(history, message) {
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

  return contents;
}

async function callGemini(apiKey, contents) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: LIN_AN_SYSTEM_INSTRUCTION }],
      },
      contents,
      generationConfig: {
        temperature: 0.75,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.error?.message ||
      `Gemini API 请求失败 (${response.status})`;
    throw new Error(message);
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join("\n");

  return text || "好像信号不太好，我一时间不知道怎么表达了...";
}

export function onRequestGet(context) {
  const hasKey = Boolean(getApiKey(context));
  return jsonResponse({
    ok: true,
    service: "chat",
    hasGeminiKey: hasKey,
  });
}

export async function onRequestPost(context) {
  try {
    const apiKey = getApiKey(context);
    if (!apiKey) {
      return jsonResponse(
        {
          error: "服务端未配置 GEMINI_API_KEY，请在 EdgeOne 项目环境变量中添加。",
        },
        500
      );
    }

    const { message, history } = await context.request.json();

    if (!message) {
      return jsonResponse({ error: "请输入内容后再提问哦！" }, 400);
    }

    const text = await callGemini(apiKey, buildContents(history, message));
    return jsonResponse({ text });
  } catch (error) {
    console.error("Chat function error:", error);
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
