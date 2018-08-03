const { expect, sinon } = require('test/util/chai');
const config = require('config');

const modulePath = 'app/middleware/submissionMiddleware';
const underTest = require(modulePath);
const serviceToken = require('app/services/serviceToken');
const payment = require('app/services/payment');
const submission = require('app/services/submission');

let req = {};
let res = {};
let next = {};
let ctx = {};

const currentDeploymentEnv = config.deployment_env;

describe(modulePath, () => {
  describe('#hasSubmitted', () => {
    beforeEach(() => {
      ctx = { };
      req = { session: {} };
      res = { redirect: sinon.stub() };
      next = sinon.stub();
    });
    afterEach(() => {
      config.deployment_env = currentDeploymentEnv;
    });
    it('calls next if application has not been submitted', () => {
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.called).to.eql(false);
      expect(next.calledOnce).to.eql(true);
    });
    it('next is not called if env is prod', () => {
      req.session.caseId = 'someid';
      req.session.state = 'AwaitingPayment';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(next.calledOnce).to.eql(false);
    });
    it('next is called if env is not prod', () => {
      req.session.caseId = 'someid';
      req.session.state = 'AwaitingPayment';
      config.deployment_env = 'no prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(next.calledOnce).to.eql(true);
    });
    it('calls next if step has property enabledAfterSubmission', () => {
      ctx.enabledAfterSubmission = true;
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.called).to.eql(false);
      expect(next.calledOnce).to.eql(true);
    });
    it('next is called if session.caseId does not exist', () => {
      req.session.state = 'AwaitingPayment';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(next.calledOnce).to.eql(true);
    });
    it('next is called if session.state does not exist', () => {
      req.session.caseId = 'someid';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(next.calledOnce).to.eql(true);
    });
    it('redirects to /application-submitted if application has been submitted and is in "AwaitingPayment"', () => {
      req.session.caseId = 'someid';
      req.session.state = 'AwaitingPayment';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.calledOnce).to.eql(true);
      expect(res.redirect.calledWith('/application-submitted')).to.eql(true);
    });
    it('redirects to /application-submitted-awaiting-response if application has been submitted and is not "AwaitingPayment" or "Rejected"', () => {
      req.session.caseId = 'someid';
      req.session.state = 'randomstate';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.calledOnce).to.eql(true);
      expect(res.redirect.calledWith('/application-submitted-awaiting-response')).to.eql(true);
    });
    it('calls next if application has been submitted and is "Rejected"', () => {
      req.session.caseId = 'someid';
      req.session.state = 'Rejected';
      config.deployment_env = 'prod';
      underTest.hasSubmitted.apply(ctx, [req, res, next]);
      expect(res.redirect.called).to.eql(false);
      expect(next.calledOnce).to.eql(true);
    });
  });

  describe('#paymentAwaiting', () => {
    let getToken = null;
    let query = null;
    let update = null;
    beforeEach(() => {
      getToken = sinon.stub().resolves('token');
      sinon.stub(serviceToken, 'setup').returns({ getToken });
      ctx = { };
      req = { session: {} };
      res = { redirect: sinon.stub() };
      next = sinon.stub();
    });

    afterEach(() => {
      config.deployment_env = currentDeploymentEnv;
      submission.setup.restore();
      payment.setup.restore();
      serviceToken.setup.restore();
    });

    context('Payment is successfull', () => {
      beforeEach(() => {
        query = sinon.stub().resolves({
          id: '1',
          amount: 55000,
          status: 'Success',
          reference: 'some-reference',
          external_reference: 'a65-f836-4f61-a628-727199ef6c20',
          date_created: 1505459675824,
          _links: {}
        });
        update = sinon.stub().resolves({
          caseId: '1509031793780148',
          error: null,
          status: 'success'
        });
        sinon.stub(submission, 'setup').returns({ update });
        sinon.stub(payment, 'setup').returns({ query });
      });

      it('Check payment status, if application is in "AwaitingPayment", payment successfull then update ccd to awaiting response', async () => {
        req.session.caseId = 'someid';
        req.session.state = 'AwaitingPayment';
        req.session.currentPaymentReference = 'somepaymentid';
        config.deployment_env = 'prod';
        await underTest.hasSubmitted(req, res, next);
        expect(getToken.calledOnce).to.equal(true);
        expect(query.calledOnce).to.equal(true);
        expect(update.calledOnce).to.equal(true);
        expect(res.redirect.calledWith('/application-submitted-awaiting-response')).to.eql(true);
      });
    });

    context('Payment is not successfull', () => {
      beforeEach(() => {
        query = sinon.stub().resolves({
          id: '1',
          amount: 55000,
          status: 'Failed',
          reference: 'some-reference',
          external_reference: 'a65-f836-4f61-a628-727199ef6c20',
          date_created: 1505459675824,
          _links: {}
        });
        update = sinon.stub().resolves({
          caseId: '1509031793780148',
          error: null,
          status: 'success'
        });
        sinon.stub(submission, 'setup').returns({ update });
        sinon.stub(payment, 'setup').returns({ query });
      });

      it('Check payment status, if application is in "AwaitingPayment" but payment has failed then do nothing"', async () => {
        req.session.caseId = 'someid';
        req.session.state = 'AwaitingPayment';
        req.session.currentPaymentReference = 'somepaymentid';
        config.deployment_env = 'prod';
        await underTest.hasSubmitted.apply(ctx, [req, res, next]);
        expect(getToken.calledOnce).to.equal(true);
        expect(query.calledOnce).to.equal(true);
        expect(update.calledOnce).to.equal(false);
        expect(res.redirect.calledWith('/application-submitted')).to.eql(true);
      });
    });

    context('Update error', () => {
      beforeEach(() => {
        query = sinon.stub().resolves({
          id: '1',
          amount: 55000,
          status: 'Success',
          reference: 'some-reference',
          external_reference: 'a65-f836-4f61-a628-727199ef6c20',
          date_created: 1505459675824,
          _links: {}
        });
        sinon.stub(payment, 'setup').returns({ query });
        update = sinon.stub().resolves({
          caseId: 0,
          error: 'some error with a wrapped java exception',
          status: 'error'
        });
        sinon.stub(submission, 'setup').returns({ update });
      });

      it('submission update was not successful\'"', async () => {
        req.session.caseId = 'someid';
        req.session.state = 'AwaitingPayment';
        req.session.currentPaymentReference = 'somepaymentid';
        config.deployment_env = 'prod';
        await underTest.hasSubmitted.apply(ctx, [req, res, next]);
        expect(res.redirect.calledWith('/generic-error')).to.eql(true);
      });
    });
  });
});
