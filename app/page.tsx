"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Logo } from '@/components/common/logo';
import {
  Star, Users, Award, ChevronRight, Phone, ArrowRight, Sparkles,
  Clock, TrendingUp, MapPin, Youtube, Facebook, ExternalLink,
  GraduationCap, Atom, FlaskConical, Dna, Target, Calendar,
  Lightbulb, Brain, Microscope, Beaker, ChartBar, Trophy, Medal,
  Flame, BookOpen, CheckCircle, Globe, Heart, Zap, Shield, Crown,
  LucideIcon,
} from 'lucide-react';

const foundationBatches = [
  {
    id: '1', title: 'Physics Foundation', instructor: 'Awad Sir', rating: 4.9, reviews: 284, students: 520,
    image: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Physics', level: '11th-12th', duration: '12 months', lessons: 150,
    description: 'Mechanics, Optics, Thermodynamics with numerical practice',
    color: 'from-sky-500 to-cyan-400', icon: Atom,
  },
  {
    id: '2', title: 'Chemistry Foundation', instructor: 'Awad Sir', rating: 4.8, reviews: 223, students: 480,
    image: 'https://images.pexels.com/photos/2280551/pexels-photo-2280551.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Chemistry', level: '11th-12th', duration: '12 months', lessons: 140,
    description: 'Organic, Inorganic & Physical Chemistry with lab work',
    color: 'from-emerald-500 to-teal-400', icon: FlaskConical,
  },
  {
    id: '3', title: 'Biology Foundation', instructor: 'Awad Sir', rating: 4.9, reviews: 312, students: 640,
    image: 'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Biology', level: '11th-12th', duration: '12 months', lessons: 135,
    description: 'Botany & Zoology with practical knowledge',
    color: 'from-teal-500 to-cyan-500', icon: Dna,
  },
  {
    id: '4', title: 'NEET Preparation', instructor: 'Awad Sir', rating: 4.9, reviews: 421, students: 850,
    image: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'NEET', level: 'Medical', duration: '24 months', lessons: 450,
    description: 'Complete NEET UG with mock tests & doubt sessions',
    color: 'from-amber-500 to-orange-400', icon: Target,
  },
];

const subjects = [
  { name: 'Physics', icon: Atom, count: 450, color: 'from-sky-500 to-cyan-400', description: 'Mechanics, Optics, Thermodynamics' },
  { name: 'Chemistry', icon: FlaskConical, count: 380, color: 'from-emerald-500 to-teal-400', description: 'Organic, Inorganic & Physical' },
  { name: 'Biology', icon: Dna, count: 520, color: 'from-teal-500 to-cyan-500', description: 'Botany & Zoology complete' },
  { name: 'NEET Prep', icon: Target, count: 320, color: 'from-amber-500 to-orange-400', description: 'Medical entrance exam' },
  { name: 'JEE Prep', icon: GraduationCap, count: 280, color: 'from-rose-500 to-red-400', description: 'Engineering entrance' },
  { name: 'Board Exams', icon: Award, count: 400, color: 'from-cyan-500 to-blue-400', description: 'Maharashtra Board 11th & 12th' },
];

