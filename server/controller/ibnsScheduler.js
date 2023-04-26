const { request } = require('express');
var express = require('express');
require('../model/database');
const allNews = require('../model/allnews');
const allPages = require('../model/allpage');
const adminData =  require('../model/login');
const breakingNews = require('../model/breakingnews');
const Ibns = require('../model/ibns');
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
var moment = require('moment'); // require



    //Random Function
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    };
    const ranDom = getRandomInt(9999);

    // const event = new Date();
    // const options = {  year: 'numeric', month: 'short', day: 'numeric' };
    // const newDate = event.toString('en-US', options);


    exports.sports = async(req, res) =>{
        const newDate = moment().format('lll');
        let url = "https://www.indiablooms.com/news/feeds.json";
        const dashAllNews = await allNews.find().sort({ibns_id:-1}).lean();
        let settings = { method: "Get" };
        fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
            var sports = json.news.sports;
                if(sports !=null){  
                    for(var i=0;i<sports.length;i++){     
                        if(sports[i].content.length>10){  
                            var selected=dashAllNews.filter(it =>
                            it.ibns_id === sports[i].id 
                            );        
                            if(selected != null && selected.length>0){
                            }
                            else{
                                var iurl = sports[i].title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                                let ipage = new allNews({
                                post_name: sports[i].title,
                                post_url: iurl,
                                post_summary: sports[i].description,
                                post_content:sports[i].content,
                                post_keyword:'agartala news, tripura news, northeast herald, sports news',
                                meta_description:sports[i].description,
                                post_category:'sports',
                                post_image:sports[i].imageName,
                                meta_tags:'Sport news, ',
                                post_topic:'',
                                post_editor:'No',
                                ne_insight:'No',
                                author:'IBNS',
                                update_date:newDate,
                                ibns_id:sports[i].id
                                });
                                ipage.save();      
                            }        
                        }
                    }
                } 
            })
        }

    exports.news = async(req, res) =>{
        const newDate = moment().format('lll');

        let url = "https://www.indiablooms.com/news/feeds.json";
        const dashAllNews = await allNews.find().sort({ibns_id:-1}).lean();
        let settings = { method: "Get" };
        fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
        var news = json.news.news;		
        if(news !=null){  
            for(var i=0;i<news.length;i++){     
                if(news[i].content.length>10){  
                    var selected=dashAllNews.filter(it =>
                    it.ibns_id === news[i].id 
                    );        
                    if(selected != null && selected.length>0){
                    }
                    else{
                        var iurl = news[i].title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                        let ipage = new allNews({
                        post_name: news[i].title,
                        post_url: iurl,
                        post_summary: news[i].description,
                        post_content:news[i].content,
                        post_keyword:'agartala news, tripura news, northeast herald, news news',
                        meta_description:news[i].description,
                        post_category:'national',
                        post_image:news[i].imageName,
                        meta_tags:'Sport news, ',
                        post_topic:'',
                        post_editor:'No',
                        ne_insight:'No',
                        author:'IBNS',
                        update_date:newDate,
                        ibns_id:news[i].id
                        });
                        ipage.save();      
                    }        
                }
            }
        }
        })

    }

    exports.finance = async(req, res) =>{
        const newDate = moment().format('lll');

        let url = "https://www.indiablooms.com/news/feeds.json";
        const dashAllNews = await allNews.find().sort({ibns_id:-1}).lean();
        let settings = { method: "Get" };
        fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
        var news = json.news.finance;		
        if(news !=null){  
            for(var i=0;i<news.length;i++){     
                if(news[i].content.length>10){  
                    var selected=dashAllNews.filter(it =>
                    it.ibns_id === news[i].id 
                    );        
                    if(selected != null && selected.length>0){
                    }
                    else{
                        var iurl = news[i].title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                        let ipage = new allNews({
                        post_name: news[i].title,
                        post_url: iurl,
                        post_summary: news[i].description,
                        post_content:news[i].content,
                        post_keyword:'agartala news, tripura news, northeast herald, news news',
                        meta_description:news[i].description,
                        post_category:'finance',
                        post_image:news[i].imageName,
                        meta_tags:'Sport news, ',
                        post_topic:'',
                        post_editor:'No',
                        ne_insight:'No',
                        author:'IBNS',
                        update_date:newDate,
                        ibns_id:news[i].id
                        });
                        ipage.save();      
                    }        
                }
            }
        }
        })

    }

    exports.showbiz = async(req, res) =>{
        const newDate = moment().format('lll');

        let url = "https://www.indiablooms.com/news/feeds.json";
        const dashAllNews = await allNews.find().sort({ibns_id:-1}).lean();
        let settings = { method: "Get" };
        fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
        var news = json.news.showbiz;		
        if(news !=null){  
            for(var i=0;i<news.length;i++){     
                if(news[i].content.length>10){  
                    var selected=dashAllNews.filter(it =>
                    it.ibns_id === news[i].id 
                    );        
                    if(selected != null && selected.length>0){
                    }
                    else{
                        var iurl = news[i].title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                        let ipage = new allNews({
                        post_name: news[i].title,
                        post_url: iurl,
                        post_summary: news[i].description,
                        post_content:news[i].content,
                        post_keyword:'agartala news, tripura news, northeast herald, news news',
                        meta_description:news[i].description,
                        post_category:'showbiz',
                        post_image:news[i].imageName,
                        meta_tags:'Sport news, ',
                        post_topic:'',
                        post_editor:'No',
                        ne_insight:'No',
                        author:'IBNS',
                        update_date:newDate,
                        ibns_id:news[i].id
                        });
                        ipage.save();      
                    }        
                }
            }
        }
        })

    }

    exports.life = async(req, res) =>{
        const newDate = moment().format('lll');

        let url = "https://www.indiablooms.com/news/feeds.json";
        const dashAllNews = await allNews.find().sort({ibns_id:-1}).lean();
        let settings = { method: "Get" };
        fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
        var news = json.news.life;		
        if(news !=null){  
            for(var i=0;i<news.length;i++){     
                if(news[i].content.length>10){  
                    var selected=dashAllNews.filter(it =>
                    it.ibns_id === news[i].id 
                    );        
                    if(selected != null && selected.length>0){
                    }
                    else{
                        var iurl = news[i].title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                        let ipage = new allNews({
                        post_name: news[i].title,
                        post_url: iurl,
                        post_summary: news[i].description,
                        post_content:news[i].content,
                        post_keyword:'agartala news, tripura news, northeast herald, news news',
                        meta_description:news[i].description,
                        post_category:'life',
                        post_image:news[i].imageName,
                        meta_tags:'Sport news, ',
                        post_topic:'',
                        post_editor:'No',
                        ne_insight:'No',
                        author:'IBNS',
                        update_date:newDate,
                        ibns_id:news[i].id
                        });
                        ipage.save();      
                    }        
                }
            }
        }
        })

    }

    exports.world = async(req, res) =>{
        const newDate = moment().format('lll');

        let url = "https://www.indiablooms.com/news/feeds.json";
        const dashAllNews = await allNews.find().sort({ibns_id:-1}).lean();
        let settings = { method: "Get" };
        fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
        var news = json.news.world;		
        if(news !=null){  
            for(var i=0;i<news.length;i++){     
                if(news[i].content.length>10){  
                    var selected=dashAllNews.filter(it =>
                    it.ibns_id === news[i].id 
                    );        
                    if(selected != null && selected.length>0){
                    }
                    else{
                        var iurl = news[i].title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                        let ipage = new allNews({
                        post_name: news[i].title,
                        post_url: iurl,
                        post_summary: news[i].description,
                        post_content:news[i].content,
                        post_keyword:'agartala news, tripura news, northeast herald, news news',
                        meta_description:news[i].description,
                        post_category:'world',
                        post_image:news[i].imageName,
                        meta_tags:'Sport news, ',
                        post_topic:'',
                        post_editor:'No',
                        ne_insight:'No',
                        author:'IBNS',
                        update_date:newDate,
                        ibns_id:news[i].id
                        });
                        ipage.save();      
                    }        
                }
            }
        }
        })

    }

    exports.health = async(req, res) =>{
        const newDate = moment().format('lll');

        let url = "https://www.indiablooms.com/news/feeds.json";
        const dashAllNews = await allNews.find().sort({ibns_id:-1}).lean();
        let settings = { method: "Get" };
        fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
        var news = json.news.health;		
        if(news !=null){  
            for(var i=0;i<news.length;i++){     
                if(news[i].content.length>10){  
                    var selected=dashAllNews.filter(it =>
                    it.ibns_id === news[i].id 
                    );        
                    if(selected != null && selected.length>0){
                    }
                    else{
                        var iurl = news[i].title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                        let ipage = new allNews({
                        post_name: news[i].title,
                        post_url: iurl,
                        post_summary: news[i].description,
                        post_content:news[i].content,
                        post_keyword:'agartala news, tripura news, northeast herald, news news',
                        meta_description:news[i].description,
                        post_category:'health',
                        post_image:news[i].imageName,
                        meta_tags:'Sport news, ',
                        post_topic:'',
                        post_editor:'No',
                        ne_insight:'No',
                        author:'IBNS',
                        update_date:newDate,
                        ibns_id:news[i].id
                        });
                        ipage.save();      
                    }        
                }
            }
        }
        })

    }
