/*
 * hungry
 *
 * Copyright (c) 2014 Nicola Orritos
 * Licensed under the Apache v2 license.
 */

'use strict';


var $ = require('cheerio');


function isFunction(object)
{
    return object instanceof Function;
}

function simplify(item)
{
    var result = null;
    
    if (item && item.description)
    {
        // 1. Load it with cheerio:
        var html = $.load(item.description);
        
        // 2. Clear custom styles:
        html = html("*").removeAttr('style');
        
        
        item.description = html.html();
        result = item;
    }
    
    return result;
}

function Hungry(url, simplify)
{
    this.url = url;
    
    if (simplify)
    {
        this.simplify = (simplify === true || simplify === 'true');
    }
    else
    {
        this.simplify = false;
    }
}

Hungry.prototype.feed = function(feedURL, callback)
{
    if (isFunction(feedURL))
    {
        callback = feedURL;
    }
    else if (feedURL)
    {
        this.url = feedURL;
    }
    
    if (this.url)
    {
        var request = require('request');
        var req = request(this.url);

        var options = {};
        var FeedParser = require('feedparser');
        var feedparser = new FeedParser(options);

        var contents = [];
        var count = 0;

        req.on('error', function (error)
        {
            console.log("Request error: %s", error);
            
            if (callback)
            {
                callback.call(this, error, null);
            }
        });

        req.on('response', function(res)
        {
            var stream = this;

            if (res.statusCode !== 200)
            {
                return this.emit('error', new Error('Bad status code'));
            }

            stream.pipe(feedparser);
        });


        feedparser.on('error', function(error)
        {
            console.log("Feedparser error: %s", error);
            
            if (callback)
            {
                callback.call(this, error, null);
            }
        });

        feedparser.on('readable', function()
        {
            // This is where the action is!
            var stream = this;
            var item;

            while (item = stream.read())
            {
                var simpleItem = simplify(item);

                if (simpleItem)
                {
                    contents.push(simpleItem);
                }

                count++;
            }
        });

        feedparser.on('end', function(err)
        {
            if (err)
            {
                console.log("Feedparser gave an error: %s", err);
            }

            if (callback)
            {
                callback.call(this, null, contents);
            }
        });
    }
    else
    {
        if (callback)
        {
            var err = new Error("No URL provided");
            
            callback.call(this, err, null);
        }
    }
};


module.exports = Hungry;
