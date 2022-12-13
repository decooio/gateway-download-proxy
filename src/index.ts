import {Request, Response} from 'express';
import axios from "axios";
import * as _ from "lodash";
import nodeCache = require('node-cache');
const myCache = new nodeCache({ stdTTL: 0, checkperiod: 60 * 5 });
const express = require('express');
const cors = require('cors');
const http = axios.create();
const server = express();
const API_CALL_HOST = process.env.API_CALL_HOST || 'http://localhost:3000'
const API_CALL_PASSWORD = process.env.API_CALL_PASSWORD || 'password'
const PORT = process.env.PORT || 5051;

server.use(cors());
server.get('/ipfs/:cid', async (req: Request, res: Response) => {
  const cid = req.params.cid;
  const cacheData = myCache.get(cid);
  if (_.isEmpty(cacheData)) {
    console.log(`no cache data`);
    try {
      await http.request({
        url: `${API_CALL_HOST}/order/query/${cid}`,
        method: 'GET',
        headers: { Authorization: `Basic ${API_CALL_PASSWORD}` },
        timeout: 3000
      });
      myCache.set(cid, 'ok');
      return res.status(200).send('ok');
    } catch (error) {
      if (!_.isEmpty(error.response) && axios.isAxiosError(error) && error.response.status === 403) {
        myCache.set(cid, 'failed')
      }
      return res.status(403).send('failed');
    }
  }
  console.log(`cacheData: ${cacheData}`);
  return res.status(cacheData === 'ok' ? 200 : 403).send(cacheData);
});

server.listen(PORT);