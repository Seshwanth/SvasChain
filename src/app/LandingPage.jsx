  "use client";

  import { motion } from "framer-motion";
  import { Button } from "@/components/ui/button";
  import { useRouter } from "next/navigation";
  import { useAccount } from "wagmi";
  import { useConnectModal } from "@rainbow-me/rainbowkit";
  import {
    ArrowRight,
    Shield,
    FileText,
    Pill,
    Users,
    ChevronDown,
  } from "lucide-react";

  export default function LandingPage() {
    const router = useRouter();
    const { isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();

    const handleGetStarted = () => {
      if (isConnected) {
        router.push("/doctor");
      } else {
        openConnectModal();
      }
    };

    const fadeInUp = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 },
    };

    const features = [
      {
        icon: <Shield className="h-12 w-12 text-primary" />,
        title: "Secure Prescriptions",
        description:
          "Blockchain-powered security ensures tamper-proof medical prescriptions",
      },
      {
        icon: <FileText className="h-12 w-12 text-primary" />,
        title: "Digital Records",
        description:
          "Maintain complete prescription history with easy accessibility",
      },
      {
        icon: <Pill className="h-12 w-12 text-primary" />,
        title: "Pharmacy Integration",
        description: "Seamless connection between doctors and pharmacies",
      },
      {
        icon: <Users className="h-12 w-12 text-primary" />,
        title: "Multi-stakeholder Platform",
        description:
          "Connecting patients, doctors, and pharmacies in one platform",
      },
    ];

    const scrollToNextSection = (sectionId) => {
      const section = document.getElementById(sectionId);
      section?.scrollIntoView({ behavior: "smooth" });
    };

    return (
      <div className="overflow-x-hidden">
        {/* Hero Section */}
        <section
          id="hero"
          className="min-h-screen relative flex items-center justify-center overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 -z-10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-3xl" />
            <div className="absolute inset-0 bg-grid-white/10" />
          </motion.div>

          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
              >
                Revolutionizing Healthcare with Blockchain
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-muted-foreground mb-8"
              >
                Secure, transparent, and efficient prescription management system
                powered by blockchain technology
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-4"
              >
                <Button size="lg" onClick={handleGetStarted}>
                  {isConnected ? "Get Started" : "Connect Wallet"}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </div>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={() => scrollToNextSection("features")}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className="h-8 w-8 animate-bounce" />
          </motion.button>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="min-h-screen flex items-center bg-muted/50"
        >
          <div className="container mx-auto px-4 py-8">
            <motion.h2
              {...fadeInUp}
              className="text-3xl font-bold text-center mb-12"
            >
              Why Choose SvasChain?
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="p-6 rounded-lg bg-card hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-2 h-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="mb-4 text-green-500 transition-transform duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="min-h-screen flex items-center pb-20"
        >
          <div className="container mx-auto px-4 py-8">
            <motion.h2
              {...fadeInUp}
              className="text-3xl font-bold text-center mb-12"
            >
              How It Works
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: "1",
                  title: "Connect Wallet",
                  description: "Connect your Web3 wallet to access the platform",
                },
                {
                  step: "2",
                  title: "Create Prescription",
                  description:
                    "Doctors can create and manage digital prescriptions",
                },
                {
                  step: "3",
                  title: "Verify & Fulfill",
                  description:
                    "Pharmacies verify and fulfill prescriptions securely",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center group"
                >
                  <div
                    className={`w-16 h-16 rounded-full bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-500 text-2xl font-bold mx-auto mb-6 group-hover:bg-${item.color}-500 dark:group-hover:text-white  transition-colors`}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8 max-w-2xl mx-auto"
            >
              <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
              <p className="text-xl text-muted-foreground">
                Join us in revolutionizing healthcare with blockchain technology
              </p>
              <Button
                size="lg"
                onClick={handleGetStarted}
              >
                {isConnected ? "Launch App" : "Connect Wallet"}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4">SvasChain</h3>
                <p className="text-muted-foreground">
                  Revolutionizing healthcare with blockchain technology
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <button
                      onClick={() => scrollToNextSection("features")}
                      className="hover:text-foreground"
                    >
                      Features
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToNextSection("how-it-works")}
                      className="hover:text-foreground"
                    >
                      How It Works
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-4">Contact</h3>
                <p className="text-muted-foreground">
                  Have questions? Get in touch with us.
                </p>
              </div>
            </div>
            <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
              <p>© 2024 SvasChain. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }
