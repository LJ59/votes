import {getStore} from '@netlify/blobs';
import {createApi} from '../../lib/api.mjs';
export default async req => createApi(getStore({name:'voix-v1',consistency:'strong'}))(req);
