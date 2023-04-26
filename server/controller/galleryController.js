const { request } = require('express');
var express = require('express');
require('../model/database');
const galleryDb = require('../model/gallery');
const allNews = require('../model/allnews')
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { resolve } = require('path');
//const { rejects } = require('assert');
const { all } = require('express/lib/application');
const { assert } = require('console');
const _ = require('lodash');
const { title } = require('process');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
var moment = require('moment'); // require





const spacesEndpoint = new aws.Endpoint('sfo3.digitaloceanspaces.com');
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId:'DO00YCW72DZT2Q6WMMFF',
  secretAccessKey:'SQyXsV6kK6GsQHEUlFTCjfQ2LyKmSnAiPqAn4MAmMrc'
});


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
};



  exports.postGallery = async(req, res) =>{
    const ranDom = getRandomInt(9999999999);
    const nDate = moment().format('lll');
    const upload = multer({
        storage: multerS3({
          s3: s3,
          bucket: 'northeastherald',
          acl: 'public-read',
          key: function (request, file, cb) {
            console.log(file);
            cb(null,'gallery/'+ ranDom + file.originalname);
            console.log('Fiel Original:', file.originalname);
          }
        })
    }).array('myFile', 10);

    upload(req, res, (error) => {
        console.log('files', req.files);
        if (error) {
            console.log('errors', error);
            res.status(500).json({
                status: 'fail',
                error: error
            });
        } else {
            // If File not found
            if (req.files === undefined) {
                console.log('uploadProductsImages Error: No File Selected!');
                res.status(500).json({
                    status: 'fail',
                    message: 'Error: No File Selected'
                });
            } else {
                // If Success

                const {title, keyword, description} = req.body;
                var gurl = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

                let fileArray = req.files,
                    fileLocation;
                const images = [];
                for (let i = 0; i < fileArray.length; i++) {
                    fileLocation = fileArray[i].key;
                    console.log('filenm', fileLocation);
                    images.push(fileLocation)
                }
                let inse = new galleryDb({
                    gallery_title: title,
                    gallery_keyword: keyword,
                    gallery_description: description,
                    gallery_path: images,
                    gallery_url: gurl,
                    update_date: nDate
                });
                inse.save();
                // Save the file name into database
                return res.status(200).json({
                    status: 'ok',
                    filesArray: fileArray,
                    locationArray: images,
                });

                

            }
        }
    })
  }

  exports.addGallery = async(req, res) =>{
    res.render("admin/addgallery",{
        layout:"",
    })
  }

  exports.pageGallery = async(req, res) =>{
    try{
        let url = req.params.gurl;
        let gdata = await galleryDb.findOne({gallery_url:url}).lean();
        const recent = await allNews.find({}).sort({news_id:-1}).limit(8).lean();

        res.render('gallery',{
        pageTitle: gdata.gallery_title + ' | Northeast Herald',
        pageKeyword: gdata.gallery_keyword,
        pageDescription: gdata.gallery_description,
        pageUrl: 'https://www.neherald.com/'+gdata.gallery_url,
        imageCard: 'https://www.neherald.com/logo.png',
        gdata,
        recent
    });

    }catch{

    }
  }

  exports.listGallery = async(req, res) =>{
            adminSession=req.session;
            if(!adminSession.userid){
                res.redirect('/admin/user/login');
            }
            else{
            const gallery = await galleryDb.find().sort({gallery_id:-1}).lean();
            res.render('admin/listgallery',{
                layout:'',
                gallery
            });
            }
  }
