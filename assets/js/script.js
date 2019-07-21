$(function () {

	// Globals variables

	// 	An array containing objects with information about the movies.
	var movies = [];
	var genres = [];

	// Single movie page buttons
	var singleMoviePage = $('.single-movie');

	singleMoviePage.on('click', function (e) {

		if (singleMoviePage.hasClass('visible')) {

			var clicked = $(e.target);

			// If the close button or the background are clicked go to the previous page.
			if (clicked.hasClass('close') || clicked.hasClass('overlay')) {
				window.location.hash = '#';
			}
		}
	});

	function getMovieGenres() {
		makeAjaxCall(
			"genre/movie/list",
			function(data) {
				// Write the data into our global variable.
				genres = data.genres;
			},
			"&language=en-US"
		)
	}

	function getNowPlayingMovies(page) {
		makeAjaxCall(
			"movie/now_playing",
			function(data) {
				// Write the data into our global variable.
				movies = data.results;

				// Call a function to create HTML for all the movies.
				generateAllMoviesHTML(movies);

				// Manually trigger a hashchange to start the app.
				$(window).trigger('hashchange');
			},
			"&language=en-US&page=" + page
		)
	}

	function getMovieDetails(movieId) {
		var details = [];

		makeAjaxCall(
			"movie/" + movieId + '/videos',
			function(data) {
				details['videos'] = [];
			},
			"&language=en-US"
		)

		makeAjaxCall(
			"movie/" + movieId + '/reviews',
			function(data) {
				details['reviews'] = [];
			},
			"&language=en-US"
		)

		makeAjaxCall(
			"movie/" + movieId + '/similar',
			function(data) {
				details['similar'] = [];
			},
			"&language=en-US"
		)

		// Call a function to create HTML for a single movie.
		renderSingleMoviePage(details);
	}

	function makeAjaxCall(slug, sucessFunc, params = "") {
		$.ajax({
			url: "https://api.themoviedb.org/3/" + slug + "?api_key=bc50218d91157b1ba4f142ef7baaa6a0" + params,
			success: sucessFunc,
			error: function (xhr, ajaxOptions, thrownError) {
				alert(xhr.responseText + "\n" + xhr.status + "\n" + thrownError);
			}
		});
	}

	// Navigation

	function render(url) {

		// Get the keyword from the url.
		var temp = url.split('/')[0];

		// Hide whatever page is currently shown.
		$('.main-content .page').removeClass('visible');

		var	map = {

			// The "Homepage".
			'': renderMoviesPage(movies),

			// Single movies page.
			// Get the index of which movie we want to show and call the appropriate function.
			'#movie': getMovieDetails(url.split('#movie/')[1].trim()),
		};

		// Execute the needed function depending on the url keyword (stored in temp).
		if(map[temp]) {
			map[temp]();
		}
	}


	// This function is called only once - on page load.
	// It recieves one parameter - the data we aquired from the ajax call.
	function generateAllMoviesHTML(data) {
		
		var list = $('.in-theaters .movies-list');

		data.forEach(function(element) {
			var movie = $('<li data-index=' + element.id + '>');
			movie.append($('<a href="#" class="movie-photo"><img src="https://image.tmdb.org/t/p/w185' + element.poster_path + '" alt="' + element.title + '"/></a>'));
			movie.append($('<h2><a href="#">' + element.title + '</a></h2>'));
			movie.append($('<ul class=movie-description">'));
			movie.append($('<li><span>Year of Release: </span>' + element.release_date + '</li>'));
			var genre_list = element.genre_ids.map(
				function(genre_id) {
					for(var key in genres) {
						if(genres[key].id === genre_id) {
							return ' ' + genres[key].name;
						}
					}
				})
			movie.append($('<li><span>Genre(s): </span>' + genre_list + '</li>'));
			movie.append($('<li><span>Vote average: </span>' + element.vote_average + '</li>'));
			movie.append($('<li class="overview"><span>Overview: </span>' + element.overview + ' Mpx</li>'));
			movie.append($('</ul>'));
			movie.append($('<div class="highlight"></div>'));
			movie.append($('</li>'));
			list.append (movie);
		});

		// Each movies has a data-index attribute.
		// On click change the url hash to open up a preview for this movie only.
		// Remember: every hashchange triggers the render function.
		list.find('li').on('click', function (e) {
			e.preventDefault();

			var movieIndex = $(this).data('index');

			window.location.hash = 'movie/' + movieIndex;
		})
	}

	// This function receives an object containing all the movie we want to show.
	function renderMoviesPage(data) {

		var page = $('.in-theaters');
		var allmovies = $('.in-theaters .movies-list > li');

		// Hide all the movies in the movies list.
		allmovies.addClass('hidden');

		// Iterate over all of the movies.
		// If their ID is somewhere in the data object remove the hidden class to reveal them.
		allmovies.each(function () {

			var that = $(this);

			data.forEach(function (item) {
				if(that.data('index') == item.id){
					that.removeClass('hidden');
				}
			});
		});

		// Show the page itself.
		// (the render function hides all pages so we need to show the one we want).
		page.addClass('visible');

	}

	// Opens up a preview for one of the movies.
	// Its parameters are an index from the hash and the movies object.
	function renderSingleMoviePage(details) {
		var page = $('.single-movie');
		var container = $('.preview-large');

		// Show the page.
		page.addClass('visible');
	}

	// These are called on page load

	$(document).ready(function() {
		getMovieGenres();
		getNowPlayingMovies("1");
	})

	// An event handler with calls the render function on every hashchange.
	// The render function will show the appropriate content of out page.
	$(window).on('hashchange', function(){
		render(decodeURI(window.location.hash));
	});
});