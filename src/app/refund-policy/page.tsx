"use client"

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Undo2, ChefHat } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] animate-in fade-in duration-500">
      {/* Simple Header */}
      <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg">
              <ChefHat className="text-white w-5 h-5" />
            </div>
            <span className="font-headline text-xl font-black text-foreground">Bhartiya Swad</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="font-bold gap-2 rounded-xl">
              <ChevronLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
              <Undo2 className="w-8 h-8" />
            </div>
            <h1 className="text-5xl font-headline font-black tracking-tight text-foreground">Refunds & Cancellations</h1>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Satisfaction Guarantee</p>
          </div>

          <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white p-10 md:p-16 space-y-10 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-headline font-black text-foreground">1. Cancellation Policy</h2>
              <p className="text-muted-foreground">
                As a general rule, you shall not be entitled to cancel your order once you have received confirmation of the same. 
                However, if you cancel your order before it enters the "Preparing" status, we may, at our sole discretion, allow the cancellation.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-headline font-black text-foreground">2. Refund Eligibility</h2>
              <p className="text-muted-foreground">You may be entitled to a refund for the following reasons:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Your order was cancelled by Bhartiya Swad due to unforeseen circumstances.</li>
                <li>The items delivered are significantly different from what was ordered.</li>
                <li>The packaging was tampered with or damaged at the time of delivery.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-headline font-black text-foreground">3. Refund Process</h2>
              <p className="text-muted-foreground">
                Eligible refunds will be processed back to the original payment method within 5-7 business days. 
                Please note that for Cash on Delivery orders, refunds will be provided as platform credits or via bank transfer.
              </p>
            </section>

            <section className="space-y-4 pt-8 border-t border-dashed">
              <h2 className="text-2xl font-headline font-black text-foreground">4. Contact Support</h2>
              <p className="text-muted-foreground">
                If you have any issues with your order, please reach out to our support team immediately through the app dashboard 
                or by emailing us at <span className="font-bold text-primary">support@bhartiyaswad.com</span>.
              </p>
            </section>
          </Card>
        </div>
      </main>
    </div>
  );
}