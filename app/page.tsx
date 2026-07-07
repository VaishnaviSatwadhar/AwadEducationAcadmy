"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Logo, LogoIcon } from '@/components/common/logo';
import {
  Play,
  Star,
  Users,
  BookOpen,
  Award,
  Zap,
  Globe,
  Shield,
  ChevronRight,
  Phone,
  ArrowRight,
  Sparkles,
  Heart,
  Clock,
  TrendingUp,
  CheckCircle,
  MapPin,
  Mail,
  Youtube,
  Facebook,
  ExternalLink,
  GraduationCap,
  Atom,
  FlaskConical,
  Dna,
  Target,
  Calendar,
} from 'lucide-react';

const foundationBatches = [
  {
    id: '1',
    title: 'Physics Foundation Course',
    instructor: 'Awad Sir',
    rating: 4.9,
    reviews: 284,
    students: 520,
    price: 0,
    image: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Physics',
    level: '11th-12th',
    duration: '12 months',
    lessons: 150,
    description: 'Complete Physics syllabus with practical experiments and numerical practice',
  },
  {
    id: '2',
    title: 'Chemistry Foundation Course',
    instructor: 'Awad Sir',
    rating: 4.8,
    reviews: 223,
    students: 480,
    price: 0,
    image: 'https://images.pexels.com/photos/2280551/pexels-photo-2280551.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Chemistry',
    level: '11th-12th',
    duration: '12 months',
    lessons: 140,
    description: 'Organic, Inorganic & Physical Chemistry with lab experiments',
  },
  {
    id: '3',
    title: 'Biology Foundation Course',
    instructor: 'Awad Sir',
    rating: 4.9,
    reviews: 312,
    students: 640,
    price: 0,
    image: 'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Biology',
    level: '11th-12th',
    duration: '12 months',
    lessons: 135,
    description: 'Complete Botany & Zoology syllabus with practical knowledge',
  },
  {
    id: '4',
    title: 'NEET Preparation Batch',
    instructor: 'Awad Sir',
    rating: 4.9,
    reviews: 421,
    students: 850,
    price: 0,
    image: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'NEET',
    level: 'Medical Entrance',
    duration: '24 months',
    lessons: 450,
    description: 'Complete NEET UG preparation with mock tests and doubt sessions',
  },
];

const subjects = [
  { name: 'Physics', icon: Atom, count: 450, color: 'from-blue-500 to-cyan-400', description: 'Mechanics, Optics, Thermodynamics & more' },
  { name: 'Chemistry', icon: FlaskConical, count: 380, color: 'from-green-500 to-emerald-400', description: 'Organic, Inorganic & Physical Chemistry' },
  { name: 'Biology', icon: Dna, count: 520, color: 'from-purple-500 to-pink-400', description: 'Botany & Zoology with practicals' },
  { name: 'NEET Prep', icon: Target, count: 320, color: 'from-orange-500 to-yellow-400', description: 'Medical entrance exam preparation' },
  { name: 'JEE Prep', icon: GraduationCap, count: 280, color: 'from-red-500 to-rose-400', description: 'Engineering entrance preparation' },
  { name: 'Board Exams', icon: Award, count: 400, color: 'from-teal-500 to-cyan-400', description: 'Maharashtra Board 11th & 12th' },
];

const testimonials = [
  {
    name: 'Rahul Sharma',
    role: 'NEET 2024 - Selected at Grant Medical College',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'Awad Sir\'s teaching method is exceptional. The way he explains complex Physics concepts made everything crystal clear. I scored 680+ in NEET thanks to this academy.',
    rating: 5,
  },
  {
    name: 'Priya Patil',
    role: '12th Science - 95% in Board Exams',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'Best coaching institute in Kaij for science students. Personal attention and doubt solving sessions helped me achieve my goals. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Amit Chavan',
    role: 'JEE 2024 - AIR 15,420',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'The foundation course here is outstanding. Small batch sizes ensure personal attention. Awad Sir\'s dedication to each student is remarkable.',
    rating: 5,
  },
];

const stats = [
  { label: 'Students Taught', value: '2000+', icon: Users },
  { label: 'Success Rate', value: '95%', icon: TrendingUp },
  { label: 'Years Experience', value: '15+', icon: Award },
  { label: 'Selection Rate', value: '85%', icon: Target },
];

const features = [
  {
    icon: GraduationCap,
    title: 'Expert Faculty',
    description: 'Learn from Awad Sir with 15+ years of teaching experience in Physics, Chemistry, and Biology.',
  },
  {
    icon: Users,
    title: 'Small Batch Size',
    description: 'Limited students per batch ensuring personal attention and individual doubt solving.',
  },
  {
    icon: Calendar,
    title: 'Regular Tests',
    description: 'Weekly tests and mock exams to track progress and prepare for board & competitive exams.',
  },
  {
    icon: BookOpen,
    title: 'Study Material',
    description: 'Comprehensive notes, practice papers, and previous year question paper discussions.',
  },
];

