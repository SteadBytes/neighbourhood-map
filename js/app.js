// TODO: initial locations array

var initialLocations = [{
		name: "Weston Homes Community Stadium",
		lat: 51.9236601,
		lng: 0.8968440999999998
	},
	{
		name: "Tesco Highwoods",
		lat: 51.9098917,
		lng: 0.9188577999999998
	},
	{
		name: "High Woods Country Park",
		lat: 51.9071739,
		lng: 0.9100735000000002
	},
	{
		name: "Hamiltons Gym",
		lat: 51.91989160000001,
		lng: 0.9304106999999999
	},
	{
		name: "The Espresso Room - Colchester",
		lat: 51.8893328,
		lng: 0.9005054
	},
]

var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.position = {
		lat: data.lat,
		lng: data.lng
	};

	self.content = "<div>" + self.name + "<hr> Couldn't retrieve info" + "<div>";
	var foursquareSearchURL = "https://api.foursquare.com/v2/venues/search?" +
		"ll=" + this.position.lat + ',' + this.position.lng +
		"&query=" + this.name +
		"&intent=browse" +
		"&radius=500" +
		"&client_id=KGEL5SRKAFDQJZRQU3AW505SCRY3LSEYWYEQ2QB1AFAFJJP1" +
		"&client_secret=NG4ISOMGM4TWPESFNGHU13JJBMECMHAQFFKSX20W10EX0NNN&" +
		"v=20170622";


	// TODO: .fail()/ERROR HANDLING

	$.getJSON(foursquareSearchURL, function(data) {
		if (data.response.venues.length > 0) {
			venueID = data.response.venues[0].id;
			getVenueInfo(venueID);
		} else {
			self.content += "</div>"
			showInfowindow();
		}
	}).fail(function() {
		self.content += "</div>";
		showInfowindow();
	});

	var getVenueInfo = function(venueID) {
		var foursquareVenueURL = "https://api.foursquare.com/v2/venues/" + venueID +
			"?client_id=KGEL5SRKAFDQJZRQU3AW505SCRY3LSEYWYEQ2QB1AFAFJJP1" +
			"&client_secret=NG4ISOMGM4TWPESFNGHU13JJBMECMHAQFFKSX20W10EX0NNN&" +
			"v=20170622";
		$.getJSON(foursquareVenueURL, function(data) {
			data = data.response.venue;
			self.content = "<div>" + self.name + "<hr>";
			if (data.contact.formattedPhone) {
				var phone = data.contact.formattedPhone;
				self.content += "Phone: " + phone;
			}
			if (data.location.formattedAddress) {
				var address = data.location.formattedAddress;
				self.content += "<br>Address: " + address;
			}
			if (data.categories[0].name) {
				var category = data.categories[0].name;
				self.content += "<br>Category: " + category;
			}
			if (data.url) {
				var url = data.url;
				self.content += "<br>URL: <a href=\"" + url + "\" target=\"_blank\">" + url + "</a>";
			}
			if (data.description) {
				var desc = data.description;
				self.content += "<br>Description: " + desc;
			}
			if (data.photos.count > 0) {
				var photo = data.photos.groups[0].items[0];
				var photoURL = photo.prefix + photo.width + "x" + photo.height + photo.suffix;
				self.content += "<br><img src=\"" + photoURL + "\">";
			}
			self.content += "</div>"
		}).fail(function() {
			self.content += "</div>";
			showInfowindow();
		});
	};

	this.marker = new google.maps.Marker({
		position: this.position,
		animation: google.maps.Animation.DROP,
		title: this.name
	});
	this.markerAnimation = ko.computed(function() {
		if (activeMarker() == self.marker) {
			self.marker.setAnimation(google.maps.Animation.BOUNCE);
		} else {
			self.marker.setAnimation(null);
		}
	});
	this.marker.addListener('click', function() {
		activeMarker(self.marker);
		self.showInfowindow();
	});

	this.showInfowindow = function() {
		if (infowindow.marker != self.marker) {
			infowindow.marker = self.marker;
			infowindow.setContent(self.content);
			infowindow.open(map, self.marker);
		}
	};

	this.visible = ko.observable(true);

	this.renderMarker = ko.computed(function() {
		if (self.visible()) {
			self.marker.setMap(map);
		} else {
			self.marker.setMap(null);
		}
	})
}

var ViewModel = function() {
	var self = this;
	infowindow = new google.maps.InfoWindow({
		content: ''
	});
	activeMarker = ko.observable("");
	infowindow.addListener('closeclick', function() {
		this.marker = null;
	});
	map = new google.maps.Map($('#map')[0], {
		center: {
			lat: 51.91850480000001,
			lng: 0.9106610000000046
		},
		zoom: 13,
	});

	this.locationList = ko.observableArray([]);
	this.filteredLocList = ko.observableArray([]);
	initialLocations.forEach(function(loc) {
		newLoc = new Location(loc);
		self.locationList.push(newLoc);
		self.filteredLocList.push(newLoc);
	});

	this.query = ko.observable('');

	this.filterLocations = function() {
		self.filteredLocList.removeAll();
		self.locationList().forEach(function(loc) {
			loc.visible(false);
			if (loc.name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0) {
				loc.visible(true);
				self.filteredLocList.push(loc);
			}
		})
	};
}
var appViewModel = new ViewModel();
appViewModel.query.subscribe(appViewModel.filterLocations);
ko.applyBindings(appViewModel);
