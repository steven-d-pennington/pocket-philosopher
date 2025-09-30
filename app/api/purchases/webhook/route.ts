import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get("stripe-signature");

    if (!sig) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.user_id;
        const productId = session.metadata?.product_id;

        if (!userId || !productId) {
          console.error("Missing user_id or product_id in session metadata");
          return NextResponse.json({ received: true });
        }

        // Check if purchase already exists
        const { data: existingPurchase } = await supabase
          .from("purchases")
          .select("id")
          .eq("stripe_session_id", session.id)
          .single();

        if (existingPurchase) {
          console.log("Purchase already processed:", session.id);
          return NextResponse.json({ received: true });
        }

        // Get product details
        const { data: product } = await supabase
          .from("products")
          .select("price_cents, currency")
          .eq("id", productId)
          .single();

        if (!product) {
          console.error("Product not found:", productId);
          return NextResponse.json({ received: true });
        }

        // Create purchase record
        const { data: purchase, error: purchaseError } = await supabase
          .from("purchases")
          .insert({
            user_id: userId,
            product_id: productId,
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
            amount_cents: product.price_cents,
            currency: product.currency,
            status: "completed",
          })
          .select()
          .single();

        if (purchaseError) {
          console.error("Error creating purchase:", purchaseError);
          return NextResponse.json({ received: true });
        }

        // Create entitlement
        const { error: entitlementError } = await supabase
          .from("entitlements")
          .insert({
            user_id: userId,
            product_id: productId,
            purchase_id: purchase.id,
            entitlement_type: "coach_access",
            is_active: true,
          });

        if (entitlementError) {
          console.error("Error creating entitlement:", entitlementError);
          // Don't return error here as purchase was successful
        }

        console.log("Purchase processed successfully:", {
          userId,
          productId,
          sessionId: session.id,
        });
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session expired:", session.id);
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}