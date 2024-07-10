import express from 'express';
import { dashboard, getUrls, redirectUrl, shortenUrl } from '../Controllers/shorturlController.js';


const urlrouter = express.Router();

urlrouter.get('/url-dashboard',dashboard);
urlrouter.get('/geturls',getUrls);
urlrouter.post('/shorten-url',shortenUrl);
urlrouter.get('/:urlId',redirectUrl);


export default urlrouter;