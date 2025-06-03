const { request } = require('express');
var express = require('express');
require('../model/database');

const { resolve } = require('path');
const { all } = require('express/lib/application');
const { assert } = require('console');


const youtube = require('../model/youtube');
const allnews = require('../model/allnews');
const allNews = require('../model/ainews');
const pagekeyword = require('../model/pagekeyword');
const allPag = require('../model/allpage');
const breakingNews = require('../model/breakingnews');
const YouTube = require('../model/youtube');
const AuthorModel = require('../model/insideUser');


exports.homePage = async (req, res, next) => {
    try {
      const getNews = (filter, sort = { ai_seq: -1 }, skip = 0, limit = 5) =>
        allNews.find(filter).sort(sort).skip(skip).limit(limit).lean();
  
      const promises = [
        getNews({ post_category: 'politics', post_status: 'Published' }, undefined, 0, 5),
        getNews({ post_category: 'education', post_status: 'Published' }, undefined, 0, 5),
        getNews({ post_category: 'culture', post_status: 'Published' }, undefined, 0, 5),
        getNews({ post_category: 'national', post_status: 'Published' }, undefined, 0, 4),
        getNews({ post_category: 'career', post_status: 'Published' }, undefined, 0, 3),
        getNews({ post_category: 'career', post_status: 'Published' }, undefined, 3, 3),
        getNews({ post_category: 'career', post_status: 'Published' }, undefined, 6, 3),
        getNews({ post_category: 'sports', post_status: 'Published' }, undefined, 0, 3),
        getNews({ post_category: 'sports', post_status: 'Published' }, undefined, 3, 3),
        getNews({ ne_insight: 'yes', post_status: 'Published' }, undefined, 0, 1), // topnews_one
        getNews({ ne_insight: 'yes', post_status: 'Published' }, undefined, 1, 7), // topnews_two
        getNews({ ne_insight: 'yes', post_status: 'Published' }, undefined, 0, 2), // kokthum_insight
        getNews({ ne_insight: 'yes', post_status: 'Published' }, undefined, 0, 1), // topnews
        getNews({ post_topic: { $ne: 'headlines' }, post_category: { $ne: 'article' }, post_status: 'Published' }, undefined, 0, 3), // latestnews
        getNews({ post_category: 'tripura', ne_insight: { $ne: 'yes' } }, undefined, 0, 5),
        getNews({ post_category: 'national', post_status: 'Published' }, undefined, 1, 5),
        getNews({ post_category: 'national', post_status: 'Published' }, undefined, 0, 1),
        getNews({ post_category: 'sports', post_status: 'Published' }, undefined, 1, 4),
        getNews({ post_category: 'sports', post_status: 'Published' }, undefined, 0, 1),
        getNews({ post_category: 'world', post_status: 'Published' }, undefined, 1, 6),
        getNews({ post_category: 'world', post_status: 'Published' }, undefined, 0, 1),
        getNews({ post_category: 'world' }, undefined, 0, 3),
        breakingNews.find().sort({ brai_seq: -1 }).limit(5).lean(),
        getNews({ post_category: 'entertainment' }, undefined, 1, 5),
        getNews({ post_category: 'entertainment' }, undefined, 0, 1),
        getNews({ post_category: 'finance' }, undefined, 1, 5),
        getNews({ post_category: 'finance' }, undefined, 0, 1),
        getNews({ post_category: 'article' }, undefined, 0, 3),
        getNews({ post_category: 'health' }, undefined, 0, 6), // spotlight
        getNews({ ne_insight: 'yes' }, undefined, 0, 1), // topheadlines
        youtube.find().sort({ video_id: -1 }).limit(6).lean(),
        getNews({ post_category: 'international' }, undefined, 0, 3),
        getNews({ post_category: 'international' }, undefined, 3, 2),
        getNews({ post_category: 'international' }, undefined, 5, 2),
        getNews({ post_category: 'international' }, undefined, 7, 2),
      ];
  
      const [
        politics, education, culture, national, jobs_one, jobs_two, jobs_three,
        sports_one, sports_two, topnews_one, topnews_two, kokthum_insight, topnews,
        latestnews, tripuranews, nationalnews, nationalone, sportnews, sportone,
        globalnews, globalone, globaltwo, bnews, entertainment, entertainmentone,
        finance, financeone, article, spotlight, topheadlines, fYotube,
        international_one, international_two, international_three, international_four
      ] = await Promise.all(promises);
  
      res.render('home', {
        pageTitle: 'Kokthum The News | Agartala News, Tripura News, Kokborok News, Northeast News',
        pageKeyword: 'kokthum news, tripura university, kokthum the news, gobin debbarma, tripura news, kokborok news, tripura info',
        pageDescription: 'Kokthum The News is a prominent regional news channel based in the northeast region of India...',
        pageUrl: 'https://www.kokthum.com/',
        imageCard: 'https://www.kokthum.com/images/kokthum.png',
        politics, education, culture, national,
        jobs_one, jobs_two, jobs_three,
        sports_one, sports_two,
        topnews_one, topnews_two, kokthum_insight, topnews,
        latestnews, tripuranews, nationalnews, nationalone,
        sportnews, sportone, globalnews, globalone, globaltwo,
        bnews, entertainment, entertainmentone,
        finance, financeone, article, spotlight, topheadlines,
        fYotube,
        international_one, international_two, international_three, international_four
      });
    } catch (error) {
      res.status(500).send({ message: error.message || "Error in Homepage" });
    }
  };
  

        exports.newsPage = async(req, res) =>{
            try{
                let nUrl = req.params.id;
                let catD = req.params.cate;
                const singlenews = await allNews.findOne({post_category:catD,post_url:nUrl}).lean();
                const relatedNews = await allNews.find({post_category:catD,post_url:{$ne:nUrl}}).sort({ai_seq:-1}).limit('4').lean();
                const bnews = await breakingNews.find().sort({brai_seq:-1}).limit('5').lean();

                const recent_news = await allNews.find({post_url:{$ne:nUrl}}).sort({ai_seq:-1}).limit('10').lean();

                console.log(singlenews.post_name);
                //const rNews = await allNews.find({}).sort({ai_seq:-1}).limit('3');
                res.render('news',
                {
                    pageTitle: singlenews.post_name + ' | Kokthum The News',
                    pageKeyword: singlenews.post_keyword,
                    pageDescription: singlenews.meta_description,
                    pageUrl: 'https://www.kokthum.com/'+singlenews.post_category+'/'+singlenews.post_url,
                    imageCard: singlenews.post_image,
                    singlenews,
                    relatedNews,
                    recent_news,
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
            const categoryAll = await allNews.find({post_category:catName}).sort({ai_seq:-1}).lean();
            const recentNewscat = await allNews.find({post_category:{$ne:catName}}).sort({ai_seq:-1}).limit('10').lean();
            const bnews = await breakingNews.find().sort({brnews_id:-1}).limit('5').lean();

            //const pk = await allKey.findOne({page_category:catName});
            res.render('category',
            {
                    pageTitle: catName.charAt(0).toUpperCase() + catName.slice(1) + ' | Kokthum The News',
                    pageKeyword: catName.charAt(0).toUpperCase() + catName.slice(1) + ', kokthum the news, tripura university, tripura news, kokborok news, tripura info',
                    pageDescription: 'Kokthum The News is a prominent regional news channel based in the northeast region of India. It primarily focuses on broadcasting news in three languages: Kokborok, English, and Bengali. With its headquarters located in Agartala, the capital city of Tripura, Kokthum News has established itself as a reliable source of information for the local community.',
                    pageUrl: 'https://www.kokthum.com/',
                    imageCard: 'https://www.kokthum.com/logo.png',
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
                //const bnews = await breakingNews.find().sort({brai_seq:-1}).limit('5').lean();

                //const pk = await allKey.findOne({page_category:catName});
                res.render('pages',
                {
                        pageTitle: pageI.page_title + ' | Kokthum The News',
                        pageKeyword: pageI.page_keyword,
                        pageDescription: pageI.page_description,
                        pageUrl: 'https://www.kokthum.com/'+pageI.page_url,
                        imageCard: 'https://www.kokthum.com/logo.png',
                        pageI,
                        heading: pageI.page_title
                });
            }
                catch{
                    res.status(500).send({message: error.message || "Error in Category Page"});
                }
            
        }

        exports.topNewsPage = async(req, res) =>{
            const topheadlines = await allNews.find({ne_insight:'yes'}).sort({ai_seq:-1}).lean();
            const recentNewscat = await allNews.find().sort({ai_seq:-1}).limit('10').lean();
            //const oneDay = await allNews.find({ai_seq:'3291'}).sort({ai_seq:-1}).limit('1').lean();
            const bnews = await breakingNews.find().sort({brnews_id:-1}).limit('5').lean();
            res.render('topnews',{
                    pageTitle: 'Tripura Top News : Kokthum',
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
                const recentNewscat = await allNews.find().sort({ai_seq:-1}).limit('8').lean();

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
                const topnews = await allNews.find({ne_insight:'yes'}).sort({ai_seq:-1}).limit('1').lean();
                const latestnews = await allNews.find({post_topic:{$ne:'headlines'},post_category:{$ne:'article'}}).sort({ai_seq:-1}).limit('3').lean();

                let ftopNews = [];
                for(var i=0 ;i<topnews.length;i++) {
                      ftopNews.push(topnews[i].post_name);   
                }

                const skipOneTopNews = ftopNews.toString();


                const tripuranews = await allNews.find({post_category:'tripura',post_name:{$ne:skipOneTopNews}}).sort({ai_seq:-1}).limit('10').lean();
                //const relatedNews = await allNews.find({post_category:catD,post_url:{$ne:nUrl}}).sort({ai_seq:-1}).limit('5').lean();

                //Tripura All News
                // const tripuranews = await allNews.find({post_category:'tripura',ne_insight:{$ne:'yes'}}).sort({ai_seq:-1}).limit('5').lean();

                const nationalnews = await allNews.find({post_category:'national'}).sort({ai_seq:-1}).skip('1').limit('5').lean();
                const nationalone = await allNews.find({post_category:'national'}).sort({ai_seq:-1}).limit('1').lean();

                const sportnews = await allNews.find({post_category:'sports'}).sort({ai_seq:-1}).skip('1').limit('4').lean();
                const sportone = await allNews.find({post_category:'sports'}).sort({ai_seq:-1}).limit('1').lean();

                const globalnews = await allNews.find({post_category:'world'}).sort({ai_seq:-1}).skip('1').limit('6').lean();
                const globalone = await allNews.find({post_category:'world'}).sort({ai_seq:-1}).limit('1').lean();
                const globaltwo = await allNews.find({post_category:'world'}).sort({ai_seq:-1}).limit('3').lean(); 

                const bnews = await breakingNews.find().sort({brai_seq:-1}).limit('5').lean();

                const entertainment = await allNews.find({post_category:'showbiz'}).sort({ai_seq:-1}).skip('1').limit('5').lean();
                const entertainmentone = await allNews.find({post_category:'showbiz'}).sort({ai_seq:-1}).limit('1').lean();

                const finance = await allNews.find({post_category:'finance'}).sort({ai_seq:-1}).skip('1').limit('5').lean();
                const financeone = await allNews.find({post_category:'finance'}).sort({ai_seq:-1}).limit('1').lean();

                const article = await allNews.find({post_category:'article'}).sort({ai_seq:-1}).limit('2').lean();
                const spotlight = await allNews.find({post_category:'health'}).sort({ai_seq:-1}).limit('3').lean();

                const topheadlines = await allNews.find({ne_insight:'yes'}).sort({ai_seq:-1}).limit('1').lean();
                //const topheadlines = await allNews.find({ai_seq:'3291'}).sort({ai_seq:-1}).limit('1').lean();
                
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
                const getAuthor  = req.params.author;
                const author = await AuthorModel.findOne({user_name:getAuthor}).lean();
                const authorNews = await allNews.find({author_name:getAuthor}).sort({ai_seq:-1}).lean();
                res.render('author',{
                    author,
                    authorNews
                })
            }
            catch{

            }
        }

        exports.getCookiesSearch = async(req, res) =>{
            const searchKeyword = req.cookies['searchKeyword'] || null;
            // Your logic to use the searchKeyword and personalize content
            const personalizedContent = `User searched for: ${searchKeyword}`;
            // Send the personalized content as a response
            res.send(personalizedContent);
        }


        exports.CategoryPagePagination = async(req, res) => {
            try{
                let catName = req.params.cat;
                const page = parseInt(req.query.page) || 1;
                const limit = 10;
                const skip = (page - 1) * limit;

                const totalPosts = await allNews.countDocuments({post_category:catName});
                const totalPages = Math.ceil(totalPosts / limit);

                const categoryAll = await allNews.find({post_category:catName})
                    .sort({ai_seq:-1})
                    .skip(skip)
                    .limit(limit)
                    .lean();

                const recentNewscat = await allNews.find({post_category:{$ne:catName}})
                    .sort({ai_seq:-1})
                    .limit('10')
                    .lean();

                const bnews = await breakingNews.find()
                    .sort({brnews_id:-1})
                    .limit('5')
                    .lean();

                res.json({
                    pageTitle: catName.charAt(0).toUpperCase() + catName.slice(1) + ' | Kokthum The News',
                    pageKeyword: catName.charAt(0).toUpperCase() + catName.slice(1) + ', kokthum the news, tripura university, tripura news, kokborok news, tripura info',
                    pageDescription: 'Kokthum The News is a prominent regional news channel based in the northeast region of India. It primarily focuses on broadcasting news in three languages: Kokborok, English, and Bengali. With its headquarters located in Agartala, the capital city of Tripura, Kokthum News has established itself as a reliable source of information for the local community.',
                    pageUrl: 'https://www.kokthum.com/',
                    imageCard: 'https://www.kokthum.com/logo.png',
                    pageCategory: catName,
                    categoryAll,
                    recentNewscat,
                    bnews,
                    catName,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1,
                        nextPage: page + 1,
                        prevPage: page - 1
                    }
                });
            }
            catch(error){
                res.status(500).json({
                    error: true,
                    message: error.message || "Error in Category Page"
                });
            }
        }
