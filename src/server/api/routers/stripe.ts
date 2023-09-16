import { publicProcedure, createTRPCRouter } from "../trpc";
import {z} from "zod";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-08-16",
});

export const stripeRouter = createTRPCRouter({
    stripeCheckout: publicProcedure
    .input(z.object({
        priceId: z.string(),
    })).mutation(async ({ input }) => {

      
        const price = await stripe.prices.retrieve(input.priceId)

        const session = await stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            customer: "{insert id here}",
            line_items: [
                {
                    price: price.id,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `http://192.168.1.231:3000/?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://192.168.1.231:3000/?cancel=true`,
        });

        return session.url
    }),
    stripeManageSubscribtion: publicProcedure
    .mutation(async ({ ctx }) => {


        const subscription = await stripe.checkout.sessions.retrieve("{insert checkout session ID here}")

        const session = await stripe.billingPortal.sessions.create({
            customer: subscription.customer as string,
            return_url: `http://192.168.1.231:3000`,
        });

        return session.url
    }
    ),

})