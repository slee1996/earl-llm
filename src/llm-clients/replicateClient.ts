import dotenv from 'dotenv';
import Replicate from 'replicate';

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default replicate;