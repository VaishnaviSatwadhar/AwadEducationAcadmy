"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase, Course, Coupon } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Lock,
  CheckCircle,
  Tag,
  Loader2,
  ArrowLeft,
  Gift,
  Shield,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  const courseId = params.courseId as string;

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/checkout/${courseId}`);
      return;
    }
  }, [user, courseId, router]);

  const fetchCourse = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .maybeSingle();

    if (data) {
      setCourse(data);
    }
    setLoading(false);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
      return;
    }

    if (data.valid_until && new Date(data.valid_until) < new Date()) {
      setCouponError('Coupon has expired');
      setAppliedCoupon(null);
      return;
    }

    if (data.max_uses && data.current_uses >= data.max_uses) {
      setCouponError('Coupon has reached maximum uses');
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(data);
    setCouponError('');
    toast.success('Coupon applied successfully!');
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const price = course?.discount_price || course?.price || 0;
    if (appliedCoupon.discount_type === 'percentage') {
      return price * (appliedCoupon.discount_value / 100);
    }
    return Math.min(appliedCoupon.discount_value, price);
  };

  const handlePayment = async () => {
    if (!user || !course) return;

    setProcessing(true);

    try {
      const finalPrice = (course.discount_price || course.price) - calculateDiscount();

      const { error: orderError } = await supabase.from('orders').insert({
        user_id: user.id,
        course_id: courseId,
        amount: course.price,
        discount_amount: calculateDiscount(),
        final_amount: finalPrice,
        status: 'completed',
        payment_method: 'card',
        coupon_id: appliedCoupon?.id,
      });

      if (orderError) {
        throw orderError;
      }

      const { error: enrollmentError } = await supabase.from('enrollments').insert({
        user_id: user.id,
        course_id: courseId,
      });

      if (enrollmentError) {
        throw enrollmentError;
      }

      if (appliedCoupon) {
        await supabase
          .from('coupons')
          .update({ current_uses: appliedCoupon.current_uses + 1 })
          .eq('id', appliedCoupon.id);
      }

      toast.success('Payment successful! Redirecting to your course...');
      router.push(`/learn/${courseId}/${courseId}`);
    } catch {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/20 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <Link href="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const originalPrice = course.price;
  const discountedPrice = course.discount_price || course.price;
  const couponDiscount = calculateDiscount();
  const finalPrice = discountedPrice - couponDiscount;

  return (
    <div className="min-h-screen bg-secondary/20 pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to course
          </Link>

          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid md:grid-cols-5 gap-8">
              {/* Left Column - Payment Form */}
              <div className="md:col-span-3 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-8 border-2 border-dashed rounded-lg text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Stripe Integration Required</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        To accept real payments, you need to configure Stripe.
                      </p>
                      <Button variant="outline" onClick={handlePayment} disabled={processing}>
                        Simulate Payment
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      Your payment is secured with 256-bit SSL encryption
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Apply Coupon
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1"
                      />
                      <Button variant="outline" onClick={handleApplyCoupon}>
                        Apply
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-sm text-destructive mt-2">{couponError}</p>
                    )}
                    {appliedCoupon && (
                      <div className="flex items-center gap-2 mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-700 dark:text-green-400">
                          Coupon {appliedCoupon.code} applied! You save ${couponDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Order Summary */}
              <div className="md:col-span-2">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={course.cover_image_url || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=200'}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.duration_hours}h • {course.total_lessons} lessons</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Price</span>
                        <span>${originalPrice.toFixed(2)}</span>
                      </div>
                      {course.discount_price && (
                        <div className="flex justify-between text-green-600">
                          <span>Course Discount</span>
                          <span>-${(originalPrice - discountedPrice).toFixed(2)}</span>
                        </div>
                      )}
                      {appliedCoupon && (
                        <div className="flex justify-between text-green-600">
                          <span>Coupon ({appliedCoupon.code})</span>
                          <span>-${couponDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span className="text-primary">${finalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="w-full gradient-bg"
                      onClick={handlePayment}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Complete Purchase
                        </>
                      )}
                    </Button>

                    <div className="space-y-2 pt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4" />
                        30-Day Money-Back Guarantee
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Gift className="w-4 h-4" />
                        Lifetime Access
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        Course Certificate Included
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
