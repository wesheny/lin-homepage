import AboutSection from "./components/AboutSection";
import ChatSection from "./components/ChatSection";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900" id="main-applet-root">
      <header className="relative z-10 px-5 sm:px-8 pt-6 pb-2" id="main-header">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-stone-400">
            Lin An · Personal Site
          </p>
        </div>
      </header>

      <main className="relative z-10 flex-grow max-w-5xl w-full mx-auto px-5 sm:px-8 pb-10" id="main-content-layout">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          <section
            className="lg:col-span-5 order-2 lg:order-1"
            id="about-column-wrapper"
          >
            <AboutSection />
          </section>

          <section
            className="lg:col-span-7 order-1 lg:order-2 lg:sticky lg:top-6"
            id="chat-column-wrapper"
          >
            <ChatSection />
          </section>
        </div>
      </main>

      <footer className="relative z-10 pb-8 text-center text-[11px] text-stone-400/80" id="main-footer">
        <p>© {new Date().getFullYear()} 林安</p>
      </footer>
    </div>
  );
}
