const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // for parsing application/json


// Using in-memory storage for simplicity, replace with a database in production
let bids = [];
let highestBid = 0;
let highestBidder = null; // Add this line
const auctionEndTime = Date.now()  + 1000000000000;
// Place a bid
app.post('/bid', (req, res) => {
  const { address, bid } = req.body;

  if (Date.now() > auctionEndTime) {
    return res.status(400).send('Auction has ended');
  }

  if (bid <= highestBid) {
    return res.status(400).send('Bid must be higher than the current highest bid');
  }

  highestBidder = address;
  highestBid = bid;
  bids.push({ address, bid }); // Store the bid in the bids array

  res.send(`New highest bid: ${bid} by ${address}`);
});

// Get all bids
app.get('/getBids', (req, res) => {
  res.json(bids);
});

app.get('/highestBid', (req, res) => {
    res.json({ highestBid });
  });

app.post('/deleteBid', (req, res) => {
  const { address } = req.body;

  // Find the index of the bid by the given address
  const index = bids.findIndex(bid => bid.address === address);

  // If the bid is not found, return a 404 error
  if (index === -1) {
    return res.status(404).send('Bid not found');
  }

  // Remove the bid from the array
  bids.splice(index, 1);

  // If the deleted bid was the highest, recalculate the highest bid
  if (address === highestBidder) {
    highestBid = 0;
    highestBidder = null;
    for (let bid of bids) {
      if (bid.bid > highestBid) {
        highestBid = bid.bid;
        highestBidder = bid.address;
      }
    }
  }

  res.send(`Bid by ${address} has been deleted`);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });