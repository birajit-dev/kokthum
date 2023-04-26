var expressHbs =  require('express-handlebars');
var hbs = expressHbs.create({});

// register new function
hbs.handlebars.registerHelper('times', function(n, block) {
    var accum = '';
    for(var i = 0; i < n; ++i) {
        block.data.index = i;
        block.data.first = i === 0;
        block.data.last = i === (n - 1);
        accum += block.fn(this);
    }
    return accum;
});

hbs.handlebars.registerHelper("latestnews", function(context, options) {
    var ret;  
    for (var i = 0; i <= 2; i++) {
        if(i==0){
            ret = "<div class='d-flex border-bottom-blue pb-4 align-items-center justify-content-between'>"+ options.fn(context[i])+"</div>" ;
        }
        else if(i==2){
      ret = ret +"<div class='d-flex  pt-4 align-items-center justify-content-between'>" + options.fn(context[i])+"</div>" ;
        }
        else{
            ret = ret +"<div class='d-flex border-bottom-blue pb-4 pt-4 align-items-center justify-content-between'>" + options.fn(context[i])+"</div>" ;
        }
    }
  
    return ret ;
  });

hbs.handlebars.registerHelper('ifcontains', function(arg1, arg2, options) {
    return (arg2.indexOf(arg1)>-1) ? options.fn(this) : options.inverse(this);
});

hbs.handlebars.registerHelper('ifNotcontains', function(arg1, arg2, options) {
  return (arg2.indexOf(arg1)<=-1) ? options.fn(this) : options.inverse(this);
});

  hbs.handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
hbs.handlebars.registerHelper('ifNotEquals', function(arg1, arg2, options) {
    return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});
  hbs.handlebars.registerHelper('check', function(value, comparator) {
    return (value === comparator) ? 'No content' : value;
});


hbs.handlebars.registerHelper('eachData', function(context, options) {
    var fn = options.fn, inverse = options.inverse, ctx;
    var ret = "";

    if(context && context.length > 0) {
      for(var i=0, j=context.length; i<j; i++) {
        ctx = Object.create(context[i]);
        ctx.index = i;
        ret = ret + fn(ctx);
      }
    } else {
      ret = inverse(this);
    }
    return ret;
}); 

  hbs.handlebars.registerHelper("list", function(context, options) {
    var ret;  
    for (var i = 0; i < context.length; i++) {
        if(i==0){
            ret = options.fn(context[i]);
        }      
        else{
            ret = ret  + options.fn(context[i]);
        }
    }  
    return ret ;
  });

  hbs.handlebars.registerHelper('dateFormat', require('handlebars-dateformat'));


  hbs.handlebars.registerHelper('substr', function(length, context, options) {
    if ( context.length > length ) {
     return context.substring(0, length) + "..";
    } else {
     return context;
    }
   });

   hbs.handlebars.registerHelper('s3path', function(context, options){
    var s3bucket = "https://northeastherald.sfo3.digitaloceanspaces.com";
    return s3bucket;
   });

   hbs.handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});