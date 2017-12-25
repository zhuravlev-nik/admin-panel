const
  express = require('express'),
  router = express.Router(),
  ObjectId = require('mongodb').ObjectID;


router.use(function(req, res, next) {
  res.locals.breadcrumbs = [{
    name: 'Главная',
    path: '/'
  }];
  return next();
});

router.route('/') // root route (campaigns list)
  .all(async (req, res, next) => {
    let campaigns = await req.db.collection('campaigns').find().toArray();
    res.locals.title = 'Список кампаний';
    res.locals.list = campaigns;
    return next();
  })
  .get(function(req, res, next) {
    res.render('index');
  });

router.route('/api/')
  .all(function(req, res, next) {
    let campaignId;
    if (req.query.cid || req.body.cid) {
      campaignId = req.query.cid || req.body.cid;
    }
    let campaign = null;
    for (let i = 0; i < campaignList.length; i++) {
      if (campaignList[i]._id == campaignId) {
        campaign = campaignList[i];
      }
    }
    let result = {};

    if (!campaign) {
      result.err = 'Campaign not found';
    } else {
      let banners = campaign.banners;
      for (let i = 0; i < banners.length; i++) {
        if (banners[i].active && !Object.keys(result).length) {
          result = {
            banner_id: banners[i]._id
          }
        }
      }
    }
    res.json(result)
  })

router.route('/((:campaignId)|new)/') // View and edit campaign info, view campaign banners
  .all(async (req, res, next) => {
    res.locals.title = 'Информация о кампании';
    res.locals.baseUrl = '/' + req.params.campaignId + '/';
    let campaign;
    if (ObjectId.isValid(req.params.campaignId)) {
      campaign = await req.db.collection('campaigns').findOne({
        _id: ObjectId(req.params.campaignId)
      });
    }
    res.locals.campaign = campaign || {};
    res.locals.breadcrumbs.push({
      name: res.locals.campaign.name || 'Новая кампания',
      path: req.params.campaignId + '/'
    });
    return next();
  })
  .get(function(req, res, next) {
    res.render('campaign');
  })
  .post(async function(req, res, next) {
    let campaign = res.locals.campaign;
    if (!campaign._id) {
      campaign.name = req.body.name;
      campaign.active = false;
      campaign.created = new Date();
      let result = await req.db.collection('campaigns').insert(campaign);
    } else {
      let query = {};
      let active = (req.body.active == 1) ? true : false;
      if (campaign.name !== req.body.name) query.name = req.body.name;
      if (campaign.active !== active) {
        query.active = active;
        query.banners = [];
        campaign.banners.forEach(function(banner) {
          banner.active = active;
          query.banners.push(banner);
        });
      }
      if (Object.keys(query).length) {
        let result = await req.db.collection('campaigns').update({
          _id: campaign._id
        }, {
          $set: query
        });
      }
    }
    res.redirect('/');
  });

router.route('/(:campaignId)/((:bannerId)|new)') // View and edit banner info
  .all(async (req, res, next) => {
    res.locals.title = 'Информация о баннере';
    res.locals.baseUrl = '/' + req.params.campaignId + '/';

    let campaign = await req.db.collection('campaigns').findOne({
      _id: ObjectId(req.params.campaignId)
    });
    let banners = campaign.banners;
    for (let i in banners) {
      if (banners[i]._id == req.params.bannerId) {
        res.locals.banner = banners[i];
      }
    }
    if (!res.locals.banner) res.locals.banner = {};

    res.locals.breadcrumbs.push({
      name: campaign.name || 'Новая кампания',
      path: campaign._id + '/'
    });
    res.locals.breadcrumbs.push({
      name: res.locals.banner.name || 'Новый баннер',
      path: req.params.bannerId + '/'
    });
    res.locals.campaign = campaign;
    return next();
  })
  .get(function(req, res, next) {
    res.render('banner')
  })
  .post(async function(req, res, next) {
    let banner = res.locals.banner;
    if (!banner._id) {
      banner._id = ObjectId();
      banner.name = req.body.name;
      banner.status = false;
      banner.options = {};
      banner.created = new Date();
      await req.db.collection('campaigns').update({
        _id: ObjectId(req.params.campaignId)
      }, {
        $push: {
          banners: banner
        }
      });

    } else {
      let result = await req.db.collection('campaigns').updateOne({
        "_id": ObjectId(req.params.campaignId),
        "banners._id": ObjectId(req.params.bannerId)
      }, {
        "$set": {
          "banners.$.active": (req.body.active == 1) ? true : false,
          "banners.$.name": req.body.name
        }
      })
    }
    res.redirect('/' + req.params.campaignId + '/')
  });

module.exports = router;