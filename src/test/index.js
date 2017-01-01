require('dotenv').config();

var should = require('chai').should(),
    alexa = require('../lib/alexa'),
    auth = {email: process.env.USER_NAME, pwd: process.env.PASSWORD };

//require('request-debug')(require('request-promise'));
describe('# onIntent', function() {
    this.timeout(5000);
    it('CartSummaryIntent', function(done) {
        let session = { sessionId: 'sessionId' };
        let req = {
            requestId: 'test',
            intent: {
                name: 'CartSummaryIntent'
            }
        };

        alexa.onIntent(req, session, (attrs, speechletResponse) => {
            console.log(speechletResponse);
            done();
        });
    });

    it('CartItemIntent', function(done) {
        let session = { sessionId: 'sessionId' };
        let req = {
            requestId: 'test',
            intent: {
                name: 'CartItemIntent',
                slots: {
                    Item: {
                        value: 'oranges'
                    }
                }
            }
        };

        alexa.onIntent(req, session, (attrs, speechletResponse) => {
            console.log(speechletResponse);
            done();
        });
    });

    it('AddItemIntent', function(done) {
        let session = { sessionId: 'sessionId' };
        let req = {
            requestId: 'test',
            intent: {
                name: 'AddItemIntent',
                slots: {
                    Item: {
                        value: 'cheese sticks'
                    },
                    Qty: {
                        value: 2
                    }
                }
            }
        };

        alexa.onIntent(req, session, (attrs, speechletResponse) => {
            console.log(speechletResponse);
            done();
        });
    });
});