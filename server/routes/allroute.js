const express = require('express');
const axios = require('axios');

const { route } = require('express/lib/application');
const router = express.Router();
const allController = require('../controller/allcontroller');
const adminController = require('../controller/admincontroller');
const sessions = require('express-session');
const ibns = require('../model/ibns');
const WebadminView = require('../controller/WebAdminView');
const AuthorController = require('../controller/AuthorController');
const uploadNewsImage = require('../middleware/uploadNewsImage');
const uploadDocument = require('../middleware/uploadDocuments');
const uploadImage = require('../middleware/uploadImage');
const htAIController = require('../controller/htAI');



// CLIENT SIDE ROUTE//
router.get('/', allController.homePage); // HOMEPAGE
router.get('/:cate/:id', allController.newsPage); // NEWS PAGE
router.get('/:cat', allController.categoryPage); // CATEGORY PAGE
router.get('/en/pages/:pageurl', allController.pagesection);
router.get('/topnews/headlines/tripura', allController.topNewsPage);
router.get('/en/author/:author', allController.pageAuthor);
//router.get('/automation/ibns/all', adminController.ibns);
//router.get('/a/a/a/test', adminController.testi);

router.get('/en/cookies/result', allController.getCookiesSearch);

//ADMIN SIDE ROUTE//
router.get('/admin/user/dashboard', adminController.adminDashboard);
router.get('/admin/user/login', adminController.adminLogin);
router.get('/admin/user/addnews', adminController.addNews);
router.get('/admin/user/editnews/:id', adminController.editNews); //EDIT NEWS
router.get('/admin/user/addpages', adminController.addPage);
router.get('/admin/user/pagedashboard', adminController.pageDashboard);
router.get('/admin/user/editpage/:id', adminController.editPage);
router.get('/admin/user/addbreaking', adminController.breakingPage);
router.get('/admin/user/listbreaking', adminController.listBreaking);
router.get('/admin/user/editbreaking/:id', adminController.editBreaking)
router.get('/admin/user/adduser', adminController.addUserPage);
router.get('/admin/user/listauthor', adminController.allUsers);
router.get('/admin/user/editauthor', adminController.editAuthorPage);

router.post('/admin/user/updateauthor', adminController.updateAuthor);
//API//
router.post('/admin/user/authcheck', adminController.authAdmin); //AUTHENTICATION OF ADMIN PANEL LOGIN
router.post('/admin/user/postnews', adminController.postNews); // ADD NEWS
router.post('/admin/user/postimage', adminController.upImage); // IMAGE UPLOADER
router.post('/admin/user/updatenews', adminController.updateNews); // EDIT NEWS
router.post('/admin/user/pagepost', adminController.postPage);
router.post('/admin/user/updatepage', adminController.updatePage);
router.post('/admin/user/breaknews', adminController.brNews);
router.post('/admin/user/updatebreaking', adminController.updateBreaking)
router.get('/admin/user/deletenews/:id', adminController.deleteNews);

router.post('/admin/user/addinsideuser', adminController.addInsideUsers); //Post Method for Adding Users details..


router.post('/web/post/adduser', adminController.addAuthor);
router.post('/web/post/media', adminController.addMedia);
router.post('/web/post/postbyuser', WebadminView.addBlogs);


//Web Admin Page View//
router.get('/admin/user/addmedia', WebadminView.addMediaPage);
router.get('/admin/user/mediapage', WebadminView.mediaPageView);
router.get('/admin/user/byuserpost', WebadminView.byuserPage);





//AUTHO ROUTE//
router.get('/author/user/dashboard', AuthorController.authDashboard);
router.get('/author/user/login', AuthorController.authLogin);
router.post('/author/user/auth', AuthorController.authUser);









 




//SEO 

//API
router.get('/api/v1/search', allController.searchNews);
router.get('/api/v1/album', allController.photoAlbum);
router.get('/api/v1/video', adminController.addVideos);

router.get('/api/v1/allnews', allController.homeAPI);










// API FOR MOBILE APP
router.get('/api/v1/mobile/:cat', allController.CategoryPagePagination);

//API FOR ADMIN DASHBOARD
router.post('/api/v1/admin/post/news', uploadNewsImage, adminController.AddNewsAdmin);
router.get('/api/v1/admin/newslists', adminController.AdminNewsList);
router.get('/api/v1/admin/authorlist', adminController.authorList);
router.get('/api/v1/admin/imageGallery', adminController.ImageGallery);

router.post('/api/v1/admin/upload/document', (req, res, next) => {
    req.uploadMiddleware = uploadDocument; // Use document middleware
    next();
  }, adminController.uploadDocument);
router.get('/api/v1/admin/get/document', adminController.getDocuments);
router.delete('/api/v1/admin/documents/:id', adminController.deleteDocument);
router.post('/api/v1/admin/upload/image', uploadImage, adminController.uploadImage);
router.post('/api/v1/admin/generate/content', adminController.generateContentGroq);
router.get('/api/v1/admin/saasuser/list', adminController.saasUserList);
router.get('/api/v1/admin/pending/content', adminController.getVerifyContent);
router.post('/api/v2/global/user/login', adminController.saasUserAuth);
router.put('/api/v1/admin/:id/approve', adminController.approveNews);
router.get('/api/v1/admin/news/:id', adminController.getSingleNews);
router.put('/api/v1/admin/news/update/:id', uploadNewsImage, adminController.updateNewsById);
router.delete("/api/v1/admin/news/delete/:id", adminController.deleteNewsById);
router.post('/api/v1/admin/automaticHT/news', adminController.AutoMaticNewsHindustanTimes);
router.post('/api/v1/admin/automationIBNS/news', adminController.IBNSAutomation);
router.get('/api/v1/admin/statusQueue/news', adminController.getQueueStatus);
router.post('/api/v1/admin/clearJobs/news', adminController.clearFailedJobs);


router.get("/api/v1/admin/news/migrate/migrate", adminController.MigrateOldNews);
router.put('/api/v1/admin/author/update/:id', adminController.updateAuthorAI);
router.delete('/api/v1/admin/author/delete/:id', adminController.deleteAuthorAI);
router.post('/subscribe', adminController.saveSubscription);
router.post('/send', adminController.sendNotification);


// HT AI RSS Feed Endpoints
router.get('/api/v1/htai/process-all', htAIController.processAllRSSFeeds);
router.post('/api/v1/htai/init', async (req, res) => {
  try {
    const result = await htAIController.initRSSSystem();
    res.json({ success: result, message: result ? 'RSS system initialized successfully' : 'Failed to initialize RSS system' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process a specific feed by key
router.get('/api/v1/htai/process/:feedKey', htAIController.processFeedByKey);

// Get system stats
router.get('/api/v1/htai/stats', async (req, res) => {
  try {
    const stats = await htAIController.getSystemStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
router.get('/api/v1/htai/health', async (req, res) => {
  try {
    const health = await htAIController.healthCheck();
    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New endpoints for failed links management
// Get all failed links
router.get('/api/v1/htai/failed-links', htAIController.getFailedLinks);

// Retry failed links
router.post('/api/v1/htai/retry-failed', htAIController.retryFailedLinks);

// Reset RSS system (clear all processed links)
router.post('/api/v1/htai/reset', htAIController.resetRSSSystem);


//SAAS USER
router.post('/api/v2/global/user/create', adminController.saasUserCreate);
router.post('/api/v2/global/user/verify', adminController.saasUserVerify);

//AUTHOR LOGIN
router.post('/api/v1/author/login', adminController.authorLogin);
router.get('/api/v1/author/articles', adminController.getAuthorArticles);




//ERROR//
router.get('/error/404', allController.Error);














module.exports = router;
