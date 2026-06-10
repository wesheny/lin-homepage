import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Compass, MessageCircle, FileText, BookOpen } from "lucide-react";
import avatarUrl from "../assets/images/lin_an_avatar_1781055311230.png";

const SKILLS_AND_DIRECTIONS = [
  {
    title: "内容策划与人话表达",
    desc: "把复杂的事讲清楚，让人愿意看、看得懂。",
  },
  {
    title: "用 AI 做产品",
    desc: "正在学习怎么把大模型用到具体场景里，做出真正有用的小东西。",
  },
  {
    title: "知识整理",
    desc: "把零散的信息梳理成有条理、好查找的结构。",
  }
];

const PORTFOLIO_LIST = [
  {
    title: "零基础小白的 AI 提效避坑指南",
    category: "科普手册",
    desc: "给不想碰代码的内容人写的，讲怎么把 AI 用到日常撰稿和策划里。",
    highlight: "阅读 10k+",
  },
  {
    title: "极简主张：人话策划硬核画布",
    category: "内容框架",
    desc: "一页纸画布，帮创作者快速定位受众痛点，砍掉行业黑话。",
    highlight: "核心模板",
  },
  {
    title: "用 AI 边走边写：西北游记",
    category: "游记观察",
    desc: "旅行随笔 + AI 辅助采风的实验，创意不只能在格子间里发生。",
    highlight: "实践记录",
  }
];

const CONTACTS = [
  { type: "wechat" as const, label: "微信", value: "linan_content", icon: MessageCircle, primary: true },
  { type: "email" as const, label: "邮箱", value: "linan@example.com", icon: FileText, primary: false },
];

