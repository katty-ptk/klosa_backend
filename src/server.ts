import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/library';

const router = express();

/** Connect to mongoose */
mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        Logging.info('🎉 Conncted to mongo! 🎉');
        startServer();
    })
    .catch((error) => {
        Logging.error('💔 Unable to connect to mongo 💔');
        Logging.error(error);
    });

/** Only start the server if it connects to mongo */
const startServer = () => {
    router.use((req, res, next) => {
        // Log the Request
        Logging.info(`Incoming -> Method: [${req.method}] | Url: [${req.url}] | IP: [${req.socket.remoteAddress}]`);

        res.on('finish', () => {
            Logging.info(`Outgoing -> Method: [${req.method}] | Url: [${req.url}] | IP: [${req.socket.remoteAddress}] | STATUS: [${res.statusCode}]`);
        });

        next();
    });

    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());

    /** Rules of our API */
    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if (req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            res.status(200).json({});
        }

        next();
    });

    /** Routes */

    /** Healthcare check */
    router.get('/ping', (req, res, next) => {
        res.status(200).json({ message: 'PONG - ALL GOOD' });
    });

    /** Error handling */
    router.use((req, res, next) => {
        const error = new Error('Sorry. Path not found.');
        Logging.error(error.message);
        res.status(404).json({ message: error });
    });

    http.createServer(router).listen(config.server.port, () => {
        Logging.info('Great! Server is running! 🎉');
    });
};
