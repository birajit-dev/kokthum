const { request } = require('express');
const fs = require('fs'); // File system module to delete files
const path = require('path'); // Path module to handle file paths
const crypto = require('crypto');
var express = require('express');
require('../model/database');
const allNews = require('../model/allnews');
const allPages = require('../model/allpage');
const adminData =  require('../model/login');
const breakingNews = require('../model/breakingnews');
const Ibns = require('../model/ibns');
const YouTube = require('../model/youtube');
const UserModel = require('../model/insideUser');
const AuthorModel = require('../model/insideUser');
const MediaModel = require('../model/mediaLibrary');
const AiNewsModel = require('../model/ainews');
const DocumentModel = require('../model/document');
const ImageModel = require('../model/images');
require('dotenv').config(); // To manage API keys securely
const { OpenAI } = require('openai');
const axios = require('axios');
const SaasUserModel = require('../model/saasuser');

const Queue = require('bull');
const moment = require('moment');

const jwt = require('jsonwebtoken');


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;


// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Keep your key in .env
});

const JWT_SECRET = process.env.JWT_SECRET; // Put this in .env



const webpush = require('web-push');
const Subscription = require('../model/notifications');

// Configure web-push with VAPID details
const vapidDetails = {
  publicKey: 'BAJumD12OcZQQbu-8PYbHXFrf7mjy5kw4oSQubYN93dojRLz3EHhNcy_yLk64ipj74rjbNELdQcDXUpKIQi6MZw',
  privateKey: process.env.VAPID_PRIVATE_KEY,
  email: 'kokthumthenews@gmail.com'
};

webpush.setVapidDetails(
  `mailto:${vapidDetails.email}`,
  vapidDetails.publicKey,
  vapidDetails.privateKey
);


