function Article (opts) {
  this.author = opts.author;
  this.authorUrl = opts.authorUrl;
  this.title = opts.title;
  this.category = opts.category;
  this.body = opts.body;
  this.publishedOn = opts.publishedOn;
}

Article.all = [];

Article.prototype.toHtml = function() {
  var template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
  this.publishStatus = this.publishedOn ? 'published ' + this.daysAgo + ' days ago' : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

//Making the articles from the rawData
Article.loadAll = function(rawData) {
  rawData.sort(function(a,b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  });

  rawData.forEach(function(ele) {
    Article.all.push(new Article(ele));
  });
};

// Getting Data either from Local storage or 'server' and processing it
Article.fetchAll = function() {
  $.ajax({
    url: '/data/ipsumArticles.json',
    dataType: 'json',
    method: 'HEAD'
  }).done(function(data, textStatus, request) {
    var eTag = request.getResponseHeader('eTag');

    if (eTag == localStorage.eTag && localStorage.rawData) { //if there's something in Local Storage get data from there
      Article.loadAll(JSON.parse(localStorage.rawData));

      articleView.initIndexPage();
    } else {                          //if there's no local storage get data from 'server'
      $.getJSON('/data/ipsumArticles.json').done(function (data, textStatus, request) {
        Article.loadAll(data);

        localStorage.rawData = JSON.stringify(data);
        localStorage.eTag = request.getResponseHeader('eTag');

        articleView.initIndexPage();
      });
    }
  });
};
