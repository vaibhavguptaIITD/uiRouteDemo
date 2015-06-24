angular.module("uiRouteDemo", ["hcUiApp", "ui.router","ct.ui.router.extras"])
.config(function($stateProvider, quotesServiceProvider){
	$stateProvider
	.state("list",{
		url:"/list",
		views:{
			"list":{
				templateUrl: "/list.html"
			}
		},
		deepStateRedirect: true, 
		sticky: true
	})
	.state("detail",{
		url:"/detail",
		views:{
			"detail":{
				templateUrl: "/detail.html"
			}
		},
		deepStateRedirect: true, 
		sticky: true
	})
	.state("compare",{
		url:"/compare",
		views:{
			"compare":{
				templateUrl: "/compare.html"
			}
		},
		deepStateRedirect: true, 
		sticky: true
	})
	.state("list.health",{
		url : "/health",
		templateUrl : "/list_health.html",
		controller: function($scope){
			console.log($scope.prop);
		}
	})
})
.controller("UiRouteController", function($scope, $state){
	$scope.isListState = function(){
		return $state.includes("list");
	}
	$scope.isDetailState = function(){
		return $state.includes("detail");
	}
	$scope.isCompareState = function(){
		return $state.includes("compare");
	}
	$scope.changeState = function(){
		$state.go("list");
	}
});