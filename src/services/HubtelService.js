import { env } from '../config/env.js';

/**
 * Hubtel Service
 * Handles interactions with Hubtel Online Checkout API
 */
export const HubtelService = {
  /**
   * Helper to get Authorization header (Basic client_id:client_secret)
   */
  getAuthHeader() {
    const clientId = env.HUBTEL_CLIENT_ID;
    const clientSecret = env.HUBTEL_CLIENT_SECRET;
    const credentials = `${clientId}:${clientSecret}`;
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
  },

  /**
   * Initiate a Hubtel Checkout transaction
   */
  async initiatePayment(params) {
    const {
      totalAmount,
      description,
      clientReference,
      payeeName,
      payeeMobileNumber,
      payeeEmail,
      returnUrl,
      cancellationUrl,
    } = params;

    if (!env.HUBTEL_CLIENT_ID || !env.HUBTEL_CLIENT_SECRET || !env.HUBTEL_MERCHANT_ACCOUNT_NUMBER) {
      throw new Error('Payment API credentials are not configured in environment variables.');
    }

    // Convert USD to GHS since Hubtel processes in GHS (cuz payment provider uses ghs)
    const USD_TO_GHS_RATE = 15.5;
    const amountInGHS = totalAmount * USD_TO_GHS_RATE;
    console.log(
      `[HubtelService] Converting USD totalAmount ${totalAmount} to GHS at rate ${USD_TO_GHS_RATE}: ${amountInGHS}`
    );

    const payload = {
      totalAmount: parseFloat(amountInGHS.toFixed(2)),
      description,
      callbackUrl: env.HUBTEL_CALLBACK_URL,
      returnUrl: `${returnUrl || env.HUBTEL_RETURN_URL || `${env.FRONTEND_URL}/checkout`}?reference=${clientReference}`,
      cancellationUrl:
        cancellationUrl ||
        env.HUBTEL_CANCELLATION_URL ||
        `${env.FRONTEND_URL}/checkout?status=cancelled`,
      merchantAccountNumber: env.HUBTEL_MERCHANT_ACCOUNT_NUMBER,
      clientReference,
      payeeName: payeeName || undefined,
      payeeMobileNumber: payeeMobileNumber || undefined,
      payeeEmail: payeeEmail || undefined,
    };

    try {
      const response = await fetch('https://payproxyapi.hubtel.com/items/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.getAuthHeader(),
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Hubtel initiate failed with status ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Hubtel Initiate Payment API Error:', error);
      throw error;
    }
  },

  /**
   * Check status of a transaction from Hubtel API
   */
  async checkTransactionStatus(clientReference) {
    if (!env.HUBTEL_CLIENT_ID || !env.HUBTEL_CLIENT_SECRET || !env.HUBTEL_MERCHANT_ACCOUNT_NUMBER) {
      if (env.NODE_ENV !== 'production') {
        console.warn(
          '⚠️ Hubtel credentials not configured. Returning mock status: Paid for development.'
        );
        return {
          message: 'Successful',
          responseCode: '0000',
          data: {
            date: new Date().toISOString(),
            status: 'Paid',
            transactionId: `MOCK_TXN_${Date.now()}`,
            externalTransactionId: '000000000000',
            paymentMethod: 'mobilemoney',
            clientReference,
            currencyCode: 'GHS',
            amount: 0.1,
            charges: 0.02,
            amountAfterCharges: 0.08,
            isFulfilled: true,
          },
        };
      }
      throw new Error('Hubtel API credentials are not configured in environment variables.');
    }

    const merchantAccountNumber = env.HUBTEL_MERCHANT_ACCOUNT_NUMBER;
    const url = `https://api-txnstatus.hubtel.com/transactions/${merchantAccountNumber}/status?clientReference=${encodeURIComponent(clientReference)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: this.getAuthHeader(),
          Accept: 'application/json',
        },
      });

      // Read raw text first to handle non-JSON responses (HTML error pages, etc.)
      const rawText = await response.text();
      let result;

      try {
        result = JSON.parse(rawText);
      } catch {
        // Hubtel returned non-JSON (HTML error page, etc.)
        console.warn(
          `Hubtel status API returned non-JSON (HTTP ${response.status}):`,
          rawText.substring(0, 200)
        );
        return {
          message: 'Transaction not found or not yet processed',
          responseCode: 'PENDING',
          data: {
            status: 'Unpaid',
            clientReference,
          },
        };
      }

      if (!response.ok) {
        console.warn(`Hubtel status check returned HTTP ${response.status}:`, result);
        return {
          message: result.message || `Status check returned HTTP ${response.status}`,
          responseCode: result.responseCode || 'ERROR',
          data: {
            status: 'Unpaid',
            clientReference,
          },
        };
      }

      return result;
    } catch (error) {
      console.error('Hubtel Check Status API Error:', error);
      // Return a structured error instead of throwing during polling
      return {
        message: error.message || 'Network error during status check',
        responseCode: 'ERROR',
        data: {
          status: 'Unpaid',
          clientReference,
        },
      };
    }
  },
};

export default HubtelService;
