import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Brain, 
  Bone, 
  Eye, 
  Baby, 
  Stethoscope,
  Activity,
  UserCheck,
  ArrowRight
} from "lucide-react";

const services = [
  {
    icon: Heart,
    title: "Cardiology",
    description: "Comprehensive heart care with advanced diagnostic and treatment options.",
    features: ["ECG & Echo", "Cardiac Surgery", "Preventive Care"]
  },
  {
    icon: Brain,
    title: "Neurology",
    description: "Expert neurological care for brain and nervous system disorders.",
    features: ["Brain Imaging", "Stroke Care", "Neurosurgery"]
  },
  {
    icon: Bone,
    title: "Orthopedics",
    description: "Complete bone and joint care with minimally invasive procedures.",
    features: ["Joint Replacement", "Sports Medicine", "Fracture Care"]
  },
  {
    icon: Eye,
    title: "Ophthalmology",
    description: "Advanced eye care and vision correction services.",
    features: ["LASIK Surgery", "Cataract Surgery", "Retinal Care"]
  },
  {
    icon: Baby,
    title: "Pediatrics",
    description: "Specialized healthcare services for infants, children, and adolescents.",
    features: ["Well-child Visits", "Vaccinations", "Growth Monitoring"]
  },
  {
    icon: UserCheck,
    title: "General Medicine",
    description: "Primary healthcare services for routine and preventive care.",
    features: ["Health Checkups", "Chronic Disease", "Preventive Care"]
  }
];

const ServicesSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Our Medical{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Services
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We provide comprehensive healthcare services with state-of-the-art facilities 
            and experienced medical professionals dedicated to your well-being.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card 
                key={index} 
                className="group bg-card border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2"
              >
                <CardHeader>
                  <div className="h-12 w-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 bg-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="ghost" 
                    className="group/btn p-0 h-auto text-primary hover:text-primary-hover"
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Emergency Section */}
        <Card className="bg-gradient-to-r from-destructive to-destructive/80 border-0 text-destructive-foreground">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">24/7 Emergency Services</h3>
                  <p className="text-destructive-foreground/80">
                    Our emergency department is always ready to provide immediate medical attention
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="secondary" size="lg">
                  Emergency: +84 123 456 789
                </Button>
                <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Find Emergency Room
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ServicesSection;