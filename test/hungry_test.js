'use strict';

var Hungry = require('../lib/hungry.js');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.hungry =
{
    setUp: function(done)
    {
        // setup here
        done();
    },
    'no args': function(test)
    {
        test.expect(2);
        
        var hungry = new Hungry("http://alistapart.com/site/rss", true);
        
        hungry.feed(function(err, contents)
        {
            test.equal(Array.isArray(contents), true, 'should be an array');
            test.equal((contents.length > 0), true, 'shouldn\'t be empty');
            
            test.done();
        });
    }
};
