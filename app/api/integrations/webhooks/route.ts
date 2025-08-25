import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    // Verify webhook signature
    if (signature && webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }
    } else {
      // For non-Stripe webhooks, parse as JSON
      try {
        event = JSON.parse(body);
      } catch (err) {
        console.error('Failed to parse webhook body:', err);
        return NextResponse.json(
          { error: 'Invalid webhook body' },
          { status: 400 }
        );
      }
    }

    // Handle different webhook types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Stripe webhook handlers
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  // Update your database or trigger real-time notifications
  // This is where you'd integrate with your application's business logic
  
  // Example: Send real-time notification to client
  // await sendRealTimeNotification({
  //   type: 'payment_success',
  //   data: {
  //     paymentIntentId: paymentIntent.id,
  //     amount: paymentIntent.amount,
  //     currency: paymentIntent.currency,
  //   }
  // });
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  
  // Handle payment failure logic
  // Example: Send notification to user, update order status, etc.
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);
  
  // Handle new subscription
  // Example: Update user access, send welcome email, etc.
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  
  // Handle subscription changes
  // Example: Update billing information, change plan access, etc.
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  // Handle subscription cancellation
  // Example: Revoke access, send cancellation email, etc.
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id);
  
  // Handle successful invoice payment
  // Example: Update billing records, send receipt, etc.
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);
  
  // Handle failed invoice payment
  // Example: Send dunning emails, update account status, etc.
}

// GitHub webhook handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const challenge = searchParams.get('hub.challenge');
    
    // GitHub webhook verification
    if (challenge) {
      return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('GitHub webhook verification error:', error);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 500 }
    );
  }
}

// Supabase webhook handler (for database changes)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { table, type, record, old_record } = body;

    console.log('Supabase webhook received:', { table, type, record, old_record });

    // Handle different database change types
    switch (type) {
      case 'INSERT':
        await handleDatabaseInsert(table, record);
        break;

      case 'UPDATE':
        await handleDatabaseUpdate(table, record, old_record);
        break;

      case 'DELETE':
        await handleDatabaseDelete(table, old_record);
        break;

      default:
        console.log(`Unhandled database change type: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Supabase webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Database change handlers
async function handleDatabaseInsert(table: string, record: any) {
  console.log(`New record inserted in ${table}:`, record);
  
  // Handle new database records
  // Example: Send notifications, update caches, trigger workflows, etc.
}

async function handleDatabaseUpdate(table: string, record: any, oldRecord: any) {
  console.log(`Record updated in ${table}:`, { new: record, old: oldRecord });
  
  // Handle database updates
  // Example: Update related data, send change notifications, etc.
}

async function handleDatabaseDelete(table: string, record: any) {
  console.log(`Record deleted from ${table}:`, record);
  
  // Handle database deletions
  // Example: Clean up related data, send deletion notifications, etc.
}
