'use strict';
require('dotenv').config();

var client = require('clicklist-client');
var Fuse = require('fuse.js');

function cartSummary() {
    return client.login(process.env.USER_NAME, process.env.PASSWORD)
        .then(() => client.cart())
        .then(cart => {
            client.logout();
            return {
                itemCount: cart.cartItems.length,
                total: cart.total
            };
        });
}

function findItemInCart(item) {
    return client.login(process.env.USER_NAME, process.env.PASSWORD)
        .then(() => client.cart())
        .then(cart => {
            client.logout();
            var found = search(item, cart.cartItems);
            if (found) {
                return {
                    name: found.name,
                    qty: found.quantity
                };
            }
            return;
        });
}

function addToCart(item, qty) {
    let favorites = [];
    return client.login(process.env.USER_NAME, process.env.PASSWORD)
        .then(() => client.favorites())
        .then(resp => favorites = resp)
        .then(() => client.recentPurchases())
        .then(recent => {
            let found = search(item, favorites.concat(recent));
            return found ? client.addToCart(found, qty) : {};
        })
        .then(resp => {
            let success = !!resp.item;
            return {
                success: success,
                itemNotFound: !success,
                name: success ? resp.item.name : null,
                qty: resp.quantity
            }
        });
}

function search(criteria, items) {
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
    var fuse = new Fuse(items, options); // "list" is the item array
    var results = fuse.search(criteria);
    return results.length > 0 ? results[0] : null;
}

exports.cartSummary = cartSummary;
exports.findItemInCart = findItemInCart;
exports.addToCart = addToCart;