const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { resolve } = require('path');
//const { rejects } = require('assert');
const { all } = require('express/lib/application');
const { assert } = require('console');
const fetch = require('node-fetch');
const _ = require('lodash');
const allnews = require('../model/allnews');
const { title } = require('process');
const breakingnews = require('../model/breakingnews');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const uploadNewsImage = require('../middleware/uploadNewsImage');




    //Multer Outside



    const newDate = moment().format('lll');


    const spacesEndpoint = new aws.Endpoint('blr1.digitaloceanspaces.com');
    const s3 = new aws.S3({
        endpoint: spacesEndpoint,
        accessKeyId:'DO00ENCQU7FDX8ZJAMYZ',
        secretAccessKey:'WcXhyb9n4ebPZS1uX8lSwuCCoKK8kbwDexVDGmTqC4M'
    });
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


    //Random Function
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    };

    // const event = new Date();
    // const options = {  year: 'numeric', month: 'short', day: 'numeric' };
    // const newDate = event.toString('en-US', options);


    



    // var storage = multer.diskStorage({
    //     destination: function (req, file, cb) {
    //     cb(null, './public/uploads/')
    //     },
    //     filename: function (req, file, cb) {
    //     cb(null, ranDom +file.originalname)
    //     }
    // })
    
    // var upload = multer({ 
    //     storage: storage }).single('myFile');



    
    // Change bucket property to your Space name
 
      

    exports.adminLogin = async(req, res) => {
        res.render('admin/login',{
            layout:''
        });
    }

    exports.addNews = async(req, res) =>{
        adminSession=req.session;
            if(!adminSession.userid){
                res.redirect('/admin/user/login');
            }
            else{
                res.render('admin/addnews',{
                    title:'Northeast Herald',
                    layout: ''
                    })
            }
    }

    exports.authAdmin = async(req, res) => {
        const { username, password } = req.body;
        const user = await adminData.findOne({username}).lean();
        console.log(user);
        if(!user){
            return res.redirect('/error');
        }
        const matchPass = await bcrypt.compare(password, user.password);
        if(!matchPass){
            return res.send("alert('Password does not match motherfucker')");
        }else{
            var adminSession = req.session;
            adminSession.userid = username;
            //req.session.authA = username;
            //var fuckingA = req.session.authA;
            //session.userid=user.username;
            res.redirect('/admin/user/dashboard');
        }
    }

    exports.adminDashboard = async(req, res) => {
            adminSession=req.session;
            if(!adminSession.userid){
                res.redirect('/admin/user/login');
            }
            else{
                //const dashAllNews = await allNews.find().sort({update_date:-1}).lean();
                const dashAllNews = await allNews.find().sort({ update_date: -1 }).limit(200).lean();
                res.render('admin/dashboard',{
                    title:'Northeast Herald',
                    layout: '',
                    dashAllNews,});
            }
    }




    exports.upImage = async(req, res) =>{
        upload(req, res, function(err){
            if(err){
                res.send('Image Can not Upload.');
            }else{
                //console.log(req.file);
                res.send('Image Uploaded.');
                const file = req.file.filename;
                    let saveImage = new singleUp({
                        image_path: file
                    });
                saveImage.save();
            }
        });
    }

    // exports.postNews = async(req, res)=>{
    //     const ranDom = getRandomInt(999999);
    //     const upload = multer({ 
    //         storage: multerS3({
    //         s3: s3,
    //         bucket: 'birdev',
    //         acl: 'public-read',
    //         key: function (request, file, cb) {
    //             console.log(file);
    //             cb(null,'news/'+ranDom + file.originalname);
    //         }
    //         })
    //     }).single('myFile', 1);

    //     upload(req, res, function(err){
    //         if(err){
    //             res.send('Something Went Wrong');
    //         }else{
    //             //console.log(req.file);

    //             const filex = req.file.originalname;
    //             const nFile = ranDom +filex;
    //             const urlp = "https://birdev.blr1.cdn.digitaloceanspaces.com/news/";
    //             const aFile = urlp +nFile;
    //             const nDate = moment().format('lll');
    //             const {name, url, summary, mytextarea, keyword, description, category, tags, insight, author} = req.body;
    //             const purl = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    //             let upallNews = new allNews({
    //                 post_name: name,
    //                 post_url: url,
    //                 post_summary: summary,
    //                 post_description: description,
    //                 post_content: mytextarea,
    //                 post_keyword: keyword,
    //                 post_category: category,
    //                 post_image: aFile,
    //                 meta_tags: tags,
    //                 insight_post: insight,
    //                 author_key: author,
    //                 author_name: author,
    //                 post_status: 1,
    //                 update_date: nDate,
    //             });
    //             upallNews.save();
    //             res.redirect('/admin/user/dashboard');
    //         }
    //     });    
    // }




    exports.postNews = async (req, res) => {
        const ranDom = getRandomInt(999999);
        
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, 'public/uploads/news'); // Define the destination folder within the public directory
            },
            filename: function (req, file, cb) {
                const ext = file.originalname.split('.').pop();
                const fileName = ranDom + '-' + Date.now() + '.' + ext; // Generate unique file name
                cb(null, fileName);
            }
        });
    
        const upload = multer({ storage: storage }).single('myFile', 1);
    
        upload(req, res, function (err) {
            if (err) {
                res.send('Something Went Wrong');
            } else {
                const fileName = req.file.filename; // Use the generated file name
                const urlp = "/uploads/news/"; // Define your base URL where files are stored
                const filePath = urlp + fileName;
                const nDate = moment().format('lll');
                const { name, url, summary, mytextarea, keyword, description, category, tags, insight, author } = req.body;
                const purl = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                
                let upallNews = new allNews({
                    post_name: name,
                    post_url: url,
                    post_summary: summary,
                    post_description: description,
                    post_content: mytextarea,
                    post_keyword: keyword,
                    post_category: category,
                    post_image: filePath, // Use the file path with the file name
                    meta_tags: tags,
                    insight_post: insight,
                    author_key: author,
                    author_name: author,
                    post_status: 1,
                    update_date: nDate,
                });
                upallNews.save();
                res.redirect('/admin/user/dashboard');
            }
        });
    }
    


    exports.editNews = async(req, res)=>{
        adminSession=req.session;
            if(!adminSession.userid){
                res.redirect('/admin/user/login');
            }
            else{
                let newsId = req.params.id;
            const editnews = await allNews.findOne({news_id:newsId}).lean();
            res.render('admin/editnews',{
                layout:'',
                editnews
            });
            }
    }

    exports.updateNews = async(req, res)=>{
        const {id, name, summary, mytextarea, keyword, description, category, tags, topics, editor, insight, author } = req.body;
        allNews.findByIdAndUpdate(id, 
            {   post_name: name,
                post_summary: summary,
                post_content:mytextarea,
                post_keyword:keyword,
                meta_description:description,
                post_category:category,
                meta_tags:tags,
                post_topic:topics,
                post_editor:editor,
                ne_insight:insight,
                author:author,
            }, function(err, data) {
            if(err){
                res.send('Something Went Wrong');
            }
            else{
                res.redirect('/admin/user/dashboard');
            }
            });
    }

    exports.addPage = async(req, res)=>{
        try{
            res.render('admin/addpage',{
                layout: '',
            })
        }catch{

        }
    }

    exports.postPage = async(req, res) =>{
        const {name, url, mytextarea, keyword, description} = req.body;
        let newpage = new allPages({
            page_title: name,
            page_content: mytextarea,
            page_keyword: keyword,
            page_description:description,
            page_url:url,
            update_date:newDate,
        });
        await newpage.save();
        res.send('Pages Created.');
    }

    exports.pageDashboard = async(req, res)=>{
        adminSession=req.session;
            if(!adminSession.userid){
                res.redirect('/admin/user/login');
            }
            else{
                const allpagelist = await allPages.find().sort({page_id:-1}).lean();
                res.render('admin/pagelist',{
                    title:'Northeast Herald',
                    layout: '',
                    allpagelist
                });
            }
    }

    exports.editPage = async(req, res)=>{
            adminSession=req.session;
            if(!adminSession.userid){
                res.redirect('/admin/user/login');
            }
            else{
            let pid = req.params.id;
            const edPage = await allPages.findOne({page_id:pid}).lean();
            res.render('admin/editpage',{
                layout:'',
                edPage
            });
            }
    }

    exports.updatePage = async(req, res)=>{
        const {id, name, url, mytextarea, keyword, description} = req.body;
        allPages.findByIdAndUpdate(id, 
            {
                page_title: name,
                page_content: mytextarea,
                page_keyword: keyword,
                page_description:description,
                page_url:url,
                update_date:newDate,
            },function(err, data) {
            if(err){
                res.send('Something Went Wrong');
            }
            else{
                res.send('Pages Update Successfully.');
            }
            });
    }

    exports.brNews = async(req, res, next) =>{
        const {title, keyword} = req.body;        
        let brurl = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        console.log(title, keyword, brurl)
        let breakingnews = new breakingNews({
            breaking_title:title,
            breaking_keyword:keyword,
            breaking_url:brurl,
            update_date:newDate,
        });
        breakingnews.save();
        res.send("Breaking News Uploaded.")
    }

    exports.listBreaking = async(req, res, next) =>{
            adminSession=req.session;
            if(!adminSession.userid){
                res.redirect('/admin/user/login');
            }
            else{
            const brdata = await breakingNews.find().sort({brnews:-1}).lean();
            res.render('admin/listbreaking',{
                layout:'',
                brdata
            });
            }
    }

    exports.editBreaking = async(req, res) =>{
        adminSession=req.session;
        if(!adminSession.userid){
            res.redirect('/admin/user/login');
        }
        else{
        let pid = req.params.id;
        const edbreaking = await breakingNews.findOne({brnews_id:pid}).lean();
        res.render('admin/editbreaking',{
            layout:'',
            edbreaking
        });
        }
    }

    exports.updateBreaking = async(req, res) => {
        const {title, keyword, id} = req.body;
        let brurl = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        breakingNews.findByIdAndUpdate(id, 
            {
                breaking_title: title,
                breaking_keyword: keyword,
                breaking_url: brurl,
                update_date:newDate,
            },function(err, data) {
            if(err){
                res.send('Something Went Wrong');
            }
            else{
                res.send('Breaking News Update Successfully.');
            }
            });
    }

    exports.breakingPage = async(req, res, next) =>{
        try{
            res.render('admin/addbreaking',{
                layout: '',
            })
        }catch{

        }
    }

    exports.deleteNews = async(req, res, next) =>{
            let idd = req.params.id;
            allNews.remove({_id:idd}, 
            function(err, data) {
                if(err){
                    res.send("Cam not Delete");
                }
                else{
                    res.redirect('/admin/user/dashboard');
                }
            });  
    }

    exports.deleteBreaking = async(req, res, next) =>{
        let idd = req.params.id;
            breakingNews.remove({_id:idd}, 
            function(err, data) {
                if(err){
                    res.send("Can not Delete");
                }
                else{
                    res.redirect('/admin/user/listbreaking');
                }
            });  
    }

    exports.deleteGallery = async(req, res, next) =>{
        let idd = req.params.id;
            galleryDb.remove({_id:idd}, 
            function(err, data) {
                if(err){
                    res.send("Can not Delete");
                }
                else{
                    res.redirect('/admin/user/dashboard');
                }
            });  
    }

    exports.addVideos = async(req, res, next) =>{
            try{
                const nDate = moment().format('lll');
                const vKey = req.query.key;
                let upYouTube = new YouTube({
                    video_key:vKey,
                    update_date:nDate,
                });
                const sVideo = upYouTube.save();
                res.status(200).json("Success");                
            }catch(error) {
                res.status(400).json({message: error.message})
            }
    }


    exports.addInsideUsers = async(req, res, next) =>{
        try{
            const {user_mail,user_role,user_pic,login_pass,user_name} = req.body;
            var user_status = 'Active';
            
            let upUserRole = new UserRoles({
                user_mail:user_mail,
                user_name:user_name,
                user_role:user_role,
                user_status:user_status,
                user_pic:user_pic,
                login_id:user_mail,
                login_pass:login_pass,
            });
            const sse = upUserRole.save();
            res.redirect('/admin/user/allusers');
        }catch(error){
            res.status(400).json({message: error.message});
        }
    }
    exports.addUserPage = async(req, res)=>{
        try{
            res.render('admin/adduser',{
                layout: '',
            })
        }catch{

        }
    }

    exports.addAuthor = async(req, res) =>{

        const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        function generateString(length) {
        let result = '';
        const charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
        }
        const ab =  req.body;
        const addauthor = new UserModel({
            user_mail: ab.user_mail,
            user_name: ab.user_name,
            user_role: ab.user_role,
            user_status: ab.user_status,
            user_pic: ab.user_pic,
            login_id: ab.login_id,
            password: ab.password,
            author_bio: ab.author_bio,
            update_date: newDate,
            facebook_link: ab.facebook_link,
            twitter_link: ab.twitter_link,
            instagram_link: ab.instagram_link,
            linkedin_link: ab.linkedin_link,
            tag_line: ab.tag_line,
            domain_owner: ab.domain_owner,
            domain_key: ab.domain_key,
            domain_name: ab.domain_name,
            author_code: generateString(6),
            update_date: String

        });
        await addauthor.save();
        res.send("User Added Successfully");
    }

    exports.addMedia = async(req, res) =>{
        const ranDom = getRandomInt(999999);
        const upload = multer({ 
            storage: multerS3({
            s3: s3,
            bucket: 'birdev',
            acl: 'public-read',
            key: function (request, file, cb) {
                console.log(file);
                cb(null,'news/'+ranDom + file.originalname);
            }
            })
        }).single('myFile', 1);

        upload(req, res, function(err){
            if(err){
                res.send('Something Went Wrong');
            }else{
                //console.log(req.file);
                const filex = req.file.originalname;
                const nFile = ranDom +filex;
                const urlp = "https://birdev.blr1.cdn.digitaloceanspaces.com/news/";
                const aFile = urlp +nFile;
                const nDate = moment().format('lll');
                let mediaAdd = new MediaModel({
                    media_path:aFile,
                    media_alt:"Kokthum news image",
                    update_date:newDate,
                });
                mediaAdd.save();
                res.send("Media Uploaded.")
            }
        });   
    }



    exports.allUsers = async(req, res) =>{
        adminSession=req.session;
            if(!adminSession.userid){
                res.redirect('/admin/user/login');
            }
            else{
            const allUsers = await UserModel.find().sort({user_id:-1}).lean();
            res.render('admin/userlist',{
                layout:'',
                allUsers
            });
            }
    }
    
    exports.editAuthorPage = async(req, res) =>{
        adminSession=req.session;
            if(!adminSession.userid){
                res.redirect('/admin/user/login');
            }
            else{
            let pid = req.query.id;
            const edAuthor = await UserModel.findById({_id:pid}).lean();
            res.render('admin/editAuthor',{
                layout:'',
                edAuthor
            });
            }
    }


    exports.updateAuthor = async (req, res) => {
        const updatedData = req.body;
        console.log(updatedData.userId);
    
        try {        
    
            // Use findByIdAndUpdate to update the user by ID
            const updatedUser = await UserModel.findByIdAndUpdate(updatedData.userId,
                {
                    $set: {
                        user_mail: updatedData.user_mail,
                        user_name: updatedData.user_name,
                        user_role: updatedData.user_role,
                        user_status: updatedData.user_status,
                        user_pic: updatedData.user_pic,
                        login_id: updatedData.login_id,
                        password: updatedData.password,
                        author_bio: updatedData.author_bio,
                        update_date: new Date(),
                        facebook_link: updatedData.facebook_link,
                        twitter_link: updatedData.twitter_link,
                        instagram_link: updatedData.instagram_link,
                        linkedin_link: updatedData.linkedin_link,
                        tag_line: updatedData.tag_line,
                        // Note: The author_code field is not updated, as it's typically a static value for an author.
                    },
                },
                { new: true } // Return the updated document
            );
    
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            res.json({ message: 'User updated successfully', user: updatedUser });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    };
    


    //Fetching News List for Admin User
    exports.AdminNewsList = async (req, res) => {
        try {
          const page = parseInt(req.query.page) || 1;
          const KEY = req.query.key;
          const search = req.query.search || '';
          const limit = 20;
          const skip = (page - 1) * limit;
      
          if (!KEY) {
            return res.status(400).json({ success: false, message: "Missing SaaS key" });
          }
      
          // Build filter
          const filter = {
            domain_key: KEY,
            post_status: 'Published'
          };
      
          // If search is present, add case-insensitive search on post_name or post_description
          if (search) {
            filter.$or = [
              { post_name: { $regex: search, $options: 'i' } },
              { post_description: { $regex: search, $options: 'i' } }
            ];
          }
      
          const totalPosts = await AiNewsModel.countDocuments(filter);
          const totalPages = Math.ceil(totalPosts / limit);
      
          const dashAllNews = await AiNewsModel.find(filter)
            .sort({ ai_seq: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
      
          res.json({
            success: true,
            data: {
              news: dashAllNews,
              pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1
              }
            }
          });
        } catch (error) {
          console.error("AdminNewsList Error:", error);
          res.status(500).json({
            success: false,
            message: "Error fetching news list",
            error: error.message
          });
        }
      };
      
    //Fetching Author List for Admin User
    exports.authorList = async(req, res) => {
        try {
            const KEY = req.query.key;
            const allUsers = await UserModel.find({domain_key: KEY}).sort({user_id:-1}).lean();
            res.json({
                success: true,
                data: {
                    authors: allUsers
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || "Error fetching author list"
            });
        }
    }

    //Fetching Image Gallery for Admin User

    exports.ImageGallery = async (req, res) => {
        try {
            const APIKEY = req.query.key;
            const page = parseInt(req.query.page) || 1; // Default page 1
            const limit = 20; // Items per page
            const skip = (page - 1) * limit; // Offset calculation

            if (!APIKEY) {
                return res.status(400).json({ message: 'Missing saasAPI key in request body' });
            }
        
            // Fetch SaaS user based on saasAPI
            const getAPI = await SaasUserModel.findOne({ saas_api: APIKEY });
    
            if (!APIKEY) {
            return res.status(404).json({ message: 'Invalid saasAPI or user not found' });
            }
            // Fetch images from ImageModel
            const imageGallery = await ImageModel.find({domain_key: APIKEY}, { file_name: 1, file_path: 1, uploaded_date: 1, _id: 0 })
                .sort({ uploaded_date: -1 });
            // Fetch images from allNews model
            const newsImages = await allNews.find({}, { post_image: 1, update_date: 1, _id: 0 })
                .sort({ update_date: -1 });
            // Format news images properly
            const formattedNewsImages = newsImages.map(img => ({
                file_name: img.post_image.split('/').pop(), // Extract file name
                file_path: img.post_image, // Already stored path
                uploaded_date: img.update_date
            }));
            // Merge both image sources
            const allImages = [...imageGallery, ...formattedNewsImages];
            // Sort all images by upload date (latest first)
            allImages.sort((a, b) => new Date(b.uploaded_date) - new Date(a.uploaded_date));
            // Paginate results
            const totalImages = allImages.length;
            const totalPages = Math.ceil(totalImages / limit);
            const paginatedImages = allImages.slice(skip, skip + limit);
            res.status(200).json({
                currentPage: page,
                totalPages,
                totalImages,
                images: paginatedImages
            });

        } catch (error) {
            console.error("Image Gallery Error:", error);
            res.status(500).json({ message: "Server Error", error: error.message });
        }
    };


    //Add News by Admin User for Particular Domain
    exports.AddNewsAdmin = async (req, res) => {
        try {
          if (!req.file) {
            return res.status(400).json({ message: 'Image file is required' });
          }
      
          const filePath = "/uploads/news/" + req.file.filename;
      
          const { post_name,post_description,post_content,post_keyword,post_category,meta_tags,author_key,author_name,domain_owner,domain_key,domain_name,top_news,
            editorial_news,
            headline_news,
            breaking_news,
            optional_1,
            optional_2,
            optional_3,
            optional_4,
            image_source,
            post_status,
          } = req.body;
      
          const purl = post_name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      
          const newNews = new AiNewsModel({
            post_name,
            post_url: purl,
            post_description,
            post_content,
            post_keyword,
            post_category,
            post_image: filePath,
            meta_tags,
            author_key,
            author_name,
            post_status,
            domain_owner,
            domain_key,
            domain_name,
            top_news,
            editorial_news,
            headline_news,
            breaking_news,
            optional_1,
            optional_2,
            optional_3,
            optional_4,
            image_source,
            update_date: new Date(),
          });
          await newNews.save();
	  try {
            await axios.post('https://kokthum.com/send', {
                title: `📰 ${post_name}`,
                message: post_description || 'A new post just dropped!', 
                //message: post_description ' | Click to Read More', 
                url: `https://kokthum.com/${post_category}/${purl}`
            });
          } catch (error) {
              console.error('Error sending notification:', error);
              // Continue execution even if notification fails
          }
          return res.status(200).json({ message: 'News posted successfully' });
        } catch (err) {
          console.error('AddNewsAdmin Error:', err);
          return res.status(500).json({ message: 'Failed to save news', error: err.message });
        }
    };


    exports.uploadDocument = async (req, res) => {
    req.uploadMiddleware(req, res, async (err) => {

        

        try {
            const { saasAPI } = req.body;

        if (!saasAPI) {
        return res.status(400).json({ message: 'Missing saasAPI key in request body' });
        }

        // Fetch SaaS user based on saasAPI
        const getAPI = await SaasUserModel.findOne({ saas_api: saasAPI });

        if (!getAPI) {
        return res.status(404).json({ message: 'Invalid saasAPI or user not found' });
        }

        console.log(getAPI);

        if (err) {
        return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = `/uploads/documents/${req.file.filename}`;

        // Insert into the database
        const newDocument = new DocumentModel({
            file_name: req.file.originalname,
            file_path: filePath,
            domain_owner: getAPI.saas_user,
            domain_key: getAPI.saas_api,
            domain_name: getAPI.saas_domain,
            uploaded_date: new Date(),
        });

        await newDocument.save();

        res.status(200).json({
            message: 'File uploaded successfully',
            filePath,
        });

        } catch (dbError) {
        console.error('Database Insertion Error:', dbError);
        res.status(500).json({ message: 'Failed to save document info', error: dbError.message });
        }
    });
    };

    exports.getDocuments = async (req, res) => {
        try {

            const APIKEY = req.query.key;
            if (!APIKEY) {
                return res.status(400).json({ message: 'Missing saasAPI key in request body' });
            }
            // Fetch SaaS user based on saasAPI
            const getAPI = await SaasUserModel.findOne({ saas_api: APIKEY });
            if (!getAPI) {
            return res.status(404).json({ message: 'Invalid saasAPI or user not found' });
            }

          const documents = await DocumentModel.find({domain_key: getAPI.saas_api}).sort({ uploaded_date: -1 }); // Sort by latest uploaded
          res.status(200).json({
            message: 'Documents fetched successfully',
            documents,
          });
        } catch (error) {
          console.error('Fetch Documents Error:', error);
          res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
        }
      };


      
      exports.deleteDocument = async (req, res) => {
        try {
          const document = await DocumentModel.findById(req.params.id);
      
          if (!document) {
            return res.status(404).json({ message: 'Document not found' });
          }
      
          // Corrected file path using `path.join` (ensuring it points to the correct directory)
          const filePath = path.join(__dirname, '..', 'public', document.file_path);
      
          // Check if file exists before attempting to delete
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, async (err) => {
              if (err) {
                console.error('File Deletion Error:', err);
                return res.status(500).json({ message: 'Failed to delete file from storage' });
              }
      
              // Delete document record from DB
              await DocumentModel.findByIdAndDelete(req.params.id);
              return res.status(200).json({ message: 'Document deleted successfully' });
            });
          } else {
            console.warn('File not found in storage, deleting only from DB');
            await DocumentModel.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: 'Document record deleted (file was already missing)' });
          }
      
        } catch (error) {
          console.error('Delete Document Error:', error);
          res.status(500).json({ message: 'Failed to delete document', error: error.message });
        }
      };


    exports.uploadImage = async (req, res) => {
    try {

        const { saasAPI } = req.body;

        if (!saasAPI) {
        return res.status(400).json({ message: 'Missing saasAPI key in request body' });
        }

        // Fetch SaaS user based on saasAPI
        const getAPI = await SaasUserModel.findOne({ saas_api: saasAPI });

        if (!getAPI) {
        return res.status(404).json({ message: 'Invalid saasAPI or user not found' });
        }
        
        if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded' });
        }

        const filePath = `/uploads/images/${req.file.filename}`;

        

        console.log(getAPI.saas_api);

        // Save image details to the database
        const newImage = new ImageModel({
        file_name: req.file.filename,
        file_path: filePath,
        domain_owner: getAPI.saas_user,
        domain_key: getAPI.saas_api,
        domain_name: getAPI.saas_domain,
        });

        await newImage.save();

        return res.status(200).json({
        message: 'Image uploaded successfully',
        fileUrl: filePath // URL to access the image
        });

    } catch (error) {
        console.error('Upload Image Error:', error);
        return res.status(500).json({ message: 'Failed to upload image', error: error.message });
    }
    };


    exports.generateAINews = async(req, res) => {
    try {
        const { prompt, title, category } = req.body;

        if (!prompt || !title) {
            return res.status(400).json({ message: "Prompt and title are required" });
        }

        // ChatGPT API request
        const chatGptResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [
                    { role: "system", content: "You are a news content generator. Generate well-structured and SEO-friendly news articles." },
                    { role: "user", content: `Generate a news article on "${title}" in the "${category}" category. Details: ${prompt}` }
                ],
                max_tokens: 500
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Extract AI-generated content
        const generatedContent = chatGptResponse.data.choices[0]?.message?.content || "No content generated.";

        // Generate description and tags separately
        const descriptionResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [
                    { role: "system", content: "You are an SEO expert. Summarize the given news content into a brief description." },
                    { role: "user", content: `Summarize this news: ${generatedContent}` }
                ],
                max_tokens: 100
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const description = descriptionResponse.data.choices[0]?.message?.content || "";

        const tagsResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [
                    { role: "system", content: "You are an SEO specialist. Generate relevant keyword tags for the following news article." },
                    { role: "user", content: `Generate SEO tags for this news: ${generatedContent}` }
                ],
                max_tokens: 50
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const suggestedTags = tagsResponse.data.choices[0]?.message?.content.split(',').map(tag => tag.trim());

        return res.status(200).json({
            content: generatedContent,
            description: description,
            suggestedTags: suggestedTags
        });

        } catch (error) {
            console.error("Error generating news content:", error);
            res.status(500).json({ message: "Failed to generate content", error: error.message });
        }
    }

   

    exports.generateContent = async (req, res) => {
    const { prompt, title, category } = req.body;

    if (!prompt || !title) {
        return res.status(400).json({ message: "Prompt and title are required" });
    }

    try {
        const fullPrompt = `
        Generate a news article with the following:
        Title: ${title}
        Category: ${category}
        Prompt: ${prompt}
        Return content in the following JSON format:
        {
            "description": "short summary",
            "content": "full article",
            "suggestedTags": ["tag1", "tag2", "tag3"]
        }
        `;

        const chatResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: fullPrompt }],
        temperature: 0.7,
        });

        const rawText = chatResponse.choices[0].message.content.trim();

        let generated;
        try {
        generated = JSON.parse(rawText);
        } catch (jsonErr) {
        // Try to extract JSON from within a string
        const match = rawText.match(/\{[\s\S]*\}/);
        generated = match ? JSON.parse(match[0]) : null;
        }

        if (!generated) {
        return res.status(500).json({ message: 'Failed to parse AI response.' });
        }

        res.status(200).json(generated);
    } catch (err) {
        console.error('Content Generation Error:', err.message);
        res.status(500).json({ message: 'Content generation failed', error: err.message });
    }
    };



    exports.generateContentGroq = async (req, res) => {
      const { prompt, title, category } = req.body;
    
      if (!prompt || !title) {
        return res.status(400).json({ message: 'Prompt and title are required.' });
      }
    
      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama3-8b-8192',
            messages: [
              {
                role: 'system',
                content: `You are an expert SEO-focused content writer. When given a prompt, title, and category, generate a professional blog/news article with the following output:
                
    1. An SEO-friendly title (max 70 characters)
    2. A short description/summary (max 160 characters)
    3. 5–10 SEO-optimized tags
    4. A list of Google SEO keywords
    5. A long-form content body (at least 700 words), well-structured with headings if needed.
    
    Format the response strictly in JSON:
    {
      "seoTitle": "",
      "description": "",
      "tags": [],
      "keywords": [],
      "content": ""
    }`
              },
              {
                role: 'user',
                content: `Title: ${title}\nCategory: ${category}\nPrompt: ${prompt}`
              }
            ],
            temperature: 0.7,
            max_tokens: 2048
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`, // Make sure you store the key in .env
              'Content-Type': 'application/json'
            }
          }
        );
    
        const message = response.data.choices[0].message.content;
    
        let parsed;
        try {
          parsed = JSON.parse(message);
        } catch (err) {
          console.error('Parsing Error - Fallback to regex parsing');
          // Fallback regex extraction if JSON parse fails
          parsed = {
            seoTitle: message.match(/"seoTitle"\s*:\s*"([^"]+)"/)?.[1] || title,
            description: message.match(/"description"\s*:\s*"([^"]+)"/)?.[1] || '',
            tags: message.match(/"tags"\s*:\s*\[([^\]]+)\]/)?.[1]?.split(',').map(tag => tag.replace(/["']/g, '').trim()) || [],
            keywords: message.match(/"keywords"\s*:\s*\[([^\]]+)\]/)?.[1]?.split(',').map(k => k.replace(/["']/g, '').trim()) || [],
            content: message.match(/"content"\s*:\s*"([\s\S]+?)"(\s*[}\n])/i)?.[1]?.replace(/\\"/g, '"') || message
          };
        }
    
        res.status(200).json({
          content: parsed.content,
          description: parsed.description,
          suggestedTitle: parsed.seoTitle,
          suggestedTags: parsed.tags,
          keyword: parsed.suggestedKeywords
        });
    
      } catch (error) {
        console.error('Groq Content Generation Error:', error?.response?.data || error.message);
        res.status(500).json({
          message: 'Content generation failed using Groq',
          error: error?.response?.data || error.message
        });
      }
    };
    


exports.generateContentFromDeepSeek = async (req, res) => {
  const { prompt, title, category } = req.body;

  if (!prompt || !title || !category) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const deepSeekResponse = await axios.post(
      'https://api.deepseek.com/v1/chat/completions', // Replace with correct endpoint if needed
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert news writer. Write well-structured news content based on the user\'s topic.'
          },
          {
            role: 'user',
            content: `Title: ${title}\nCategory: ${category}\nPrompt: ${prompt}\n\nPlease generate the following:\n1. Full news content\n2. A short description/summary\n3. 5 relevant hashtags or SEO tags`
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = deepSeekResponse.data.choices[0].message.content;

    // Use simple regex or prompt structure to split response
    const contentMatch = reply.match(/1\. Full news content(?:\:)?\n([\s\S]*?)\n2\./);
    const descriptionMatch = reply.match(/2\. A short description(?:\:)?\n([\s\S]*?)\n3\./);
    const tagsMatch = reply.match(/3\. 5 relevant hashtags or SEO tags(?:\:)?\n([\s\S]*)/);

    const content = contentMatch ? contentMatch[1].trim() : '';
    const description = descriptionMatch ? descriptionMatch[1].trim() : '';
    const suggestedTags = tagsMatch ? tagsMatch[1].trim().split(/[,#\n]+/).map(tag => tag.trim()).filter(tag => tag) : [];

    return res.status(200).json({
      content,
      description,
      suggestedTags
    });

  } catch (error) {
    console.error('DeepSeek Content Generation Error:', error.message);
    return res.status(500).json({ message: 'Failed to generate content', error: error.message });
  }
};




exports.saasUserCreate = async (req, res) => {
  try {
    const {
      saas_user,
      saas_email,
      saas_phone,
      saas_country,
      saas_company_name,
      saas_domain,
      saas_password,
    } = req.body;

    if (!saas_user || !saas_email || !saas_password) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Check if email or domain already exists
    const existingUser = await SaasUserModel.findOne({ 
      $or: [{ saas_email }, { saas_domain }] 
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email or domain already exists' });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(saas_password, 10);

    // Generate API key and SaaS key
    const saas_api = crypto.randomBytes(24).toString('hex'); // 48 chars
    const saas_key = crypto.randomBytes(16).toString('hex'); // 32 chars
    const createdat = new Date().toISOString();

    const newUser = new SaasUserModel({
      saas_user,
      saas_email,
      saas_phone,
      saas_country,
      saas_company_name,
      saas_domain,
      saas_password: hashedPassword,
      saas_api,
      saas_verify: '0958',
      saas_key,
      createdat,
    });

    await newUser.save();

    return res.status(201).json({
      message: 'SaaS user created successfully',
      data: {
        saas_user,
        saas_email,
        saas_domain,
        saas_api,
        saas_key,
        createdat,
      },
    });
  } catch (err) {   
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

    exports.saasUserList = async (req, res) => {
        try {
        // Fetch all users (you can add pagination or filters later)
        const users = await SaasUserModel.find({}, '-saas_password'); // exclude password field
    
        return res.status(200).json({
            message: 'SaaS users fetched successfully',
            count: users.length,
            data: users,
        });
        } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error while fetching users' });
        }
    };




    exports.saasUserVerify = async (req, res) => {
      try {
        const { saas_email, verification_code } = req.body;
    
        if (!saas_email || !verification_code) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
    
        // Find user by email
        const user = await SaasUserModel.findOne({ saas_email });
    
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        console.log(user.saas_verify);
        console.log(verification_code);
        // Compare verification_code with saas_verify field
        if (verification_code !== user.saas_verify) {
          return res.status(401).json({ message: 'Invalid verification code' });
        }
    
        // Set saas_verify to 'true'
        user.saas_verify = 'true';
        await user.save();
    
        return res.status(200).json({
          message: 'User verified successfully',
          data: {
            saas_email: user.saas_email,
            saas_verify: user.saas_verify,
          },
        });
    
      } catch (err) {
        console.error('Verification error:', err);
        return res.status(500).json({ message: 'Server error during verification' });
      }
    };





    exports.saasUserAuth = async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await SaasUserModel.findOne({ saas_email: email });

            if (!user) {
            return res.status(401).json({ message: 'User not found' });
            }
            // Compare bcrypt hash
            const isPasswordValid = await bcrypt.compare(password, user.saas_password);
            if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
            { 
                email: user.saas_email,
                id: user._id,
                saas_user: user.saas_user,   // Include username
                saas_api: user.saas_api,
                saas_domain: user.saas_domain
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
            );

            res.status(200).json({
                message: 'Login successful',
                token,
                saas_user: user.saas_user,     // Username
                saas_email: user.saas_email,
                saas_api: user.saas_api,
                saas_key: user.saas_key,
                saas_domain: user.saas_domain
            });
            
        } catch (err) {
            console.error('Auth error:', err);
            res.status(500).json({ message: 'Server error during login' });
        }
    };


    



    //FOR AUTHOR CONTROLLER
    
    
    exports.authorLogin = async (req, res) => {
      try {
        const { login_id, password } = req.body;
        // 1. Validate input
        if (!login_id || !password) {
          return res.status(400).json({ message: 'login_id and password are required' });
        }
    
        // 2. Find user
        const author = await AuthorModel.findOne({ login_id });
    
        if (!author || author.password !== password) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
    
        // 3. Generate JWT
        const token = jwt.sign(
          {
            id: author._id,
            login_id: author.login_id,
            name: author.user_name,
            authorKey: author.author_code,
            author_domain_owner: author.domain_owner,   // Include username
            author_domain_key: author.domain_key,
            author_domain_name: author.domain_name,
            role: 'author',
          },
          JWT_SECRET,
          { expiresIn: '1d' }
        );    
        // 4. Respond with token
        return res.status(200).json({
          message: 'Login successful',
          token,
          author: {
            id: author._id,
            name: author.user_name,
            authorKey: author.author_code,
            login_id: author.login_id,
            author_domain_owner: author.domain_owner,   // Include username
            author_domain_key: author.domain_key,
            author_domain_name: author.domain_name
          },
        });
    
      } catch (error) {
        console.error('Author Login Error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
      }
    };

/*
    exports.getAuthorArticles = async(req, res) => {
       
        try {
            const page = parseInt(req.query.page) || 1;
            const KEY = req.query.key;
            const authorKey = req.query.authorKey;
            const limit = 20;
            const skip = (page - 1) * limit;

            const totalPosts = await AiNewsModel.countDocuments();
            const totalPages = Math.ceil(totalPosts / limit);

            const dashAllNews = await AiNewsModel.find({domain_key: KEY, author_key:authorKey})
                .sort({ update_date: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
            console.log(dashAllNews);
            res.json({
                success: true,
                data: {
                    news: dashAllNews,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalPosts,
                        limit,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1,
                        nextPage: page + 1,
                        prevPage: page - 1
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || "Error fetching news list"
            });
        }
    }

*/
    exports.getVerifyContent = async (req, res) => {
        try {
          const { key } = req.query;
          const page = parseInt(req.query.page) || 1;
          const limit = parseInt(req.query.limit) || 10;
          const skip = (page - 1) * limit;
      
          if (!key) {
            return res.status(400).json({ message: 'Missing domain key' });
          }
      
          // 1. Fetch total count
          const total = await AiNewsModel.countDocuments({
            domain_key: key,
            post_status: 'Draft',
          });
      
          // 2. Fetch paginated data
          const getNews = await AiNewsModel.find({
            domain_key: key,
            post_status: 'Draft',
          })
            .sort({ update_date: -1 }) // latest first
            .skip(skip)
            .limit(limit)
            .lean();
      
          // 3. Return response
          return res.status(200).json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            news: getNews,
          });
        } catch (error) {
          console.error('Error in getVerifyContent:', error);
          return res.status(500).json({ message: 'Server error', error: error.message });
        }
      };

exports.getAuthorArticles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const KEY = req.query.key;
        const authorKey = req.query.authorKey;
        const limit = 20;
        const skip = (page - 1) * limit;

        // Apply filters to count only posts by that author under the domain
        const filter = { domain_key: KEY, author_key: authorKey };

        const totalPosts = await AiNewsModel.countDocuments(filter);
        const totalPages = Math.ceil(totalPosts / limit);

        const dashAllNews = await AiNewsModel.find(filter)
            .sort({ update_date: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({
            success: true,
            data: {
                news: dashAllNews,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalPosts,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                    nextPage: page + 1,
                    prevPage: page - 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || "Error fetching news list"
        });
    }
}


        exports.approveNews = async (req, res) => {
        try {
            const { id } = req.params;

            const updated = await AiNewsModel.findByIdAndUpdate(
            id,
            { post_status: 'Published', update_date: new Date() },
            { new: true }
            );

            if (!updated) {
            return res.status(404).json({ message: 'News post not found' });
            }

            return res.status(200).json({
            message: 'News post approved successfully',
            data: updated,
            });
        } catch (error) {
            console.error('Approve News Error:', error);
            return res.status(500).json({ message: 'Failed to approve news post', error: error.message });
        }
        };


        // controllers/adminController.js

    exports.getSingleNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { key } = req.query;

        if (!key) {
        return res.status(400).json({ message: 'Missing saasAPI key' });
        }

        // Validate SaaS key
        const saasUser = await SaasUserModel.findOne({ saas_api: key });
        if (!saasUser) {
        return res.status(401).json({ message: 'Invalid saasAPI key' });
        }

        // Fetch news item
        const news = await AiNewsModel.findOne({
        _id: id,
        domain_key: saasUser.saas_api, // ensure only from the right tenant
        }).lean();

        if (!news) {
        return res.status(404).json({ message: 'News not found' });
        }

        return res.status(200).json({
        message: 'News fetched successfully',
        data: news,
        });
    } catch (error) {
        console.error('Get Single News Error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
    };



exports.updateNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const saasAPI = req.query.key;

    if (!saasAPI) {
      return res.status(400).json({ message: "Missing SaaS API key" });
    }

    // Fetch existing news item
    const existingNews = await AiNewsModel.findOne({ _id: id, domain_key: saasAPI });

    if (!existingNews) {
      return res.status(404).json({ message: "News not found" });
    }

    // Handle image: retain old image if new one not uploaded
    const filePath = req.file
      ? "/uploads/news/" + req.file.filename
      : existingNews.post_image;

    // Get updated fields from body
    const {
      post_name,
      post_description,
      post_content,
      post_keyword,
      post_category,
      meta_tags,
      author_key,
      author_name,
      post_status,
      domain_owner,
      domain_key,
      domain_name,
      top_news,
      editorial_news,
      headline_news,
      breaking_news,
      optional_1,
      optional_2,
      optional_3,
      optional_4,
      image_source
    } = req.body;

    // Generate slug safely
    const purl = post_name
      ? post_name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")
      : existingNews.post_url;

    // Update the news
    await AiNewsModel.findByIdAndUpdate(
      id,
      {
        post_name: post_name ?? existingNews.post_name,
        post_url: purl,
        post_description,
        post_content,
        post_keyword,
        post_category,
        post_image: filePath,
        meta_tags,
        author_key,
        author_name,
        post_status,
        domain_owner,
        domain_key,
        domain_name,
        top_news,
        editorial_news,
        headline_news,
        breaking_news,
        optional_1,
        optional_2,
        optional_3,
        optional_4,
        image_source,
        update_date: new Date()
      },
      { new: true }
    );

    return res.status(200).json({ message: "News updated successfully" });
  } catch (err) {
    console.error("UpdateNewsById Error:", err);
    return res.status(500).json({ message: "Failed to update news", error: err.message });
  }
};



exports.deleteNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const { key } = req.query;

    if (!id || !key) {
      return res.status(400).json({ message: "Missing news ID or SaaS API key" });
    }

    const news = await AiNewsModel.findOne({ _id: id, domain_key: key });

    if (!news) {
      return res.status(404).json({ message: "News not found or unauthorized access" });
    }

    await AiNewsModel.deleteOne({ _id: id });

    return res.status(200).json({ message: "News deleted successfully" });
  } catch (err) {
    console.error("DeleteNewsById Error:", err);
    return res.status(500).json({ message: "Failed to delete news", error: err.message });
  }
};


      


      
    







exports.MigrateOldNews = async (req, res) => {
  try {
    const oldApiUrl = 'http://localhost:4000/api/allnews/get'; // Replace with actual

    const { data } = await axios.get(oldApiUrl);
    const oldNewsData = data.data || [];

    if (!Array.isArray(oldNewsData) || oldNewsData.length === 0) {
      return res.status(404).json({ message: 'No news found from old API' });
    }

    // Converts titles to URL-safe slugs
    const slugify = (text) =>
      text.toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');

    // Maps author name to ID
    const getAuthorKey = (name = '') => {
      switch (name.trim()) {
        case 'Gobin Debbarma':
          return '36WQGP';
        case 'Victoria Jamatia':
          return 'JNTGGQ';
        case 'Tapas Kumar Das':
          return 'HMVPTE';
        default:
          return '36WQGP';
      }
    };

    // Formats post_image to local path
    const formatImagePath = (url = '') => {
      if (!url) return '';
      try {
        const filename = url.split('/').pop();
        return `/uploads/news/${filename}`;
      } catch {
        return '';
      }
    };

    const results = [];

    for (const item of oldNewsData) {
      try {
        const purl = slugify(item.post_name || 'untitled');
        const authorName = item.author || 'Gobin Debbarma';
        const authorKey = getAuthorKey(authorName);
        const formattedImage = formatImagePath(item.post_image);

        const newNews = new AiNewsModel({
          post_name: item.post_name?.trim() || '',
          post_url: item.post_url,
          post_description: item.post_summary || '',
          post_content: item.post_content || '',
          post_keyword: item.post_keyword || '',
          post_category: item.post_category || '',
          post_image: formattedImage,
          meta_tags: item.meta_tags || '',
          author_key: authorKey,
          author_name: authorName,
          domain_owner: 'Gobin Debbarma',
          domain_key: 'dab9b6b01e50a61263edb17ad6df180a8089329767d6638e',
          domain_name: 'kokthum.com',
          top_news: '',
          editorial_news: '',
          headline_news: '',
          breaking_news: '',
          optional_1: '',
          optional_2: '',
          optional_3: '',
          optional_4: '',
          post_status: 'Published',
          update_date: item.update_date,
        });

        await newNews.save();
        results.push({ post_name: item.post_name, status: 'success' });
      } catch (err) {
        results.push({ post_name: item.post_name, status: 'failed', error: err.message });
      }
    }

    return res.status(200).json({
      message: 'Migration completed',
      total_migrated: results.length,
      results,
    });

  } catch (err) {
    console.error('Migration Error:', err);
    return res.status(500).json({ message: 'Failed to migrate data', error: err.message });
  }
};


exports.updateAuthorAI = async (req, res) => {
    try {
        const authorId = req.params.id;
        const updatedData = req.body;
  
        // Optional: generateString for other use if needed
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        function generateString(length) {
            let result = '';
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        }
  
        updatedData.update_date = new Date();
  
        const updatedAuthor = await UserModel.findByIdAndUpdate(authorId, {
            $set: {
                user_mail: updatedData.user_mail,
                user_name: updatedData.user_name,
                user_role: updatedData.user_role,
                user_status: updatedData.user_status,
                user_pic: updatedData.user_pic,
                login_id: updatedData.login_id,
                password: updatedData.password,
                author_bio: updatedData.author_bio,
                facebook_link: updatedData.facebook_link,
                twitter_link: updatedData.twitter_link,
                instagram_link: updatedData.instagram_link,
                linkedin_link: updatedData.linkedin_link,
                tag_line: updatedData.tag_line,
                update_date: updatedData.update_date,
                // Do NOT update domain_owner, domain_key, or domain_name
            }
        }, { new: true });
  
        if (!updatedAuthor) {
            return res.status(404).json({ message: 'Author not found' });
        }
  
        res.status(200).json({ message: 'Author updated successfully', author: updatedAuthor });
  
    } catch (err) {
        console.error('Error updating author:', err);
        res.status(500).json({ message: 'Server error' });
    }
  };

  exports.deleteAuthorAI = async (req, res) => {
    try {
        const authorId = req.params.id;

        if (!authorId) {
            return res.status(400).json({ message: 'Author ID is required' });
        }

        const deletedAuthor = await UserModel.findByIdAndDelete(authorId);

        if (!deletedAuthor) {
            return res.status(404).json({ message: 'Author not found' });
        }

        res.status(200).json({ message: 'Author deleted successfully' });
    } catch (err) {
        console.error('Error deleting author:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Save subscription
exports.saveSubscription = async (req, res) => {
  try {
    const subscription = req.body;
    
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ 
        error: 'Invalid subscription format',
        details: 'Subscription must include endpoint and keys'
      });
    }

    // Check for existing subscription
    const existingSub = await Subscription.findOne({
      'subscription.endpoint': subscription.endpoint
    });

    if (existingSub) {
      // Update existing subscription
      existingSub.subscription = subscription;
      existingSub.lastUsed = new Date();
      existingSub.active = true;
      await existingSub.save();
      return res.status(200).json({ 
        success: true,
        message: 'Subscription updated successfully' 
      });
    }

    // Create new subscription
    const newSubscription = new Subscription({
      subscription,
      userAgent: req.headers['user-agent'],
      active: true,
      createdAt: new Date(),
      lastUsed: new Date()
    });

    await newSubscription.save();
    
    res.status(201).json({ 
      success: true,
      message: 'Subscription saved successfully',
      subscription: newSubscription
    });

  } catch (error) {
    console.error('Subscription save error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to save subscription',
      details: error.message 
    });
  }
};

// Send push notification
exports.sendNotification = async (req, res) => {
  const { title, message, url } = req.body;
  
  if (!title || !message) {
    return res.status(400).json({ 
      success: false,
      error: 'Title and message are required' 
    });
  }

  try {
    // Validate and format URL
    let targetUrl = url || 'https://kokthum.com';
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // Create notification payload
    const payload = JSON.stringify({
      title: title,
      body: message,
      icon: 'https://kokthum.com/images/kokthum.png',
      badge: 'https://kokthum.com/images/badge.png',
      url: targetUrl,
      timestamp: Date.now(),
      vibrate: [100, 50, 100],
      requireInteraction: true,
      data: {
        url: targetUrl,
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    });

    // Get all valid subscriptions
    const subscriptions = await Subscription.find({ active: true });
    console.log(`Found ${subscriptions.length} active subscriptions`);

    if (subscriptions.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No active subscriptions found' 
      });
    }

    const results = {
      success: 0,
      failed: 0,
      invalidSubscriptions: 0,
      errors: []
    };

    // Send notifications to all subscribers
    const notificationPromises = subscriptions.map(async (sub) => {
      try {
        if (!sub.subscription || !sub.subscription.endpoint) {
          results.invalidSubscriptions++;
          await Subscription.findByIdAndDelete(sub._id);
          return;
        }

        await webpush.sendNotification(sub.subscription, payload);
        results.success++;
        
        // Update last used timestamp
        await Subscription.findByIdAndUpdate(sub._id, {
          lastUsed: new Date(),
          active: true
        });

      } catch (error) {
        results.failed++;
        results.errors.push({
          endpoint: sub.subscription?.endpoint,
          error: error.message,
          statusCode: error.statusCode
        });

        // Handle expired or invalid subscriptions
        if (error.statusCode === 404 || error.statusCode === 410) {
          await Subscription.findByIdAndDelete(sub._id);
          results.invalidSubscriptions++;
        }
      }
    });

    // Wait for all notifications to be processed
    await Promise.all(notificationPromises);

    // Clean up old subscriptions
    await Subscription.cleanupInactive();

    return res.status(200).json({
      success: true,
      message: 'Push notification process completed',
      results: {
        total: subscriptions.length,
        successful: results.success,
        failed: results.failed,
        invalidSubscriptions: results.invalidSubscriptions,
        errors: results.errors
      }
    });

  } catch (error) {
    console.error('Fatal error in push notification process:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process notifications',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.AutoMaticNewsHindustanTimes = async (req, res) => {
    try {
        const { url, hcategory } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Fetch the webpage content
        const response = await axios.get(url);
        const htmlContent = response.data;

        // Extract JSON-LD data with improved regex and cleanup
        const jsonLdMatch = htmlContent.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g);
        if (!jsonLdMatch) {
            return res.status(400).json({ error: 'No JSON-LD data found' });
        }

        // Find the NewsArticle JSON-LD block
        let newsData = null;
        for (const block of jsonLdMatch) {
            const jsonContent = block
                .replace(/<script type="application\/ld\+json">/, '')
                .replace(/<\/script>/, '')
                .replace(/\s+/g, ' ')
                .trim()
                .replace(/`/g, '"');

            try {
                const parsedData = JSON.parse(jsonContent);
                if (parsedData['@type'] === 'NewsArticle') {
                    newsData = parsedData;
                    break;
                }
            } catch (parseError) {
                console.error('Error parsing JSON-LD block:', parseError);
                continue;
            }
        }

        if (!newsData) {
            return res.status(400).json({ error: 'No valid NewsArticle JSON-LD data found' });
        }

        // Prepare prompt for rephrasing title and content
        const contentPrompt = {
            messages: [
                {
                    role: 'system',
                    content: `You are an expert news editor. Please rephrase:
                    1. The news title to be more engaging while maintaining accuracy (max 70 chars)
                    2. The article content to be more reader-friendly while preserving key facts
                    3. Ensure the tone matches news reporting standards
                    4. Maintain journalistic integrity and factual accuracy

                    Format response as JSON:
                    {
                        "title": "",
                        "article": ""
                    }`
                },
                {
                    role: 'user',
                    content: `Original Title: ${newsData.headline}
                    Original Article: ${newsData.articleBody}

                    Please rephrase both while keeping the core message intact.`
                }
            ],
            model: 'llama3-8b-8192',
            temperature: 0.6,
            max_tokens: 2048
        };

        // Make API call to get rephrased content
        const aiResponse = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            contentPrompt,
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Parse the rephrased content
        let parsed;
        try {
            parsed = JSON.parse(aiResponse.data.choices[0].message.content);
        } catch (err) {
            console.error('Failed to parse AI response - Using fallback extraction');
            // Fallback to regex extraction if JSON parse fails
            const content = aiResponse.data.choices[0].message.content;
            parsed = {
                title: content.match(/"title"\s*:\s*"([^"]+)"/)?.[1] || newsData.headline,
                article: content.match(/"article"\s*:\s*"([\s\S]+?)"(\s*[}\n])/i)?.[1]?.replace(/\\"/g, '"') || content
            };
        }

        // Clean up the rephrased content
        const rephrasedHeadline = parsed.title.trim();
        const rephrasedArticle = parsed.article.trim();
        
        const permalink = rephrasedHeadline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        // Download and save image if exists
        let localImagePath = null;
        if (newsData.image?.url) {
            try {
                const imageUrl = newsData.image.url;
                const imageResponse = await axios({
                    url: imageUrl,
                    responseType: 'arraybuffer'
                });

                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
                const imagePath = path.join('public/uploads/news', fileName);

                await fs.promises.mkdir(path.dirname(imagePath), { recursive: true });
                await fs.promises.writeFile(imagePath, imageResponse.data);
                localImagePath = `/uploads/news/${fileName}`;
            } catch (imageError) {
                console.error('Error downloading image:', imageError);
            }
        }

        // Create a new news entry with rephrased content
        const newsEntry = new AiNewsModel({
            post_name: rephrasedHeadline,
            post_url: permalink,
            post_description: newsData.description || '',
            post_content: rephrasedArticle,
            post_keyword: newsData.keywords || [],
            post_category: hcategory === 'india' ? 'national' : (hcategory || 'General'),
            post_image: localImagePath,
            image_source: 'Internet',
            meta_tags:hcategory,
            author_name: 'News Desk',
            author_key: '5146PA',
            post_status: 'active',
            domain_owner: 'Gobin Debbarma',
            domain_key: 'dab9b6b01e50a61263edb17ad6df180a8089329767d6638e',
            domain_name: 'kokthum.com',
            top_news: 'no',
            editorial_news: 'no',
            breaking_news: 'no',
            headline_news: 'no',
            optional_1: newsData.headline,
            optional_2: 'No',
            optional_3: 'No',
            optional_4: 'No',
            update_date: new Date().toISOString(),
        });

        await newsEntry.save();

        return res.status(200).json({
            success: true,
            message: 'News article saved successfully',
            data: newsEntry
        });

    } catch (error) {
        console.error('Error in AutoMaticNewsHindustanTimes:', error);
        return res.status(500).json({
            success: false,
            message: 'Error processing news article',
            error: error.message
        });
    }
};