export default function AboutSection() {
  const [activeTab, setActiveTab] = useState<"about" | "interests">("about");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const scrollToChat = () => {
    document.getElementById("chat-section-container")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-4" id="about-section-wrapper">
      {/* Intro + tabs */}
      <div className="bg-white/90 rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden" id="about-main-card">
        <div className="px-6 pt-7 pb-6 border-b border-stone-100" id="about-bio-card">
          <div className="flex items-start gap-5" id="profile-container">
            <div className="w-[72px] h-[72px] rounded-2xl ring-2 ring-stone-100 overflow-hidden flex-shrink-0">
              <img
                src={avatarUrl}
                alt="林安"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-2 pt-0.5 min-w-0">
              <h1 className="text-[1.65rem] font-bold text-stone-900 leading-tight tracking-tight">林安</h1>
              <p className="text-stone-600 text-[15px] leading-snug">
                一个正在学习用 AI 做产品的内容策划。
              </p>
              <p className="text-stone-400 text-xs leading-relaxed">
                擅长把复杂问题讲成人话。
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pt-4">
          <div className="flex gap-1 border-b border-stone-100" id="about-tab-navigation">
            {([
              { key: "about" as const, icon: User, label: "最近在忙什么" },
              { key: "interests" as const, icon: Compass, label: "平时喜欢啥" },
            ]).map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-2.5 -mb-px text-xs font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? "border-amber-600 text-stone-900"
                    : "border-transparent text-stone-400 hover:text-stone-600"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 min-h-[140px]" id="tab-panels-box">
          <AnimatePresence mode="wait">
            {activeTab === "about" && (
              <motion.div
                key="about-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                <div className="space-y-3 text-sm text-stone-600 leading-relaxed">
                  <p>
                    <span className="font-medium text-stone-800">整理作品和写作方向</span>
                    <span className="text-stone-400 mx-1.5">·</span>
                    复盘策划案例，规划接下来想写的内容。
                  </p>
                  <p>
                    <span className="font-medium text-stone-800">用 AI 做小产品</span>
                    <span className="text-stone-400 mx-1.5">·</span>
                    这个网站就是边学边做、和大模型结对编程搭出来的。
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 space-y-3">
                  <h3 className="text-[11px] font-semibold tracking-wide uppercase text-stone-400">方向</h3>
                  <ul className="space-y-2.5">
                    {SKILLS_AND_DIRECTIONS.map((skill, index) => (
                      <li key={index} className="text-sm">
                        <span className="font-medium text-stone-800">{skill.title}</span>
                        <span className="text-stone-400 mx-1.5">—</span>
                        <span className="text-stone-500">{skill.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {activeTab === "interests" && (
              <motion.div
                key="interests-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
                  <p>
                    <span className="font-medium text-stone-800">AI 工具探索</span>
                    <span className="text-stone-400 mx-1.5">·</span>
                    体验各家大模型，也帮身边朋友写点小脚本提效。
                  </p>
                  <p>
                    <span className="font-medium text-stone-800">自由写作</span>
                    <span className="text-stone-400 mx-1.5">·</span>
                    比起行业报告，更喜欢写真实、朴素的故事。
                  </p>
                  <p>
                    <span className="font-medium text-stone-800">旅行采风</span>
                    <span className="text-stone-400 mx-1.5">·</span>
                    背着相机到处走，拍直出图，顺便找写作灵感。
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <p className="text-xs text-stone-500 leading-relaxed">
                    过去两年去过大理、西北、川西藏区和东南亚海岛。最近在敦煌和青海湖，下一站计划川西环线。
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Works showcase */}
      <section className="bg-white/90 rounded-2xl border border-stone-200/80 shadow-sm px-6 py-5" id="works-section">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-amber-600" />
          <h2 className="font-semibold text-stone-800 text-sm">做过什么</h2>
        </div>

        <ul className="space-y-4">
          {PORTFOLIO_LIST.map((work, idx) => (
            <li
              key={idx}
              className={`space-y-1.5 ${idx > 0 ? "pt-4 border-t border-stone-100" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                  {work.category}
                </span>
                <span className="text-[11px] text-stone-400 flex-shrink-0">{work.highlight}</span>
              </div>
              <h3 className="font-medium text-sm text-stone-800 leading-snug">{work.title}</h3>
              <p className="text-xs text-stone-500 leading-relaxed">{work.desc}</p>
            </li>
          ))}
        </ul>

        <p className="text-[11px] text-stone-400 mt-4 pt-3 border-t border-stone-100">
          部分商业项目有保密要求。
          <button
            type="button"
            onClick={scrollToChat}
            className="text-amber-700 hover:text-amber-800 font-medium ml-1 cursor-pointer"
          >
            想了解更多？直接问我 →
          </button>
        </p>
      </section>

      {/* Contact */}
      <section className="bg-white/90 rounded-2xl border border-stone-200/80 shadow-sm px-6 py-5" id="contact-section">
        <div className="mb-4">
          <h2 className="font-semibold text-stone-800 text-sm">怎么联系我</h2>
          <p className="text-xs text-stone-400 mt-1">合作、交流，或者随便聊聊 AI 和内容，都欢迎。</p>
        </div>

        <div className="space-y-2" id="contact-buttons-row">
          {CONTACTS.map(({ type, label, value, icon: Icon, primary }) => (
            <button
              key={type}
              onClick={() => handleCopy(value, type)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                primary
                  ? "bg-amber-600 text-white hover:bg-amber-700"
                  : "bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100"
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" />
                {label}
                <span className={primary ? "text-amber-100" : "text-stone-400"}>{value}</span>
              </span>
              <span className={primary ? "text-amber-100" : "text-stone-400"}>
                {copiedKey === type ? "已复制 ✓" : "点击复制"}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={scrollToChat}
          className="w-full mt-3 px-4 py-2.5 rounded-xl text-xs font-medium text-amber-800 bg-amber-50 border border-amber-100 hover:bg-amber-100/80 transition-colors cursor-pointer lg:hidden"
        >
          或者直接在上方「和我聊聊」提问
        </button>
      </section>
    </div>
  );
}
