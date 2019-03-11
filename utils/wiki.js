module.exports = (function() {

  this.suggestions = function(search) {
    let url = `https://fr.wikipedia.org/w/api.php?origin=*&action=query&list=search&srsearch=${search}&format=json`
    return fetch(url)
            .then(response => response.json())
            .catch(error => console.log(error))
  }

  const API = 'https://fr.wikipedia.org/api/rest_v1'
  const endpoints = {
    summary: (title) => `${API}/page/summary/${title}`,
    meta: (title) => `${API}/page/metadata/${title}`,
    relations: (title) => `${API}/page/related/${title}`,
    instanceOf: (query) => `https://www.wikidata.org/wiki/Special:EntityData/${query}.json`
  }

  this.all = async function(title) {
    try {
      var data = await Promise.all([
        this.summary(title),
        this.meta(title),
        this.relations(title)
      ])
      return data
    }
    catch(error) {
      console.log(error)
    }
  }

  this.images = async function(titles) {
    try {
      return await Promise.all(titles.map(title => this.summary(title)))
    } catch(err) {
      console.log(err)
    }
  }

  this.get = function(url) {
    return fetch(url)
      .then(response => response.json())
      .catch(error => console.log(error))
  }

  this.summary = function(title) {
    return this.get(endpoints.summary(title));
  }

  this.meta = function(title) {
    return this.get(endpoints.meta(title));
  }

  this.relations = function(title) {
    return this.get(endpoints.relations(title));
  }

  this.instanceOf = function(query) {
    return this.get(endpoints.relations(query));
  }

  return {
    summary: this.summary.bind(this),
    meta: this.meta.bind(this),
    relations: this.relations.bind(this),
    all: this.all.bind(this),
    images: this.images.bind(this),
    suggestions: this.suggestions.bind(this)
  }

})()