"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase, Lesson, Course, LessonProgress, Enrollment } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  ChevronDown,
  ChevronLeft,
  BookOpen,
  CheckCircle,
  Lock,
  MessageCircle,
  FileText,
  Clock,
  Award,
  Download,
  Share2,
  ThumbsUp,
} from 'lucide-react';

interface LessonWithDetails extends Lesson {
  course: Course;
  progress?: LessonProgress;
}

export default function LearningPlayer() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [lesson, setLesson] = useState<LessonWithDetails | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  useEffect(() => {
    if (user) {
      fetchLessonData();
    }
  }, [courseId, lessonId, user]);

  const fetchLessonData = async () => {
    if (!user) return;

    const { data: lessonData } = await supabase
      .from('lessons')
      .select('*, course:courses(*)')
      .eq('id', lessonId)
      .maybeSingle();

    if (!lessonData) {
      router.push('/dashboard/courses');
      return;
    }

    setLesson(lessonData as LessonWithDetails);
    setCourse(lessonData.course as Course);

    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');

    if (lessonsData) {
      setAllLessons(lessonsData);
    }

    const { data: enrollmentData } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (enrollmentData) {
      setEnrollment(enrollmentData);
    }

    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (progressData) {
      setCurrentTime(progressData.last_position || 0);
      setNotes(progressData.notes || '');
    }

    setLoading(false);
  };

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (lesson?.progress?.last_position) {
        videoRef.current.currentTime = lesson.progress.last_position;
      }
    }
  }, [lesson?.progress?.last_position]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const markAsComplete = async () => {
    if (!user || !lesson) return;

    const { error } = await supabase
      .from('lesson_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lesson.id,
        course_id: courseId,
        completed: true,
        time_spent: Math.floor(currentTime),
        last_position: Math.floor(currentTime),
        completed_at: new Date().toISOString(),
        notes,
      });

    if (!error && enrollment) {
      const completedCount = allLessons.filter(l => l.id !== lesson.id).length + 1;
      const totalLessons = allLessons.length;
      const progress = (completedCount / totalLessons) * 100;

      await supabase
        .from('enrollments')
        .update({
          progress,
          completed_lessons: completedCount,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('id', enrollment.id);
    }

    const nextLesson = allLessons.find((l) => l.order_index > (lesson?.order_index || 0));
    if (nextLesson) {
      router.push(`/learn/${courseId}/${nextLesson.id}`);
    }
  };

  const saveProgress = async () => {
    if (!user || !lesson) return;

    await supabase
      .from('lesson_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lesson.id,
        course_id: courseId,
        last_position: Math.floor(currentTime),
        time_spent: Math.floor(currentTime),
        notes,
      });
  };

  const saveNotes = async () => {
    if (!user || !lesson) return;

    await supabase
      .from('lesson_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lesson.id,
        course_id: courseId,
        notes,
        last_position: Math.floor(currentTime),
        time_spent: Math.floor(currentTime),
      });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Lesson not found</h2>
          <Link href="/dashboard/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <Link href={`/courses/${course?.slug}`} className="flex items-center gap-2 hover:text-primary">
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to course</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="font-semibold truncate max-w-md">{course?.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowNotes(!showNotes)}>
              <FileText className="w-4 h-4 mr-1" />
              Notes
            </Button>
            <Button variant="outline" size="sm" onClick={markAsComplete}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Video Player Section */}
        <div className={`flex-1 transition-all ${sidebarOpen ? 'mr-80' : ''}`}>
          <div className="aspect-video bg-black relative group">
            {lesson.video_url ? (
              <video
                ref={videoRef}
                src={lesson.video_url}
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={markAsComplete}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-white text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No video available</p>
                </div>
              </div>
            )}

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 h-10 w-10"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1 ml-2">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <span className="text-white text-sm ml-4">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={playbackRate}
                    onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                    className="bg-transparent text-white text-sm border border-white/30 rounded px-2 py-1"
                  >
                    <option value="0.5">0.5x</option>
                    <option value="1">1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                  </select>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge className="mb-2 capitalize">{lesson.lesson_type}</Badge>
                <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
                {lesson.description && (
                  <p className="text-muted-foreground">{lesson.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {formatTime(lesson.video_duration || 0)}
                </span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              {prevLesson ? (
                <Link href={`/learn/${courseId}/${prevLesson.id}`}>
                  <Button variant="outline">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous Lesson
                  </Button>
                </Link>
              ) : (
                <div />
              )}
              {nextLesson ? (
                <Link href={`/learn/${courseId}/${nextLesson.id}`}>
                  <Button className="gradient-bg">
                    Next Lesson
                    <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
                  </Button>
                </Link>
              ) : (
                <Button className="gradient-bg" onClick={markAsComplete}>
                  <Award className="w-4 h-4 mr-1" />
                  Complete Course
                </Button>
              )}
            </div>

            {/* Notes Section */}
            {showNotes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Your Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Add your notes for this lesson..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      onBlur={saveNotes}
                      className="min-h-[200px]"
                    />
                    <Button onClick={saveNotes} className="mt-4">
                      Save Notes
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Sidebar - Course Content */}
        {sidebarOpen && (
          <div className="fixed right-0 top-14 bottom-0 w-80 bg-white border-l overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold">Course Content</h2>
                  <span className="text-sm text-muted-foreground">
                    {enrollment?.progress || 0}% complete
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${enrollment?.progress || 0}%` }}
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {allLessons.map((l, index) => {
                    const isCurrent = l.id === lessonId;
                    const isCompleted = false;
                    return (
                      <button
                        key={l.id}
                        onClick={() => router.push(`/learn/${courseId}/${l.id}`)}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg text-left ${
                          isCurrent
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-secondary/50'
                        } transition-colors`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : isCurrent
                              ? 'bg-primary text-white'
                              : 'bg-secondary'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-xs">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium truncate ${
                              isCurrent ? 'text-primary' : ''
                            }`}
                          >
                            {l.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="capitalize">{l.lesson_type}</span>
                            <span>{formatTime(l.video_duration || 0)}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
