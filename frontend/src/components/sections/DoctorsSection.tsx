import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, MapPin, ArrowRight } from "lucide-react";

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    experience: "15+ years",
    rating: 4.9,
    location: "Heart Care Center",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face",
    availability: "Available Today",
    qualifications: ["MD Cardiology", "PhD Heart Surgery", "FACC"]
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Neurologist",
    experience: "12+ years",
    rating: 4.8,
    location: "Neurology Department",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face",
    availability: "Available Tomorrow",
    qualifications: ["MD Neurology", "Fellowship in Stroke", "FAAN"]
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrician",
    experience: "10+ years",
    rating: 4.9,
    location: "Children's Wing",
    avatar: "https://images.unsplash.com/photo-1594824475280-ca8c5c1de55d?w=300&h=300&fit=crop&crop=face",
    availability: "Available Today",
    qualifications: ["MD Pediatrics", "Child Development", "ABP Certified"]
  }
];

const DoctorsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Meet Our{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Expert Doctors
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our team of experienced medical professionals is dedicated to providing 
            exceptional care with compassion and expertise.
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {doctors.map((doctor) => (
            <Card 
              key={doctor.id} 
              className="group bg-card border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              <CardContent className="p-0">
                {/* Doctor Image */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={doctor.avatar} 
                    alt={doctor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-white/90 text-foreground">
                      {doctor.availability}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded-md">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="text-sm font-medium">{doctor.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      {doctor.name}
                    </h3>
                    <p className="text-primary font-medium mb-2">{doctor.specialty}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{doctor.experience}</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{doctor.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {doctor.qualifications.map((qual, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {qual}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Button>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Doctors */}
        <div className="text-center">
          <Button variant="outline" size="lg" className="group">
            View All Doctors
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DoctorsSection;