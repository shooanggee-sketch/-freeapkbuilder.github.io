// Serverless function (Node.js) for Vercel or Netlify (adjust exports accordingly)
// Vercel: export default async (req, res) => { ... }
// Netlify (AWS Lambda) format differs slightly. Below is Vercel style.

const stripeSecret = process.env.STRIPE_SECRET_KEY; // set in Vercel/Netlify
if(!stripeSecret){
  console.warn("STRIPE_SECRET_KEY not set in env");
}
const stripe = require('stripe')(stripeSecret);

module.exports = async (req, res) => {
  if(req.method !== 'POST'){
    res.status(405).send({error:'Method not allowed'});
    return;
  }
  try {
    const { amount_cents, currency='usd', metadata } = req.body;
    // IMPORTANT: In production, you MUST validate amount & metadata server-side
    // (e.g., recalc expected cost from template + protect against tampering).
    // This demo trusts the client-sent amount (NOT secure).
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'AI generation + platform fee',
              description: metadata?.template ? `Template: ${metadata.template}` : 'AI generation'
            },
            unit_amount: amount_cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.DOMAIN || 'https://your-domain.example'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN || 'https://your-domain.example'}/?canceled=true`
    });
    res.status(200).json({url: session.url});
  } catch(err){
    console.error(err);
    res.status(500).json({error: err.message});
  }
};
