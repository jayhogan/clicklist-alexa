'use strict';

var winston = require('winston');
var utils = require('./utils');
var clicklist = require('./clicklist');

// --------------- Functions that control the skill's behavior -----------------------
function logError(metadata) {
    return function(err) {
        winston.error(err, [metadata, {err: err}]);
        throw err;
    }
}

function cartSummary(intent, session) {
    let metadata = utils.loggingMetadata('lib/alexa.js', 'cartSummary');
    let speechOutput = '';

    return clicklist.cartSummary().then(summary => {
        if (summary.itemCount > 0) {
            speechOutput = `You have ${summary.itemCount} item${summary.itemCount === 1 ? "" : "s"} in your cart for a total of ${summary.total} dollars.`;
        } else {
            speechOutput = "Your cart is empty";
        }
        return utils.buildSpeechletResponse(intent.name, speechOutput, null, false);
    })
    .catch(logError(metadata));
}

function itemInCart(intent, session) {
    const itemSlot = intent.slots.Item;
    let metadata = utils.loggingMetadata('lib/alexa.js', 'itemInCart');
    let repromptText = '';
    let speechOutput = '';

    if (itemSlot) {
        const item = itemSlot.value;
        return clicklist.findItemInCart(item).then(cartItem => {
            if (cartItem) {
                speechOutput = `There are ${cartItem.qty} ${cartItem.name} in your cart.`;
            } else {
                speechOutput = `I did not see ${item} in your cart.`;
            }
            return utils.buildSpeechletResponse(intent.name, speechOutput, repromptText, false);
        })
        .catch(logError(metadata));
    } else {
        speechOutput = "I'm not sure what item you are asking about. Please try again.";
        repromptText = "I'm not sure what item you are asking about. You can ask if an " +
            'item is in your cart by saying, is bacon in my cart.';

        return utils.buildSpeechletResponse(intent.name, speechOutput, repromptText, false);
    }
}

function addToCart(intent, session) {
    const itemSlot = intent.slots.Item;
    const qtySlot = intent.slots.Qty;
    let metadata = utils.loggingMetadata('lib/alexa.js', 'itemInCart');
    let speechOutput = '';

    if (itemSlot) {
        let qty = qtySlot && qtySlot.value ? qtySlot.value : 1;

        const item = itemSlot.value;
        return clicklist.addToCart(item, qty).then(status => {
            if (status.success) {
                speechOutput = `Done. There are ${status.qty} ${status.name} in your cart.`;
            } else if (status.itemNotFound) {
                speechOutput = `I could not find ${item} in your favorites or recent orders. Sorry.`;
            } else {
                speechOutput = `I could not add ${item}. Something unexpected happened. Tell Jay to fix me.`;
            }

            return utils.buildSpeechletResponse(intent.name, speechOutput, null, false);
        })
        .catch(logError(metadata));
    } else {
        speechOutput = "I'm not sure what item you wish to add. Please try again.";
        let repromptText = "I'm not sure what item you wish to add. You can add an " +
            'item to your cart by saying, add 1 pound of bacon to my cart.';

        return utils.buildSpeechletResponse(intent.name, speechOutput, repromptText, false);
    }
}

function getWelcomeResponse() {
    const repromptText = 'I can summarize, add items to and remove items from your cart.';
    const speechOutput = 'Welcome to Kroger Clicklist. ' + repromptText;

    return utils.buildSpeechletResponse('Welcome', speechOutput, repromptText, false);
}

function handleSessionEndRequest() {
    return utils.buildSpeechletResponse('Session Ended', 'OK, bye.', null, true);
}


// --------------- Events -----------------------

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session) {
    return getWelcomeResponse();
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session) {
    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;
    let promise = null;

    // Dispatch to your skill's intent handlers
    if (intentName === 'CartSummaryIntent') {
        promise = cartSummary(intent, session);
    } else if (intentName === 'CartItemIntent') {
        promise = itemInCart(intent, session);
    } else if (intentName === 'AddItemIntent') {
        promise = addToCart(intent, session);
    } else if (intentName === 'AMAZON.HelpIntent') {
        promise = Promise.resolve(getWelcomeResponse());
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        promise = Promise.resolve(handleSessionEndRequest());
    } else {
        throw new Error('Invalid intent');
    }

    return promise;
}

exports.onSessionStarted = (request, session) => {};
exports.onSessionEnded = (request, session) => {};
exports.onLaunch = onLaunch;
exports.onIntent = onIntent;