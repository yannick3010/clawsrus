import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import Personas from "@/components/Personas";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import SkillPacks from "@/components/SkillPacks";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Do I need any technical skills to set up my assistant?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Nope. After checkout, you'll follow a simple guided walkthrough that takes about 10 minutes. If you can install an app on your phone, you can set this up.",
          },
        },
        {
          "@type": "Question",
          name: "What is OpenClaw?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "OpenClaw is the powerful open-source AI framework that runs under the hood. We handle all the technical stuff — you just chat with your assistant on Telegram.",
          },
        },
        {
          "@type": "Question",
          name: "How is this different from ChatGPT or other AI tools?",
          acceptedAnswer: {
            "@type": "Answer",
            text: 'Most AI tools give you a blank chat window and leave you to figure it out. Your ClawsRUs assistant comes pre-configured for a specific job, remembers your preferences across conversations, and gets better over time. It\u2019s the difference between hiring someone and Googling "how to do things."',
          },
        },
        {
          "@type": "Question",
          name: "How much does ClawsRUs cost?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ClawsRUs offers a Free tier ($0 forever) and a Pro tier ($79/month). Every signup starts with a 7-day Pro trial so you can try all features before deciding.",
          },
        },
        {
          "@type": "Question",
          name: "Is ClawsRUs free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes — ClawsRUs has a free tier that includes your AI assistant with all free skills. You can upgrade to Pro ($79/month) anytime to unlock paid skills and priority support.",
          },
        },
        {
          "@type": "Question",
          name: "What can my assistant actually do?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Your assistant can help with research and quick answers, scheduling and calendar management, reminders and follow-ups, travel planning, email drafting, shopping lists and product research, event planning and coordination, and general Q&A. You can add skill packs to expand its capabilities anytime.",
          },
        },
        {
          "@type": "Question",
          name: "Does ClawsRUs work on iPhone and Android?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. ClawsRUs runs inside Telegram, which is available on iPhone, Android, desktop, and web. No separate app to install.",
          },
        },
        {
          "@type": "Question",
          name: "Does my assistant remember things between conversations?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Your assistant has long-term memory built in. It remembers your preferences, past requests, and context — so you never have to repeat yourself.",
          },
        },
        {
          "@type": "Question",
          name: "How do I create a Telegram bot?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "It takes about 2 minutes. After checkout, our setup page walks you through it step-by-step: open Telegram, message @BotFather, send /newbot, pick a name, and copy the token. That's it.",
          },
        },
        {
          "@type": "Question",
          name: "What messaging apps does it work with?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Right now, Telegram. We're adding Discord and Slack support soon.",
          },
        },
        {
          "@type": "Question",
          name: "Can I switch personas later?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Not yet in the self-serve flow, but email us and we can switch your persona within 24 hours. Self-serve switching is coming soon.",
          },
        },
        {
          "@type": "Question",
          name: "Is my data private?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Each customer gets an isolated container. Your conversations go through your own Telegram bot. We don't have access to your chat content.",
          },
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      name: "ClawsRUs",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Telegram",
      description:
        "A pre-configured personal AI assistant on Telegram that handles scheduling, research, reminders, and life admin.",
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "USD",
          description: "Free forever with core AI assistant and free skills.",
        },
        {
          "@type": "Offer",
          name: "Pro",
          price: "79",
          priceCurrency: "USD",
          billingIncrement: "P1M",
          description:
            "All-inclusive skills, priority support, and future Pro features.",
        },
      ],
    },
    {
      "@type": "Organization",
      name: "ClawsRUs",
      url: "https://www.clawsrus.com",
    },
  ],
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <Personas />
      <HowItWorks />
      <Features />
      <Pricing />
      <SkillPacks />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
