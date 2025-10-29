import { SignupForm } from "../components/auth/signup-form";
import { AnimatedBackground } from "../components/ui/animated-background";
import { Container } from "../components/ui/container";
import Header from "../components/header";
import Footer from "../components/footer";

export default function SignupPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="relative bg-[#F8FAF9] pt-24 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <AnimatedBackground />
            <div className="absolute left-0 top-0 h-full w-full bg-[#F8FAF9] opacity-90" />
          </div>

          <Container className="relative py-16 sm:py-24">
            <div className="mx-auto max-w-md">
              <SignupForm />
            </div>
          </Container>
        </div>
      </main>
      <Footer />
    </div>
  );
}
