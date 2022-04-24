var Genre = require('../models/genre');
const Book = require('../models/book')
const async = require('async')
const { body, validationResult } = require('express-validator')

// Display list of all Genre.
exports.genre_list = function(req, res) {
    Genre
    .find()
    .exec(function (err, list_genre) {
        if (err) {return next(err)}
        res.render( 'genre_list', {title: 'Genre List', genre_list: list_genre})
    })
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res) {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id).exec(callback)
        },
        genre_books: function(callback) {
            Book.find({'genre' : req.params.id}).exec(callback)
        },
    }, function (err, results) {
        if (err) {return next(err)}
        if (results.genre===null) {
            const err = new Error('Genre not found')
            err.status = 404
            return next(err)
        }
        res.render('genre_detail', {
            title: 'Genre Detail',
            genre: results.genre,
            genre_books: results.genre_books
        })
    })
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.render('genre_form', {title: 'Create Genre '})
};

// Handle Genre create on POST.
exports.genre_create_post = [
    body('name', 'Genre name required').trim().isLength({ min: 1}).escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        const genre = new Genre(
            {name: req.body.name}
        )

        if (!errors.isEmpty()) {
            res.render('genre_form', {title: 'Create Genre', genre: genre, errors: errors.array()})
            return           
        }
        else {
            Genre.findOne({ 'name': req.body.name })
            .exec( function(err, found_genre) {
                if (err) {return next(err)}
                if (found_genre) {
                    res.redirect(found_genre.url);
                }
                else {
                    genre.save (function (err) {
                        if (err) { return next(err)}
                        res.redirect(genre.url)
                    })
                }
            })
        }
    }
]

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res) {
  async.parallel({
    genre: function(callback) {
      Genre.findById(req.params.id).exec(callback)
    },
    genre_books: function(callback) {
      Book.find({'genre': { $in: [req.params.id] }}).exec(callback)
    }
  }, function(err, results) {
    if(err) {return next(err)}
    console.log(results.genre_books.length)
    res.render('genre_delete', {
      title: 'Delete Genre: ' + results.genre.name,
      genre: results.genre,
      genre_books: results.genre_books
    })
  })
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res) {
  console.log(req.body.genreid)
  async.parallel({
    genre: function(callback) {
      Genre.findById(req.body.genreid).exec(callback)
    },
    genre_books: function(callback) {
      Book.find({ 'genre' : { $in: [req.body.genreid]}}).exec(callback)
    }
  }, function (err, results) {
    if(err) {return next(err)}
    if(results.genre===null){res.redirect('/catalog/genres')}
    if(results.genre_books.length > 0){
      res.render('genre_delete', {
        title: 'Delete Genre: ' + results.genre.name,
        genre: results.genre,
        genre_books: results.genre_books
      })
    }
    else{
      Genre.findByIdAndRemove(req.body.genreid, function deleteGenre (err){
        if (err) {return next (err)}
        res.redirect('/catalog/genres')
      })
    }
  })
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res, next) {
  Genre.findById(req.params.id, function(err, genre) {
    if(err){return next(err)}
    if(genre===null){
      const err = new Error('Genre not Found');
      err.status = 404;
      return next(err)
    }
    res.render('genre_form', {title: 'Update Genre', genre: genre})
  })
};

// Handle Genre update on POST.
exports.genre_update_post = [
  body('name', 'Genre name required').trim().isLength({min:1}).escape(),
  (req, res, next) => {
    const errors = validationResult(req)
    const genre = new Genre(
      {name: req.body.name,
      _id: req.params.id}
    )
    if(!errors.isEmpty()){
      res.render('genre_form', {title: 'Update Genre', genre: genre, errors: errors.array()})
      return;
    }
    else {
      Genre.findOne({'name': req.body.name })
      .exec(function(err, found_genre) {
        if(err) {return next(err)}
        if(found_genre){
          res.redirect(found_genre.url)
        }
        else{
          Genre.findByIdAndUpdate(req.params.id, genre, {}, function(err, thegenre){
            if(err) {return next(err)}
            res.redirect(thegenre.url)
          })
        }
      })
    }
  }
]
