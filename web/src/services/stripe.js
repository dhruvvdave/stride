import { loadStripe } from '@stripe/stripe-js';
import api from './api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const createCheckoutSession = async (priceId) => {
  const response = await api.post('/api/stripe/create-checkout-session', {
    priceId,
  });
  return response.data;
};

export const redirectToCheckout = async (priceId) => {
  const stripe = await stripePromise;
  const { sessionId } = await createCheckoutSession(priceId);
  
  const { error } = await stripe.redirectToCheckout({
    sessionId,
  });

  if (error) {
    throw error;
  }
};

export const createPortalSession = async () => {
  const response = await api.post('/api/stripe/create-portal-session');
  return response.data;
};

export const redirectToPortal = async () => {
  const { url } = await createPortalSession();
  window.location.href = url;
};

export const getSubscriptionStatus = async () => {
  const response = await api.get('/api/stripe/subscription-status');
  return response.data;
};
