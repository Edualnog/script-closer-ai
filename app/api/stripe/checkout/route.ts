
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { PLANS, getPlanDetails } from '@/lib/plans';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-11-17.clover' as any, // Cast to any to avoid strict type checks if versions mistmatch slightly
});

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { plan, interval } = body;

        if (!plan || !interval) {
            return NextResponse.json({ error: 'Plan and interval are required' }, { status: 400 });
        }

        const planDetails = getPlanDetails(plan);
        const priceId = planDetails.stripeIds?.[interval as 'monthly' | 'annual'];

        if (!priceId) {
            return NextResponse.json({ error: 'Invalid plan configuration' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            customer_email: user.email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/billing?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/billing?canceled=true`,
            metadata: {
                userId: user.id,
                plan: plan,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
    }
}