const testimonials = [
  { name: 'Rahul Sharma', role: 'NEET 2024 - Grant Medical College', image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150', content: 'Awad Sir made Physics concepts crystal clear with his unique teaching method. Scored 680+ in NEET!', rating: 5, score: '680+ NEET' },
  { name: 'Priya Patil', role: '12th Science - 95% Boards', image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150', content: 'Best coaching in Kaij! Personal attention and doubt sessions helped me achieve 95% in board exams.', rating: 5, score: '95% Boards' },
  { name: 'Amit Chavan', role: 'JEE 2024 - AIR 15,420', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150', content: 'Small batch sizes ensure individual focus. Awad Sir\'s dedication is remarkable!', rating: 5, score: 'AIR 15,420' },
  { name: 'Sneha Kulkarni', role: 'NEET 2024 - BJ Medical College', image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150', content: 'The systematic approach to Chemistry made even complex reactions easy to understand.', rating: 5, score: '670+ NEET' },
];

const achievements = [
  { value: '2000+', label: 'Students Trained', icon: Users },
  { value: '95%', label: 'Success Rate', icon: TrendingUp },
  { value: '15+', label: 'Years Experience', icon: Award },
  { value: '85%', label: 'Selection Rate', icon: Target },
  { value: '500+', label: 'NEET Selections', icon: Trophy },
  { value: '200+', label: 'JEE Selections', icon: Medal },
];

const methodology = [
  { icon: Brain, title: 'Conceptual Learning', description: 'Focus on understanding concepts, not rote memorization. Build a strong foundation for competitive exams.', color: 'from-sky-500 to-cyan-400' },
  { icon: Microscope, title: 'Practical Approach', description: 'Hands-on experiments and practical demonstrations for better understanding of scientific concepts.', color: 'from-emerald-500 to-teal-400' },
  { icon: Beaker, title: 'Problem Solving', description: 'Extensive practice of numerical problems and previous year questions for exam preparation.', color: 'from-teal-500 to-cyan-500' },
  { icon: ChartBar, title: 'Regular Assessment', description: 'Weekly tests and mock exams to track progress and identify areas for improvement.', color: 'from-amber-500 to-orange-400' },
];

const facilities = [
  { title: 'Modern Classrooms', description: 'Air-conditioned classrooms with smart boards and comfortable seating for focused learning.', image: 'https://images.pexels.com/photos/5212335/pexels-photo-5212335.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { title: 'Science Laboratory', description: 'Well-equipped lab for Physics and Chemistry practical experiments.', image: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { title: 'Library & Study Area', description: 'Dedicated quiet space with reference books and study materials.', image: 'https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

const features = [
  { icon: GraduationCap, title: 'Expert Faculty', description: 'Learn from Awad Sir with 15+ years of teaching experience in Science subjects.' },
  { icon: Users, title: 'Small Batches', description: 'Limited students per batch for personalized attention and effective learning.' },
  { icon: Calendar, title: 'Regular Tests', description: 'Weekly tests and mock exams for board and competitive exam preparation.' },
  { icon: BookOpen, title: 'Study Material', description: 'Comprehensive notes, practice papers, and previous year question solutions.' },
  { icon: Clock, title: 'Doubt Sessions', description: 'Dedicated doubt-solving sessions to clear all your concepts.' },
  { icon: Award, title: 'Proven Results', description: 'Consistent track record of successful students in NEET and JEE.' },
];

const faqs = [
  { question: 'What courses does Awad Educational Academy offer?', answer: 'We offer foundation courses for 11th and 12th Science (Physics, Chemistry, Biology) along with NEET and JEE preparation batches. All courses are taught by Awad Sir with focus on conceptual clarity.' },
  { question: 'What is the batch size at the academy?', answer: 'We maintain small batch sizes of 20-25 students to ensure personal attention and effective doubt solving for each student.' },
  { question: 'How can I enroll in a course?', answer: 'You can visit our academy at Jaibhavani Chowk, Kaij or call us at 09422105262. You can also reach us through our Facebook page.' },
  { question: 'Do you provide study materials?', answer: 'Yes, we provide comprehensive study materials including notes, practice papers, and previous year question papers for all subjects.' },
  { question: 'What are the class timings?', answer: 'Morning batch: 7:00 AM - 10:00 AM, Evening batch: 4:00 PM - 7:00 PM. Sunday special classes for doubt solving.' },
  { question: 'Is there any demo class available?', answer: 'Yes, we offer free demo classes for new students. You can attend 2-3 classes before enrolling to understand our teaching methodology.' },
];

function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));

  useEffect(() => {
    if (isInView && numericValue) {
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

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function SectionHeader({ badge, title, subtitle }: { badge: string; title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-14"
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-sm font-semibold text-primary tracking-wide uppercase">{badge}</span>
      </div>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">{title}</h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">{subtitle}</p>
    </motion.div>
  );
}

function CircuitNode({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 3, repeat: Infinity, delay, ease: 'easeInOut' }}
      className={`absolute w-2 h-2 rounded-full bg-accent ${className}`}
    >
      <div className="absolute inset-0 rounded-full bg-accent blur-sm" />
    </motion.div>
  );
}

export default function HomePage() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.98]);
  const backgroundY = useTransform(scrollY, [0, 400], [0, 150]);

  return (
    <div className="min-h-screen pcb-circuit-bg">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" />
            <div className="hidden md:flex items-center gap-8">
              {[
                { label: 'Courses', href: '#courses' },
                { label: 'Methodology', href: '#methodology' },
                { label: 'Results', href: '#results' },
                { label: 'Contact', href: '#contact' },
              ].map((link) => (
                <a key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group">
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full" />
                </a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <a href="tel:09422105262" className="hidden sm:flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition-all">
                <Phone className="w-4 h-4" />
                <span>09422105262</span>
              </a>
              <a href="#contact">
                <Button size="sm" className="gradient-bg shadow-lg shadow-primary/20 gap-1.5">
                  Enroll Now
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <motion.div style={{ y: backgroundY }} className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/image copy.png')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background/95" />
          <div className="absolute inset-0 pcb-traces opacity-40" />
          <div className="absolute inset-0 circuit-nodes opacity-50" />

          {/* Floating science elements */}
          <motion.div animate={{ y: [-20, 20, -20], rotate: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-20 left-10 opacity-20">
            <Atom className="w-32 h-32 text-primary" />
          </motion.div>
          <motion.div animate={{ y: [20, -20, 20], rotate: [0, -10, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-32 right-10 opacity-20">
            <FlaskConical className="w-28 h-28 text-emerald-500" />
          </motion.div>
          <motion.div animate={{ y: [-15, 15, -15], rotate: [0, 5, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/3 right-1/4 opacity-15">
            <Dna className="w-24 h-24 text-teal-500" />
          </motion.div>

          {/* Circuit nodes */}
          <CircuitNode className="top-[15%] left-[20%]" delay={0} />
          <CircuitNode className="top-[60%] left-[70%]" delay={0.5} />
          <CircuitNode className="top-[40%] left-[85%]" delay={1} />
          <CircuitNode className="top-[80%] left-[15%]" delay={1.5} />

          {/* Gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl opacity-40 animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl opacity-40 animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Trusted by 2000+ Students in Kaij, Maharashtra</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 max-w-4xl mx-auto leading-tight text-balance"
          >
            Build Strong{' '}
            <span className="gradient-text">Science Foundation</span>
            <br className="hidden sm:block" />
            with <span className="gradient-text">Awad Sir</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance"
          >
            Premier coaching for <strong className="text-foreground">Physics</strong>, <strong className="text-foreground">Chemistry</strong> & <strong className="text-foreground">Biology</strong>.
            Preparing students for Board Exams, NEET & JEE since 2010.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          >
            <a href="tel:09422105262">
              <Button size="lg" className="gradient-bg gap-2 h-14 px-8 text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all">
                <Phone className="w-5 h-5" />
                Call Now
              </Button>
            </a>
            <a href="#courses">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 hover:bg-primary/5 gap-2">
                Explore Courses
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
          </motion.div>

          {/* Subject Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {[
              { name: 'Physics', icon: Atom, color: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
              { name: 'Chemistry', icon: FlaskConical, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
              { name: 'Biology', icon: Dna, color: 'bg-teal-500/10 text-teal-600 border-teal-500/30' },
              { name: 'NEET', icon: Target, color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
              { name: 'JEE', icon: GraduationCap, color: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
            ].map((subject, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border ${subject.color} backdrop-blur-sm`}
              >
                <subject.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{subject.name}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { value: '2000', suffix: '+', label: 'Students Trained', icon: Users },
              { value: '95', suffix: '%', label: 'Success Rate', icon: TrendingUp },
              { value: '15', suffix: '+', label: 'Years Experience', icon: Award },
              { value: '500', suffix: '+', label: 'NEET Selections', icon: Trophy },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="glass-card p-5 rounded-xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 circuit-pulse-line" />
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="stat-number text-2xl md:text-3xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
          >
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="flex flex-col items-center gap-2 text-muted-foreground">
              <span className="text-xs">Scroll to explore</span>
              <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
                <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 science-gradient" />
        <div className="absolute inset-0 circuit-nodes opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-semibold text-primary tracking-wide uppercase">About the Academy</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-balance">
                Nurturing Future <span className="gradient-text">Doctors & Engineers</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Awad Educational Academy</strong>, founded by <strong className="text-foreground">Awad Sir</strong>, has been the
                leading science coaching institute in <strong className="text-foreground">Kaij, Maharashtra</strong> for over 15 years.
                We specialize in building strong foundations in Physics, Chemistry, and Biology.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our personalized teaching approach and small batch sizes ensure every student receives
                individual attention. We prepare students for Board exams, NEET, and JEE with remarkable success.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                {[
                  { icon: Award, text: '15+ Years Experience' },
                  { icon: Users, text: '2000+ Students' },
                  { icon: Trophy, text: '85% Selection Rate' },
                  { icon: Star, text: 'Expert Faculty' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
                    <item.icon className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
              <a href="#contact">
                <Button size="lg" className="gradient-bg gap-2 shadow-lg shadow-primary/20 mt-2">
                  Join Awad Academy
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/40">
                <img src="https://images.pexels.com/photos/5212335/pexels-photo-5212335.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Classroom at Awad Educational Academy" className="w-full aspect-video object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Quality Education Since 2010</span>
                  </div>
                </div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="absolute -bottom-6 -left-6 glass-card p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">500+</div>
                    <div className="text-xs text-muted-foreground">NEET Selections</div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="absolute -top-6 -right-6 glass-card p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Star className="w-6 h-6 text-primary fill-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">95%</div>
                    <div className="text-xs text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="section-padding bg-card/50 relative overflow-hidden">
        <div className="absolute inset-0 pcb-traces opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <SectionHeader badge="Our Courses" title="Foundation & Competitive Exam Courses" subtitle="Comprehensive coaching for 11th & 12th Science with focus on Board, NEET & JEE preparation" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {foundationBatches.map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="group overflow-hidden h-full card-hover border-2 hover:border-primary/50 pcb-card">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center shadow-lg`}>
                      <course.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute top-4 right-4 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-sm">
                      <span className="text-xs font-semibold text-primary">{course.level}</span>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">{course.category}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{course.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3 space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{course.lessons}+ Topics</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" /><span>{course.students}+ students enrolled</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-white transition-colors gap-1.5">
                      Enroll Now
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-12">
            <a href="tel:09422105262">
              <Button size="lg" variant="outline" className="gap-2 border-2">
                <Phone className="w-4 h-4" />Call for Course Details
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Teaching Methodology Section */}
      <section id="methodology" className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 science-gradient" />
        <div className="absolute inset-0 circuit-nodes opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <SectionHeader badge="Our Approach" title="Teaching Methodology" subtitle="Our proven teaching methods ensure conceptual clarity and exam success" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {methodology.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full text-center p-6 card-hover border-2 hover:border-primary/50 group pcb-card">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section id="subjects" className="section-padding bg-card/50 relative overflow-hidden">
        <div className="absolute inset-0 pcb-traces opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <SectionHeader badge="Subjects" title="Complete Subject Coverage" subtitle="Master every topic with our comprehensive syllabus coverage" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full card-hover group overflow-hidden border-l-4 border-l-primary/50 pcb-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                        <subject.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{subject.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{subject.description}</p>
                        <Badge variant="secondary" className="text-xs">{subject.count}+ Topics</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Results/Achievements Section */}
      <section id="results" className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 science-gradient" />
        <div className="absolute inset-0 molecule-bg opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <SectionHeader badge="Our Results" title="Proven Track Record of Success" subtitle="Our students consistently achieve excellent results in board and competitive exams" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {achievements.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-5 rounded-xl glass-card hover:shadow-xl transition-all">
                <item.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl md:text-3xl font-bold gradient-text">{item.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
              </motion.div>
            ))}
          </div>
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-center mb-8">Student Success Stories</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full card-hover overflow-hidden pcb-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="achievement-badge">
                        <Trophy className="w-4 h-4 mr-1 text-amber-600" />
                        {testimonial.score}
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(testimonial.rating)].map((_, j) => (
                          <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-primary/20">
                        <AvatarImage src={testimonial.image} />
                        <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="section-padding bg-card/50 relative overflow-hidden">
        <div className="absolute inset-0 pcb-traces opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <SectionHeader badge="Facilities" title="Modern Learning Environment" subtitle="Well-equipped facilities for effective learning" />
          <div className="grid md:grid-cols-3 gap-6">
            {facilities.map((facility, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="overflow-hidden card-hover group pcb-card">
                  <div className="relative aspect-video overflow-hidden">
                    <img src={facility.image} alt={facility.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-semibold text-white text-lg">{facility.title}</h3>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{facility.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 science-gradient" />
        <div className="absolute inset-0 circuit-nodes opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <SectionHeader badge="Why Us" title="Why Choose Awad Academy?" subtitle="We are committed to providing the best science education in Kaij" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full p-6 card-hover group border-2 hover:border-primary/50 pcb-card">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                        <feature.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
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
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-5" />
        <div className="absolute inset-0 pcb-traces opacity-30" />
        <div className="absolute inset-0 molecule-bg opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center glass-card p-8 md:p-12 rounded-2xl border-2 border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 circuit-pulse-line" />
            <Flame className="w-12 h-12 mx-auto mb-4 text-orange-500" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Start Your Science Journey Today!</h2>
            <p className="text-lg text-muted-foreground mb-8 text-balance">
              Join Awad Educational Academy and build a strong foundation for your future in Science.
              Limited seats available for new batches.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:09422105262">
                <Button size="lg" className="gradient-bg gap-2 h-14 px-8 text-lg shadow-lg shadow-primary/30">
                  <Phone className="w-5 h-5" />Call: 09422105262
                </Button>
              </a>
              <a href="https://maps.google.com/?q=Awad+Educational+Academy+Kaij" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 gap-2">
                  <MapPin className="w-5 h-5" />Visit Academy
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-secondary/30">
        <div className="container mx-auto px-4">
          <SectionHeader badge="FAQ" title="Frequently Asked Questions" subtitle="Find answers to common queries about our courses and academy" />
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border rounded-lg px-4 bg-card hover:border-primary/30 transition-colors">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 science-gradient" />
        <div className="absolute inset-0 circuit-nodes opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <SectionHeader badge="Contact Us" title="Get in Touch" subtitle="Visit our academy or reach us through phone or social media" />
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card className="h-full border-2 pcb-card">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Address</h4>
                        <p className="text-muted-foreground text-sm">Jaibhavani Chowk, Infront Petrol,<br />Dharurer Road, Kaij,<br />Beed-431123, Maharashtra</p>
                      </div>
                    </div>
                    <a href="tel:09422105262" className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors block">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Phone className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Phone</h4>
                        <p className="text-emerald-600 font-medium">09422105262</p>
                      </div>
                    </a>
                    <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/10">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-teal-600" />Follow Us
                      </h4>
                      <div className="flex gap-4">
                        <a href="https://www.youtube.com/@awadeducationalacademyaea5913" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors">
                          <Youtube className="w-5 h-5 text-red-500" /><span className="text-sm font-medium">YouTube</span>
                        </a>
                        <a href="https://www.facebook.com/sofworld" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors">
                          <Facebook className="w-5 h-5 text-blue-500" /><span className="text-sm font-medium">Facebook</span>
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Class Timings</h4>
                        <p className="text-muted-foreground text-sm">Morning: 7:00 AM - 10:00 AM<br />Evening: 4:00 PM - 7:00 PM<br />Sunday: Doubt Solving Sessions</p>
                      </div>
                    </div>
                  </div>
                  <a href="https://www.google.com/maps/place/Awad+Educational+Academy,+Kaij/@18.7150936,76.064181,17z" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-6 text-primary hover:underline font-medium">
                    <ExternalLink className="w-4 h-4" />Open in Google Maps
                  </a>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="relative h-full min-h-[400px] rounded-2xl overflow-hidden border-2 shadow-xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1514.3734486537!2d76.064181!3d18.7150936!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc53f740b30ba23%3A0x2c6666615739f84b!2sAwad%20Educational%20Academy%2C%20Kaij!5e0!3m2!1sen!2sin!4v1703287654321!5m2!1sen!2sin"
                  width="100%" height="100%" style={{ border: 0, minHeight: '400px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-card p-4 rounded-xl shadow-lg border flex items-center gap-3">
                <MapPin className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-semibold text-sm">Awad Educational Academy</div>
                  <div className="text-xs text-muted-foreground">Kaij, Maharashtra</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card relative overflow-hidden">
        <div className="absolute inset-0 pcb-traces opacity-20" />
        <div className="absolute inset-0 molecule-bg opacity-30" />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <Logo size="md" linkClassName="mb-4" />
              <p className="text-muted-foreground text-sm mb-4 max-w-md">
                Awad Educational Academy - Premier science coaching institute in Kaij, Maharashtra.
                Specializing in Physics, Chemistry & Biology foundation courses for 11th & 12th students.
                Founded by Awad Sir with 15+ years of teaching experience.
              </p>
              <div className="flex gap-3">
                <a href="https://www.youtube.com/@awadeducationalacademyaea5913" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors" aria-label="YouTube Channel">
                  <Youtube className="w-5 h-5 text-red-500" />
                </a>
                <a href="https://www.facebook.com/sofworld" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center transition-colors" aria-label="Facebook Page">
                  <Facebook className="w-5 h-5 text-blue-500" />
                </a>
                <a href="https://www.google.com/search?q=awad+educational+academy+kaij" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors" aria-label="Google Search">
                  <Globe className="w-5 h-5 text-primary" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                {['About Us', 'Courses', 'Results', 'Methodology', 'Contact'].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} className="text-muted-foreground hover:text-primary transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  <span className="text-muted-foreground">Jaibhavani Chowk, Infront Petrol, Kaij, Beed-431123</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0 text-primary" />
                  <a href="tel:09422105262" className="text-muted-foreground hover:text-primary transition-colors">09422105262</a>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">7AM-10AM, 4PM-7PM</span>
                </div>
              </div>
              <a href="https://www.google.com/maps/place/Awad+Educational+Academy,+Kaij/@18.7150936,76.064181,17z" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline">
                <MapPin className="w-4 h-4" />Get Directions
              </a>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>(c) {new Date().getFullYear()} Awad Educational Academy. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />Made with care for students in Kaij, Maharashtra
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
