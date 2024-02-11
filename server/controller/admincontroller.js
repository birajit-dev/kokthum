const { request } = require('express');
var express = require('express');
require('../model/database');
const allNews = require('../model/allnews');
const allPages = require('../model/allpage');
const adminData =  require('../model/login');
const breakingNews = require('../model/breakingnews');
const Ibns = require('../model/ibns');
const YouTube = require('../model/youtube');
const UserModel = require('../model/insideUser');
const MediaModel = require('../model/mediaLibrary');


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
var moment = require('moment'); // require


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
    

