/*
 * hungry
 * user/repo
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
            // TODO: handle any request errors
            console.log("Request error: %s", error);
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
            // TODO: handle any feedparser errors
            console.log("Feedparser error: %s", error);
        });

        feedparser.on('readable', function()
        {
            // This is where the action is!
            var stream = this;
            // var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
            var item;

            while (item = stream.read())
            {
                var simpleItem = simplify(item);

                if (simpleItem)
                {
                    contents.push(simpleItem);
                }

                console.log("Pushing item #%d", count);

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
                console.log("Resulting contents: %s", JSON.stringify(contents));
                
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
