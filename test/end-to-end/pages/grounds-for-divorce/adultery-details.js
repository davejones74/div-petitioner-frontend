const { mockSession } = require('test/fixtures');
const config = require('config');

function enterAdulteryDetails() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/adultery/details');
  I.fillField('reasonForDivorceAdulteryDetails', mockSession.reasonForDivorceAdulteryDetails);
  I.navByClick('Continue');
  if (config.features.release520) {
    I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/adultery/second-hand-information');
  } else {
    I.seeCurrentUrlEquals('/about-divorce/legal-proceedings');
  }
}

module.exports = { enterAdulteryDetails };
