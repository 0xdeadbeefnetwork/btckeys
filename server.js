const express = require('express');
const bitcoin = require('bitcoinjs-lib');
const BigInteger = require('bigi');
const secp256k1 = require('secp256k1');

const app = express();
const batchSize = 50;
let currentKey = BigInteger.ONE;

app.use(express.static('public'));

function generateWallets(startKey, count) {
    const wallets = [];
    let key = startKey;

    for (let i = 0; i < count; i++) {
        const keyBuffer = Buffer.from(key.toString(16).padStart(64, '0'), 'hex');
        const publicKey = Buffer.from(secp256k1.publicKeyCreate(keyBuffer));
        const { address } = bitcoin.payments.p2pkh({ pubkey: publicKey });

        wallets.push({
            privateKey: key.toString(16).padStart(64, '0'),
            publicKey: publicKey.toString('hex'),
            address: address
        });

        key = key.add(BigInteger.ONE);
    }

    return wallets;
}

app.get('/home', (req, res) => {
    currentKey = BigInteger.ONE;
    const wallets = generateWallets(currentKey, batchSize);
    res.json(wallets);
});

app.get('/next', (req, res) => {
    const wallets = generateWallets(currentKey, batchSize);
    currentKey = currentKey.add(new BigInteger(batchSize.toString())); // Use BigInteger directly
    res.json(wallets);
});

app.get('/random', (req, res) => {
    currentKey = BigInteger.fromBuffer(require('crypto').randomBytes(32));
    const wallets = generateWallets(currentKey, batchSize);
    res.json(wallets);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
