const { request } = require('express');
var express = require('express');
require('../model/database');

const { resolve } = require('path');
const { all } = require('express/lib/application');
const { assert } = require('console');


const youtube = require('../model/youtube');
const allnews = require('../model/allnews');
const allNews = require('../model/allnews');
const pagekeyword = require('../model/pagekeyword');
const allPag = require('../model/allpage');
const breakingNews = require('../model/breakingnews');
const YouTube = require('../model/youtube');


        exports.homePage = async(req, res, next) => {
            try{
                //category
                const politics = await allNews.find({post_category:'national'}).sort({news_id:-1}).limit('5').lean();
                const education = await allNews.find({post_category:'national'}).sort({news_id:-1}).limit('5').lean();
                const culture = await allNews.find({post_category:'national'}).sort({news_id:-1}).limit('5').lean();
                const national = await allNews.find({post_category:'national'}).sort({news_id:-1}).limit('4').lean();

                //Three Segment
                const jobs_one = await allNews.find({post_category:'national'}).sort({news_id:-1}).limit('3').lean();
                const jobs_two = await allNews.find({post_category:'national'}).sort({news_id:-1}).skip('3').limit('3').lean();
                const jobs_three = await allNews.find({post_category:'national'}).sort({news_id:-1}).skip('6').limit('3').lean();

                //Four Segment Sports
                const sports_one = await allNews.find({post_category:'sports'}).sort({news_id:-1}).limit('3').lean();
                const sports_two = await allNews.find({post_category:'sports'}).sort({news_id:-1}).skip('3').limit('3').lean();
                
                
                // //Two Section
                // const sports = await allNews.find({post_category:'sports'}).sort({news_id:-1}).limit('3').lean();
                // const sport2 = await allNews.find({post_category:'sports'}).sort({news_id:-1}).skip('3').limit('3').lean();

                //Entertainment Two Section




                




                //const TopNews1 = await allnews.find({ne_insight:'yes'}).sort({news_id:-1}).limit('1').lean();
                const topnews_one = await allNews.find({ne_insight:'yes'}).sort({news_id:-1}).limit('1').lean();
                const topnews_two = await allNews.find({ne_insight:'yes'}).sort({news_id:-1}).skip('1').limit('7').lean();
                const kokthum_insight = await allNews.find({ne_insight:'yes'}).sort({news_id:-1}).limit('2').lean();


                const topnews = await allNews.find({ne_insight:'yes'}).sort({news_id:-1}).limit('1').lean();
                const latestnews = await allNews.find({post_topic:{$ne:'headlines'},post_category:{$ne:'article'}}).sort({news_id:-1}).limit('3').lean();

                let ftopNews = [];
                for(var i=0 ;i<topnews.length;i++) {
                      ftopNews.push(topnews[i].post_name);   
                }

                const skipOneTopNews = ftopNews.toString();


                // const tripuranews = await allNews.find({post_category:'tripura',post_name:{$ne:skipOneTopNews}}).sort({news_id:-1}).limit('10').lean();
                //const relatedNews = await allNews.find({post_category:catD,post_url:{$ne:nUrl}}).sort({news_id:-1}).limit('5').lean();

                //Tripura All News
                const tripuranews = await allNews.find({post_category:'tripura',ne_insight:{$ne:'yes'}}).sort({news_id:-1}).limit('5').lean();

                const nationalnews = await allNews.find({post_category:'national'}).sort({news_id:-1}).skip('1').limit('5').lean();
                const nationalone = await allNews.find({post_category:'national'}).sort({news_id:-1}).limit('1').lean();

                const sportnews = await allNews.find({post_category:'sports'}).sort({news_id:-1}).skip('1').limit('4').lean();
                const sportone = await allNews.find({post_category:'sports'}).sort({news_id:-1}).limit('1').lean();

                const globalnews = await allNews.find({post_category:'world'}).sort({news_id:-1}).skip('1').limit('6').lean();
                const globalone = await allNews.find({post_category:'world'}).sort({news_id:-1}).limit('1').lean();
                const globaltwo = await allNews.find({post_category:'world'}).sort({news_id:-1}).limit('3').lean(); 

                const bnews = await breakingNews.find().sort({brnews_id:-1}).limit('5').lean();

                const entertainment = await allNews.find({post_category:'showbiz'}).sort({news_id:-1}).skip('1').limit('5').lean();
                const entertainmentone = await allNews.find({post_category:'showbiz'}).sort({news_id:-1}).limit('1').lean();

                const finance = await allNews.find({post_category:'finance'}).sort({news_id:-1}).skip('1').limit('5').lean();
                const financeone = await allNews.find({post_category:'finance'}).sort({news_id:-1}).limit('1').lean();

                const article = await allNews.find({post_category:'article'}).sort({news_id:-1}).limit('3').lean();
                const spotlight = await allNews.find({post_category:'health'}).sort({news_id:-1}).limit('6').lean();

                const topheadlines = await allNews.find({ne_insight:'yes'}).sort({news_id:-1}).limit('1').lean();
                //const topheadlines = await allNews.find({news_id:'3291'}).sort({news_id:-1}).limit('1').lean();
                

                //YouTube Fetch
                //const fYt = await youtube.find().sort({video_id:-1}).limit('1').lean();
                const fYotube = await youtube.find().sort({video_id:-1}).limit('6').lean();

                res.render('home',
                {
                    pageTitle: 'Kokthum The News | Agartala News, Tripura News, Kokborok News, Northeast News',
                    pageKeyword: 'neherald, tripura university,northeast herald, tripura news, kokborok news, tripura info',
                    pageDescription: 'Northeast Herald starts its journey from Tripura state capital city Agartala to cover the entire Northeast region of India for the latest news, news photos, and the latest photos to promote the great cultural, historical and traditional identity of the region.',
                    pageUrl: 'https://www.kokthum.com/',
                    imageCard: 'https://www.kokthum.com/images/kokthum.png',
                    tripuranews,
                    topnews,
                    latestnews,
                    nationalnews,
                    sportnews,
                    globalnews,
                    bnews,
                    
                    topheadlines,
                    spotlight, 
                    entertainment, 
                    finance,
                    article, nationalone, sportone, globalone, globaltwo, entertainmentone, financeone, fYotube,
                    //Kokthum
                    topnews_one,topnews_two,kokthum_insight,politics,education,culture,national,jobs_one,jobs_two,jobs_three,sports_one,sports_two
                });
            }
            catch{
                res.status(500).send({message: error.message || "Error in Homepage"});
            }
        }

        exports.newsPage = async(req, res) =>{
            try{
                let nUrl = req.params.id;
                let catD = req.params.cate;
                const singlenews = await allNews.findOne({post_category:catD,post_url:nUrl}).lean();
                const relatedNews = await allNews.find({post_category:catD,post_url:{$ne:nUrl}}).sort({news_id:-1}).limit('5').lean();
                const bnews = await breakingNews.find().sort({brnews_id:-1}).limit('5').lean();

                console.log(singlenews.post_name);
                //const rNews = await allNews.find({}).sort({news_id:-1}).limit('3');
                res.render('news',
                {
                    pageTitle: singlenews.post_name + ' | Northeast Herald',
                    pageKeyword: singlenews.post_keyword,
                    pageDescription: singlenews.meta_description,
                    pageUrl: 'https://www.kokthum.com/'+singlenews.post_category+'/'+singlenews.post_url,
                    imageCard: singlenews.post_image,
                    singlenews,
                    relatedNews, 
                    bnews
                    
                });
            }
            catch{
                res.redirect('/error/404')
            }
        }

        exports.categoryPage = async(req, res) => {
            try{
            let catName = req.params.cat;
            const categoryAll = await allNews.find({post_category:catName}).sort({news_id:-1}).lean();
            const recentNewscat = await allNews.find({post_category:{$ne:catName}}).sort({news_id:-1}).limit('10').lean();
            const bnews = await breakingNews.find().sort({brnews_id:-1}).limit('5').lean();

            //const pk = await allKey.findOne({page_category:catName});
            res.render('category',
            {
                    pageTitle: catName.charAt(0).toUpperCase() + catName.slice(1) + ' | Northeast Herald',
                    pageKeyword: 'neherald, tripura university,northeast herald, tripura news, kokborok news, tripura info',
                    pageDescription: 'Northeast Herald starts its journey from Tripura state capital city Agartala to cover the entire Northeast region of India for the latest news, news photos, and the latest photos to promote the great cultural, historical and traditional identity of the region.',
                    pageUrl: 'https://www.neherald.com/',
                    imageCard: 'https://www.neherald.com/logo.png',
                    pageCategory: catName,
                    categoryAll,
                    recentNewscat,
                    bnews,
                    catName
            });
            }
            catch{
                res.status(500).send({message: error.message || "Error in Category Page"});
            }
        }

        exports.pagesection = async(req, res) => {
            try{
                let pUrl = req.params.pageurl;
                const pageI = await allPag.findOne({page_url:pUrl}).lean();
                const bnews = await breakingNews.find().sort({brnews_id:-1}).limit('5').lean();

                //const pk = await allKey.findOne({page_category:catName});
                res.render('pages',
                {
                        pageTitle: pageI.page_title + ' | Northeast Herald',
                        pageKeyword: pageI.page_keyword,
                        pageDescription: pageI.page_description,
                        pageUrl: 'https://www.neherald.com/'+pageI.page_url,
                        imageCard: 'https://www.neherald.com/logo.png',
                        pageI,
                        bnews,
                        heading: pageI.page_title
                });
            }
                catch{
                    res.status(500).send({message: error.message || "Error in Category Page"});
                }
            
        }

        exports.topNewsPage = async(req, res) =>{
            const topheadlines = await allNews.find({ne_insight:'yes'}).sort({news_id:-1}).lean();
            const recentNewscat = await allNews.find().sort({news_id:-1}).limit('10').lean();
            //const oneDay = await allNews.find({news_id:'3291'}).sort({news_id:-1}).limit('1').lean();
            const bnews = await breakingNews.find().sort({brnews_id:-1}).limit('5').lean();
            res.render('topnews',{
                    pageTitle: 'Tripura Top News : NE Herald',
                    pageKeyword: 'neherald, tripura university,northeast herald, tripura news, kokborok news, tripura info',
                    pageDescription: 'Northeast Herald starts its journey from Tripura state capital city Agartala to cover the entire Northeast region of India for the latest news, news photos, and the latest photos to promote the great cultural, historical and traditional identity of the region.',
                    pageUrl: 'https://www.neherald.com/',
                    imageCard: 'https://www.neherald.com/logo.png',
                    topheadlines,
                    recentNewscat,
                    topheadlines,
                    bnews,
                    //oneDay

            })
        }

        exports.Error = async(req, res) =>{
            res.render('404');
        }

        exports.searchNews = async(req, res, next) =>{
            try {
                const squery = req.query.q;    
                const searchQuery = await allNews.find({$text: {$search:squery}}).sort({news_id:-1}).lean();
                const recentNewscat = await allNews.find().sort({news_id:-1}).limit('8').lean();

                console.log(searchQuery)
                //res.json(topnews);
                res.render('search',
                {
                    pageTitle: squery.charAt(0).toUpperCase() + squery.slice(1) + ' | Northeast Herald',
                    pageKeyword: 'neherald, tripura university,northeast herald, tripura news, kokborok news, tripura info',
                    pageDescription: 'Northeast Herald starts its journey from Tripura state capital city Agartala to cover the entire Northeast region of India for the latest news, news photos, and the latest photos to promote the great cultural, historical and traditional identity of the region.',
                    pageUrl: 'https://www.neherald.com/',
                    imageCard: 'https://www.neherald.com/logo.png',
                    pageCategory: squery,
                    searchQuery, recentNewscat
                });
            } catch(error) {
                next(error);
            }

        }

        exports.photoAlbum = async(req, res, next) =>{
            try{
                const allgallery = await allGallery.find().sort({gallery_id:-1}).lean();
                res.render('album',
                {
                    pageTitle: 'Photo Album| Northeast Herald',
                    pageKeyword: 'neherald, tripura university,northeast herald, tripura news, kokborok news, tripura info',
                    pageDescription: 'Northeast Herald starts its journey from Tripura state capital city Agartala to cover the entire Northeast region of India for the latest news, news photos, and the latest photos to promote the great cultural, historical and traditional identity of the region.',
                    pageUrl: 'https://www.neherald.com/',
                    imageCard: 'https://www.neherald.com/logo.png',
                    allgallery
                    
                });
            }
            catch{
                res.redirect('/error/404')
            }   
        }




        exports.homeAPI = async(req, res, next) => {
            try{
                const topnews = await allNews.find({ne_insight:'yes'}).sort({news_id:-1}).limit('1').lean();
                const latestnews = await allNews.find({post_topic:{$ne:'headlines'},post_category:{$ne:'article'}}).sort({news_id:-1}).limit('3').lean();

                let ftopNews = [];
                for(var i=0 ;i<topnews.length;i++) {
                      ftopNews.push(topnews[i].post_name);   
                }

                const skipOneTopNews = ftopNews.toString();


                const tripuranews = await allNews.find({post_category:'tripura',post_name:{$ne:skipOneTopNews}}).sort({news_id:-1}).limit('10').lean();
                //const relatedNews = await allNews.find({post_category:catD,post_url:{$ne:nUrl}}).sort({news_id:-1}).limit('5').lean();

                //Tripura All News
                // const tripuranews = await allNews.find({post_category:'tripura',ne_insight:{$ne:'yes'}}).sort({news_id:-1}).limit('5').lean();

                const nationalnews = await allNews.find({post_category:'national'}).sort({news_id:-1}).skip('1').limit('5').lean();
                const nationalone = await allNews.find({post_category:'national'}).sort({news_id:-1}).limit('1').lean();

                const sportnews = await allNews.find({post_category:'sports'}).sort({news_id:-1}).skip('1').limit('4').lean();
                const sportone = await allNews.find({post_category:'sports'}).sort({news_id:-1}).limit('1').lean();

                const globalnews = await allNews.find({post_category:'world'}).sort({news_id:-1}).skip('1').limit('6').lean();
                const globalone = await allNews.find({post_category:'world'}).sort({news_id:-1}).limit('1').lean();
                const globaltwo = await allNews.find({post_category:'world'}).sort({news_id:-1}).limit('3').lean(); 

                const bnews = await breakingNews.find().sort({brnews_id:-1}).limit('5').lean();

                const entertainment = await allNews.find({post_category:'showbiz'}).sort({news_id:-1}).skip('1').limit('5').lean();
                const entertainmentone = await allNews.find({post_category:'showbiz'}).sort({news_id:-1}).limit('1').lean();

                const finance = await allNews.find({post_category:'finance'}).sort({news_id:-1}).skip('1').limit('5').lean();
                const financeone = await allNews.find({post_category:'finance'}).sort({news_id:-1}).limit('1').lean();

                const article = await allNews.find({post_category:'article'}).sort({news_id:-1}).limit('2').lean();
                const spotlight = await allNews.find({post_category:'health'}).sort({news_id:-1}).limit('3').lean();

                const topheadlines = await allNews.find({ne_insight:'yes'}).sort({news_id:-1}).limit('1').lean();
                //const topheadlines = await allNews.find({news_id:'3291'}).sort({news_id:-1}).limit('1').lean();
                
                const gallery = await allGallery.find().sort({gallery_id:-1}).limit('5').lean();
                const skipGallery = await allGallery.find().sort({gallery_id:-1}).skip(1).limit('10').lean();

                //YouTube Fetch
                const fYt = await youtube.find().sort({video_id:-1}).limit('1').lean();
                const fYotube = await youtube.find().sort({video_id:-1}).skip(1).limit('4').lean();

                res.json(
                    tripuranews,
                    topnews,
                    latestnews,
                    nationalnews,
                    sportnews,
                    globalnews,
                    bnews,
                    gallery,
                    skipGallery,
                    topheadlines,
                    spotlight, 
                    entertainment, 
                    finance,
                    article, nationalone, sportone, globalone, globaltwo, entertainmentone, financeone, fYotube,fYt
                );
            }
            catch{
                res.status(500).send({message: error.message || "Error in Homepage"});
            }
        }

        exports.pageAuthor = async(req, res) =>{
            try{
                res.render('author');
            }
            catch{

            }
        }

