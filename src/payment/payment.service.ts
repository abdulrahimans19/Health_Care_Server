import { Injectable, Logger } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private client: paypal.core.PayPalHttpClient;
  private readonly logger = new Logger(PaymentService.name);

  constructor() {
    const environment = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_SECRET,
      process.env.PAYPAL_CLIENT_ID,
    );
    this.client = new paypal.core.PayPalHttpClient(environment);
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  async createPaypalOrder(amount: number): Promise<string> {
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount.toString(),
          },
        },
      ],
    });

    try {
      const response = await this.client.execute(request);
      return response.result.id;
    } catch (error) {
      console.log(error);
      throw new Error(`PayPal error: ${error.message}`);
    }
  }

  async validatePaypalPayment(orderId: string): Promise<boolean> {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
      const response = await this.client.execute(request);
      if (response.statusCode === 201) {
        this.logger.log(`Payment for order ${orderId} validated successfully.`);
        return true;
      }
    } catch (error) {
      this.logger.error(
        `Payment validation failed for order ${orderId}: ${error.message}`,
      );
    }

    return false;
  }

  logPaymentStatus(orderId: string, amount: number, status: string): void {
    this.logger.log(
      `Payment Status - Order ID: ${orderId}, Amount: $${amount}, Status: ${status}`,
    );
  }

  async createStripeOrder(email: string, amount: number, currency: string) {
    let customer: any;
    const existingCustomers = await this.stripe.customers.list({
      email: email,
      limit: 1,
    });
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await this.stripe.customers.create({
        email: email,
      });
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency: currency,
      customer: customer.id,
      payment_method_types: ['card'],
    });
    return paymentIntent.client_secret;
  }

  async validateStripeOrder(paymentIntentId: string): Promise<boolean> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      paymentIntentId,
    );
    const isValid = paymentIntent.status === 'succeeded';

    return isValid;
  }
}
