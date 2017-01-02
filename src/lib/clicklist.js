'use strict';
require('dotenv').config();

var winston = require('winston');
var utils = require('./utils');
var client = require('clicklist-client');
var Fuse = require('fuse.js');

function logError(metadata) {
    return (err) => {
        winston.error(err, [metadata, {err: err}]);
        throw err;
    }
}

function cartSummary()  {
    let metadata = utils.loggingMetadata('lib/clicklist', 'cartSummary');
    return client.login(process.env.USER_NAME, process.env.PASSWORD)
        .then(() => client.cart())
        .then(cart => {
            winston.debug('cart', [metadata, {cart: cart}]);
            client.logout();
            return {
                itemCount: cart.cartItems.length,
                total: cart.total
            };
        })
        .catch(logError(metadata));
}

function findItemInCart(item) {
    let metadata = utils.loggingMetadata('lib/clicklist', 'findItemInCart');
    return client.login(process.env.USER_NAME, process.env.PASSWORD)
        .then(() => client.cart())
        .then(cart => {
            winston.debug('cart', [metadata, {cart: cart}]);
            client.logout();
            let found = search(item, cart.cartItems);
            winston.debug('search', [metadata, {item: found}]);
            if (found) {
                return {
                    name: found.name,
                    qty: found.quantity
                };
            }
            return;
        })
        .catch(logError(metadata));
}

function addToCart(item, qty) {
    let metadata = utils.loggingMetadata('lib/clicklist', 'addToCart');
    let favorites = [];
    return client.login(process.env.USER_NAME, process.env.PASSWORD)
        .then(() => client.favorites())
        .then(resp => favorites = resp)
        .then(() => client.recentPurchases())
        .then(recent => {
            let found = search(item, favorites.concat(recent));
            winston.debug('adding item to cart', [metadata, {item: found, favorites: favorites, recent: recent}]);
            return found ? client.addToCart(found, qty) : {};
        })
        .then(resp => {
            let success = !!resp.item;
            let result = {
                success: success,
                itemNotFound: !success,
                name: success ? resp.item.name : null,
                qty: resp.quantity
            };
            winston.debug('result', [metadata, {result: result}]);
            return result;
        })
        .catch(logError(metadata));
}

function search(criteria, items) {
    let metadata = utils.loggingMetadata('lib/clicklist', 'search');
    var options = {
        shouldSort: true,
        threshold: 0.2,
        location: 0,
        distance: 1000,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
            "name"
        ]
    };
    var fuse = new Fuse(items, options);
    var results = fuse.search(criteria);
    winston.debug('search', [metadata, {results: results}]);
    return results.length > 0 ? results[0] : null;
}

exports.cartSummary = cartSummary;
exports.findItemInCart = findItemInCart;
exports.addToCart = addToCart;