/*
exports.IBNSAutomation = async (req, res) => {
  try {
    // Fetch news from indiablooms API
    const response = await axios.get('https://www.indiablooms.com/feeds/json/news');
    
    // Validate API response
    if (!response.data || !response.data.news) {
      throw new Error('Invalid API response structure');
    }

    const newsData = response.data.news;
    let processedCount = 0;
    let errorCount = 0;

    // Process all categories of news dynamically
    const categories = Object.keys(newsData);
    console.log(`Found categories: ${categories.join(', ')}`);
    
    for (const category of categories) {
      if (!newsData[category] || !Array.isArray(newsData[category])) {
        console.log(`Skipping ${category} - not an array or empty`);
        continue;
      }
      
      console.log(`Processing ${newsData[category].length} items from ${category} category`);

      // Process each news item in the category
      for (const item of newsData[category]) {
        try {
          // Validate required fields (updated based on actual API response)
          if (!item.title || !item.content || !item.description) {
            console.warn(`Skipping item ${item.id} - missing required fields`);
            continue;
          }

          // Check if news already exists
          const existingNews = await AiNewsModel.findOne({
            $or: [
              { optional_1: item.id.toString() },
              { post_name: { $regex: item.title, $options: 'i' } }
            ]
          });

          if (existingNews) {
            console.log(`Skipping duplicate news: ${item.title}`);
            continue;
          }

          // Use OpenAI to rephrase title and content
          const contentPrompt = {
            messages: [
              {
                role: 'system',
                content: `You are an expert news editor. Please rephrase:\n1. The news title to be more engaging while maintaining accuracy (max 70 chars)\n2. The article content to be more reader-friendly while preserving key facts\n3. Ensure the tone matches news reporting standards\n4. Maintain journalistic integrity and factual accuracy\n\nFormat response as JSON:\n{\n    "title": "",\n    "article": ""\n}`
              },
              {
                role: 'user',
                content: `Original Title: ${item.title}\nOriginal Article: ${item.content}\n\nPlease rephrase both while keeping the core message intact.`
              }
            ],
            model: 'llama3-8b-8192',
            temperature: 0.6,
            max_tokens: 2048
          };

          // Make API call to get rephrased content
          const aiResponse = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            contentPrompt,
            {
              headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!aiResponse.data?.choices?.[0]?.message?.content) {
            throw new Error('Invalid AI response format');
          }

          // Parse the rephrased content
          let parsed;
          try {
            parsed = JSON.parse(aiResponse.data.choices[0].message.content);
            if (!parsed.title || !parsed.article) {
              throw new Error('Missing required fields in AI response');
            }
          } catch (err) {
            console.error('Failed to parse AI response - Using fallback extraction');
            const content = aiResponse.data.choices[0].message.content;
            parsed = {
              title: content.match(/"title"\s*:\s*"([^"]+)"/)?.[1] || item.title,
              article: content.match(/"article"\s*:\s*"([\s\S]+?)"(\s*[}\n])/i)?.[1]?.replace(/\\"/g, '"') || content
            };
          }

          const rephrasedTitle = parsed.title.trim();
          const rephrasedContent = parsed.article.trim();

          if (!rephrasedTitle || !rephrasedContent) {
            throw new Error('Empty title or content after processing');
          }

          // Create URL-friendly slug from title
          const postUrl = rephrasedTitle
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');

          // Download and save image (updated field name from 'image' to 'imageName')
          let imagePath = '';
          if (item.imageName) {
            try {
              const imageResponse = await axios({
                url: item.imageName,
                responseType: 'arraybuffer'
              });
              
              const fileName = `${Date.now()}-${path.basename(item.imageName)}`;
              const uploadPath = path.join(__dirname, '../../public/uploads/news', fileName);
              
              await fs.promises.mkdir(path.dirname(uploadPath), { recursive: true });
              await fs.promises.writeFile(uploadPath, imageResponse.data);
              imagePath = `/uploads/news/${fileName}`;
            } catch (imageError) {
              console.error('Error processing image:', imageError);
            }
          }

          // Clean HTML tags from description
          const cleanDescription = item.description.replace(/(<([^>]+)>)/gi, '');

          // Parse publishedAt date (format: "May 31, 2025")
          let publishedDate;
          try {
            publishedDate = moment(item.publishedAt, 'MMM DD, YYYY').toDate();
          } catch (dateError) {
            console.warn('Date parsing failed, using current date:', dateError);
            publishedDate = new Date();
          }

          // Save to database with proper field mapping
          const newsData = {
            post_name: rephrasedTitle,
            post_url: postUrl,
            post_content: rephrasedContent,
            post_description: cleanDescription,
            post_image: imagePath,
            post_category: item.category || category.toUpperCase(),
            post_status: '1',
            optional_1: item.id.toString(),
            update_date: moment().format('lll'),
            published_date: publishedDate,
            domain_name: process.env.DOMAIN_NAME || '',
            domain_key: process.env.DOMAIN_KEY || '',
            author_name: 'IBNS',
            author_key: 'ibns'
          };

          // Create and save news
          const newNews = new AiNewsModel(newsData);
          await newNews.save();
          
          console.log(`Successfully saved ${category} news: ${rephrasedTitle}`);
          processedCount++;

        } catch (itemError) {
          console.error(`Error processing ${category} news item:`, itemError);
          errorCount++;
          continue;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `IBNS news processed. Success: ${processedCount}, Errors: ${errorCount}`,
      details: {
        processedCount,
        errorCount,
        categoriesProcessed: categories
      }
    });

  } catch (error) {
    console.error('Error in IBNS automation:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing IBNS news',
      error: error.message
    });
  }
}
*/


