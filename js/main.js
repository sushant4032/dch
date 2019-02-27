$(begin);

function begin() {
	section = 5;
	t = $('.section');
	t.hide();
	$(t[section]).show();
}

function moduleNav(arg) {
	var last = section;
	if (arg == 'next' && section < t.length - 1) {
		section++;
	} else if (arg == 'prev' && section > 0) {
		section--;
	}
	if (last != section) {
		$(t[last]).hide();
		$(t[section]).slideDown(100);
	}
}

var app = angular.module('dch', []);
app.controller('ctrl', function ($scope) {
	/////////////////////////////////////////////////////////////////////////////// Constants
	$scope.shifts = ['other', 'First', 'Second', 'Night'];
	/////////////////////////////////////////////////////////////////////////////// Properties
	$scope.shift = getShift();
	$scope.date = formattedDate();
	$scope.user = 'none';
	$scope.eastShovels = [];
	$scope.westShovels = [];
	$scope.eastShovelMultipliers = [45, 55, 25, 29];
	$scope.westShovelMultipliers = [45, 40, 25, 21];
	$scope.shovels = [
		{ name: 'P&H-01', east: false, eastData: [], west: false, westData: [], coal: 0, ob: 0 },
		{ name: 'P&H-02', east: false, eastData: [], west: false, westData: [], coal: 0, ob: 0 },
		{ name: 'P&H-03', east: false, eastData: [], west: false, westData: [], coal: 0, ob: 0 },
		{ name: 'P&H-04', east: false, eastData: [], west: false, westData: [], coal: 0, ob: 0 },
		{ name: 'P&H-05', east: false, eastData: [], west: false, westData: [], coal: 0, ob: 0 },
		{ name: 'P&H-06', east: false, eastData: [], west: false, westData: [], coal: 0, ob: 0 },
		{ name: 'P&H-07', east: false, eastData: [], west: false, westData: [], coal: 0, ob: 0 },
		{ name: 'P&H-08', east: false, eastData: [], west: false, westData: [], coal: 0, ob: 0 },
		{ name: 'P&H-09', east: false, eastData: [], west: false, westData: [], coal: 0, ob: 0 },
		{ name: 'P&H-10', east: false, eastData: [], west: false, westData: [], coal: 0, ob: 0 }
	];

	$scope.shovelsTotal = { east: [], west: [], coal: 0, ob: 0 };

	$scope.draglines = [
		{ name: 'Jyoti', data: [null, null, null, null, null, null], remark: null },
		{ name: 'Pawan', data: [null, null, null, null, null, null], remark: null },
		{ name: 'Vindhya', data: [null, null, null, null, null, null], remark: null },
		{ name: 'Jwala', data: [null, null, null, null, null, null], remark: null }
	];

	$scope.surfaceMiners = [{ name: 'L&T-SM', data: [null, null, null], remark: null }];

	$scope.outsourcing = [
		{ name: 'BGR-EAST-APT', data: [null], remark: null },
		{ name: 'GAJRAJ-WEST-APT', data: [null], remark: null },
		{ name: 'GAJRAJ-EAST-APB', data: [null], remark: null },
		{ name: 'GAJRAJ-WEST-APB', data: [null], remark: null },
		{ name: 'DL-EAST', data: [null], remark: null },
		{ name: 'DL-WEST', data: [null], remark: null }
	];

	$scope.datahead = {
		eastShovels: ['Coal-100', 'Coal-120', 'OB-100', 'OB-120'],
		westShovels: ['Coal-100', 'Coal-85', 'OB-100', 'OB-85'],
		draglines: ['Solid', 'Re-handling', 'Working', 'Breakdown', 'Maintenance', 'Idle', 'Remark'],
		surfaceMiners: ['Working', 'Cutting', 'Production', 'Remark'],
		outsourcing: ['Quantity', 'Remark']
	};

	$scope.unit = {
		eastShovels: ['trips', 'trips', 'trips', 'trips'],
		westShovels: ['trips', 'trips', 'trips', 'trips'],
		draglines: ['buckets', 'buckets', 'hrs', 'hrs', 'hrs', 'hrs', ''],
		surfaceMiners: ['hrs', 'mtrs', 'Te', ''],
		outsourcing: ['cum', '']
	};

	/////////////////////////////////////////////////////////////////////////////// Methods
	function formattedDate() {
		var today = new Date();
		var dd = today.getDate();
		var hour = new Date().getHours();
		if (hour <= 14) {
			dd = dd - 1;
		}
		var mm = today.getMonth() + 1;
		var yyyy = today.getFullYear();
		if (dd < 10) {
			dd = '0' + dd;
		}
		if (mm < 10) {
			mm = '0' + mm;
		}
		return dd + '-' + mm + '-' + yyyy;
	}

	function getShift() {
		var hour = new Date().getHours();
		//hour = 7;
		var currentShift = 0;
		if (hour >= 6 && hour < 14) {
			currentShift = 1;
		} else if (hour >= 14 && hour < 22) {
			currentShift = 2;
		} else {
			currentShift = 3;
		}
		var shift = (currentShift + 1) % 3 + 1;
		return shift;
	}

	$scope.addShovel = function (location, id) {
		if ($scope.shovels[id].east == false) $scope.shovels[id].eastData = [null, null, null, null];
		if ($scope.shovels[id].west == false) $scope.shovels[id].westData = [null, null, null, null];

		if (location == 'east') {
			$scope.eastShovels.push($scope.shovels[id]);
			$scope.shovels[id].east = true;
		} else if (location == 'west') {
			$scope.westShovels.push($scope.shovels[id]);
			$scope.shovels[id].west = true;
		}
	};

	$scope.removeShovel = function (location, id) {
		if (location == 'east') {
			$scope.eastShovels.splice(id, 1);
		} else if (location == 'west') {
			$scope.westShovels.splice(id, 1);
		}
	};

	$scope.refresh = function () {
		$scope.shovelsTotal = { east: [0, 0, 0, 0, 0, 0], west: [0, 0, 0, 0, 0, 0], coal: 0, ob: 0 };
		angular.forEach($scope.shovels, function (x) {
			x.eastData[4] =
				x.eastData[0] * $scope.eastShovelMultipliers[0] + x.eastData[1] * $scope.eastShovelMultipliers[1];
			x.eastData[5] =
				x.eastData[2] * $scope.eastShovelMultipliers[2] + x.eastData[3] * $scope.eastShovelMultipliers[3];
			x.westData[4] =
				x.westData[0] * $scope.westShovelMultipliers[0] + x.westData[1] * $scope.westShovelMultipliers[1];
			x.westData[5] =
				x.westData[2] * $scope.westShovelMultipliers[2] + x.westData[3] * $scope.westShovelMultipliers[3];
			x.coal = x.eastData[4] + x.westData[4];
			x.ob = x.eastData[5] + x.westData[5];
			for (var i = 0; i < 6; i++) {
				if (x.east) $scope.shovelsTotal.east[i] += x.eastData[i];
				if (x.west) $scope.shovelsTotal.west[i] += x.westData[i];
			}
			$scope.shovelsTotal.coal += x.coal;
			$scope.shovelsTotal.ob += x.ob;
		});

		angular.forEach($scope.draglines, function (x, y, z) {
			z[y].data[5] = 8 - z[y].data[4];
		});
	};
});