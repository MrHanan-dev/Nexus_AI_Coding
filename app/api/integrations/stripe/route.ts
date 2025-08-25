import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-07-30.basil',
}) : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create-payment-intent':
        const { amount, currency = 'usd', metadata: paymentMetadata = {} } = data;
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata: paymentMetadata,
          automatic_payment_methods: {
            enabled: true,
          },
        });

        return NextResponse.json({
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        });

      case 'create-checkout-session':
        const { lineItems, successUrl, cancelUrl, mode = 'payment' } = data;
        
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: lineItems,
          mode,
          success_url: successUrl,
          cancel_url: cancelUrl,
        });

        return NextResponse.json({
          success: true,
          sessionId: session.id,
          url: session.url,
        });

      case 'create-subscription':
        const { customerId: subscriptionCustomerId, priceId, metadata: subscriptionMetadata = {} } = data;
        
        const subscription = await stripe.subscriptions.create({
          customer: subscriptionCustomerId,
          items: [{ price: priceId }],
          metadata: subscriptionMetadata,
        });

        return NextResponse.json({
          success: true,
          subscriptionId: subscription.id,
          status: subscription.status,
        });

      case 'get-customer':
        const { customerId: customerIdParam } = data;
        
        const customer = await stripe.customers.retrieve(customerIdParam);
        
        return NextResponse.json({
          success: true,
          customer,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Stripe API error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'get-payment-methods':
        const customerId = searchParams.get('customerId');
        
        if (!customerId) {
          return NextResponse.json(
            { error: 'Customer ID required' },
            { status: 400 }
          );
        }

        const paymentMethods = await stripe.paymentMethods.list({
          customer: customerId,
          type: 'card',
        });

        return NextResponse.json({
          success: true,
          paymentMethods: paymentMethods.data,
        });

      case 'get-invoices':
        const customerIdForInvoices = searchParams.get('customerId');
        
        if (!customerIdForInvoices) {
          return NextResponse.json(
            { error: 'Customer ID required' },
            { status: 400 }
          );
        }

        const invoices = await stripe.invoices.list({
          customer: customerIdForInvoices,
          limit: 10,
        });

        return NextResponse.json({
          success: true,
          invoices: invoices.data,
        });

      case 'test-connection':
        // Simple connection test - just verify the API key is valid
        try {
          await stripe.paymentMethods.list({ limit: 1 });
          return NextResponse.json({
            success: true,
            message: 'Stripe connection successful',
          });
        } catch (error) {
          return NextResponse.json(
            { error: 'Stripe connection failed' },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Stripe API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve data' },
      { status: 500 }
    );
  }
}
