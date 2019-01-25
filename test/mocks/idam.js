const sinon = require('sinon');
const idamExpress = require('@hmcts/div-idam-express-middleware');

let onAuthenticate = () => {
  return (req, res, next) => {
    next();
  };
};

let onLanding = () => {
  return (req, res, next) => {
    next();
  };
};

let onProtect = () => {
  return (req, res, next) => {
    next();
  };
};

let onLogout = () => {
  return (req, res, next) => {
    next();
  };
};

const stub = () => {
  sinon.stub(idamExpress, 'authenticate').callsFake(onAuthenticate);
  sinon.stub(idamExpress, 'landingPage').callsFake(onLanding);
  sinon.stub(idamExpress, 'protect').callsFake(onProtect);
  sinon.stub(idamExpress, 'logout').callsFake(onLogout);
};

const restore = () => {
  idamExpress.authenticate.restore();
  idamExpress.landingPage.restore();
  idamExpress.protect.restore();
  idamExpress.logout.restore();
};

module.exports = { onAuthenticate, onLanding, onProtect, onLogout, stub, restore };