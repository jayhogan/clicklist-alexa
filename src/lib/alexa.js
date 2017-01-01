'use strict';

var utils = require('./utils');
var clicklist = require('./clicklist');

// --------------- Functions that control the skill's behavior -----------------------
function respondWithError(err, intent, callback) {
    return function(err) {
        console.log(`Error handling intent [${intent.name}]: ${err}`);
        let speechOutput = "Uh oh, something bad happened. Tell Jay to fix me.";
        callback({}, utils.buildSpeechletResponse(intent.name, speechOutput, null, false));
    }
}

function cartSummary(intent, session, callback) {
    let speechOutput = '';

    clicklist.cartSummary().then(summary => {
        if (summary.itemCount > 0) {
            speechOutput = `You have ${summary.itemCount} item${summary.itemCount === 1 ? "" : "s"} in your cart for a total of ${summary.total} dollars.`;
        } else {
            speechOutput = "Your cart is empty";
        }
        callback({}, utils.buildSpeechletResponse(intent.name, speechOutput, null, false));
    })
    .catch(err => respondWithError(err, intent, callback));
}

function itemInCart(intent, session, callback) {
    const itemSlot = intent.slots.Item;
    let repromptText = '';
    let speechOutput = '';

    if (itemSlot) {
        const item = itemSlot.value;
        clicklist.findItemInCart(item).then(cartItem => {
            if (cartItem) {
                speechOutput = `There are ${cartItem.qty} ${cartItem.name} in your cart.`;
            } else {
                speechOutput = `I did not see ${item} in your cart.`;
            }
            callback({}, utils.buildSpeechletResponse(intent.name, speechOutput, repromptText, false));
        })
        .catch(err => respondWithError(err, intent, callback));
    } else {
        speechOutput = "I'm not sure what item you are asking about. Please try again.";
        repromptText = "I'm not sure what item you are asking about. You can ask if an " +
            'item is in your cart by saying, is bacon in my cart.';

        callback({}, utils.buildSpeechletResponse(intent.name, speechOutput, repromptText, false));
    }
}

function addToCart(intent, session, callback) {
    const itemSlot = intent.slots.Item;
    const qtySlot = intent.slots.Qty;
    let speechOutput = '';

    if (itemSlot) {
        let qty = qtySlot ? qtySlot.value : 1;

        const item = itemSlot.value;
        clicklist.addToCart(item, qty).then(status => {
            if (status.success) {
                speechOutput = `Done. There are ${status.qty} ${status.name} in your cart.`;
            } else if (status.itemNotFound) {
                speechOutput = `I could not find ${item} in your favorites or recent orders. Sorry.`;
            } else {
                speechOutput = `I could not add ${item}. Something unexpected happened. Tell Jay to fix me.`;
            }

            callback({}, utils.buildSpeechletResponse(intent.name, speechOutput, null, false));
        })
        .catch(err => respondWithError(err, intent, callback));
    } else {
        speechOutput = "I'm not sure what item you wish to add. Please try again.";
        let repromptText = "I'm not sure what item you wish to add. You can add an " +
            'item to your cart by saying, add 1 pound of bacon to my cart.';

        callback({}, utils.buildSpeechletResponse(intent.name, speechOutput, repromptText, false));
    }
}

function getWelcomeResponse(callback) {
    const repromptText = 'I can summarize, add items to and remove items from your cart.';
    const speechOutput = 'Welcome to Kroger Clicklist. ' + repromptText;

    callback({}, utils.buildSpeechletResponse('Welcome', speechOutput, repromptText, false));
}

function handleSessionEndRequest(callback) {
    callback({}, utils.buildSpeechletResponse('Session Ended', 'OK, bye.', null, true));
}


// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if (intentName === 'CartSummaryIntent') {
        cartSummary(intent, session, callback);
    } else if (intentName === 'CartItemIntent') {
        itemInCart(intent, session, callback);
    } else if (intentName === 'AddItemIntent') {
        addToCart(intent, session, callback);
    } else if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else {
        throw new Error('Invalid intent');
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}

exports.onSessionStarted = onSessionStarted;
exports.onLaunch = onLaunch;
exports.onIntent = onIntent;
exports.onSessionEnded = onSessionEnded;