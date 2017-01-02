'use strict';

var utils = require('./lib/utils');
var alexa = require('./lib/alexa');

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        if (event.session.application.applicationId !== 'amzn1.ask.skill.0c002494-7641-4438-bfb6-425b158b7a28') {
             callback('Invalid Application ID');
        }

        if (event.session.new) {
            alexa.onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            alexa.onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, utils.buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            alexa.onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, utils.buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            alexa.onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};