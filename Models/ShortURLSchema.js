import mongoose from "mongoose";

 
const ShortURLSchema = new mongoose.Schema({
    urlId: {
        type: String,
        required: true,
      },
      origUrl: {
        type: String,
        required: true,
      },
      shortUrl: {
        type: String,
        required: true,
      },
      clicks: {
        type: Number,
        required: true,
        default: 0,
      },
      date: {
        type: Date,
        
      },
});

const ShortURL = mongoose.model("ShortURL", ShortURLSchema);
export default ShortURL;