const express = require('express');
const router = express.Router();

const moment = require('moment');

const transactions = [];
let payers = new Map();

// get transactions
router.get('/transactions', (req, res) => {
    res.json(transactions);
});

// get payers with balances
router.get('/payers', (req, res) => {
    res.json(Object.fromEntries(payers));
});

// create transaction
router.post('/transactions', (req, res) => {
    // { payer, points, timestamp }
    const transaction = {
        payer: req.body.payer,
        points: req.body.points,
        timestamp: req.body.timestamp
    }

    // if transaction is missing information reject and inform
    if (!transaction.payer || !transaction.points || !transaction.timestamp) {
        return res.status(400).json({ msg: 'Please include payer, points, and timestamp' });
    }
    if (typeof transaction.payer !== 'string') {
        return res.status(400).json({ msg: 'Payer must be a string'});
    } 
    if (!Number.isInteger(transaction.points)) {
        return res.status(400).json({ msg: 'Points must be a integer'});
    }
    if (!moment(transaction.timestamp).isValid()) {
        return res.status(400).json({ msg: 'Timestamp must be a valid timestamp'});
    }

    // find payer and update balance, or add new payer if payer doesn't exist
    if (payers.has(transaction.payer)) {
        payers.set(transaction.payer, payers.get(transaction.payer) + transaction.points);
    } else {
        payers.set(transaction.payer, transaction.points);
    }

    // add transaction to transactions array
    transactions.push(transaction);
    // sort transactions oldest to newest
    // transactions.sort((a, b) => moment(a.timestamp).isBefore(moment(b.timestamp)) ? -1 : 1);

    res.json({ msg: 'Transaction added', transaction });
});

// spend points
router.post('/spend', (req, res) => {
    if (!req.body.points) {
        return res.status(400).json({ msg: 'Please include points to spend' });
    }
    if (!Number.isInteger(req.body.points) || req.body.points <= 0){
        return res.status(400).json({ msg: 'Points must be a positive integer'});
    }

    let points = req.body.points;
    // copy and sort transactions oldest to newest
    const sortedTransactions = [...transactions].sort((a, b) => moment(a.timestamp).isBefore(moment(b.timestamp)) ? -1 : 1);

    const payerReport = [];
    // create copy of payers map
    const payersCopy = new Map(payers);

    // go through transactions and spend points
    for (let transaction of sortedTransactions) {
        let pointChange = 0;
        let payerPoints = payersCopy.get(transaction.payer);

        // payer must have points
        if (payerPoints > 0){
            if (points < transaction.points && points <= payerPoints) {
                // need less than the transaction and payer has points
                pointChange = points;
                points = 0;
            } else {
                if (transaction.points <= payerPoints) {
                    // need whole transaction
                    pointChange = transaction.points;
                } else {
                    // payer has less than the transaction
                    pointChange = payerPoints;
                }
                points -= pointChange;
            }
            
            // add payer and point change to report array
            const payer = payerReport.find(payer => payer.payer.toLowerCase() == transaction.payer.toLowerCase());
            if (payer) {
                payer.points -= pointChange;
            } else {
                const newPayer = {
                    payer: transaction.payer,
                    points: 0 - pointChange
                }
                
                payerReport.push(newPayer);
            }

            // update payer map copy
            payersCopy.set(transaction.payer, payersCopy.get(transaction.payer) - pointChange);

            // points have been spent, do not need to look at anymore transactions
            if (points === 0) {
                break;
            }
        }
    }

    if (points != 0) {
        // still need to spend more points, there was insufficient points available from payers
        return res.status(400).json({msg: 'Insufficient points' });
    }

    // add spending transactions to array
    payerReport.forEach(payer => {
        const transaction = {
            payer: payer.payer,
            points: payer.points,
            timestamp: moment().format()
        }
        transactions.push(transaction);
    });

    // permantly update payers map
    payers = payersCopy;

    res.json(payerReport);
});

module.exports = router;