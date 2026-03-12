import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import Personas from "@/components/Personas";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import DashboardShowcase from "@/components/DashboardShowcase";
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
            text: "OpenClaw is the powerful open-source AI framework that runs under the hood. We handle all the technical stuff — you just chat with your assistant from your dashboard.",
          },
        },
        {
          "@type": "Question",
          name: "How is this different from ChatGPT or other AI tools?",
          acceptedAnswer: {
            "@type": "Answer",
            text: 'Most AI tools give you a blank chat window and leave you to figure it out. ClawsRUs agents come pre-configured for specific jobs — scheduling, research, email — and remember your preferences across conversations. Think of ChatGPT as a search engine you talk to; ClawsRUs is a personal assistant you delegate to.',
          },
        },
        {
          "@type": "Question",
          name: "How much does ClawsRUs cost?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ClawsRUs has one-time setup packages (Standard $199 or Concierge $599). Every signup also includes a 7-day Pro membership trial. After trial, continue on Free ($0) or Pro ($29/month).",
          },
        },
        {
          "@type": "Question",
          name: "Is ClawsRUs free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. After setup, you can stay on Free with all free skills, and purchase paid skills individually as needed.",
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
            text: "Yes. Your ClawsRUs dashboard works on any device with a browser — iPhone, Android, tablet, or desktop. No app to install.",
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
            text: "Yes. Each customer gets an isolated container. Your conversations stay in your private dashboard. We don't have access to your chat content.",
          },
        },
        {
          "@type": "Question",
          name: "What is a managed AI assistant?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A managed AI assistant is an AI service where someone else handles the technical setup, hosting, updates, and security — you just use it. ClawsRUs is a managed AI assistant built on OpenClaw. You get all the power of OpenClaw without needing to install, configure, or maintain anything yourself.",
          },
        },
        {
          "@type": "Question",
          name: "Can I use ClawsRUs for my business?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. ClawsRUs is designed for busy professionals and entrepreneurs. It handles research, email drafting, scheduling, and task management. Many users run it alongside their existing tools to offload repetitive admin work.",
          },
        },
        {
          "@type": "Question",
          name: "Is ClawsRUs an OpenClaw agent?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. ClawsRUs is built on OpenClaw, the open-source AI framework. We pre-configure and manage the OpenClaw agent for you, so you get the full power of the framework without any technical setup.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need to know how to code to use ClawsRUs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. ClawsRUs is designed for people with zero technical background. Setup takes under 10 minutes and involves no coding, no terminal commands, and no configuration files. If you can use a web browser, you can use ClawsRUs.",
          },
        },
        {
          "@type": "Question",
          name: "How does ClawsRUs compare to hiring a virtual assistant?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A human VA costs $500–2,000/month and works limited hours. ClawsRUs combines one-time setup and optional membership, runs 24/7, responds instantly, and never forgets context.",
          },
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      name: "ClawsRUs",
      applicationCategory: "BusinessApplication",
      featureList: "Long-term memory, Scheduling, Research, Email drafting, Reminders, Skill packs, Web and mobile dashboard",
      operatingSystem: "Web, iOS, Android",
      description:
        "A pre-configured personal AI assistant with its own web and mobile dashboard that handles scheduling, research, reminders, and life admin.",
      offers: [
        {
          "@type": "Offer",
          name: "Standard Setup",
          price: "199",
          priceCurrency: "USD",
          description: "One-time setup package with guided self-serve onboarding.",
        },
        {
          "@type": "Offer",
          name: "Concierge Setup",
          price: "599",
          priceCurrency: "USD",
          description: "One-time white-glove setup with onboarding call and tuning.",
        },
        {
          "@type": "Offer",
          name: "Pro Membership",
          price: "29",
          priceCurrency: "USD",
          billingIncrement: "P1M",
          description: "Optional monthly membership with all paid skills included.",
        },
      ],
    },
    {
      "@type": "WebSite",
      name: "ClawsRUs",
      url: "https://www.clawsrus.com",
      description: "Managed, pre-configured AI assistant with web and mobile dashboard for busy professionals. Built on OpenClaw.",
    },
    {
      "@type": "Product",
      name: "ClawsRUs Pro Membership",
      description: "Optional all-inclusive membership with premium skills and priority support.",
      brand: { "@type": "Organization", name: "ClawsRUs" },
      offers: {
        "@type": "Offer",
        price: "29",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://www.clawsrus.com/signup?setup_package=standard&persona=personal-assistant",
      },
    },
    {
      "@type": "Organization",
      name: "ClawsRUs",
      url: "https://www.clawsrus.com",
      description: "ClawsRUs is a managed AI assistant service built on OpenClaw, the open-source AI framework.",
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
      <DashboardShowcase />
      <Pricing />
      <SkillPacks />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
