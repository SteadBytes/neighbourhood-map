var initialLocations = [{
		name: 'Weston Homes Community Stadium',
		lat: 51.9236601,
		lng: 0.8968440999999998
	},
	{
		name: 'Tesco Highwoods',
		lat: 51.9098917,
		lng: 0.9188577999999998
	},
	{
		name: 'High Woods Country Park',
		lat: 51.9071739,
		lng: 0.9100735000000002
	},
	{
		name: 'Hamiltons Gym',
		lat: 51.91989160000001,
		lng: 0.9304106999999999
	},
	{
		name: 'The Espresso Room - Colchester',
		lat: 51.8893328,
		lng: 0.9005054
	},
];
/**
*@description Knockout model for a Location
*@constructor
*@param { object } data - Object literal containing:
	name , lat = latitude, lng = longitude
*/
var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.position = {
		lat: data.lat,
		lng: data.lng
	};
	// Set default error content for infowindow incase API call fails
	self.content = '<div>' + self.name +
		'<hr> Couldn\'t retrieve info' + '</div>';

	var foursquareSearchURL = 'https://api.foursquare.com/v2/venues/search?' +
		'll=' + this.position.lat + ',' + this.position.lng +
		'&query=' + this.name +
		'&intent=browse' +
		'&radius=500' +
		'&client_id=KGEL5SRKAFDQJZRQU3AW505SCRY3LSEYWYEQ2QB1AFAFJJP1' +
		'&client_secret=NG4ISOMGM4TWPESFNGHU13JJBMECMHAQFFKSX20W10EX0NNN&' +
		'v=20170622';

	// Foursquare Search API endpoint call to retrieve ID of venue

	$.getJSON(foursquareSearchURL, function(data) {
		if (data.response.venues.length > 0) {
			venueID = data.response.venues[0].id;
			getVenueInfo(venueID);
		} else {
			self.showInfowindow();
		}
	}).fail(function() {
		self.showInfowindow();
	});

	/**
	 *@description Retrieves Foursquare venue information from venue ID
	 *@param { string } Foursquare unique venue ID
	 */
	var getVenueInfo = function(venueID) {
		var foursquareVenueURL = 'https://api.foursquare.com/v2/venues/' + venueID +
			'?client_id=KGEL5SRKAFDQJZRQU3AW505SCRY3LSEYWYEQ2QB1AFAFJJP1' +
			'&client_secret=NG4ISOMGM4TWPESFNGHU13JJBMECMHAQFFKSX20W10EX0NNN&' +
			'v=20170622';

		$.getJSON(foursquareVenueURL, function(data) {
			data = data.response.venue;
			// Begin infowindow content
			self.content = '<div class="row column"><h5>' + self.name +
				'</h5><hr></div>' + '<div class="row column"><ul class="no-bullet">';

			//If each data item is present, append it to the infowindow content
			if (data.url) {
				var url = data.url;
				self.content += '<li><strong>URL:</strong>' +
					'<a href="' + url + '" target="_blank">' + url + '</a>' + '</li>';
			}
			if (data.contact.formattedPhone) {
				var phone = data.contact.formattedPhone;
				self.content += '<li><strong>Phone:</strong> ' + phone + '</li>';
			}
			if (data.location.formattedAddress) {
				var address = data.location.formattedAddress;
				self.content += '<li><strong>Address:</strong> ' + address + '</li>';
			}
			if (data.categories[0].name) {
				var category = data.categories[0].name;
				self.content += '<li><strong>Category:</strong> ' + category + '</li>';
			}

			if (data.description) {
				var desc = data.description;
				self.content += '<li><strong>Description:</strong> ' + desc + '</li>';
			}
			self.content += '</ul></div>';
			if (data.photos.count > 0) {
				var photo = data.photos.groups[0].items[0];
				var photoURL = photo.prefix + photo.width + 'x' + photo.height +
					photo.suffix;
				self.content += '<div class="row column text-center">' +
					'<img class="thumbnail" id="infowindow-img" src="' +
					photoURL + '"></div>';
			}
			// Add Foursquare attribution and close infowindow content div
			self.content += '<span class="subheader">' +
				'<small>Information provided by Foursquare ' +
				'<i class="fa fa-foursquare" aria-hidden="true"></i></small>' +
				'</span></div>';
		}).fail(function() {
			self.showInfowindow();
		});
	};

	/**
	 *@description Sets infowindow content and marker to current location
	 */
	this.showInfowindow = function() {
		if (infowindow.marker != self.marker) {
			infowindow.marker = self.marker;
			infowindow.setContent(self.content);
			activeMarker(self.marker); // Only one marker at a time is active
			infowindow.open(map, self.marker);
		}
	};


	this.marker = new google.maps.Marker({
		position: this.position,
		animation: google.maps.Animation.DROP,
		title: this.name
	});

	/**
	 *@description set animation if marker is currently selected
	 */
	this.markerAnimation = ko.computed(function() {
		if (activeMarker() == self.marker) {
			self.marker.setAnimation(google.maps.Animation.BOUNCE);
		} else {
			self.marker.setAnimation(null);
		}
	});


	this.marker.addListener('click', function() {
		map.setCenter(self.marker.getPosition());
		// Deselect marker if already selected
		if (activeMarker() == self.marker) {
			activeMarker(null);
			infowindow.setMap(null);
		} else {
			self.showInfowindow();
		}
	});


	// Used for filtering
	this.visible = ko.observable(true);

	//Watches for visible observable and renders/removes marker appropriately
	this.renderMarker = ko.computed(function() {
		if (self.visible()) {
			self.marker.setMap(map);
		} else {
			self.marker.setMap(null);
		}
	});
};

var ViewModel = function() {
	var self = this;

	// Create map centered on colchester
	map = new google.maps.Map($('#map')[0], {
		center: {
			lat: 51.91850480000001,
			lng: 0.9106610000000046
		},
		zoom: 13,
	});

	activeMarker = ko.observable('');
	// Global to allows only one open infowindow at a time
	infowindow = new google.maps.InfoWindow({
		content: '',
		maxWidth: 400
	});

	infowindow.addListener('closeclick', function() {
		this.marker = null;
	});

	//All available locations
	this.locationList = ko.observableArray([]);

	//All locations to be currently displayed at any time
	this.filteredLocList = ko.observableArray([]);

	// Generate locatins
	initialLocations.forEach(function(loc) {
		newLoc = new Location(loc);
		self.locationList.push(newLoc);
		self.filteredLocList.push(newLoc);
	});

	// Query string for filtering locations
	this.query = ko.observable('');

	/**
	 *@description updates visible locations based on filter input
	 */
	this.filterLocations = function() {
		self.filteredLocList.removeAll(); //remove all visible locatins
		self.locationList().forEach(function(loc) {
			loc.visible(false); // Set all to not visible
			// Filter based on name and query
			if (loc.name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0) {
				loc.visible(true);
				self.filteredLocList.push(loc);
			}
		});
	};
};

var init = function() {
	var appViewModel = new ViewModel();
	// When query changes, filterLocations is called
	appViewModel.query.subscribe(appViewModel.filterLocations);
	ko.applyBindings(appViewModel);
};

var asyncError = function() {
	alert("Google Maps API is unable to load. Please try again :)");

};
