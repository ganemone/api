var assert = require('assert');
var db = require('../../../server/util/db.js');
var ThoughtsCollection = require('../../../server/collections/thoughts.js');
var setUpThoughts = require('../../util/setUpThoughts.js');

describe('A thoughts collection', function () {

  var mockUser = {
    username: 'username',
    friends: [
      'firstdegree1',
      'firstdegree2',
      'firstdegree3'
    ],
    secondDegreeFriends: [
      'seconddegree1',
      'seconddegree2'
    ]
  };

  var thoughtsCollection = new ThoughtsCollection(mockUser);
  var thoughtsCollectionSince = new ThoughtsCollection(mockUser, '100');

  describe('without a since string', function () {

    it('should generate a valid friends query', function (done) {
      var query = thoughtsCollection.getFirstDegreeQuery();
      testQuery(query, done);
    });

    it('should generate a valid global query', function (done) {
      var query = thoughtsCollection.getSecondDegreeQuery();
      testQuery(query, done);
    });

    it('should generate a valid my thoughts query', function (done) {
      var query = thoughtsCollection.getGlobalQuery();
      testQuery(query, done);
    });
  });


  describe('with a since string', function () {

    it('should generate a valid friends query', function (done) {
      var query = thoughtsCollectionSince.getFirstDegreeQuery();
      testQuery(query, done);
    });

    it('should generate a valid global query', function (done) {
      var query = thoughtsCollectionSince.getSecondDegreeQuery();
      testQuery(query, done);
    });

    it('should generate a valid my thoughts query', function (done) {
      var query = thoughtsCollectionSince.getGlobalQuery();
      testQuery(query, done);
    });
  });

  describe('when there are no posts', function () {
    it('should get correct data for friends feeds', function (done) {
      thoughtsCollection.getFirstDegreeFeed(testFeed(0, done));
    });

    it('should get the correct data for second degree friends feeds', function (done) {
      thoughtsCollection.getSecondDegreeFeed(testFeed(0, done));
    });

    it('should get the correct data for global feed', function (done) {
      thoughtsCollection.getGlobalFeed(testFeed(0, done));
    });

    it('should load ALL thoughts correctly', function (done) {
      thoughtsCollection.getThoughtsFeed(testFeed(0, done));
    });
  });

  describe('when a user/friends have no posts', function () {

    setUpThoughts('seconddegree1');
    setUpThoughts('someguy');

    it('should not load second degree or global thoughts', function (done) {
      thoughtsCollection.getFirstDegreeFeed(testFeed(0, done));
    });

    it('should load ALL thoughts correctly', function (done) {
      thoughtsCollection.getThoughtsFeed(testFeed(2, done));
    });
  });

  describe('when a user/friends do have posts', function () {

    setUpThoughts('username');
    setUpThoughts('firstdegree1');
    setUpThoughts('firstdegree2');
    setUpThoughts('seconddegree1');
    setUpThoughts('someguy');
    setUpThoughts('firstdegree3');


    it('should get correct data for friends feeds', function (done) {
      thoughtsCollection.getFirstDegreeFeed(testFeed(3, done));
    });

    it('should get the correct data for second degree friends feeds', function (done) {
      thoughtsCollection.getSecondDegreeFeed(testFeed(1, done));
    });

    it('should get the correct data for global feed', function (done) {
      thoughtsCollection.getGlobalFeed(testFeed(1, done));
    });

    it('should load ALL thoughts correctly', function (done) {
      thoughtsCollection.getThoughtsFeed(testFeed(6, done));
    });
  });

  describe('when a users second degree friends have posts', function () {

    setUpThoughts('seconddegree1');
    setUpThoughts('seconddegree2');
    setUpThoughts('someguy');

    it('should load friends feed correctly', function (done) {
      thoughtsCollection.getFirstDegreeFeed(testFeed(0, done));
    });

    it('should load second degree friends feed correctly', function (done) {
      thoughtsCollection.getSecondDegreeFeed(testFeed(2, done));
    });

    it('should load global feed correctly', function (done) {
      thoughtsCollection.getGlobalFeed(testFeed(1, done));
    });

    it('should load ALL thoughts correctly', function (done) {
      thoughtsCollection.getThoughtsFeed(testFeed(3, done));
    });
  });

  describe('when there are only global posts', function () {

    setUpThoughts('someguy');
    setUpThoughts('someotherguy');

    it('should load friends feed correctly', function (done) {
      thoughtsCollection.getFirstDegreeFeed(testFeed(0, done));
    });

    it('should load second degree friends feed correctly', function (done) {
      thoughtsCollection.getSecondDegreeFeed(testFeed(0, done));
    });

    it('should load global feed correctly', function (done) {
      thoughtsCollection.getGlobalFeed(testFeed(2, done));
    });

    it('should load ALL thoughts correctly', function (done) {
      thoughtsCollection.getThoughtsFeed(testFeed(2, done));
    });
  });

  describe('when a user has < 3 friends', function() {
    var mockLonelyUser = {
      username: 'username',
      friends: [
        'firstdegree1',
        'firstdegree2'
      ],
      secondDegreeFriends: [
        'seconddegree1',
        'seconddegree2'
      ]
    };

    var lonelyCollection = new ThoughtsCollection(mockLonelyUser);

    setUpThoughts('username');
    setUpThoughts('firstdegree1');
    setUpThoughts('firstdegree2');
    setUpThoughts('seconddegree1');
    setUpThoughts('seconddegree2');
    setUpThoughts('thisdude');

    it('should load ALL thoughts correctly', function (done) {
      lonelyCollection.getThoughtsFeed(testFeed(4, done));
    });
  });
});


function testQuery(query, done) {
  db.directQuery(query, function(err, rows) {
    assert.ifError(err, ' Should execute without error');
    assert.ok(rows, 'Result should be ok');
    done();
  });
}

function testFeed(length, done) {
  return function(err, result) {
    assert.ifError(err, ' Should execute without error');
    assert.ok(result, "result should be ok");
    assert.equal(result.length, length);
    if (length > 0) {
      assert.ok(result[0].body, 'should have body attributes');
      assert.ok(result[0].created_timestamp, 'should have created timestamp property'); // jshint ignore: line
      assert.equal(result[0].num_favorites, 0, 'should have num_favorites property'); // jshint ignore: line
      assert.ok(result[0].has_favorited, 'should have has favorited property'); // jshint ignore: line
      assert.ok(result[0].id, 'should have confession_id property'); // jshint ignore: line
    }
    done();
  };
}