const express = require('express');
const { route } = require('express/lib/application');
const router = express.Router();
const allController = require('../controller/allcontroller');
const adminController = require('../controller/admincontroller');
const sessions = require('express-session');
const ibns = require('../model/ibns');
const WebadminView = require('../controller/WebAdminView');
const AuthorController = require('../controller/AuthorController');

// CLIENT SIDE ROUTE//
router.get('/', allController.homePage); // HOMEPAGE
router.get('/:cate/:id', allController.newsPage); // NEWS PAGE
router.get('/:cat', allController.categoryPage); // CATEGORY PAGE
router.get('/en/pages/:pageurl', allController.pagesection);
router.get('/topnews/headlines/tripura', allController.topNewsPage);
router.get('/en/author/name/list', allController.pageAuthor);
//router.get('/automation/ibns/all', adminController.ibns);
//router.get('/a/a/a/test', adminController.testi);

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










//ERROR//
router.get('/error/404', allController.Error);










module.exports = router;
