"use strict";
var layouts = require('../layouts');
var redis = require('redis');
var _ = require('underscore');

function redisAppender (layout, config) {
    layout = layout || layouts.colouredLayout;
    return function(loggingEvent) {
        var logObject = {}
        _.extend(logObject, config.baseLogFields)
        logObject.level = loggingEvent.level.levelStr
        if (loggingEvent.data.length > 0) {
            var client = redis.createClient(config.redisPort, config.redisHost).on('error', console.log);
            var data = loggingEvent.data[0]
            if (typeof data == "string") {
                logObject.message = data
            }
            else if(typeof data == "object") {
                _.extend(logObject, data)
            }

            client.rpush(config.listName, JSON.stringify(logObject));
            client.quit();
        }
    };
}

function configure(config) {
    var layout;
    if (config.layout) {
        layout = layouts.layout(config.layout.type, config.layout);
    }
    return redisAppender(layout, config);
}

exports.name = "redis";
exports.appender = redisAppender;
exports.configure = configure;
