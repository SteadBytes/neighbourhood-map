// TODO: initial locations array

var initialLocations = [{
		name: "Weston Homes Community Stadium",
		lat: 51.9236601,
		lng: 0.8968440999999998
	},
	{
		name: "Tesco Extra",
		lat: 51.9098917,
		lng: 0.9188577999999998
	},
	{
		name: "High Woods Country Park",
		lat: 51.9071739,
		lng: 0.9100735000000002
	},
	{
		name: "Hamiltons Fitness Centre",
		lat: 51.91989160000001,
		lng: 0.9304106999999999
	},
	{
		name: "The Espresso Room - Colchester",
		lat: 51.8893328,
		lng: 0.9005054
	},
]

// TODO: Location Model
var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.position = {
		lat: data.lat,
		lng: data.lng
	};

	this.marker = new google.maps.Marker({
		position: this.position,
		title: this.name
	});

	this.visible = ko.observable(true);
	this.render = ko.computed(function() {
		if (self.visible()) {
			self.marker.setMap(map);
		} else {
			self.marker.setMap(null);
		}
	})
}

// TODO: properties, foursquare for info retrieval
// TODO: infowindows



var ViewModel = function() {
	var self = this;
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