// Create Redis queue for processing news items
const newsProcessingQueue = new Queue('news processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    removeOnComplete: 10, // Keep last 10 completed jobs
    removeOnFail: 50,     // Keep last 50 failed jobs
    attempts: 3,          // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 5000,        // Start with 5 second delay
    },
  },
});

// Process jobs from the queue with rate limiting
newsProcessingQueue.process('process-news-item', 5, async (job) => { // Process max 5 jobs concurrently
  const { newsItem, category } = job.data;
  
  try {
    // Check if news already exists
    const existingNews = await AiNewsModel.findOne({
      $or: [
        { optional_1: newsItem.title },
        //{ post_name: { $regex: newsItem.title, $options: 'i' } }
      ]
    });

    if (existingNews) {
      return { skipped: true, reason: 'duplicate', title: newsItem.title };
    }

    // Add delay to prevent rate limiting (adjust based on your Groq API limits)
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between API calls

    // Use OpenAI to rephrase title and content
    const contentPrompt = {
      messages: [
        {
          role: 'system',
          content: `You are an expert news editor. Please rephrase:\n1. The news title to be more engaging while maintaining accuracy (max 70 chars)\n2. The article content to be more reader-friendly while preserving key facts\n3. Ensure the tone matches news reporting standards\n4. Maintain journalistic integrity and factual accuracy\n\nFormat response as JSON:\n{\n    "title": "",\n    "article": ""\n}`
        },
        {
          role: 'user',
          content: `Original Title: ${newsItem.title}\nOriginal Article: ${newsItem.content}\n\nPlease rephrase both while keeping the core message intact.`
        }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.6,
      max_tokens: 2048
    };

    // Make API call to get rephrased content with retry logic
    let aiResponse;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        aiResponse = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          contentPrompt,
          {
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
          }
        );
        break; // Success, exit retry loop
      } catch (apiError) {
        retryCount++;
        if (apiError.response && apiError.response.status === 429) {
          // Rate limit hit, wait longer before retry
          const waitTime = Math.pow(2, retryCount) * 5000; // Exponential backoff: 10s, 20s, 40s
          console.log(`Rate limit hit for ${newsItem.title}, waiting ${waitTime/1000}s before retry ${retryCount}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else if (retryCount >= maxRetries) {
          throw apiError;
        } else {
          // Other error, wait briefly before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    if (!aiResponse?.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid AI response format');
    }

    // Parse the rephrased content
    let parsed;
    try {
      parsed = JSON.parse(aiResponse.data.choices[0].message.content);
      if (!parsed.title || !parsed.article) {
        throw new Error('Missing required fields in AI response');
      }
    } catch (err) {
      console.error('Failed to parse AI response - Using fallback extraction');
      const content = aiResponse.data.choices[0].message.content;
      parsed = {
        title: content.match(/"title"\s*:\s*"([^"]+)"/)?.[1] || newsItem.title,
        article: content.match(/"article"\s*:\s*"([\s\S]+?)"(\s*[}\n])/i)?.[1]?.replace(/\\"/g, '"') || content
      };
    }

    const rephrasedTitle = parsed.title.trim();
    const rephrasedContent = parsed.article.trim();

    if (!rephrasedTitle || !rephrasedContent) {
      throw new Error('Empty title or content after processing');
    }

    // Create URL-friendly slug from title
    const postUrl = rephrasedTitle
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    // Download and save image
    let imagePath = '';
    if (newsItem.imageName) {
      try {
        const imageResponse = await axios({
          url: newsItem.imageName,
          responseType: 'arraybuffer',
          timeout: 10000 // 10 second timeout for images
        });
        
        const fileName = `${Date.now()}-${path.basename(newsItem.imageName)}`;
        const uploadPath = path.join(__dirname, '../../public/uploads/news', fileName);
        
        await fs.promises.mkdir(path.dirname(uploadPath), { recursive: true });
        await fs.promises.writeFile(uploadPath, imageResponse.data);
        imagePath = `/uploads/news/${fileName}`;
      } catch (imageError) {
        console.error('Error processing image:', imageError);
      }
    }

    // Clean HTML tags from description
    const cleanDescription = newsItem.description.replace(/(<([^>]+)>)/gi, '');

    // Parse publishedAt date
    let publishedDate;
    try {
      publishedDate = moment(newsItem.publishedAt, 'MMM DD, YYYY').toDate();
    } catch (dateError) {
      publishedDate = new Date();
    }

    // Save to database
    const newsData = {
      post_name: rephrasedTitle,
      post_url: postUrl,
      post_content: rephrasedContent,
      post_description: cleanDescription,
      post_image: imagePath,
      post_category: category === 'news' ? 'national' :
                     category === 'showbiz' ? 'entertainment' :
                     category === 'world' ? 'international' :
                     category || category.tolowercase(),
      image_source: 'Internet',
      optional_1: newsItem.title,
      post_keyword: rephrasedTitle,
      meta_tags: 'No Tags',
      author_name: 'News Desk',
      author_key: '5146PA',
      post_status: 'Active',
      domain_owner: 'Gobin Debbarma',
      domain_key: 'dab9b6b01e50a61263edb17ad6df180a8089329767d6638e',
      domain_name: 'kokthum.com',
      top_news: 'No',
      editorial_news: 'No',
      headline_news: 'No',
      breaking_news: 'No',
      optional_2: 'No',
      optional_3: 'No',
      optional_4: 'No',
      update_date: moment().format('lll'),
          
    };

    const newNews = new AiNewsModel(newsData);
    await newNews.save();
    
    return { 
      success: true, 
      title: rephrasedTitle, 
      category: category,
      id: newsItem.id 
    };

  } catch (error) {
    console.error(`Error processing news item ${newsItem.id}:`, error);
    throw error; // This will trigger job retry
  }
});

// Queue event listeners for monitoring
newsProcessingQueue.on('completed', (job, result) => {
  if (result.skipped) {
    console.log(`Skipped ${result.reason}: ${result.title}`);
  } else {
    console.log(`✅ Successfully processed: ${result.title} (${result.category})`);
  }
});

newsProcessingQueue.on('failed', (job, err) => {
  console.error(`❌ Failed to process job ${job.id}:`, err.message);
});

newsProcessingQueue.on('stalled', (job) => {
  console.warn(`⚠️ Job ${job.id} stalled and will be retried`);
});

// Main automation function
exports.IBNSAutomation = async (req, res) => {
  try {
    // Fetch news from indiablooms API
    const response = await axios.get('https://www.indiablooms.com/feeds/json/news');
    
    // Validate API response
    if (!response.data || !response.data.news) {
      throw new Error('Invalid API response structure');
    }

    const newsData = response.data.news;
    let queuedCount = 0;

    // Process all categories of news dynamically
    const categories = Object.keys(newsData);
    console.log(`Found categories: ${categories.join(', ')}`);
    
    for (const category of categories) {
      if (!newsData[category] || !Array.isArray(newsData[category])) {
        console.log(`Skipping ${category} - not an array or empty`);
        continue;
      }
      
      console.log(`Processing ${newsData[category].length} items from ${category} category`);

      // Add each news item to the queue
      for (const item of newsData[category]) {
        // Validate required fields
        if (!item.title || !item.content || !item.description) {
          console.warn(`Skipping item ${item.id} - missing required fields`);
          continue;
        }

        // Add job to queue with priority (you can adjust priority based on category)
        const priority = category === 'news' ? 1 : 2; // Higher priority for general news
        
        await newsProcessingQueue.add(
          'process-news-item',
          {
            newsItem: item,
            category: category
          },
          {
            priority: priority,
            delay: queuedCount * 1000, // Stagger job execution by 1 second each
          }
        );
        
        queuedCount++;
      }
    }

    // Get queue statistics
    const waiting = await newsProcessingQueue.getWaiting();
    const active = await newsProcessingQueue.getActive();
    const completed = await newsProcessingQueue.getCompleted();
    const failed = await newsProcessingQueue.getFailed();

    res.status(200).json({
      success: true,
      message: `IBNS news queued for processing`,
      details: {
        queuedCount,
        categoriesProcessed: categories,
        queueStats: {
          waiting: waiting.length,
          active: active.length,
          completed: completed.length,
          failed: failed.length
        }
      }
    });

  } catch (error) {
    console.error('Error in IBNS automation:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing IBNS news',
      error: error.message
    });
  }
};

// Optional: Function to get queue status
exports.getQueueStatus = async (req, res) => {
  try {
    const waiting = await newsProcessingQueue.getWaiting();
    const active = await newsProcessingQueue.getActive();
    const completed = await newsProcessingQueue.getCompleted();
    const failed = await newsProcessingQueue.getFailed();

    res.status(200).json({
      success: true,
      queueStats: {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Optional: Function to clear failed jobs
exports.clearFailedJobs = async (req, res) => {
  try {
    await newsProcessingQueue.clean(0, 'failed');
    res.status(200).json({
      success: true,
      message: 'Failed jobs cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

