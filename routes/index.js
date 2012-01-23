
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express', mode: 'standard'})
};

exports.presi = function(req, res, mode, presi, session) {
  res.render(presi, {title: presi, presi: presi, session: session, mode: mode});
};
