Project: Fetch Rewards Coding Exercise
Author: Ryan Rowland
Version: 0.2.0
Description: 
    Coding Exercise for Fetch Rewards Backend Software Engineering. Points accounting web service. 
    Tracks point transactions from payers/partners for a user and allows user to spend points.
Instructions:
    Web service can be started via "npm start" in the console. 
    
    A GET request to localhost:5000/api/payers will return all payer points balances.
    
    A GET request to localhost:5000/api/transactions will return all transactions.
    
    Sending a POST request with a JSON object to localhost:5000/api/transactions will add a new transaction.
    Expected object: { payer, points, timestamp }. Returns confimation and added transaction.

    Sending a POST request with a JSON to localhost:5000/api/spend will spend points.
    Expected object: { points }. Returns points spent per payer.