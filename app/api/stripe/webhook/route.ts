import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-11-17.clover' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Admin client to bypass RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const plan = session.metadata?.plan;

                if (userId && plan) {
                    // Update user's plan
                    const { error } = await supabase
                        .from('users')
                        .update({
                            plano_atual: plan,
                            stripe_customer_id: session.customer as string,
                            stripe_subscription_id: session.subscription as string,
                        })
                        .eq('id', userId);

                    if (error) {
                        console.error('Error updating user plan:', error);
                        throw error;
                    }

                    console.log(`User ${userId} upgraded to ${plan}`);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;

                // Find user by stripe_subscription_id
                const { data: user } = await supabase
                    .from('users')
                    .select('id')
                    .eq('stripe_subscription_id', subscription.id)
                    .single();

                if (user) {
                    // Check if subscription is canceled or past_due
                    if (subscription.status === 'canceled' || subscription.status === 'past_due') {
                        await supabase
                            .from('users')
                            .update({ plano_atual: 'free' })
                            .eq('id', user.id);

                        console.log(`User ${user.id} downgraded to free (subscription ${subscription.status})`);
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;

                // Find user and downgrade to free
                const { data: user } = await supabase
                    .from('users')
                    .select('id')
                    .eq('stripe_subscription_id', subscription.id)
                    .single();

                if (user) {
                    await supabase
                        .from('users')
                        .update({
                            plano_atual: 'free',
                            stripe_subscription_id: null
                        })
                        .eq('id', user.id);

                    console.log(`User ${user.id} subscription deleted, downgraded to free`);
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook handler error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
