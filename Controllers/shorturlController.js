import Url from "../Models/ShortURLSchema.js";
import { validateUrl } from "../Utils/validateUrl.js";
import { nanoid } from "nanoid";
import dotenv from "dotenv";

dotenv.config();

export const shortenUrl = async (req, res, next) => {
  const { origUrl } = req.body;
  const base = process.env.BASE;

  const urlId = nanoid(10);
  if (validateUrl(origUrl)) {
    try {
      const url = await Url.findOne({ origUrl });
      if (url) {
        res.status(200).json({ message: "URL already exists", url });
      } else {
        const shortUrl = `${base}/${urlId}`;
        const newUrl = new Url({
          origUrl,
          shortUrl,
          urlId,
          date: new Date(),
        });
        await newUrl.save();
        res.status(200).json({ message: "URL shortened successfully", newUrl });
      }
    } catch (error) {}
  } else {
    res.status(400).json({ message: "Invalid URL" });
  }
};

export const redirectUrl = async (req, res, next) => {
  try {
    const url = await Url.findOne({ urlId: req.params.urlId });
    //console.log(url);
    if (url) {
      await Url.updateOne(
        {
          urlId: req.params.urlId,
        },
        { $inc: { clicks: 1 } }
      );
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
      res.setHeader('Access-Control-Allow-Credentials', true);
     res.redirect(url.origUrl);
    
    } else res.status(404).json("Not found");
  } catch (error) {
    res.status(404).json({ message: "Server error in redirect" });
  }
};


export const dashboard = async (req, res,next) => {
      try {
      //const filter = {};
      //const allurls = await Url.find();
      //console.log(allurls);
      const current = new Date();
      var lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth()-1);
      //console.log(lastMonth);
      //console.log(current)
      const urllist = await Url
        .find({
          date: {
            $gte: new Date(lastMonth),
            $lte: current,
          },
        })
        .countDocuments();
  
      //console.log(urllist);
      var start = new Date();
      start.setHours(0, 0, 0, 0);
  
      var end = new Date();
      end.setHours(23, 59, 59, 999);
      const data = await Url
        .find({
          date: {
            $gte: start,
            $lt: end,
          },
        })
  
        .countDocuments();
      //console.log(data);
  
      res
        .status(200)
        .json({
          message: "Urls listed successfully",
          month: urllist,
          date: data,
        });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal server error in displaying url" });
    }
  };


  export const getUrls = async(req,res,next)=>{
    try {
          const urlresults = await Url.find();
         // console.log(urlresults);
         res
          .status(200)
          .json({ message: "Urls retrieved successfully", result: urlresults });
      
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal server error in retreiving urls" });
    }
  };
  
  