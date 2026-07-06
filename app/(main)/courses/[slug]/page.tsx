"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase, Course, Lesson, Review, Profile } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Star,
  Play,
  Clock,
  BookOpen,
  Users,
  Globe,
  CheckCircle,
  PlayCircle,
  Lock,
  Heart,
  Share2,
  Gift,
  Award,
  FileText,
  Video,
  MessageCircle,
  ChevronLeft,
  ThumbsUp,
} from 'lucide-react';
import { toast } from 'sonner';

interface CourseWithDetails extends Course {
  instructor: Profile;
  category: { name: string; slug: string };
  lessons: Lesson[];
  reviews: (Review & { user: Profile })[];
}

const courseDescription = `This comprehensive course takes you from complete beginner to professional developer. You'll learn everything from the fundamentals of web development to advanced techniques used by top tech companies.`;

const courseHighlights = [
  'Learn HTML, CSS, and JavaScript from scratch',
  'Build real-world projects for your portfolio',
  'Master React, Node.js, and modern frameworks',
  'Understand database design and management',
  'Deploy applications to production',
  'Get job-ready with interview preparation',
];

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [course, setCourse] = useState<CourseWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  const slug = params.slug as string;

  useEffect(() => {
    fetchCourse();
  }, [slug]);

  const fetchCourse = async () => {
    setLoading(true);

    const { data: courseData } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles!courses_instructor_id_fkey(*),
        category:categories(name, slug),
        lessons(
          id,
          title,
          description,
          lesson_type,
          video_url,
          video_duration,
          order_index,
          is_preview
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (courseData) {
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('course_id', courseData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const courseWithDetails: CourseWithDetails = {
        ...courseData,
        instructor: courseData.instructor as Profile,
        category: courseData.category || { name: ' Uncategorized', slug: 'uncategorized' },
        lessons: courseData.lessons || [],
        reviews: reviewsData || [],
      };

      setCourse(courseWithDetails);

      if (user) {
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseData.id)
          .maybeSingle();

        setIsEnrolled(!!enrollmentData);

        const { data: wishlistData } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseData.id)
          .maybeSingle();

        setIsWishlisted(!!wishlistData);
      }
    }

    setLoading(false);
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!course) return;

    if (course.price === 0) {
      const { error } = await supabase.from('enrollments').insert({
        user_id: user.id,
        course_id: course.id,
      });

      if (!error) {
        toast.success('Successfully enrolled!');
        setIsEnrolled(true);
      } else {
        toast.error('Failed to enroll');
      }
    } else {
      router.push(`/checkout/${course.id}`);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!course) return;

    if (isWishlisted) {
      await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('course_id', course.id);
      setIsWishlisted(false);
      toast.success('Removed from wishlist');
    } else {
      await supabase.from('wishlist').insert({
        user_id: user.id,
        course_id: course.id,
      });
      setIsWishlisted(true);
      toast.success('Added to wishlist');
    }
  };

  const getTotalDuration = () => {
    if (!course) return 0;
    return course.lessons.reduce((acc, l) => acc + (l.video_duration || 0), 0);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-3/4 bg-secondary rounded mb-4" />
            <div className="h-4 w-1/2 bg-secondary rounded mb-8" />
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 h-96 bg-secondary rounded" />
              <div className="h-96 bg-secondary rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <Link href="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discountedPrice = course.discount_price || course.price;
  const discountPercent = course.discount_price
    ? Math.round((1 - course.discount_price / course.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-secondary/50 to-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/courses"
              className="inline-flex items-center text-muted-foreground hover:text-primary mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to courses
            </Link>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Badge>{course.category?.name}</Badge>
                  {course.featured && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Featured
                    </Badge>
                  )}
                  <Badge variant="outline">{course.level}</Badge>
                </div>

                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-xl text-muted-foreground mb-6">
                  {course.subtitle || course.description.substring(0, 200)}
                </p>

                <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{course.average_rating}</span>
                    <span className="text-muted-foreground">
                      ({course.total_reviews.toLocaleString()} ratings)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {course.total_students.toLocaleString()} students
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Globe className="w-4 h-4" />
                    {course.language}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Last updated {new Date(course.updated_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={course.instructor?.avatar_url || ''} />
                    <AvatarFallback>
                      {course.instructor?.full_name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{course.instructor?.full_name || 'Instructor'}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.instructor?.headline || 'Expert Instructor'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sticky Card */}
              <div className="hidden md:block">
                <Card className="sticky top-24 shadow-xl overflow-hidden">
                  <div className="relative aspect-video mb-4">
                    <img
                      src={course.cover_image_url || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=600'}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <button className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-primary ml-1" />
                      </button>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl font-bold">${discountedPrice}</span>
                      {course.discount_price && (
                        <>
                          <span className="text-xl text-muted-foreground line-through">
                            ${course.price}
                          </span>
                          <Badge variant="destructive">{discountPercent}% OFF</Badge>
                        </>
                      )}
                    </div>

                    {course.discount_price && course.discount_ends_at && (
                      <div className="text-sm text-destructive mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Sale ends {new Date(course.discount_ends_at).toLocaleDateString()}
                      </div>
                    )}

                    <Button
                      size="lg"
                      className="w-full gradient-bg mb-3"
                      onClick={handleEnroll}
                    >
                      {isEnrolled ? 'Continue Learning' : course.price === 0 ? 'Enroll Free' : 'Enroll Now'}
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full mb-6"
                      onClick={handleWishlist}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                      {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground mb-4">
                      30-Day Money-Back Guarantee
                    </p>

                    <div className="space-y-3 text-sm">
                      <h4 className="font-semibold">This course includes:</h4>
                      <div className="flex items-center gap-3">
                        <Video className="w-5 h-5 text-primary" />
                        {formatDuration(getTotalDuration())} of video content
                      </div>
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        {course.total_lessons} lessons
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-primary" />
                        Full lifetime access
                      </div>
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-primary" />
                        Certificate of completion
                      </div>
                      <div className="flex items-center gap-3">
                        <Gift className="w-5 h-5 text-primary" />
                        Access on mobile and TV
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-8">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
                    <div className="grid md:grid-cols-2 gap-3">
                      {courseHighlights.map((item, i) => (
                        <div key={i} className="flex gap-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h2 className="text-2xl font-bold mb-4">Description</h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        {course.description || courseDescription}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h2 className="text-2xl font-bold mb-4">Requirements</h2>
                    <ul className="space-y-2">
                      <li className="flex gap-2">
                        <CheckCircle className="w-5 h-5 text-muted-foreground" />
                        No prior programming experience required
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="w-5 h-5 text-muted-foreground" />
                        A computer with internet access
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="w-5 h-5 text-muted-foreground" />
                        Willingness to learn and practice
                      </li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="curriculum">
                  <div className="mb-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>{course.lessons.length} lessons</span>
                      <span>{formatDuration(getTotalDuration())} total</span>
                    </div>
                    <Accordion type="multiple" className="w-full">
                      <AccordionItem value="module-1">
                        <AccordionTrigger className="hover:bg-secondary/50 px-4 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-left">
                              <p className="font-semibold">Course Content</p>
                              <p className="text-sm text-muted-foreground">
                                {course.lessons.length} lessons • {formatDuration(getTotalDuration())}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 p-4">
                            {course.lessons
                              .sort((a, b) => a.order_index - b.order_index)
                              .map((lesson, i) => (
                                <div
                                  key={lesson.id}
                                  className={`flex items-center justify-between p-4 rounded-lg ${
                                    lesson.is_preview || isEnrolled
                                      ? 'hover:bg-secondary/50 cursor-pointer'
                                      : 'opacity-70'
                                  } transition-colors`}
                                  onClick={() => {
                                    if (lesson.is_preview || isEnrolled) {
                                      router.push(`/learn/${course.id}/${lesson.id}`);
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">
                                      {lesson.is_preview ? (
                                        <PlayCircle className="w-4 h-4 text-primary" />
                                      ) : isEnrolled ? (
                                        <PlayCircle className="w-4 h-4" />
                                      ) : (
                                        <Lock className="w-4 h-4" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium">{lesson.title}</p>
                                      <p className="text-sm text-muted-foreground capitalize">
                                        {lesson.lesson_type} • {formatDuration(lesson.video_duration || 0)}
                                      </p>
                                    </div>
                                  </div>
                                  {lesson.is_preview && !isEnrolled && (
                                    <Badge variant="outline">Preview</Badge>
                                  )}
                                </div>
                              ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </TabsContent>

                <TabsContent value="instructor">
                  <Card>
                    <CardContent className="p-8">
                      <div className="flex gap-6">
                        <Avatar className="w-32 h-32">
                          <AvatarImage src={course.instructor?.avatar_url || ''} />
                          <AvatarFallback className="text-3xl">
                            {course.instructor?.full_name?.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-2">
                            {course.instructor?.full_name || 'Instructor'}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {course.instructor?.headline || 'Expert Instructor'}
                          </p>
                          <div className="flex flex-wrap gap-6 text-sm mb-6">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              {course.instructor?.total_courses || 0} instructor rating
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {(course.instructor?.total_students || 0).toLocaleString()} students
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              {course.instructor?.total_courses || 0} courses
                            </div>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            {course.instructor?.bio || 'An experienced instructor passionate about teaching and helping students achieve their learning goals.'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews">
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <div className="text-5xl font-bold mb-2">{course.average_rating}</div>
                        <div className="flex items-center gap-2 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-5 h-5 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground">
                          Based on {course.total_reviews.toLocaleString()} reviews
                        </p>
                      </div>

                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <div key={stars} className="flex items-center gap-3">
                            <span className="w-12 text-sm">{stars} stars</span>
                            <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${(stars / 5) * 100}%` }}
                              />
                            </div>
                            <span className="w-12 text-sm text-muted-foreground">
                              {Math.round((stars / 5) * course.total_reviews)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-6">
                      {course.reviews.map((review) => (
                        <Card key={review.id}>
                          <CardContent className="p-6">
                            <div className="flex gap-4 mb-4">
                              <Avatar>
                                <AvatarImage src={review.user?.avatar_url || ''} />
                                <AvatarFallback>
                                  {review.user?.full_name?.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold">{review.user?.full_name}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <div className="flex">
                                    {[...Array(review.rating)].map((_, i) => (
                                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    ))}
                                  </div>
                                  <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-muted-foreground">{review.content}</p>
                            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                              <button className="flex items-center gap-1 hover:text-primary">
                                <ThumbsUp className="w-4 h-4" />
                                Helpful ({review.helpful_count})
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Purchase Card */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">${discountedPrice}</div>
            {course.discount_price && (
              <span className="text-sm text-muted-foreground line-through">
                ${course.price}
              </span>
            )}
          </div>
          <Button
            size="lg"
            className="gradient-bg"
            onClick={handleEnroll}
          >
            {isEnrolled ? 'Continue' : 'Enroll'}
          </Button>
        </div>
      </div>
    </div>
  );
}
