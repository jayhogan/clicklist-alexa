'use strict';
var winston = require('winston');

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output
        },
        card: {
            type: 'Simple',
            title: `SessionSpeechlet - ${title}`,
            content: `SessionSpeechlet - ${output}`
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText
            },
        },
        shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse
    };
}

function loggingMetadata(filename, method) {
    return {
        module: 'clicklist-alexa',
        filename: filename,
        method: method,
        ts: new Date()
    };
}

function logEnd(method) {
    return function(resp) {
        debug('end', method);
        return resp;
    }
}

function logAndThrow(method) {
    return function(err) {
        error(err, method, {err: err});
        throw err;
    }
}

exports.buildSpeechletResponse = buildSpeechletResponse;
exports.buildResponse = buildResponse;
exports.loggingMetadata = loggingMetadata;