'use strict';

import Papi from '../../src';
import * as mock from './mocks';
import nock from 'nock';
import should from 'should';
import * as models from '../../src/models';
import _ from 'lodash';

const api = new Papi();

// api.before((req, res, next) => {
//   console.log("A")
//   res.body = "hello";
//   next();
// });
//
// api.before((req, res, next) => {
//   console.log("B", res.body);
//   next();
// })
//
// api.before((req, res, next) => {
//   console.log("C");
//   next();
// });
//
// api.before((req, res, next, resolve, reject) => {
//   console.log("D")
//   if (req.method == 'DELETE') {
//     reject(new Error("401 Not Found"));
//   } else {
//     next();
//   }
// });
//
// api.after((req, res, next, resolve, reject) => {
//   console.log("F");
//   next();
// });

//Papi.generateMarkdown();

api.auth.set({jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTRmMGRiNzMwOGFmYTEyYjUzNjIwNTg4In0.CvXGDKAJYZkoH3nnEirtlGlwRzErv1ANOJ-dVkUAnjo#_login_post'});

nock(api.options.host)
  .matchHeader('authorization', function() { return `Bearer ${api.auth.session.jwt}`; })

  /** Hub Resource Requests ***************************************************/

  // all
  .get('/hubs').reply(200, mock.hubs)

  // find
  .get(`/hubs/${mock.hubs[0].id}`).reply(200, mock.hubs[0])

  // $resource with prepared params then find()
  .get(`/hubs/${mock.hubs[0].id}`).reply(200, mock.hubs[0])

  // all and limit
  .get('/hubs?limit=3').reply(200, mock.hubs.slice(0, 3))

  // all with query
  .get('/hubs?summaries=true&b=2').reply(200)


  // updating
  .get(`/hubs/${mock.hubs[0].id}`).reply(200, mock.hubs[0])
  .put(`/hubs/${mock.hubs[0].id}`).reply(200, mock.hubs[0])

  // creating
  .post(`/hubs`).reply(200, mock.hubs[0])

  /** App Resource Requests ***************************************************/

  // all
  .get(`/hubs/${mock.hubs[0].id}/apps`).reply(200, mock.apps)

  // find
  .get(`/hubs/${mock.hubs[0].id}/apps/${mock.apps[0].id}`).reply(200, mock.apps[0])

  // $resource with prepared params then all()
  .get(`/hubs/${mock.hubs[0].id}/apps`).reply(200, mock.apps)

  // all from a result model
  .get(`/hubs/${mock.hubs[0].id}`).reply(200, mock.hubs[0])
  .get(`/hubs/${mock.hubs[0].id}/apps`).reply(200, mock.apps)

  // multiple params for find
  .get(`/hubs/${mock.hubs[0].id}/apps/${mock.apps[0].id}`).reply(200, mock.apps[0])

  // current action
  .get(`/hubs/${mock.hubs[0].id}/apps/current`).reply(200, mock.apps[0])


  /** Style Resource Requests *************************************************/

  // all
  .get(`/hubs/${mock.hubs[0].id}/apps/${mock.apps[0].id}/styles`).reply(200, mock.styles)

  // find
  .get(`/hubs/${mock.hubs[0].id}/apps/${mock.apps[0].id}/styles/${mock.styles[0].id}`).reply(200, mock.styles[0])

  // promises resolved in an inline fashion
  .get(`/hubs`).reply(200, mock.hubs)
  .get(`/hubs/${mock.hubs[0].id}/apps`).reply(200, mock.apps)
  .get(`/hubs/${mock.hubs[0].id}/apps/${mock.apps[0].id}/styles`).reply(200, mock.styles)

  /** Stream Assets Requests **************************************************/
  // all
  .get(`/hubs/${mock.hubs[0].id}/stream`).reply(200, mock.assets)

  .get(`/hubs/${mock.hubs[0].id}/stream?slug=some-slug`).times(3).reply(200, mock.assets[0])

  .get(`/hubs/${mock.hubs[0].id}/stream/${mock.assets[0].id}/comments`).reply(200, mock.comments)

  /** Collection **************************************************************/
  .get(`/hubs`).reply(200, mock.hubs)

  .delete(`/hubs/${mock.hubs[0].id}`).reply(200, mock.hubs[0])

  .post(`/hubs`).reply(200, { name: 'Hello', id: 1234 })

  .get(`/invites/incoming`).times(2).reply(200, mock.invites)

  .post(`/invites/${mock.invites[0].id}/accept`).reply(200)


  /** Organization Resource Requests ***************************************************/

  // all
  .get('/organizations').reply(200, mock.organizations)

  // find
  .get(`/organizations/${mock.organizations[0].id}`).reply(200, mock.organizations[0])

  // $resource with prepared params then find()
  .get(`/organizations/${mock.organizations[0].id}`).reply(200, mock.organizations[0])

  /** User Resource Requests ***************************************************/

  // all
  .get('/users').reply(200, mock.users)

  // find
  .get(`/users/${mock.users[0].id}`).reply(200, mock.users[0])

  // user hubs
  .get(`/users/${mock.users[0].id}/hubs`).reply(200, mock.hubs)

  // $resource with prepared params then find()
  .get(`/users/${mock.users[0].id}`).reply(200, mock.users[0])

  // all and limit
  .get('/users?limit=3').reply(200, mock.users.slice(0, 3))

  // all with query
  .get('/users?summaries=true&b=2').reply(200)


  // updating
  .get(`/users/${mock.users[0].id}`).reply(200, mock.users[0])
  .put(`/users/${mock.users[0].id}`).reply(200, mock.users[0])
;

describe('Hubs Resource', function () {
  it("all should return an array", function (done) {
    api.$resource('hubs').$all().then((res) => {
      res.should.not.be.empty;
      res[0].should.instanceOf(models.Hub);
      should(res[0].$newRecord).not.equal(true);

      should.exist(res.$nextPage);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('find should return one item', function (done) {
    api.$resource('hubs').$find(mock.hubs[0].id).then((res) => {
      res.should.instanceOf(models.Hub);
      res.id.should.equal(mock.hubs[0].id);
      should(res.$newRecord).not.equal(true);

      // Ensure it is a model and has $attributes and $data
      res.$data().uid.should.equal('my-first-hub')

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('$resource with prepared params then find should return one item', function (done) {
    api.$resource('hubs', { id: mock.hubs[0].id }).$find().then((res) => {
      res.should.instanceOf(models.Hub);
      res.id.should.equal(mock.hubs[0].id);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('all with limit should return the correct number of results', function (done) {
    api.$resource('hubs').limit(3).$all().then((res) => {
      res.length.should.equal(3);
      res[0].should.instanceOf(models.Hub);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('all with query should send query params', function (done) {
    api.$resource('hubs').query({summaries: true, b: 2}).$all().then((res) => {
      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('can update', function (done) {
    api.$resource('hubs').$find(mock.hubs[0].id).then((res) => {
      should(res.$newRecord).equal(false);

      res.$save().then(() => {
        done();
      }).catch((err) => {
        done(err);
      });
    }).catch((err) => {
      done(err);
    });
  });

  it('should create a new model', function(done) {
    var model = api.$resource('hubs').$create({ name: 'Hello' });
    model.should.be.instanceOf(models.Hub);
    model.name.should.equal('Hello');
    should(model.$newRecord).equal(true);

    model.$save().then(function(res) {
      should(model.$newRecord).equal(false);
      model.should.be.instanceOf(models.Hub);

      done();
    }).catch(function(err) {
      done(err);
    });
  });
});

describe('Organizations Resource', function () {
  it("all should return an array", function (done) {
    api.$resource('organizations').$all().then((res) => {
      res.should.not.be.empty;
      res[0].should.instanceOf(models.Organization);
      should(res[0].$newRecord).not.equal(true);

      should.exist(res.$nextPage);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('find should return one item', function (done) {
    api.$resource('organizations').$find(mock.organizations[0].id).then((res) => {
      res.should.instanceOf(models.Organization);
      res.id.should.equal(mock.organizations[0].id);
      should(res.$newRecord).not.equal(true);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('$resource with prepared params then find should return one item', function (done) {
    api.$resource('organizations', { id: mock.organizations[0].id }).$find().then((res) => {
      res.should.instanceOf(models.Organization);
      res.id.should.equal(mock.organizations[0].id);

      done();
    }).catch((err) => {
      done(err);
    });
  });
});

describe('Users Resource', function () {
  it("all should return an array", function (done) {
    api.$resource('users').$all().then((res) => {
      res.should.not.be.empty;
      res[0].should.instanceOf(models.User);
      should(res[0].$newRecord).not.equal(true);

      should.exist(res.$nextPage);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('find should return one item', function (done) {
    api.$resource('users').$find(mock.users[0].id).then((res) => {
      res.should.instanceOf(models.User);
      res.id.should.equal(mock.users[0].id);
      should(res.$newRecord).not.equal(true);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it("users.hubs should return an array of hubs", function (done) {
    api.$resource('users.hubs', { userId: mock.users[0].id }).$all().then((res) => {
      res.should.not.be.empty;
      res[0].should.instanceOf(models.Hub);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('$resource with prepared params then find should return one item', function (done) {
    api.$resource('users', { id: mock.users[0].id }).$find().then((res) => {
      res.should.instanceOf(models.User);
      res.id.should.equal(mock.users[0].id);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('can update', function (done) {
    api.$resource('users').$find(mock.users[0].id).then((res) => {
      res.$save().then(() => {
        done();
      }).catch((err) => {
        done(err);
      });
    }).catch((err) => {
      done(err);
    });
  });

  // it('can search', function (done) {
  //   api.$resource('users').$search({q: 'a'}).then((res) => {
  //     console.log(res)
  //   }).catch((err) => {
  //     done(err);
  //   });
  // });

  // it('can search', function (done) {
  //   api.$resource('discover.users').$all({q: 'a'}).then((res) => {
  //     console.log(res)
  //   }).catch((err) => {
  //     done(err);
  //   });
  // });
});

describe('Apps Resource', function() {
  it('all should return an array', function(done) {
    api.$resource('hubs.apps').$all({hubId: mock.hubs[0].id}).then((res) => {
      res.should.not.be.empty;
      res[0].should.instanceOf(models.App);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('find should return one item', function(done) {
    api.$resource('hubs.apps').$find({hubId: mock.hubs[0].id, id: mock.apps[0].id}).then((res) => {
      res.should.instanceOf(models.App);
      res.id.should.equal(mock.apps[0].id);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('$resource with prepared params then all should return an array', function(done) {
    api.$resource('hubs.apps', { hubId: mock.hubs[0].id }).$all().then((res) => {
      res.should.not.be.empty;
      res[0].should.instanceOf(models.App);
      res[0].id.should.equal(mock.apps[0].id);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('should support access from the result model', function(done) {
    api.$resource('hubs').$find(mock.hubs[0].id).then(function(hub) {
      hub.$resource().key.should.equal('hubs');
      hub.$resource().route.params.id.should.equal(mock.hubs[0].id);

      hub.$resource('apps').$all().then(function(apps) {
        hub.should.instanceOf(models.Hub);
        apps.should.not.be.empty;
        apps[0].should.instanceOf(models.App);

        done();
      }).catch((err) => {
        done(err);
      });
    });
  });

  it('should support multiple params for find', function(done) {
    api.$resource('hubs.apps').$find({ hubId: mock.hubs[0].id, id: mock.apps[0].id }).then(function(app) {
      app.should.be.instanceOf(models.App);
      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('should support accessing actions', function(done) {
    api.$resource('hubs.apps', { hubId: mock.hubs[0].id }).$current().then(function(app) {
      app.should.be.instanceOf(models.App);
      done();
    }).catch((err) => {
      done(err);
    });
  });


});

describe('Styles Resource', function() {
  it('all should return an array', function(done) {
    api.$resource('hubs.apps.styles').$all({hubId: mock.hubs[0].id, appId: mock.apps[0].id}).then((res) => {
      res.should.not.be.empty;
      res[0].should.instanceOf(models.Style);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('find should return one item', function(done) {
    api.$resource('hubs.apps.styles').$find({hubId: mock.hubs[0].id, appId: mock.apps[0].id, id: mock.styles[0].id}).then((res) => {
      res.should.instanceOf(models.Style);
      res.id.should.equal(mock.styles[0].id);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('should fetch styles in an inline fashion', function(done) {
    api.$resource('hubs').$all().then(function(hubs) {
      api.$resource('hubs.apps').$all({hubId: hubs[0].id}).then(function(apps) {
         api.$resource('hubs.apps.styles').$all({hubId: hubs[0].id, appId: apps[0].id}).then((res) => {
           res.should.not.be.empty;
           res[0].should.instanceOf(models.Style);

           done();
         }).catch((err) => {
           done(err);
         });
      });
    });
  });
});

describe('Stream Assets Resource', function() {
  it('should allow assets with custom routeSegment', function(done) {
    api.$resource('hubs.assets', {hubId: mock.hubs[0].id}).$all().then((res) => {
      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('should find asset by slug', function(done) {
    api.$resource('hubs.assets', { hubId: mock.hubs[0].id }).$find({slug: "some-slug"}).then((res) => {
      res.should.be.instanceOf(models.Asset);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('should find asset by slug with query set', function(done) {
    api.$resource('hubs.assets', { hubId: mock.hubs[0].id }).query({slug: "some-slug"}).$find().then((res) => {
      res.should.be.instanceOf(models.Asset);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('should find asset by slug with query set and then find associated data with no query set', function(done) {
    api.$resource('hubs.assets', { hubId: mock.hubs[0].id }).query({slug: "some-slug"}).$find().then((res) => {
      res.should.be.instanceOf(models.Asset);
      res.$resource('comments').$all().then((res) => {
        res[0].should.be.instanceOf(models.Comment);

        done();
      }).catch((err) => {
        done(err);
      });
    }).catch((err) => {
      done(err);
    });
  });
});

describe('Collections', function() {
  var collection;

  before(function(done) {
    api.$resource('hubs').$all().then((res) => {
      collection = res;
      done();
    });
  });

  it('should create a new model', function(done) {
    var model = collection.$create({ name: 'Hello' });
    model.should.be.instanceOf(models.Hub);
    model.name.should.equal('Hello');
    should(model.$newRecord).equal(true);

    done();
  });

  it('should add a new model', function(done) {
    collection.length.should.equal(mock.hubs.length);
    var model = collection.$create({ name: 'Hello' });

    collection.$add(model);
    collection.length.should.equal(mock.hubs.length + 1);

    done();
  });

  it('should remove a model', function(done) {
    var model = _.last(collection);

    collection.$remove(model);
    collection.length.should.equal(mock.hubs.length);

    done();
  });

  it('should add a new model at an index', function(done) {
    collection.length.should.equal(mock.hubs.length);
    var model = collection.$create({ name: 'Hello' });
    collection.$add(model, 3);
    collection.length.should.equal(mock.hubs.length + 1);
    collection[3].should.equal(model);

    done();
  });

  it('should remove a model at an index', function(done) {
    var model = collection.$remove(3);
    model.name.should.equal('Hello');
    collection.length.should.equal(mock.hubs.length);

    done();
  });

  it('should reposition a model in a collection', function(done) {
    var model = collection.$add({name: 'Hello'});

    collection.$reposition(mock.hubs.length, 0);
    collection[0].should.equal(model);
    collection.$reposition(0, 1);
    collection[1].should.equal(model);
    collection.$reposition(1, mock.hubs.length);
    collection[mock.hubs.length].should.equal(model);

    collection.length.should.equal(mock.hubs.length + 1);

    done();
  });

  it('should find a model by id', function(done) {
    var model = collection.$find(mock.hubs[0].id);
    model.name.should.equal('My First Hub');

    done();
  });


  it('should find a model where params match', function(done) {
    var model = collection.$findWhere({name: 'Hello'});
    model.name.should.equal('Hello');

    done();
  });

  it('should delete a model', function(done) {
    var model = collection.$find(mock.hubs[0].id);

    collection.$delete(model).then((res) => {
      collection.length.should.equal(mock.hubs.length);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('should properly save a created model', function(done) {
    var model = collection.$create({name: 'Hello'});
    model.$save().then(function() {
      model.name.should.equal('Hello');
      model.id.should.equal(1234);
      model.$resource().route.params.id.should.equal(1234);

      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('should have a collection action', function(done) {
    api.$resource('invites').$incoming().then(function() {
      done();
    }).catch((err) => {
      done(err);
    })
  });
  it('should have a member action', function(done) {
    api.$resource('invites').$incoming().then(function(res) {
      var invite = res[0];
      invite.should.be.instanceOf(models.Invite);
      invite.$accept().then(function(res) {
        done()
      }).catch((err) => {
        done(err);
      });
    }).catch((err) => {
      done(err);
    })
  });
});
