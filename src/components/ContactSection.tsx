import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MapPin, Clock, MessageCircle, Shield, Car, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "24/7 Support Hotline",
      description: "Call us anytime for immediate assistance",
      value: "+91 98765-43210",
      action: "tel:+919876543210",
      badge: "Always Available"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Get detailed help via email",
      value: "support@ridesharehub.com",
      action: "mailto:support@ridesharehub.com",
      badge: "24h Response"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      value: "Start Chat",
      action: "#",
      badge: "Instant"
    }
  ];

  const driverContactFeatures = [
    {
      icon: Car,
      title: "Direct Driver Contact",
      description: "Passengers can contact their assigned driver directly through our secure system",
      features: ["In-app calling", "SMS messaging", "Location sharing"]
    },
    {
      icon: Shield,
      title: "Privacy Protected",
      description: "All communication is secure and privacy-protected with masked phone numbers",
      features: ["Masked numbers", "Call recording", "Report system"]
    },
    {
      icon: Users,
      title: "Emergency Contacts",
      description: "Share your ride details and driver contact with emergency contacts automatically",
      features: ["Auto-sharing", "Real-time tracking", "SOS button"]
    }
  ];

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Get in <span className="text-primary">Touch</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're here to help you with any questions, concerns, or support you need for your ride-sharing experience.
          </p>
        </div>

        {/* Driver Contact Feature Highlight */}
        <div className="max-w-6xl mx-auto mb-12">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Phone className="h-6 w-6 text-primary" />
                Passenger-Driver Contact System
              </CardTitle>
              <p className="text-muted-foreground">
                Stay connected with your driver while maintaining privacy and security
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {driverContactFeatures.map((feature, index) => (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                    <div className="space-y-1">
                      {feature.features.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-center gap-2">
                          <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                          <span className="text-xs text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Methods */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Contact Methods</h3>
            <div className="space-y-4 mb-8">
              {contactMethods.map((method, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg flex-shrink-0">
                        <method.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{method.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {method.badge}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                        <Button variant="outline" size="sm" asChild>
                          <a href={method.action}>
                            {method.value}
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Office Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Office Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  RideShareHub Technologies Pvt. Ltd.<br />
                  Tech Park, Sector 48<br />
                  Gurgaon, Haryana 122018<br />
                  India
                </p>
                <Separator />
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Monday - Friday: 9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Saturday - Sunday: 10:00 AM - 6:00 PM</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Send us a Message</h3>
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      name="subject"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Textarea
                      name="message"
                      placeholder="Your Message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Help */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm">FAQ</Button>
                  <Button variant="outline" size="sm">Driver Guide</Button>
                  <Button variant="outline" size="sm">Safety Tips</Button>
                  <Button variant="outline" size="sm">Report Issue</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;