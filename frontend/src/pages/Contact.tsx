
// src/pages/Contact.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Send,
    MessageSquare,
    Ambulance,
    Building2
} from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import type { MessageRequest } from '@/api/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Contact = () => {
    const { sendMessage, isSending } = useMessages();

    const [formData, setFormData] = useState<MessageRequest>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(formData);

        // Reset form after successful submission
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            message: '',
        });
    };

    const handleInputChange = (field: keyof MessageRequest, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="pt-20 pb-10">
                <div className="container mx-auto px-4">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Get in Touch
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            We're here to help you with any questions about our services,
                            appointments, or medical care. Reach out to us anytime.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Send us a Message
                                </CardTitle>
                                <CardDescription>
                                    Fill out the form below and we'll get back to you within 24 hours
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input
                                                id="firstName"
                                                placeholder="Enter your first name"
                                                value={formData.firstName}
                                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                required
                                                minLength={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                placeholder="Enter your last name"
                                                value={formData.lastName}
                                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                required
                                                minLength={3}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter your email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="Enter your phone number"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className="pl-10"
                                                required
                                                maxLength={10}
                                                minLength={10}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Tell us how we can help you..."
                                            value={formData.message}
                                            onChange={(e) => handleInputChange('message', e.target.value)}
                                            rows={6}
                                            required
                                            minLength={10}
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isSending}>
                                        <Send className="mr-2 h-4 w-4" />
                                        {isSending ? 'Sending...' : 'Send Message'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <div className="space-y-6">
                            {/* Emergency Contact */}
                            <Card className="bg-destructive text-destructive-foreground">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                                            <Ambulance className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Emergency Services</h3>
                                            <p className="text-destructive-foreground/80 text-sm">
                                                Available 24/7 for urgent medical care
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-white">
                                            <Phone className="h-4 w-4" />
                                            <span className="font-medium">+84 123 456 789</span>
                                        </div>
                                        <Button variant="secondary" className="w-full">
                                            Call Emergency Now
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Regular Contact Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Contact Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-medium mb-1">Hospital Address</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    123 Healthcare Street<br />
                                                    Medical District<br />
                                                    Ho Chi Minh City, Vietnam
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-medium mb-1">Phone Numbers</h4>
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    <p>General Inquiries: +84 123 456 790</p>
                                                    <p>Appointments: +84 123 456 791</p>
                                                    <p>Emergency: +84 123 456 789</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-medium mb-1">Email Addresses</h4>
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    <p>General: info@mediflow.com</p>
                                                    <p>Appointments: appointments@mediflow.com</p>
                                                    <p>Support: support@mediflow.com</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-medium mb-1">Operating Hours</h4>
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    <p>Emergency: 24/7</p>
                                                    <p>General Services: Mon-Fri 8AM-6PM</p>
                                                    <p>Saturday: 8AM-2PM</p>
                                                    <p>Sunday: Emergency only</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Map Placeholder */}
                            <Card>
                                <CardContent className="p-0">
                                    <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                                        <div className="text-center">
                                            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-muted-foreground">Hospital Location Map</p>
                                            <p className="text-sm text-muted-foreground">
                                                Interactive map would be displayed here
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;