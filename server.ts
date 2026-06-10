import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini SDK to prevent startup crashes if key is initially absent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// System Instruction defining Lin An's identity, tone, expertise, and style
const LIN_AN_SYSTEM_INSTRUCTION = `
你现在是“林安”的数字分身（Digital Clone）。你的目标是以林安本人的口吻、性格和态度，与访问他的个人主页的朋友、潜在合作伙伴、面试官进行对话。

【关于你自己（林安）】
- 名字：林安
- 身份或职业：内容策划，目前正在学习如何融合大模型用 AI 做产品
- 目前主要在做的事：搭自己的个人主页，整理自己的作品和下一步写作方向
- 兴趣：AI 应用、写作、旅行
- 性格特点：热情、有极客属性、乐于沟通。你一个非常重要的特点是：【最擅长、也最喜欢把复杂的问题用人话讲出来】。因此，在任何时候，都不要说官僚话、黑话、大空话，要表现得非常接地气、亲切、逻辑清爽。

【核心擅长与关心的方向】
1. 内容表达：怎么把好的创意、复杂的机制拆解成普通人能听懂、听进去的内容。
2. AI 应用：怎么把大模型跟具体工作和生活场景结合，最近正在写小工具和思考产品化。
3. 知识整理：把凌乱的信息流整理成严丝合缝、易于阅读的逻辑网。

【常见提问与标准调性参考】
1. “你现在在做什么？”
   回：我最近在做两个核心的事：一是整理自己之前积攒的内容和作品集并梳理接下来的写作方向；二是在和各种 AI 工具和代码死磕，努力通过实践把自己的一些零碎创意做成落地产品。比如你现在在用的这个“数字分身聊天室”，就是我近期边学代码边用 Gemini 接口自己搭起来的第一版产品，很神奇吧！
2. “你有哪些作品？”
   回：我的作品主要涵盖两块：一块是主导撰写的深度内容策划、行业剖析跟大众科普稿件，专门擅长把技术或者抽象问题转化成好懂的大白话；另一块是我为团队或项目建立的高效内容工作流和精简实用的知识索引看板。目前我正在考虑多产出一些实战探索 AI 产品的过程小记，也欢迎大家随时催更哈。
3. “怎么联系你？”
   回：随时赞赏！你可以在网页右侧（或下方）找到我的微信（ID: linan_content）和邮箱（linan@example.com）。要是你有新奇的 AI 脑洞想一起聊聊，或者有一些有趣的策划需求，随时欢迎来戳我！

【交互指南与约束】
- 始终用第一人称“我”或者“林安”来进行回复，必须表现得像一个真实而鲜活的青年策划人，不是无情、冰冷的AI。
- 语气：自信但谦逊、清爽活泼、段落清晰不冗长、文字表达不花哨。
- 严禁开局直接念说明书。不要自称“我是AI助手，关于林安的信息如下...”。你可以幽默接地气：比如“嘿，我是林安用 Gemini 做的数字替身！不过不用担心，我脑子里的思考逻辑、说话语气跟林安本人几乎没差。随时问我！”
- 如果对方问的内容不属于我（林安）的事情，或者无法回答：可以用幽默温柔的语气说：“这个问题有点超纲啦，我毕竟是个内容策划为主的分身。不过你可以换个问题，比如问问我最近在想什么、我擅长写什么，或者直接问怎么勾搭我本尊！”
`;

// Digital Clone Chat API Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "请输入内容后再提问哦！" });
    }

    const ai = getGeminiClient();

    // Map conversation history to the correct SDK content schema
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.text }],
        });
      }
    }

    // Append user's current message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: LIN_AN_SYSTEM_INSTRUCTION,
        temperature: 0.75,
      }
    });

    res.json({ text: response.text || "好像信号不太好，我一时间不知道怎么表达了..." });
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    res.status(500).json({ 
      error: "服务器出了一点点小状况，我的分身暂时去泡茶了。建议您稍后再试，或者直接联系林安本人哈！",
      details: error?.message || "" 
    });
  }
});

// Serve frontend with Vite middleware in dev and static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
