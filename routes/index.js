const
  express = require('express'),
  router = express.Router();

// while not connested to mongodb
let campaignList = [
  {_id:'111',name: 'Campaign 1', active: true, created: new Date, banners: [{_id: '111', name: 'Banner 1_1', active: true}, {_id: '222', name: 'Banner 1_2', active: false}, {_id: '333', name: 'Banner 1_3', active: true}]},
  {_id:'222',name: 'Campaign 2', active: false, created: new Date, banners: [{_id: '111', name: 'Banner 2_1', active: true}, {_id: '222', name: 'Banner 2_2', active: true}]},
  {_id:'333',name: 'Campaign 3', active: true, created: new Date, banners: [{_id: '111', name: 'Banner 3_1', active: true}, {_id: '222', name: 'Banner 3_2', active: true}]},
  {_id:'444',name: 'Campaign 4', active: true, created: new Date, banners: [{_id: '111', name: 'Banner 4_1', active: true}, {_id: '222', name: 'Banner 4_2', active: true}]},
  {_id:'555',name: 'Campaign 5', active: true, created: new Date, banners: [{_id: '111', name: 'Banner 5_1', active: true}, {_id: '222', name: 'Banner 5_2', active: true}]}
];
 

router.use(function(req, res, next){
  res.locals.breadcrumbs = [{name:'Main',path:'/'}];
  return next();
});

router.route('/') // root route (campaigns list)
  .all(function(req, res, next){
    res.locals.title = 'Campaign list';
    res.locals.list = campaignList;
    return next();
  })
  .get(function(req, res, next){
    res.render('index');
  });

router.route('/api/')
  .all(function(req, res, next){
     res.json({})
   })

router.route('/((:campaignId)|new)/') // View and edit campaign info, view campaign banners
  .all(function(req, res, next){
    res.locals.title = 'Campaign data';
    res.locals.baseUrl = '/'+req.params.campaignId+'/';
    for(let i in campaignList){
      if(campaignList[i]._id == req.params.campaignId){
        res.locals.campaign = campaignList[i];
      }
    }
    if(!res.locals.campaign) res.locals.campaign = {};
    res.locals.breadcrumbs.push({name: res.locals.campaign.name || 'New campaign', path: req.params.campaignId+'/'});

    return next();
  })
  .get(function(req, res, next){
    res.render('campaign');
  })
  .post(function(req, res, next){
    // add or update campaign, default status - false
    // if set campaign status to false, update campaign banners - set active false
    console.log(req.body);
    res.redirect('/');
  });

router.route('/(:campaignId)/((:bannerId)|new)') // View and edit banner info
  .all(function(req, res, next){
    res.locals.title = 'Banner info';
    res.locals.baseUrl = '/'+req.params.campaignId+'/';
    for(let i in campaignList){
      if(campaignList[i]._id == req.params.campaignId){
        res.locals.campaign = campaignList[i];
        let banners = campaignList[i].banners;
        for(let j in banners){
          if(banners[j]._id ==  req.params.bannerId){
            res.locals.banner = banners[j];
          }
        }
        if(!res.locals.banner) res.locals.banner = {};
      }
    }
    res.locals.breadcrumbs.push({name: res.locals.campaign.name || 'New campaign', path: req.params.campaignId+'/'});
    res.locals.breadcrumbs.push({name: res.locals.banner.name || 'New banner', path: req.params.bannerId+'/'});
    return next();
  })
  .get(function(req, res, next){
    res.render('banner')
  })
  .post(function(req, res, next){
    // add or update banner
    // if all campaign banners statuses is false, set campaign status to false
    console.log(req.body);
    res.redirect('/'+req.params.campaignId+'/')
  });

module.exports = router;
