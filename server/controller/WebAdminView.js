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


const NewsModel = require('../model/allnews');
const MediaModel = require('../model/mediaLibrary');
const UserModel = require('../model/insideUser');

//Moment Date
const newDate = moment().format('lll');


//Multer for Storage//


//Storage Key
const spacesEndpoint = new aws.Endpoint('sfo3.digitaloceanspaces.com');
const s3 = new aws.S3({
    endpoint: spacesEndpoint,
    accessKeyId:'DO00YCW72DZT2Q6WMMFF',
    secretAccessKey:'SQyXsV6kK6GsQHEUlFTCjfQ2LyKmSnAiPqAn4MAmMrc'
});
const upload = multer({
    storage: multerS3({
    s3: s3,
    bucket: 'northeastherald',
    acl: 'public-read',
    key: function (request, file, cb) {
        console.log(file);
        cb(null, 'news/' + ranDom + file.originalname);
    },
    }),
}).single('myFile', 1);
    
    //Function Declaration of Each Page
    exports.addMediaPage = async(req, res) =>{
        res.render('admin/addMedia',{
            layout: '',
        })   
    }
    exports.byuserPage = async(req, res) =>{
        res.render('admin/byUser',{
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


    exports.authUser = async(req, res) => {
        const { username, password } = req.body;
        const user = await UserModel.findOne({user_mail:username}).lean();
        console.log(user);
        if(!user){
            res.send("There is no user");
        }
        const matchPass = await bcrypt.compare(password, user.password);
        if(!matchPass){
            return res.send("alert('Password does not match motherfucker')");
        }else{
            var authorSession = req.session;
            authorSession.userid = username;
            res.redirect('/admin/author/dashboard');
        }
    }



    exports.addBlogs = async(req, res) =>{
        try {
            await promisify(upload)(req, res);
            if (!req.file) {
              throw new Error('No file uploaded');
            }
            const add = re.body;
            const filex = req.file.originalname;
            const nFile = ranDom + filex;
            const urlp = "https://northeastherald.sfo3.digitaloceanspaces.com/news/";
            const aFile = urlp + nFile;        
            let addNews = new NewsModel({
                post_name: add.post_name,
                post_url: add.post_url,
                post_summary: add.post_summary,
                post_description: add.post_description,
                post_content: add.post_content,
                post_keyword: add.post_keyword,
                post_category: add.post_category,
                post_image: aFile,
                meta_tags: add.meta_tags,
                insight_post: add.insight_post,
                author_key: 'session_key',
                author_name: 'Uername',
                post_status: 0,
                update_date: newDate,
            });
            await addNews.save();
            res.send("News Uploaded.");
          } catch (error) {
            console.error(error);
            res.status(500).send('Something went wrong');
          }

    }

    
