'use strict';
var winston = require('winston');
winston.level = process.env.LOG_LEVEL || 'info';

var utils = require('./lib/utils');
var alexa = require('./lib/alexa');

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    let metadata = {logTrace: utils.loggingMetadata('index.js', 'handler')};

    try {
        winston.info('event start', [metadata, {event: event}]);

        if (event.session.application.applicationId !== 'amzn1.ask.skill.0c002494-7641-4438-bfb6-425b158b7a28') {
            winston.error('Invalid Alexa application ID', [metadata, {appId: event.session.application.applicationId}]);

            callback('Invalid Application ID');
        }

        if (event.session.new) {
            winston.debug('starting a new session', [metadata, {session: event.session}]);

            alexa.onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            winston.debug('launch request', metadata);

            let response = utils.buildResponse({}, alexa.onLaunch(event.request, event.session));

            winston.info('launch request response', [metadata, response]);

            callback(null, response);
        } else if (event.request.type === 'IntentRequest') {
            winston.debug('intent request', metadata);

            alexa.onIntent(event.request, event.session)
                .then(speechletResponse => {
                    let response = utils.buildResponse({}, speechletResponse);

                    winston.info('intent request response', [metadata, response]);

                    callback(null, response);
                })
                .catch(err => {
                    winston.error(err, [metadata, {err: err}]);
                    callback(err);
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            winston.debug('session end request', [metadata, {session: event.session}]);

            alexa.onSessionEnded(event.request, event.session);

            callback();
        }
    } catch (err) {
        winston.error(err, [metadata, {err: err}]);

        callback(err);
    }
};