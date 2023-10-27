const { request } = require('express');
var express = require('express');
require('../model/database');
const { resolve } = require('path');
const { all } = require('express/lib/application');
const { assert } = require('console');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const multer = require('multer');
var moment = require('moment');

//Model Declaration
const MediaModel = require('../model/mediaLibrary');
const UserModel = require('../model/insideUser');

//Moment Date
const newDate = moment().format('lll');

//Multer for Storage//
const upload = multer({
    storage: multerS3({
    s3: s3,
    bucket: 'birdev',
    acl: 'public-read',
    key: function (request, file, cb) {
        console.log(file);
        cb(null, 'news/' + ranDom + file.originalname);
    },
    }),
}).single('myFile', 1);

//Storage Key


const spacesEndpoint = new aws.Endpoint('blr1.digitaloceanspaces.com');
    const s3 = new aws.S3({
        endpoint: spacesEndpoint,
        accessKeyId:'DO00ENCQU7FDX8ZJAMYZ',
        secretAccessKey:'WcXhyb9n4ebPZS1uX8lSwuCCoKK8kbwDexVDGmTqC4M'
    });

    
    //Function Declaration of Each Page
    exports.addMediaPage = async(req, res) =>{
        res.render('admin/addMedia',{
            layout: '',
        })   
    }

    exports.mediaPageView = async (req, res) => {
        const page = req.query.page || 1; // Get the current page from the request query parameters
        const limit = 10; // Number of items per page
        try {
            const totalCount = await MediaModel.countDocuments({});
            const totalPages = Math.ceil(totalCount / limit);
            const offset = (page - 1) * limit;
            const mediaData = await MediaModel.find({})
            .sort({ media_id: -1 })
            .skip(offset)
            .limit(limit)
            .lean();
            res.render('admin/mediaPage', {
                layout: '',
                mediaData,
                totalPages,
                currentPage: page,
            });
        } catch (error) {
            console.error('Error retrieving media data:', error);
            res.status(500).send('Internal Server Error');
        }
    };

    
