const logger = require('app/services/logger').logger(__filename);
const serviceTokenService = require('app/services/serviceToken');
const paymentService = require('app/services/payment');
const submissionService = require('app/services/submission');

const checkAndUpdatePaymentStatus = function(res, user, authToken, session) { // eslint-disable-line
  // Initialise services.
  const serviceToken = serviceTokenService.setup();
  const payment = paymentService.setup();
  const submission = submissionService.setup();

  // Get service token.
  return serviceToken.getToken()
  // Query payment status.
    .then(token => {
      return payment.query(user, token, session.currentPaymentReference,
        session.mockedPaymentOutcome);
    })

    // Store status in session then update CCD with payment status.
    .then(response => {
      logger.info({
        message: 'Payment status query response:',
        response
      });
      const paymentId = session.currentPaymentId;
      session.payments = session.payments || {};
      session.payments[paymentId] = Object.assign({},
        session.payments[paymentId], response);

      const paymentSuccess = paymentService.isPaymentSuccessful(response);

      if (paymentSuccess) {
        const eventData = submissionService
          .generatePaymentEventData(session, response);

        return submission.update(authToken, session.caseId, eventData, 'paymentMade');
      }

      return new Promise(resolve => {
        resolve(true);
      });
    });
};

module.exports = { checkAndUpdatePaymentStatus };