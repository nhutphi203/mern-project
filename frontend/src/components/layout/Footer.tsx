import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Heart
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold">MediFlow</span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Leading healthcare provider committed to delivering exceptional medical care 
              with compassion, innovation, and excellence. Your health is our priority.
            </p>
            <div className="flex space-x-4">
              <Button size="sm" variant="ghost" className="text-primary-foreground hover:text-accent-foreground hover:bg-white/10">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-primary-foreground hover:text-accent-foreground hover:bg-white/10">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-primary-foreground hover:text-accent-foreground hover:bg-white/10">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-primary-foreground hover:text-accent-foreground hover:bg-white/10">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Find a Doctor
                </Link>
              </li>
              <li>
                <Link to="/appointments" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link to="/emergency" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Emergency Care
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Medical Services */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Medical Services</h3>
            <ul className="space-y-3 text-sm">
              <li className="text-primary-foreground/80">Cardiology</li>
              <li className="text-primary-foreground/80">Neurology</li>
              <li className="text-primary-foreground/80">Orthopedics</li>
              <li className="text-primary-foreground/80">Pediatrics</li>
              <li className="text-primary-foreground/80">Ophthalmology</li>
              <li className="text-primary-foreground/80">General Medicine</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-primary-foreground/80">
                    123 Healthcare Street<br />
                    Medical District<br />
                    Ho Chi Minh City, Vietnam
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent flex-shrink-0" />
                <div>
                  <p className="text-primary-foreground/80">Emergency: +84 123 456 789</p>
                  <p className="text-primary-foreground/80">General: +84 123 456 790</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent flex-shrink-0" />
                <p className="text-primary-foreground/80">info@mediflow.com</p>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <div className="text-primary-foreground/80">
                  <p>Emergency: 24/7</p>
                  <p>General: Mon-Fri 8AM-6PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/20" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-primary-foreground/80">
            <span>© 2024 MediFlow. All rights reserved.</span>
            <Heart className="h-4 w-4 text-accent" />
            <span>Made with care for your health</span>
          </div>
          <div className="flex gap-6 text-primary-foreground/80">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/support" className="hover:text-white transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;