const faqs = [
  {
    question: 'What courses does Awad Educational Academy offer?',
    answer: 'We offer foundation courses for 11th and 12th Science (Physics, Chemistry, Biology) along with NEET and JEE preparation batches. All courses are taught by Awad Sir with focus on conceptual clarity and practical understanding.',
  },
  {
    question: 'What is the batch size at the academy?',
    answer: 'We maintain small batch sizes of 20-25 students to ensure personal attention and effective doubt solving for each student.',
  },
  {
    question: 'How can I enroll in a course?',
    answer: 'You can visit our academy at Jaibhavani Chowk, Kaij or call us at 09422105262. You can also reach us through our Facebook page or visit during academy hours.',
  },
  {
    question: 'Do you provide study materials?',
    answer: 'Yes, we provide comprehensive study materials including notes, practice papers, and previous year question papers for all subjects.',
  },
  {
    question: 'What are the class timings?',
    answer: 'Classes are conducted in morning and evening batches. Morning batch: 7:00 AM - 10:00 AM, Evening batch: 4:00 PM - 7:00 PM. Sunday special classes for doubt solving.',
  },
];

function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = numericValue / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setCount(numericValue);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isInView, numericValue]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function HomePage() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);
  const backgroundY = useTransform(scrollY, [0, 400], [0, 150]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" />

            <div className="hidden md:flex items-center gap-8">
              <a href="#courses" className="text-sm font-medium hover:text-primary transition-colors">
                Courses
              </a>
              <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </a>
              <a href="#subjects" className="text-sm font-medium hover:text-primary transition-colors">
                Subjects
              </a>
              <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
                Contact
              </a>
            </div>

            <div className="flex items-center gap-4">
              <a href="tel:09422105262" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">09422105262</span>
              </a>
              <a href="#contact">
                <Button size="sm" className="gradient-bg">
                  Join Now
                </Button>
              </a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <motion.div
          style={{ y: backgroundY }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/image copy.png')" }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-background/80" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse-glow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/10 to-transparent" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 container mx-auto px-4 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Trusted by 2000+ Students in Kaij
              <ArrowRight className="w-4 h-4 ml-2" />
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold mb-6 max-w-4xl mx-auto leading-tight"
          >
            Build Your{' '}
            <span className="gradient-text">Science Foundation</span>
            <br className="hidden md:block" />
            with{' '}
            <span className="gradient-text">Awad Sir</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Expert coaching for Physics, Chemistry & Biology. Preparing students for
            Board Exams, NEET & JEE since 2010.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <a href="tel:09422105262">
              <Button size="lg" className="gradient-bg gap-2 h-14 px-8">
                <Phone className="w-5 h-5" />
                Call Now
              </Button>
            </a>
            <a href="#courses">
              <Button size="lg" variant="outline" className="h-14 px-8">
                View Courses
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap gap-3 justify-center mb-12"
          >
            {['Physics', 'Chemistry', 'Biology', 'NEET Prep', 'JEE Prep'].map((tag, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full bg-secondary/50 text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-12"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold">
                  <AnimatedCounter value={stat.label === 'Students Taught' ? '2000' : stat.label === 'Success Rate' ? '95' : stat.label === 'Years Experience' ? '15' : '85'} suffix={stat.label === 'Students Taught' || stat.label === 'Years Experience' ? '+' : '%'} />
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <Badge variant="secondary" className="mb-4">About Awad Educational Academy</Badge>
              <h2 className="text-4xl font-bold mb-4">
                Nurturing Future <span className="gradient-text">Doctors & Engineers</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Awad Educational Academy, founded by Awad Sir, has been the leading science coaching
                institute in Kaij, Maharashtra for over 15 years. We specialize in building strong
                foundations in Physics, Chemistry, and Biology for 11th and 12th standard students.
              </p>
              <p className="text-lg text-muted-foreground">
                Our personalized teaching approach and small batch sizes ensure every student receives
                individual attention. We prepare students not just for board exams but also for competitive
                exams like NEET and JEE with remarkable success rates.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>15+ Years Experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>2000+ Students Taught</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>85% Selection Rate</span>
                </div>
              </div>
              <a href="#contact">
                <Button size="lg" className="gradient-bg gap-2">
                  Contact Us
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/5212335/pexels-photo-5212335.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Classroom teaching at Awad Educational Academy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card p-6 rounded-2xl shadow-xl border">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">95%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Foundation Courses Section */}
      <section id="courses" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">Our Courses</Badge>
            <h2 className="text-4xl font-bold mb-4">Foundation Courses for Science Students</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive coaching for 11th & 12th Science with focus on Board, NEET & JEE preparation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {foundationBatches.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="group overflow-hidden h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant="secondary" className="bg-white/90 text-primary">
                        {course.level}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <Badge variant="outline" className="w-fit mb-2 text-xs">
                      {course.category}
                    </Badge>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{course.rating}</span>
                      <span className="text-muted-foreground text-sm">
                        ({course.reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.lessons}+ Topics
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      Join Now
                    </Badge>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section id="subjects" className="py-24 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">Our Subjects</Badge>
            <h2 className="text-4xl font-bold mb-4">Master Every Subject</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Complete syllabus coverage for each subject with practical knowledge and exam-focused preparation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="group h-full hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <subject.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{subject.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {subject.description}
                        </p>
                        <p className="text-sm font-medium text-primary">
                          {subject.count}+ Topics Covered
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">Why Choose Us</Badge>
            <h2 className="text-4xl font-bold mb-4">The Awad Academy Advantage</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We are committed to providing the best science education in Kaij
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="h-full text-center hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-xl mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">Student Success Stories</Badge>
            <h2 className="text-4xl font-bold mb-4">Our Students Achieve Great Results</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our students have to say about their learning experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={testimonial.image} />
                        <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center glass-card p-12"
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Start Your Science Journey?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join Awad Educational Academy and build a strong foundation for your future
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:09422105262">
                <Button size="lg" className="gradient-bg gap-2 h-14 px-8">
                  <Phone className="w-5 h-5" />
                  Call: 09422105262
                </Button>
              </a>
              <a href="https://maps.google.com/?q=Awad+Educational+Academy+Kaij" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="h-14 px-8 gap-2">
                  <MapPin className="w-5 h-5" />
                  Visit Academy
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">FAQ</Badge>
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Got questions? We have got answers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">Contact Us</Badge>
            <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Visit our academy or reach out to us through phone or social media
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6">Contact Information</h3>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Address</h4>
                        <p className="text-muted-foreground">
                          Jaibhavani Chowk, Infront Petrol, <br />
                          Dharurer Road, Kaij, <br />
                          Beed-431123, Maharashtra
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Phone</h4>
                        <a href="tel:09422105262" className="text-primary hover:underline">
                          09422105262
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Globe className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Follow Us</h4>
                        <div className="flex gap-4 mt-2">
                          <a
                            href="https://www.youtube.com/@awadeducationalacademyaea5913"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                          >
                            <Youtube className="w-5 h-5 text-red-500" />
                          </a>
                          <a
                            href="https://www.facebook.com/sofworld"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center transition-colors"
                          >
                            <Facebook className="w-5 h-5 text-blue-500" />
                          </a>
                          <a
                            href="https://www.google.com/maps/place/Awad+Educational+Academy,+Kaij/@18.7150936,76.064181,17z"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center transition-colors"
                          >
                            <MapPin className="w-5 h-5 text-green-500" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <a
                      href="https://www.google.com/maps/place/Awad+Educational+Academy,+Kaij/@18.7150936,76.064181,17z/data=!3m1!4b1!4m6!3m5!1s0x3bc53f740b30ba23:0x2c6666615739f84b!8m2!3d18.7150936!4d76.0667559!16s%2Fg%2F11ddzyg4tf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in Google Maps
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-video rounded-2xl overflow-hidden border shadow-xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1514.3734486537!2d76.064181!3d18.7150936!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc53f740b30ba23%3A0x2c6666615739f84b!2sAwad%20Educational%20Academy%2C%20Kaij!5e0!3m2!1sen!2sin!4v1703287654321!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card p-6 rounded-2xl shadow-xl border">
                <div className="text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">Timing</div>
                  <div className="text-sm text-muted-foreground">7AM - 10AM, 4PM - 7PM</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <Logo size="md" linkClassName="mb-4" />
              <p className="text-muted-foreground mb-4 max-w-md">
                Awad Educational Academy - Premier science coaching institute in Kaij, Maharashtra.
                Specializing in Physics, Chemistry & Biology foundation courses for 11th & 12th students.
                Preparing students for Board exams, NEET & JEE since 2010.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://www.youtube.com/@awadeducationalacademyaea5913"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                  aria-label="YouTube Channel"
                >
                  <Youtube className="w-5 h-5 text-red-500" />
                </a>
                <a
                  href="https://www.facebook.com/sofworld"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center transition-colors"
                  aria-label="Facebook Page"
                >
                  <Facebook className="w-5 h-5 text-blue-500" />
                </a>
                <a
                  href="https://www.google.com/search?q=awad+educational+academy+kaij"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                  aria-label="Google Search"
                >
                  <Globe className="w-5 h-5 text-primary" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {['About Us', 'Courses', 'Subjects', 'Testimonials', 'Contact'].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} className="text-muted-foreground hover:text-primary transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 shrink-0 text-primary" />
                  <span className="text-muted-foreground text-sm">
                    Jaibhavani Chowk, Infront Petrol, Dharurer Road, Kaij, Beed-431123, Maharashtra
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0 text-primary" />
                  <a href="tel:09422105262" className="text-muted-foreground hover:text-primary transition-colors">
                    09422105262
                  </a>
                </li>
              </ul>
              <a
                href="https://www.google.com/maps/place/Awad+Educational+Academy,+Kaij/@18.7150936,76.064181,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline"
              >
                <MapPin className="w-4 h-4" />
                Get Directions
              </a>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Awad Educational Academy. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <span>Founded by Awad Sir</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
