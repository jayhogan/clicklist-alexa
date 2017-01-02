'use strict';
var winston = require('winston');
var _ = require('lodash');

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

function speekDollars(amount) {
    let amountStr = _.toString(amount);
    let tokens = amountStr.split('.');
    let response = tokens[0] + ' dollars';
    if (tokens.length > 1 && parseInt(tokens[1]) > 0) {
        response += ` and ${tokens[1]} cents`;
    }
    return response;
}

exports.buildSpeechletResponse = buildSpeechletResponse;
exports.buildResponse = buildResponse;
exports.loggingMetadata = loggingMetadata;
exports.speekDollars = speekDollars;