const axios = require('axios');
const es_client = require('./index.js');
const bookings = require('../server/directToBookings.js');

const es_index = 'listing';
const es_type = 'available_listings';
// const es_index = require('./index.js');
// const es_type = require('./index.js');

//****************** ElasticSearch helper functions ******************//

module.exports.searchListings = (req, res) => {
  let { query } = req.query;

  return es_client.search({
    index: es_index,
    type: es_type,
    body: {
      query: {
        multi_match: {
          query: query, // change this for query
          fields: [
            'city',
            'country'
          ]
        }
      }
    }
  }).then((response, err) => {
    if (err) { throw err; }
    return response.hits.hits;
  }).catch(err => {
    console.log(`esHelpers SEARCH LISTING ERROR where err is ${err}`);
    res.status(err.statusCode).send(err.message);
  });
};

module.exports.selectListing = (req, res) => {
  // let { id } = req.query; // Code for when Users data is generated
  let id = req.params.listing_uuid;

  // get listing obj matching user selection
  return es_client.search({
    index: es_index,
    type: es_type,
    body: {
      query: {
        match: {
          _id: id
        }
      }
    }
  }).then((listing, err) => {
    if (err) { throw err; }
    // get dates available from bookings
    return bookings.getDaysAvailable(listing, res);
  }).catch(err => {
    console.log(`esHelpers SEARCH LISTING QUERY FAILED with error: ${err}`);
    res.status(err.statusCode).send(err.message);
  });
};

module.exports.createListing = (listing, res) => {
  // const listings = req.body; // Code for when Inventory microserv is connected
  return es_client.create({
    index: es_index,
    type: es_type,
    body: listing
  }).then((response, err) => {
    if (err) { throw err; }
  }).catch(err => {
    console.log(`esHelpers CREATE LISTING ERROR where err is ${err}`);
    res.status(err.statusCode).send(err.message);
  });
};


