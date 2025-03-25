import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, BookOpen, Users, Calendar, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  const features = [
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: "College Exploration",
      description: "Browse through a curated list of colleges and universities across different fields.",
      href: "/colleges"
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Aptitude Tests",
      description: "Take comprehensive aptitude tests to discover your strengths and ideal career paths.",
      href: "/aptitude-test"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Career Counseling",
      description: "Connect with professional counselors for personalized guidance.",
      href: "/counselors"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Book Consultations",
      description: "Schedule one-on-one sessions with career experts.",
      href: "/bookings"
    }
  ]

  const benefits = [
    "Personalized career recommendations",
    "Expert guidance from industry professionals",
    "Comprehensive aptitude assessment",
    "Direct college application support"
  ]

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pt-16 pb-24">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070')] bg-cover bg-center opacity-5" />
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Shape Your Future with Confidence
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Discover your ideal career path through expert guidance, comprehensive assessments, and personalized college recommendations.
              </p>
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <Button size="lg" className="group" asChild>
                  <Link href="/register">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent z-10" />
              <Image
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070"
                alt="Students studying"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Explore Our Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to make informed decisions about your academic and professional future.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Link href={feature.href} key={index} className="group">
              <Card className="h-full transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 border-primary/10">
                <CardHeader>
                  <div className="mb-4 text-primary bg-primary/5 w-fit p-3 rounded-lg group-hover:bg-primary/10 transition-colors">
                    {feature.icon}
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Begin Your Journey?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of students who have found their perfect career path through our guidance system.
              Take the first step towards your dream career today.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}