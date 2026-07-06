"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase, Enrollment, Course } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  PlayCircle,
  ChevronRight,
  Calendar,
} from 'lucide-react';

interface EnrollmentWithCourse extends Enrollment {
  course: Course;
}

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgress: 0,
    totalHours: 0,
    certificates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    const { data: enrollmentsData } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (enrollmentsData) {
      const typed = enrollmentsData as EnrollmentWithCourse[];
      setEnrollments(typed);
      setRecentEnrollments(typed.slice(0, 4));

      const completed = typed.filter(e => e.completed_at).length;
      const inProgress = typed.filter(e => !e.completed_at).length;
      const totalHours = Math.floor(typed.reduce((acc, e) => acc + e.total_time_spent, 0) / 3600);
      const certificates = typed.filter(e => e.certificate_issued).length;

      setStats({
        totalCourses: typed.length,
        completedCourses: completed,
        inProgress,
        totalHours,
        certificates,
      });
    }

    setLoading(false);
  };

  const statCards = [
    { label: 'In Progress', value: stats.inProgress, icon: BookOpen, color: 'text-blue-500' },
    { label: 'Completed', value: stats.completedCourses, icon: Award, color: 'text-green-500' },
    { label: 'Certificates', value: stats.certificates, icon: Award, color: 'text-yellow-500' },
    { label: 'Hours Learned', value: stats.totalHours, icon: Clock, color: 'text-purple-500' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-secondary rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}
        </h1>
        <p className="text-muted-foreground">
          {profile?.role === 'instructor'
            ? 'Manage your courses and track student progress'
            : 'Continue your learning journey'}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-4 gap-4"
      >
        {statCards.map((stat, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <Badge variant="secondary">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Continue Learning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Continue Learning</h2>
          <Link href="/dashboard/courses">
            <Button variant="ghost" className="gap-1">
              View All
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {recentEnrollments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your learning journey by browsing our courses
              </p>
              <Link href="/courses">
                <Button className="gradient-bg">Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {recentEnrollments.map((enrollment, i) => (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Link href={`/learn/${enrollment.course.id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={enrollment.course.cover_image_url || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=200'}
                            alt={enrollment.course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="font-semibold mb-1 group-hover:text-primary line-clamp-1">
                              {enrollment.course.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {enrollment.course.duration_hours} hours • {enrollment.course.total_lessons} lessons
                            </p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{enrollment.progress}% complete</span>
                              <span className="text-muted-foreground">{Math.floor(enrollment.total_time_spent / 60)} mins</span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${enrollment.progress}%` }}
                              />
                            </div>
                          </div>
                          <Button size="sm" className="gap-1">
                            <PlayCircle className="w-4 h-4" />
                            Resume
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Learning Activity */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Learning Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end justify-between gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const heights = [60, 40, 80, 50, 90, 30, 45];
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full max-w-8 gradient-bg rounded-t transition-all hover:opacity-80"
                        style={{ height: `${heights[i]}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{day}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Quiz: {['JavaScript', 'React', 'Python'][i]} Basics</p>
                    <p className="text-xs text-muted-foreground">
                      Due in {i + 2} days
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                View Calendar
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
